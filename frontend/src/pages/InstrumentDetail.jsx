import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { instruments as instrApi, calibrations as calApi } from '../utils/api'
import { CalStatusBadge, ResultBadge, RecordStatusBadge, CriticalityBadge } from '../components/Badges'
import { fmtDate, fmtPct, fmtNum, humanise } from '../utils/formatting'
import TrendCharts from '../components/TrendCharts'
import { getUser, canApprove, canEdit, canCalibrate } from '../utils/userContext'
import { generateSingleCalibrationCert, generateMultiCalibrationReport } from '../utils/reportGenerator'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Dot,
} from 'recharts'

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide-out calibration detail panel
// ─────────────────────────────────────────────────────────────────────────────

function SlidePanel({ recordId, instrument, onClose, onRefresh }) {
  const [rec, setRec]           = useState(null)
  const [loading, setLd]        = useState(true)
  const [actioning, setAct]     = useState(false)
  const [actionErr, setActErr]  = useState('')
  const [generating, setGenPdf] = useState(false)
  const currentUser = getUser()

  async function handleDownloadCert() {
    if (!rec || !instrument) return
    setGenPdf(true)
    try {
      await generateSingleCalibrationCert(instrument, rec, getUser()?.siteName ?? '')
    } finally {
      setGenPdf(false)
    }
  }

  function loadRecord() {
    setLd(true)
    calApi.get(recordId)
      .then(r => { setRec(r); setLd(false) })
      .catch(() => setLd(false))
  }

  useEffect(() => {
    if (!recordId) return
    loadRecord()
  }, [recordId])

  async function handleApprove() {
    if (!currentUser) { setActErr('No user selected — click your name in the header to sign in.'); return }
    if (!currentUser.userName) { setActErr('Your name is missing — please sign out and sign in again via the header.'); return }
    setAct(true); setActErr('')
    try {
      await calApi.approve(recordId, currentUser.userName)
      if (onRefresh) onRefresh()
      onClose()
    } catch (e) {
      setActErr(e.message ?? 'Approval failed')
      setAct(false)
    }
  }

  async function handleReject() {
    if (!currentUser) { setActErr('No user selected — click your name in the header to sign in.'); return }
    setAct(true); setActErr('')
    try {
      await calApi.reject(recordId, null)
      if (onRefresh) onRefresh()
      onClose()
    } catch (e) {
      setActErr(e.message ?? 'Rejection failed')
      setAct(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Calibration Record</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <Spinner /> : !rec ? (
            <p className="text-center text-slate-400 py-12">Failed to load record.</p>
          ) : (
            <div className="px-6 py-5 space-y-6">

              {/* Summary row */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Date: </span><strong>{fmtDate(rec.calibration_date)}</strong></div>
                <div><span className="text-slate-500">Type: </span><strong>{humanise(rec.calibration_type)}</strong></div>
                <div><span className="text-slate-500">Technician: </span><strong>{rec.technician_name || '—'}</strong></div>
                <div><span className="text-slate-500">Work Order: </span><strong>{rec.work_order_reference || '—'}</strong></div>
              </div>

              {/* Results */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">As Found</p>
                  <ResultBadge result={rec.as_found_result} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">As Left</p>
                  <ResultBadge result={rec.as_left_result} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Max Error</p>
                  <span className="text-sm font-bold text-slate-700">{fmtPct(rec.max_as_found_error_pct)}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Adj. Made</p>
                  <span className={`text-sm font-bold ${rec.adjustment_made ? 'text-amber-600' : 'text-slate-500'}`}>
                    {rec.adjustment_made ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Reference standard */}
              {rec.reference_standard_description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reference Standard</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Description"  value={rec.reference_standard_description} />
                    <Field label="Serial No."   value={rec.reference_standard_serial} mono />
                    <Field label="Cert No."     value={rec.reference_standard_cert_number} mono />
                    <Field label="Cert Expiry"  value={fmtDate(rec.reference_standard_cert_expiry)} />
                  </div>
                </div>
              )}

              {/* Test points */}
              {rec.test_points?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Test Points ({rec.test_points.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[520px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {['Pt','Input','Expected','As Found','Error','%Span','AF Result','As Left','AL Result'].map(h => (
                            <th key={h} className="px-2 py-2 text-left font-semibold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rec.test_points.map(tp => (
                          <tr key={tp.point_number}>
                            <td className="px-2 py-2 font-mono text-slate-600">{tp.point_number}</td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.nominal_input)}</td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.expected_output)}</td>
                            <td className="px-2 py-2 font-mono font-semibold">{fmtNum(tp.as_found_output)}</td>
                            <td className="px-2 py-2 font-mono text-slate-600">{fmtNum(tp.as_found_error_abs)}</td>
                            <td className="px-2 py-2 font-mono text-slate-600">{fmtPct(tp.as_found_error_pct)}</td>
                            <td className="px-2 py-2"><ResultBadge result={tp.as_found_result} /></td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.as_left_output) === '—' ? '—' : fmtNum(tp.as_left_output)}</td>
                            <td className="px-2 py-2"><ResultBadge result={tp.as_left_result} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {rec.technician_notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{rec.technician_notes}</p>
                </div>
              )}

              {/* Approval info for approved/rejected records */}
              {(rec.record_status === 'approved' || rec.record_status === 'rejected') && rec.approved_by && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${
                  rec.record_status === 'approved'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {rec.record_status === 'approved' ? '✓ Approved' : '✗ Rejected'} by{' '}
                  <strong>{rec.approved_by}</strong>
                  {rec.approved_at && ` on ${fmtDate(rec.approved_at)}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Approve / Reject footer (submitted records, approvers only) ── */}
        {rec && rec.record_status === 'submitted' && canApprove(currentUser) && (
          <div className="border-t border-slate-200 px-6 py-4 flex-shrink-0 bg-slate-50">
            {actionErr && (
              <p className="text-xs text-red-600 mb-3">{actionErr}</p>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Approving as <strong>{currentUser?.userName}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={actioning}
                  className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actioning}
                  className="px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actioning ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Download Certificate footer (all records) ── */}
        {rec && (
          <div className="border-t border-slate-200 px-6 py-3 flex-shrink-0 bg-white">
            <button
              onClick={handleDownloadCert}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
                  </svg>
                  Download Calibration Certificate
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Calibration History', 'Trends', 'Smart Analytics', 'Audit Trail', 'Technical Data']

// ── Smart Analytics (formerly Drift Analysis) ────────────────────────────────

const STATUS_CFG = {
  critical:          { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: '#EF4444', label: '🔴 Critical — Projected to Fail Soon',       icon: '⚠️' },
  warning:           { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: '#F59E0B', label: '🟡 Warning — Drift Trend Detected',          icon: '📈' },
  watch:             { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: '#3B82F6', label: '🔵 Watch — Slow Drift Detected',             icon: '👁' },
  stable:            { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: '#22C55E', label: '✅ Stable — No Significant Drift',           icon: '✅' },
  exceeded:          { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: '#EF4444', label: '🔴 Exceeded — Currently Out of Tolerance',    icon: '🛑' },
  insufficient_data: { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-600',  dot: '#94A3B8', label: 'Insufficient Data',                          icon: '📊' },
}

function _driftRecommendations(data) {
  if (!data?.sufficient_data) return []
  const recs = []
  const { drift_status, drift_rate_per_year, current_error_pct, tolerance_pct, projected_fail_date, record_count } = data

  if (drift_status === 'exceeded') {
    recs.push({ level: 'critical', title: 'Out of Tolerance — Immediate Action Required', body: `The instrument is currently reading ${current_error_pct?.toFixed(2)}% error, exceeding the ${tolerance_pct?.toFixed(2)}% tolerance limit. Remove from service or recalibrate immediately.` })
  } else if (drift_status === 'critical') {
    recs.push({ level: 'critical', title: 'Projected Failure Imminent', body: `At the current drift rate of +${drift_rate_per_year?.toFixed(2)}%/year, this instrument is projected to exceed tolerance by ${projected_fail_date}. Schedule an out-of-cycle calibration now.` })
  } else if (drift_status === 'warning') {
    recs.push({ level: 'advisory', title: 'Drift Trend — Shorten Calibration Interval', body: `Drift rate of +${drift_rate_per_year?.toFixed(2)}%/year detected. Consider reducing the calibration interval to catch this before it goes out of tolerance (projected: ${projected_fail_date}).` })
  } else if (drift_status === 'watch') {
    recs.push({ level: 'optimisation', title: 'Slow Drift — Monitor Closely', body: `A slow drift of +${drift_rate_per_year?.toFixed(2)}%/year is present. No immediate action needed, but continue monitoring. Projected to exceed tolerance ${projected_fail_date ? `around ${projected_fail_date}` : 'well beyond the next service interval'}.` })
  } else if (drift_status === 'stable') {
    recs.push({ level: 'optimisation', title: 'Instrument Performing Well', body: `No significant drift detected across ${record_count} calibration records. Current error is ${current_error_pct?.toFixed(2)}% vs ${tolerance_pct?.toFixed(2)}% tolerance. Consider extending the calibration interval if historical data consistently shows stable performance.` })
  }

  if (drift_rate_per_year < 0) {
    recs.push({ level: 'optimisation', title: 'Improving Trend Detected', body: 'As-found error is actually decreasing over time, which may indicate a previous adjustment is settling. Continue monitoring.' })
  }

  if (record_count >= 5 && drift_status === 'stable') {
    recs.push({ level: 'optimisation', title: 'Candidate for Extended Interval', body: `With ${record_count} consecutive stable calibrations, this instrument meets the criteria for an extended calibration interval review. Verify against your site's interval extension procedure.` })
  }

  return recs
}

function _dotColour(errorPct, tolPct) {
  if (errorPct == null || tolPct == null) return '#94A3B8'
  const ratio = errorPct / tolPct
  if (ratio >= 1.0) return '#EF4444'
  if (ratio >= 0.8) return '#F59E0B'
  return '#22C55E'
}

function SmartAnalytics({ instrumentId }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!instrumentId) return
    setLoading(true)
    instrApi.driftAnalysis(instrumentId)
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [instrumentId])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-sm text-red-700">
      Analysis error: {error}
    </div>
  )
  if (!data) return null

  if (!data.sufficient_data) return (
    <div className="space-y-5 pt-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-8 text-center">
        <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <p className="text-sm font-semibold text-slate-600 mb-1">Insufficient Data for Drift Analysis</p>
        <p className="text-sm text-slate-500">{data.message}</p>
        <p className="text-xs text-slate-400 mt-2">{data.record_count} of 3 required calibration records available</p>
      </div>
    </div>
  )

  const cfg = STATUS_CFG[data.drift_status] || STATUS_CFG.stable
  const recommendations = _driftRecommendations(data)

  // Prepare chart data — annotate each point with a colour
  const chartPoints = (data.data_points || []).map(pt => ({
    ...pt,
    label: pt.date,
    dotColour: _dotColour(pt.error_pct, data.tolerance_pct),
  }))

  // Y-axis max = at least 120% of tolerance so bands are visible
  const yMax = Math.max(
    (data.tolerance_pct || 1) * 1.3,
    ...(data.data_points || []).map(p => p.error_pct || 0),
  ) * 1.1

  const recLevelCfg = {
    critical:     { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700',   icon: '🛑' },
    advisory:     { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700', icon: '⚠️' },
    optimisation: { bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800',  badge: 'bg-blue-100 text-blue-700',  icon: '💡' },
  }

  return (
    <div className="space-y-5 pt-6">

      {/* Status banner */}
      <div className={`${cfg.bg} ${cfg.border} border rounded-xl px-5 py-4 flex items-center gap-4`}>
        <div className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</div>
        <div className="flex-1" />
        {data.projected_fail_date && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Projected to exceed tolerance</p>
            <p className={`text-sm font-bold ${cfg.text}`}>{data.projected_fail_date}</p>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Records Analysed', value: data.record_count },
          { label: 'Current Error',    value: `${data.current_error_pct?.toFixed(2) ?? '—'}%` },
          { label: 'Drift Rate / Year', value: data.drift_rate_per_year > 0
              ? `+${data.drift_rate_per_year?.toFixed(2)}%`
              : `${data.drift_rate_per_year?.toFixed(2)}%` },
          { label: 'Tolerance Limit',  value: `${data.tolerance_pct?.toFixed(2) ?? '—'}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-xl font-extrabold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Drift chart */}
      {chartPoints.length >= 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">As-Found Error Drift Over Time</h3>
          <p className="text-xs text-slate-400 mb-4">Max as-found error per calibration. Green zone = within tolerance, amber = approaching limit (80%), red = out of tolerance.</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1FCAD8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1FCAD8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={v => `${v.toFixed(1)}%`}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                domain={[0, yMax]}
              />
              <Tooltip
                formatter={(value) => [`${value?.toFixed(3)}%`, 'Max Error']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
              {/* Tolerance limit */}
              {data.tolerance_pct != null && (
                <ReferenceLine
                  y={data.tolerance_pct}
                  stroke="#EF4444"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{ value: `Tolerance ${data.tolerance_pct?.toFixed(1)}%`, position: 'insideTopRight', fontSize: 10, fill: '#EF4444' }}
                />
              )}
              {/* Marginal threshold (80% of tolerance) */}
              {data.tolerance_pct != null && (
                <ReferenceLine
                  y={data.tolerance_pct * 0.8}
                  stroke="#F59E0B"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{ value: `Marginal ${(data.tolerance_pct * 0.8)?.toFixed(1)}%`, position: 'insideTopRight', fontSize: 10, fill: '#F59E0B' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="error_pct"
                stroke="#1FCAD8"
                strokeWidth={2.5}
                fill="url(#driftGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  return (
                    <Dot
                      key={payload.date}
                      cx={cx} cy={cy} r={5}
                      fill={payload.dotColour}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  )
                }}
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Recommendations</h3>
          {recommendations.map((rec, idx) => {
            const rc = recLevelCfg[rec.level] || recLevelCfg.optimisation
            return (
              <div key={idx} className={`${rc.bg} ${rc.border} border rounded-xl px-5 py-4`}>
                <div className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{rc.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${rc.text} mb-1`}>{rec.title}</p>
                    <p className={`text-sm ${rc.text} opacity-80`}>{rec.body}</p>
                  </div>
                  <span className={`ml-auto text-xs font-bold uppercase px-2 py-0.5 rounded-full ${rc.badge} shrink-0`}>
                    {rec.level}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">Drift calculated using linear regression on as-found error % across approved and submitted calibration records. Projected failure date is an estimate based on current trend.</p>
    </div>
  )
}

// ── Tab 1: Overview ───────────────────────────────────────────────────────

function TabOverview({ instrument, history }) {
  const i = instrument
  const calCount = history?.total ?? 0

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">

      {/* Instrument details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Instrument Details</h3>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5">
          <Field label="Manufacturer"   value={i.manufacturer} />
          <Field label="Model"          value={i.model} />
          <Field label="Serial Number"  value={i.serial_number} mono />
          <Field label="Type"           value={humanise(i.instrument_type)} />
          <Field label="Output Type"    value={i.output_type} />
          <Field label="Engineering Units" value={i.engineering_units} />
          <Field label="Range (LRV)"    value={i.measurement_lrv != null ? `${i.measurement_lrv} ${i.engineering_units ?? ''}` : null} />
          <Field label="Range (URV)"    value={i.measurement_urv != null ? `${i.measurement_urv} ${i.engineering_units ?? ''}` : null} />
          <Field label="Tolerance"      value={i.tolerance_value != null
            ? `±${i.tolerance_value} ${humanise(i.tolerance_type ?? '')}` : null} />
          <Field label="Test Points"    value={i.num_test_points} />
          <Field label="Interval"       value={i.calibration_interval_days ? `${i.calibration_interval_days} days` : null} />
          <Field label="Procedure Ref"  value={i.procedure_reference} mono />
          <Field label="Criticality"    value={humanise(i.criticality)} />
          <Field label="Area"           value={i.area} />
          <Field label="Unit"           value={i.unit} />
          <Field label="Created By"     value={i.created_by} />
        </dl>
      </div>

      {/* Calibration status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Calibration Status</h3>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Last result — large badge */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">Last Result</span>
            <ResultBadge result={i.last_calibration_result} />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Last Calibration" value={fmtDate(i.last_calibration_date)} />
            <Field label="Next Due"         value={fmtDate(i.calibration_due_date)} />
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {i.alert_status === 'overdue' ? 'Days Overdue' : 'Days Until Due'}
              </dt>
              <dd className={`mt-0.5 text-sm font-bold ${
                i.alert_status === 'overdue'   ? 'text-red-600' :
                i.alert_status === 'due_soon'  ? 'text-amber-600' : 'text-green-600'
              }`}>
                {i.days_overdue > 0   ? `${i.days_overdue} days overdue` :
                 i.days_until_due != null ? `${i.days_until_due} days` : '—'}
              </dd>
            </div>
            <Field label="Calibration Count" value={calCount} />
          </dl>

        </div>
      </div>
    </div>
  )
}

// ── Tab 2: Calibration History ────────────────────────────────────────────

function TabHistory({ history, onView, onCert }) {
  if (!history || history.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-400 text-sm">No calibration records found for this instrument.</p>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date','Technician','As Found','As Left','Max Error %','Adj.','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.results.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{fmtDate(rec.calibration_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{rec.technician_name || '—'}</td>
                  <td className="px-4 py-3"><ResultBadge result={rec.as_found_result} /></td>
                  <td className="px-4 py-3"><ResultBadge result={rec.as_left_result} /></td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {fmtPct(rec.max_as_found_error_pct)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={rec.adjustment_made ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                      {rec.adjustment_made ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><RecordStatusBadge status={rec.record_status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(rec.id)}
                      className="text-xs px-2.5 py-1 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onCert(rec.id)}
                      className="text-xs px-2.5 py-1 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                      title="Download Calibration Certificate"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
                      </svg>
                      Cert
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab 4: Audit Trail ───────────────────────────────────────────────────

const ACTION_COLOURS = {
  create:      'bg-green-100 text-green-700',
  update:      'bg-blue-100 text-blue-700',
  delete:      'bg-red-100 text-red-700',
  submit:      'bg-purple-100 text-purple-700',
  approve:     'bg-green-100 text-green-700',
  reject:      'bg-red-100 text-red-700',
  bulk_import: 'bg-slate-100 text-slate-600',
}

function AuditEntryRow({ entry }) {
  const colour = ACTION_COLOURS[entry.action] ?? 'bg-slate-100 text-slate-600'
  const fields = entry.changed_fields
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {new Date(entry.created_at).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
          {entry.action}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">{entry.entity_type.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{entry.user_name}</td>
      <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-xs truncate">
        {fields ? JSON.stringify(fields) : '—'}
      </td>
    </tr>
  )
}

function TabAuditTrail({ instrumentId }) {
  const [log,     setLog]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!instrumentId) return
    setLoading(true)
    instrApi.auditLog(instrumentId, { limit: 200 })
      .then(data => { setLog(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [instrumentId])

  if (loading) return <Spinner />
  if (error) return <p className="pt-6 text-center text-sm text-slate-400">{error}</p>
  if (!log || log.total === 0) return (
    <div className="pt-6 flex flex-col items-center justify-center py-16 text-center">
      <p className="text-slate-500 text-sm font-medium mb-1">No audit entries yet</p>
      <p className="text-slate-400 text-xs max-w-sm">Audit entries are recorded when actions are taken through the system — edits, calibration submissions, approvals, and deletions will all appear here.</p>
    </div>
  )

  return (
    <div className="pt-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Audit Trail</h3>
          <span className="text-xs text-slate-400">{log.total} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Timestamp','Action','Entity','User','Details'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {log.results.map(entry => (
                <AuditEntryRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab 5: Technical Data ─────────────────────────────────────────────────

function TabTechnical({ instrument: i, userCanEdit }) {
  const ALL_FIELDS = [
    ['id',                       i.id,                        true ],
    ['tag_number',               i.tag_number,                true ],
    ['description',              i.description,               false],
    ['area',                     i.area,                      false],
    ['unit',                     i.unit,                      false],
    ['instrument_type',          humanise(i.instrument_type), false],
    ['manufacturer',             i.manufacturer,              false],
    ['model',                    i.model,                     false],
    ['serial_number',            i.serial_number,             true ],
    ['measurement_lrv',          i.measurement_lrv,           true ],
    ['measurement_urv',          i.measurement_urv,           true ],
    ['engineering_units',        i.engineering_units,         false],
    ['output_type',              i.output_type,               false],
    ['calibration_interval_days',i.calibration_interval_days, false],
    ['tolerance_type',           humanise(i.tolerance_type),  false],
    ['tolerance_value',          i.tolerance_value,           false],
    ['num_test_points',          i.num_test_points,           false],
    ['criticality',              humanise(i.criticality),     false],
    ['status',                   humanise(i.status),          false],
    ['procedure_reference',      i.procedure_reference,       true ],
    ['last_calibration_date',    fmtDate(i.last_calibration_date), false],
    ['last_calibration_result',  humanise(i.last_calibration_result), false],
    ['calibration_due_date',     fmtDate(i.calibration_due_date), false],
    ['created_at',               i.created_at ? new Date(i.created_at).toLocaleString() : '—', false],
    ['updated_at',               i.updated_at ? new Date(i.updated_at).toLocaleString() : '—', false],
    ['created_by',               i.created_by, false],
  ]

  return (
    <div className="pt-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">All Fields</h3>
          {userCanEdit ? (
            <Link
              to={`/app/instruments/${i.id}/edit`}
              className="text-xs px-3 py-1.5 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              Edit
            </Link>
          ) : (
            <button
              disabled
              className="text-xs px-3 py-1.5 border border-slate-200 rounded text-slate-400 cursor-not-allowed"
              title={`Your role (${getUser()?.role ?? 'none'}) cannot edit instruments`}
            >
              Edit
            </button>
          )}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 px-5 py-5">
          {ALL_FIELDS.map(([label, value, mono]) => (
            <Field key={label} label={label} value={value ?? '—'} mono={mono} />
          ))}
        </dl>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

// Map URL ?tab= param values → TABS array indices
const TAB_PARAM_MAP = {
  'overview':       0,
  'history':        1,
  'trends':         2,
  'drift-analysis': 3,
  'audit':          4,
  'technical':      5,
}

export default function InstrumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Resolve initial tab from URL param (e.g. ?tab=drift-analysis)
  const paramTab = searchParams.get('tab')
  const initialTab = TAB_PARAM_MAP[paramTab] ?? 0

  const [instrument,    setInstrument]    = useState(null)
  const [history,       setHistory]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [activeTab,     setActiveTab]     = useState(initialTab)
  const [slideId,       setSlideId]       = useState(null)
  const [genReport,     setGenReport]     = useState(false)

  const fetchData = useCallback(() => {
    if (!id) return
    Promise.all([
      instrApi.get(id),
      instrApi.calibrationHistory(id, { limit: 100 }),
    ])
      .then(([instr, hist]) => {
        setInstrument(instr)
        setHistory(hist)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  if (loading) return <Spinner />
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-slate-600 font-medium mb-2">Failed to load instrument</p>
      <p className="text-slate-400 text-sm mb-4">{error}</p>
      <button onClick={() => navigate('/app/instruments')} className="text-sm text-blue-600 hover:underline">
        ← Back to instruments
      </button>
    </div>
  )
  if (!instrument) return null

  const i = instrument
  const currentUserPage = getUser()
  const userCanEdit      = canEdit(currentUserPage)
  const userCanCalibrate = canCalibrate(currentUserPage)

  async function handleHistoryReport() {
    if (!instrument || !history?.results?.length) return
    setGenReport(true)
    try {
      // Fetch full records so each page has test point data
      const fullRecords = await Promise.all(
        history.results.map(r => calApi.get(r.id))
      )
      await generateMultiCalibrationReport(instrument, fullRecords, getUser()?.siteName ?? '')
    } finally {
      setGenReport(false)
    }
  }

  async function handleSingleCert(recordId) {
    if (!instrument) return
    try {
      const fullRecord = await calApi.get(recordId)
      await generateSingleCalibrationCert(instrument, fullRecord, getUser()?.siteName ?? '')
    } catch (e) {
      console.error('Certificate generation failed:', e)
    }
  }

  // Alert banner conditions
  const isOverdue = i.alert_status === 'overdue'
  const isFailed  = i.last_calibration_result === 'fail'

  return (
    <div className="space-y-0 max-w-6xl">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link to="/app/instruments" className="hover:text-slate-700">Instruments</Link>
        <span>/</span>
        <span className="text-slate-800 font-mono font-semibold">{i.tag_number}</span>
      </nav>

      {/* ── Alert banner ── */}
      {isFailed && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-50 border-red-200 text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          LAST CALIBRATION FAILED — instrument may not be fit for service
        </div>
      )}
      {isOverdue && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-amber-50 border-amber-200 text-amber-700">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          OVERDUE — {i.days_overdue} day{i.days_overdue !== 1 ? 's' : ''} past calibration due date
        </div>
      )}

      {/* ── Header card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold font-mono text-slate-900">{i.tag_number}</h1>
            <CriticalityBadge criticality={i.criticality} size="md" />
            <CalStatusBadge alertStatus={i.alert_status} instrumentStatus={i.status} />
          </div>
          <p className="text-slate-600 text-base">{i.description || '—'}</p>
          {(i.area || i.unit) && (
            <p className="text-sm text-slate-500 mt-0.5">
              {[i.area, i.unit].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          {history?.results?.length > 0 && (
            <button
              onClick={handleHistoryReport}
              disabled={genReport}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {genReport ? (
                <><div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> Generating…</>
              ) : (
                <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
                  </svg>History Report</>
              )}
            </button>
          )}
          {userCanEdit && (
            <Link
              to={`/app/instruments/${i.id}/edit`}
              className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit
            </Link>
          )}
          {userCanCalibrate && (
            <Link
              to={`/app/calibrations/import-csv?instrumentId=${i.id}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Import test point data from a Beamex or Fluke calibrator CSV export"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/>
              </svg>
              Import CSV
            </Link>
          )}
          {userCanCalibrate && (
            <Link
              to={`/app/calibrations/new/${i.id}`}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Calibration
            </Link>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-slate-200 mt-4 bg-white rounded-t-xl -mb-px pt-1 px-2">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === idx
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              {tab}
              {tab === 'Calibration History' && history?.total > 0 && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">
                  {history.total}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 0 && <TabOverview instrument={i} history={history} />}
      {activeTab === 1 && <TabHistory  history={history} onView={setSlideId} onCert={handleSingleCert} />}
      {activeTab === 2 && <TrendCharts instrument={i} history={history?.results ?? []} />}
      {activeTab === 3 && <SmartAnalytics instrumentId={i.id} />}
      {activeTab === 4 && <TabAuditTrail instrumentId={i.id} />}
      {activeTab === 5 && <TabTechnical instrument={i} userCanEdit={userCanEdit} />}

      {/* ── Slide-out panel ── */}
      {slideId && (
        <SlidePanel
          recordId={slideId}
          instrument={instrument}
          onClose={() => setSlideId(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  )
}
