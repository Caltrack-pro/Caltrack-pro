"""
Audit log routes
================
GET /api/instruments/{id}/audit-log   — full audit trail for an instrument + its calibration records
GET /api/audit                        — site-wide audit log (admin only)
"""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth import UserContext, check_instrument_access, get_current_user, get_optional_user
from database import get_db
from models import AuditLog, Instrument
from schemas import AuditLogListResponse

router = APIRouter(prefix="/api", tags=["audit"])


@router.get("/instruments/{instrument_id}/audit-log", response_model=AuditLogListResponse)
def instrument_audit_log(
    instrument_id: UUID,
    skip:         int                   = Query(0, ge=0),
    limit:        int                   = Query(100, ge=1, le=500),
    current_user: Optional[UserContext] = Depends(get_optional_user),
    db:           Session               = Depends(get_db),
) -> AuditLogListResponse:
    """
    Returns the audit trail for an instrument and all of its calibration records,
    ordered newest first.
    """
    instr = db.get(Instrument, instrument_id)
    if instr:
        check_instrument_access(instr.created_by, current_user)

    q = (
        db.query(AuditLog)
        .filter(
            AuditLog.entity_id == instrument_id,
        )
        .order_by(AuditLog.created_at.desc())
    )

    # Also include audit entries for calibration records that belong to this instrument
    # We do this by fetching cal record IDs first, then doing a combined query.
    from models import CalibrationRecord
    cal_ids = [
        r.id for r in db.query(CalibrationRecord.id)
        .filter(CalibrationRecord.instrument_id == instrument_id)
        .all()
    ]

    from sqlalchemy import or_
    q = (
        db.query(AuditLog)
        .filter(
            or_(
                AuditLog.entity_id == instrument_id,
                AuditLog.entity_id.in_(cal_ids) if cal_ids else False,
            )
        )
        .order_by(AuditLog.created_at.desc())
    )

    total   = q.count()
    entries = q.offset(skip).limit(limit).all()
    return AuditLogListResponse(total=total, results=entries)


@router.get("/audit", response_model=AuditLogListResponse)
def site_audit_log(
    entity_type: Optional[str] = Query(None, description="instrument | calibration_record"),
    skip:        int            = Query(0, ge=0),
    limit:       int            = Query(100, ge=1, le=500),
    current_user: UserContext   = Depends(get_current_user),
    db:           Session       = Depends(get_db),
) -> AuditLogListResponse:
    """Site-wide audit log — admin/supervisor only, scoped to the user's site."""
    from fastapi import HTTPException
    if current_user.role not in ("admin", "supervisor"):
        raise HTTPException(status_code=403, detail="Admin or supervisor role required")

    q = (
        db.query(AuditLog)
        .filter(AuditLog.site_id == current_user.site_id)
    )
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)

    q = q.order_by(AuditLog.created_at.desc())
    total   = q.count()
    entries = q.offset(skip).limit(limit).all()
    return AuditLogListResponse(total=total, results=entries)
