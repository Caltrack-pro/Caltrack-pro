"""
Auth routes
============
GET  /api/auth/check-site   check if a site name exists (public — used in sign-in step 1)
POST /api/auth/register     create a new site for a first-time user (reads JWT user_metadata)
GET  /api/auth/me           return the current user's site + role (requires auth)
GET  /api/auth/members      list all members for the current site (admin/supervisor)
POST /api/auth/invite       invite a new member to the current site (admin only)
"""
from __future__ import annotations

import json
import logging
import os
import urllib.request
import urllib.error

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth import UserContext, get_current_user, get_jwt_claims, get_optional_user, get_real_user
from database import get_db
from models import Site, SiteMember
import notifications

logger = logging.getLogger(__name__)

SUPABASE_URL              = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# GET /api/auth/check-site
# ---------------------------------------------------------------------------

@router.get("/check-site")
def check_site(
    name: str = Query(..., description="Site/company name to validate"),
    db:   Session = Depends(get_db),
):
    """
    Public endpoint — returns whether a named site exists in the database.
    Used in the 2-step sign-in flow to validate the company name before
    asking for credentials.
    """
    exists = db.query(Site).filter(Site.name == name).first() is not None
    return {"exists": exists, "name": name}


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------

@router.post("/register", status_code=201)
def register(
    jwt_claims: dict    = Depends(get_jwt_claims),
    db:         Session = Depends(get_db),
):
    """
    Creates a site and an admin membership for a newly signed-up user.
    Should be called once after the user's first successful Supabase sign-in.

    Reads site_name and display_name from the JWT user_metadata field,
    which is populated via supabase.auth.signUp options.data:
      { site_name: "IXOM", display_name: "John Smith" }

    Idempotent — calling again returns the existing membership without error.
    """
    user_id       = jwt_claims["sub"]
    user_metadata = jwt_claims.get("user_metadata") or {}
    site_name     = (user_metadata.get("site_name") or "").strip()
    display_name  = (user_metadata.get("display_name") or "").strip() or None

    if not site_name:
        raise HTTPException(
            status_code=400,
            detail="site_name is required — pass it via supabase.auth.signUp options.data",
        )

    # Idempotent: return existing membership if already registered
    existing_member = db.query(SiteMember).filter(SiteMember.user_id == user_id).first()
    if existing_member:
        site = db.query(Site).filter(Site.id == existing_member.site_id).first()
        return {
            "site_name":  site.name if site else site_name,
            "role":       existing_member.role,
            "registered": False,
        }

    # Block registration if site name already belongs to another user
    if db.query(Site).filter(Site.name == site_name).first():
        raise HTTPException(
            status_code=409,
            detail=(
                f"A site named '{site_name}' already exists. "
                "If this is your company, contact your site admin to be added as a member."
            ),
        )

    # Create site + admin membership in one transaction
    site = Site(name=site_name)
    db.add(site)
    db.flush()  # populate site.id before creating the member

    member = SiteMember(
        site_id=site.id,
        user_id=user_id,
        role="admin",
        display_name=display_name,
        email=jwt_claims.get("email"),
    )
    db.add(member)
    db.commit()

    return {"site_name": site_name, "role": "admin", "registered": True}


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------

@router.get("/me")
def me(
    request: Request,
    current_user: UserContext = Depends(get_real_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user's site membership and role.

    Uses get_real_user (not get_current_user) so this endpoint always reports
    the super-admin's real identity even during an impersonation session —
    otherwise a page refresh during impersonation would silently rewrite the
    sidebar/avatar state and hide the 👑 nav entry. The impersonation is
    communicated to the user via ImpersonationBanner, which reads sessionStorage.
    """
    # Back-fill email for existing members who don't have it stored yet
    if current_user.email:
        member = db.query(SiteMember).filter(SiteMember.user_id == current_user.user_id).first()
        if member and not member.email:
            member.email = current_user.email
            db.commit()

    # Fetch subscription status for the frontend
    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    sub_status = site.subscription_status if site else None
    sub_plan   = site.subscription_plan   if site else None
    trial_end  = site.trial_ends_at.isoformat() if site and site.trial_ends_at else None

    return {
        "user_id":             current_user.user_id,
        "email":               current_user.email,
        "site_name":           current_user.site_name,
        "role":                current_user.role,
        "display_name":        current_user.display_name,
        "subscription_status": sub_status,
        "subscription_plan":   sub_plan,
        "trial_ends_at":       trial_end,
        "is_superadmin":       current_user.is_superadmin,
    }


# ---------------------------------------------------------------------------
# GET /api/auth/members
# ---------------------------------------------------------------------------

@router.get("/members")
def list_members(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all members of the current user's site.
    Accessible to admin and supervisor roles only.
    """
    if current_user.role not in ("admin", "supervisor"):
        raise HTTPException(status_code=403, detail="Admin or supervisor access required.")

    members = (
        db.query(SiteMember)
        .filter(SiteMember.site_id == current_user.site_id)
        .order_by(SiteMember.created_at)
        .all()
    )

    return [
        {
            "id":           str(m.id),
            "display_name": m.display_name,
            "email":        m.email,
            "role":         m.role,
            "created_at":   m.created_at.isoformat() if m.created_at else None,
        }
        for m in members
    ]


# ---------------------------------------------------------------------------
# POST /api/auth/invite
# ---------------------------------------------------------------------------

class InviteRequest(BaseModel):
    email: str
    display_name: str
    role: str
    temp_password: str


@router.post("/invite", status_code=201)
def invite_member(
    payload: InviteRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Invites a new user to the current site.
    Admin only. Creates a Supabase Auth user (via Admin API) then a site_members row.
    Sends a welcome email with login details via Resend.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required to invite members.")

    if current_user.site_name == "Demo":
        raise HTTPException(status_code=403, detail="Cannot invite members to the Demo site.")

    valid_roles = {"admin", "supervisor", "technician", "planner", "readonly"}
    if payload.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}")

    if len(payload.temp_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    # ── Create Supabase Auth user via Admin API ────────────────────────────
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=503,
            detail="Server is not configured for user creation. Contact your system administrator.",
        )

    admin_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    body = json.dumps({
        "email":         payload.email,
        "password":      payload.temp_password,
        "email_confirm": True,   # skip confirmation email — we send our own
        "user_metadata": {"display_name": payload.display_name, "site_name": current_user.site_name},
    }).encode()

    req = urllib.request.Request(
        admin_url,
        data=body,
        headers={
            "Content-Type":  "application/json",
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey":        SUPABASE_SERVICE_ROLE_KEY,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            user_data = json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        try:
            error_json = json.loads(error_body)
            msg = error_json.get("msg") or error_json.get("message") or error_body
        except Exception:
            msg = error_body
        if exc.code == 422:
            raise HTTPException(status_code=409, detail=f"A user with this email already exists.")
        raise HTTPException(status_code=502, detail=f"Failed to create user: {msg}")

    new_user_id = user_data.get("id")
    if not new_user_id:
        raise HTTPException(status_code=502, detail="Supabase did not return a user ID.")

    # ── Check this email isn't already a member of any site ───────────────
    existing = db.query(SiteMember).filter(SiteMember.user_id == new_user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="This user is already a member of a site.")

    # ── Create site_members row ────────────────────────────────────────────
    member = SiteMember(
        site_id=current_user.site_id,
        user_id=new_user_id,
        role=payload.role,
        display_name=payload.display_name,
        email=payload.email,
    )
    db.add(member)
    db.commit()

    # ── Send welcome email ─────────────────────────────────────────────────
    notifications.send_member_invite(
        to_email=payload.email,
        display_name=payload.display_name,
        site_name=current_user.site_name,
        invited_by=current_user.display_name or current_user.email or "your site administrator",
        temp_password=payload.temp_password,
    )

    return {
        "user_id":      new_user_id,
        "email":        payload.email,
        "display_name": payload.display_name,
        "role":         payload.role,
    }
