"""
Admin routes for pilot request approval / denial.
These endpoints are hit by clicking links in the notification email — no user
session required, but the token acts as a one-time secret.

GET /api/admin/pilot/approve?token=<uuid>  → creates account, sends welcome email
GET /api/admin/pilot/deny?token=<uuid>     → marks request denied, sends denial email
"""
from __future__ import annotations

import json
import logging
import os
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])

SUPABASE_URL             = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
APP_URL                  = os.getenv("APP_URL", "https://calcheq.com")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _supabase_admin_headers() -> dict:
    return {
        "apikey":        SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type":  "application/json",
    }


def _create_supabase_user(email: str, password: str, display_name: str, site_name: str) -> str | None:
    """
    Creates a Supabase auth user via the Admin API (service role).
    Returns the new user's UUID, or None on failure.
    email_confirm=True so they can sign in immediately without clicking a confirmation link.
    """
    if not SUPABASE_SERVICE_ROLE_KEY or not SUPABASE_URL:
        logger.error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not configured — cannot create user")
        return None

    url     = f"{SUPABASE_URL}/auth/v1/admin/users"
    payload = json.dumps({
        "email":         email,
        "password":      password,
        "email_confirm": True,
        "user_metadata": {
            "display_name": display_name,
            "site_name":    site_name,
        },
    }).encode()

    req = urllib.request.Request(url, data=payload, headers=_supabase_admin_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("id")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")
        logger.error("Supabase admin user create failed %s: %s", exc.code, body)
        return None
    except Exception as exc:
        logger.error("Supabase admin user create error: %s", exc)
        return None


def _generate_password(first_name: str, last_name: str) -> str:
    """
    Generates the initial password as FirstnameLastname (capitalised, no spaces).
    Simple enough for a human to type, clear enough to communicate the pattern.
    """
    return first_name.strip().capitalize() + last_name.strip().capitalize()


def _html_page(title: str, heading: str, body: str, colour: str = "#16a34a") -> HTMLResponse:
    """Returns a simple branded HTML response page."""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — CalCheq</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f8fafc; margin: 0; padding: 0; display: flex;
           align-items: center; justify-content: center; min-height: 100vh; }}
    .card {{ background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
             padding: 48px; max-width: 480px; width: 100%; text-align: center; }}
    .logo {{ color: #0B1F3A; font-size: 22px; font-weight: 700; margin-bottom: 32px; }}
    .icon {{ font-size: 48px; margin-bottom: 16px; }}
    h1 {{ color: #0B1F3A; font-size: 22px; margin: 0 0 12px; }}
    p {{ color: #475569; line-height: 1.6; margin: 0 0 16px; }}
    .badge {{ display: inline-block; background: {colour}22; color: {colour};
              border: 1px solid {colour}44; border-radius: 9999px;
              padding: 4px 14px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }}
    a.btn {{ display: inline-block; background: #0B1F3A; color: white;
             padding: 12px 28px; border-radius: 8px; text-decoration: none;
             font-weight: 600; font-size: 14px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">CalCheq</div>
    {body}
    <a class="btn" href="{APP_URL}">Go to calcheq.com</a>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html)


def _send_welcome_email(email: str, display_name: str, password: str, company: str) -> None:
    from notifications import _send

    first_name = display_name.split()[0] if display_name else "there"

    html = f"""
<div style="font-family:sans-serif;font-size:14px;color:#1e293b;max-width:520px">
  <div style="background:#0B1F3A;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:white;font-size:20px;font-weight:700;margin:0">CalCheq</p>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <h2 style="color:#0B1F3A;margin-top:0">Welcome to CalCheq, {first_name}! 🎉</h2>
    <p style="color:#475569">
      Your 30-day pilot for <strong>{company}</strong> is now active.
      Here are your sign-in details:
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#1e40af;font-weight:600;white-space:nowrap">Sign-in URL:</td>
          <td><a href="{APP_URL}/auth/signin" style="color:#2563eb">{APP_URL}/auth/signin</a></td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#1e40af;font-weight:600">Company name:</td>
          <td style="color:#1e293b">{company}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#1e40af;font-weight:600">Username:</td>
          <td style="color:#1e293b">{email}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#1e40af;font-weight:600">Password:</td>
          <td style="color:#1e293b;font-family:monospace;font-size:15px">{password}</td>
        </tr>
      </table>
    </div>

    <p style="color:#64748b;font-size:13px">
      We recommend changing your password after your first sign-in via Settings → Profile.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
      <p style="margin:0 0 8px;font-weight:600;color:#15803d">Getting started:</p>
      <p style="margin:0;color:#166534;line-height:1.7">
        Once signed in, please visit the <strong>Support</strong> tab for how-to tutorials on all features.
        If you need a hand at any stage, get in touch with us at
        <a href="mailto:info@calcheq.com" style="color:#15803d">info@calcheq.com</a>
        and we'll help you get set up.
      </p>
    </div>

    <p style="color:#475569">
      Your pilot runs for <strong>30 days</strong> from today.
      If you decide CalCheq is right for you, you can subscribe any time from the Settings page — no data is lost.
    </p>

    <p style="color:#94a3b8;font-size:12px;margin-top:24px">
      CalCheq · ABN 19 731 880 044 · calcheq.com
    </p>
  </div>
</div>
"""
    _send(
        to=email,
        subject=f"Your CalCheq pilot is ready — sign in now",
        html=html,
    )


def _send_denial_email(email: str, first_name: str) -> None:
    from notifications import _send

    html = f"""
<div style="font-family:sans-serif;font-size:14px;color:#1e293b;max-width:520px">
  <div style="background:#0B1F3A;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:white;font-size:20px;font-weight:700;margin:0">CalCheq</p>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <h2 style="color:#0B1F3A;margin-top:0">Thanks for your interest, {first_name}</h2>
    <p style="color:#475569">
      Unfortunately we're unable to set up a pilot for your account at this time.
    </p>
    <p style="color:#475569">
      If you believe this is in error or would like to discuss further,
      please reply to this email or contact us at
      <a href="mailto:info@calcheq.com" style="color:#2563eb">info@calcheq.com</a>.
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">
      CalCheq · ABN 19 731 880 044 · calcheq.com
    </p>
  </div>
</div>
"""
    _send(
        to=email,
        subject="Regarding your CalCheq pilot request",
        html=html,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/pilot/approve", response_class=HTMLResponse)
def approve_pilot(token: str, db: Session = Depends(get_db)):
    """
    One-click pilot approval. Called when the CalCheq team clicks 'Approve Pilot'
    in the notification email.

    Steps:
    1. Look up the pilot request by token.
    2. Guard against double-processing.
    3. Create a Supabase user (email_confirm=True).
    4. Create a Site + SiteMember row.
    5. Set subscription_status='trialing', trial_ends_at=now+30days.
    6. Send a welcome email with credentials.
    7. Mark request approved.
    """
    from models import PilotRequest, Site, SiteMember

    pilot = db.query(PilotRequest).filter(PilotRequest.token == token).first()

    if not pilot:
        return _html_page(
            "Invalid Link", "Invalid Link", """
            <div class="icon">⚠️</div>
            <h1>Link Not Found</h1>
            <p>This approval link is invalid or has already expired.</p>
            """,
            colour="#dc2626",
        )

    if pilot.status == "approved":
        return _html_page(
            "Already Approved", "Already Approved", f"""
            <div class="icon">✅</div>
            <h1>Already Approved</h1>
            <p>The pilot for <strong>{pilot.first_name} {pilot.last_name}</strong>
            ({pilot.company}) was already approved.</p>
            """,
        )

    if pilot.status == "denied":
        return _html_page(
            "Request Denied", "Request Denied", f"""
            <div class="icon">❌</div>
            <h1>Request Was Denied</h1>
            <p>This pilot request was previously denied.
            Contact info@calcheq.com if you need to reverse this.</p>
            """,
            colour="#dc2626",
        )

    display_name = f"{pilot.first_name.strip()} {pilot.last_name.strip()}"
    password     = _generate_password(pilot.first_name, pilot.last_name)
    company      = pilot.company.strip()

    # Check if a site with this name already exists
    existing_site = db.query(Site).filter(Site.name == company).first()
    if existing_site:
        # Site name taken — append " (Pilot)" to disambiguate
        company = f"{company} (Pilot)"

    # Create Supabase user
    user_id = _create_supabase_user(
        email        = pilot.email,
        password     = password,
        display_name = display_name,
        site_name    = company,
    )

    if not user_id:
        return _html_page(
            "Error", "Account Creation Failed", f"""
            <div class="icon">⚠️</div>
            <h1>Account Creation Failed</h1>
            <p>Could not create the Supabase user for <strong>{pilot.email}</strong>.
            Check Railway logs for details — the user may already exist.</p>
            <p>You can create the account manually in the Supabase dashboard, then
            update this pilot request status to 'approved' directly in the database.</p>
            """,
            colour="#dc2626",
        )

    # Create site
    trial_ends = datetime.now(tz=timezone.utc) + timedelta(days=30)
    site = Site(
        name                = company,
        subscription_status = "trialing",
        subscription_plan   = "professional",
        trial_ends_at       = trial_ends,
    )
    db.add(site)
    db.flush()  # get site.id before committing

    # Create site member (admin role — first user on the site)
    member = SiteMember(
        site_id      = site.id,
        user_id      = user_id,
        role         = "admin",
        display_name = display_name,
        email        = pilot.email.lower(),
    )
    db.add(member)

    # Mark pilot approved
    pilot.status      = "approved"
    pilot.actioned_at = datetime.now(tz=timezone.utc)

    db.commit()

    # Send welcome email
    try:
        _send_welcome_email(
            email        = pilot.email,
            display_name = display_name,
            password     = password,
            company      = company,
        )
    except Exception as exc:
        logger.error("Failed to send welcome email to %s: %s", pilot.email, exc)

    logger.info(
        "Pilot approved: %s <%s> → site=%s user_id=%s trial_ends=%s",
        display_name, pilot.email, company, user_id, trial_ends.date(),
    )

    return _html_page(
        "Pilot Approved", "Pilot Approved", f"""
        <div class="icon">✅</div>
        <h1>Pilot Approved!</h1>
        <div class="badge">30-day trial active</div>
        <p><strong>{display_name}</strong> ({pilot.email}) has been set up with a 30-day pilot.</p>
        <p>Site name: <strong>{company}</strong><br>
           Trial expires: <strong>{trial_ends.strftime("%-d %B %Y")}</strong></p>
        <p>A welcome email with their login credentials has been sent.</p>
        """,
    )


@router.get("/pilot/deny", response_class=HTMLResponse)
def deny_pilot(token: str, db: Session = Depends(get_db)):
    """
    One-click pilot denial. Called when the CalCheq team clicks 'Deny Pilot'
    in the notification email.
    """
    from models import PilotRequest

    pilot = db.query(PilotRequest).filter(PilotRequest.token == token).first()

    if not pilot:
        return _html_page(
            "Invalid Link", "Invalid Link", """
            <div class="icon">⚠️</div>
            <h1>Link Not Found</h1>
            <p>This denial link is invalid or has already been used.</p>
            """,
            colour="#dc2626",
        )

    if pilot.status in ("approved", "denied"):
        past_tense = "approved" if pilot.status == "approved" else "already denied"
        return _html_page(
            "Already Actioned", "Already Actioned", f"""
            <div class="icon">ℹ️</div>
            <h1>Already Actioned</h1>
            <p>This request for <strong>{pilot.first_name} {pilot.last_name}</strong>
            has already been {past_tense}.</p>
            """,
            colour="#64748b",
        )

    pilot.status      = "denied"
    pilot.actioned_at = datetime.now(tz=timezone.utc)
    db.commit()

    try:
        _send_denial_email(email=pilot.email, first_name=pilot.first_name)
    except Exception as exc:
        logger.error("Failed to send denial email to %s: %s", pilot.email, exc)

    logger.info("Pilot denied: %s <%s> (%s)", f"{pilot.first_name} {pilot.last_name}", pilot.email, pilot.company)

    return _html_page(
        "Request Denied", "Request Denied", f"""
        <div class="icon">❌</div>
        <h1>Pilot Request Denied</h1>
        <p>The request from <strong>{pilot.first_name} {pilot.last_name}</strong>
        ({pilot.company}) has been marked as denied.</p>
        <p>A notification email has been sent to {pilot.email}.</p>
        """,
        colour="#dc2626",
    )
