import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi, calibrations as calsApi } from '../utils/api'
import { getUser } from '../utils/userContext'
import { fmtDate } from '../utils/formatting'

// ─────────────────────────────────────────────────────────────────────────────
// Colour constants (matching CalCheq palette)
// ─────────────────────────────────────────────────────────────────────────────

const NAVY   = '#0B1F3A'
const SKY    = '#2196F3'
const BLUE   = '#1565C0'
const RED    = '#C62828'
const AMBER  = '#B45309'
const GREEN  = '#2E7D32'
const MUTED  = '#5A6B7B'
const BORDER = '#D0DAE8'
const LIGHT  = '#F4F7FC'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function complianceColor(rate) {
  if (rate >= 90) return { stroke: '#22C55E', text: '#16A34A', label: 'On Target' }
  if (rate >= 70) return { stroke: '#F59E0B', text: '#D97706', label: 'Needs Attention' }
  return               { stroke: '#EF4444', text: '#DC2626', label: 'Below Target' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data hook — fetches 5 endpoints in parallel
// ─────────────────────────────────────────────────────────────────────────────

function useDashboard() {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [data,    setData]    = useState(null)
  const [tick,    setTick]    = useState(0)

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
      calsApi.list({ record_status: 'submitted', limit: 1 }),
    ])
      .then(([stats, alerts, areas, upcoming, pendingCals]) => {
        if (!cancelled) {
          setData({ stats, alerts, areas, upcoming, pendingCount: pendingCals?.total ?? 0 })
          setLoading(false)
        }
      })
      .catch(err => {
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

function Skel({ style }) {
  return <div className="animate-pulse bg-slate-200 rounded-lg" style={style} />
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #e2e8f0', padding: '18px 20px' }}>
            <Skel style={{ height: 32, width: 60, marginBottom: 8 }} />
            <Skel style={{ height: 12, width: 120 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 20px', height: 120 }}>
            <Skel style={{ height: 16, width: 80, marginBottom: 12 }} />
            <Skel style={{ height: 40, width: 60, marginBottom: 12 }} />
            <Skel style={{ height: 12, width: 140 }} />
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
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg style={{ width: 28, height: 28, color: RED }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      </div>
      <h3 style={{ color: NAVY, fontWeight: 600, marginBottom: 8 }}>Dashboard failed to load</h3>
      <p style={{ color: MUTED, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>{message}</p>
      <button onClick={onRetry} style={{ background: BLUE, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo banner
// ─────────────────────────────────────────────────────────────────────────────

function DemoBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #F57C00, #FFA000)',
      color: '#fff',
      textAlign: 'center',
      padding: '10px 16px',
      fontSize: '0.85rem',
      fontWeight: 600,
      borderRadius: 8,
    }}>
      🔍 DEMO ENVIRONMENT — Fictional data only. Site:{' '}
      <span style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 10px', borderRadius: 12, margin: '0 6px' }}>
        Pilbara Minerals Processing Pty Ltd (Demo)
      </span>
      — This company does not exist.
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI stat card — coloured left border
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, borderColor, valueColor, sub }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${borderColor}`,
      padding: '18px 16px',
      minWidth: 0,
    }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: '2.2rem', fontWeight: 800, color: valueColor, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', margin: '4px 0' }}>
        {value ?? '—'}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Attention cards — action required summary linking to detail pages
// ─────────────────────────────────────────────────────────────────────────────

function AttentionCard({ emoji, label, count, subText, to, accentColor, bgColor, borderColor }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: hovered ? bgColor : '#fff',
        borderRadius: 12,
        border: `1px solid ${hovered ? borderColor : '#e2e8f0'}`,
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: hovered ? `0 4px 12px ${borderColor}40` : '0 1px 3px rgba(0,0,0,0.06)',
        padding: '18px 20px',
        textDecoration: 'none',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
        border: `1px solid ${borderColor}`,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: accentColor, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </p>
        <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 3 }}>{subText}</p>
      </div>
      <div style={{ color: MUTED, fontSize: '1.1rem', flexShrink: 0, transition: 'transform 0.15s', transform: hovered ? 'translateX(3px)' : 'none' }}>
        →
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliance gauge (ring chart)
// ─────────────────────────────────────────────────────────────────────────────

function ComplianceGauge({ rate = 0 }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(rate), 80)
    return () => clearTimeout(t)
  }, [rate])

  const R             = 80
  const CX            = 100
  const CY            = 100
  const circumference = 2 * Math.PI * R
  const offset        = circumference - (displayed / 100) * circumference
  const { stroke, text, label } = complianceColor(rate)

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth="18" />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={stroke} strokeWidth="18"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
        <circle cx={CX} cy={CY} r={R - 18} fill="white" />
        <text x={CX} y={CY - 8} textAnchor="middle" dominantBaseline="middle"
          fontSize="32" fontWeight="700" fill={stroke} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {rate.toFixed(1)}%
        </text>
        <text x={CX} y={CY + 20} textAnchor="middle" fontSize="11" fill="#9ca3af"
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          Site Compliance
        </text>
      </svg>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: text, marginTop: -12 }}>{label}</p>
      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        {[
          { color: '#22C55E', label: '≥ 90%  On Target'   },
          { color: '#F59E0B', label: '70–90%  Attention'  },
          { color: '#EF4444', label: '< 70%  Below Target' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: MUTED, whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Area compliance bars
// ─────────────────────────────────────────────────────────────────────────────

function AreaBars({ areas }) {
  if (!areas || areas.length === 0)
    return <p style={{ color: MUTED, fontSize: '0.875rem', padding: '40px 0', textAlign: 'center' }}>No area data available.</p>

  const sorted = [...areas].sort((a, b) => a.compliance_rate - b.compliance_rate)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 288 }}>
      {sorted.map(({ area, total, compliant, compliance_rate }) => {
        const barColor = compliance_rate >= 90 ? '#22C55E' : compliance_rate >= 70 ? '#F59E0B' : '#EF4444'
        const pctColor = compliance_rate >= 90 ? '#16A34A' : compliance_rate >= 70 ? '#D97706' : '#DC2626'
        return (
          <div key={area}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{area}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: MUTED }}>{compliant}/{total}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: pctColor, width: 48, textAlign: 'right' }}>
                  {compliance_rate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${compliance_rate}%`, background: barColor, borderRadius: 4, transition: 'width 0.7s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming calibrations (next 7 days)
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingList({ instruments }) {
  const nextWeek = (instruments ?? []).filter(i => i.days_until_due != null && i.days_until_due <= 7)

  if (nextWeek.length === 0)
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED }}>
        <svg style={{ width: 40, height: 40, color: '#CBD5E1', display: 'block', margin: '0 auto 8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <p style={{ fontSize: '0.875rem' }}>No calibrations due in the next 7 days.</p>
      </div>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {nextWeek.slice(0, 8).map(inst => {
        const d = inst.days_until_due
        const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d`
        const badgeBg    = d <= 1 ? '#FEE2E2' : d <= 4 ? '#FEF3C7' : '#DBEAFE'
        const badgeColor = d <= 1 ? '#DC2626' : d <= 4 ? '#D97706' : '#1D4ED8'
        return (
          <Link key={inst.id} to={`/app/instruments/${inst.id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: `1px solid ${BORDER}`, textDecoration: 'none', borderRadius: 6, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = LIGHT}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: NAVY }}>{inst.tag_number}</p>
              <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inst.description || inst.area || '—'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <span style={{ fontSize: '0.75rem', color: MUTED }}>{inst.calibration_due_date ? fmtDate(inst.calibration_due_date) : '—'}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: badgeBg, color: badgeColor }}>{label}</span>
            </div>
          </Link>
        )
      })}
      {nextWeek.length > 8 && (
        <div style={{ textAlign: 'center', paddingTop: 12 }}>
          <Link to="/app/schedule" style={{ fontSize: '0.8rem', color: BLUE }}>
            + {nextWeek.length - 8} more — view schedule
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick links card
// ─────────────────────────────────────────────────────────────────────────────

function QuickActions() {
  const links = [
    { emoji: '📋', label: 'Record a Calibration', to: '/app/instruments', sub: 'Select an instrument to begin' },
    { emoji: '📥', label: 'Import Calibrator CSV', to: '/app/calibrations/import-csv', sub: 'Beamex / Fluke CSV import' },
    { emoji: '📄', label: 'Generate a Report', to: '/app/reports', sub: 'Compliance & history export' },
    { emoji: '🔧', label: 'Add New Instrument', to: '/app/instruments/new', sub: 'Register a new instrument' },
    { emoji: '📅', label: 'View Full Schedule', to: '/app/schedule', sub: 'Overdue, due-soon & failures' },
    { emoji: '⚙️', label: 'Manage Team', to: '/app/settings', sub: 'Invite members & settings' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {links.map(({ emoji, label, to, sub }) => (
        <Link
          key={to}
          to={to}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderBottom: `1px solid ${BORDER}`, textDecoration: 'none', borderRadius: 6, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = LIGHT}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{emoji}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: NAVY }}>{label}</p>
            <p style={{ fontSize: '0.73rem', color: MUTED, marginTop: 1 }}>{sub}</p>
          </div>
          <span style={{ color: MUTED, fontSize: '0.85rem', flexShrink: 0 }}>→</span>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Card({ title, subtitle, headerRight, children, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <div>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2 }}>{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      <div style={{ padding: '20px' }}>
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
  const user       = getUser()
  const isDemoMode = user?.isDemoMode ?? false

  if (loading) return <DashboardSkeleton />
  if (error)   return <ErrorState message={error} onRetry={retry} />

  const { stats, alerts, areas, upcoming, pendingCount } = data

  // Derived counts
  const dueWithin30      = upcoming.total
  const currentCount     = Math.max(0, stats.total_instruments - stats.overdue_count - dueWithin30)
  const degradationCount = alerts.filter(a => a.alert_type === 'PREDICTED_TO_FAIL').length
  const dueThisWeek      = (upcoming.results ?? []).filter(i => i.days_until_due != null && i.days_until_due <= 7).length
  const dueSoonCount     = alerts.filter(a => a.alert_type === 'DUE_SOON').length

  // Compliance rate colour
  const compRate   = stats.compliance_rate
  const compBorder = compRate >= 90 ? '#22C55E' : compRate >= 70 ? '#F59E0B' : '#EF4444'
  const compValue  = compRate >= 90 ? '#16A34A' : compRate >= 70 ? '#D97706' : '#DC2626'
  const compSub    = compRate >= 95 ? '↑ Meets 95% target' : `↓ Below 95% target`

  const today   = new Date()
  const dateStr = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = today.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Demo banner ── */}
      {isDemoMode && <DemoBanner />}

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: NAVY }}>Calibration Dashboard</h2>
          <p style={{ fontSize: '0.85rem', color: MUTED, marginTop: 2 }}>
            {user?.siteName ?? 'Your site'} · As at {dateStr}, {timeStr}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/app/calibrations/import-csv"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: NAVY, textDecoration: 'none' }}>
            <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Import Calibration
          </Link>
          <Link to="/app/instruments"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: BLUE, borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            + Record Calibration
          </Link>
        </div>
      </div>

      {/* ── Row 1: 5 KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard
          label="Overdue"
          value={stats.overdue_count}
          borderColor="#EF4444"
          valueColor="#C62828"
          sub="Instruments past calibration due date"
        />
        <StatCard
          label="Due Within 30 Days"
          value={dueWithin30}
          borderColor="#F9A825"
          valueColor="#B45309"
          sub="Action required soon"
        />
        <StatCard
          label="Current"
          value={currentCount}
          borderColor="#4CAF50"
          valueColor={GREEN}
          sub="Up to date, no action required"
        />
        <StatCard
          label="Total Instruments"
          value={stats.total_instruments}
          borderColor={SKY}
          valueColor={BLUE}
          sub={areas.length > 0 ? `Across ${areas.length} process area${areas.length !== 1 ? 's' : ''}` : 'Active instruments'}
        />
        <StatCard
          label="Compliance Rate"
          value={`${compRate.toFixed(1)}%`}
          borderColor={compBorder}
          valueColor={compValue}
          sub={compSub}
        />
      </div>

      {/* ── Row 2: 3 attention cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <AttentionCard
          emoji="🔴"
          label="Overdue"
          count={stats.overdue_count}
          subText={stats.overdue_count === 0 ? 'All instruments calibrated on time' : 'Instruments past their due date — action needed'}
          to="/app/schedule"
          accentColor="#DC2626"
          bgColor="#FFF5F5"
          borderColor="#FECACA"
        />
        <AttentionCard
          emoji="🕐"
          label="Pending Approvals"
          count={pendingCount}
          subText={pendingCount === 0 ? 'No calibrations awaiting review' : 'Calibration records submitted for approval'}
          to="/app/calibrations"
          accentColor="#D97706"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
        />
        <AttentionCard
          emoji="↗"
          label="Drift Alerts"
          count={degradationCount}
          subText={degradationCount === 0 ? 'No instruments showing drift trends' : 'Instruments predicted to fail — review now'}
          to="/app/schedule"
          accentColor="#7C3AED"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
        />
      </div>

      {/* ── Row 3: Compliance gauge + Area bars ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <Card
          title="Calibration Compliance"
          subtitle="Active instruments calibrated on time, last 12 months"
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <ComplianceGauge rate={stats.compliance_rate} />
          </div>
        </Card>
        <Card
          title="Compliance by Area"
          subtitle="Sorted worst first"
        >
          <AreaBars areas={areas} />
        </Card>
      </div>

      {/* ── Row 4: Upcoming + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card
          title={`Upcoming — Next 7 Days`}
          subtitle={`${dueThisWeek} instrument${dueThisWeek !== 1 ? 's' : ''} require calibration`}
          headerRight={
            dueThisWeek > 8
              ? <Link to="/app/schedule" style={{ fontSize: '0.78rem', color: BLUE }}>View schedule</Link>
              : null
          }
        >
          <UpcomingList instruments={upcoming.results} />
        </Card>

        <Card
          title="Quick Actions"
          subtitle="Common tasks and shortcuts"
        >
          <QuickActions />
        </Card>
      </div>

    </div>
  )
}
