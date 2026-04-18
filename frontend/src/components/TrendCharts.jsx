/**
 * Trend charts for the Instrument Detail page.
 * Uses Recharts to show error-over-time, drift, and summary stats.
 */

import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { fmtDateShort, fmtPct, fmtDate } from '../utils/formatting'

// ── Helpers ────────────────────────────────────────────────────────────────

const RESULT_COLORS = { pass: '#22C55E', marginal: '#F59E0B', fail: '#EF4444' }

function resultColor(result) {
  return RESULT_COLORS[result] ?? '#6B7280'
}

function subDays(iso, n) {
  const d = new Date(iso)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const DATE_RANGES = [
  { label: '1 Year',  days: 365 },
  { label: '3 Years', days: 1095 },
  { label: 'All',     days: null },
]

// ── Custom dot: coloured by result ─────────────────────────────────────────

function ResultDot(props) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null) return null
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={resultColor(payload.result)}
      stroke="#fff"
      strokeWidth={2}
    />
  )
}

// ── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{fmtDate(d.date)}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? resultColor(d.result) }}>
          {p.name}: {fmtPct(p.value, 2)}
        </p>
      ))}
      {d.result && (
        <p className="mt-1 font-bold uppercase" style={{ color: resultColor(d.result) }}>
          {d.result}
        </p>
      )}
      {d.technician && <p className="text-slate-400 mt-0.5">{d.technician}</p>}
    </div>
  )
}

// ── Summary stats ────────────────────────────────────────────────────────────

function StatBox({ label, value, sub, color }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color ?? 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TrendCharts({ instrument, history }) {
  const [rangeIdx,      setRangeIdx]      = useState(0)
  const [showAsLeft,    setShowAsLeft]    = useState(false)

  const todayISO = new Date().toISOString().split('T')[0]
  const range = DATE_RANGES[rangeIdx]

  // Filter and shape history data
  const chartData = useMemo(() => {
    if (!history?.length) return []

    const approved = history
      .filter(r => (r.record_status === 'approved' || r.record_status === 'submitted') && r.calibration_date)
      .filter(r => {
        if (!range.days) return true
        return r.calibration_date >= subDays(todayISO, range.days)
      })
      .sort((a, b) => a.calibration_date.localeCompare(b.calibration_date))

    return approved.map(r => ({
      date:       r.calibration_date,
      label:      fmtDateShort(r.calibration_date),
      asFound:    r.max_as_found_error_pct != null ? Math.abs(r.max_as_found_error_pct) : null,
      asLeft:     r.max_as_left_error_pct  != null ? Math.abs(r.max_as_left_error_pct)  : null,
      result:     r.as_found_result,
      technician: r.technician_name,
      id:         r.id,
    }))
  }, [history, rangeIdx])

  // Drift data — difference between consecutive as-found errors
  const driftData = useMemo(() => {
    return chartData
      .slice(1)
      .map((d, i) => {
        const prev = chartData[i]
        const drift = (d.asFound != null && prev.asFound != null)
          ? d.asFound - prev.asFound
          : null
        return { label: d.label, date: d.date, drift, result: d.result }
      })
      .filter(d => d.drift != null)
  }, [chartData])

  // Summary stats
  const stats = useMemo(() => {
    const vals = chartData.filter(d => d.asFound != null).map(d => d.asFound)
    if (!vals.length) return null
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length
    const max = Math.max(...vals)
    const last = vals[vals.length - 1]
    const trend = vals.length >= 2
      ? (vals[vals.length - 1] > vals[vals.length - 2] ? 'increasing' : 'decreasing')
      : null
    const failCount    = chartData.filter(d => d.result === 'fail').length
    const marginalCount= chartData.filter(d => d.result === 'marginal').length
    return { avg, max, last, trend, failCount, marginalCount, total: vals.length }
  }, [chartData])

  // Tolerance reference lines (expressed as % span — always positive)
  const tolPct = instrument?.tolerance_value ?? null
  const marginalPct = tolPct != null ? tolPct * 0.8 : null

  if (!history?.length || chartData.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-12 text-center text-slate-400">
        <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p className="font-medium text-slate-600 mb-1">Not enough data</p>
        <p className="text-sm">At least 2 approved or submitted calibration records are needed to show trends.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">

        {/* Date range */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {DATE_RANGES.map((r, i) => (
            <button key={r.label} onClick={() => setRangeIdx(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                rangeIdx === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* As-left overlay toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setShowAsLeft(v => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${showAsLeft ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showAsLeft ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-sm text-slate-600">Show As-Left</span>
        </label>

        <div className="flex-1" />

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {Object.entries(RESULT_COLORS).map(([r, c]) => (
            <span key={r} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ background: c }} />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Summary stats ──────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Avg Max Error"   value={fmtPct(stats.avg, 2)}  sub={`${stats.total} records`} />
          <StatBox label="Worst Error"     value={fmtPct(stats.max, 2)}  sub="Maximum observed" color="text-red-600" />
          <StatBox label="Latest Error"    value={fmtPct(stats.last, 2)} sub={stats.trend ? `Trend: ${stats.trend}` : undefined} />
          <StatBox label="Failures"
            value={`${stats.failCount} fail${stats.failCount !== 1 ? 's' : ''}`}
            sub={`${stats.marginalCount} marginal`}
            color={stats.failCount > 0 ? 'text-red-600' : 'text-green-600'}
          />
        </div>
      )}

      {/* ── Chart 1: Error over time ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Max As-Found Error Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              tickFormatter={v => `${v.toFixed(1)}%`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Tolerance band */}
            {tolPct != null && (
              <ReferenceLine y={tolPct} stroke="#EF4444" strokeDasharray="4 2"
                label={{ value: 'Tol', position: 'insideTopRight', fontSize: 10, fill: '#EF4444' }} />
            )}
            {marginalPct != null && (
              <ReferenceLine y={marginalPct} stroke="#F59E0B" strokeDasharray="4 2"
                label={{ value: '80%', position: 'insideTopRight', fontSize: 10, fill: '#F59E0B' }} />
            )}

            <Line
              type="monotone"
              dataKey="asFound"
              name="As-Found"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={<ResultDot />}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
            {showAsLeft && (
              <Line
                type="monotone"
                dataKey="asLeft"
                name="As-Left"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Chart 2: Drift ─────────────────────────────────────────────── */}
      {driftData.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Calibration Drift</h3>
          <p className="text-xs text-slate-400 mb-4">Change in max error between consecutive calibrations (positive = getting worse)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={driftData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `${v.toFixed(1)}%`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(v) => [`${fmtPct(v, 2)}`, 'Drift']}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="drift" name="Drift" radius={[3, 3, 0, 0]}>
                {driftData.map((entry, index) => (
                  <Cell key={index} fill={entry.drift >= 0 ? '#EF4444' : '#22C55E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
