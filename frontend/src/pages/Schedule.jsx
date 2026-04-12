/**
 * Schedule — "What needs doing and when"
 * Three tabs: Overdue | Due Soon | Repeat Failures
 * Replaces the old Alerts and Bad Actors pages.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi, instruments as instrApi } from '../utils/api'
import { CriticalityBadge } from '../components/Badges'
import { fmtDate } from '../utils/formatting'
import { getUser } from '../utils/userContext'

// ── Colour palette ────────────────────────────────────────────────────────────
const NAVY  = '#0B1F3A'
const CRIT_ORDER = { safety_critical: 0, process_critical: 1, standard: 2, non_critical: 3 }

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// Coloured status pill for days
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
      {/* Filter bar */}
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
      {/* Filter bar */}
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
      {/* Explainer */}
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
                    <td className={TD}>
                      <span className="font-mono font-bold text-slate-800">{actor.tag_number}</span>
                    </td>
                    <td className={`${TD} text-slate-600 max-w-[200px] truncate`}>{actor.description || '—'}</td>
                    <td className={`${TD} text-slate-500`}>{actor.area || '—'}</td>
                    <td className={`${TD} text-slate-500 whitespace-nowrap`}>{fmtDate(actor.last_failure_date)}</td>
                    <td className={TD}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold">
                        {actor.failure_count}
                      </span>
                    </td>
                    <td className={TD}>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Fail</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
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

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overdue',   emoji: '🔴', label: 'Overdue',         desc: 'Instruments past their due date' },
  { id: 'due-soon',  emoji: '🟡', label: 'Due Soon',        desc: 'Calibrations coming up' },
  { id: 'failures',  emoji: '🔁', label: 'Repeat Failures', desc: 'Instruments with repeated failures' },
]

export default function Schedule() {
  const [tab, setTab] = useState('overdue')

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📅 Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Plan your calibration workload — overdue, upcoming, and repeat failures.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-700'
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
      </div>

    </div>
  )
}
