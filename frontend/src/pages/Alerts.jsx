import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'
import { fmtDate, humanise } from '../utils/formatting'
import { getUser } from '../utils/userContext'

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY = {
  critical: {
    row:   'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon:  'text-red-500',
    dot:   'bg-red-500',
  },
  warning: {
    row:   'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon:  'text-amber-500',
    dot:   'bg-amber-500',
  },
  information: {
    row:   'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon:  'text-blue-500',
    dot:   'bg-blue-500',
  },
}

function priorityOf(alert) {
  const t = alert.alert_type ?? ''
  if (t === 'OVERDUE' || t === 'FAILED' || t === 'CONSECUTIVE_FAILURES') return 'critical'
  if (t === 'DUE_SOON') return 'warning'
  return 'information'
}

function priorityOrder(p) {
  return p === 'critical' ? 0 : p === 'warning' ? 1 : 2
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconAlert({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconInfo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

// ── Alert card ────────────────────────────────────────────────────────────────

function AlertCard({ alert }) {
  const priority = priorityOf(alert)
  const styles   = PRIORITY[priority] ?? PRIORITY.information
  const Icon     = priority === 'information' ? IconInfo : IconAlert

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${styles.row}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono font-bold text-sm text-slate-800">{alert.tag_number}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {(alert.alert_type ?? '').replace(/_/g, ' ')}
          </span>
          {alert.area && (
            <span className="text-xs text-slate-500">{alert.area}</span>
          )}
          {alert.triggered_at && (
            <span className="text-xs text-slate-400 ml-auto">{fmtDate(alert.triggered_at?.split('T')[0])}</span>
          )}
        </div>
        <p className="text-sm text-slate-700">{alert.message}</p>
      </div>

      <Link
        to={`/app/instruments/${alert.instrument_id}`}
        onClick={e => e.stopPropagation()}
        className="flex-shrink-0 text-xs px-2.5 py-1 border border-current/20 rounded text-slate-600 bg-white/60 hover:bg-white transition-colors whitespace-nowrap"
      >
        View
      </Link>
    </div>
  )
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ alerts }) {
  const critical    = alerts.filter(a => priorityOf(a) === 'critical').length
  const warnings    = alerts.filter(a => priorityOf(a) === 'warning').length
  const information = alerts.filter(a => priorityOf(a) === 'information').length

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-red-700">{critical}</span>
        <span className="text-sm text-red-600">Critical</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-700">{warnings}</span>
        <span className="text-sm text-amber-600">Warnings</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-blue-700">{information}</span>
        <span className="text-sm text-blue-600">Informational</span>
      </div>
    </div>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: '',            label: 'All' },
  { id: 'critical',   label: 'Critical' },
  { id: 'warning',    label: 'Warning' },
  { id: 'information',label: 'Information' },
]

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Alerts() {
  const [allAlerts, setAllAlerts] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('')
  const [typeFilter,setTypeFilter]= useState('')
  const [rev,       setRev]       = useState(0)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    const site = getUser()?.siteName ?? null
    dashApi.alerts(site)
      .then(data => {
        const alerts = Array.isArray(data) ? data : (data.results ?? [])
        // Sort: critical first, then by triggered_at desc
        const sorted = [...alerts].sort((a, b) => {
          const pd = priorityOrder(priorityOf(a)) - priorityOrder(priorityOf(b))
          if (pd !== 0) return pd
          return (b.triggered_at ?? '') > (a.triggered_at ?? '') ? 1 : -1
        })
        setAllAlerts(sorted); setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load, rev])

  const displayed = allAlerts.filter(a => {
    if (filter     && priorityOf(a) !== filter)  return false
    if (typeFilter && a.alert_type !== typeFilter) return false
    return true
  })

  const ALERT_TYPES = [...new Set(allAlerts.map(a => a.alert_type).filter(Boolean))]

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Summary */}
      {!loading && !error && <SummaryBar alerts={allAlerts} />}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Priority tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {FILTER_TABS.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Alert type dropdown */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {ALERT_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Refresh */}
        <button onClick={() => setRev(r => r + 1)}
          disabled={loading}
          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-6 text-center text-sm text-red-700">
          <p className="font-semibold mb-1">Failed to load alerts</p>
          <p className="mb-3">{error}</p>
          <button onClick={() => setRev(r => r + 1)}
            className="px-3 py-1.5 text-xs border border-red-300 rounded hover:bg-red-100 transition-colors">
            Try again
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-sm font-medium text-slate-500">
            {allAlerts.length > 0 ? 'No alerts match the selected filters.' : 'No active alerts — all instruments are in order.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(alert => (
            <AlertCard key={alert.id ?? `${alert.alert_type}-${alert.instrument_id}`} alert={alert} />
          ))}
        </div>
      )}

    </div>
  )
}
