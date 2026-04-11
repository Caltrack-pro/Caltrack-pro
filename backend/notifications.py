"""
Email notification helpers for Calcheq.
Uses the Resend API (resend.com) for transactional email.

If RESEND_API_KEY is not set, all send calls are no-ops (logged only).
"""
from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

RESEND_API_KEY   = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL       = os.getenv("RESEND_FROM_EMAIL", "Calcheq <notifications@calcheq.com>")
APP_URL          = os.getenv("APP_URL", "https://calcheq.com")


def _send(to: str, subject: str, html: str) -> bool:
    """
    Send a single email via Resend. Returns True on success.
    Silently skips if RESEND_API_KEY is not configured.
    """
    if not RESEND_API_KEY:
        logger.debug("RESEND_API_KEY not set — skipping email to %s: %s", to, subject)
        return False
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from":    FROM_EMAIL,
            "to":      [to],
            "subject": subject,
            "html":    html,
        })
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as exc:
        logger.warning("Failed to send email to %s: %s", to, exc)
        return False


# ---------------------------------------------------------------------------
# Immediate notification triggers
# ---------------------------------------------------------------------------

def notify_submission(
    *,
    instrument_tag:  str,
    instrument_desc: Optional[str],
    technician_name: str,
    record_id:       str,
    supervisor_emails: list[str],
) -> None:
    """
    Called when a calibration record is submitted for approval.
    Sends to all supervisors/admins at the site.
    """
    if not supervisor_emails:
        return
    desc  = instrument_desc or instrument_tag
    url   = f"{APP_URL}/app/approvals"
    html  = f"""
<p>A calibration record has been submitted for your approval.</p>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Instrument:</td>
      <td><strong>{instrument_tag}</strong> — {desc}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Submitted by:</td>
      <td>{technician_name}</td></tr>
</table>
<p style="margin-top:16px">
  <a href="{url}" style="background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
    Review in Calcheq
  </a>
</p>
"""
    for email in supervisor_emails:
        _send(
            to=email,
            subject=f"[CalTrack] Calibration submitted for approval — {instrument_tag}",
            html=html,
        )


def notify_approved(
    *,
    instrument_tag:   str,
    instrument_desc:  Optional[str],
    approved_by:      str,
    record_id:        str,
    technician_email: Optional[str],
) -> None:
    """Called when a calibration record is approved. Sends to the submitting technician."""
    if not technician_email:
        return
    desc = instrument_desc or instrument_tag
    url  = f"{APP_URL}/app/instruments"
    html = f"""
<p>Your calibration record has been <strong style="color:#16a34a">approved</strong>.</p>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Instrument:</td>
      <td><strong>{instrument_tag}</strong> — {desc}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Approved by:</td>
      <td>{approved_by}</td></tr>
</table>
<p style="margin-top:16px">
  <a href="{url}" style="background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
    View in Calcheq
  </a>
</p>
"""
    _send(
        to=technician_email,
        subject=f"[CalTrack] Calibration approved — {instrument_tag}",
        html=html,
    )


def notify_rejected(
    *,
    instrument_tag:   str,
    instrument_desc:  Optional[str],
    rejected_by:      str,
    notes:            Optional[str],
    record_id:        str,
    technician_email: Optional[str],
) -> None:
    """Called when a calibration record is rejected. Sends to the submitting technician."""
    if not technician_email:
        return
    desc      = instrument_desc or instrument_tag
    notes_row = f"<tr><td style='padding:4px 12px 4px 0;color:#64748b'>Notes:</td><td>{notes}</td></tr>" if notes else ""
    url       = f"{APP_URL}/app"
    html      = f"""
<p>Your calibration record has been <strong style="color:#dc2626">rejected</strong>.</p>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Instrument:</td>
      <td><strong>{instrument_tag}</strong> — {desc}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#64748b">Rejected by:</td>
      <td>{rejected_by}</td></tr>
  {notes_row}
</table>
<p style="margin-top:16px">
  <a href="{url}" style="background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
    View in Calcheq
  </a>
</p>
"""
    _send(
        to=technician_email,
        subject=f"[CalTrack] Calibration rejected — {instrument_tag}",
        html=html,
    )


# ---------------------------------------------------------------------------
# Digest notifications (called by the scheduler)
# ---------------------------------------------------------------------------

def send_overdue_digest(db) -> int:
    """
    Send daily overdue digest to each site's admins/supervisors.
    Returns the number of emails sent.
    """
    from datetime import date
    from models import Instrument, InstrumentStatus, CalibrationResultStatus, Site, SiteMember

    sent = 0
    today = date.today()

    # Group overdue instruments by site
    overdue = (
        db.query(Instrument)
        .filter(
            Instrument.status.in_([InstrumentStatus.ACTIVE]),
            Instrument.calibration_due_date.isnot(None),
            Instrument.calibration_due_date < today,
            Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
        )
        .all()
    )

    if not overdue:
        return 0

    # Group by site name
    by_site: dict[str, list] = {}
    for instr in overdue:
        by_site.setdefault(instr.created_by, []).append(instr)

    for site_name, instruments in by_site.items():
        site = db.query(Site).filter(Site.name == site_name).first()
        if not site:
            continue

        recipients = (
            db.query(SiteMember)
            .filter(
                SiteMember.site_id == site.id,
                SiteMember.email.isnot(None),
                SiteMember.role.in_(["admin", "supervisor"]),
            )
            .all()
        )
        if not recipients:
            continue

        rows = "".join(
            f"<tr><td style='padding:4px 8px;font-family:monospace'>{i.tag_number}</td>"
            f"<td style='padding:4px 8px'>{i.description or '—'}</td>"
            f"<td style='padding:4px 8px'>{i.area or '—'}</td>"
            f"<td style='padding:4px 8px;color:#dc2626'>{(today - i.calibration_due_date).days}d overdue</td></tr>"
            for i in sorted(instruments, key=lambda x: x.calibration_due_date or today)
        )
        url  = f"{APP_URL}/app/alerts"
        html = f"""
<p>The following <strong>{len(instruments)} instrument(s)</strong> are overdue for calibration at <strong>{site_name}</strong>.</p>
<table border="0" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;width:100%">
  <thead>
    <tr style="background:#f1f5f9">
      <th style="padding:6px 8px;text-align:left">Tag</th>
      <th style="padding:6px 8px;text-align:left">Description</th>
      <th style="padding:6px 8px;text-align:left">Area</th>
      <th style="padding:6px 8px;text-align:left">Status</th>
    </tr>
  </thead>
  <tbody>{rows}</tbody>
</table>
<p style="margin-top:16px">
  <a href="{url}" style="background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
    View all alerts
  </a>
</p>
"""
        subject = f"[CalTrack] {len(instruments)} overdue instrument(s) — {site_name}"
        for member in recipients:
            if _send(to=member.email, subject=subject, html=html):
                sent += 1

    return sent


def send_due_soon_digest(db) -> int:
    """
    Send weekly due-soon digest to each site's admins/supervisors.
    Returns the number of emails sent.
    """
    from datetime import date, timedelta
    from models import Instrument, InstrumentStatus, CalibrationResultStatus, Site, SiteMember

    sent  = 0
    today = date.today()
    cutoff = today + timedelta(days=7)

    due_soon = (
        db.query(Instrument)
        .filter(
            Instrument.status.in_([InstrumentStatus.ACTIVE]),
            Instrument.calibration_due_date.isnot(None),
            Instrument.calibration_due_date >= today,
            Instrument.calibration_due_date <= cutoff,
            Instrument.last_calibration_result != CalibrationResultStatus.NOT_CALIBRATED,
        )
        .all()
    )

    if not due_soon:
        return 0

    by_site: dict[str, list] = {}
    for instr in due_soon:
        by_site.setdefault(instr.created_by, []).append(instr)

    for site_name, instruments in by_site.items():
        site = db.query(Site).filter(Site.name == site_name).first()
        if not site:
            continue

        recipients = (
            db.query(SiteMember)
            .filter(
                SiteMember.site_id == site.id,
                SiteMember.email.isnot(None),
                SiteMember.role.in_(["admin", "supervisor"]),
            )
            .all()
        )
        if not recipients:
            continue

        rows = "".join(
            f"<tr><td style='padding:4px 8px;font-family:monospace'>{i.tag_number}</td>"
            f"<td style='padding:4px 8px'>{i.description or '—'}</td>"
            f"<td style='padding:4px 8px'>{i.area or '—'}</td>"
            f"<td style='padding:4px 8px;color:#d97706'>{(i.calibration_due_date - today).days}d remaining</td></tr>"
            for i in sorted(instruments, key=lambda x: x.calibration_due_date or today)
        )
        url  = f"{APP_URL}/app/alerts"
        html = f"""
<p><strong>{len(instruments)} instrument(s)</strong> at <strong>{site_name}</strong> are due for calibration within 7 days.</p>
<table border="0" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;width:100%">
  <thead>
    <tr style="background:#f1f5f9">
      <th style="padding:6px 8px;text-align:left">Tag</th>
      <th style="padding:6px 8px;text-align:left">Description</th>
      <th style="padding:6px 8px;text-align:left">Area</th>
      <th style="padding:6px 8px;text-align:left">Due In</th>
    </tr>
  </thead>
  <tbody>{rows}</tbody>
</table>
<p style="margin-top:16px">
  <a href="{url}" style="background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px">
    View all alerts
  </a>
</p>
"""
        subject = f"[CalTrack] {len(instruments)} instrument(s) due within 7 days — {site_name}"
        for member in recipients:
            if _send(to=member.email, subject=subject, html=html):
                sent += 1

    return sent
