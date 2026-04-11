"""
Instruments REST API
====================
GET    /api/instruments                        list with filters
GET    /api/instruments/{id}                   single instrument
POST   /api/instruments                        create
PUT    /api/instruments/{id}                   update (partial — only sent fields written)
DELETE /api/instruments/{id}                   soft-delete (→ decommissioned)
GET    /api/instruments/{id}/calibration-status  status object
GET    /api/instruments/{id}/drift             drift analysis (requires 3+ records)
POST   /api/instruments/bulk-import            CSV bulk import (multipart/form-data)
"""
from __future__ import annotations

import csv
import io
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import UserContext, assert_writable_site, check_instrument_access, get_current_user, get_optional_user, resolve_site
from database import get_db
from models import AuditLog, CalibrationResultStatus, Instrument, InstrumentStatus, CalibrationRecord, RecordStatus
from schemas import (
    AlertStatus,
    BulkImportResponse,
    CalibrationStatusResponse,
    ImportRowResult,
    InstrumentCreate,
    InstrumentListResponse,
    InstrumentResponse,
    InstrumentUpdate,
)

router = APIRouter(prefix="/api/instruments", tags=["instruments"])

_DUE_SOON_DAYS = 14  # matches CLAUDE.md alert rules


# ---------------------------------------------------------------------------
# Audit helper
# ---------------------------------------------------------------------------

def _write_audit(
    db:           Session,
    user:         UserContext,
    entity_type:  str,
    entity_id,
    action:       str,
    changed_fields: Optional[dict] = None,
) -> None:
    """Write one immutable audit log row. Never raises — log and continue."""
    from uuid import UUID as _UUID
    try:
        entry = AuditLog(
            site_id=_UUID(str(user.site_id)),
            entity_type=entity_type,
            entity_id=_UUID(str(entity_id)),
            user_id=user.user_id,
            user_name=user.display_name or user.email or user.user_id,
            action=action,
            changed_fields=changed_fields,
        )
        db.add(entry)
        # No commit here — caller commits the full transaction
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("Audit write failed: %s", exc)


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
    resolved_site:       str                   = Depends(resolve_site),
    db:                  Session               = Depends(get_db),
) -> InstrumentListResponse:

    q = db.query(Instrument)

    # --- site isolation filter (always applied — resolved_site never empty) ---
    q = q.filter(Instrument.created_by == resolved_site)

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
    current_user:  Optional[UserContext] = Depends(get_optional_user),
    db:            Session               = Depends(get_db),
) -> InstrumentResponse:
    instr = _get_or_404(instrument_id, db)
    check_instrument_access(instr.created_by, current_user)
    return _to_response(instr)


# ---------------------------------------------------------------------------
# POST /api/instruments
# ---------------------------------------------------------------------------

@router.post("", response_model=InstrumentResponse, status_code=status.HTTP_201_CREATED)
def create_instrument(
    payload:      InstrumentCreate,
    current_user: UserContext = Depends(get_current_user),
    db:           Session     = Depends(get_db),
) -> InstrumentResponse:
    assert_writable_site(current_user)
    data = payload.model_dump()
    # Stamp the instrument with the authenticated user's site
    data["created_by"] = current_user.site_name
    instr = Instrument(**data)
    db.add(instr)
    try:
        db.flush()   # get instr.id without committing yet
        _write_audit(db, current_user, "instrument", instr.id, "create",
                     {"tag_number": instr.tag_number, "description": instr.description})
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
    payload:       InstrumentUpdate,
    current_user:  UserContext = Depends(get_current_user),
    db:            Session     = Depends(get_db),
) -> InstrumentResponse:
    instr = _get_or_404(instrument_id, db)
    check_instrument_access(instr.created_by, current_user)
    assert_writable_site(current_user, instr.created_by)

    updates = payload.model_dump(exclude_unset=True)

    # Recompute calibration_due_date when scheduling fields change,
    # unless the caller explicitly supplied a new due date.
    if "calibration_due_date" not in updates:
        new_last = updates.get("last_calibration_date", instr.last_calibration_date)
        new_interval = updates.get("calibration_interval_days", instr.calibration_interval_days)
        if new_last and new_interval:
            updates["calibration_due_date"] = new_last + timedelta(days=new_interval)

    # Never allow created_by to be changed via update
    updates.pop("created_by", None)

    for field, value in updates.items():
        setattr(instr, field, value)

    _write_audit(db, current_user, "instrument", instr.id, "update",
                 {"fields": list(updates.keys())})

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

@router.delete("/{instrument_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_instrument(
    instrument_id: UUID,
    current_user:  UserContext = Depends(get_current_user),
    db:            Session     = Depends(get_db),
) -> None:
    instr = _get_or_404(instrument_id, db)
    check_instrument_access(instr.created_by, current_user)
    assert_writable_site(current_user, instr.created_by)
    instr.status = InstrumentStatus.DECOMMISSIONED
    _write_audit(db, current_user, "instrument", instr.id, "delete",
                 {"tag_number": instr.tag_number})
    db.commit()


# ---------------------------------------------------------------------------
# GET /api/instruments/{id}/calibration-status
# ---------------------------------------------------------------------------

@router.get("/{instrument_id}/calibration-status", response_model=CalibrationStatusResponse)
def get_calibration_status(
    instrument_id: UUID,
    current_user:  Optional[UserContext] = Depends(get_optional_user),
    db:            Session               = Depends(get_db),
) -> CalibrationStatusResponse:
    instr = _get_or_404(instrument_id, db)
    check_instrument_access(instr.created_by, current_user)
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


# ---------------------------------------------------------------------------
# GET /api/instruments/{id}/drift
# ---------------------------------------------------------------------------

@router.get("/{instrument_id}/drift")
def get_drift_analysis(
    instrument_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Calculate drift rate and project failure date for an instrument.
    Requires 3+ approved/submitted calibration records.
    Returns per-test-point drift trends and an overall projected failure date.
    """
    site = resolve_site(current_user)
    instrument = db.query(Instrument).filter(
        Instrument.id == instrument_id,
        Instrument.created_by == site,
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    # Fetch approved/submitted records with test points, ordered by date
    records = (
        db.query(CalibrationRecord)
        .filter(
            CalibrationRecord.instrument_id == instrument_id,
            CalibrationRecord.record_status.in_([
                RecordStatus.APPROVED.value,
                RecordStatus.SUBMITTED.value,
            ]),
            CalibrationRecord.as_found_result.isnot(None),
        )
        .order_by(CalibrationRecord.calibration_date.asc())
        .all()
    )

    if len(records) < 3:
        return {
            "instrument_id": str(instrument_id),
            "sufficient_data": False,
            "record_count": len(records),
            "message": f"Drift analysis requires at least 3 calibration records. Currently has {len(records)}.",
            "test_point_trends": [],
            "projected_fail_date": None,
            "drift_status": "insufficient_data",
        }

    # Get tolerance value for the instrument
    tol_value = instrument.tolerance_value or 1.0
    tol_type = (instrument.tolerance_type.value if hasattr(instrument.tolerance_type, "value") else instrument.tolerance_type) or "percent_span"
    output_span = (instrument.measurement_urv or 100) - (instrument.measurement_lrv or 0)

    # Calculate absolute tolerance as % of span for comparison
    if tol_type == "percent_span":
        tol_pct = tol_value
    elif tol_type == "percent_reading":
        mid = ((instrument.measurement_urv or 100) + (instrument.measurement_lrv or 0)) / 2
        tol_pct = (tol_value / 100 * abs(mid)) / output_span * 100 if output_span else tol_value
    else:  # absolute
        tol_pct = (tol_value / output_span * 100) if output_span else tol_value

    # Build time-series of max as-found error per record
    today = date.today()
    data_points = []
    for rec in records:
        if rec.max_as_found_error_pct is not None:
            days_ago = (today - rec.calibration_date).days
            data_points.append({
                "date": rec.calibration_date.isoformat(),
                "days_ago": days_ago,
                "error_pct": abs(rec.max_as_found_error_pct),
            })

    if len(data_points) < 3:
        return {
            "instrument_id": str(instrument_id),
            "sufficient_data": False,
            "record_count": len(records),
            "message": "Insufficient error data in calibration records for drift analysis.",
            "test_point_trends": [],
            "projected_fail_date": None,
            "drift_status": "insufficient_data",
        }

    # Simple linear regression on (days_ago, error_pct)
    # Convert days_ago to days_from_first (positive direction = time passing)
    first_date = records[0].calibration_date
    xs = [(rec.calibration_date - first_date).days for rec in records if rec.max_as_found_error_pct is not None]
    ys = [abs(rec.max_as_found_error_pct) for rec in records if rec.max_as_found_error_pct is not None]

    if len(xs) < 2:
        slope = 0
    else:
        n = len(xs)
        mean_x = sum(xs) / n
        mean_y = sum(ys) / n
        num = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n))
        den = sum((xs[i] - mean_x) ** 2 for i in range(n))
        slope = num / den if den != 0 else 0  # error_pct per day

    drift_rate_per_year = round(slope * 365, 4)

    # Current error level (most recent record)
    current_error_pct = ys[-1] if ys else 0
    days_elapsed = xs[-1] if xs else 0

    # Project failure date
    projected_fail_date = None
    drift_status = "stable"

    if slope > 0 and current_error_pct < tol_pct:
        days_to_fail = (tol_pct - current_error_pct) / slope
        if days_to_fail < 3650:  # only project up to 10 years
            projected_date = today + timedelta(days=int(days_to_fail))
            projected_fail_date = projected_date.isoformat()
            # Determine urgency
            if days_to_fail < 90:
                drift_status = "critical"
            elif days_to_fail < 365:
                drift_status = "warning"
            else:
                drift_status = "watch"
    elif current_error_pct >= tol_pct:
        drift_status = "exceeded"
    else:
        drift_status = "stable"

    return {
        "instrument_id": str(instrument_id),
        "sufficient_data": True,
        "record_count": len(records),
        "tolerance_pct": round(tol_pct, 4),
        "current_error_pct": round(current_error_pct, 4),
        "drift_rate_per_year": drift_rate_per_year,
        "projected_fail_date": projected_fail_date,
        "drift_status": drift_status,
        "data_points": data_points,
        "message": None,
    }


# ---------------------------------------------------------------------------
# POST /api/instruments/bulk-import
# ---------------------------------------------------------------------------

# Re-use the row-processing logic from the CLI import script.
_VALID_TYPES      = {"pressure","temperature","flow","level","analyser","switch","valve","other"}
_VALID_TOL_TYPES  = {"percent_span","percent_reading","absolute"}
_VALID_CRITICALITY= {"safety_critical","process_critical","standard","non_critical"}
_VALID_STATUSES   = {"active","spare","out_of_service","decommissioned"}
_VALID_CAL_RESULT = {"pass","fail","marginal","not_calibrated"}
_TYPE_MAP = {
    "pressure transmitter":"pressure","pressure indicator":"pressure","pressure gauge":"pressure",
    "pt":"pressure","pit":"pressure","pic":"pressure",
    "temperature transmitter":"temperature","temperature element":"temperature","thermocouple":"temperature",
    "tt":"temperature","te":"temperature",
    "flow transmitter":"flow","flow meter":"flow","flow indicator":"flow","ft":"flow","fit":"flow",
    "level transmitter":"level","level indicator":"level","lt":"level","lit":"level",
    "analyser":"analyser","analyzer":"analyser","at":"analyser",
    "pressure switch":"switch","level switch":"switch","temperature switch":"switch","flow switch":"switch",
    "psh":"switch","psl":"switch","lsh":"switch","lsl":"switch","tsh":"switch",
    "control valve":"valve","valve":"valve","cv":"valve","pcv":"valve","lcv":"valve","tcv":"valve",
}
_STATUS_MAP = {
    "active":"active","in service":"active","operational":"active",
    "spare":"spare","standby":"spare",
    "inactive":"out_of_service","out of service":"out_of_service","shutdown":"out_of_service",
    "decommissioned":"decommissioned","retired":"decommissioned","scrapped":"decommissioned",
}

def _clean(v):
    s = str(v).strip() if v else ""
    return s or None

def _parse_float(v):
    if not v: return None
    numeric = "".join(c for c in str(v).strip() if c.isdigit() or c in ".-")
    try: return float(numeric) if numeric else None
    except ValueError: return None

def _parse_int(v):
    if not v: return None
    numeric = "".join(c for c in str(v).strip() if c.isdigit())
    try: return int(numeric) if numeric else None
    except ValueError: return None

def _parse_date(v):
    if not v: return None
    s = str(v).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def _map_type(raw):
    if not raw: return "other"
    lower = raw.strip().lower()
    if lower in _VALID_TYPES: return lower
    if lower in _TYPE_MAP: return _TYPE_MAP[lower]
    for k, v in _TYPE_MAP.items():
        if k in lower or lower in k: return v
    return "other"

def _map_status(raw):
    if not raw: return "active"
    lower = raw.strip().lower()
    if lower in _VALID_STATUSES: return lower
    return _STATUS_MAP.get(lower, "active")


def _process_import_row(row: dict, row_num: int, existing_tags: set, site_name: str, dry_run: bool, db: Session) -> ImportRowResult:
    tag = _clean(row.get("tag_number") or row.get("Tag Number") or row.get("TAG") or "")
    if not tag:
        return ImportRowResult(row=row_num, tag="(blank)", status="error", message="tag_number is required")

    if tag in existing_tags:
        return ImportRowResult(row=row_num, tag=tag, status="skipped", message="tag already exists")

    description = _clean(row.get("description") or row.get("Description") or "") or tag
    area        = _clean(row.get("area") or row.get("Area") or row.get("Location") or "") or "Unassigned"
    raw_type    = _clean(row.get("instrument_type") or row.get("Equipment Type") or row.get("Type") or "")
    raw_status  = _clean(row.get("status") or row.get("Status") or "")
    raw_crit    = _clean(row.get("criticality") or row.get("Criticality") or "")
    raw_tol_t   = _clean(row.get("tolerance_type") or row.get("Tolerance Type") or "")

    cal_interval = _parse_int(row.get("calibration_interval_days") or row.get("Cal Interval") or row.get("Calibration Interval")) or 365
    num_pts      = _parse_int(row.get("num_test_points") or row.get("Test Points") or "") or 5
    lrv          = _parse_float(row.get("measurement_lrv") or row.get("LRV") or row.get("Range Low") or "")
    urv          = _parse_float(row.get("measurement_urv") or row.get("URV") or row.get("Range High") or "")
    tol_val      = _parse_float(row.get("tolerance_value") or row.get("Tolerance") or "")
    last_cal     = _parse_date(row.get("last_calibration_date") or row.get("Last Cal Date") or row.get("Last Service Date") or "")
    raw_result   = _clean(row.get("last_calibration_result") or row.get("Last Result") or "")

    payload = {
        "tag_number":                tag,
        "description":               description,
        "area":                      area,
        "instrument_type":           _map_type(raw_type),
        "status":                    _map_status(raw_status),
        "criticality":               raw_crit.lower() if raw_crit and raw_crit.lower() in _VALID_CRITICALITY else "standard",
        "calibration_interval_days": cal_interval,
        "num_test_points":           num_pts,
        "created_by":                site_name,
    }
    if lrv is not None: payload["measurement_lrv"] = lrv
    if urv is not None: payload["measurement_urv"] = urv
    if tol_val is not None:
        payload["tolerance_value"] = tol_val
        payload["tolerance_type"]  = raw_tol_t.lower() if raw_tol_t and raw_tol_t.lower() in _VALID_TOL_TYPES else "percent_span"
    if last_cal: payload["last_calibration_date"] = last_cal
    if raw_result and raw_result.lower() in _VALID_CAL_RESULT:
        payload["last_calibration_result"] = raw_result.lower()

    # Optional string fields
    for src, dst in [("unit","unit"),("manufacturer","manufacturer"),("model","model"),
                     ("serial_number","serial_number"),("engineering_units","engineering_units"),
                     ("output_type","output_type"),("procedure_reference","procedure_reference")]:
        v = _clean(row.get(src) or "")
        if v: payload[dst] = v

    if dry_run:
        return ImportRowResult(row=row_num, tag=tag, status="created", message=f"DRY RUN — {len(payload)} fields OK")

    try:
        instr = Instrument(**payload)
        db.add(instr)
        db.flush()
        existing_tags.add(tag)
        return ImportRowResult(row=row_num, tag=tag, status="created", message="OK")
    except IntegrityError:
        db.rollback()
        return ImportRowResult(row=row_num, tag=tag, status="skipped", message="tag already exists (DB conflict)")
    except Exception as exc:
        db.rollback()
        return ImportRowResult(row=row_num, tag=tag, status="error", message=str(exc))


@router.post("/bulk-import", response_model=BulkImportResponse, status_code=status.HTTP_200_OK)
async def bulk_import(
    file:         UploadFile     = File(..., description="CSV file in caltrack_import_TEMPLATE.csv format"),
    dry_run:      bool           = Query(False, description="Validate without creating (true = preview only)"),
    current_user: UserContext    = Depends(get_current_user),
    db:           Session        = Depends(get_db),
) -> BulkImportResponse:
    """
    Import instruments from a CSV file.
    Set dry_run=true to preview results without creating any records.
    Duplicate tag numbers (already in the site) are skipped, not errored.
    """
    assert_writable_site(current_user)
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv")

    contents = await file.read()
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = contents.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    rows   = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty or has no data rows")

    # Fetch existing tags for this site to detect duplicates
    existing_tags = {
        r.tag_number
        for r in db.query(Instrument.tag_number)
        .filter(Instrument.created_by == current_user.site_name)
        .all()
    }

    results: list[ImportRowResult] = []
    for i, row in enumerate(rows, start=1):
        result = _process_import_row(row, i, existing_tags, current_user.site_name, dry_run, db)
        results.append(result)

    created = sum(1 for r in results if r.status == "created")
    skipped = sum(1 for r in results if r.status == "skipped")
    errors  = sum(1 for r in results if r.status == "error")

    if not dry_run and created > 0:
        # Write one bulk audit entry covering all imported instruments
        _write_audit(db, current_user, "instrument", current_user.site_id, "bulk_import",
                     {"created": created, "skipped": skipped, "errors": errors, "total": len(rows)})
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(status_code=500, detail="Import failed during commit")

    return BulkImportResponse(
        dry_run=dry_run,
        total=len(rows),
        created=created,
        skipped=skipped,
        errors=errors,
        rows=results,
    )
