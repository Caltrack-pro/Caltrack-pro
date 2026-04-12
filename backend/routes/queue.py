"""
Calibration Queue API
=====================
GET    /api/queue                       List all queued instruments for the site
POST   /api/queue                       Add an instrument to the queue
DELETE /api/queue/{instrument_id}       Remove an instrument from the queue
PATCH  /api/queue/{instrument_id}/priority  Adjust priority

Auto-cleanup: on every GET, any queue items where the instrument has been
calibrated since it was added (last_calibration_date >= added_at.date())
are automatically deleted from the queue.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import UserContext, assert_writable_site, get_current_user, resolve_site
from database import get_db
from models import CalibrationQueue, Instrument
from schemas import (
    QueueAddPayload,
    QueueInstrumentSummary,
    QueueItemResponse,
    QueueListResponse,
    QueuePriorityPayload,
)

router = APIRouter(prefix="/api/queue", tags=["queue"])

_DUE_SOON_DAYS = 14


def _alert_status(due_date: Optional[date], last_result: str) -> tuple[str, int, Optional[int]]:
    """Return (alert_status, days_overdue, days_until_due)."""
    today = date.today()
    if not due_date or last_result in (None, "not_calibrated"):
        return "not_calibrated", 0, None
    delta = (due_date - today).days
    if delta < 0:
        return "overdue", abs(delta), delta
    if delta <= _DUE_SOON_DAYS:
        return "due_soon", 0, delta
    return "current", 0, delta


def _instrument_summary(instr: Instrument) -> QueueInstrumentSummary:
    due_date = instr.calibration_due_date
    last_result = instr.last_calibration_result.value if instr.last_calibration_result else "not_calibrated"
    alert, days_overdue, days_until_due = _alert_status(due_date, last_result)
    return QueueInstrumentSummary(
        id=instr.id,
        tag_number=instr.tag_number,
        description=instr.description,
        area=instr.area,
        criticality=instr.criticality,
        status=instr.status,
        calibration_due_date=due_date,
        last_calibration_date=instr.last_calibration_date,
        last_calibration_result=instr.last_calibration_result,
        calibration_interval_days=instr.calibration_interval_days,
        tolerance_value=instr.tolerance_value,
        days_overdue=days_overdue,
        days_until_due=days_until_due,
        alert_status=alert,
    )


# ---------------------------------------------------------------------------
# GET /api/queue
# ---------------------------------------------------------------------------

@router.get("", response_model=QueueListResponse)
def list_queue(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QueueListResponse:
    site = resolve_site(current_user)

    # Load all queue items for this site, joined with their instruments
    items = (
        db.query(CalibrationQueue)
        .filter(CalibrationQueue.site_name == site)
        .order_by(CalibrationQueue.priority.desc(), CalibrationQueue.added_at.asc())
        .all()
    )

    # Auto-cleanup: remove items where the instrument has been calibrated
    # since it was added to the queue
    completed_ids = []
    active_items = []
    for item in items:
        instr = db.get(Instrument, item.instrument_id)
        if instr is None:
            completed_ids.append(item.id)
            continue
        added_date = item.added_at.date() if item.added_at else date.today()
        if instr.last_calibration_date and instr.last_calibration_date >= added_date:
            completed_ids.append(item.id)
        else:
            active_items.append((item, instr))

    if completed_ids:
        db.query(CalibrationQueue).filter(CalibrationQueue.id.in_(completed_ids)).delete(synchronize_session=False)
        db.commit()

    results = [
        QueueItemResponse(
            id=item.id,
            instrument_id=item.instrument_id,
            added_by_name=item.added_by_name or "",
            added_at=item.added_at,
            priority=item.priority,
            notes=item.notes,
            instrument=_instrument_summary(instr),
        )
        for item, instr in active_items
    ]

    return QueueListResponse(total=len(results), items=results)


# ---------------------------------------------------------------------------
# POST /api/queue
# ---------------------------------------------------------------------------

@router.post("", response_model=QueueItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_queue(
    payload: QueueAddPayload,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QueueItemResponse:
    assert_writable_site(current_user)
    site = resolve_site(current_user)

    # Verify instrument belongs to this site
    instr = db.query(Instrument).filter(
        Instrument.id == payload.instrument_id,
        Instrument.created_by == site,
    ).first()
    if not instr:
        raise HTTPException(status_code=404, detail="Instrument not found")

    # Check already in queue
    existing = db.query(CalibrationQueue).filter(
        CalibrationQueue.site_name == site,
        CalibrationQueue.instrument_id == payload.instrument_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Instrument already in queue")

    # Assign next lowest priority (new items get priority = max + 1)
    max_priority_row = (
        db.query(CalibrationQueue)
        .filter(CalibrationQueue.site_name == site)
        .order_by(CalibrationQueue.priority.desc())
        .first()
    )
    next_priority = (max_priority_row.priority + 1) if max_priority_row else 1

    entry = CalibrationQueue(
        site_name=site,
        instrument_id=payload.instrument_id,
        added_by_name=current_user.display_name or current_user.email or "Unknown",
        priority=next_priority,
        notes=payload.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return QueueItemResponse(
        id=entry.id,
        instrument_id=entry.instrument_id,
        added_by_name=entry.added_by_name,
        added_at=entry.added_at,
        priority=entry.priority,
        notes=entry.notes,
        instrument=_instrument_summary(instr),
    )


# ---------------------------------------------------------------------------
# DELETE /api/queue/{instrument_id}
# ---------------------------------------------------------------------------

@router.delete("/{instrument_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def remove_from_queue(
    instrument_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    assert_writable_site(current_user)
    site = resolve_site(current_user)

    deleted = (
        db.query(CalibrationQueue)
        .filter(
            CalibrationQueue.site_name == site,
            CalibrationQueue.instrument_id == instrument_id,
        )
        .delete(synchronize_session=False)
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not in queue")
    db.commit()


# ---------------------------------------------------------------------------
# PATCH /api/queue/{instrument_id}/priority
# ---------------------------------------------------------------------------

@router.patch("/{instrument_id}/priority", response_model=QueueItemResponse)
def update_priority(
    instrument_id: UUID,
    payload: QueuePriorityPayload,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QueueItemResponse:
    assert_writable_site(current_user)
    site = resolve_site(current_user)

    entry = db.query(CalibrationQueue).filter(
        CalibrationQueue.site_name == site,
        CalibrationQueue.instrument_id == instrument_id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Item not in queue")

    entry.priority = payload.priority
    db.commit()
    db.refresh(entry)

    instr = db.get(Instrument, entry.instrument_id)
    return QueueItemResponse(
        id=entry.id,
        instrument_id=entry.instrument_id,
        added_by_name=entry.added_by_name or "",
        added_at=entry.added_at,
        priority=entry.priority,
        notes=entry.notes,
        instrument=_instrument_summary(instr),
    )
