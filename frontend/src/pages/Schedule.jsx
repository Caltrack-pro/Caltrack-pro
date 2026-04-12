/**
 * Schedule — "What needs doing and when"
 * Five tabs: Overdue | Due Soon | Repeat Failures | Drift Alerts | Planner
 * Replaces the old Alerts and Bad Actors pages.
 * Supports ?tab=drift (and other tab ids) as a URL param to deep-link.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { dashboard as dashApi, instruments as instrApi, queue as queueApi } from '../utils/api'
import { CriticalityBadge } from '../components/Badges'
import { fmtDate } from '../utils/formatting'
import { getUser } from '../utils/userContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ── Colour palette ────────────────────────────────────────────────────────────
const NAVY  = '#0B1F3A'
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
  if (days <= 7)  return <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{days}d left</span>
  if (days <= 14) return <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{days}d left</span>
  return <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{days}d left</span>
}

const TH = 'text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap'
const TD = 'px-4 py-3'


// ── TAB 1: Overdue ────────────────────────────────────────────────────────────

function OverdueTab() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [sortBy,  setSortBy]  = useState('risk')
  const [area,    setArea]    = useState('')

  const load = useCallback(() => {
    setLoading(true); setError(null)
    instrApi.list({ calibration_status: 'overdue', limit: 500 })
      .then(res => { setData(res.results ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const areas = useMemo(() => [...new Set(data.map(i => i.area).filter(Boolean))].sort(), [data])

  const sorted = useMemo(() => {
    let list = area ? data.filter(i => i.area === area) : data
    if (sortBy === 'risk') {
      list = [...list].sort((a, b) => {
        const ca = CRIT_ORDER[a.criticality ?? 'non_critical'] ?? 3
        const cb = CRIT_ORDER[b.criticality ?? 'non_critical'] ?? 3
        return ca !== cb ? ca - cb : (b.days_overdue ?? 0) - (a.days_overdue ?? 0)
      })
    } else if (sortBy === 'days') {
      list = [...list].sort((a, b) => (b.days_overdue ?? 0) - (a.days_overdue ?? 0))
    } else if (sortBy === 'area') {
      list = [...list].sort((a, b) => (a.area ?? '').localeCompare(b.area ?? ''))
    }
    return list
  }, [data, sortBy, area])

  function SortPill({ id, label }) {
    return (
      <button
        onClick={() => setSortBy(id)}
        className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors border ${
          sortBy === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
        }`}
      >{label}</button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Sort:</span>
          <SortPill id="risk"  label="⚠️ Risk" />
          <SortPill id="days"  label="🕐 Overdue Days" />
          <SortPill id="area"  label="📍 Area" />
        </div>
        <select value={area} onChange={e => setArea(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="flex-1" />
        {!loading && (
          <span className="text-sm text-slate-500">
            <span className="font-bold text-red-600">{sorted.length}</span> overdue instrument{sorted.length !== 1 ? 's' : ''}
          </span>
        )}
        <button onClick={load} disabled={loading}
          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          ↺ Refresh
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
       sorted.length === 0 ? <EmptyOk icon="✅" message="No overdue instruments — all calibrations are up to date." /> : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: NAVY }}>
                {['Criticality','Tag','Description','Area','Due Date','Overdue By','Last Result','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((inst, idx) => (
                <tr key={inst.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className={TD}><CriticalityBadge criticality={inst.criticality} /></td>
                  <td className={TD}>
                    <Link to={`/app/instruments/${inst.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                      {inst.tag_number}
                    </Link>
                  </td>
                  <td className={`${TD} text-slate-600 max-w-[200px] truncate`}>{inst.description || '—'}</td>
                  <td className={`${TD} text-slate-500`}>{inst.area || '—'}</td>
                  <td className={`${TD} text-red-600 font-semibold whitespace-nowrap`}>{fmtDate(inst.calibration_due_date)}</td>
                  <td className={TD}><DaysPill days={inst.days_overdue} overdue /></td>
                  <td className={TD}>
                    {inst.last_calibration_result ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        inst.last_calibration_result === 'pass'     ? 'bg-green-100 text-green-700' :
                        inst.last_calibration_result === 'fail'     ? 'bg-red-100 text-red-700' :
                        inst.last_calibration_result === 'marginal' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{inst.last_calibration_result.charAt(0).toUpperCase() + inst.last_calibration_result.slice(1)}</span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>
                    <Link to={`/app/calibrations/new/${inst.id}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      📋 Calibrate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// ── TAB 2: Due Soon ───────────────────────────────────────────────────────────

function DueSoonTab() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [window_,  setWindow] = useState('30')
  const [area,    setArea]    = useState('')

  const load = useCallback(() => {
    setLoading(true); setError(null)
    dashApi.upcoming()
      .then(res => { setData(res?.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const areas = useMemo(() => [...new Set(data.map(i => i.area).filter(Boolean))].sort(), [data])

  const filtered = useMemo(() => {
    const days = parseInt(window_, 10) || 30
    return data.filter(i => {
      if (area && i.area !== area) return false
      if ((i.days_until_due ?? 999) > days) return false
      return true
    }).sort((a, b) => (a.days_until_due ?? 999) - (b.days_until_due ?? 999))
  }, [data, window_, area])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Show due within:</span>
          {['7','14','30'].map(d => (
            <button key={d} onClick={() => setWindow(d)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors border ${
                window_ === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >{d} days</button>
          ))}
        </div>
        <select value={area} onChange={e => setArea(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="flex-1" />
        {!loading && (
          <span className="text-sm text-slate-500">
            <span className="font-bold text-amber-600">{filtered.length}</span> due within {window_} days
          </span>
        )}
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
       filtered.length === 0 ? <EmptyOk icon="📅" message={`No calibrations due within ${window_} days.`} /> : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ background: NAVY }}>
                {['Tag','Description','Area','Due Date','Time Left','Interval','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst, idx) => (
                <tr key={inst.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className={TD}>
                    <Link to={`/app/instruments/${inst.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                      {inst.tag_number}
                    </Link>
                  </td>
                  <td className={`${TD} text-slate-600 max-w-[200px] truncate`}>{inst.description || '—'}</td>
                  <td className={`${TD} text-slate-500`}>{inst.area || '—'}</td>
                  <td className={`${TD} whitespace-nowrap font-semibold ${(inst.days_until_due ?? 99) <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {fmtDate(inst.calibration_due_date)}
                  </td>
                  <td className={TD}><DaysPill days={inst.days_until_due} /></td>
                  <td className={`${TD} text-slate-500`}>{inst.calibration_interval_days ? `${inst.calibration_interval_days}d` : '—'}</td>
                  <td className={`${TD} whitespace-nowrap`}>
                    <Link to={`/app/calibrations/new/${inst.id}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      📋 Calibrate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// ── TAB 3: Repeat Failures ────────────────────────────────────────────────────

function RepeatFailuresTab() {
  const [actors,  setActors]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    const site = getUser()?.siteName ?? null
    dashApi.badActors(site)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.results ?? [])
        setActors(list); setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

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
                  {['Rank','Tag','Description','Area','Last Failure','Failures','Last Result'].map(h => (
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


// ── TAB 4: Drift Alerts ───────────────────────────────────────────────────────

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
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3" fill={rising ? '#F59E0B' : '#22C55E'} />
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
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [area,    setArea]    = useState('')
  const [sortCol, setSortCol] = useState('criticality')
  const [sortDir, setSortDir] = useState('asc')

  const load = useCallback(() => {
    setLoading(true); setError(null)
    instrApi.list({ last_calibration_result: 'marginal', status: 'active', limit: 500 })
      .then(res => { setData(res.results ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

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
            <span className="font-bold text-purple-600">{sorted.length}</span> instrument{sorted.length !== 1 ? 's' : ''} with drift trend
          </span>
        )}
        <button onClick={load} disabled={loading}
          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          ↺ Refresh
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
       sorted.length === 0 ? <EmptyOk icon="✅" message="No instruments showing a marginal drift trend right now." /> : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ background: NAVY }}>
                  <SortTH label="Criticality"    col="criticality"    {...sharedThProps} />
                  <SortTH label="Tag"             col="tag"            {...sharedThProps} />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Description</th>
                  <SortTH label="Area"            col="area"           {...sharedThProps} />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Error Trend</th>
                  <SortTH label="Current Error %" col="current_error"  {...sharedThProps} />
                  <SortTH label="Tolerance %"     col="tolerance"      {...sharedThProps} />
                  <SortTH label="Next Due"        col="due"            {...sharedThProps} />
                  <SortTH label="Fail At"         col="fail_at"        {...sharedThProps} />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((inst, idx) => {
                  const trendPts   = DRIFT_TREND_DATA[inst.tag_number] ?? null
                  const currErr    = trendPts
                    ? projectedCurrentError(inst, trendPts)
                    : (inst.max_as_found_error_pct ?? null)
                  const failDate   = trendPts ? projectedFailDate(inst, trendPts) : null
                  const tol        = inst.tolerance_value ?? null
                  const due        = daysUntilDue(inst)
                  const errColor   = currErr != null && tol ? currentErrColor(currErr, tol) : 'text-amber-600'
                  const hasTrend   = !!trendPts

                  return (
                    <tr key={inst.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                      <td className={TD}><CriticalityBadge criticality={inst.criticality} /></td>
                      <td className={TD}>
                        <Link to={`/app/instruments/${inst.id}?tab=drift-analysis`} className="font-mono font-bold text-blue-600 hover:underline">
                          {inst.tag_number}
                        </Link>
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


// ── TAB 5: Planner ────────────────────────────────────────────────────────────

/** Build a 12-week workload chart from an array of instruments with due dates */
function buildWorkloadData(instruments) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weeks = []
  for (let w = 0; w < 12; w++) {
    const start = new Date(today)
    start.setDate(today.getDate() + w * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const label = `Wk ${w + 1}\n${start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    weeks.push({ label, start, end, count: 0, overdue: 0 })
  }

  for (const instr of instruments) {
    if (!instr.calibration_due_date) continue
    const due = new Date(instr.calibration_due_date)
    due.setHours(0, 0, 0, 0)
    if (due < today) {
      // Overdue — add to week 1
      weeks[0].overdue++
    } else {
      for (const wk of weeks) {
        if (due >= wk.start && due <= wk.end) { wk.count++; break }
      }
    }
  }
  return weeks.map(w => ({ ...w, total: w.count + w.overdue }))
}

function WorkloadChart({ instruments }) {
  const data = useMemo(() => buildWorkloadData(instruments), [instruments])
  const maxVal = Math.max(...data.map(d => d.total), 1)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">12-Week Calibration Workload</h3>
          <p className="text-xs text-slate-400 mt-0.5">Instruments due each week — plan capacity accordingly</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Overdue</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> Upcoming</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(val, name) => [val, name === 'overdue' ? 'Overdue' : 'Upcoming']}
            labelFormatter={l => l.replace('\n', ' ')}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="overdue" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="count"   stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function QueueCard({ item, onRemove, onMoveUp, onMoveDown, isFirst, isLast, removing, isDemo }) {
  const inst = item.instrument
  const due = inst.days_until_due
  const overdue = inst.days_overdue > 0
  const critColor = {
    safety_critical:  'border-l-red-500',
    process_critical: 'border-l-amber-500',
    standard:         'border-l-blue-400',
    non_critical:     'border-l-slate-300',
  }[inst.criticality] ?? 'border-l-slate-300'

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${critColor} rounded-xl px-4 py-3 flex items-center gap-3 ${removing ? 'opacity-40' : ''} transition-opacity`}>
      {/* Priority reorder buttons — hidden in demo mode */}
      {!isDemo && (
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button onClick={onMoveUp}   disabled={isFirst}  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-default rounded transition-colors text-xs">▲</button>
          <button onClick={onMoveDown} disabled={isLast}   className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-default rounded transition-colors text-xs">▼</button>
        </div>
      )}

      {/* Instrument info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Link to={`/app/instruments/${inst.id}`} className="font-mono font-bold text-blue-600 text-sm hover:underline">
            {inst.tag_number}
          </Link>
          <CriticalityBadge criticality={inst.criticality} />
          {overdue && <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{inst.days_overdue}d overdue</span>}
          {!overdue && due != null && due <= 7 && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{due}d left</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{inst.description || '—'} · {inst.area || '—'}</p>
        {inst.calibration_due_date && (
          <p className="text-xs text-slate-400 mt-0.5">Due: {fmtDate(inst.calibration_due_date)}</p>
        )}
        {item.added_by_name && (
          <p className="text-xs text-slate-400">Added by {item.added_by_name}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={`/app/calibrations/new/${inst.id}`}
          className="text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Start Cal
        </Link>
        {!isDemo && (
          <button onClick={onRemove} disabled={removing}
            className="text-xs px-2 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            title="Remove from queue">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

function AddCandidateRow({ inst, inQueue, onAdd, adding, isDemo }) {
  const overdue = inst.alert_status === 'overdue'
  const due = inst.days_until_due
  const driftFlagged = inst.last_calibration_result === 'marginal'

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${inQueue ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/app/instruments/${inst.id}`} className="font-mono font-semibold text-blue-600 text-sm hover:underline">
            {inst.tag_number}
          </Link>
          <CriticalityBadge criticality={inst.criticality} />
          {overdue && <span className="text-xs font-semibold text-red-600">OVERDUE</span>}
          {!overdue && due != null && <span className="text-xs text-amber-600">{due}d left</span>}
          {driftFlagged && <span className="text-xs font-semibold text-purple-600">↗ DRIFT</span>}
        </div>
        <p className="text-xs text-slate-400 truncate">{inst.description || '—'} · {inst.area || '—'}</p>
      </div>
      {inQueue ? (
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold flex-shrink-0">✓ In Queue</span>
      ) : isDemo ? (
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-semibold flex-shrink-0 cursor-default" title="Queue editing disabled in demo mode">Demo</span>
      ) : (
        <button
          onClick={() => onAdd(inst)}
          disabled={adding}
          className="text-xs px-2.5 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex-shrink-0 disabled:opacity-40"
        >
          + Add
        </button>
      )}
    </div>
  )
}

function PlannerTab() {
  const isDemoMode = getUser()?.isDemoMode ?? false

  const [allInstruments, setAllInstruments] = useState([])
  const [queueItems,     setQueueItems]     = useState([])
  const [loadingInstr,   setLoadingInstr]   = useState(true)
  const [loadingQueue,   setLoadingQueue]   = useState(true)
  const [adding,         setAdding]         = useState(null)   // instrument_id being added
  const [removing,       setRemoving]       = useState(null)   // instrument_id being removed
  const [filter,         setFilter]         = useState('all')  // all | overdue | due-soon | drift
  const [searchQ,        setSearchQ]        = useState('')

  const loadInstruments = useCallback(() => {
    setLoadingInstr(true)
    instrApi.list({ status: 'active', limit: 500 })
      .then(res => { setAllInstruments(res.results ?? []); setLoadingInstr(false) })
      .catch(() => setLoadingInstr(false))
  }, [])

  const loadQueue = useCallback(() => {
    setLoadingQueue(true)
    queueApi.list()
      .then(res => { setQueueItems(res.items ?? []); setLoadingQueue(false) })
      .catch(() => setLoadingQueue(false))
  }, [])

  useEffect(() => { loadInstruments(); loadQueue() }, [loadInstruments, loadQueue])

  const queuedIds = useMemo(() => new Set(queueItems.map(i => String(i.instrument_id))), [queueItems])

  // Candidates: instruments that need attention (overdue, due-soon, marginal)
  const candidates = useMemo(() => {
    let list = allInstruments.filter(i =>
      i.alert_status === 'overdue' ||
      i.alert_status === 'due_soon' ||
      i.last_calibration_result === 'marginal'
    )
    if (filter === 'overdue')  list = list.filter(i => i.alert_status === 'overdue')
    if (filter === 'due-soon') list = list.filter(i => i.alert_status === 'due_soon')
    if (filter === 'drift')    list = list.filter(i => i.last_calibration_result === 'marginal')
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      list = list.filter(i =>
        i.tag_number.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        (i.area ?? '').toLowerCase().includes(q)
      )
    }
    // Sort: overdue safety-critical first, then by days overdue desc, then due date asc
    return list.sort((a, b) => {
      if (a.alert_status !== b.alert_status) {
        const order = { overdue: 0, due_soon: 1, current: 2, not_calibrated: 3 }
        return (order[a.alert_status] ?? 9) - (order[b.alert_status] ?? 9)
      }
      const ca = CRIT_ORDER[a.criticality ?? 'non_critical'] ?? 3
      const cb = CRIT_ORDER[b.criticality ?? 'non_critical'] ?? 3
      return ca !== cb ? ca - cb : (a.days_until_due ?? 999) - (b.days_until_due ?? 999)
    })
  }, [allInstruments, filter, searchQ])

  async function handleAdd(inst) {
    if (isDemoMode) return
    setAdding(inst.id)
    try {
      await queueApi.add(inst.id)
      await loadQueue()
    } catch (e) {
      console.error('Failed to add to queue', e)
    } finally {
      setAdding(null)
    }
  }

  async function handleRemove(instrumentId) {
    if (isDemoMode) return
    setRemoving(instrumentId)
    try {
      await queueApi.remove(instrumentId)
      await loadQueue()
    } catch (e) {
      console.error('Failed to remove from queue', e)
    } finally {
      setRemoving(null)
    }
  }

  async function handleMove(instrumentId, direction) {
    if (isDemoMode) return
    const idx = queueItems.findIndex(i => String(i.instrument_id) === String(instrumentId))
    if (idx === -1) return
    const target = queueItems[idx + direction]
    if (!target) return

    // Swap priorities
    const myPriority     = queueItems[idx].priority
    const targetPriority = target.priority

    try {
      await Promise.all([
        queueApi.setPriority(instrumentId, targetPriority),
        queueApi.setPriority(target.instrument_id, myPriority),
      ])
      await loadQueue()
    } catch (e) {
      console.error('Failed to reorder queue', e)
    }
  }

  return (
    <div className="space-y-5">

      {/* Workload chart */}
      {!loadingInstr && <WorkloadChart instruments={allInstruments} />}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

        {/* ── Left: Add to schedule ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Add to Schedule</h3>
            <p className="text-xs text-slate-400 mt-0.5">Overdue, due soon, and drift-flagged instruments requiring attention</p>
          </div>

          {/* Filter + search */}
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2">
            {[
              { id: 'all',      label: 'All' },
              { id: 'overdue',  label: '🔴 Overdue' },
              { id: 'due-soon', label: '🟡 Due Soon' },
              { id: 'drift',    label: '↗ Drift' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${
                  filter === f.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {f.label}
              </button>
            ))}
            <input
              type="text"
              placeholder="Search tag / description / area…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="ml-auto text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
            {loadingInstr ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm text-slate-500 font-medium">All clear</p>
                <p className="text-xs text-slate-400 mt-1">No instruments require immediate attention</p>
              </div>
            ) : (
              candidates.map(inst => (
                <AddCandidateRow
                  key={inst.id}
                  inst={inst}
                  inQueue={queuedIds.has(String(inst.id))}
                  onAdd={handleAdd}
                  adding={adding === inst.id}
                  isDemo={isDemoMode}
                />
              ))
            )}
          </div>

          {!loadingInstr && candidates.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
              {candidates.length} instrument{candidates.length !== 1 ? 's' : ''} shown
            </div>
          )}
        </div>

        {/* ── Right: Scheduled queue ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 bg-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Scheduled Queue
                  {queueItems.length > 0 && (
                    <span className="ml-2 text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {queueItems.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isDemoMode
                    ? 'Demo mode — queue changes are not saved'
                    : 'Visible to all team members · Completed calibrations disappear automatically'}
                </p>
              </div>
              <button onClick={loadQueue} disabled={loadingQueue}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors bg-white">
                ↺ Refresh
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2" style={{ minHeight: 200 }}>
            {loadingQueue ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : queueItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm text-slate-500 font-medium">Queue is empty</p>
                <p className="text-xs text-slate-400 mt-1">Add instruments from the panel on the left to build your work schedule</p>
              </div>
            ) : (
              queueItems.map((item, idx) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  isFirst={idx === 0}
                  isLast={idx === queueItems.length - 1}
                  removing={removing === String(item.instrument_id)}
                  onRemove={() => handleRemove(item.instrument_id)}
                  onMoveUp={() => handleMove(item.instrument_id, -1)}
                  onMoveDown={() => handleMove(item.instrument_id, 1)}
                  isDemo={isDemoMode}
                />
              ))
            )}
          </div>

          {queueItems.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl">
              <p className="text-xs text-slate-400 text-center">
                ▲ ▼ to reorder priority · Instruments auto-remove when calibrated
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overdue',   emoji: '🔴', label: 'Overdue',         desc: 'Instruments past their due date' },
  { id: 'due-soon',  emoji: '🟡', label: 'Due Soon',        desc: 'Calibrations coming up' },
  { id: 'failures',  emoji: '🔁', label: 'Repeat Failures', desc: 'Instruments with repeated failures' },
  { id: 'drift',     emoji: '↗',  label: 'Drift Alerts',    desc: 'Instruments trending toward failure' },
  { id: 'planner',   emoji: '📋', label: 'Planner',         desc: 'Build and manage your calibration queue' },
]

export default function Schedule() {
  const [searchParams] = useSearchParams()
  const paramTab = searchParams.get('tab')
  const validTab = TABS.find(t => t.id === paramTab)?.id
  const [tab, setTab] = useState(validTab ?? 'overdue')

  // If the URL tab param changes (e.g. navigated from Dashboard), sync
  useEffect(() => {
    if (validTab) setTab(validTab)
  }, [validTab])

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📅 Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Plan your calibration workload — overdue, upcoming, repeat failures, drift trends, and your scheduled queue.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              tab === t.id
                ? t.id === 'drift'
                  ? 'border-purple-600 text-purple-700'
                  : t.id === 'planner'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'overdue'  && <OverdueTab />}
        {tab === 'due-soon' && <DueSoonTab />}
        {tab === 'failures' && <RepeatFailuresTab />}
        {tab === 'drift'    && <DriftAlertsTab />}
        {tab === 'planner'  && <PlannerTab />}
      </div>

    </div>
  )
}
