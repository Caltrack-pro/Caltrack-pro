"""
Public contact / pilot-request endpoint.
No authentication required — this is for inbound leads from the marketing site.
"""
from __future__ import annotations

import logging
import os
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

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
def submit_contact(data: ContactRequest):
    """
    Receives the marketing site pilot-request form and sends a notification email
    to the CalCheq team via Resend.  Always returns 200 so the frontend can show
    a success message even if the email provider is down.
    """
    _send_lead_notification(data)
    return {"ok": True}


# ---------------------------------------------------------------------------

def _send_lead_notification(data: ContactRequest) -> None:
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

    html = f"""
<div style="font-family:sans-serif;font-size:14px;color:#1e293b;max-width:520px">
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

  <p style="margin-top:24px">
    <a href="mailto:{data.email}?subject=Your CalCheq pilot is ready&body=Hi {data.firstName},"
       style="background:#F57C00;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
      Reply to {data.firstName} →
    </a>
  </p>
</div>
"""

    _send(
        to=NOTIFY_EMAIL,
        subject=f"[CalCheq] New pilot request — {data.firstName} {data.lastName} ({data.company})",
        html=html,
    )
    logger.info("Contact notification sent for %s at %s", data.email, data.company)
