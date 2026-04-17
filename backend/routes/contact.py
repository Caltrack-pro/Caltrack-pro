"""
Public contact / pilot-request endpoint.
No authentication required — this is for inbound leads from the marketing site.
"""
from __future__ import annotations

import logging
import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

NOTIFY_EMAIL = os.getenv("CONTACT_NOTIFY_EMAIL", os.getenv("RESEND_FROM_EMAIL", "info@calcheq.com"))
APP_URL      = os.getenv("APP_URL", "https://calcheq.com")


class ContactRequest(BaseModel):
    firstName:       str
    lastName:        str
    company:         str
    location:        str
    role:            str
    email:           EmailStr
    phone:           str
    numInstruments:  str
    currentSystem:   str
    message:         str = ""


@router.post("/api/contact", status_code=200)
def submit_contact(data: ContactRequest, db: Session = Depends(get_db)):
    """
    Receives the marketing site pilot-request form.
    1. Saves the request to pilot_requests table (generates a unique approval token).
    2. Sends a notification email to the CalCheq team with Approve / Deny links.
    3. Sends a confirmation email to the person who submitted the form.
    Always returns 200 so the frontend shows a success message even if email fails.
    """
    from models import PilotRequest

    # Persist the request so we have it even if email fails
    pilot = PilotRequest(
        first_name      = data.firstName,
        last_name       = data.lastName,
        company         = data.company,
        location        = data.location,
        role            = data.role,
        email           = data.email.lower(),
        phone           = data.phone,
        num_instruments = data.numInstruments,
        current_system  = data.currentSystem,
        message         = data.message,
    )
    db.add(pilot)
    db.commit()
    db.refresh(pilot)

    sent = _send_lead_notification(data, str(pilot.token))
    if not sent:
        logger.error(
            "CONTACT FORM: email NOT sent for %s <%s> from %s — check RESEND_API_KEY and CONTACT_NOTIFY_EMAIL",
            f"{data.firstName} {data.lastName}", data.email, data.company
        )
    _send_confirmation_to_lead(data)
    return {"ok": True}


# ---------------------------------------------------------------------------

def _send_lead_notification(data: ContactRequest, token: str) -> bool:
    from notifications import _send  # reuse shared Resend helper

    role_labels = {
        "instrumentation_supervisor": "Instrumentation Supervisor",
        "maintenance_planner":        "Maintenance Planner",
        "site_manager":               "Site Manager",
        "instrument_technician":      "Instrument Technician",
        "other":                      "Other",
    }
    system_labels = {
        "excel":      "Excel / Spreadsheet",
        "mex":        "MEX",
        "sap":        "SAP",
        "maximo":     "Maximo",
        "other_cmms": "Other CMMS",
        "none":       "None",
    }
    inst_labels = {
        "under_50": "Under 50",
        "50_150":   "50–150",
        "150_500":  "150–500",
        "500_plus": "500+",
    }

    role    = role_labels.get(data.role, data.role)
    system  = system_labels.get(data.currentSystem, data.currentSystem)
    instr   = inst_labels.get(data.numInstruments, data.numInstruments)
    msg_row = f"<tr><td style='padding:4px 12px 4px 0;color:#64748b'>Message:</td><td>{data.message}</td></tr>" if data.message else ""

    approve_url = f"{APP_URL}/api/admin/pilot/approve?token={token}"
    deny_url    = f"{APP_URL}/api/admin/pilot/deny?token={token}"

    html = f"""
<div style="font-family:sans-serif;font-size:14px;color:#1e293b;max-width:560px">
  <h2 style="color:#0B1F3A;margin-bottom:4px">🚀 New Pilot Request</h2>
  <p style="color:#64748b;margin-top:0">Someone submitted the CalCheq free-trial form.</p>

  <table style="border-collapse:collapse;width:100%;margin-top:16px">
    <tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap">Name:</td>
        <td><strong>{data.firstName} {data.lastName}</strong></td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Company:</td>
        <td>{data.company}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Location:</td>
        <td>{data.location}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Role:</td>
        <td>{role}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Email:</td>
        <td><a href="mailto:{data.email}">{data.email}</a></td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Phone:</td>
        <td>{data.phone}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Instruments:</td>
        <td>{instr}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b">Current system:</td>
        <td>{system}</td></tr>
    {msg_row}
  </table>

  <div style="margin-top:28px;padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
    <p style="margin:0 0 16px;font-weight:600;color:#0B1F3A">Action this pilot request:</p>
    <div style="display:flex;gap:12px">
      <a href="{approve_url}"
         style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">
        ✅ Approve Pilot
      </a>
      <a href="{deny_url}"
         style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;margin-left:12px">
        ❌ Deny Pilot
      </a>
    </div>
    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8">
      Approving will create a Supabase account for {data.email}, spin up their site, and send them login credentials.
      The 30-day pilot clock starts on approval.
    </p>
  </div>
</div>
"""

    sent = _send(
        to=NOTIFY_EMAIL,
        subject=f"[CalCheq] New pilot request — {data.firstName} {data.lastName} ({data.company})",
        html=html,
    )
    logger.info("Contact notification sent=%s for %s at %s", sent, data.email, data.company)
    return sent


def _send_confirmation_to_lead(data: ContactRequest) -> None:
    """Send a brief confirmation email to the person who submitted the form."""
    from notifications import _send

    html = f"""
<div style="font-family:sans-serif;font-size:14px;color:#1e293b;max-width:520px">
  <div style="background:#0B1F3A;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:white;font-size:20px;font-weight:700;margin:0">CalCheq</p>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <h2 style="color:#0B1F3A;margin-top:0">Thanks, {data.firstName} — we've received your request.</h2>
    <p style="color:#475569">
      We'll be in touch within 2 business hours to get your 30-day pilot set up.
      In the meantime, you can explore the live demo at
      <a href="{APP_URL}/app" style="color:#2563eb">{APP_URL}/app</a> — no sign-up needed.
    </p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0">
      <p style="margin:0 0 8px;font-weight:600;color:#1e40af">Your pilot includes:</p>
      <ul style="margin:0;padding-left:20px;color:#1e40af;line-height:1.8">
        <li>500 instruments managed — full Professional plan</li>
        <li>Personal onboarding and setup within 48 hours</li>
        <li>All compliance and reporting features</li>
        <li>No credit card required</li>
      </ul>
    </div>
    <p style="color:#475569">
      Questions in the meantime? Reply to this email or contact us at
      <a href="mailto:info@calcheq.com" style="color:#2563eb">info@calcheq.com</a>.
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">
      CalCheq · ABN 19 731 880 044 · calcheq.com
    </p>
  </div>
</div>
"""

    _send(
        to=data.email,
        subject="Your CalCheq pilot request — we'll be in touch shortly",
        html=html,
    )
