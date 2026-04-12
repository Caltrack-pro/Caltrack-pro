/** Shared coloured badge components — CLAUDE.md colour conventions throughout. */

function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </span>
  )
}

/** Instrument calibration / alert status badge */
export function CalStatusBadge({ alertStatus, instrumentStatus }) {
  if (instrumentStatus === 'decommissioned')
    return <Badge className="bg-gray-100 text-gray-500">DECOMM.</Badge>
  if (instrumentStatus === 'out_of_service')
    return <Badge className="bg-gray-100 text-gray-600">OUT OF SVC</Badge>
  if (instrumentStatus === 'spare')
    return <Badge className="bg-slate-100 text-slate-600">SPARE</Badge>

  if (alertStatus === 'overdue')
    return <Badge className="bg-red-100 text-red-700">OVERDUE</Badge>
  if (alertStatus === 'due_soon')
    return <Badge className="bg-amber-100 text-amber-700">DUE SOON</Badge>
  if (alertStatus === 'current')
    return <Badge className="bg-green-100 text-green-700">CURRENT</Badge>

  return <Badge className="bg-gray-100 text-gray-500">NOT CAL.</Badge>
}

/** Calibration result badge (pass / fail / marginal / not_calibrated) */
export function ResultBadge({ result }) {
  if (!result || result === 'not_calibrated')
    return <span className="text-slate-400 text-xs">—</span>
  if (result === 'pass')
    return <Badge className="bg-green-100 text-green-700">PASS</Badge>
  if (result === 'fail')
    return <Badge className="bg-red-100 text-red-700">FAIL</Badge>
  if (result === 'marginal')
    return <Badge className="bg-amber-100 text-amber-700">MARGINAL</Badge>
  if (result === 'not_required')
    return <Badge className="bg-slate-100 text-slate-500">N/R</Badge>
  return <Badge className="bg-slate-100 text-slate-500">{result}</Badge>
}

/** Record workflow status badge */
export function RecordStatusBadge({ status }) {
  if (status === 'draft')
    return <Badge className="bg-slate-100 text-slate-600">DRAFT</Badge>
  if (status === 'submitted')
    return <Badge className="bg-blue-100 text-blue-700">SUBMITTED</Badge>
  if (status === 'approved')
    return <Badge className="bg-green-100 text-green-700">APPROVED</Badge>
  if (status === 'rejected')
    return <Badge className="bg-red-100 text-red-700">REJECTED</Badge>
  return <Badge className="bg-slate-100 text-slate-500">{status}</Badge>
}

/**
 * Instrument criticality traffic-light badge.
 * Colours match the CalCheq colour conventions and the Demo HTML design.
 *   safety_critical  → Red   — SIS / Trip (plant shutdown on failure)
 *   process_critical → Amber — Process Critical (affects controllers / other assets)
 *   standard         → Green — Standard (indication only)
 *   non_critical     → Grey  — Non-Critical (utility)
 */
export function CriticalityBadge({ criticality, size = 'sm' }) {
  const pad  = size === 'sm' ? '2px 9px' : '4px 12px'
  const font = size === 'sm' ? '0.7rem'  : '0.8rem'
  const dot  = { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: pad, borderRadius: 20, fontSize: font, fontWeight: 700,
  }

  if (criticality === 'safety_critical')
    return (
      <span style={{ ...base, background: '#FFEBEE', color: '#C62828' }}>
        <span style={{ ...dot, background: '#C62828' }} />
        SIS / Trip
      </span>
    )
  if (criticality === 'process_critical')
    return (
      <span style={{ ...base, background: '#FFFDE7', color: '#7B5800' }}>
        <span style={{ ...dot, background: '#F9A825' }} />
        Process Critical
      </span>
    )
  if (criticality === 'standard')
    return (
      <span style={{ ...base, background: '#E8F5E9', color: '#2E7D32' }}>
        <span style={{ ...dot, background: '#2E7D32' }} />
        Standard
      </span>
    )
  // non_critical or null/undefined
  return (
    <span style={{ ...base, background: '#F1F5F9', color: '#64748B' }}>
      <span style={{ ...dot, background: '#94A3B8' }} />
      Non-Critical
    </span>
  )
}

/** Large inline result indicator for form summaries */
export function ResultPill({ result, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-lg px-5 py-2' : 'text-sm px-3 py-1'
  if (!result) return null
  if (result === 'pass')
    return <span className={`inline-flex items-center rounded-full font-bold bg-green-100 text-green-700 ${sizeClass}`}>✓ PASS</span>
  if (result === 'fail')
    return <span className={`inline-flex items-center rounded-full font-bold bg-red-100 text-red-700 ${sizeClass}`}>✗ FAIL</span>
  if (result === 'marginal')
    return <span className={`inline-flex items-center rounded-full font-bold bg-amber-100 text-amber-700 ${sizeClass}`}>~ MARGINAL</span>
  return null
}
