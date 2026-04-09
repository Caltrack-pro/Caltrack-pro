import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'
import { getUser } from '../utils/userContext'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${+d} ${MONTHS[+m - 1]}`
}

function complianceColor(rate) {
  if (rate >= 90) return { stroke: '#22C55E', text: 'text-green-600', label: 'On Target' }
  if (rate >= 70) return { stroke: '#F59E0B', text: 'text-amber-600', label: 'Needs Attention' }
  return                 { stroke: '#EF4444', text: 'text-red-600',   label: 'Below Target' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data hook — fetches all 5 endpoints in parallel
// ─────────────────────────────────────────────────────────────────────────────

function useDashboard() {
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)
  const [data,    setData]      = useState(null)
  const [tick,    setTick]      = useState(0)

  // Re-fetch whenever the signed-in user (and therefore site) changes
  useEffect(() => {
    function onUserChange() { setTick(t => t + 1) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const site = getUser()?.siteName ?? null

    Promise.all([
      dashApi.stats(site),
      dashApi.alerts(site),
      dashApi.complianceByArea(site),
      dashApi.upcoming(site),
      dashApi.badActors(site),
    ])
      .then(([stats, alerts, areas, upcoming, actors]) => {
        if (!cancelled) {
          setData({ stats, alerts, areas, upcoming, actors })
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [tick])

  return { loading, error, data, retry: () => setTick(t => t + 1) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="flex justify-center"><Skeleton className="h-52 w-52 rounded-full" /></div>
        </div>
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <Skeleton className="h-4 w-40 mb-6" />
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-6 w-full mb-3" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <Skeleton className="h-4 w-40 mb-4" />
            {[1,2,3,4,5].map(j => <Skeleton key={j} className="h-10 w-full mb-2" />)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="text-slate-800 font-semibold text-lg mb-1">Dashboard failed to load</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat cards (Row 1)
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, textColor, bgColor, iconColor, icon, sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${textColor}`}>
        {value ?? '—'}
      </p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function IconClock() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function IconCheckCircle() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  )
}
function IconBellAlert() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M12 2v2" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliance gauge (Row 2 left)
// ─────────────────────────────────────────────────────────────────────────────

function ComplianceGauge({ rate = 0 }) {
  // Animate from 0 → actual rate on mount
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(rate), 80)
    return () => clearTimeout(t)
  }, [rate])

  const R            = 80
  const CX           = 100
  const CY           = 100
  const circumference = 2 * Math.PI * R
  const offset        = circumference - (displayed / 100) * circumference
  const { stroke, text, label } = complianceColor(rate)

  return (
    <div className="flex flex-col items-center">
      <svg
        width="200" height="200"
        viewBox="0 0 200 200"
        aria-label={`Site compliance: ${rate.toFixed(1)}%`}
      >
        {/* Track */}
        <circle cx={CX} cy={CY} r={R}
          fill="none" stroke="#e2e8f0" strokeWidth="18" />

        {/* Progress arc */}
        <circle cx={CX} cy={CY} r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        />

        {/* Inner white circle to make it a ring (not filled) */}
        <circle cx={CX} cy={CY} r={R - 18}
          fill="white" />

        {/* Percentage value */}
        <text x={CX} y={CY - 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="32" fontWeight="700"
          fill={stroke}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {rate.toFixed(1)}%
        </text>

        {/* Sub-label */}
        <text x={CX} y={CY + 20}
          textAnchor="middle"
          fontSize="11" fill="#9ca3af"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Site Compliance
        </text>
      </svg>

      {/* Status label */}
      <p className={`text-sm font-semibold -mt-3 ${text}`}>{label}</p>

      {/* Threshold legend */}
      <div className="flex items-center gap-5 mt-4">
        {[
          { color: 'bg-green-500', label: '≥ 90%  On Target'      },
          { color: 'bg-amber-500', label: '70–90%  Attention'      },
          { color: 'bg-red-500',   label: '< 70%  Below Target'    },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
            <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Area compliance bars (Row 2 right)
// ─────────────────────────────────────────────────────────────────────────────

function AreaBars({ areas }) {
  if (!areas || areas.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        No area data available.
      </div>
    )
  }

  // Sort worst first
  const sorted = [...areas].sort((a, b) => a.compliance_rate - b.compliance_rate)

  return (
    <div className="space-y-4 overflow-y-auto max-h-72 pr-1">
      {sorted.map(({ area, total, compliant, compliance_rate }) => {
        const barColor =
          compliance_rate >= 90 ? 'bg-green-500' :
          compliance_rate >= 70 ? 'bg-amber-500' : 'bg-red-500'
        const pctColor =
          compliance_rate >= 90 ? 'text-green-600' :
          compliance_rate >= 70 ? 'text-amber-600' : 'text-red-600'

        return (
          <div key={area}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 truncate max-w-[55%]" title={area}>
                {area}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-400 tabular-nums">
                  {compliant}/{total}
                </span>
                <span className={`text-sm font-bold tabular-nums w-12 text-right ${pctColor}`}>
                  {compliance_rate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${compliance_rate}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming calibrations (Row 3 left)
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingList({ instruments }) {
  // Filter to next 7 days; upcoming endpoint returns 30 days
  const nextWeek = (instruments ?? []).filter(
    (i) => i.days_until_due !== null && i.days_until_due !== undefined && i.days_until_due <= 7
  )

  if (nextWeek.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg className="w-10 h-10 text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <p className="text-sm text-slate-400">No calibrations due in the next 7 days.</p>
      </div>
    )
  }

  const shown = nextWeek.slice(0, 8)
  const hiddenCount = nextWeek.length - shown.length

  return (
    <div className="divide-y divide-slate-100">
      {shown.map((inst) => {
        const d = inst.days_until_due
        const urgent = d <= 1
        const soon   = d <= 4

        const daysLabel =
          d === 0 ? 'Today' :
          d === 1 ? 'Tomorrow' :
          `${d}d`

        const badgeClass =
          urgent ? 'bg-red-100 text-red-700' :
          soon   ? 'bg-amber-100 text-amber-700' :
                   'bg-blue-100 text-blue-700'

        return (
          <Link
            key={inst.id}
            to={`/app/instruments/${inst.id}`}
            className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold font-mono text-slate-800 leading-tight">
                {inst.tag_number}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                {inst.description || inst.area || '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <span className="text-xs text-slate-400 tabular-nums">
                {fmtDate(inst.calibration_due_date)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                {daysLabel}
              </span>
            </div>
          </Link>
        )
      })}
      {hiddenCount > 0 && (
        <div className="pt-3 pb-1 text-center">
          <Link
            to="/app/instruments?calibration_status=due_soon"
            className="text-xs text-blue-600 hover:underline"
          >
            + {hiddenCount} more — view all
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Bad actors (Row 3 right)
// ─────────────────────────────────────────────────────────────────────────────

function BadActorsList({ actors }) {
  if (!actors || actors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg className="w-10 h-10 text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
        <p className="text-sm text-slate-400">No failures recorded in the last 12 months.</p>
      </div>
    )
  }

  const shown = actors.slice(0, 10)
  const remaining = actors.length - shown.length

  return (
    <div className="divide-y divide-slate-100">
      {shown.map((actor, i) => (
        <Link
          key={actor.instrument_id}
          to={`/app/instruments/${actor.instrument_id}`}
          className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Rank */}
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold font-mono text-slate-800 leading-tight">
                {actor.tag_number}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                {actor.description
                  ? `${actor.description}${actor.area ? ` · ${actor.area}` : ''}`
                  : actor.area || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <span className="text-xs text-slate-400 tabular-nums">
              {fmtDate(actor.last_failure_date)}
            </span>
            {/* Failure count badge */}
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex-shrink-0"
              title={`${actor.failure_count} as-found failures in last 12 months`}>
              {actor.failure_count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Card({ title, subtitle, headerRight, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerRight}
      </div>
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard page
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { loading, error, data, retry } = useDashboard()

  if (loading) return <DashboardSkeleton />
  if (error)   return <ErrorState message={error} onRetry={retry} />

  const { stats, alerts, areas, upcoming, actors } = data

  // Derive "Due This Week" from the upcoming list (30-day window)
  const dueThisWeek = (upcoming.results ?? []).filter(
    (i) => i.days_until_due !== null && i.days_until_due !== undefined && i.days_until_due <= 7
  ).length

  return (
    <div className="space-y-6">

      {/* ── Row 1: Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overdue"
          value={stats.overdue_count}
          textColor="text-red-600"
          bgColor="bg-red-50"
          iconColor="text-red-500"
          icon={<IconClock />}
          sub={stats.overdue_count === 1 ? '1 instrument past due' : `${stats.overdue_count} instruments past due`}
        />
        <StatCard
          label="Due This Week"
          value={dueThisWeek}
          textColor="text-amber-600"
          bgColor="bg-amber-50"
          iconColor="text-amber-500"
          icon={<IconCalendar />}
          sub="Due within 7 days"
        />
        <StatCard
          label="Calibrated This Week"
          value={stats.calibrated_this_week}
          textColor="text-green-600"
          bgColor="bg-green-50"
          iconColor="text-green-600"
          icon={<IconCheckCircle />}
          sub="Approved records (7 d)"
        />
        <StatCard
          label="Active Alerts"
          value={alerts.length}
          textColor="text-red-600"
          bgColor="bg-red-50"
          iconColor="text-red-500"
          icon={<IconBellAlert />}
          sub={alerts.filter(a => a.priority === 'critical').length + ' critical'}
        />
      </div>

      {/* ── Row 2: Gauge + Area bars ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Compliance gauge — 60% */}
        <Card
          className="xl:col-span-3"
          title="Calibration Compliance"
          subtitle="Active instruments calibrated on time, last 12 months"
        >
          <div className="flex items-center justify-center py-2">
            <ComplianceGauge rate={stats.compliance_rate} />
          </div>
        </Card>

        {/* Compliance by area — 40% */}
        <Card
          className="xl:col-span-2"
          title="Compliance by Area"
          subtitle="Sorted worst first"
        >
          <AreaBars areas={areas} />
        </Card>

      </div>

      {/* ── Row 3: Upcoming + Bad Actors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card
          title="Upcoming — Next 7 Days"
          subtitle={`${dueThisWeek} instrument${dueThisWeek !== 1 ? 's' : ''} require calibration`}
          headerRight={
            dueThisWeek > 8
              ? <Link to="/app/instruments?calibration_status=due_soon" className="text-xs text-blue-600 hover:underline">View all</Link>
              : null
          }
        >
          <UpcomingList instruments={upcoming.results} />
        </Card>

        <Card
          title="Bad Actors"
          subtitle="Top 10 instruments by as-found failures (12 months)"
          headerRight={
            <Link to="/app/bad-actors" className="text-xs text-blue-600 hover:underline">View all</Link>
          }
        >
          <BadActorsList actors={actors} />
        </Card>

      </div>

    </div>
  )
}
