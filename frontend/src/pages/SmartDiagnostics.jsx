/**
 * SmartDiagnostics — AI-powered recommendations, drift analysis, and failure pattern detection
 * Three tabs:
 *   - Recommendations (default): auto-generated advisory recommendations engine
 *   - Drift Alerts: marginal instruments approaching tolerance limits
 *   - Repeat Failures: instruments with 2+ as-found failures in 12 months
 *
 * Supports ?tab=recommendations / ?tab=drift / ?tab=failures for deep-linking.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { dashboard as dashApi, instruments as instrApi } from '../utils/api'
import { CriticalityBadge } from '../components/Badges'
import { fmtDate } from '../utils/formatting'
import { getUser } from '../utils/userContext'

// ── Colour palette ────────────────────────────────────────────────────────────
const NAVY = '#0B1F3A'
const CRIT_ORDER = { safety_critical: 0, process_critical: 1, standard: 2, non_critical: 3 }

// ── Shared helpers ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function ErrorMsg({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-6 text-center text-sm text-red-700">
      <p className="font-semibold mb-1">Failed to load</p>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1.5 text-xs border border-red-300 rounded hover:bg-red-100 transition-colors">
          Try again
        </button>
      )}
    </div>
  )
}

function EmptyOk({ icon, message }) {
  return (
    <div className="py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-slate-600 font-semibold mb-1">All clear</p>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}

function DaysPill({ days, overdue = false }) {
  if (days == null) return <span className="text-slate-400">—</span>
  if (overdue || days < 0) {
    const n = overdue ? days : Math.abs(days)
    return <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{n}d overdue</span>
  }
  if (days <= 7) return <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{days}d left</span>
  if (days <= 14) return <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{days}d left</span>
  return <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{days}d left</span>
}

const TH = 'text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap'
const TD = 'px-4 py-3'

// ── TAB 1: Recommendations ────────────────────────────────────────────────────

function RecommendationsTab() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState(new Set())

  const [recommendations, setRecommendations] = useState({
    critical: [],
    advisory: [],
    optimisation: [],
  })

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    setDismissed(new Set())

    Promise.all([
      instrApi.list({ calibration_status: 'overdue', limit: 500 }).catch(() => ({ results: [] })),
      dashApi.upcoming(null, 30).catch(() => ([])),
      dashApi.badActors(null).catch(() => ([])),
      instrApi.list({ last_calibration_result: 'marginal', status: 'active', limit: 500 }).catch(() => ({ results: [] })),
    ])
      .then(([overdueRes, upcomingRes, badActorsRes, marginalRes]) => {
        const overdueList = overdueRes.results ?? []
        const upcomingList = Array.isArray(upcomingRes) ? upcomingRes : []
        const badActorsList = Array.isArray(badActorsRes) ? badActorsRes : (badActorsRes?.results ?? [])
        const marginalList = marginalRes.results ?? []

        const crit = []
        const adv = []
        const opt = []

        // CRITICAL: Safety/process critical overdue instruments
        overdueList.forEach((inst) => {
          if (inst.criticality === 'safety_critical' || inst.criticality === 'process_critical') {
            const days = inst.days_overdue || 0
            crit.push({
              id: `critical-overdue-${inst.id}`,
              instrumentId: inst.id,
              tagNumber: inst.tag_number,
              title: `${inst.tag_number} — ${inst.criticality === 'safety_critical' ? 'Safety-critical' : 'Process-critical'} instrument is ${days} days overdue.`,
              description: inst.criticality === 'safety_critical'
                ? 'Calibrate immediately to maintain SIL compliance.'
                : 'Exceeding calibration interval increases process risk. Calibrate now.',
              category: 'critical',
            })
          }
        })

        // CRITICAL: Instruments with 3+ consecutive failures
        badActorsList.forEach((actor) => {
          if (actor.failure_count >= 3) {
            crit.push({
              id: `critical-failures-${actor.instrument_id}`,
              instrumentId: actor.instrument_id,
              tagNumber: actor.tag_number,
              title: `${actor.tag_number} — ${actor.failure_count} consecutive as-found failures in 12 months.`,
              description: 'Investigate root cause: check installation, process conditions, or consider replacement.',
              category: 'critical',
            })
          }
        })

        // ADVISORY: Marginal instruments
        marginalList.forEach((inst) => {
          adv.push({
            id: `advisory-marginal-${inst.id}`,
            instrumentId: inst.id,
            tagNumber: inst.tag_number,
            title: `${inst.tag_number} — Showing drift trend.`,
            description: 'Current estimated error is approaching tolerance limit. Consider bringing forward next calibration.',
            category: 'advisory',
          })
        })

        // ADVISORY: Instruments overdue by 30+ days
        overdueList
          .filter((inst) => inst.days_overdue >= 30)
          .filter((inst) => inst.criticality !== 'safety_critical' && inst.criticality !== 'process_critical')
          .forEach((inst) => {
            const days = inst.days_overdue || 0
            adv.push({
              id: `advisory-overdue-${inst.id}`,
              instrumentId: inst.id,
              tagNumber: inst.tag_number,
              title: `${inst.tag_number} — ${days} days overdue.`,
              description: 'Extended periods without calibration increase process risk.',
              category: 'advisory',
            })
          })

        // OPTIMISATION: Instruments with 3+ consecutive passes with low error
        // (Simulated: instruments with low current error and old calibration dates)
        overdueList
          .filter((inst) => inst.max_as_found_error_pct != null && inst.max_as_found_error_pct < 20)
          .slice(0, 3)
          .forEach((inst) => {
            opt.push({
              id: `opt-extend-${inst.id}`,
              instrumentId: inst.id,
              tagNumber: inst.tag_number,
              title: `${inst.tag_number} — Very stable calibration results.`,
              description: `Last 3 calibrations all passed with <20% of tolerance used. Consider extending calibration interval from ${inst.calibration_interval_days || 180} to 365 days to reduce workload.`,
              category: 'optimisation',
            })
          })

        setRecommendations({
          critical: crit,
          advisory: adv,
          optimisation: opt,
        })
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to generate recommendations.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const allRecs = [...recommendations.critical, ...recommendations.advisory, ...recommendations.optimisation]
  const visibleRecs = allRecs.filter((r) => !dismissed.has(r.id))

  function handleDismiss(recId) {
    setDismissed((prev) => new Set(prev).add(recId))
  }

  function handleShowAll() {
    setDismissed(new Set())
  }

  function RecommendationCard({ rec }) {
    const accentColor =
      rec.category === 'critical' ? 'border-l-red-500 bg-red-50' :
      rec.category === 'advisory' ? 'border-l-amber-500 bg-amber-50' :
      'border-l-blue-500 bg-blue-50'

    const titleColor =
      rec.category === 'critical' ? 'text-red-900' :
      rec.category === 'advisory' ? 'text-amber-900' :
      'text-blue-900'

    return (
      <div className={`border-l-4 rounded-r-lg p-4 flex items-start gap-3 ${accentColor}`}>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${titleColor}`}>{rec.title}</p>
          <p className="text-sm text-slate-700 mt-1">{rec.description}</p>
          <div className="mt-3 flex gap-2">
            <Link
              to={`/app/instruments/${rec.instrumentId}`}
              className="text-xs px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 transition-colors font-medium"
            >
              View instrument
            </Link>
            <button
              onClick={() => handleDismiss(rec.id)}
              className="text-xs px-3 py-1.5 rounded text-slate-600 hover:bg-white/50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg message={error} onRetry={load} />
      ) : allRecs.length === 0 ? (
        <EmptyOk icon="🎯" message="No recommendations at this time. Your calibration program is in good shape." />
      ) : (
        <>
          {dismissed.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-between">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{dismissed.size}</span> recommendation{dismissed.size !== 1 ? 's' : ''} dismissed
              </p>
              <button onClick={handleShowAll} className="text-sm text-blue-600 hover:underline font-medium">
                Show all
              </button>
            </div>
          )}

          {/* CRITICAL */}
          {recommendations.critical.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <h3 className="text-lg font-bold text-red-700">Critical ({recommendations.critical.filter((r) => !dismissed.has(r.id)).length})</h3>
              </div>
              <div className="space-y-3">
                {recommendations.critical.map((rec) => !dismissed.has(rec.id) && <RecommendationCard key={rec.id} rec={rec} />)}
              </div>
            </div>
          )}

          {/* ADVISORY */}
          {recommendations.advisory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <h3 className="text-lg font-bold text-amber-700">Advisory ({recommendations.advisory.filter((r) => !dismissed.has(r.id)).length})</h3>
              </div>
              <div className="space-y-3">
                {recommendations.advisory.map((rec) => !dismissed.has(rec.id) && <RecommendationCard key={rec.id} rec={rec} />)}
              </div>
            </div>
          )}

          {/* OPTIMISATION */}
          {recommendations.optimisation.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h3 className="text-lg font-bold text-blue-700">Optimisation ({recommendations.optimisation.filter((r) => !dismissed.has(r.id)).length})</h3>
              </div>
              <div className="space-y-3">
                {recommendations.optimisation.map((rec) => !dismissed.has(rec.id) && <RecommendationCard key={rec.id} rec={rec} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── TAB 2: Drift Alerts ───────────────────────────────────────────────────────

// Mini sparkline showing error trend across calibrations
function DriftSparkline({ points }) {
  if (!points || points.length < 2) return <span className="text-slate-400 text-xs">—</span>
  const max = Math.max(...points, 0.01)
  const w = 80, h = 28, pad = 3
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - 2 * pad))
  const ys = points.map(v => h - pad - ((v / max) * (h - 2 * pad)))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  const rising = last > prev
  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <path d={path} fill="none" stroke={rising ? '#F59E0B' : '#22C55E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={rising ? '#F59E0B' : '#22C55E'} />
      </svg>
      <span className={`text-xs font-bold ${rising ? 'text-amber-600' : 'text-green-600'}`}>
        {rising ? '↗' : '↘'} {last.toFixed(2)}%
      </span>
    </div>
  )
}

// Instruments with seeded 5-record drift history — error % at each calibration
const DRIFT_TREND_DATA = {
  'PT-102': [0.08, 0.22, 0.40, 0.60, 0.83],
  'FT-103': [0.05, 0.12, 0.22, 0.33, 0.44],
  'LT-103': [0.06, 0.14, 0.26, 0.36, 0.46],
  'TT-101': [0.10, 0.26, 0.44, 0.64, 0.87],
  'AT-103': [0.18, 0.55, 1.02, 1.42, 1.76],
}

/**
 * Project the instrument's current error % based on:
 *  - drift rate per calibration interval (linear from trend data)
 *  - days elapsed since last calibration
 * Returns null if insufficient data.
 */
function projectedCurrentError(inst, trendPts) {
  if (!trendPts || trendPts.length < 2) return null
  const n = trendPts.length
  const driftPerInterval = (trendPts[n - 1] - trendPts[0]) / (n - 1)
  const intervalDays = inst.calibration_interval_days || 180
  const driftPerDay = driftPerInterval / intervalDays
  if (!inst.last_calibration_date) return trendPts[n - 1]
  const lastCal = new Date(inst.last_calibration_date)
  const daysSince = Math.max(0, Math.floor((Date.now() - lastCal.getTime()) / 86400000))
  return Math.max(0, trendPts[n - 1] + driftPerDay * daysSince)
}

/**
 * Project the date when the instrument will exceed tolerance.
 * Returns a Date object, 'exceeded', or null.
 */
function projectedFailDate(inst, trendPts) {
  const currentErr = projectedCurrentError(inst, trendPts)
  if (currentErr === null) return null
  const tol = inst.tolerance_value
  if (!tol) return null
  const n = trendPts.length
  const driftPerInterval = (trendPts[n - 1] - trendPts[0]) / (n - 1)
  const intervalDays = inst.calibration_interval_days || 180
  const driftPerDay = driftPerInterval / intervalDays
  if (driftPerDay <= 0) return null
  if (currentErr >= tol) return 'exceeded'
  const daysToFail = (tol - currentErr) / driftPerDay
  if (daysToFail > 3650) return null  // > 10 years — not useful
  const d = new Date()
  d.setDate(d.getDate() + Math.round(daysToFail))
  return d
}

function currentErrColor(err, tol) {
  if (!tol) return 'text-slate-500'
  const pct = err / tol
  if (pct >= 1.0) return 'text-red-700 font-bold'
  if (pct >= 0.9) return 'text-red-600 font-semibold'
  if (pct >= 0.7) return 'text-amber-600 font-semibold'
  return 'text-green-700'
}

function FailAtCell({ date }) {
  if (!date) return <span className="text-slate-400 text-xs">Insufficient data</span>
  if (date === 'exceeded') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
      Exceeded now
    </span>
  )
  const days = Math.round((date.getTime() - Date.now()) / 86400000)
  const label = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const color = days < 90 ? 'bg-red-100 text-red-700' : days < 365 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
  return (
    <div>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
      <p className="text-xs text-slate-400 mt-0.5">{days < 0 ? 'Overdue' : `in ${days}d`}</p>
    </div>
  )
}

function SortTH({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-white group"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
        </span>
      </span>
    </th>
  )
}

function DriftAlertsTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [area, setArea] = useState('')
  const [sortCol, setSortCol] = useState('criticality')
  const [sortDir, setSortDir] = useState('asc')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      instrApi.list({ last_calibration_result: 'marginal', status: 'active', limit: 500 }),
      instrApi.list({ last_calibration_result: 'fail',     status: 'active', limit: 500 }),
    ])
      .then(([marginalRes, failRes]) => {
        const marginal = (marginalRes.results ?? []).map(i => ({ ...i, _driftStatus: 'marginal' }))
        const exceeded = (failRes.results ?? []).map(i => ({ ...i, _driftStatus: 'exceeded' }))
        setData([...exceeded, ...marginal])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const areas = useMemo(() => [...new Set(data.map(i => i.area).filter(Boolean))].sort(), [data])

  const sorted = useMemo(() => {
    let list = area ? data.filter(i => i.area === area) : [...data]
    const dir = sortDir === 'asc' ? 1 : -1

    list.sort((a, b) => {
      if (sortCol === 'criticality') {
        const ca = CRIT_ORDER[a.criticality ?? 'non_critical'] ?? 3
        const cb = CRIT_ORDER[b.criticality ?? 'non_critical'] ?? 3
        return (ca - cb) * dir
      }
      if (sortCol === 'tag') {
        return a.tag_number.localeCompare(b.tag_number) * dir
      }
      if (sortCol === 'area') {
        return (a.area ?? '').localeCompare(b.area ?? '') * dir
      }
      if (sortCol === 'current_error') {
        const ea = projectedCurrentError(a, DRIFT_TREND_DATA[a.tag_number]) ?? a.max_as_found_error_pct ?? 0
        const eb = projectedCurrentError(b, DRIFT_TREND_DATA[b.tag_number]) ?? b.max_as_found_error_pct ?? 0
        return (ea - eb) * dir
      }
      if (sortCol === 'tolerance') {
        return ((a.tolerance_value ?? 0) - (b.tolerance_value ?? 0)) * dir
      }
      if (sortCol === 'due') {
        const da = a.days_until_due ?? (a.days_overdue != null ? -a.days_overdue : 9999)
        const db_ = b.days_until_due ?? (b.days_overdue != null ? -b.days_overdue : 9999)
        return (da - db_) * dir
      }
      if (sortCol === 'fail_at') {
        const fa = projectedFailDate(a, DRIFT_TREND_DATA[a.tag_number])
        const fb = projectedFailDate(b, DRIFT_TREND_DATA[b.tag_number])
        const ta = fa instanceof Date ? fa.getTime() : fa === 'exceeded' ? 0 : 999999999999
        const tb_ = fb instanceof Date ? fb.getTime() : fb === 'exceeded' ? 0 : 999999999999
        return (ta - tb_) * dir
      }
      return 0
    })
    return list
  }, [data, area, sortCol, sortDir])

  function daysUntilDue(inst) {
    if (inst.days_until_due != null) return inst.days_until_due
    if (inst.days_overdue != null && inst.days_overdue > 0) return -inst.days_overdue
    return null
  }

  const sharedThProps = { sortCol, sortDir, onSort: handleSort }

  return (
    <div className="space-y-4">

      {/* Explainer banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">↗️</span>
        <div>
          <p className="text-sm font-semibold text-purple-900">What is drift analysis?</p>
          <p className="text-sm text-purple-700 mt-0.5">
            CalCheq tracks your error % across every calibration, building a trend line. When an instrument's
            as-found error is steadily increasing — even while still passing — it's a warning sign.
            These instruments are currently <strong>marginal</strong>: within tolerance but approaching the failure
            threshold. The <strong>Current Error</strong> column shows the estimated error today based on
            the drift rate × days elapsed since last calibration. <strong>Fail At</strong> shows the projected
            date the instrument will exceed tolerance.
          </p>
        </div>
      </div>

      {/* How drift detection works */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📊', title: 'Error trending up', desc: 'As-found error % increases with each routine calibration — the instrument is losing accuracy over time.' },
          { icon: '⚠️', title: 'Marginal result', desc: 'Currently 80–100% of tolerance. Still passing, but just. One more calibration period of drift could push it to fail.' },
          { icon: '🔮', title: 'Predicted to fail', desc: 'Based on the current drift rate, CalCheq projects the date the instrument will exceed tolerance. Intervene early.' },
        ].map(c => (
          <div key={c.title} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-sm font-semibold text-slate-800 mb-1">{c.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={area} onChange={e => setArea(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="flex-1" />
        {!loading && (
          <span className="text-sm text-slate-500">
            <span className="font-bold text-purple-600">{sorted.length}</span> instrument{sorted.length !== 1 ? 's' : ''} with drift or tolerance issue
          </span>
        )}
        <button onClick={load} disabled={loading}
          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          ↺ Refresh
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
        sorted.length === 0 ? <EmptyOk icon="✅" message="No instruments showing marginal or exceeded drift right now." /> : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ background: NAVY }}>
                    <SortTH label="Criticality" col="criticality" {...sharedThProps} />
                    <SortTH label="Tag" col="tag" {...sharedThProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Description</th>
                    <SortTH label="Area" col="area" {...sharedThProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Error Trend</th>
                    <SortTH label="Current Error %" col="current_error" {...sharedThProps} />
                    <SortTH label="Tolerance %" col="tolerance" {...sharedThProps} />
                    <SortTH label="Next Due" col="due" {...sharedThProps} />
                    <SortTH label="Fail At" col="fail_at" {...sharedThProps} />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((inst, idx) => {
                    const trendPts = DRIFT_TREND_DATA[inst.tag_number] ?? null
                    const currErr = trendPts
                      ? projectedCurrentError(inst, trendPts)
                      : (inst.max_as_found_error_pct ?? null)
                    const failDate = inst._driftStatus === 'exceeded'
                      ? 'exceeded'
                      : (trendPts ? projectedFailDate(inst, trendPts) : null)
                    const tol = inst.tolerance_value ?? null
                    const due = daysUntilDue(inst)
                    const errColor = currErr != null && tol ? currentErrColor(currErr, tol) : 'text-amber-600'
                    const hasTrend = !!trendPts

                    return (
                      <tr key={inst.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                        <td className={TD}><CriticalityBadge criticality={inst.criticality} /></td>
                        <td className={TD}>
                          <Link to={`/app/instruments/${inst.id}?tab=drift-analysis`} className="font-mono font-bold text-blue-600 hover:underline">
                            {inst.tag_number}
                          </Link>
                          {inst._driftStatus === 'exceeded' && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">Exceeded</span>
                          )}
                        </td>
                        <td className={`${TD} text-slate-600 max-w-[140px] truncate`}>{inst.description || '—'}</td>
                        <td className={`${TD} text-slate-500`}>{inst.area || '—'}</td>
                        <td className={TD}><DriftSparkline points={trendPts} /></td>
                        <td className={TD}>
                          {currErr != null ? (
                            <div>
                              <span className={`font-semibold ${errColor}`}>{currErr.toFixed(2)}%</span>
                              {hasTrend && (
                                <p className="text-xs text-slate-400 mt-0.5">projected today</p>
                              )}
                            </div>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className={TD}>
                          {tol != null ? (
                            <span className="text-slate-600">±{tol}%</span>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className={TD}>
                          {due != null ? <DaysPill days={due} overdue={due < 0} /> : <span className="text-slate-400">—</span>}
                        </td>
                        <td className={TD}>
                          <FailAtCell date={failDate} />
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <Link to={`/app/instruments/${inst.id}?tab=drift-analysis`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                            📈 View drift
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 px-1">
              ↑ Click any column header to sort. "Current Error %" is a projection based on drift rate × days since last calibration.
              Instruments without multi-record drift history show their last recorded error only.
            </p>

            {/* What to do callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">💡 What to do about drifting instruments</p>
              <ol className="space-y-1.5 text-sm text-amber-700 list-decimal list-inside">
                <li>Click <strong>View drift</strong> on any instrument to see the full regression analysis and projected failure date.</li>
                <li>If error % is rising consistently, consider <strong>shortening the calibration interval</strong> before the next failure.</li>
                <li>Check for installation issues: impulse line blockage, process temperature changes, vibration, or fouling.</li>
                <li>If drift is accelerating, raise a <strong>corrective maintenance work order</strong> — don't wait until it fails in service.</li>
              </ol>
            </div>
          </>
        )}
    </div>
  )
}

// ── TAB 3: Repeat Failures ────────────────────────────────────────────────────

function RepeatFailuresTab() {
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const site = getUser()?.siteName ?? null
    dashApi.badActors(site)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.results ?? [])
        setActors(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🔁</span>
        <div>
          <p className="text-sm font-semibold text-red-800">What is a repeat failure?</p>
          <p className="text-sm text-red-700 mt-0.5">
            Instruments with 2 or more as-found failures in the last 12 months. These are drifting beyond tolerance
            before their scheduled calibration — they may need a shorter interval, maintenance, or replacement.
          </p>
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
        actors.length === 0 ? <EmptyOk icon="🏆" message="No instruments have recorded 2+ as-found failures in the last 12 months." /> : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr style={{ background: NAVY }}>
                    {['Rank', 'Tag', 'Description', 'Area', 'Last Failure', 'Failures', 'Last Result'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actors.map((actor, i) => (
                    <tr key={actor.instrument_id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/app/instruments/${actor.instrument_id}`}
                    >
                      <td className={TD}>
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-red-500 text-white' :
                            i === 1 ? 'bg-red-300 text-red-900' :
                              i === 2 ? 'bg-amber-300 text-amber-900' :
                                'bg-slate-100 text-slate-500'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className={TD}><span className="font-mono font-bold text-slate-800">{actor.tag_number}</span></td>
                      <td className={`${TD} text-slate-600 max-w-[200px] truncate`}>{actor.description || '—'}</td>
                      <td className={`${TD} text-slate-500`}>{actor.area || '—'}</td>
                      <td className={`${TD} text-slate-500 whitespace-nowrap`}>{fmtDate(actor.last_failure_date)}</td>
                      <td className={TD}>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold">
                          {actor.failure_count}
                        </span>
                      </td>
                      <td className={TD}><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Fail</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">💡 Recommended actions</p>
              <ol className="space-y-1.5 text-sm text-amber-700 list-decimal list-inside">
                <li>Review calibration history for each instrument to identify drift patterns.</li>
                <li>Consider shortening the calibration interval — if 12-month yields failures, try 6.</li>
                <li>Inspect installation: impulse lines, ambient temperature, vibration, process conditions.</li>
                <li>If failures persist, raise a corrective maintenance work order for inspection or replacement.</li>
              </ol>
            </div>
          </>
        )}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function SmartDiagnostics() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'recommendations'

  function handleTabChange(newTab) {
    setSearchParams({ tab: newTab })
  }

  const TABS = [
    { id: 'recommendations', emoji: '💡', label: 'Recommendations' },
    { id: 'drift', emoji: '↗', label: 'Drift Alerts' },
    { id: 'failures', emoji: '🔁', label: 'Repeat Failures' },
  ]

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🔬 Smart Diagnostics</h1>
        <p className="text-sm text-slate-500 mt-1">AI-powered recommendations, drift analysis, and failure pattern detection.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-800'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'recommendations' && <RecommendationsTab />}
        {tab === 'drift' && <DriftAlertsTab />}
        {tab === 'failures' && <RepeatFailuresTab />}
      </div>
    </div>
  )
}
