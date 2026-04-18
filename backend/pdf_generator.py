"""
PDF Certificate Generator — CalCheq
=====================================
Generates a calibration certificate PDF as bytes using fpdf2.
No system dependencies — pure Python.

Usage:
    pdf_bytes = generate_calibration_cert(record, instrument, test_points)
    filename  = cert_filename(instrument.tag_number, record.calibration_date)
"""
from __future__ import annotations

import logging
import math
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Colour palette (RGB tuples) — matches CalCheq brand
# ---------------------------------------------------------------------------
NAVY        = (11,  31,  58)    # #0B1F3A
TEAL        = (31, 202, 216)    # #1FCAD8
TEAL_DARK   = (11, 158, 170)    # #0B9EAA
TEAL_LIGHT  = (236, 250, 252)   # very light teal bg
CYAN_LIGHT  = (63, 242, 220)    # #3FF2DC
BLUE_ACCENT = (46, 142, 216)    # #2E8ED8
BLUE_GREY   = (74, 122, 168)    # #4A7AA8
GREEN       = (34, 197,  94)    # #22C55E
RED         = (239,  68,  68)   # #EF4444
AMBER       = (245, 158,  11)   # #F59E0B
GREY        = (107, 114, 128)   # #6B7280
LGREY       = (241, 245, 249)   # light bg
WHITE       = (255, 255, 255)
BLACK       = (  0,   0,   0)
DARK_NAVY   = (26,  45,  80)    # separator lines in header


def cert_filename(tag_number: str, cal_date) -> str:
    """Return e.g. 'FT-001_2026-04-17.pdf' (safe for filesystems)."""
    safe_tag = "".join(c if c.isalnum() or c in "-_" else "_" for c in str(tag_number))
    if hasattr(cal_date, "isoformat"):
        date_str = cal_date.isoformat()
    else:
        date_str = str(cal_date)
    return f"{safe_tag}_{date_str}.pdf"


def _result_colour(result: Optional[str]):
    """Return (R, G, B) for a pass/fail result string."""
    if result in ("pass", "not_required"):
        return GREEN
    if result == "fail":
        return RED
    if result == "marginal":
        return AMBER
    return GREY


# ---------------------------------------------------------------------------
# Brand icon drawing — gauge arc + green checkmark
# ---------------------------------------------------------------------------

def _draw_gauge_check(pdf, ox: float, oy: float, size: float) -> None:
    """
    Draw a CalCheq-style gauge arc + green checkmark icon at (ox, oy).
    size is the bounding box width in mm.
    """
    cx  = ox + size * 0.50
    r   = size * 0.43
    cy  = oy + size * 0.74   # centre near bottom of bounding box
    N   = 20                  # arc segments

    # ── Faint background track ─────────────────────────────────────────────
    pdf.set_draw_color(29, 50, 90)
    pdf.set_line_width(0.35)
    pts_bg = [
        (cx + r * 0.86 * math.cos(math.radians(180 - i * 180 / N)),
         cy - r * 0.86 * math.sin(math.radians(180 - i * 180 / N)))
        for i in range(N + 1)
    ]
    for i in range(len(pts_bg) - 1):
        pdf.line(*pts_bg[i], *pts_bg[i + 1])

    # ── Main teal arc ──────────────────────────────────────────────────────
    pdf.set_draw_color(*TEAL)
    pdf.set_line_width(1.0)
    pts = [
        (cx + r * math.cos(math.radians(180 - i * 180 / N)),
         cy - r * math.sin(math.radians(180 - i * 180 / N)))
        for i in range(N + 1)
    ]
    for i in range(len(pts) - 1):
        pdf.line(*pts[i], *pts[i + 1])

    # Tick marks (minor graduation)
    pdf.set_draw_color(*TEAL_DARK)
    pdf.set_line_width(0.3)
    for tick_deg in (30, 60, 90, 120, 150):
        angle_rad = math.radians(tick_deg)
        inner = r * 0.80
        outer = r * 0.96
        x1 = cx + inner * math.cos(angle_rad)
        y1 = cy - inner * math.sin(angle_rad)
        x2 = cx + outer * math.cos(angle_rad)
        y2 = cy - outer * math.sin(angle_rad)
        pdf.line(x1, y1, x2, y2)

    # Endpoint dot (bright cyan)
    pdf.set_fill_color(*CYAN_LIGHT)
    ex, ey = cx + r, cy
    pdf.ellipse(ex - 1.2, ey - 1.2, 2.4, 2.4, style="F")

    # ── Green checkmark ────────────────────────────────────────────────────
    pdf.set_draw_color(*GREEN)
    pdf.set_line_width(1.8)
    p1 = (cx - r * 0.50, cy - r * 0.07)
    p2 = (cx - r * 0.12, cy + r * 0.33)
    p3 = (cx + r * 0.60, cy - r * 0.57)
    pdf.line(p1[0], p1[1], p2[0], p2[1])
    pdf.line(p2[0], p2[1], p3[0], p3[1])

    pdf.set_line_width(0.2)   # reset


# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------

HEADER_H = 44  # header height in mm


def _draw_cert_header(pdf, site_name: str = "") -> float:
    """
    Draw the full branded certificate header.
    Returns the y position to start body content.
    """
    # Navy background
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, 210, HEADER_H, style="F")

    # ── Brand icon ──────────────────────────────────────────────────────────
    _draw_gauge_check(pdf, ox=9, oy=5, size=32)

    # ── "Cal" (white bold) + "Cheq" (teal) wordmark ─────────────────────────
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*WHITE)
    pdf.set_xy(44, 10)
    cal_w = pdf.get_string_width("Cal")
    pdf.cell(cal_w, 11, "Cal", ln=False)

    pdf.set_text_color(*TEAL)
    pdf.set_font("Helvetica", "", 20)
    pdf.cell(pdf.get_string_width("Cheq"), 11, "Cheq", ln=False)

    # Divider under wordmark
    pdf.set_draw_color(*DARK_NAVY)
    pdf.set_line_width(0.25)
    pdf.line(44, 23, 130, 23)

    # Tagline
    pdf.set_text_color(*BLUE_GREY)
    pdf.set_font("Helvetica", "", 5.5)
    pdf.set_xy(44, 25)
    pdf.cell(0, 4, "CALIBRATION  \u00b7  INTELLIGENCE  \u00b7  RELIABILITY", ln=False)

    # calcheq.com (small, lower left)
    pdf.set_font("Helvetica", "", 6)
    pdf.set_xy(44, 31)
    pdf.cell(0, 4, "calcheq.com", ln=False)

    # ── Right side: site name + certificate label ────────────────────────────
    if site_name:
        # Site name — large and prominent
        pdf.set_text_color(*WHITE)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_xy(0, 7)
        pdf.cell(195, 9, site_name, align="R", ln=False)

        # "CALIBRATION CERTIFICATE" in teal below site name
        pdf.set_text_color(*TEAL)
        pdf.set_font("Helvetica", "B", 8)
        pdf.set_xy(0, 19)
        pdf.cell(195, 5, "CALIBRATION CERTIFICATE", align="R", ln=False)

        # Record ID preview
        pdf.set_text_color(*BLUE_GREY)
        pdf.set_font("Helvetica", "", 7)
        pdf.set_xy(0, 27)
        pdf.cell(195, 4, "calcheq.com", align="R", ln=False)
    else:
        pdf.set_text_color(*TEAL)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_xy(0, 13)
        pdf.cell(195, 7, "CALIBRATION CERTIFICATE", align="R", ln=False)

        pdf.set_text_color(*BLUE_GREY)
        pdf.set_font("Helvetica", "", 7)
        pdf.set_xy(0, 23)
        pdf.cell(195, 4, "calcheq.com", align="R", ln=False)

    # Teal accent strip at bottom of header
    pdf.set_fill_color(*TEAL)
    pdf.rect(0, HEADER_H, 210, 1.5, style="F")

    pdf.set_text_color(*BLACK)
    return HEADER_H + 5   # body starts here


# ---------------------------------------------------------------------------
# Main generator
# ---------------------------------------------------------------------------

def generate_calibration_cert(record, instrument, test_points: list, site_name: str = "") -> bytes:
    """
    Generate a calibration certificate PDF and return it as bytes.

    Parameters
    ----------
    record       : CalibrationRecord ORM instance
    instrument   : Instrument ORM instance
    test_points  : list of CalTestPoint ORM instances
    site_name    : site / company name to print in the header
    """
    try:
        from fpdf import FPDF
    except ImportError:
        logger.error("fpdf2 is not installed — cannot generate PDF certificate")
        raise RuntimeError("PDF generation requires fpdf2 (pip install fpdf2)")

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_margins(left=15, top=10, right=15)

    # ── Branded header ────────────────────────────────────────────────────────
    body_y = _draw_cert_header(pdf, site_name)
    pdf.set_y(body_y)

    # ── Overall result banner ─────────────────────────────────────────────────
    overall = (record.as_left_result or record.as_found_result or "").lower()
    if hasattr(overall, "value"):
        overall = overall.value
    result_label = {
        "pass":         "PASS",
        "fail":         "FAIL",
        "marginal":     "MARGINAL",
        "not_required": "NO ADJUSTMENT REQUIRED",
    }.get(overall, overall.upper() or "—")
    result_colour = _result_colour(overall)

    pdf.set_fill_color(*result_colour)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, f"Overall Result: {result_label}", fill=True, align="C", ln=True)
    pdf.set_text_color(*BLACK)
    pdf.ln(4)

    # ── Helpers ───────────────────────────────────────────────────────────────
    col_w = 87

    def info_row(label: str, value: str, bold_value: bool = False):
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*GREY)
        pdf.cell(45, 6, label, ln=False)
        pdf.set_text_color(*BLACK)
        pdf.set_font("Helvetica", "B" if bold_value else "", 9)
        pdf.cell(col_w - 45, 6, str(value) if value else "—", ln=False)

    def section_heading(title: str):
        pdf.set_fill_color(*TEAL_LIGHT)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(*TEAL_DARK)
        # Left teal accent bar
        x0 = pdf.get_x()
        y0 = pdf.get_y()
        pdf.set_fill_color(*TEAL)
        pdf.rect(x0, y0, 3, 7, style="F")
        pdf.set_fill_color(*TEAL_LIGHT)
        pdf.set_xy(x0, y0)
        pdf.cell(0, 7, f"    {title}", fill=True, ln=True)
        pdf.set_text_color(*BLACK)
        pdf.ln(1)

    # ── Instrument Details ────────────────────────────────────────────────────
    section_heading("INSTRUMENT DETAILS")
    y_start = pdf.get_y()

    pdf.set_xy(15, y_start)
    info_row("Tag Number:", str(instrument.tag_number or ""), bold_value=True)
    pdf.set_xy(15 + col_w, y_start)
    info_row("Area:", str(instrument.area or ""))
    pdf.ln(6)

    info_row("Description:", str(instrument.description or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Type:", str(
        (instrument.instrument_type.value if hasattr(instrument.instrument_type, "value")
         else instrument.instrument_type) or ""
    ).replace("_", " ").title())
    pdf.ln(6)

    info_row("Manufacturer:", str(instrument.manufacturer or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Model:", str(instrument.model or ""))
    pdf.ln(6)

    info_row("Serial Number:", str(instrument.serial_number or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    eu = instrument.engineering_units or ""
    info_row("Range:", f"{instrument.measurement_lrv} – {instrument.measurement_urv} {eu}".strip())
    pdf.ln(8)

    # ── Calibration Details ───────────────────────────────────────────────────
    section_heading("CALIBRATION DETAILS")

    cal_date_str = record.calibration_date.isoformat() if record.calibration_date else "—"
    cal_type_raw = (record.calibration_type.value if hasattr(record.calibration_type, "value")
                    else record.calibration_type) or "—"
    cal_type_str = cal_type_raw.replace("_", " ").title()

    info_row("Calibration Date:", cal_date_str, bold_value=True)
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Type:", cal_type_str)
    pdf.ln(6)

    info_row("Technician:", str(record.technician_name or "—"))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Work Order:", str(record.work_order_reference or "—"))
    pdf.ln(6)

    info_row("Procedure:", str(record.procedure_used or instrument.procedure_reference or "—"))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Adjustment Made:", "Yes" if record.adjustment_made else "No")
    pdf.ln(8)

    # ── Reference Standard ────────────────────────────────────────────────────
    if record.reference_standard_description or record.reference_standard_serial:
        section_heading("REFERENCE STANDARD")

        info_row("Description:", str(record.reference_standard_description or "—"))
        pdf.set_xy(15 + col_w, pdf.get_y())
        info_row("Serial:", str(record.reference_standard_serial or "—"))
        pdf.ln(6)

        info_row("Cert Number:", str(record.reference_standard_cert_number or "—"))
        pdf.set_xy(15 + col_w, pdf.get_y())
        cert_expiry = record.reference_standard_cert_expiry
        info_row("Cert Expiry:", cert_expiry.isoformat() if cert_expiry else "—")
        pdf.ln(8)

    # ── Test Point Results ────────────────────────────────────────────────────
    if test_points:
        section_heading("TEST POINT RESULTS")

        headers    = ["Pt", "Nominal", "Expected", "As-Found", "As-Left", "Error %", "Result"]
        col_widths = [10,    25,        25,          25,         25,        22,         28]

        # Table header row (navy)
        pdf.set_fill_color(*NAVY)
        pdf.set_text_color(*WHITE)
        pdf.set_font("Helvetica", "B", 8)
        for i, h in enumerate(headers):
            pdf.cell(col_widths[i], 7, h, border=0, fill=True, align="C")
        pdf.ln()

        pdf.set_text_color(*BLACK)
        pdf.set_font("Helvetica", "", 8)

        for idx, tp in enumerate(test_points):
            fill = idx % 2 == 1
            if fill:
                pdf.set_fill_color(236, 250, 252)   # very light teal stripe
            else:
                pdf.set_fill_color(*WHITE)

            af_err  = f"{tp.as_found_error_pct:.2f}%" if tp.as_found_error_pct is not None else "—"
            al_err  = f"{tp.as_left_error_pct:.2f}%"  if tp.as_left_error_pct  is not None else "—"
            err_str = al_err if tp.as_left_error_pct is not None else af_err

            result_str = (tp.as_left_result or tp.as_found_result or "")
            result_str = result_str.value if hasattr(result_str, "value") else result_str

            row_data = [
                str(tp.point_number),
                f"{tp.nominal_input:.4g}"  if tp.nominal_input   is not None else "—",
                f"{tp.expected_output:.4g}" if tp.expected_output is not None else "—",
                f"{tp.as_found_output:.4g}" if tp.as_found_output is not None else "—",
                f"{tp.as_left_output:.4g}"  if tp.as_left_output  is not None else "—",
                err_str,
                result_str.upper() if result_str else "—",
            ]

            for i, val in enumerate(row_data):
                if i == 6 and result_str:
                    col = _result_colour(result_str.lower())
                    pdf.set_text_color(*col)
                    pdf.set_font("Helvetica", "B", 8)
                pdf.cell(col_widths[i], 6, val, fill=fill, align="C")
                if i == 6:
                    pdf.set_text_color(*BLACK)
                    pdf.set_font("Helvetica", "", 8)
            pdf.ln()

        pdf.ln(4)

    # ── Notes ─────────────────────────────────────────────────────────────────
    if record.technician_notes or record.adjustment_notes:
        section_heading("NOTES")
        pdf.set_font("Helvetica", "", 9)
        if record.technician_notes:
            pdf.multi_cell(0, 5, str(record.technician_notes))
        if record.adjustment_notes:
            pdf.multi_cell(0, 5, f"Adjustment: {record.adjustment_notes}")
        pdf.ln(4)

    # ── Approval ──────────────────────────────────────────────────────────────
    section_heading("APPROVAL")
    info_row("Approved by:", str(record.approved_by or "—"), bold_value=True)
    pdf.set_xy(15 + col_w, pdf.get_y())
    approved_at = record.approved_at
    info_row("Approved at:", approved_at.strftime("%Y-%m-%d %H:%M UTC") if approved_at else "—")
    pdf.ln(6)

    record_status_str = (
        record.record_status.value if hasattr(record.record_status, "value")
        else record.record_status
    ) or "—"
    info_row("Record Status:", record_status_str.upper(), bold_value=True)
    pdf.ln(8)

    # ── Footer ────────────────────────────────────────────────────────────────
    # Draw a teal bottom footer bar
    page_h = 297  # A4 height
    pdf.set_fill_color(*NAVY)
    pdf.set_xy(0, page_h - 14)
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(*TEAL)
    pdf.cell(
        0, 6,
        f"CalCheq Calibration Certificate  |  calcheq.com  |  Record ID: {record.id}",
        align="C",
        ln=True,
    )
    pdf.set_text_color(*BLUE_GREY)
    pdf.set_font("Helvetica", "I", 6.5)
    pdf.cell(
        0, 5,
        "Results valid at date of calibration stated. Traceable to SI per ISO/IEC 17025:2017. "
        "Prepared per AS ISO 9001:2016. Do not reproduce except in full.",
        align="C",
        ln=True,
    )

    return pdf.output()
