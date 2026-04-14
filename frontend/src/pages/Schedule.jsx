/**
 * Schedule — "Your calibration work queue and planning tools"
 * Two tabs: Technician Queue (default) | Planner
 *
 * Technician Queue: unified work list from queue API (Overdue + Due Soon combined)
 * Planner: build and manage your calibration schedule
 *
 * Supports ?tab=queue / ?tab=planner for deep-linking.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { instruments as instrApi, queue as queueApi } from '../utils/api'
import { CriticalityBadge } from '../components/Badges'
import { fmtDate } from '../utils/formatting'
import { getUser } from '../utils/userContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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


// ── TAB 1: Technician Queue ───────────────────────────────────────────────────

function TechnicianQueueTab() {
  const [queueItems, setQueueItems] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    queueApi.list()
      .then(res => {
        const items = res.items ?? []
        // Sort by priority and then by alert status (overdue before due-soon)
        const sorted = [...items].sort((a, b) => {
          const aInst = a.instrument
          const bInst = b.instrument
          const aOverdue = aInst.days_overdue > 0
          const bOverdue = bInst.days_overdue > 0
          if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
          const ca = CRIT_ORDER[aInst.criticality ?? 'non_critical'] ?? 3
          const cb = CRIT_ORDER[bInst.criticality ?? 'non_critical'] ?? 3
          return ca !== cb ? ca - cb : (a.priority ?? 999) - (b.priority ?? 999)
        })
        setQueueItems(sorted)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Your current calibration work queue. Start a calibration or visit the Planner tab to add more instruments.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          ↺ Refresh
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
       queueItems.length === 0 ? (
        <EmptyOk icon="📋" message="No instruments in the calibration queue. Use the Planner tab to build your work schedule." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr style={{ background: NAVY }}>
                {['Priority','Tag','Description','Area','Due Date','Status','Added By','Action'].map(h => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueItems.map((item, idx) => {
                const inst = item.instrument
                const isOverdue = inst.days_overdue > 0
                const daysUntil = inst.days_until_due
                const status = isOverdue ? 'overdue' : (daysUntil != null && daysUntil <= 7) ? 'due-soon' : 'current'
                const statusColor = isOverdue ? 'text-red-600' : (daysUntil != null && daysUntil <= 7) ? 'text-amber-600' : 'text-green-600'

                return (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className={TD}>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {idx + 1}
                      </span>
                    </td>
                    <td className={TD}>
                      <Link to={`/app/instruments/${inst.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {inst.tag_number}
                      </Link>
                    </td>
                    <td className={`${TD} text-slate-600 max-w-[200px] truncate`}>{inst.description || '—'}</td>
                    <td className={`${TD} text-slate-500`}>{inst.area || '—'}</td>
                    <td className={`${TD} font-semibold whitespace-nowrap ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                      {fmtDate(inst.calibration_due_date)}
                    </td>
                    <td className={`${TD} font-semibold ${statusColor}`}>
                      {isOverdue ? `${inst.days_overdue}d overdue` : daysUntil != null ? `${daysUntil}d left` : '—'}
                    </td>
                    <td className={`${TD} text-slate-500 text-xs`}>{item.added_by_name || '—'}</td>
                    <td className={`${TD} whitespace-nowrap`}>
                      <Link to={`/app/calibrations/new/${inst.id}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Start Cal
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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

  // Candidates: when filter='all', show ALL active instruments. Otherwise filter by status.
  const candidates = useMemo(() => {
    let list = filter === 'all'
      ? [...allInstruments]  // All active instruments — no pre-filter
      : allInstruments.filter(i =>
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
            <p className="text-xs text-slate-400 mt-0.5">All active instruments — filter by status or search</p>
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
  { id: 'queue',   emoji: '📋', label: 'Technician Queue' },
  { id: 'planner', emoji: '📅', label: 'Planner' },
]

export default function Schedule() {
  const [searchParams] = useSearchParams()
  const paramTab = searchParams.get('tab')
  const validTab = TABS.find(t => t.id === paramTab)?.id
  const [tab, setTab] = useState(validTab ?? 'queue')

  // If the URL tab param changes (e.g. navigated from Dashboard), sync
  useEffect(() => {
    if (validTab) setTab(validTab)
  }, [validTab])

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📅 Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Your calibration work queue and planning tools.</p>
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
        {tab === 'queue'   && <TechnicianQueueTab />}
        {tab === 'planner' && <PlannerTab />}
      </div>

    </div>
  )
}
