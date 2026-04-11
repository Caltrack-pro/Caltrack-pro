"""
Auth routes
============
GET  /api/auth/check-site   check if a site name exists (public — used in sign-in step 1)
POST /api/auth/register     create a new site for a first-time user (reads JWT user_metadata)
GET  /api/auth/me           return the current user's site + role (requires auth)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from auth import UserContext, get_current_user, get_jwt_claims, get_optional_user
from database import get_db
from models import Site, SiteMember
from fastapi import Request

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
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user's site membership and role.
    Also back-fills the email column on site_members if not yet stored.
    """
    # Back-fill email for existing members who don't have it stored yet
    if current_user.email:
        member = db.query(SiteMember).filter(SiteMember.user_id == current_user.user_id).first()
        if member and not member.email:
            member.email = current_user.email
            db.commit()

    return {
        "user_id":      current_user.user_id,
        "email":        current_user.email,
        "site_name":    current_user.site_name,
        "role":         current_user.role,
        "display_name": current_user.display_name,
    }
