"""
Super-admin / platform-operator routes.

Mounted at /api/superadmin/*. Every endpoint is guarded by get_superadmin_user,
which checks the caller's email against the SUPERADMIN_EMAILS env-var allow-list
and 403s otherwise.

These routes operate platform-wide — they deliberately do NOT call
assert_writable_site (so the super-admin can operate on the Demo site) and do
NOT call assert_active_subscription. Every action writes an audit_log row.

Routes:
  GET    /api/superadmin/sites                           — list every site with counts
  GET    /api/superadmin/sites/{id}                      — full detail + members
  POST   /api/superadmin/sites/{id}/extend-trial         — DB-only trial override
  POST   /api/superadmin/sites/{id}/override-plan        — set plan + interval
  POST   /api/superadmin/sites/{id}/pause                — status → cancelled
  POST   /api/superadmin/sites/{id}/resume               — status → active/trialing

  DELETE /api/superadmin/sites/{id}?confirm=<site_name>  — hard delete
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from auth import UserContext, get_superadmin_user
from database import get_db
from models import (
    AuditLog,
    CalibrationQueue,
    CalibrationRecord,
    Document,
    Instrument,
    Site,
    SiteMember,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])

# Sites that cannot be deleted under any circumstances. Case-insensitive.
# "Calcheq" is the platform owner's own operating site; "Demo" is the public
# demo environment everyone on the marketing site can browse.
UNDELETABLE_SITES = {"calcheq", "demo"}

VALID_PLANS     = {"starter", "professional", "enterprise"}
VALID_INTERVALS = {"monthly", "annual"}


# ---------------------------------------------------------------------------
# Audit helper — one row per super-admin action
# ---------------------------------------------------------------------------

def _audit(
    db: Session,
    actor: UserContext,
    target_site_id,
    action: str,
    changed_fields: Optional[dict] = None,
) -> None:
    """
    Write an immutable audit row for a super-admin action. Never raises — logs
    and continues so an audit failure can't take down the actual operation.
    """
    try:
        entry = AuditLog(
            site_id=UUID(str(target_site_id)),
            entity_type="site",
            entity_id=UUID(str(target_site_id)),
            user_id=actor.real_user_id or actor.user_id,
            user_name=actor.real_email or actor.email or actor.user_id,
            action=action,
            changed_fields=changed_fields,
        )
        db.add(entry)
    except Exception as exc:
        logger.warning("Super-admin audit write failed (action=%s): %s", action, exc)


def _site_or_404(db: Session, site_id: str) -> Site:
    try:
        sid = UUID(str(site_id))
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid site id") from exc
    site = db.query(Site).filter(Site.id == sid).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


def _serialize_site(
    site: Site,
    *,
    instrument_count: int = 0,
    calibration_count: int = 0,
    member_count: int = 0,
    last_activity: Optional[datetime] = None,
) -> dict:
    return {
        "id":                       str(site.id),
        "name":                     site.name,
        "created_at":               site.created_at.isoformat() if site.created_at else None,
        "subscription_status":      site.subscription_status,
        "subscription_plan":        site.subscription_plan,
        "subscription_interval":    site.subscription_interval,
        "trial_ends_at":            site.trial_ends_at.isoformat() if site.trial_ends_at else None,
        "stripe_customer_id":       site.stripe_customer_id,
        "stripe_subscription_id":   site.stripe_subscription_id,
        "instrument_count":         instrument_count,
        "calibration_count":        calibration_count,
        "member_count":             member_count,
        "last_activity":            last_activity.isoformat() if last_activity else None,
    }


# ---------------------------------------------------------------------------
# GET /api/superadmin/sites
# ---------------------------------------------------------------------------

@router.get("/sites")
def list_sites(
    _actor: UserContext = Depends(get_superadmin_user),
    db:     Session     = Depends(get_db),
):
    """
    List every site. Aggregates are computed in a small number of grouped
    queries rather than N per-site lookups — cheap for the site counts we
    expect (tens to low hundreds), and still sane at a few thousand.
    """
    sites = db.query(Site).order_by(Site.created_at.desc()).all()

    # Instrument counts by site name (isolation key = Instrument.created_by)
    instr_counts: dict[str, int] = dict(
        db.execute(
            select(Instrument.created_by, func.count(Instrument.id))
            .group_by(Instrument.created_by)
        ).all()
    )

    # Calibration counts by site name, via the instrument they're linked to
    cal_counts: dict[str, int] = dict(
        db.execute(
            select(Instrument.created_by, func.count(CalibrationRecord.id))
            .join(CalibrationRecord, CalibrationRecord.instrument_id == Instrument.id)
            .group_by(Instrument.created_by)
        ).all()
    )

    # Member counts by site_id (UUID key)
    member_counts_raw = db.execute(
        select(SiteMember.site_id, func.count(SiteMember.id))
        .group_by(SiteMember.site_id)
    ).all()
    member_counts: dict[str, int] = {str(sid): c for sid, c in member_counts_raw}

    # Last calibration date by site (converted to datetime at midnight UTC for sortability)
    last_cal_raw = db.execute(
        select(Instrument.created_by, func.max(CalibrationRecord.calibration_date))
        .join(CalibrationRecord, CalibrationRecord.instrument_id == Instrument.id)
        .group_by(Instrument.created_by)
    ).all()
    last_cal: dict[str, datetime] = {}
    for name, dt in last_cal_raw:
        if dt is None:
            continue
        # calibration_date is a Date — promote to datetime for consistent JSON output
        last_cal[name] = datetime.combine(dt, datetime.min.time(), tzinfo=timezone.utc)

    results = [
        _serialize_site(
            s,
            instrument_count=instr_counts.get(s.name, 0),
            calibration_count=cal_counts.get(s.name, 0),
            member_count=member_counts.get(str(s.id), 0),
            last_activity=last_cal.get(s.name) or s.created_at,
        )
        for s in sites
    ]

    return {"total": len(results), "results": results}


# ---------------------------------------------------------------------------
# GET /api/superadmin/sites/{id}
# ---------------------------------------------------------------------------

@router.get("/sites/{site_id}")
def site_detail(
    site_id: str,
    _actor: UserContext = Depends(get_superadmin_user),
    db:     Session     = Depends(get_db),
):
    site = _site_or_404(db, site_id)

    instr_count = db.query(func.count(Instrument.id)).filter(
        Instrument.created_by == site.name
    ).scalar() or 0

    cal_count = db.query(func.count(CalibrationRecord.id)).join(
        Instrument, CalibrationRecord.instrument_id == Instrument.id
    ).filter(Instrument.created_by == site.name).scalar() or 0

    last_cal_date = db.query(func.max(CalibrationRecord.calibration_date)).join(
        Instrument, CalibrationRecord.instrument_id == Instrument.id
    ).filter(Instrument.created_by == site.name).scalar()

    members = db.query(SiteMember).filter(SiteMember.site_id == site.id).order_by(SiteMember.created_at).all()

    return {
        **_serialize_site(
            site,
            instrument_count=instr_count,
            calibration_count=cal_count,
            member_count=len(members),
            last_activity=(
                datetime.combine(last_cal_date, datetime.min.time(), tzinfo=timezone.utc)
                if last_cal_date else site.created_at
            ),
        ),
        "members": [
            {
                "id":           str(m.id),
                "user_id":      str(m.user_id),
                "display_name": m.display_name,
                "email":        m.email,
                "role":         m.role,
                "created_at":   m.created_at.isoformat() if m.created_at else None,
            }
            for m in members
        ],
    }


# ---------------------------------------------------------------------------
# POST /api/superadmin/sites/{id}/extend-trial
# ---------------------------------------------------------------------------

class ExtendTrialRequest(BaseModel):
    days:         Optional[int]      = Field(None, ge=1, le=3650)
    new_end_date: Optional[datetime] = None

    @model_validator(mode="after")
    def _exactly_one(self):
        if (self.days is None) == (self.new_end_date is None):
            raise ValueError("Provide exactly one of: days, new_end_date")
        return self


@router.post("/sites/{site_id}/extend-trial")
def extend_trial(
    site_id: str,
    payload: ExtendTrialRequest,
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """
    DB-only trial override — does NOT touch Stripe. Intended for managed pilots
    (e.g. IXOM) that don't have a Stripe customer on file. Sets
    subscription_status='trialing' and trial_ends_at to the requested date.
    """
    site = _site_or_404(db, site_id)

    before = {
        "subscription_status": site.subscription_status,
        "trial_ends_at":       site.trial_ends_at.isoformat() if site.trial_ends_at else None,
    }

    if payload.days is not None:
        # Extend from the later of now or the current trial end — so "extend by 30"
        # on an already-future trial gives 30 more days, not resets to 30 from today.
        now = datetime.now(tz=timezone.utc)
        base = site.trial_ends_at if (site.trial_ends_at and site.trial_ends_at > now) else now
        new_end = base + timedelta(days=payload.days)
    else:
        new_end = payload.new_end_date
        if new_end.tzinfo is None:
            new_end = new_end.replace(tzinfo=timezone.utc)

    site.trial_ends_at       = new_end
    site.subscription_status = "trialing"
    after = {
        "subscription_status": "trialing",
        "trial_ends_at":       new_end.isoformat(),
    }
    _audit(db, actor, site.id, "superadmin_extend_trial", {"before": before, "after": after})
    db.commit()
    db.refresh(site)

    return _serialize_site(site)


# ---------------------------------------------------------------------------
# POST /api/superadmin/sites/{id}/override-plan
# ---------------------------------------------------------------------------

class OverridePlanRequest(BaseModel):
    plan:     str
    interval: str

    @model_validator(mode="after")
    def _validate(self):
        if self.plan not in VALID_PLANS:
            raise ValueError(f"plan must be one of {sorted(VALID_PLANS)}")
        if self.interval not in VALID_INTERVALS:
            raise ValueError(f"interval must be one of {sorted(VALID_INTERVALS)}")
        return self


@router.post("/sites/{site_id}/override-plan")
def override_plan(
    site_id: str,
    payload: OverridePlanRequest,
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """
    DB-only plan override — does not charge Stripe. Used for goodwill upgrades
    and for pilots whose billing isn't handled through Stripe.
    """
    site = _site_or_404(db, site_id)

    before = {
        "subscription_plan":     site.subscription_plan,
        "subscription_interval": site.subscription_interval,
    }
    site.subscription_plan     = payload.plan
    site.subscription_interval = payload.interval
    after = {
        "subscription_plan":     payload.plan,
        "subscription_interval": payload.interval,
    }
    _audit(db, actor, site.id, "superadmin_override_plan", {"before": before, "after": after})
    db.commit()
    db.refresh(site)
    return _serialize_site(site)


# ---------------------------------------------------------------------------
# POST /api/superadmin/sites/{id}/pause
# ---------------------------------------------------------------------------

@router.post("/sites/{site_id}/pause")
def pause_site(
    site_id: str,
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """Mark the site's subscription cancelled so write routes 402."""
    site = _site_or_404(db, site_id)
    before = {"subscription_status": site.subscription_status}
    site.subscription_status = "cancelled"
    _audit(db, actor, site.id, "superadmin_pause",
           {"before": before, "after": {"subscription_status": "cancelled"}})
    db.commit()
    db.refresh(site)
    return _serialize_site(site)


# ---------------------------------------------------------------------------
# POST /api/superadmin/sites/{id}/resume
# ---------------------------------------------------------------------------

class ResumeRequest(BaseModel):
    # If omitted, we pick based on whether trial_ends_at is in the future.
    status: Optional[str] = None

    @model_validator(mode="after")
    def _validate(self):
        if self.status is not None and self.status not in {"active", "trialing"}:
            raise ValueError("status must be 'active' or 'trialing'")
        return self


@router.post("/sites/{site_id}/resume")
def resume_site(
    site_id: str,
    payload: ResumeRequest = ResumeRequest(),
    actor:   UserContext   = Depends(get_superadmin_user),
    db:      Session       = Depends(get_db),
):
    """
    Re-activate a paused/cancelled site. Defaults to 'trialing' if the trial
    end date is still in the future, otherwise 'active'.
    """
    site = _site_or_404(db, site_id)

    if payload.status is not None:
        new_status = payload.status
    else:
        now = datetime.now(tz=timezone.utc)
        new_status = "trialing" if (site.trial_ends_at and site.trial_ends_at > now) else "active"

    before = {"subscription_status": site.subscription_status}
    site.subscription_status = new_status
    _audit(db, actor, site.id, "superadmin_resume",
           {"before": before, "after": {"subscription_status": new_status}})
    db.commit()
    db.refresh(site)
    return _serialize_site(site)


# ---------------------------------------------------------------------------
# Impersonation session markers
#
# The impersonation mechanism itself lives in auth.py (header rewrite +
# per-write audit). These endpoints exist purely to bracket a session in the
# audit trail — they're called by the frontend without the impersonation
# header, so the super-admin's real identity is recorded.
# ---------------------------------------------------------------------------

@router.post("/sites/{site_id}/impersonate-start")
def impersonate_start(
    site_id: str,
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """
    Records the start of an impersonation session. Returns the target site's
    name for the frontend to display in the red banner. Does NOT set any
    server-side state — impersonation is request-scoped via the header.
    """
    site = _site_or_404(db, site_id)
    _audit(db, actor, site.id, "impersonation_start", {"target_site_name": site.name})
    db.commit()
    return {"site_id": str(site.id), "site_name": site.name}


@router.post("/sites/{site_id}/impersonate-end")
def impersonate_end(
    site_id: str,
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """
    Records the end of an impersonation session. The frontend clears the
    X-Impersonate-Site-Id header before calling this endpoint so the
    super-admin's real identity reaches the audit helper.
    """
    site = _site_or_404(db, site_id)
    _audit(db, actor, site.id, "impersonation_end", {"target_site_name": site.name})
    db.commit()
    return {"site_id": str(site.id), "site_name": site.name}


# ---------------------------------------------------------------------------
# DELETE /api/superadmin/sites/{id}
# ---------------------------------------------------------------------------

@router.delete("/sites/{site_id}", status_code=200)
def delete_site(
    site_id: str,
    confirm: str = Query(..., description="Must match the target site's name exactly"),
    actor:   UserContext = Depends(get_superadmin_user),
    db:      Session     = Depends(get_db),
):
    """
    Hard-delete a site and everything scoped to it (instruments cascade to
    calibrations, test points, queue entries, documents, site_members).

    Guardrails:
      - ?confirm=<site_name> must match the target's name exactly (fat-finger gate)
      - The 'CalCheq' and 'Demo' sites cannot be deleted (case-insensitive)

    Instruments are site-scoped by Instrument.created_by == site.name, not by
    FK to sites.id, so we delete them explicitly by name. Calibration records,
    test points, queue entries, and document_instruments cascade from
    instruments via FK. Documents and calibration_queue are also scoped by
    site_name (string, no FK) so we clean those up explicitly. site_members
    cascades from sites.id via FK. audit_log rows are NOT deleted — they
    persist as a historical record even after the site row is gone.
    """
    site = _site_or_404(db, site_id)

    if site.name.lower() in UNDELETABLE_SITES:
        raise HTTPException(status_code=403, detail=f"The '{site.name}' site cannot be deleted.")

    if confirm != site.name:
        raise HTTPException(
            status_code=400,
            detail="Confirmation string does not match the site name. Pass ?confirm=<exact site name>.",
        )

    # Capture counts before destruction for the audit record
    instr_count = db.query(func.count(Instrument.id)).filter(Instrument.created_by == site.name).scalar() or 0
    member_count = db.query(func.count(SiteMember.id)).filter(SiteMember.site_id == site.id).scalar() or 0

    # Write the audit row first so it persists even though the site row is about
    # to vanish. site_id on audit_log is untyped (no FK), so this is safe.
    _audit(db, actor, site.id, "superadmin_delete_site",
           {"before": {
               "name": site.name,
               "instrument_count": instr_count,
               "member_count": member_count,
           }})
    db.flush()

    # Delete instruments scoped by site name — CalibrationRecord, CalTestPoint,
    # CalibrationQueue, and DocumentInstrument all cascade from instrument.id
    # via ondelete="CASCADE".
    db.query(Instrument).filter(Instrument.created_by == site.name).delete(synchronize_session=False)

    # Documents and queue rows are scoped by site_name (string, no FK) — clean
    # up explicitly. Queue rows without a matching instrument have already gone
    # via the cascade above; this catches any orphans scoped only by name.
    db.query(Document).filter(Document.site_name == site.name).delete(synchronize_session=False)
    db.query(CalibrationQueue).filter(CalibrationQueue.site_name == site.name).delete(synchronize_session=False)

    # Delete the site row — SiteMember cascades via FK.
    db.delete(site)
    db.commit()

    return {"deleted": True, "site_id": site_id, "name": site.name}
