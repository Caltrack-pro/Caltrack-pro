import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { dashboard as dashApi, instruments as instrApi } from '../utils/api'
import { getUser } from '../utils/userContext'
import { CriticalityBadge } from '../components/Badges'
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

const CRIT_ORDER = { safety_critical: 0, process_critical: 1, standard: 2, non_critical: 3 }

const CAL_TYPE_MAP = {
  switch:      'Functional Test',
  valve:       'Stroke / Cal',
  pressure:    'Calibration',
  temperature: 'Calibration',
  flow:        'Calibration',
  level:       'Calibration',
  analyser:    'Calibration',
  other:       'Calibration',
}

// ─────────────────────────────────────────────────────────────────────────────
// Data hook — fetches 6 endpoints in parallel
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
      dashApi.badActors(site),
      instrApi.list({ calibration_status: 'overdue', limit: 100 }),
    ])
      .then(([stats, alerts, areas, upcoming, actors, overdueInstruments]) => {
        if (!cancelled) {
          setData({ stats, alerts, areas, upcoming, actors, overdueInstruments })
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
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, height: 200 }}>
        <Skel style={{ height: 16, width: 200, marginBottom: 16 }} />
        {[1,2,3,4].map(i => <Skel key={i} style={{ height: 40, marginBottom: 8 }} />)}
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
// Overdue instruments table (sorted by risk / due date / area)
// ─────────────────────────────────────────────────────────────────────────────

function SortBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.75rem',
        fontWeight: 600,
        border: `1px solid ${active ? BLUE : BORDER}`,
        background: active ? BLUE : '#fff',
        color: active ? '#fff' : NAVY,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function OverdueTable({ instruments, driftingIds }) {
  const [sortBy, setSortBy] = useState('risk')

  const sorted = useMemo(() => {
    const list = [...(instruments || [])]
    if (sortBy === 'risk') {
      return list.sort((a, b) => {
        const cA = CRIT_ORDER[a.criticality ?? 'non_critical'] ?? 3
        const cB = CRIT_ORDER[b.criticality ?? 'non_critical'] ?? 3
        if (cA !== cB) return cA - cB
        return (b.days_overdue ?? 0) - (a.days_overdue ?? 0)
      })
    }
    if (sortBy === 'due_date') {
      return list.sort((a, b) => (b.days_overdue ?? 0) - (a.days_overdue ?? 0))
    }
    if (sortBy === 'area') {
      return list.sort((a, b) => (a.area || '').localeCompare(b.area || ''))
    }
    return list
  }, [instruments, sortBy])

  if (!instruments || instruments.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, padding: '40px 24px', textAlign: 'center' }}>
        <svg style={{ width: 40, height: 40, color: '#CBD5E1', marginBottom: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>
        </svg>
        <p style={{ color: MUTED, fontSize: '0.9rem' }}>No overdue instruments. Site is fully compliant.</p>
      </div>
    )
  }

  const TH = ({ children, style = {} }) => (
    <th style={{
      background: NAVY, color: '#fff', padding: '10px 14px',
      textAlign: 'left', fontSize: '0.72rem', fontWeight: 600,
      letterSpacing: '0.5px', textTransform: 'uppercase',
      whiteSpace: 'nowrap', ...style
    }}>
      {children}
    </th>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠️</span> Overdue Instruments — Sorted by Risk
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: MUTED, marginRight: 4 }}>Sort by:</span>
          <SortBtn active={sortBy === 'risk'}     onClick={() => setSortBy('risk')}>Risk (R→G)</SortBtn>
          <SortBtn active={sortBy === 'due_date'} onClick={() => setSortBy('due_date')}>Due Date</SortBtn>
          <SortBtn active={sortBy === 'area'}     onClick={() => setSortBy('area')}>Area</SortBtn>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <TH>Criticality</TH>
              <TH>Tag Number</TH>
              <TH>Description</TH>
              <TH>Location / Area</TH>
              <TH>Cal. Type</TH>
              <TH>Last Calibrated</TH>
              <TH>Overdue By</TH>
              <TH>Trend</TH>
              <TH>Status</TH>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inst, idx) => {
              const isDrifting = driftingIds.has(String(inst.id))
              const overdueBy  = inst.days_overdue > 0 ? `${inst.days_overdue} days` : '—'
              const calType    = CAL_TYPE_MAP[inst.instrument_type] ?? 'Calibration'

              return (
                <tr key={inst.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? '#FAFBFC' : '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = LIGHT}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1 ? '#FAFBFC' : '#fff'}
                >
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <CriticalityBadge criticality={inst.criticality} />
                  </td>
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <Link to={`/app/instruments/${inst.id}`} style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: NAVY, textDecoration: 'none' }}
                      onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    >
                      {inst.tag_number}
                    </Link>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: NAVY, maxWidth: 220 }}>
                    <span title={inst.description} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inst.description || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: MUTED, whiteSpace: 'nowrap' }}>
                    {inst.area || '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: MUTED, whiteSpace: 'nowrap' }}>
                    {calType}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: MUTED, whiteSpace: 'nowrap' }}>
                    {inst.last_calibration_date ? fmtDate(inst.last_calibration_date) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: RED }}>{overdueBy}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {isDrifting
                      ? <span style={{ color: RED, fontWeight: 600 }}>↗ Drift detected</span>
                      : <span style={{ color: GREEN }}>— Stable</span>
                    }
                  </td>
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                      fontSize: '0.72rem', fontWeight: 700,
                      background: '#FFEBEE', color: RED,
                    }}>
                      OVERDUE
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
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

  const R            = 80
  const CX           = 100
  const CY           = 100
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
          <Link to="/app/instruments?calibration_status=due_soon" style={{ fontSize: '0.8rem', color: BLUE }}>
            + {nextWeek.length - 8} more — view all
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Bad actors list
// ─────────────────────────────────────────────────────────────────────────────

function BadActorsList({ actors }) {
  if (!actors || actors.length === 0)
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED }}>
        <svg style={{ width: 40, height: 40, color: '#CBD5E1', display: 'block', margin: '0 auto 8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>
        </svg>
        <p style={{ fontSize: '0.875rem' }}>No failures recorded in the last 12 months.</p>
      </div>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {actors.slice(0, 10).map((actor, i) => (
        <Link key={actor.instrument_id} to={`/app/instruments/${actor.instrument_id}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: `1px solid ${BORDER}`, textDecoration: 'none', borderRadius: 6, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = LIGHT}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: MUTED, flexShrink: 0 }}>
              {i + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: NAVY }}>{actor.tag_number}</p>
              <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {actor.description ? `${actor.description}${actor.area ? ` · ${actor.area}` : ''}` : actor.area || '—'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
            <span style={{ fontSize: '0.75rem', color: MUTED }}>{actor.last_failure_date ? fmtDate(actor.last_failure_date) : '—'}</span>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

  const { stats, alerts, areas, upcoming, actors, overdueInstruments } = data

  // Derived counts
  const dueWithin30     = upcoming.total
  const currentCount    = Math.max(0, stats.total_instruments - stats.overdue_count - dueWithin30)
  const degradationCount = alerts.filter(a => a.alert_type === 'PREDICTED_TO_FAIL').length
  const dueThisWeek     = (upcoming.results ?? []).filter(i => i.days_until_due != null && i.days_until_due <= 7).length

  // Drift alert instrument IDs for the overdue table trend column
  const driftingIds = new Set(
    alerts.filter(a => a.alert_type === 'PREDICTED_TO_FAIL').map(a => String(a.instrument_id))
  )

  // Compliance rate colour
  const compRate     = stats.compliance_rate
  const compBorder   = compRate >= 90 ? '#22C55E' : compRate >= 70 ? '#F59E0B' : '#EF4444'
  const compValue    = compRate >= 90 ? '#16A34A' : compRate >= 70 ? '#D97706' : '#DC2626'
  const compSub      = compRate >= 95 ? '↑ Meets 95% target' : `↓ Below 95% target`

  // Sub-text for overdue/due-soon cards
  // Note: alerts don't carry criticality, so we derive safety counts from the instrument list
  const overdueResults      = overdueInstruments?.results ?? []
  const safetyOverdueCount  = overdueResults.filter(i => i.criticality === 'safety_critical').length
  const dueSoonAlertCount   = alerts.filter(a => a.alert_type === 'DUE_SOON').length

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
          <Link to="/app/calibrations/new/select"
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
          sub={safetyOverdueCount > 0 ? `${safetyOverdueCount} are safety-critical (Red)` : 'Instruments past due date'}
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

      {/* ── Degradation alerts card (only shown when > 0) ── */}
      {degradationCount > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>
          <StatCard
            label="Degradation Alerts"
            value={degradationCount}
            borderColor="#EF4444"
            valueColor="#C62828"
            sub="Instruments showing drift trend"
          />
          <div style={{ display: 'flex', alignItems: 'center', background: '#FFF9F9', borderRadius: 12, border: '1px solid #FECACA', padding: '14px 20px' }}>
            <svg style={{ width: 20, height: 20, color: '#EF4444', flexShrink: 0, marginRight: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>
            <p style={{ fontSize: '0.875rem', color: '#7F1D1D' }}>
              <strong>{degradationCount} instrument{degradationCount !== 1 ? 's' : ''}</strong> showing calibration drift trends. Review now to avoid future failures.{' '}
              <Link to="/app/alerts" style={{ color: '#DC2626', fontWeight: 600 }}>View alerts →</Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Overdue instruments table ── */}
      <OverdueTable instruments={overdueInstruments?.results ?? []} driftingIds={driftingIds} />

      {/* ── Row 2: Compliance gauge + Area bars ── */}
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

      {/* ── Row 3: Upcoming + Bad Actors ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card
          title={`Upcoming — Next 7 Days`}
          subtitle={`${dueThisWeek} instrument${dueThisWeek !== 1 ? 's' : ''} require calibration`}
          headerRight={
            dueThisWeek > 8
              ? <Link to="/app/instruments?calibration_status=due_soon" style={{ fontSize: '0.78rem', color: BLUE }}>View all</Link>
              : null
          }
        >
          <UpcomingList instruments={upcoming.results} />
        </Card>

        <Card
          title="Bad Actors"
          subtitle="Top 10 instruments by as-found failures (12 months)"
          headerRight={
            <Link to="/app/bad-actors" style={{ fontSize: '0.78rem', color: BLUE }}>View all</Link>
          }
        >
          <BadActorsList actors={actors} />
        </Card>
      </div>

    </div>
  )
}
