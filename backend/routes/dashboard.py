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

from auth import resolve_site
from database import get_db
from models import (
    AsFoundResult,
    AsLeftResult,
    CalibrationRecord,
    CalibrationResultStatus,
    Criticality,
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
    Recommendation,
    RecommendationMetric,
    RecommendationsResponse,
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
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> DashboardStats:
    site = resolved_site
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
    # Denominator: every active instrument that has ever been calibrated (i.e., is on a calibration schedule).
    # Previously this excluded instruments whose last calibration was >12 months ago, which hid the worst
    # offenders — overdue instruments routinely haven't been recalibrated in over a year, so removing them
    # from the denominator inflated the rate (e.g. 1 in-date + 1 severely-overdue → 100%, not 50%).
    scheduled = base.filter(
        Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
    ).count()

    # Numerator: of those, currently in-date AND not failed
    compliant = base.filter(
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
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> List[Alert]:
    site = resolved_site
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
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> List[AreaCompliance]:
    site = resolved_site
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
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> InstrumentListResponse:
    site = resolved_site
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
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> List[BadActor]:
    site = resolved_site
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
        .having(func.count(CalibrationRecord.id) >= 2)
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


# ---------------------------------------------------------------------------
# GET /api/dashboard/recommendations
# ---------------------------------------------------------------------------

# Threshold: if last cal's as-found error exceeded this (as a % of span), flag critical.
_LAST_CAL_OOT_PCT = 5.0

# Stability thresholds for interval extension
_STABLE_TOL_USAGE = 0.2     # last-cal error < 20% of tolerance used
_STABLE_MIN_RECORDS = 3     # must have 3+ passing approved records


def _last_approved_record(instrument_id, db: Session) -> Optional[CalibrationRecord]:
    """Return the single most recent approved/submitted calibration record, or None."""
    return (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.instrument_id == instrument_id,
            CalibrationRecord.record_status.in_(_COUNTED_RECORD_STATUSES),
        )
        .order_by(CalibrationRecord.calibration_date.desc())
        .first()
    )


def _recent_approved_records(instrument_id, db: Session, limit: int = 10):
    """Return up to `limit` most recent approved/submitted records, newest first."""
    return (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.instrument_id == instrument_id,
            CalibrationRecord.record_status.in_(_COUNTED_RECORD_STATUSES),
        )
        .order_by(CalibrationRecord.calibration_date.desc())
        .limit(limit)
        .all()
    )


def _project_error(records, instrument: Instrument) -> Optional[float]:
    """
    Project current as-found error % based on linear drift across the last 3+ approved
    records. Records are passed newest-first.

    Returns projected error (non-negative) or None if there isn't enough history to
    estimate a drift rate.
    """
    # Need 3+ records with numeric max_as_found_error_pct to project
    pts = [
        float(r.max_as_found_error_pct)
        for r in reversed(records)  # chronological order
        if r.max_as_found_error_pct is not None
    ]
    if len(pts) < 3:
        return None

    n = len(pts)
    drift_per_record = (pts[-1] - pts[0]) / (n - 1)
    interval_days = instrument.calibration_interval_days or 180
    drift_per_day = drift_per_record / interval_days

    last_cal = instrument.last_calibration_date
    if last_cal is None:
        return pts[-1]
    days_since = max(0, (date.today() - last_cal).days)
    projected = pts[-1] + drift_per_day * days_since
    return max(0.0, projected)


def _drift_per_day(records, instrument: Instrument) -> Optional[float]:
    """Linear drift per day in error % units, or None if insufficient data."""
    pts = [
        float(r.max_as_found_error_pct)
        for r in reversed(records)
        if r.max_as_found_error_pct is not None
    ]
    if len(pts) < 3:
        return None
    n = len(pts)
    drift_per_record = (pts[-1] - pts[0]) / (n - 1)
    interval_days = instrument.calibration_interval_days or 180
    return drift_per_record / interval_days


def _criticality_label(c) -> str:
    if c is None:
        return "Instrument"
    val = c.value if hasattr(c, "value") else c
    return {
        "safety_critical":  "Safety-critical",
        "process_critical": "Process-critical",
        "standard":         "Standard",
        "non_critical":     "Non-critical",
        "not_applicable":   "Instrument",
    }.get(val, "Instrument")


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(
    resolved_site: str     = Depends(resolve_site),
    db:            Session = Depends(get_db),
) -> RecommendationsResponse:
    """
    Generate the Smart Diagnostics recommendations feed for the authenticated site.

    Rules — each returns title + evidence + solution. Instruments that match multiple
    rules generate multiple recommendations (by design — all actions are relevant).
    """
    today = date.today()
    critical: List[Recommendation] = []
    advisory: List[Recommendation] = []
    optimisation: List[Recommendation] = []

    instruments = (
        _active_instruments_query(db, resolved_site)
        .filter(Instrument.status == InstrumentStatus.ACTIVE)
        .all()
    )

    for instr in instruments:
        crit_val = instr.criticality.value if hasattr(instr.criticality, "value") else instr.criticality
        is_safety_or_process = crit_val in (
            Criticality.SAFETY_CRITICAL.value,
            Criticality.PROCESS_CRITICAL.value,
        )

        due_date = instr.calibration_due_date
        days_over = (today - due_date).days if due_date else 0

        # Pull last approved record (needed for multiple rules)
        last_rec = _last_approved_record(instr.id, db)
        recent = _recent_approved_records(instr.id, db, limit=5) if last_rec else []

        # --- CRIT_SAFETY_OVERDUE --------------------------------------------
        if is_safety_or_process and due_date and days_over > 0:
            label = _criticality_label(instr.criticality)
            critical.append(Recommendation(
                id=f"CRIT_SAFETY_OVERDUE_{instr.id}",
                rule="CRIT_SAFETY_OVERDUE",
                category="critical",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                criticality=instr.criticality,
                icon="🚨",
                title=f"{label} instrument is overdue",
                evidence=f"Calibration was due on {due_date.isoformat()} — now {days_over} day{'s' if days_over != 1 else ''} overdue.",
                solution=(
                    "Raise a corrective maintenance work order today and calibrate before returning to service."
                    if crit_val == Criticality.SAFETY_CRITICAL.value
                    else "Schedule a priority calibration this week — extending the overdue period increases process risk."
                ),
                metric=RecommendationMetric(label="Days overdue", value=f"{days_over}d"),
            ))

        # --- CRIT_CANNOT_CALIBRATE (last cal left out of tolerance) ---------
        if last_rec is not None:
            asleft = last_rec.as_left_result.value if hasattr(last_rec.as_left_result, "value") else last_rec.as_left_result
            if asleft == AsLeftResult.FAIL.value:
                critical.append(Recommendation(
                    id=f"CRIT_CANNOT_CALIBRATE_{instr.id}",
                    rule="CRIT_CANNOT_CALIBRATE",
                    category="critical",
                    instrument_id=instr.id,
                    tag_number=instr.tag_number,
                    description=instr.description,
                    area=instr.area,
                    criticality=instr.criticality,
                    icon="🛠",
                    title="Instrument left out of tolerance — replace",
                    evidence=(
                        f"Last calibration on {last_rec.calibration_date.isoformat()} could not bring the instrument "
                        "back within tolerance (as-left FAIL). It is no longer meeting its accuracy specification."
                    ),
                    solution="Plan a like-for-like replacement. Remove from service or add process compensation until swapped.",
                    metric=RecommendationMetric(
                        label="As-left error",
                        value=f"{float(last_rec.max_as_left_error_pct):.2f}%" if last_rec.max_as_left_error_pct is not None else "FAIL",
                    ),
                ))

        # --- CRIT_LAST_CAL_OOT (as-found > 5% of span) ----------------------
        if last_rec is not None and last_rec.max_as_found_error_pct is not None:
            err = abs(float(last_rec.max_as_found_error_pct))
            if err > _LAST_CAL_OOT_PCT:
                critical.append(Recommendation(
                    id=f"CRIT_LAST_CAL_OOT_{instr.id}",
                    rule="CRIT_LAST_CAL_OOT",
                    category="critical",
                    instrument_id=instr.id,
                    tag_number=instr.tag_number,
                    description=instr.description,
                    area=instr.area,
                    criticality=instr.criticality,
                    icon="📉",
                    title=f"Last calibration was {err:.1f}% out of tolerance",
                    evidence=(
                        f"On {last_rec.calibration_date.isoformat()}, the as-found error was {err:.2f}% of span — "
                        f"well beyond the 5% threshold for major drift."
                    ),
                    solution=(
                        "Investigate root cause before the next service: impulse-line blockage, fouling, ambient "
                        "temperature change, vibration, or sensor ageing. Consider shortening the calibration interval."
                    ),
                    metric=RecommendationMetric(label="As-found error", value=f"{err:.1f}%"),
                ))

        # --- Drift projections (CRIT_EST_OOT_NOW / ADV_EST_OOT_30_DAYS) -----
        projected = _project_error(recent, instr) if recent else None
        drift_day = _drift_per_day(recent, instr) if recent else None
        tol = instr.tolerance_value

        if (
            projected is not None
            and tol is not None
            and tol > 0
            and drift_day is not None
            and drift_day > 0
        ):
            if projected >= tol:
                # Already estimated to be over tolerance
                critical.append(Recommendation(
                    id=f"CRIT_EST_OOT_NOW_{instr.id}",
                    rule="CRIT_EST_OOT_NOW",
                    category="critical",
                    instrument_id=instr.id,
                    tag_number=instr.tag_number,
                    description=instr.description,
                    area=instr.area,
                    criticality=instr.criticality,
                    icon="📡",
                    title="Estimated to be out of tolerance right now",
                    evidence=(
                        f"Projected current as-found error is {projected:.2f}% vs tolerance ±{tol:.2f}%. "
                        f"Based on drift rate across the last {len(recent)} calibrations."
                    ),
                    solution=(
                        "Bring forward the next calibration — treat as a priority work order. "
                        "Recheck measurements feeding control loops from this instrument."
                    ),
                    metric=RecommendationMetric(label="Est. current error", value=f"{projected:.2f}%"),
                ))
            else:
                # Project the date of crossing
                days_to_fail = (tol - projected) / drift_day if drift_day > 0 else None
                if days_to_fail is not None and days_to_fail < 30:
                    advisory.append(Recommendation(
                        id=f"ADV_EST_OOT_30_DAYS_{instr.id}",
                        rule="ADV_EST_OOT_30_DAYS",
                        category="advisory",
                        instrument_id=instr.id,
                        tag_number=instr.tag_number,
                        description=instr.description,
                        area=instr.area,
                        criticality=instr.criticality,
                        icon="⏳",
                        title=f"Projected to exceed tolerance in {int(days_to_fail)} days",
                        evidence=(
                            f"Current projected error {projected:.2f}% vs tolerance ±{tol:.2f}%. "
                            f"At the observed drift rate, it will cross tolerance in about {int(days_to_fail)} days."
                        ),
                        solution="Schedule calibration within the next 30 days — ahead of the projected failure date.",
                        metric=RecommendationMetric(label="Days to OOT", value=f"~{int(days_to_fail)}d"),
                    ))

        # --- CRIT_REPEAT_FAILURE (3+ consecutive as-found failures) ---------
        has_consec, streak, last_fail_date = _consecutive_failure_info(instr.id, db)
        if has_consec and streak >= 3 and last_fail_date is not None:
            # Only count failures within last 12 months
            if (today - last_fail_date).days <= 365:
                critical.append(Recommendation(
                    id=f"CRIT_REPEAT_FAILURE_{instr.id}",
                    rule="CRIT_REPEAT_FAILURE",
                    category="critical",
                    instrument_id=instr.id,
                    tag_number=instr.tag_number,
                    description=instr.description,
                    area=instr.area,
                    criticality=instr.criticality,
                    icon="🔁",
                    title=f"{streak} consecutive as-found failures",
                    evidence=(
                        f"Has failed as-found on the last {streak} calibrations. Most recent failure "
                        f"{last_fail_date.isoformat()}."
                    ),
                    solution=(
                        "Inspect installation (impulse lines, ambient, vibration) and process conditions. "
                        "If the pattern continues, raise a replacement work order."
                    ),
                    metric=RecommendationMetric(label="Fail streak", value=f"{streak}×"),
                ))

        # --- ADV_DRIFT_MARGINAL ---------------------------------------------
        last_val = instr.last_calibration_result.value if hasattr(instr.last_calibration_result, "value") else instr.last_calibration_result
        if last_val == CalibrationResultStatus.MARGINAL.value:
            advisory.append(Recommendation(
                id=f"ADV_DRIFT_MARGINAL_{instr.id}",
                rule="ADV_DRIFT_MARGINAL",
                category="advisory",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                criticality=instr.criticality,
                icon="⚠️",
                title="Last calibration result was marginal",
                evidence=(
                    f"As-found error sat inside 80–100% of tolerance. One more interval of drift could push it to fail."
                ),
                solution="Consider shortening the calibration interval, or inspect for early-stage fouling / wear.",
            ))

        # --- ADV_OVERDUE_NONCRITICAL (30+ days overdue, not safety/process) -
        if not is_safety_or_process and due_date and days_over >= 30:
            advisory.append(Recommendation(
                id=f"ADV_OVERDUE_NONCRITICAL_{instr.id}",
                rule="ADV_OVERDUE_NONCRITICAL",
                category="advisory",
                instrument_id=instr.id,
                tag_number=instr.tag_number,
                description=instr.description,
                area=instr.area,
                criticality=instr.criticality,
                icon="📅",
                title=f"{days_over} days overdue",
                evidence=f"Calibration due date was {due_date.isoformat()}. No approved cal recorded since.",
                solution="Schedule calibration at the next available window — rolling overdue status affects compliance reporting.",
                metric=RecommendationMetric(label="Days overdue", value=f"{days_over}d"),
            ))

        # --- OPT_EXTEND_INTERVAL (very stable, consider extending interval) -
        if (
            last_rec is not None
            and len(recent) >= _STABLE_MIN_RECORDS
            and tol is not None
            and tol > 0
            and (instr.calibration_interval_days or 365) < 365
        ):
            errs = [abs(float(r.max_as_found_error_pct)) for r in recent if r.max_as_found_error_pct is not None]
            all_pass = all(
                (r.as_found_result.value if hasattr(r.as_found_result, "value") else r.as_found_result)
                == AsFoundResult.PASS.value
                for r in recent[:_STABLE_MIN_RECORDS]
            )
            if (
                all_pass
                and len(errs) >= _STABLE_MIN_RECORDS
                and max(errs[:_STABLE_MIN_RECORDS]) < tol * _STABLE_TOL_USAGE
            ):
                current_interval = instr.calibration_interval_days or 180
                peak_pct_of_tol = max(errs[:_STABLE_MIN_RECORDS]) / tol * 100
                optimisation.append(Recommendation(
                    id=f"OPT_EXTEND_INTERVAL_{instr.id}",
                    rule="OPT_EXTEND_INTERVAL",
                    category="optimisation",
                    instrument_id=instr.id,
                    tag_number=instr.tag_number,
                    description=instr.description,
                    area=instr.area,
                    criticality=instr.criticality,
                    icon="💡",
                    title="Consistently stable — consider extending interval",
                    evidence=(
                        f"Last {_STABLE_MIN_RECORDS} calibrations all passed with peak error "
                        f"{peak_pct_of_tol:.0f}% of tolerance used. Current interval is {current_interval} days."
                    ),
                    solution=(
                        f"Consider extending the calibration interval from {current_interval} to 365 days "
                        "to reduce workload without materially affecting reliability."
                    ),
                    metric=RecommendationMetric(label="Tolerance used", value=f"{peak_pct_of_tol:.0f}%"),
                ))

    # Sort each bucket: safety-critical first, then process-critical, then by tag
    def _sort_key(r: Recommendation):
        order = {
            "safety_critical": 0, "process_critical": 1,
            "standard": 2, "non_critical": 3, "not_applicable": 4,
        }
        c = r.criticality.value if r.criticality and hasattr(r.criticality, "value") else (r.criticality or "not_applicable")
        return (order.get(c, 5), r.tag_number)

    critical.sort(key=_sort_key)
    advisory.sort(key=_sort_key)
    optimisation.sort(key=_sort_key)

    return RecommendationsResponse(
        critical=critical,
        advisory=advisory,
        optimisation=optimisation,
    )
