"""
Dashboard Statistics & Alerts API
===================================
GET /api/dashboard/stats               aggregate KPIs
GET /api/dashboard/alerts              all active alerts (OVERDUE/DUE_SOON/FAILED/CONSECUTIVE_FAILURES)
GET /api/dashboard/compliance-by-area  per-area compliance breakdown
GET /api/dashboard/upcoming            instruments due in next 30 days
GET /api/dashboard/bad-actors          top-10 worst instruments by as-found failures, last 12 months

Alert rules (from CLAUDE.md — implemented exactly):
  OVERDUE              today > calibration_due_date
  DUE_SOON             today > (calibration_due_date - 14 days) AND not overdue
  FAILED               last_calibration_result == "fail"
  CONSECUTIVE_FAILURES last 2+ approved/submitted calibration records both have as_found_result == "fail"
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import (
    AsFoundResult,
    CalibrationRecord,
    CalibrationResultStatus,
    Instrument,
    InstrumentStatus,
    RecordStatus,
)
from routes.instruments import _DUE_SOON_DAYS, _to_response
from schemas import (
    Alert,
    AreaCompliance,
    BadActor,
    DashboardStats,
    InstrumentListResponse,
    InstrumentResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_ACTIVE_STATUSES = (
    InstrumentStatus.ACTIVE,
    InstrumentStatus.SPARE,
    InstrumentStatus.OUT_OF_SERVICE,
)

_COUNTED_RECORD_STATUSES = (
    RecordStatus.SUBMITTED.value,
    RecordStatus.APPROVED.value,
)

# Alert priority mapping — consistent with CLAUDE.md colour conventions
_PRIORITY = {
    "OVERDUE":               "critical",
    "FAILED":                "critical",
    "CONSECUTIVE_FAILURES":  "critical",
    "DUE_SOON":              "warning",
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _active_instruments_query(db: Session, site: Optional[str] = None):
    """Base query: non-decommissioned instruments, optionally scoped to a site."""
    q = db.query(Instrument).filter(Instrument.status.in_(_ACTIVE_STATUSES))
    if site:
        q = q.filter(Instrument.created_by == site)
    return q


def _to_midnight_utc(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


def _consecutive_failure_info(
    instrument_id: UUID, db: Session
) -> Tuple[bool, int, Optional[date]]:
    """
    Return (has_consecutive, streak_count, most_recent_failure_date).
    Counts consecutive as-found failures from the most recent record backwards,
    stopping at the first non-failure.  Requires streak >= 2 to flag.
    """
    records = (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.instrument_id == instrument_id,
            CalibrationRecord.record_status.in_(_COUNTED_RECORD_STATUSES),
        )
        .order_by(CalibrationRecord.calibration_date.desc())
        .limit(10)   # never need more than 10 to establish the streak
        .all()
    )

    streak = 0
    last_failure_date: Optional[date] = None

    for rec in records:
        val = rec.as_found_result.value if hasattr(rec.as_found_result, "value") else rec.as_found_result
        if val == AsFoundResult.FAIL.value:
            streak += 1
            if last_failure_date is None:
                last_failure_date = rec.calibration_date
        else:
            break   # streak ends at first non-failure

    return streak >= 2, streak, last_failure_date


# ---------------------------------------------------------------------------
# GET /api/dashboard/stats
# ---------------------------------------------------------------------------

@router.get("/stats", response_model=DashboardStats)
def get_stats(
    site: Optional[str] = Query(None, description="Filter by site/organisation"),
    db: Session = Depends(get_db),
) -> DashboardStats:
    today           = date.today()
    due_soon_cutoff = today + timedelta(days=_DUE_SOON_DAYS)
    thirty_days_ago = today - timedelta(days=30)
    seven_days_ago  = today - timedelta(days=7)
    one_year_ago    = today - timedelta(days=365)

    base = _active_instruments_query(db, site)

    # --- total active instruments ---
    total_instruments = base.count()

    # --- overdue ---
    overdue_count = base.filter(
        Instrument.calibration_due_date.isnot(None),
        Instrument.calibration_due_date < today,
        Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
    ).count()

    # --- due soon ---
    due_soon_count = base.filter(
        Instrument.calibration_due_date.isnot(None),
        Instrument.calibration_due_date >= today,
        Instrument.calibration_due_date <= due_soon_cutoff,
        Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
    ).count()

    # --- failed in last 30 days (calibration events, not instrument count) ---
    failed_q = (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.as_found_result == AsFoundResult.FAIL.value,
            CalibrationRecord.calibration_date >= thirty_days_ago,
            CalibrationRecord.record_status.in_(_COUNTED_RECORD_STATUSES),
        )
    )
    if site:
        failed_q = failed_q.join(Instrument, CalibrationRecord.instrument_id == Instrument.id).filter(
            Instrument.created_by == site
        )
    failed_last_30_days = failed_q.count()

    # --- calibrated this week ---
    week_q = (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.calibration_date >= seven_days_ago,
            CalibrationRecord.record_status == RecordStatus.APPROVED.value,
        )
    )
    if site:
        week_q = week_q.join(Instrument, CalibrationRecord.instrument_id == Instrument.id).filter(
            Instrument.created_by == site
        )
    calibrated_this_week = week_q.count()

    # --- compliance rate ---
    # Denominator: instruments calibrated in the last 12 months (have a recent last_calibration_date)
    scheduled = base.filter(
        Instrument.last_calibration_date >= one_year_ago,
        Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
    ).count()

    # Numerator: of those, currently in-date AND not failed
    compliant = base.filter(
        Instrument.last_calibration_date >= one_year_ago,
        Instrument.last_calibration_result.in_([
            CalibrationResultStatus.PASS.value,
            CalibrationResultStatus.MARGINAL.value,
        ]),
        Instrument.calibration_due_date.isnot(None),
        Instrument.calibration_due_date >= today,
    ).count()

    compliance_rate = round((compliant / scheduled * 100), 1) if scheduled > 0 else 0.0

    return DashboardStats(
        total_instruments=total_instruments,
        overdue_count=overdue_count,
        due_soon_count=due_soon_count,
        failed_last_30_days=failed_last_30_days,
        compliance_rate=compliance_rate,
        calibrated_this_week=calibrated_this_week,
    )


# ---------------------------------------------------------------------------
# GET /api/dashboard/alerts
# ---------------------------------------------------------------------------

@router.get("/alerts", response_model=List[Alert])
def get_alerts(
    site: Optional[str] = Query(None, description="Filter by site/organisation"),
    db: Session = Depends(get_db),
) -> List[Alert]:
    today           = date.today()
    due_soon_cutoff = today + timedelta(days=_DUE_SOON_DAYS)
    alerts: List[Alert] = []

    # Fetch all active instruments in one query to avoid N+1
    instruments = _active_instruments_query(db, site).all()

    # Track which instruments need a consecutive-failures check
    # (only those whose last result is already FAIL — avoids extra DB calls)
    consecutive_candidates: List[Instrument] = []

    for instr in instruments:
        last_result = instr.last_calibration_result
        due_date    = instr.calibration_due_date

        # ---- OVERDUE ----
        if (
            due_date is not None
            and last_result != CalibrationResultStatus.NOT_CALIBRATED
            and today > due_date
        ):
            days_over = (today - due_date).days
            alerts.append(Alert(
                id=f"{instr.id}_OVERDUE",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                alert_type="OVERDUE",
                priority=_PRIORITY["OVERDUE"],
                message=(
                    f"{instr.tag_number} is {days_over} day{'s' if days_over != 1 else ''} "
                    f"overdue for calibration (due {due_date.isoformat()})."
                ),
                triggered_at=_to_midnight_utc(due_date),
            ))

        # ---- DUE_SOON ----
        elif (
            due_date is not None
            and last_result != CalibrationResultStatus.NOT_CALIBRATED
            and today > (due_date - timedelta(days=_DUE_SOON_DAYS))
        ):
            days_left = (due_date - today).days
            alerts.append(Alert(
                id=f"{instr.id}_DUE_SOON",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                alert_type="DUE_SOON",
                priority=_PRIORITY["DUE_SOON"],
                message=(
                    f"{instr.tag_number} calibration is due in "
                    f"{days_left} day{'s' if days_left != 1 else ''} "
                    f"(due {due_date.isoformat()})."
                ),
                triggered_at=_to_midnight_utc(due_date - timedelta(days=_DUE_SOON_DAYS)),
            ))

        # ---- FAILED ----
        # last_calibration_result == "fail" means the instrument is currently in a failed state
        result_val = last_result.value if hasattr(last_result, "value") else last_result
        if result_val == CalibrationResultStatus.FAIL.value:
            triggered = (
                _to_midnight_utc(instr.last_calibration_date)
                if instr.last_calibration_date
                else instr.updated_at or datetime.now(timezone.utc)
            )
            alerts.append(Alert(
                id=f"{instr.id}_FAILED",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                alert_type="FAILED",
                priority=_PRIORITY["FAILED"],
                message=(
                    f"{instr.tag_number} failed its last calibration"
                    + (f" on {instr.last_calibration_date.isoformat()}." if instr.last_calibration_date else ".")
                ),
                triggered_at=triggered,
            ))
            # Only instruments with a current FAIL result can have consecutive failures
            consecutive_candidates.append(instr)

    # ---- CONSECUTIVE_FAILURES ----
    # Only run for instruments already flagged FAILED (minimises DB round-trips)
    for instr in consecutive_candidates:
        has_consecutive, streak, last_fail_date = _consecutive_failure_info(instr.id, db)
        if has_consecutive and last_fail_date:
            alerts.append(Alert(
                id=f"{instr.id}_CONSECUTIVE_FAILURES",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                alert_type="CONSECUTIVE_FAILURES",
                priority=_PRIORITY["CONSECUTIVE_FAILURES"],
                message=(
                    f"{instr.tag_number} has failed as-found calibration "
                    f"{streak} consecutive time{'s' if streak != 1 else ''}. "
                    "Investigate for systematic error."
                ),
                triggered_at=_to_midnight_utc(last_fail_date),
            ))

    # Sort: critical first, then by triggered_at descending (most urgent first)
    _priority_order = {"critical": 0, "warning": 1, "information": 2}
    alerts.sort(key=lambda a: (_priority_order.get(a.priority, 9), -a.triggered_at.timestamp()))

    return alerts


# ---------------------------------------------------------------------------
# GET /api/dashboard/compliance-by-area
# ---------------------------------------------------------------------------

@router.get("/compliance-by-area", response_model=List[AreaCompliance])
def compliance_by_area(
    site: Optional[str] = Query(None, description="Filter by site/organisation"),
    db: Session = Depends(get_db),
) -> List[AreaCompliance]:
    today = date.today()

    instruments = _active_instruments_query(db, site).all()

    area_totals:     dict[str, int] = {}
    area_compliant:  dict[str, int] = {}

    for instr in instruments:
        area = instr.area or "Unassigned"
        area_totals[area]    = area_totals.get(area, 0) + 1
        area_compliant[area] = area_compliant.get(area, 0)

        result_val = (
            instr.last_calibration_result.value
            if hasattr(instr.last_calibration_result, "value")
            else instr.last_calibration_result
        )

        is_calibrated = result_val != CalibrationResultStatus.NOT_CALIBRATED.value
        is_passing    = result_val in (
            CalibrationResultStatus.PASS.value,
            CalibrationResultStatus.MARGINAL.value,
        )
        is_in_date    = (
            instr.calibration_due_date is not None
            and instr.calibration_due_date >= today
        )

        if is_calibrated and is_passing and is_in_date:
            area_compliant[area] += 1

    result = []
    for area in sorted(area_totals.keys()):
        total     = area_totals[area]
        compliant = area_compliant[area]
        rate      = round(compliant / total * 100, 1) if total > 0 else 0.0
        result.append(AreaCompliance(
            area=area,
            total=total,
            compliant=compliant,
            compliance_rate=rate,
        ))

    return result


# ---------------------------------------------------------------------------
# GET /api/dashboard/upcoming
# ---------------------------------------------------------------------------

@router.get("/upcoming", response_model=InstrumentListResponse)
def upcoming_calibrations(
    site: Optional[str] = Query(None, description="Filter by site/organisation"),
    db: Session = Depends(get_db),
) -> InstrumentListResponse:
    today          = date.today()
    thirty_days_on = today + timedelta(days=30)

    instruments = (
        _active_instruments_query(db, site)
        .filter(
            Instrument.calibration_due_date.isnot(None),
            Instrument.calibration_due_date >= today,
            Instrument.calibration_due_date <= thirty_days_on,
            Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
        )
        .order_by(Instrument.calibration_due_date.asc())
        .all()
    )

    return InstrumentListResponse(
        total=len(instruments),
        results=[_to_response(i) for i in instruments],
    )


# ---------------------------------------------------------------------------
# GET /api/dashboard/bad-actors
# ---------------------------------------------------------------------------

@router.get("/bad-actors", response_model=List[BadActor])
def bad_actors(
    site: Optional[str] = Query(None, description="Filter by site/organisation"),
    db: Session = Depends(get_db),
) -> List[BadActor]:
    one_year_ago = date.today() - timedelta(days=365)

    bad_q = (
        db.query(
            CalibrationRecord.instrument_id,
            func.count(CalibrationRecord.id).label("failure_count"),
            func.max(CalibrationRecord.calibration_date).label("last_failure_date"),
        )
        .filter(
            CalibrationRecord.as_found_result == AsFoundResult.FAIL.value,
            CalibrationRecord.calibration_date >= one_year_ago,
            CalibrationRecord.record_status.in_(_COUNTED_RECORD_STATUSES),
        )
    )
    if site:
        bad_q = bad_q.join(Instrument, CalibrationRecord.instrument_id == Instrument.id).filter(
            Instrument.created_by == site
        )
    rows = (
        bad_q
        .group_by(CalibrationRecord.instrument_id)
        .order_by(func.count(CalibrationRecord.id).desc())
        .limit(10)
        .all()
    )

    results: List[BadActor] = []
    for row in rows:
        instr = db.get(Instrument, row.instrument_id)
        if instr is None:
            continue
        results.append(BadActor(
            instrument_id=instr.id,
            tag_number=instr.tag_number,
            description=instr.description,
            area=instr.area,
            failure_count=row.failure_count,
            last_failure_date=row.last_failure_date,
        ))

    return results
