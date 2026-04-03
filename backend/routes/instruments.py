"""
Instruments REST API
====================
GET    /api/instruments                        list with filters
GET    /api/instruments/{id}                   single instrument
POST   /api/instruments                        create
PUT    /api/instruments/{id}                   update (partial — only sent fields written)
DELETE /api/instruments/{id}                   soft-delete (→ decommissioned)
GET    /api/instruments/{id}/calibration-status  status object
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import CalibrationResultStatus, Instrument, InstrumentStatus
from schemas import (
    AlertStatus,
    CalibrationStatusResponse,
    InstrumentCreate,
    InstrumentListResponse,
    InstrumentResponse,
    InstrumentUpdate,
)

router = APIRouter(prefix="/api/instruments", tags=["instruments"])

_DUE_SOON_DAYS = 14  # matches CLAUDE.md alert rules


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _compute_alert(
    due_date: Optional[date],
    last_result: Optional[CalibrationResultStatus],
) -> tuple[AlertStatus, int, Optional[int]]:
    """Return (alert_status, days_overdue, days_until_due)."""
    today = date.today()

    not_calibrated = (
        last_result is None
        or last_result == CalibrationResultStatus.NOT_CALIBRATED
        or due_date is None
    )
    if not_calibrated:
        return "not_calibrated", 0, None

    delta = (due_date - today).days   # negative when overdue

    if delta < 0:                                    # OVERDUE
        return "overdue", abs(delta), delta
    if delta <= _DUE_SOON_DAYS:                      # DUE_SOON
        return "due_soon", 0, delta
    return "current", 0, delta                       # CURRENT


def _effective_due_date(instr: Instrument) -> Optional[date]:
    """Return stored calibration_due_date, or recompute from last_calibration_date
    + calibration_interval_days if the stored value is absent."""
    if instr.calibration_due_date:
        return instr.calibration_due_date
    if instr.last_calibration_date and instr.calibration_interval_days:
        return instr.last_calibration_date + timedelta(days=instr.calibration_interval_days)
    return None


def _to_response(instr: Instrument) -> InstrumentResponse:
    """Convert ORM object → InstrumentResponse (adds computed fields)."""
    due_date = _effective_due_date(instr)
    alert_status, days_overdue, days_until_due = _compute_alert(
        due_date, instr.last_calibration_result
    )

    # Build dict from every mapped column, then layer on computed fields.
    data = {col.name: getattr(instr, col.name) for col in instr.__table__.columns}
    data["calibration_due_date"] = due_date
    data["days_overdue"] = days_overdue
    data["days_until_due"] = days_until_due
    data["alert_status"] = alert_status

    return InstrumentResponse.model_validate(data)


def _get_or_404(instrument_id: UUID, db: Session) -> Instrument:
    instr = db.get(Instrument, instrument_id)
    if instr is None:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return instr


# ---------------------------------------------------------------------------
# GET /api/instruments
# ---------------------------------------------------------------------------

@router.get("", response_model=InstrumentListResponse)
def list_instruments(
    area:                Optional[str]         = Query(None, description="Filter by area"),
    type:                Optional[str]         = Query(None, description="Filter by instrument_type enum value"),
    status:              Optional[str]         = Query(None, description="Filter by status enum value"),
    calibration_status:  Optional[str]         = Query(None, description="overdue | due_soon | current | not_calibrated | all"),
    skip:                int                   = Query(0, ge=0),
    limit:               int                   = Query(100, ge=1, le=500),
    db:                  Session               = Depends(get_db),
) -> InstrumentListResponse:

    q = db.query(Instrument)

    # --- simple column filters ---
    if area:
        q = q.filter(Instrument.area == area)
    if type:
        q = q.filter(Instrument.instrument_type == type)
    if status:
        q = q.filter(Instrument.status == status)

    # --- calibration_status filter (SQL-level where possible) ---
    if calibration_status and calibration_status != "all":
        today = date.today()
        due_soon_cutoff = today + timedelta(days=_DUE_SOON_DAYS)

        if calibration_status == "overdue":
            q = q.filter(
                Instrument.calibration_due_date.isnot(None),
                Instrument.calibration_due_date < today,
                Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
            )
        elif calibration_status == "due_soon":
            q = q.filter(
                Instrument.calibration_due_date.isnot(None),
                Instrument.calibration_due_date >= today,
                Instrument.calibration_due_date <= due_soon_cutoff,
                Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
            )
        elif calibration_status == "current":
            q = q.filter(
                Instrument.calibration_due_date.isnot(None),
                Instrument.calibration_due_date > due_soon_cutoff,
                Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
            )
        elif calibration_status == "not_calibrated":
            q = q.filter(
                or_(
                    Instrument.last_calibration_result == CalibrationResultStatus.NOT_CALIBRATED,
                    Instrument.calibration_due_date.is_(None),
                )
            )
        else:
            raise HTTPException(
                status_code=422,
                detail="calibration_status must be one of: overdue, due_soon, current, not_calibrated, all",
            )

    total = q.count()
    instruments = q.order_by(Instrument.tag_number).offset(skip).limit(limit).all()

    return InstrumentListResponse(
        total=total,
        results=[_to_response(i) for i in instruments],
    )


# ---------------------------------------------------------------------------
# GET /api/instruments/{id}
# ---------------------------------------------------------------------------

@router.get("/{instrument_id}", response_model=InstrumentResponse)
def get_instrument(
    instrument_id: UUID,
    db: Session = Depends(get_db),
) -> InstrumentResponse:
    return _to_response(_get_or_404(instrument_id, db))


# ---------------------------------------------------------------------------
# POST /api/instruments
# ---------------------------------------------------------------------------

@router.post("", response_model=InstrumentResponse, status_code=status.HTTP_201_CREATED)
def create_instrument(
    payload: InstrumentCreate,
    db: Session = Depends(get_db),
) -> InstrumentResponse:
    data = payload.model_dump()
    instr = Instrument(**data)
    db.add(instr)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"An instrument with tag_number '{payload.tag_number}' already exists",
        )
    db.refresh(instr)
    return _to_response(instr)


# ---------------------------------------------------------------------------
# PUT /api/instruments/{id}
# ---------------------------------------------------------------------------

@router.put("/{instrument_id}", response_model=InstrumentResponse)
def update_instrument(
    instrument_id: UUID,
    payload: InstrumentUpdate,
    db: Session = Depends(get_db),
) -> InstrumentResponse:
    instr = _get_or_404(instrument_id, db)

    updates = payload.model_dump(exclude_unset=True)

    # Recompute calibration_due_date when scheduling fields change,
    # unless the caller explicitly supplied a new due date.
    if "calibration_due_date" not in updates:
        new_last = updates.get("last_calibration_date", instr.last_calibration_date)
        new_interval = updates.get("calibration_interval_days", instr.calibration_interval_days)
        if new_last and new_interval:
            updates["calibration_due_date"] = new_last + timedelta(days=new_interval)

    for field, value in updates.items():
        setattr(instr, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"An instrument with tag_number '{updates.get('tag_number')}' already exists",
        )
    db.refresh(instr)
    return _to_response(instr)


# ---------------------------------------------------------------------------
# DELETE /api/instruments/{id}  — soft delete
# ---------------------------------------------------------------------------

@router.delete("/{instrument_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_instrument(
    instrument_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    instr = _get_or_404(instrument_id, db)
    instr.status = InstrumentStatus.DECOMMISSIONED
    db.commit()


# ---------------------------------------------------------------------------
# GET /api/instruments/{id}/calibration-status
# ---------------------------------------------------------------------------

@router.get("/{instrument_id}/calibration-status", response_model=CalibrationStatusResponse)
def get_calibration_status(
    instrument_id: UUID,
    db: Session = Depends(get_db),
) -> CalibrationStatusResponse:
    instr = _get_or_404(instrument_id, db)
    due_date = _effective_due_date(instr)
    alert_status, days_overdue, days_until_due = _compute_alert(
        due_date, instr.last_calibration_result
    )
    return CalibrationStatusResponse(
        status=alert_status,
        days_overdue=days_overdue,
        days_until_due=days_until_due,
        last_result=instr.last_calibration_result.value if instr.last_calibration_result else None,
        calibration_due_date=due_date,
    )
