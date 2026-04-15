"""
Authentication helpers for Calcheq.
Validates Supabase-issued JWTs and provides FastAPI dependency functions.

Supabase now signs JWTs with an asymmetric ECC P-256 key (ES256).
Verification is done by fetching the public JWKS from:
  {SUPABASE_URL}/auth/v1/.well-known/jwks.json

The JWKS is cached in memory for 1 hour to avoid a network call on every request.

If SUPABASE_URL is not set, falls back to symmetric HS256 verification using
SUPABASE_JWT_SECRET (legacy — kept for local dev compatibility).

Dependencies available for use in route handlers:
  get_jwt_claims(request)          → raw JWT payload dict (no DB, use for /register)
  get_optional_user(request, db)   → UserContext | None
  get_current_user(request, db)    → UserContext  (raises 401 if not authenticated)
  resolve_site(site, current_user) → site name string (raises 401 if not resolvable)
  assert_writable_site(user, ...)  → raises 403 if site is Demo
"""
from __future__ import annotations

import json
import logging
import os
import time
import urllib.request
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, HTTPException, Query, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models import Site, SiteMember

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SUPABASE_URL        = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")   # legacy HS256 fallback
_AUDIENCE           = "authenticated"

DEMO_SITE = "Demo"

# ---------------------------------------------------------------------------
# JWKS cache — fetched once per hour from Supabase's public endpoint
# ---------------------------------------------------------------------------

_jwks_cache:      Optional[dict] = None
_jwks_fetched_at: float          = 0.0
_JWKS_TTL         = 3600  # seconds


def _fetch_jwks() -> dict:
    url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:  # noqa: S310
            return json.loads(resp.read())
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch JWKS from {url}: {exc}") from exc


def _get_jwks() -> dict:
    global _jwks_cache, _jwks_fetched_at
    now = time.monotonic()
    if _jwks_cache is None or (now - _jwks_fetched_at) > _JWKS_TTL:
        _jwks_cache     = _fetch_jwks()
        _jwks_fetched_at = now
    return _jwks_cache


# ---------------------------------------------------------------------------
# Data transfer object — user context derived from JWT + DB
# ---------------------------------------------------------------------------

@dataclass
class UserContext:
    user_id:      str
    email:        str
    site_id:      str
    site_name:    str
    role:         str
    display_name: Optional[str] = None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _extract_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        return token or None
    return None


def _decode_jwt(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT.

    Strategy (in order):
      1. JWKS / asymmetric (ES256, RS256) — used when SUPABASE_URL is set.
         Fetches public keys from Supabase's /.well-known/jwks.json endpoint.
      2. Symmetric HS256 — fallback when SUPABASE_JWT_SECRET is set (legacy).
    """
    # ── Strategy 1: JWKS (asymmetric) ──────────────────────────────────────
    if SUPABASE_URL:
        try:
            jwks = _get_jwks()

            # Read the JWT header to find which key to use
            header = jwt.get_unverified_header(token)
            kid    = header.get("kid")
            alg    = header.get("alg", "ES256")

            # Match by kid; fall back to first key if kid is absent
            key_data = next(
                (k for k in jwks.get("keys", []) if k.get("kid") == kid),
                jwks["keys"][0] if jwks.get("keys") else None,
            )

            if key_data is None:
                raise HTTPException(status_code=401, detail="No matching JWT signing key found")

            return jwt.decode(token, key_data, algorithms=[alg], audience=_AUDIENCE)

        except HTTPException:
            raise
        except JWTError as exc:
            raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}") from exc
        except Exception as exc:
            # JWKS fetch failed — log and fall through to HS256 fallback
            logger.warning("JWKS verification failed, trying HS256 fallback: %s", exc)

    # ── Strategy 2: HS256 shared secret (legacy / local dev) ───────────────
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Server auth is not configured (set SUPABASE_URL or SUPABASE_JWT_SECRET)",
        )
    try:
        return jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience=_AUDIENCE)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}") from exc


# ---------------------------------------------------------------------------
# Public dependency functions
# ---------------------------------------------------------------------------

def get_jwt_claims(request: Request) -> dict:
    """
    Decode the Bearer JWT and return its raw claims dict.
    Does NOT perform a DB lookup — use this for the /register endpoint
    where the user has no site membership yet.
    Raises 401 if no token or token is invalid.
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    return _decode_jwt(token)


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[UserContext]:
    """
    Decode JWT + look up site membership.
    Returns None (no exception) if:
      - no token present
      - token invalid
      - user has no site membership
    """
    token = _extract_token(request)
    if not token:
        return None

    try:
        payload = _decode_jwt(token)
    except HTTPException:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    member = db.query(SiteMember).filter(SiteMember.user_id == user_id).first()
    if not member:
        return None

    site = db.query(Site).filter(Site.id == member.site_id).first()
    if not site:
        return None

    return UserContext(
        user_id=user_id,
        email=payload.get("email", ""),
        site_id=str(member.site_id),
        site_name=site.name,
        role=member.role,
        display_name=member.display_name,
    )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserContext:
    """Like get_optional_user but raises 401 if the user is not authenticated."""
    user = get_optional_user(request, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def resolve_site(
    site: Optional[str] = Query(None, description="Pass 'Demo' to view the public demo site"),
    current_user: Optional[UserContext] = Depends(get_optional_user),
) -> str:
    """
    Determines which site's data to query.

    Rules (in order):
      1. ?site=Demo  → always allowed; returns "Demo"
      2. JWT present → returns the user's own site (ignores ?site= unless Demo)
      3. Neither     → 401 Authentication required
    """
    if site == DEMO_SITE:
        return DEMO_SITE
    if current_user:
        return current_user.site_name
    raise HTTPException(status_code=401, detail="Authentication required")


# ---------------------------------------------------------------------------
# Per-resource ownership check helpers (used inside route handlers)
# ---------------------------------------------------------------------------

def check_instrument_access(created_by: Optional[str], current_user: Optional[UserContext]) -> None:
    """
    Raise 401/403 if the current user cannot access an instrument with the given created_by value.
    Demo instruments are always readable (no auth required).
    """
    if created_by == DEMO_SITE:
        return  # Demo is public (reads only — writes are blocked by assert_writable_site)
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    if created_by != current_user.site_name:
        raise HTTPException(status_code=403, detail="Access denied")


def assert_active_subscription(
    current_user: UserContext,
    db: "Session",
) -> None:
    """
    Raise 402 if the site's subscription is not active or trialing.
    Demo site is always allowed (it's read-only, so this check is moot).
    Call in write routes that should be gated behind a paid subscription.
    """
    if current_user.site_name == DEMO_SITE:
        return  # Demo is handled by assert_writable_site

    from models import Site
    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    allowed = {"active", "trialing"}
    if site.subscription_status not in allowed:
        raise HTTPException(
            status_code=402,
            detail="Your subscription is inactive. Please update your billing to continue.",
        )


def assert_writable_site(
    current_user: UserContext,
    created_by: Optional[str] = None,
) -> None:
    """
    Raise 403 if the operation would write to the Demo site.
    Call at the top of every create/update/delete/import route handler.
      - current_user.site_name == Demo → the signed-in user IS the demo account
      - created_by == Demo             → the target resource belongs to the Demo site
    """
    if current_user.site_name == DEMO_SITE:
        raise HTTPException(
            status_code=403,
            detail="The Demo site is read-only. Sign up for your own account to save changes.",
        )
    if created_by is not None and created_by == DEMO_SITE:
        raise HTTPException(
            status_code=403,
            detail="The Demo site is read-only.",
        )
