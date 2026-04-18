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

import io
import logging
from datetime import date
from typing import List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Colour palette (RGB tuples)
# ---------------------------------------------------------------------------
NAVY   = (11,  31,  58)   # #0B1F3A
BLUE   = (33, 150, 243)   # #2196F3
GREEN  = (34, 197,  94)   # #22C55E
RED    = (239,  68,  68)  # #EF4444
AMBER  = (245, 158,  11)  # #F59E0B
GREY   = (107, 114, 128)  # #6B7280
LGREY  = (241, 245, 249)  # light bg
WHITE  = (255, 255, 255)
BLACK  = (0,   0,   0)


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


def generate_calibration_cert(record, instrument, test_points: list, site_name: str = "") -> bytes:
    """
    Generate a calibration certificate PDF and return it as bytes.

    Parameters
    ----------
    record       : CalibrationRecord ORM instance
    instrument   : Instrument ORM instance
    test_points  : list of CalTestPoint ORM instances
    """
    try:
        from fpdf import FPDF
    except ImportError:
        logger.error("fpdf2 is not installed — cannot generate PDF certificate")
        raise RuntimeError("PDF generation requires fpdf2 (pip install fpdf2)")

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_margins(left=15, top=10, right=15)

    # ── Header banner ────────────────────────────────────────────────────────
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, 210, 28, style="F")

    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(*WHITE)
    pdf.set_xy(15, 7)
    pdf.cell(0, 8, "CalCheq — Calibration Certificate", ln=False)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_xy(15, 16)
    pdf.cell(0, 5, "calcheq.com", ln=False)

    # Site / company name — right-aligned in header
    if site_name:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_xy(0, 7)
        pdf.cell(195, 8, site_name, align="R", ln=False)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_xy(0, 16)
        pdf.cell(195, 5, "Site / Company", align="R", ln=False)

    pdf.set_text_color(*BLACK)
    pdf.set_y(33)

    # ── Overall result banner ─────────────────────────────────────────────────
    overall = (record.as_left_result or record.as_found_result or "").lower()
    result_label = {
        "pass":         "PASS",
        "fail":         "FAIL",
        "marginal":     "MARGINAL",
        "not_required": "NO ADJUSTMENT REQUIRED",
    }.get(overall, overall.upper() or "—")
    result_colour = _result_colour(overall)

    pdf.set_fill_color(*result_colour)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, f"Overall Result: {result_label}", fill=True, align="C", ln=True)
    pdf.set_text_color(*BLACK)
    pdf.ln(4)

    # ── Helper: two-column info row ───────────────────────────────────────────
    col_w = 87

    def info_row(label: str, value: str, bold_value: bool = False):
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*GREY)
        pdf.cell(45, 6, label, ln=False)
        pdf.set_text_color(*BLACK)
        pdf.set_font("Helvetica", "B" if bold_value else "", 9)
        pdf.cell(col_w - 45, 6, str(value) if value else "—", ln=False)

    def section_heading(title: str):
        pdf.set_fill_color(*LGREY)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*NAVY)
        pdf.cell(0, 7, f"  {title}", fill=True, ln=True)
        pdf.set_text_color(*BLACK)
        pdf.ln(1)

    # ── Instrument Details ────────────────────────────────────────────────────
    section_heading("INSTRUMENT DETAILS")

    x_start = pdf.get_x()
    y_start = pdf.get_y()

    # Left column
    pdf.set_xy(15, y_start)
    info_row("Tag Number:", str(instrument.tag_number or ""), bold_value=True)
    pdf.set_xy(15 + col_w, y_start)
    info_row("Area:", str(instrument.area or ""))
    pdf.ln(6)

    info_row("Description:", str(instrument.description or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Type:", str((instrument.instrument_type.value if hasattr(instrument.instrument_type, "value") else instrument.instrument_type) or ""))
    pdf.ln(6)

    info_row("Manufacturer:", str(instrument.manufacturer or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Model:", str(instrument.model or ""))
    pdf.ln(6)

    info_row("Serial Number:", str(instrument.serial_number or ""))
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Range:", f"{instrument.measurement_lrv} – {instrument.measurement_urv} {instrument.engineering_units or ''}")
    pdf.ln(8)

    # ── Calibration Details ───────────────────────────────────────────────────
    section_heading("CALIBRATION DETAILS")

    cal_date_str = record.calibration_date.isoformat() if record.calibration_date else "—"
    cal_type_str = (record.calibration_type.value if hasattr(record.calibration_type, "value") else record.calibration_type) or "—"

    info_row("Calibration Date:", cal_date_str, bold_value=True)
    pdf.set_xy(15 + col_w, pdf.get_y())
    info_row("Type:", cal_type_str.replace("_", " ").title())
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

        # Table header
        headers    = ["Pt", "Nominal", "Expected", "As-Found", "As-Left", "Error %", "Result"]
        col_widths = [10,    25,        25,          25,         25,        22,         28]

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
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(*WHITE)

            af_err  = f"{tp.as_found_error_pct:.2f}%" if tp.as_found_error_pct is not None else "—"
            al_err  = f"{tp.as_left_error_pct:.2f}%"  if tp.as_left_error_pct  is not None else "—"
            err_str = al_err if tp.as_left_error_pct is not None else af_err

            result_str = (tp.as_left_result or tp.as_found_result or "")
            result_str = result_str.value if hasattr(result_str, "value") else result_str

            row_data = [
                str(tp.point_number),
                f"{tp.nominal_input:.4g}" if tp.nominal_input is not None else "—",
                f"{tp.expected_output:.4g}" if tp.expected_output is not None else "—",
                f"{tp.as_found_output:.4g}" if tp.as_found_output is not None else "—",
                f"{tp.as_left_output:.4g}" if tp.as_left_output is not None else "—",
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
    info_row("Record Status:", str((record.record_status.value if hasattr(record.record_status, "value") else record.record_status) or "—").upper(), bold_value=True)
    pdf.ln(8)

    # ── Footer ────────────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*GREY)
    pdf.cell(
        0, 5,
        f"Generated by CalCheq — calcheq.com  |  Record ID: {record.id}",
        align="C",
        ln=True,
    )

    return pdf.output()
