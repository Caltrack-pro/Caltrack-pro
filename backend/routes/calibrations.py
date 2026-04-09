"""
Calibration Records REST API
=============================
GET    /api/calibrations                              list with filters
GET    /api/calibrations/{id}                         full record + test points
POST   /api/calibrations                              create (draft)
PUT    /api/calibrations/{id}                         update (draft only)
POST   /api/calibrations/{id}/submit                  draft → submitted
POST   /api/calibrations/{id}/approve                 submitted → approved + updates instrument
POST   /api/calibrations/{id}/reject                  submitted → rejected
GET    /api/instruments/{instrument_id}/calibration-history   all records newest-first
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from calibration_engine import (
    CalibrationEngineError,
    EngineResult,
    TestPointData,
    calculate_calibration_result,
)
from database import get_db
from models import (
    AsLeftResult,
    CalibrationRecord,
    CalibrationResultStatus,
    CalTestPoint,
    Instrument,
    RecordStatus,
)
from schemas import (
    CalibrationListResponse,
    CalibrationRecordCreate,
    CalibrationRecordListItem,
    CalibrationRecordResponse,
    CalibrationRecordUpdate,
    InstrumentSummary,
    RejectPayload,
    TestPointInput,
    TestPointResponse,
)

router = APIRouter(prefix="/api/calibrations", tags=["calibrations"])

# Separate router for the instrument-scoped history endpoint
instruments_router = APIRouter(prefix="/api/instruments", tags=["calibrations"])


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_record_or_404(record_id: UUID, db: Session) -> CalibrationRecord:
    rec = db.get(CalibrationRecord, record_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="Calibration record not found")
    return rec


def _get_instrument_or_404(instrument_id: UUID, db: Session) -> Instrument:
    instr = db.get(Instrument, instrument_id)
    if instr is None:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return instr


def _require_draft(rec: CalibrationRecord) -> None:
    if rec.record_status != RecordStatus.DRAFT:
        raise HTTPException(
            status_code=409,
            detail=f"Record cannot be modified — current status is '{rec.record_status.value}'. "
                   "Only draft records may be edited.",
        )


def _require_status(rec: CalibrationRecord, expected: RecordStatus, action: str) -> None:
    if rec.record_status != expected:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot {action}: record status is '{rec.record_status.value}', "
                   f"expected '{expected.value}'.",
        )


def _fetch_test_points(record_id: UUID, db: Session) -> List[CalTestPoint]:
    return (
        db.query(CalTestPoint)
        .filter(CalTestPoint.calibration_record_id == record_id)
        .order_by(CalTestPoint.point_number)
        .all()
    )


def _to_record_response(rec: CalibrationRecord, db: Session) -> CalibrationRecordResponse:
    """Build CalibrationRecordResponse with embedded test points."""
    tps = _fetch_test_points(rec.id, db)
    data = {col.name: getattr(rec, col.name) for col in rec.__table__.columns}
    data["test_points"] = [
        {col.name: getattr(tp, col.name) for col in tp.__table__.columns}
        for tp in tps
    ]
    return CalibrationRecordResponse.model_validate(data)


def _engine_points_from_input(test_points: List[TestPointInput]) -> List[TestPointData]:
    """Convert Pydantic TestPointInput → engine TestPointData."""
    return [
        TestPointData(
            point_number=tp.point_number,
            nominal_input=tp.nominal_input,
            expected_output=tp.expected_output,
            as_found_output=tp.as_found_output,   # type: ignore[arg-type]
            as_left_output=tp.as_left_output,
        )
        for tp in test_points
        if tp.as_found_output is not None   # only run engine on complete points
    ]


def _all_have_as_found(test_points: List[TestPointInput]) -> bool:
    return all(tp.as_found_output is not None for tp in test_points)


def _save_test_points(
    record: CalibrationRecord,
    test_points_input: List[TestPointInput],
    instrument: Instrument,
    db: Session,
) -> None:
    """
    1. Delete any existing test points for this record.
    2. Run the engine if all points have as_found_output values.
    3. Persist CalTestPoint rows.
    4. Update the record's overall result fields.
    """
    # Remove old test points (replace-all on update)
    db.query(CalTestPoint).filter(
        CalTestPoint.calibration_record_id == record.id
    ).delete(synchronize_session=False)

    engine_result: Optional[EngineResult] = None

    if _all_have_as_found(test_points_input):
        engine_points = _engine_points_from_input(test_points_input)
        try:
            engine_result = calculate_calibration_result(instrument, engine_points)
        except CalibrationEngineError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    # Build a lookup of engine results by point_number
    engine_by_num = {}
    if engine_result:
        for ep in engine_result.test_points:
            engine_by_num[ep.point_number] = ep

    for tp_in in test_points_input:
        ep = engine_by_num.get(tp_in.point_number)
        row = CalTestPoint(
            calibration_record_id=record.id,
            point_number=tp_in.point_number,
            nominal_input=tp_in.nominal_input,
            expected_output=tp_in.expected_output,
            as_found_output=tp_in.as_found_output,
            as_left_output=tp_in.as_left_output,
            as_found_error_abs=ep.as_found_error_abs if ep else None,
            as_found_error_pct=ep.as_found_error_pct if ep else None,
            as_left_error_abs=ep.as_left_error_abs if ep else None,
            as_left_error_pct=ep.as_left_error_pct if ep else None,
            as_found_result=ep.as_found_result if ep else None,
            as_left_result=ep.as_left_result if ep else None,
        )
        db.add(row)

    # Update record-level summary fields from engine output
    if engine_result:
        record.as_found_result = engine_result.as_found_result
        record.as_left_result  = engine_result.as_left_result
        record.max_as_found_error_pct = engine_result.max_as_found_error_pct
        record.max_as_left_error_pct  = engine_result.max_as_left_error_pct
    else:
        # Incomplete test points — clear any stale summary fields
        record.as_found_result        = None
        record.as_left_result         = None
        record.max_as_found_error_pct = None
        record.max_as_left_error_pct  = None


def _update_instrument_on_approve(record: CalibrationRecord, db: Session) -> None:
    """
    After approval, propagate calibration outcome back to the parent instrument:
      - last_calibration_date   = calibration_date
      - last_calibration_result = as_left_result (if adjusted) else as_found_result
      - calibration_due_date    = calibration_date + calibration_interval_days
    """
    instr = db.get(Instrument, record.instrument_id)
    if instr is None:
        return  # instrument was decommissioned between record creation and approval

    instr.last_calibration_date = record.calibration_date

    # Determine the final result for the instrument
    al = record.as_left_result
    if al and al.value != AsLeftResult.NOT_REQUIRED.value:
        # Adjustment was made — as-left state determines if instrument is serviceable
        final_result = al.value           # "pass" / "fail" / "marginal" all map directly
    elif record.as_found_result:
        final_result = record.as_found_result.value
    else:
        final_result = CalibrationResultStatus.NOT_CALIBRATED.value

    instr.last_calibration_result = final_result

    # Advance the due date
    if instr.calibration_interval_days:
        instr.calibration_due_date = (
            record.calibration_date + timedelta(days=instr.calibration_interval_days)
        )


# ---------------------------------------------------------------------------
# GET /api/calibrations
# ---------------------------------------------------------------------------

@router.get("", response_model=CalibrationListResponse)
def list_calibrations(
    instrument_id: Optional[UUID] = Query(None),
    result:        Optional[str]  = Query(None, description="as_found_result value: pass | fail | marginal"),
    technician:    Optional[str]  = Query(None, description="Partial match on technician_name"),
    date_from:     Optional[date] = Query(None, description="Calibration date ≥ this date"),
    date_to:       Optional[date] = Query(None, description="Calibration date ≤ this date"),
    record_status: Optional[str]  = Query(None, description="draft | submitted | approved | rejected"),
    site:          Optional[str]  = Query(None, description="Filter by site/organisation (created_by on instrument)"),
    skip:          int            = Query(0, ge=0),
    limit:         int            = Query(100, ge=1, le=500),
    db:            Session        = Depends(get_db),
) -> CalibrationListResponse:

    q = db.query(CalibrationRecord)

    # Site isolation: join instruments table and filter by created_by
    if site:
        q = q.join(Instrument, CalibrationRecord.instrument_id == Instrument.id).filter(
            Instrument.created_by == site
        )

    if instrument_id:
        q = q.filter(CalibrationRecord.instrument_id == instrument_id)
    if result:
        q = q.filter(CalibrationRecord.as_found_result == result)
    if technician:
        q = q.filter(CalibrationRecord.technician_name.ilike(f"%{technician}%"))
    if date_from:
        q = q.filter(CalibrationRecord.calibration_date >= date_from)
    if date_to:
        q = q.filter(CalibrationRecord.calibration_date <= date_to)
    if record_status:
        q = q.filter(CalibrationRecord.record_status == record_status)

    total   = q.count()
    records = (
        q.order_by(CalibrationRecord.calibration_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Collect unique instrument IDs and batch-fetch their summaries
    instr_ids = list({r.instrument_id for r in records})
    instruments_map: dict = {}
    if instr_ids:
        instrs = db.query(Instrument).filter(Instrument.id.in_(instr_ids)).all()
        instruments_map = {i.id: i for i in instrs}

    items = []
    for r in records:
        item = CalibrationRecordListItem.model_validate(r)
        instr = instruments_map.get(r.instrument_id)
        if instr:
            item.instrument = InstrumentSummary.model_validate(instr)
        items.append(item)

    return CalibrationListResponse(total=total, results=items)


# ---------------------------------------------------------------------------
# GET /api/calibrations/{id}
# ---------------------------------------------------------------------------

@router.get("/{record_id}", response_model=CalibrationRecordResponse)
def get_calibration(
    record_id: UUID,
    db: Session = Depends(get_db),
) -> CalibrationRecordResponse:
    rec = _get_record_or_404(record_id, db)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# POST /api/calibrations
# ---------------------------------------------------------------------------

@router.post("", response_model=CalibrationRecordResponse, status_code=status.HTTP_201_CREATED)
def create_calibration(
    payload: CalibrationRecordCreate,
    db: Session = Depends(get_db),
) -> CalibrationRecordResponse:

    instr = _get_instrument_or_404(payload.instrument_id, db)

    # Build record from payload (exclude test_points — handled separately)
    record_data = payload.model_dump(exclude={"test_points"})
    rec = CalibrationRecord(**record_data, record_status=RecordStatus.DRAFT)
    db.add(rec)
    db.flush()   # populate rec.id before inserting test points

    if payload.test_points:
        _save_test_points(rec, payload.test_points, instr, db)

    db.commit()
    db.refresh(rec)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# PUT /api/calibrations/{id}
# ---------------------------------------------------------------------------

@router.put("/{record_id}", response_model=CalibrationRecordResponse)
def update_calibration(
    record_id: UUID,
    payload:   CalibrationRecordUpdate,
    db:        Session = Depends(get_db),
) -> CalibrationRecordResponse:

    rec = _get_record_or_404(record_id, db)
    _require_draft(rec)

    updates = payload.model_dump(exclude_unset=True, exclude={"test_points"})
    for field, value in updates.items():
        setattr(rec, field, value)

    if payload.test_points is not None:
        instr = _get_instrument_or_404(rec.instrument_id, db)
        _save_test_points(rec, payload.test_points, instr, db)

    db.commit()
    db.refresh(rec)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# POST /api/calibrations/{id}/submit
# ---------------------------------------------------------------------------

@router.post("/{record_id}/submit", response_model=CalibrationRecordResponse)
def submit_calibration(
    record_id: UUID,
    db: Session = Depends(get_db),
) -> CalibrationRecordResponse:

    rec = _get_record_or_404(record_id, db)
    _require_draft(rec)

    instr      = _get_instrument_or_404(rec.instrument_id, db)
    test_points = _fetch_test_points(rec.id, db)

    # --- validation: correct number of test points ---
    expected_count = instr.num_test_points or 0
    if len(test_points) != expected_count:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Expected {expected_count} test point(s) based on instrument configuration, "
                f"but found {len(test_points)}. "
                "Save all test points before submitting."
            ),
        )

    # --- validation: all test points must have as_found_output ---
    incomplete = [tp.point_number for tp in test_points if tp.as_found_output is None]
    if incomplete:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Test point(s) {incomplete} are missing 'as_found_output' readings. "
                "All points must have as-found readings before submitting."
            ),
        )

    # --- validation: engine results must be present ---
    if rec.as_found_result is None:
        raise HTTPException(
            status_code=422,
            detail=(
                "Pass/fail results have not been calculated. "
                "Update the record with complete test point readings to trigger the calculation."
            ),
        )

    rec.record_status = RecordStatus.SUBMITTED
    db.commit()
    db.refresh(rec)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# POST /api/calibrations/{id}/approve
# ---------------------------------------------------------------------------

@router.post("/{record_id}/approve", response_model=CalibrationRecordResponse)
def approve_calibration(
    record_id:      UUID,
    approved_by:    str     = Body(..., embed=True),
    db:             Session = Depends(get_db),
) -> CalibrationRecordResponse:

    rec = _get_record_or_404(record_id, db)
    _require_status(rec, RecordStatus.SUBMITTED, "approve")

    from datetime import datetime, timezone
    rec.record_status = RecordStatus.APPROVED
    rec.approved_by   = approved_by
    rec.approved_at   = datetime.now(timezone.utc)

    _update_instrument_on_approve(rec, db)

    db.commit()
    db.refresh(rec)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# POST /api/calibrations/{id}/reject
# ---------------------------------------------------------------------------

@router.post("/{record_id}/reject", response_model=CalibrationRecordResponse)
def reject_calibration(
    record_id: UUID,
    payload:   RejectPayload = Body(default=RejectPayload()),
    db:        Session       = Depends(get_db),
) -> CalibrationRecordResponse:

    rec = _get_record_or_404(record_id, db)
    _require_status(rec, RecordStatus.SUBMITTED, "reject")

    rec.record_status = RecordStatus.REJECTED
    if payload.notes:
        existing = rec.technician_notes or ""
        rec.technician_notes = (
            f"{existing}\n[REJECTED] {payload.notes}".strip()
        )

    db.commit()
    db.refresh(rec)
    return _to_record_response(rec, db)


# ---------------------------------------------------------------------------
# GET /api/instruments/{instrument_id}/calibration-history
# ---------------------------------------------------------------------------

@instruments_router.get(
    "/{instrument_id}/calibration-history",
    response_model=CalibrationListResponse,
    tags=["instruments"],
)
def calibration_history(
    instrument_id: UUID,
    skip:    int     = Query(0, ge=0),
    limit:   int     = Query(50, ge=1, le=200),
    db:      Session = Depends(get_db),
) -> CalibrationListResponse:

    _get_instrument_or_404(instrument_id, db)   # 404 if instrument doesn't exist

    q = (
        db.query(CalibrationRecord)
        .filter(CalibrationRecord.instrument_id == instrument_id)
        .order_by(CalibrationRecord.calibration_date.desc())
    )
    total   = q.count()
    records = q.offset(skip).limit(limit).all()

    return CalibrationListResponse(
        total=total,
        results=[CalibrationRecordListItem.model_validate(r) for r in records],
    )
