/**
 * CalibrationReport.jsx
 * Single-calibration certificate — professional A4 format.
 * Opened in a new tab; sidebar is not rendered (route is outside /app layout).
 * Users click "Print / Save as PDF" to export.
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { calibrations as calApi, instruments as instrApi } from '../utils/api'
import { fmtDate, fmtNum, fmtPct, humanise } from '../utils/formatting'

// ── Colour helpers ─────────────────────────────────────────────────────────────

function resultBg(result) {
  if (result === 'pass')     return '#dcfce7'
  if (result === 'fail')     return '#fee2e2'
  if (result === 'marginal') return '#fef3c7'
  return '#f1f5f9'
}
function resultColor(result) {
  if (result === 'pass')     return '#15803d'
  if (result === 'fail')     return '#b91c1c'
  if (result === 'marginal') return '#b45309'
  return '#64748b'
}
function resultLabel(result) {
  if (!result || result === 'not_calibrated') return '—'
  if (result === 'not_required') return 'N/R'
  return result.toUpperCase()
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Row({ label, value, mono = false }) {
  return (
    <tr>
      <td style={{ padding: '4px 8px', fontSize: 11, color: '#64748b', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
        width: '40%', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ padding: '4px 8px', fontSize: 12, color: '#1e293b',
        fontFamily: mono ? 'monospace' : 'inherit', verticalAlign: 'top' }}>
        {value ?? '—'}
      </td>
    </tr>
  )
}

function SectionHeading({ children }) {
  return (
    <div style={{
      background: '#1e3a5f', color: '#fff', fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '6px 12px', marginTop: 18, marginBottom: 0,
    }}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '4px solid #dbeafe', borderTopColor: '#2563eb',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CalibrationReport() {
  const { id } = useParams()
  const [rec,    setRec]    = useState(null)
  const [instr,  setInstr]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]  = useState(null)

  useEffect(() => {
    if (!id) return
    calApi.get(id)
      .then(r => {
        setRec(r)
        return instrApi.get(r.instrument_id)
      })
      .then(i => { setInstr(i); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  if (loading) return <Spinner />
  if (error) return (
    <div style={{ padding: 40, color: '#b91c1c', fontFamily: 'sans-serif' }}>
      <strong>Error loading calibration record:</strong> {error}
      <br /><Link to="/app" style={{ color: '#2563eb' }}>← Back to app</Link>
    </div>
  )
  if (!rec || !instr) return null

  const certNumber = `CAL-${rec.id.slice(0, 8).toUpperCase()}`
  const printDate  = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  const pts        = rec.test_points ?? []
  const site       = instr.created_by ?? ''

  // Tolerance display
  const tolDisplay = instr.tolerance_value != null
    ? `±${instr.tolerance_value} ${humanise(instr.tolerance_type ?? '')}`
    : '—'

  return (
    <>
      {/* ── Print/screen styles ─────────────────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }

        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
        }
        @media screen {
          .report-wrap { max-width: 860px; margin: 0 auto; padding: 24px 24px 60px; }
        }
      `}</style>

      {/* ── Screen-only toolbar ─────────────────────────────────────────── */}
      <div className="no-print" style={{
        background: '#1e3a5f', color: '#fff', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>CalTrack Pro</span>
          <span style={{ opacity: 0.5, fontSize: 14 }}>|</span>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Calibration Certificate — {certNumber}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.close()}
            style={{
              padding: '7px 16px', border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent', color: '#fff', borderRadius: 6,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            ← Close
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '7px 18px', background: '#2563eb', border: 'none',
              color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13,
              fontWeight: 600,
            }}
          >
            🖨 Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ── Certificate ─────────────────────────────────────────────────── */}
      <div className="report-wrap">
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>

          {/* ── Certificate header ─────────────────────────────────────── */}
          <div style={{
            background: '#1e3a5f', color: '#fff',
            padding: '20px 24px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: 4 }}>
                Calibration Management System
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                CalTrack Pro
              </div>
              {site && (
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{site}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, opacity: 0.65, textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 4 }}>
                Calibration Certificate
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 4 }}>
                {certNumber}
              </div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>
                Issued: {printDate}
              </div>
            </div>
          </div>

          {/* ── Result banner ──────────────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0',
          }}>
            {[
              { label: 'As-Found Result', value: rec.as_found_result },
              { label: 'As-Left Result',  value: rec.as_left_result },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, padding: '10px 16px', textAlign: 'center',
                background: resultBg(value),
                borderRight: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: resultColor(value) }}>
                  {resultLabel(value)}
                </div>
              </div>
            ))}
            <div style={{ flex: 1, padding: '10px 16px', textAlign: 'center',
              background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Max As-Found Error
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>
                {fmtPct(rec.max_as_found_error_pct, 2)}
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px 16px', textAlign: 'center',
              background: rec.adjustment_made ? '#fef3c7' : '#f8fafc' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Adjustment Made
              </div>
              <div style={{ fontSize: 20, fontWeight: 800,
                color: rec.adjustment_made ? '#b45309' : '#64748b' }}>
                {rec.adjustment_made ? 'YES' : 'NO'}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 0 20px' }}>

            {/* ── Two-column: Instrument ID + Calibration Details ──────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
              borderBottom: '1px solid #e2e8f0' }}>

              {/* Instrument Identification */}
              <div style={{ borderRight: '1px solid #e2e8f0' }}>
                <SectionHeading>Instrument Identification</SectionHeading>
                <table style={{ width: '100%', borderCollapse: 'collapse', padding: '8px 12px' }}>
                  <tbody>
                    <Row label="Tag Number"       value={instr.tag_number} mono />
                    <Row label="Description"      value={instr.description} />
                    <Row label="Area / Location"  value={[instr.area, instr.unit].filter(Boolean).join(' · ') || null} />
                    <Row label="Instrument Type"  value={humanise(instr.instrument_type)} />
                    <Row label="Manufacturer"     value={instr.manufacturer} />
                    <Row label="Model"            value={instr.model} />
                    <Row label="Serial Number"    value={instr.serial_number} mono />
                    <Row label="Criticality"      value={humanise(instr.criticality)} />
                  </tbody>
                </table>
              </div>

              {/* Calibration Details */}
              <div>
                <SectionHeading>Calibration Details</SectionHeading>
                <table style={{ width: '100%', borderCollapse: 'collapse', padding: '8px 12px' }}>
                  <tbody>
                    <Row label="Calibration Date"  value={fmtDate(rec.calibration_date)} />
                    <Row label="Calibration Type"  value={humanise(rec.calibration_type)} />
                    <Row label="Technician"        value={rec.technician_name} />
                    <Row label="Work Order"        value={rec.work_order_reference} mono />
                    <Row label="Procedure Used"    value={rec.procedure_used || instr.procedure_reference} mono />
                    <Row label="Cal. Interval"     value={instr.calibration_interval_days ? `${instr.calibration_interval_days} days` : null} />
                    <Row label="Next Due"          value={fmtDate(instr.calibration_due_date)} />
                    <Row label="Record Status"     value={humanise(rec.record_status)} />
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Measurement Range & Tolerance ────────────────────────── */}
            <SectionHeading>Measurement Range &amp; Tolerance</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
              {[
                ['Range LRV', instr.measurement_lrv != null ? `${instr.measurement_lrv} ${instr.engineering_units ?? ''}` : null],
                ['Range URV', instr.measurement_urv != null ? `${instr.measurement_urv} ${instr.engineering_units ?? ''}` : null],
                ['Engineering Units', instr.engineering_units],
                ['Output Type', instr.output_type],
                ['Tolerance', tolDisplay],
                ['Tolerance Type', humanise(instr.tolerance_type)],
                ['Test Points', instr.num_test_points],
                ['Output Span', (instr.measurement_lrv != null && instr.measurement_urv != null)
                  ? `${(instr.measurement_urv - instr.measurement_lrv).toFixed(3)} ${instr.engineering_units ?? ''}` : null],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '8px 12px', borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: '#1e293b', fontFamily: 'monospace' }}>
                    {value ?? '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Reference Standard ───────────────────────────────────── */}
            {rec.reference_standard_description && (
              <>
                <SectionHeading>Reference Standard &amp; Traceability</SectionHeading>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  <div style={{ borderRight: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <Row label="Description"       value={rec.reference_standard_description} />
                        <Row label="Serial Number"     value={rec.reference_standard_serial} mono />
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <Row label="Certificate No."   value={rec.reference_standard_cert_number} mono />
                        <Row label="Certificate Expiry" value={fmtDate(rec.reference_standard_cert_expiry)} />
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ padding: '8px 12px', fontSize: 11, color: '#475569',
                  background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                  fontStyle: 'italic' }}>
                  <strong>Traceability:</strong> Measurements are metrologically traceable to the International
                  System of Units (SI) through the National Measurement Institute of Australia (NMIA) or a
                  NATA-accredited laboratory. A documented chain of calibration exists from the reference
                  standard to the instrument under test.
                </div>
              </>
            )}

            {/* ── Test Points ──────────────────────────────────────────── */}
            {pts.length > 0 && (
              <>
                <SectionHeading>Test Point Data — As Found &amp; As Left</SectionHeading>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: '#334155', color: '#fff' }}>
                        {/* Shared columns */}
                        <th rowSpan={2} style={thStyle}>Pt</th>
                        <th rowSpan={2} style={thStyle}>Nominal Input</th>
                        <th rowSpan={2} style={thStyle}>Expected Output</th>
                        <th rowSpan={2} style={{ ...thStyle, borderRight: '2px solid #64748b' }}>Tolerance</th>
                        {/* As-Found group */}
                        <th colSpan={4} style={{ ...thStyle, background: '#1e3a5f', textAlign: 'center',
                          borderBottom: '1px solid #475569' }}>
                          AS FOUND (Pre-Adjustment)
                        </th>
                        {/* As-Left group */}
                        <th colSpan={4} style={{ ...thStyle, background: '#065f46', textAlign: 'center',
                          borderBottom: '1px solid #475569' }}>
                          AS LEFT (Post-Adjustment)
                        </th>
                      </tr>
                      <tr style={{ background: '#475569', color: '#e2e8f0' }}>
                        <th style={thStyle}>Output</th>
                        <th style={thStyle}>Error (Abs)</th>
                        <th style={thStyle}>Error (%Span)</th>
                        <th style={{ ...thStyle, borderRight: '2px solid #64748b' }}>Result</th>
                        <th style={thStyle}>Output</th>
                        <th style={thStyle}>Error (Abs)</th>
                        <th style={thStyle}>Error (%Span)</th>
                        <th style={thStyle}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pts.map((tp, idx) => (
                        <tr key={tp.point_number ?? idx}
                          style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={tdStyle}>{tp.point_number}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtNum(tp.nominal_input)}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtNum(tp.expected_output)}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', borderRight: '2px solid #e2e8f0' }}>
                            {tolDisplay}
                          </td>
                          {/* As Found */}
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>
                            {fmtNum(tp.as_found_output)}
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                            {fmtNum(tp.as_found_error_abs)}
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                            {fmtPct(tp.as_found_error_pct, 2)}
                          </td>
                          <td style={{
                            ...tdStyle, fontWeight: 700, textAlign: 'center',
                            borderRight: '2px solid #e2e8f0',
                            background: resultBg(tp.as_found_result),
                            color: resultColor(tp.as_found_result),
                          }}>
                            {resultLabel(tp.as_found_result)}
                          </td>
                          {/* As Left */}
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>
                            {tp.as_left_output != null ? fmtNum(tp.as_left_output) : '—'}
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                            {tp.as_left_error_abs != null ? fmtNum(tp.as_left_error_abs) : '—'}
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                            {tp.as_left_error_pct != null ? fmtPct(tp.as_left_error_pct, 2) : '—'}
                          </td>
                          <td style={{
                            ...tdStyle, fontWeight: 700, textAlign: 'center',
                            background: tp.as_left_result ? resultBg(tp.as_left_result) : 'transparent',
                            color: tp.as_left_result ? resultColor(tp.as_left_result) : '#94a3b8',
                          }}>
                            {resultLabel(tp.as_left_result)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Foot row — max errors */}
                    <tfoot>
                      <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={4} style={{ ...tdStyle, fontWeight: 700, color: '#475569' }}>
                          Maximum Error
                        </td>
                        <td colSpan={3} />
                        <td style={{ ...tdStyle, fontWeight: 800, textAlign: 'center',
                          borderRight: '2px solid #e2e8f0',
                          background: resultBg(rec.as_found_result),
                          color: resultColor(rec.as_found_result) }}>
                          {fmtPct(rec.max_as_found_error_pct, 2)}
                        </td>
                        <td colSpan={3} />
                        <td style={{ ...tdStyle, fontWeight: 800, textAlign: 'center',
                          background: resultBg(rec.as_left_result),
                          color: resultColor(rec.as_left_result) }}>
                          {rec.max_as_left_error_pct != null ? fmtPct(rec.max_as_left_error_pct, 2) : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* ── Adjustment Details ───────────────────────────────────── */}
            {rec.adjustment_made && (
              <>
                <SectionHeading>Adjustment Details</SectionHeading>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <Row label="Adjustment Type"  value={humanise(rec.adjustment_type)} />
                    <Row label="Adjustment Notes" value={rec.adjustment_notes} />
                  </tbody>
                </table>
              </>
            )}

            {/* ── Defect / Notes ───────────────────────────────────────── */}
            {(rec.defect_found || rec.technician_notes) && (
              <>
                <SectionHeading>Observations &amp; Notes</SectionHeading>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {rec.defect_found && (
                      <>
                        <Row label="Defect Found"       value="YES" />
                        <Row label="Defect Description" value={rec.defect_description} />
                        <Row label="Return to Service"  value={rec.return_to_service ? 'Yes' : 'No'} />
                      </>
                    )}
                    {rec.technician_notes && (
                      <Row label="Technician Notes" value={rec.technician_notes} />
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* ── Authorisation ────────────────────────────────────────── */}
            <SectionHeading>Authorisation &amp; Approval</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {/* Performed by */}
              <div style={{ borderRight: '1px solid #e2e8f0', padding: '12px 16px' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Performed By
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  {rec.technician_name || '—'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Calibration Date: {fmtDate(rec.calibration_date)}
                </div>
                <div style={{ marginTop: 24, borderTop: '1px solid #cbd5e1', paddingTop: 4,
                  fontSize: 10, color: '#94a3b8' }}>
                  Signature / Date
                </div>
              </div>
              {/* Approved by */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Approved By
                </div>
                {rec.record_status === 'approved' && rec.approved_by ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                      ✓ {rec.approved_by}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Approval Date: {fmtDate(rec.approved_at)}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                    {rec.record_status === 'submitted' ? 'Pending approval' :
                     rec.record_status === 'rejected'  ? 'Record rejected' :
                     'Not yet submitted for approval'}
                  </div>
                )}
                <div style={{ marginTop: 24, borderTop: '1px solid #cbd5e1', paddingTop: 4,
                  fontSize: 10, color: '#94a3b8' }}>
                  Signature / Date
                </div>
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <div style={{
              marginTop: 8, padding: '10px 16px', background: '#f8fafc',
              borderTop: '2px solid #e2e8f0', fontSize: 10, color: '#94a3b8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>
                Certificate {certNumber} · Generated by CalTrack Pro · {printDate}
              </span>
              <span>
                Results relate only to the instrument identified above under the conditions of calibration.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Table styles ───────────────────────────────────────────────────────────────

const thStyle = {
  padding: '6px 8px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.04em',
  borderRight: '1px solid #475569',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '5px 8px',
  borderBottom: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
  fontSize: 11,
  color: '#1e293b',
}
