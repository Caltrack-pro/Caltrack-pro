"""
Authentication helpers for CalCheq.
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

from uuid import UUID

from fastapi import Depends, HTTPException, Query, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import SessionLocal, get_db
from models import Site, SiteMember

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SUPABASE_URL        = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")   # legacy HS256 fallback
_AUDIENCE           = "authenticated"

DEMO_SITE = "Demo"

# Header used by the frontend platform-admin banner to scope a session into a
# different site. Only honoured when the caller's email is in SUPERADMIN_EMAILS
# — otherwise we 403. Read by get_optional_user, applied uniformly so every
# authenticated route automatically sees the impersonated site_id/site_name.
IMPERSONATION_HEADER = "X-Impersonate-Site-Id"

# HTTP methods that produce audit-log rows when issued under an impersonation
# header. GETs are excluded — too noisy, no forensic benefit. Session start/end
# are recorded by dedicated /api/superadmin/sites/{id}/impersonate-* endpoints.
_AUDITED_IMPERSONATION_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


def _parse_superadmin_emails() -> frozenset[str]:
    """
    Parse the SUPERADMIN_EMAILS env var into a frozenset of normalised emails
    (lower-cased, whitespace-trimmed). Evaluated at import time — to change the
    allow-list, restart the server.
    """
    raw = os.getenv("SUPERADMIN_EMAILS", "")
    return frozenset(
        part.strip().lower()
        for part in raw.split(",")
        if part.strip()
    )


SUPERADMIN_EMAILS: frozenset[str] = _parse_superadmin_emails()

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

    # Platform-operator privilege. Sourced from the SUPERADMIN_EMAILS env var
    # allow-list, never from a DB column. When impersonating (Phase 3), this is
    # deliberately flipped to False on the returned context so the super-admin
    # sees what the customer sees — subscription gates, demo write-blocks, etc.
    # The real identity is preserved in real_user_id / real_email for audit.
    is_superadmin:     bool           = False
    is_impersonating:  bool           = False
    real_user_id:      Optional[str]  = None
    real_email:        Optional[str]  = None


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


def _apply_impersonation(
    user:    Optional[UserContext],
    request: Request,
    db:      Session,
) -> Optional[UserContext]:
    """
    If the request carries the X-Impersonate-Site-Id header, rewrite the user
    context so downstream code sees the impersonated site.

    Rules:
      - No header                             → return user unchanged
      - Header + no auth                      → ignore (upstream will 401)
      - Header + caller is not super-admin    → 403 (never a legitimate request)
      - Header + caller IS super-admin        → rewrite context:
          * site_id / site_name  → target site
          * role                 → 'admin' (full role, so admin-only UIs work)
          * is_superadmin        → False  (so subscription/demo gates still fire)
          * is_impersonating     → True
          * real_user_id / email → preserved for audit attribution
    """
    header = request.headers.get(IMPERSONATION_HEADER)
    if not header:
        return user
    if user is None:
        return None
    if not user.is_superadmin:
        raise HTTPException(status_code=403, detail="Impersonation is not permitted.")

    try:
        target_id = UUID(header)
    except (ValueError, AttributeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid X-Impersonate-Site-Id header") from exc

    target = db.query(Site).filter(Site.id == target_id).first()
    if target is None:
        raise HTTPException(status_code=404, detail="Impersonation target site not found")

    return UserContext(
        user_id=user.user_id,
        email=user.email,
        site_id=str(target.id),
        site_name=target.name,
        role="admin",
        display_name=user.display_name,
        is_superadmin=False,
        is_impersonating=True,
        real_user_id=user.user_id,
        real_email=user.email,
    )


def _audit_impersonated_request(user: UserContext, request: Request) -> None:
    """
    Write an audit_log row recording the super-admin's action while
    impersonating. Uses a short-lived session so the row is committed even if
    the surrounding route later rolls back (e.g. a 403 from assert_writable_site
    on Demo) — we still want the attempt on record. Never raises.
    """
    # Late import to avoid circular (models <- database <- auth)
    from models import AuditLog  # noqa: WPS433

    session = SessionLocal()
    try:
        try:
            site_uuid = UUID(str(user.site_id))
        except (ValueError, TypeError):
            return
        entry = AuditLog(
            site_id=site_uuid,
            entity_type="site",
            entity_id=site_uuid,
            user_id=user.real_user_id or user.user_id,
            user_name=user.real_email or user.email or user.user_id,
            action="impersonation_write",
            changed_fields={
                "method": request.method,
                "path":   request.url.path,
            },
        )
        session.add(entry)
        session.commit()
    except Exception as exc:
        logger.warning("Impersonation audit write failed: %s", exc)
        try:
            session.rollback()
        except Exception:
            pass
    finally:
        session.close()


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

    email = payload.get("email", "") or ""
    user = UserContext(
        user_id=user_id,
        email=email,
        site_id=str(member.site_id),
        site_name=site.name,
        role=member.role,
        display_name=member.display_name,
        is_superadmin=email.strip().lower() in SUPERADMIN_EMAILS,
    )
    # Apply platform-admin impersonation header if present. Raises 403 if the
    # header is on a request from a non-super-admin, so this cannot be abused
    # by regular customers to escalate into other sites.
    return _apply_impersonation(user, request, db)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserContext:
    """Like get_optional_user but raises 401 if the user is not authenticated."""
    user = get_optional_user(request, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Record every write issued under an active impersonation. Uses an
    # independent session so the row sticks even if the surrounding route
    # raises (e.g. 403 from assert_writable_site on Demo — we still want
    # the attempt logged).
    if user.is_impersonating and request.method in _AUDITED_IMPERSONATION_METHODS:
        _audit_impersonated_request(user, request)

    return user


def get_real_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserContext:
    """
    Like get_current_user but never applies the X-Impersonate-Site-Id header.
    Use on endpoints where the frontend needs the super-admin's *real* identity
    even during an impersonation session (the /api/auth/me endpoint in
    particular — it drives the sidebar/avatar/is_superadmin flag, which must
    continue to reflect the real user so Exit always works).
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = _decode_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    member = db.query(SiteMember).filter(SiteMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=401, detail="Authentication required")
    site = db.query(Site).filter(Site.id == member.site_id).first()
    if not site:
        raise HTTPException(status_code=401, detail="Authentication required")

    email = payload.get("email", "") or ""
    return UserContext(
        user_id=user_id,
        email=email,
        site_id=str(member.site_id),
        site_name=site.name,
        role=member.role,
        display_name=member.display_name,
        is_superadmin=email.strip().lower() in SUPERADMIN_EMAILS,
    )


def get_superadmin_user(
    current_user: UserContext = Depends(get_real_user),
) -> UserContext:
    """
    Dependency that enforces platform-operator privilege. Use on every
    /api/superadmin/* route.

    Depends on get_real_user (not get_current_user) — super-admin routes
    operate at the platform level and must not be scoped by an impersonation
    header, so e.g. /impersonate-end still works even if the caller's session
    somehow still carries the header.

    Raises 403 with a generic message if the caller's email is not in
    SUPERADMIN_EMAILS — the endpoint's existence is not confirmed to
    unauthorised callers (same reasoning as the /app/admin route rendering
    404 rather than a friendly redirect).
    """
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not found")
    return current_user


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

    Also auto-expires trials: if subscription_status == 'trialing' and
    trial_ends_at is in the past, the status is updated to 'cancelled' and
    a 402 is raised so the user is redirected to billing.

    Call in write routes that should be gated behind a paid subscription.

    Platform operators (super-admins) bypass this check entirely — their
    accounts are working accounts, not billed customer accounts. When a
    super-admin impersonates a customer, `is_superadmin` is deliberately
    flipped to False on the impersonated context so this gate still fires
    and they see the 402 their real customer would see.
    """
    if current_user.is_superadmin:
        return
    if current_user.site_name == DEMO_SITE:
        return  # Demo is handled by assert_writable_site

    from datetime import datetime, timezone
    from models import Site

    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Auto-expire trialing sites whose trial period has ended
    if (
        site.subscription_status == "trialing"
        and site.trial_ends_at is not None
        and site.trial_ends_at < datetime.now(tz=timezone.utc)
    ):
        site.subscription_status = "cancelled"
        db.commit()
        raise HTTPException(
            status_code=402,
            detail="Your free trial has expired. Please choose a plan to continue.",
        )

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
