/**
 * CalCheq — Calibration Report Generator
 *
 * Generates two types of professional PDF reports:
 *   1. generateSingleCalibrationCert(instrument, record)
 *      — Single A4 calibration certificate for one calibration event.
 *        Suitable for forwarding to clients or attaching to work orders.
 *
 *   2. generateMultiCalibrationReport(instrument, records)
 *      — Multi-page history report for a single instrument.
 *        Includes error trend chart + detailed record for every calibration.
 *
 * Requires: jspdf, jspdf-autotable
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Page constants ───────────────────────────────────────────────────────────

const PAGE_W    = 210   // A4 width  (mm)
const PAGE_H    = 297   // A4 height (mm)
const MARGIN    = 14
const CONTENT_W = PAGE_W - MARGIN * 2

// ─── Colour palette (RGB arrays) ─────────────────────────────────────────────

const NAVY    = [22,  55,  99]
const GOLD    = [251, 191,  36]
const WHITE   = [255, 255, 255]
const SLATE   = [71,  85, 105]
const LIGHT   = [248, 250, 252]
const BORDER  = [226, 232, 240]
const DARK    = [30,  41,  59]

const PASS_C  = [22,  163,  74]
const MARG_C  = [217, 119,   6]
const FAIL_C  = [220,  38,  38]

// ─── Utility helpers ──────────────────────────────────────────────────────────

function fmt(val, dp = 2) {
  if (val == null || val === '') return '—'
  return typeof val === 'number' ? val.toFixed(dp) : String(val)
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return String(dateStr) }
}

function humanise(str) {
  if (!str) return '—'
  return String(str).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function resultColor(result) {
  if (!result) return SLATE
  if (result === 'pass')     return PASS_C
  if (result === 'fail')     return FAIL_C
  if (result === 'marginal') return MARG_C
  return SLATE
}

function certNumber(id, date) {
  const d  = date ? new Date(date) : new Date()
  const yr = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const sh = id ? id.slice(0, 8).toUpperCase() : 'XXXXXXXX'
  return `CAL-${yr}${mo}-${sh}`
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

/** Draws the navy header bar. Returns y position after header. */
function drawPageHeader(doc, title, refNum, issueDate, siteName = '') {
  // Navy background
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 30, 'F')

  // Gold accent strip
  doc.setFillColor(...GOLD)
  doc.rect(0, 30, PAGE_W, 1.5, 'F')

  // Left — brand
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('CalCheq', MARGIN, 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('Industrial Calibration Management', MARGIN, 17)
  if (siteName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(siteName, MARGIN, 24)
  }

  // Right — document title + reference
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(title, PAGE_W - MARGIN, 10, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(`Ref: ${refNum}`, PAGE_W - MARGIN, 16.5, { align: 'right' })
  doc.text(`Issued: ${issueDate}`, PAGE_W - MARGIN, 22, { align: 'right' })

  return 36  // y after header
}

/** Draws a coloured section title bar. Returns y after the bar. */
function sectionTitle(doc, text, y) {
  doc.setFillColor(235, 240, 250)
  doc.setDrawColor(...BORDER)
  doc.rect(MARGIN, y, CONTENT_W, 6.5, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text(text.toUpperCase(), MARGIN + 3, y + 4.3)
  return y + 9
}

/** Draws a label: value pair. Returns y after this field. */
function field(doc, label, value, x, y, labelW = 38) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  const safeVal = value == null || value === '' ? '—' : String(value)
  doc.text(safeVal, x + labelW, y)
  return y + 5.5
}

/** Draws the footer with traceability statement + page number. */
function drawFooter(doc, pageNum, totalPages, isSIS = false) {
  const fy = PAGE_H - 20
  doc.setDrawColor(...BORDER)
  doc.line(MARGIN, fy, PAGE_W - MARGIN, fy)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(5.8)
  doc.setTextColor(...SLATE)

  const maxW = PAGE_W - MARGIN * 2 - 42
  const lineH = 3.4

  const footerTexts = [
    'Calibration results are traceable to SI (ISO/IEC 17025:2017) via NATA-accredited reference standards. Results valid at calibration date stated.',
    isSIS
      ? 'Safety Critical (SIS): Records retained per IEC 61511-1:2016 / AS 61511.1:2021. Prepared per AS ISO 9001:2016. Do not reproduce except in full.'
      : 'Prepared per AS ISO 9001:2016 and internal calibration procedures. This document shall not be reproduced except in full without written approval.',
  ]

  let textY = fy + 4.5
  for (const t of footerTexts) {
    const wrapped = doc.splitTextToSize(t, maxW)
    doc.text(wrapped, MARGIN, textY)
    textY += wrapped.length * lineH + 1
  }

  doc.text(
    `Page ${pageNum} of ${totalPages}  |  Generated by CalCheq on ${fmtDate(new Date().toISOString())}`,
    PAGE_W - MARGIN, fy + 4.5, { align: 'right' },
  )
}

/** Draws a coloured result box (as-found / as-left). */
function resultBox(doc, label, result, x, y, w = 40, h = 18) {
  const col = resultColor(result)
  doc.setFillColor(...col)
  doc.roundedRect(x, y, w, h, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text(label, x + w / 2, y + 5.5, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text((result ?? 'N/A').toUpperCase(), x + w / 2, y + 14, { align: 'center' })
}

// ─── Trend chart (programmatic) ───────────────────────────────────────────────

function drawTrendChart(doc, records, instrument, startY) {
  const eligible = [...(records ?? [])]
    .filter(r => r.calibration_date && r.max_as_found_error_pct != null)
    .sort((a, b) => new Date(a.calibration_date) - new Date(b.calibration_date))

  if (eligible.length < 2) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE)
    doc.text('Insufficient data for trend chart (minimum 2 calibrations required).', MARGIN, startY + 5)
    return startY + 12
  }

  const CX = MARGIN
  const CY = startY
  const CW = CONTENT_W
  const CH = 58

  const PAD_L = 20, PAD_R = 8, PAD_T = 10, PAD_B = 14

  const PX = CX + PAD_L
  const PY = CY + PAD_T
  const PW = CW - PAD_L - PAD_R
  const PH = CH - PAD_T - PAD_B

  const tolPct  = Math.abs(instrument.tolerance_value ?? 2)
  const margPct = tolPct * 0.8
  const errors  = eligible.map(r => Math.abs(r.max_as_found_error_pct))
  const maxErr  = Math.max(...errors, tolPct) * 1.35

  const dates    = eligible.map(r => new Date(r.calibration_date).getTime())
  const minDate  = Math.min(...dates)
  const maxDate  = Math.max(...dates)
  const dateSpan = maxDate - minDate || 1

  const sx = d  => PX + ((new Date(d).getTime() - minDate) / dateSpan) * PW
  const sy = v  => PY + PH - (Math.min(Math.abs(v), maxErr) / maxErr) * PH

  // Background + zones
  doc.setFillColor(254, 226, 226)          // red zone (above tol)
  doc.rect(PX, PY, PW, sy(tolPct) - PY, 'F')
  doc.setFillColor(254, 243, 199)          // amber zone (80–100% tol)
  doc.rect(PX, sy(tolPct), PW, sy(margPct) - sy(tolPct), 'F')
  doc.setFillColor(220, 252, 231)          // green zone (below 80% tol)
  doc.rect(PX, sy(margPct), PW, PY + PH - sy(margPct), 'F')

  doc.setDrawColor(...BORDER)
  doc.rect(PX, PY, PW, PH)

  // Tolerance lines
  doc.setLineWidth(0.3)
  doc.setLineDashPattern([2, 1.2], 0)

  doc.setDrawColor(...FAIL_C)
  doc.line(PX, sy(tolPct), PX + PW, sy(tolPct))
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(...FAIL_C)
  doc.text(`Tol ±${tolPct}%`, CX + 1, sy(tolPct) + 1)

  doc.setDrawColor(...MARG_C)
  doc.line(PX, sy(margPct), PX + PW, sy(margPct))
  doc.setTextColor(...MARG_C)
  doc.text(`Marg ${margPct.toFixed(1)}%`, CX + 1, sy(margPct) + 1)

  doc.setLineDashPattern([], 0)

  // Trend line
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  for (let i = 1; i < eligible.length; i++) {
    doc.line(
      sx(eligible[i - 1].calibration_date), sy(errors[i - 1]),
      sx(eligible[i].calibration_date),     sy(errors[i]),
    )
  }
  doc.setLineWidth(0.2)

  // Data points
  eligible.forEach((r, i) => {
    const col = errors[i] > tolPct ? FAIL_C : errors[i] > margPct ? MARG_C : PASS_C
    doc.setFillColor(...col)
    doc.circle(sx(r.calibration_date), sy(errors[i]), 1.1, 'F')
  })

  // X-axis date labels
  const step = Math.max(1, Math.ceil(eligible.length / 6))
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(...SLATE)
  eligible.forEach((r, i) => {
    if (i % step === 0 || i === eligible.length - 1) {
      const lbl = new Date(r.calibration_date).toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
      doc.text(lbl, sx(r.calibration_date), PY + PH + 6, { align: 'center' })
    }
  })

  // Y-axis labels
  const ySteps = 4
  for (let k = 0; k <= ySteps; k++) {
    const v  = (maxErr / ySteps) * k
    const py = sy(v)
    if (py >= PY && py <= PY + PH) {
      doc.text(`${v.toFixed(1)}%`, CX + 1, py + 1, { align: 'left' })
    }
  }

  // Chart title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text(
    'As-Found Maximum Error Trend (% Span)  —  Green = Pass zone  |  Amber = Marginal zone  |  Red = Fail zone',
    PX + PW / 2, CY + 6.5, { align: 'center' },
  )

  return CY + CH + 4
}

// ─── 1. Single Calibration Certificate ───────────────────────────────────────

export function generateSingleCalibrationCert(instrument, record, siteName = '') {
  const doc      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const certNum  = certNumber(record.id, record.calibration_date)
  const issueDate = fmtDate(new Date().toISOString())

  let y = drawPageHeader(doc, 'CALIBRATION CERTIFICATE', certNum, issueDate, siteName)

  const col1 = MARGIN + 2
  const col2 = MARGIN + CONTENT_W / 2 + 2
  const LW   = 40

  // ── 1. Instrument Identification ─────────────────────────────────────────
  y = sectionTitle(doc, '1. Instrument Identification', y)
  let ya = y + 2, yb = y + 2

  ya = field(doc, 'Tag Number:',     instrument.tag_number,   col1, ya, LW)
  ya = field(doc, 'Description:',   instrument.description,  col1, ya, LW)
  ya = field(doc, 'Area / Unit:',   [instrument.area, instrument.unit].filter(Boolean).join(' / '), col1, ya, LW)
  ya = field(doc, 'Manufacturer:',  instrument.manufacturer, col1, ya, LW)
  ya = field(doc, 'Model:',         instrument.model,        col1, ya, LW)
  ya = field(doc, 'Serial No.:',    instrument.serial_number, col1, ya, LW)

  yb = field(doc, 'Type:',          humanise(instrument.instrument_type), col2, yb, LW)
  yb = field(doc, 'Range:',         `${fmt(instrument.measurement_lrv)} to ${fmt(instrument.measurement_urv)} ${instrument.engineering_units ?? ''}`, col2, yb, LW)
  yb = field(doc, 'Output Type:',   instrument.output_type,  col2, yb, LW)
  yb = field(doc, 'Tolerance:',     `±${fmt(instrument.tolerance_value)} ${humanise(instrument.tolerance_type)}`, col2, yb, LW)
  yb = field(doc, 'Criticality:',   humanise(instrument.criticality), col2, yb, LW)
  yb = field(doc, 'Procedure Ref:', instrument.procedure_reference, col2, yb, LW)

  y = Math.max(ya, yb) + 4

  // ── 2. Calibration Details ────────────────────────────────────────────────
  y = sectionTitle(doc, '2. Calibration Activity', y)
  let yc = y + 2, yd = y + 2

  yc = field(doc, 'Calibration Date:', fmtDate(record.calibration_date), col1, yc, LW)
  yc = field(doc, 'Calibration Type:', humanise(record.calibration_type), col1, yc, LW)
  yc = field(doc, 'Technician:',       record.technician_name,         col1, yc, LW)
  yc = field(doc, 'Work Order:',       record.work_order_reference || 'N/A', col1, yc, LW)
  if (record.procedure_used) {
    yc = field(doc, 'Procedure Used:', record.procedure_used, col1, yc, LW)
  }

  yd = field(doc, 'Reference Standard:', record.reference_standard_description || 'N/A', col2, yd, LW)
  yd = field(doc, 'Standard Serial:',    record.reference_standard_serial || 'N/A',      col2, yd, LW)
  yd = field(doc, 'Certificate No.:',    record.reference_standard_cert_number || 'N/A', col2, yd, LW)
  yd = field(doc, 'Cert Expiry:',        fmtDate(record.reference_standard_cert_expiry), col2, yd, LW)

  y = Math.max(yc, yd) + 4

  // ── 3. Test Data Table ────────────────────────────────────────────────────
  y = sectionTitle(doc, '3. Calibration Test Data', y)

  // Calibration scale reference strip (LRV → URV with units)
  const lrv  = instrument.measurement_lrv ?? 0
  const urv  = instrument.measurement_urv ?? 100
  const span = urv - lrv || 1
  const eu   = instrument.engineering_units ?? ''

  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(147, 197, 253)
  doc.roundedRect(MARGIN, y + 1, CONTENT_W, 9, 1.5, 1.5, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(30, 64, 175)
  doc.text(
    `Calibration Scale:  LRV = ${fmt(lrv)} ${eu}  |  URV = ${fmt(urv)} ${eu}  |  Span = ${fmt(span)} ${eu}  |  Output: ${instrument.output_type ?? 'N/A'}`,
    PAGE_W / 2, y + 6.5, { align: 'center' },
  )
  y += 12

  const testHead = [[
    'Pt', '% Input', `Input\n(${eu})`, `Expected Output`,
    'As-Found\nOutput', 'Error\n(units)', 'Error\n(% span)', 'AF\nResult',
    'As-Left\nOutput', 'AL Error\n(%)', 'AL\nResult',
  ]]

  const testBody = (record.test_points ?? []).map(tp => {
    const pctInput = lrv != null && urv != null
      ? `${(((tp.nominal_input - lrv) / span) * 100).toFixed(0)}%`
      : '—'
    return [
      tp.point_number,
      pctInput,
      fmt(tp.nominal_input),
      fmt(tp.expected_output),
      fmt(tp.as_found_output),
      fmt(tp.as_found_error_abs),
      tp.as_found_error_pct != null ? `${fmt(tp.as_found_error_pct)}%` : '—',
      (tp.as_found_result ?? '—').toUpperCase(),
      tp.as_left_output != null ? fmt(tp.as_left_output) : '—',
      tp.as_left_error_pct != null ? `${fmt(tp.as_left_error_pct)}%` : '—',
      (tp.as_left_result ?? '—').toUpperCase(),
    ]
  })

  autoTable(doc, {
    startY: y + 1,
    head: testHead,
    body: testBody,
    theme: 'grid',
    styles:     { fontSize: 7.5, cellPadding: 2.2, font: 'helvetica', lineColor: BORDER, lineWidth: 0.2 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7, halign: 'center' },
    bodyStyles: { textColor: DARK },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { halign: 'center', cellWidth: 13 },
      7: { halign: 'center' },
      10: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const v = String(data.cell.raw ?? '').toLowerCase()
      if (data.column.index === 7 || data.column.index === 10) {
        if      (v === 'pass')     { data.cell.styles.textColor = PASS_C; data.cell.styles.fontStyle = 'bold' }
        else if (v === 'fail')     { data.cell.styles.textColor = FAIL_C; data.cell.styles.fontStyle = 'bold' }
        else if (v === 'marginal') { data.cell.styles.textColor = MARG_C; data.cell.styles.fontStyle = 'bold' }
      }
    },
    margin: { left: MARGIN, right: MARGIN },
  })

  y = doc.lastAutoTable.finalY + 5

  // ── 4. Results Summary ────────────────────────────────────────────────────
  y = sectionTitle(doc, '4. Results Summary', y)
  y += 3

  // Result boxes
  const BW = 40, BH = 18, BG = 5
  let bx = MARGIN + 2
  resultBox(doc, 'AS FOUND', record.as_found_result, bx, y, BW, BH)
  bx += BW + BG
  resultBox(doc, 'AS LEFT',  record.as_left_result,  bx, y, BW, BH)
  bx += BW + BG

  // Stats panel
  const statsW = 58
  doc.setFillColor(...LIGHT)
  doc.setDrawColor(...BORDER)
  doc.roundedRect(bx, y, statsW, BH, 2, 2, 'FD')

  const sv = (label, value, sy) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...SLATE)
    doc.text(label, bx + 3, sy)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
    doc.text(String(value), bx + statsW - 3, sy, { align: 'right' })
    return sy + 4.5
  }
  let sy2 = y + 5
  sy2 = sv('Max As-Found Error:', `${fmt(record.max_as_found_error_pct)}%`, sy2)
  sy2 = sv('Max As-Left Error:',  `${fmt(record.max_as_left_error_pct)}%`, sy2)
  sv('Tolerance:', `±${fmt(instrument.tolerance_value)}% ${humanise(instrument.tolerance_type)}`, sy2)

  bx += statsW + BG
  // Adjustment box
  const adjColor = record.adjustment_made ? MARG_C : [100, 116, 139]
  doc.setFillColor(...adjColor)
  doc.roundedRect(bx, y, 35, BH, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5)
  doc.text('ADJUSTMENT', bx + 17.5, y + 5.5, { align: 'center' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text(record.adjustment_made ? 'YES' : 'NO', bx + 17.5, y + 14, { align: 'center' })

  y += BH + 4

  // Decision rule
  doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(...SLATE)
  doc.text(
    'Decision rule: PASS = all points within tolerance | MARGINAL = all within tolerance, ≥1 point in 80–100% of tolerance | FAIL = any point exceeds tolerance',
    MARGIN, y,
  )
  y += 6

  // ── 5. Notes ─────────────────────────────────────────────────────────────
  const hasNotes = record.technician_notes || record.adjustment_notes || record.defect_description
  if (hasNotes) {
    y = sectionTitle(doc, '5. Notes & Observations', y)
    y += 2
    if (record.adjustment_notes)   { field(doc, 'Adjustment Notes:', record.adjustment_notes,   col1, y, LW); y += 6 }
    if (record.defect_description) { field(doc, 'Defect Found:',     record.defect_description, col1, y, LW); y += 6 }
    if (record.technician_notes)   { field(doc, 'Technician Notes:', record.technician_notes,   col1, y, LW); y += 6 }
  }

  // ── 6. Certification ─────────────────────────────────────────────────────
  const certSectionY = Math.max(y + 4, PAGE_H - 68)
  y = sectionTitle(doc, '6. Certification & Approval', certSectionY)
  y += 3

  // Traceability callout
  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(147, 197, 253)
  doc.roundedRect(MARGIN, y, CONTENT_W, 13, 2, 2, 'FD')
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(30, 64, 175)
  doc.text(
    'Traceability Statement: Calibration results are traceable to the International System of Units (SI) per ISO/IEC 17025:2017 through an ' +
    'unbroken chain of NATA-accredited or equivalent reference standards with documented measurement uncertainties. ' +
    'Expanded uncertainty U is reported at coverage factor k = 2 (≈95% confidence level). Decision rule per JCGM 106:2012.',
    MARGIN + 3, y + 4.5, { maxWidth: CONTENT_W - 6 },
  )
  y += 16

  // Compliance standards banner
  const isSIS = instrument.criticality === 'safety_critical'
  const standards = isSIS
    ? 'ISO/IEC 17025:2017  ·  NATA Accreditation  ·  IEC 61511-1:2016 / AS 61511.1:2021 (SIS)  ·  AS ISO 9001:2016  ·  JCGM 106:2012'
    : 'ISO/IEC 17025:2017  ·  NATA Accreditation  ·  AS ISO 9001:2016  ·  JCGM 106:2012'

  const stdBg = isSIS ? [255, 235, 238] : [240, 253, 244]
  const stdBd = isSIS ? [198,  40,  40] : [22, 101,  52]
  const stdTx = isSIS ? [198,  40,  40] : [22, 101,  52]

  doc.setFillColor(...stdBg)
  doc.setDrawColor(...stdBd)
  doc.roundedRect(MARGIN, y, CONTENT_W, isSIS ? 16 : 9, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...stdTx)
  doc.text('Applicable Standards:', MARGIN + 3, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(standards, MARGIN + 3, y + 9.5, { maxWidth: CONTENT_W - 6 })
  if (isSIS) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6)
    doc.text(
      '⚠  SIS / Safety Critical — Proof test records must be retained per IEC 61511-1:2016 §16.2. This certificate forms part of the functional safety lifecycle documentation.',
      MARGIN + 3, y + 14, { maxWidth: CONTENT_W - 6 },
    )
  }
  y += isSIS ? 19 : 12

  // Signature boxes
  const sigW = (CONTENT_W - 8) / 2
  const sigH = 22

  // Technician
  doc.setFillColor(...LIGHT); doc.setDrawColor(...BORDER)
  doc.rect(MARGIN, y, sigW, sigH, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...NAVY)
  doc.text('PERFORMED BY', MARGIN + 3, y + 5)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...DARK)
  doc.text(record.technician_name || '—', MARGIN + 3, y + 11)
  doc.setFontSize(7); doc.setTextColor(...SLATE)
  doc.text(`Date: ${fmtDate(record.calibration_date)}`, MARGIN + 3, y + 16.5)
  doc.setDrawColor(180, 190, 200)
  doc.line(MARGIN + 3, y + 20.5, MARGIN + sigW - 3, y + 20.5)
  doc.setFontSize(6); doc.text('Signature', MARGIN + 3, y + sigH - 0.5)

  // Approver
  const sig2x = MARGIN + sigW + 8
  doc.setFillColor(...LIGHT); doc.setDrawColor(...BORDER)
  doc.rect(sig2x, y, sigW, sigH, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...NAVY)
  doc.text('APPROVED BY', sig2x + 3, y + 5)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...DARK)
  doc.text(record.approved_by || '(Pending Approval)', sig2x + 3, y + 11)
  doc.setFontSize(7); doc.setTextColor(...SLATE)
  doc.text(`Date: ${record.approved_at ? fmtDate(record.approved_at) : '—'}`, sig2x + 3, y + 16.5)
  doc.setDrawColor(180, 190, 200)
  doc.line(sig2x + 3, y + 20.5, sig2x + sigW - 3, y + 20.5)
  doc.setFontSize(6); doc.text('Signature', sig2x + 3, y + sigH - 0.5)

  drawFooter(doc, 1, 1, instrument.criticality === 'safety_critical')

  doc.save(`CalCert_${instrument.tag_number}_${record.calibration_date ?? 'unknown'}.pdf`)
}

// ─── 2. Multi-Calibration History Report ─────────────────────────────────────

export async function generateMultiCalibrationReport(instrument, records, siteName = '') {
  const doc      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const rptNum   = `RPT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${instrument.tag_number}`
  const issueDate = fmtDate(new Date().toISOString())
  const sorted   = [...(records ?? [])].sort((a, b) => new Date(b.calibration_date) - new Date(a.calibration_date))

  const col1 = MARGIN + 2
  const col2 = MARGIN + CONTENT_W / 2 + 2
  const LW   = 40

  // ── PAGE 1: Summary ───────────────────────────────────────────────────────
  let y = drawPageHeader(doc, 'CALIBRATION HISTORY REPORT', rptNum, issueDate, siteName)

  y = sectionTitle(doc, 'Instrument Summary', y)
  let ya = y + 2, yb = y + 2

  ya = field(doc, 'Tag Number:',   instrument.tag_number,  col1, ya, LW)
  ya = field(doc, 'Description:',  instrument.description, col1, ya, LW)
  ya = field(doc, 'Area / Unit:',  [instrument.area, instrument.unit].filter(Boolean).join(' / '), col1, ya, LW)
  ya = field(doc, 'Manufacturer:', instrument.manufacturer, col1, ya, LW)
  ya = field(doc, 'Model:',        instrument.model,        col1, ya, LW)
  ya = field(doc, 'Serial No.:',   instrument.serial_number, col1, ya, LW)

  yb = field(doc, 'Type:',         humanise(instrument.instrument_type), col2, yb, LW)
  yb = field(doc, 'Range:',        `${fmt(instrument.measurement_lrv)} to ${fmt(instrument.measurement_urv)} ${instrument.engineering_units ?? ''}`, col2, yb, LW)
  yb = field(doc, 'Tolerance:',    `±${fmt(instrument.tolerance_value)} ${humanise(instrument.tolerance_type)}`, col2, yb, LW)
  yb = field(doc, 'Cal Interval:', instrument.calibration_interval_days ? `${instrument.calibration_interval_days} days` : '—', col2, yb, LW)
  yb = field(doc, 'Last Cal Date:', fmtDate(instrument.last_calibration_date), col2, yb, LW)
  yb = field(doc, 'Next Due:',     fmtDate(instrument.calibration_due_date), col2, yb, LW)

  y = Math.max(ya, yb) + 4

  // Stats strip
  y = sectionTitle(doc, 'Performance Summary', y)
  y += 3

  const total    = sorted.length
  const passes   = sorted.filter(r => r.as_found_result === 'pass').length
  const margs    = sorted.filter(r => r.as_found_result === 'marginal').length
  const fails    = sorted.filter(r => r.as_found_result === 'fail').length
  const passPct  = total > 0 ? Math.round((passes / total) * 100) : 0

  const SW = (CONTENT_W - 15) / 4
  const statsData = [
    { label: 'Total Calibrations', value: total,  color: NAVY    },
    { label: 'As-Found Pass',      value: passes, color: PASS_C  },
    { label: 'As-Found Marginal',  value: margs,  color: MARG_C  },
    { label: 'As-Found Fail',      value: fails,  color: FAIL_C  },
  ]

  statsData.forEach((s, i) => {
    const sx = MARGIN + i * (SW + 5)
    doc.setFillColor(...s.color)
    doc.roundedRect(sx, y, SW, 17, 2, 2, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5)
    doc.text(s.label, sx + SW / 2, y + 5.5, { align: 'center' })
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text(String(s.value), sx + SW / 2, y + 14, { align: 'center' })
  })
  y += 21

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY)
  doc.text(`Overall As-Found Pass Rate: ${passPct}%`, MARGIN, y)
  y += 8

  // ── Trend chart ───────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'Error Trend Analysis', y)
  y += 2
  y = drawTrendChart(doc, sorted, instrument, y)

  // ── History table ─────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'Calibration History (All Records)', y)

  autoTable(doc, {
    startY: y + 1,
    head: [['Date', 'Type', 'Technician', 'As Found', 'As Left', 'Max Error %', 'Adj.', 'Status', 'Cert Ref']],
    body: sorted.map(r => [
      fmtDate(r.calibration_date),
      humanise(r.calibration_type),
      r.technician_name || '—',
      (r.as_found_result ?? '—').toUpperCase(),
      (r.as_left_result  ?? '—').toUpperCase(),
      r.max_as_found_error_pct != null ? `${fmt(r.max_as_found_error_pct)}%` : '—',
      r.adjustment_made ? 'Yes' : 'No',
      humanise(r.record_status),
      certNumber(r.id, r.calibration_date),
    ]),
    theme: 'striped',
    styles:     { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { textColor: DARK },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const v = String(data.cell.raw ?? '').toLowerCase()
      if (data.column.index === 3 || data.column.index === 4) {
        if      (v === 'pass')     { data.cell.styles.textColor = PASS_C; data.cell.styles.fontStyle = 'bold' }
        else if (v === 'fail')     { data.cell.styles.textColor = FAIL_C; data.cell.styles.fontStyle = 'bold' }
        else if (v === 'marginal') { data.cell.styles.textColor = MARG_C; data.cell.styles.fontStyle = 'bold' }
      }
    },
    margin:     { left: MARGIN, right: MARGIN },
    didDrawPage: () => {
      drawFooter(doc, doc.internal.getCurrentPageInfo().pageNumber, sorted.length + 1, instrument.criticality === 'safety_critical')
    },
  })

  // ── Detailed pages — one per calibration record ───────────────────────────
  sorted.forEach((record, idx) => {
    doc.addPage()
    const cn = certNumber(record.id, record.calibration_date)
    let ry = drawPageHeader(doc, `CALIBRATION RECORD ${idx + 1} OF ${sorted.length}`, cn, issueDate, siteName)

    ry = sectionTitle(doc, 'Instrument & Calibration Details', ry)
    let ra = ry + 2, rb = ry + 2

    ra = field(doc, 'Tag Number:',      instrument.tag_number,          col1, ra, LW)
    ra = field(doc, 'Calibration Date:', fmtDate(record.calibration_date), col1, ra, LW)
    ra = field(doc, 'Type:',             humanise(record.calibration_type), col1, ra, LW)
    ra = field(doc, 'Technician:',       record.technician_name,         col1, ra, LW)
    ra = field(doc, 'Work Order:',       record.work_order_reference || 'N/A', col1, ra, LW)

    rb = field(doc, 'Reference Standard:', record.reference_standard_description || 'N/A', col2, rb, LW)
    rb = field(doc, 'Standard Serial:',    record.reference_standard_serial || 'N/A',      col2, rb, LW)
    rb = field(doc, 'Certificate No.:',    record.reference_standard_cert_number || 'N/A', col2, rb, LW)
    rb = field(doc, 'Cert Expiry:',        fmtDate(record.reference_standard_cert_expiry), col2, rb, LW)
    rb = field(doc, 'Approved By:',        record.approved_by || 'Pending Approval',       col2, rb, LW)

    ry = Math.max(ra, rb) + 4

    ry = sectionTitle(doc, 'Test Data', ry)

    // Calibration scale strip
    const rlrv  = instrument.measurement_lrv ?? 0
    const rurv  = instrument.measurement_urv ?? 100
    const rspan = rurv - rlrv || 1
    const reu   = instrument.engineering_units ?? ''

    doc.setFillColor(239, 246, 255)
    doc.setDrawColor(147, 197, 253)
    doc.roundedRect(MARGIN, ry + 1, CONTENT_W, 9, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(30, 64, 175)
    doc.text(
      `Calibration Scale:  LRV = ${fmt(rlrv)} ${reu}  |  URV = ${fmt(rurv)} ${reu}  |  Span = ${fmt(rspan)} ${reu}  |  Output: ${instrument.output_type ?? 'N/A'}`,
      PAGE_W / 2, ry + 6.5, { align: 'center' },
    )
    ry += 12

    autoTable(doc, {
      startY: ry + 1,
      head: [['Pt', '% Input', `Input\n(${reu})`, 'Expected\nOutput', 'As-Found\nOutput', 'Error\n(units)', 'Error\n% Span', 'AF\nResult', 'As-Left\nOutput', 'AL\nError %', 'AL\nResult']],
      body: (record.test_points ?? []).map(tp => {
        const pct = rlrv != null && rurv != null
          ? `${(((tp.nominal_input - rlrv) / rspan) * 100).toFixed(0)}%`
          : '—'
        return [
          tp.point_number,
          pct,
          fmt(tp.nominal_input),
          fmt(tp.expected_output),
          fmt(tp.as_found_output),
          fmt(tp.as_found_error_abs),
          tp.as_found_error_pct != null ? `${fmt(tp.as_found_error_pct)}%` : '—',
          (tp.as_found_result ?? '—').toUpperCase(),
          tp.as_left_output != null ? fmt(tp.as_left_output) : '—',
          tp.as_left_error_pct != null ? `${fmt(tp.as_left_error_pct)}%` : '—',
          (tp.as_left_result ?? '—').toUpperCase(),
        ]
      }),
      theme: 'grid',
      styles:     { fontSize: 7.5, cellPadding: 2.2, font: 'helvetica', lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7, halign: 'center' },
      bodyStyles: { textColor: DARK },
      columnStyles: {
        0: { halign: 'center', cellWidth: 7 },
        1: { halign: 'center', cellWidth: 13 },
        7: { halign: 'center' },
        10: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return
        const v = String(data.cell.raw ?? '').toLowerCase()
        if (data.column.index === 7 || data.column.index === 10) {
          if      (v === 'pass')     { data.cell.styles.textColor = PASS_C; data.cell.styles.fontStyle = 'bold' }
          else if (v === 'fail')     { data.cell.styles.textColor = FAIL_C; data.cell.styles.fontStyle = 'bold' }
          else if (v === 'marginal') { data.cell.styles.textColor = MARG_C; data.cell.styles.fontStyle = 'bold' }
        }
      },
      margin: { left: MARGIN, right: MARGIN },
    })

    ry = doc.lastAutoTable.finalY + 5

    // Result boxes
    const BW = 40, BH = 18, BG = 5
    let bx = MARGIN + 2
    resultBox(doc, 'AS FOUND', record.as_found_result, bx, ry, BW, BH)
    bx += BW + BG
    resultBox(doc, 'AS LEFT',  record.as_left_result,  bx, ry, BW, BH)

    if (record.technician_notes) {
      ry += BH + 5
      sectionTitle(doc, 'Technician Notes', ry)
      ry += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...DARK)
      doc.text(record.technician_notes, MARGIN + 2, ry, { maxWidth: CONTENT_W - 4 })
    }

    drawFooter(doc, doc.internal.getCurrentPageInfo().pageNumber, sorted.length + 1, instrument.criticality === 'safety_critical')
  })

  // Fix page counts on all pages (autoTable can add pages mid-render)
  const total2 = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total2; p++) {
    doc.setPage(p)
    doc.setFillColor(...WHITE)
    doc.rect(PAGE_W - MARGIN - 30, PAGE_H - 7, 30, 5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...SLATE)
    doc.text(`Page ${p} of ${total2}  |  Generated by CalCheq on ${fmtDate(new Date().toISOString())}`,
      PAGE_W - MARGIN, PAGE_H - 3.5, { align: 'right' })
  }

  doc.save(`CalHistoryReport_${instrument.tag_number}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
