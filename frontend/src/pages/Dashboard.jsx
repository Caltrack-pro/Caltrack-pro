import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi, calibrations as calsApi, instruments as instrApi } from '../utils/api'
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
  const [user,    setUser]    = useState(() => getUser())
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    function onUserChange(e) { setUser(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  const site     = user?.siteName   ?? null
  const demoMode = user?.isDemoMode ?? false

  useEffect(() => {
    if (!site) return
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      dashApi.stats(site),
      dashApi.alerts(site),
      dashApi.complianceByArea(site),
      dashApi.upcoming(site),
      calsApi.list({ record_status: 'submitted', limit: 1 }),
      instrApi.list({ last_calibration_result: 'marginal', status: 'active', limit: 1 }),
      instrApi.list({ last_calibration_result: 'fail',     status: 'active', limit: 1 }),
    ])
      .then(([stats, alerts, areas, upcoming, pendingCals, marginalInstr, failInstr]) => {
        if (!cancelled) {
          setData({ stats, alerts, areas, upcoming, pendingCount: pendingCals?.total ?? 0, driftCount: (marginalInstr?.total ?? 0) + (failInstr?.total ?? 0) })
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
  }, [site, demoMode, refresh])

  return { loading, error, data, retry: () => setRefresh(r => r + 1) }
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
      {/* Quick Actions Bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 20px', height: 80 }}>
        <Skel style={{ height: '100%' }} />
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #e2e8f0', padding: '18px 20px' }}>
            <Skel style={{ height: 32, width: 60, marginBottom: 8 }} />
            <Skel style={{ height: 12, width: 120 }} />
          </div>
        ))}
      </div>

      {/* Health Donut */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 20px', height: 240 }}>
        <Skel style={{ height: 16, width: 180, marginBottom: 20 }} />
        <Skel style={{ height: 200 }} />
      </div>

      {/* 3 Attention Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 20px', height: 120 }}>
            <Skel style={{ height: 16, width: 80, marginBottom: 12 }} />
            <Skel style={{ height: 40, width: 60, marginBottom: 12 }} />
            <Skel style={{ height: 12, width: 140 }} />
          </div>
        ))}
      </div>

      {/* Area Bars + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 20px', height: 300 }}>
          <Skel style={{ height: '100%' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 20px', height: 300 }}>
          <Skel style={{ height: '100%' }} />
        </div>
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
        Riverdale Water Treatment Authority (Demo)
      </span>
      — This company does not exist.
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI stat card — coloured left border
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, borderColor, valueColor, sub, to }) {
  const [hovered, setHovered] = useState(false)
  const inner = (
    <div style={{
      background: hovered && to ? '#FAFCFF' : '#fff',
      borderRadius: 12,
      border: `1px solid ${hovered && to ? borderColor : '#e2e8f0'}`,
      boxShadow: hovered && to ? `0 4px 12px ${borderColor}33` : '0 1px 3px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${borderColor}`,
      padding: '18px 16px',
      minWidth: 0,
      cursor: to ? 'pointer' : 'default',
      transition: 'all 0.18s ease',
    }}
      onMouseEnter={() => to && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: '2.2rem', fontWeight: 800, color: valueColor, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', margin: '4px 0' }}>
        {value ?? '—'}
      </p>
      {sub && (
        <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          {sub}
          {to && <span style={{ marginLeft: 'auto', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', fontSize: '0.8rem', color: borderColor }}>→</span>}
        </p>
      )}
    </div>
  )
  if (to) return <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
  return inner
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
// Instrument Health Donut (hero element)
// ─────────────────────────────────────────────────────────────────────────────

function InstrumentHealthDonut({ overdue, dueSoon, estOutOfTol, current }) {
  const [displayed, setDisplayed] = useState({ overdue: 0, dueSoon: 0, estOutOfTol: 0, current: 0 })

  useEffect(() => {
    const t = setTimeout(() => setDisplayed({ overdue, dueSoon, estOutOfTol, current }), 80)
    return () => clearTimeout(t)
  }, [overdue, dueSoon, estOutOfTol, current])

  const total = displayed.overdue + displayed.dueSoon + displayed.estOutOfTol + displayed.current
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED }}>
        <p>No instrument data available.</p>
      </div>
    )
  }

  const segments = [
    { value: displayed.current, color: '#22C55E', label: 'Current', desc: 'Calibrated on time, not due soon' },
    { value: displayed.dueSoon, color: '#F59E0B', label: 'Due Soon', desc: 'Due within 14 days' },
    { value: displayed.overdue, color: '#EF4444', label: 'Overdue', desc: 'Past due date' },
    { value: displayed.estOutOfTol, color: '#7C3AED', label: 'Est. Out of Tolerance', desc: 'Marginal / drift trend' },
  ]

  const R = 60
  const CX = 100
  const CY = 100
  const innerR = 35
  let offset = 0
  const arcs = []

  for (const seg of segments) {
    const sliceAngle = (seg.value / total) * 360
    const startAngle = offset
    const endAngle = offset + sliceAngle
    offset = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = CX + R * Math.cos(startRad)
    const y1 = CY + R * Math.sin(startRad)
    const x2 = CX + R * Math.cos(endRad)
    const y2 = CY + R * Math.sin(endRad)

    const x1Inner = CX + innerR * Math.cos(startRad)
    const y1Inner = CY + innerR * Math.sin(startRad)
    const x2Inner = CX + innerR * Math.cos(endRad)
    const y2Inner = CY + innerR * Math.sin(endRad)

    const largeArc = sliceAngle > 180 ? 1 : 0
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`

    arcs.push(
      <path
        key={seg.label}
        d={path}
        fill={seg.color}
        opacity="0.8"
        style={{ transition: 'opacity 0.3s ease' }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {arcs}
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        {segments.map(seg => (
          seg.value > 0 && (
            <div key={seg.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937' }}>
                  {seg.label}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: seg.color, marginLeft: 'auto' }}>
                  {seg.value}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: MUTED, marginLeft: 22 }}>
                {seg.desc}
              </p>
            </div>
          )
        ))}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: '0.75rem', color: MUTED, lineHeight: 1.5 }}>
            <strong style={{ color: '#374151' }}>* Est. Out of Tolerance</strong> is based on drift trend analysis and may not reflect actual instrument condition.
          </p>
        </div>
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
// Quick Actions Bar (horizontal)
// ─────────────────────────────────────────────────────────────────────────────

function QuickActionsBar() {
  const actions = [
    { emoji: '📋', label: 'Record Calibration', to: '/app/instruments' },
    { emoji: '📥', label: 'Import CSV', to: '/app/calibrations/import-csv' },
    { emoji: '🔧', label: 'Add Instrument', to: '/app/instruments/new' },
    { emoji: '📄', label: 'Export Report', to: '/app/reports' },
    { emoji: '📅', label: 'View Schedule', to: '/app/schedule' },
    { emoji: '⚙️', label: 'Settings', to: '/app/settings' },
  ]

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {actions.map(({ emoji, label, to }) => (
        <Link
          key={to}
          to={to}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
            padding: '4px 12px',
            borderRadius: 8,
            transition: 'background 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = LIGHT}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY, whiteSpace: 'nowrap', textAlign: 'center' }}>
            {label}
          </span>
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

  const { stats, alerts, areas, upcoming, pendingCount, driftCount } = data

  // Derived counts for health donut
  const overdue = stats.overdue_count
  const dueSoon = alerts.filter(a => a.alert_type === 'DUE_SOON').length
  const estOutOfTol = driftCount
  const current = Math.max(0, stats.total_instruments - overdue - dueSoon - estOutOfTol)

  // Additional derived counts
  const dueWithin30      = upcoming.total
  const dueThisWeek      = (upcoming.results ?? []).filter(i => i.days_until_due != null && i.days_until_due <= 7).length

  // Attention card counts
  const recommendationCount = alerts.filter(a => ['OVERDUE', 'FAILED', 'CONSECUTIVE_FAILURES', 'PREDICTED_TO_FAIL'].includes(a.alert_type)).length
  const repeatFailureCount  = alerts.filter(a => a.alert_type === 'CONSECUTIVE_FAILURES').length

  // Compliance rate colour
  const compRate   = stats.compliance_rate
  const noInstrs   = stats.total_instruments === 0
  const compBorder = noInstrs ? BORDER : compRate >= 90 ? '#22C55E' : compRate >= 70 ? '#F59E0B' : '#EF4444'
  const compValue  = noInstrs ? MUTED  : compRate >= 90 ? '#16A34A' : compRate >= 70 ? '#D97706' : '#DC2626'
  const compSub    = noInstrs ? 'Add instruments to track compliance' : compRate >= 95 ? '↑ Meets 95% target' : `↓ Below 95% target`

  const today   = new Date()
  const dateStr = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = today.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Demo banner ── */}
      {isDemoMode && <DemoBanner />}

      {/* ── Welcome banner for new sites with zero instruments ── */}
      {!isDemoMode && stats.total_instruments === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0B1F3A 100%)',
          borderRadius: 16,
          padding: '36px 32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
            Welcome to CalCheq, {user?.userName || 'there'}!
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.85, maxWidth: 480, lineHeight: 1.6, marginBottom: 24 }}>
            Get started by adding your instruments. Import your existing register from a CSV, or add a few manually to see CalCheq in action.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/app/onboarding" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
              background: '#fff', color: '#1565C0', textDecoration: 'none',
            }}>
              🚀 Get Started
            </Link>
            <Link to="/app/import" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
              background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              📥 Import CSV
            </Link>
            <Link to="/app/instruments/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
              background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              ✏️ Add Manually
            </Link>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: NAVY }}>Calibration Dashboard</h2>
          <p style={{ fontSize: '0.85rem', color: MUTED, marginTop: 2 }}>
            {user?.siteName ?? 'Your site'} · As at {dateStr}, {timeStr}
          </p>
        </div>
      </div>

      {/* ── Quick Actions Bar (horizontal) ── */}
      <QuickActionsBar />

      {/* ── 4 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard
          label="Overdue"
          value={stats.overdue_count}
          borderColor="#EF4444"
          valueColor="#C62828"
          sub="Instruments past calibration due date"
          to="/app/schedule"
        />
        <StatCard
          label="Due Within 30 Days"
          value={dueWithin30}
          borderColor="#F9A825"
          valueColor="#B45309"
          sub="Action required soon"
          to="/app/instruments"
        />
        <StatCard
          label="Total Instruments"
          value={stats.total_instruments}
          borderColor={SKY}
          valueColor={BLUE}
          sub={areas.length > 0 ? `Across ${areas.length} process area${areas.length !== 1 ? 's' : ''}` : 'Active instruments'}
          to="/app/instruments"
        />
        <StatCard
          label="Compliance Rate"
          value={noInstrs ? '—' : `${compRate.toFixed(1)}%`}
          borderColor={compBorder}
          valueColor={compValue}
          sub={compSub}
          to={noInstrs ? null : '/app/reports'}
        />
      </div>

      {/* ── Instrument Health Donut (hero element) ── */}
      <Card title="Instrument Health Overview">
        <InstrumentHealthDonut overdue={overdue} dueSoon={dueSoon} estOutOfTol={estOutOfTol} current={current} />
      </Card>

      {/* ── 3 Attention Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <AttentionCard
          emoji="💡"
          label="Recommendations"
          count={recommendationCount}
          subText={recommendationCount === 0 ? 'No active recommendations' : `${recommendationCount} action${recommendationCount !== 1 ? 's' : ''} flagged by diagnostics engine`}
          to="/app/diagnostics?tab=recommendations"
          accentColor="#1565C0"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
        />
        <AttentionCard
          emoji="📈"
          label="Drift Alerts"
          count={driftCount}
          subText={driftCount === 0 ? 'No instruments showing drift trends' : 'Marginal or failing instruments — review trends'}
          to="/app/diagnostics?tab=drift"
          accentColor="#7C3AED"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
        />
        <AttentionCard
          emoji="🔁"
          label="Repeat Failures"
          count={repeatFailureCount}
          subText={repeatFailureCount === 0 ? 'No repeat failures detected' : 'Instruments with consecutive as-found failures'}
          to="/app/diagnostics?tab=failures"
          accentColor="#DC2626"
          bgColor="#FFF5F5"
          borderColor="#FECACA"
        />
      </div>

      {/* ── Area Bars + Upcoming (2 columns) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <Card
          title="Compliance by Area"
          subtitle="Sorted worst first"
        >
          <AreaBars areas={areas} />
        </Card>
        <Card
          title={`Upcoming — Next 7 Days`}
          subtitle={`${dueThisWeek} instrument${dueThisWeek !== 1 ? 's' : ''} require calibration`}
        >
          <UpcomingList instruments={upcoming.results} />
        </Card>
      </div>

    </div>
  )
}