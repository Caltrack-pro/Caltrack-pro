/**
 * Calibrations — "What has been done"
 * Two tabs:
 *   Activity Log      — all calibration records, newest first (default)
 *   Pending Approvals — submitted records awaiting supervisor/admin review
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calibrations as calApi, instruments as instrApi } from '../utils/api'
import { ResultBadge, RecordStatusBadge } from '../components/Badges'
import { fmtDate, fmtPct, humanise, todayISO } from '../utils/formatting'
import { getUser, canApprove } from '../utils/userContext'
import { ToastContainer, useToast } from '../components/Toast'
import { generateSingleCalibrationCert } from '../utils/reportGenerator'

// ── Colour palette ────────────────────────────────────────────────────────────
const NAVY = '#0B1F3A'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function ErrorMsg({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-6 text-center text-sm text-red-700">
      <p className="font-semibold mb-1">Failed to load</p>
      <p className="mb-3">{message}</p>
      {onRetry && <button onClick={onRetry} className="px-3 py-1.5 text-xs border border-red-300 rounded hover:bg-red-100 transition-colors">Try again</button>}
    </div>
  )
}

const TH = 'text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide whitespace-nowrap'
const TD = 'px-4 py-3'

// ── TAB 1: Pending Approvals ──────────────────────────────────────────────────

function PendingTab({ onApprovalDone }) {
  const [records,   setRecords]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [actioning, setActioning] = useState({})
  const { toasts, showToast, dismissToast } = useToast()
  const currentUser   = getUser()
  const userCanApprove = canApprove(currentUser)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    calApi.list({ record_status: 'submitted', limit: 200 })
      .then(res => { setRecords(res?.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function handleApprove(rec) {
    setActioning(a => ({ ...a, [rec.id]: 'approve' }))
    try {
      await calApi.approve(rec.id, currentUser.userName)
      showToast(`✅ Approved calibration for ${rec.instrument?.tag_number ?? 'instrument'}`, 'success')
      setRecords(prev => prev.filter(r => r.id !== rec.id))
      onApprovalDone?.()
    } catch (e) {
      showToast(e.message ?? 'Approval failed', 'error')
    } finally {
      setActioning(a => { const n = { ...a }; delete n[rec.id]; return n })
    }
  }

  async function handleReject(rec) {
    setActioning(a => ({ ...a, [rec.id]: 'reject' }))
    try {
      await calApi.reject(rec.id, null)
      showToast(`Rejected calibration for ${rec.instrument?.tag_number ?? 'instrument'}`, 'info')
      setRecords(prev => prev.filter(r => r.id !== rec.id))
      onApprovalDone?.()
    } catch (e) {
      showToast(e.message ?? 'Rejection failed', 'error')
    } finally {
      setActioning(a => { const n = { ...a }; delete n[rec.id]; return n })
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Role notice */}
      {!userCanApprove && currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          Your role (<em>{currentUser.role}</em>) cannot approve records. Admin or Supervisor access required.
        </div>
      )}

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> :
       records.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-slate-600 font-semibold">No pending approvals</p>
          <p className="text-sm text-slate-400 mt-1">All submitted calibrations have been reviewed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-blue-600">{records.length}</span> record{records.length !== 1 ? 's' : ''} awaiting review
            </p>
            <button onClick={load} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">↺ Refresh</button>
          </div>
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr style={{ background: NAVY }}>
                {['Tag','Description','Date','Type','Technician','As-Found','Max Error','Adjusted','Actions'].map(h => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec, idx) => {
                const busy = actioning[rec.id]
                return (
                  <tr key={rec.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className={TD}>
                      <Link to={`/app/instruments/${rec.instrument_id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {rec.instrument?.tag_number ?? rec.instrument_id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td className={`${TD} text-slate-600 max-w-[160px] truncate`}>{rec.instrument?.description ?? '—'}</td>
                    <td className={`${TD} text-slate-700 whitespace-nowrap`}>{fmtDate(rec.calibration_date)}</td>
                    <td className={`${TD} text-slate-600 whitespace-nowrap`}>{humanise(rec.calibration_type)}</td>
                    <td className={`${TD} text-slate-600`}>{rec.technician_name || '—'}</td>
                    <td className={TD}><ResultBadge result={rec.as_found_result} /></td>
                    <td className={`${TD} font-mono text-slate-600 whitespace-nowrap`}>
                      {rec.max_as_found_error_pct != null ? fmtPct(rec.max_as_found_error_pct) : '—'}
                    </td>
                    <td className={TD}>
                      <span className={rec.adjustment_made ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                        {rec.adjustment_made ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={`${TD} whitespace-nowrap`}>
                      {userCanApprove ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleReject(rec)} disabled={!!busy}
                            className="text-xs px-2.5 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
                            ✗ Reject
                          </button>
                          <button onClick={() => handleApprove(rec)} disabled={!!busy}
                            className="text-xs px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40">
                            {busy === 'approve' ? '…' : '✓ Approve'}
                          </button>
                        </div>
                      ) : (
                        <Link to={`/app/instruments/${rec.instrument_id}`}
                          className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                          View
                        </Link>
                      )}
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

// ── TAB 2: Activity Log ───────────────────────────────────────────────────────

function addDays(iso, n) {
  const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]
}

function ActivityTab() {
  const today = todayISO()
  const [dateFrom, setDateFrom] = useState(addDays(today, -365))
  const [dateTo,   setDateTo]   = useState(today)
  const [result,   setResult]   = useState('')
  const [status,   setStatus]   = useState('')
  const [tech,     setTech]     = useState('')
  const [data,     setData]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [rev,      setRev]      = useState(0)

  useEffect(() => {
    setLoading(true); setError(null)
    const params = { date_from: dateFrom, date_to: dateTo, limit: 300 }
    if (result) params.result = result
    if (status) params.record_status = status
    calApi.list(params)
      .then(res => { setData(res?.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [rev, dateFrom, dateTo, result, status])

  const filtered = useMemo(() => {
    if (!tech) return data
    return data.filter(r => (r.technician_name ?? '').toLowerCase().includes(tech.toLowerCase()))
  }, [data, tech])

  const uniqueTechs = useMemo(() => [...new Set(data.map(r => r.technician_name).filter(Boolean))].sort(), [data])

  function downloadCSV() {
    const headers = ['Date','Tag','Description','Technician','As-Found','As-Left','Max Error %','Adjusted','Status']
    const rows = filtered.map(r => [
      fmtDate(r.calibration_date),
      r.instrument?.tag_number ?? '',
      r.instrument?.description ?? '',
      r.technician_name ?? '',
      r.as_found_result ?? '',
      r.as_left_result ?? '',
      r.max_as_found_error_pct != null ? fmtPct(r.max_as_found_error_pct, 2) : '',
      r.adjustment_made ? 'Yes' : 'No',
      r.record_status ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `calibrations-${dateFrom}-to-${dateTo}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">From</label>
          <input type="date" value={dateFrom} max={dateTo}
            onChange={e => { setDateFrom(e.target.value); setRev(r => r + 1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">To</label>
          <input type="date" value={dateTo} min={dateFrom} max={today}
            onChange={e => { setDateTo(e.target.value); setRev(r => r + 1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Result</label>
          <select value={result} onChange={e => { setResult(e.target.value); setRev(r => r + 1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Results</option>
            <option value="pass">Pass</option>
            <option value="marginal">Marginal</option>
            <option value="fail">Fail</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setRev(r => r + 1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Technician</label>
          <select value={tech} onChange={e => setTech(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Technicians</option>
            {uniqueTechs.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={downloadCSV} disabled={!filtered.length}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          ⬇ Export CSV
        </button>
      </div>

      {!loading && (
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {data.length} records
        </p>
      )}

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => setRev(r => r + 1)} /> :
       filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">No calibration records found for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: NAVY }}>
                {['Date','Tag','Description','Technician','As-Found','As-Left','Max Error %','Adjusted','Status',''].map(h => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec, idx) => (
                <tr key={rec.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className={`${TD} whitespace-nowrap text-slate-700`}>{fmtDate(rec.calibration_date)}</td>
                  <td className={TD}>
                    <Link to={`/app/instruments/${rec.instrument_id}`} className="font-mono font-bold text-blue-600 hover:underline">
                      {rec.instrument?.tag_number ?? rec.instrument_id?.slice(0, 8)}
                    </Link>
                  </td>
                  <td className={`${TD} text-slate-600 max-w-[160px] truncate`}>{rec.instrument?.description ?? '—'}</td>
                  <td className={`${TD} text-slate-600`}>{rec.technician_name || '—'}</td>
                  <td className={TD}><ResultBadge result={rec.as_found_result} /></td>
                  <td className={TD}><ResultBadge result={rec.as_left_result} /></td>
                  <td className={`${TD} font-mono whitespace-nowrap ${
                    rec.as_found_result === 'fail' ? 'text-red-600 font-bold' :
                    rec.as_found_result === 'marginal' ? 'text-amber-600 font-semibold' : 'text-slate-600'
                  }`}>
                    {rec.max_as_found_error_pct != null ? fmtPct(rec.max_as_found_error_pct, 2) : '—'}
                  </td>
                  <td className={`${TD}`}>
                    <span className={rec.adjustment_made ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                      {rec.adjustment_made ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className={TD}><RecordStatusBadge status={rec.record_status} /></td>
                  <td className={`${TD} whitespace-nowrap`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            const instr = await instrApi.get(rec.instrument_id)
                            await generateSingleCalibrationCert(instr, rec, getUser()?.siteName ?? '')
                          } catch (err) {
                            console.error('PDF generation failed', err)
                          }
                        }}
                        className="text-xs px-2 py-1 border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Download calibration certificate PDF"
                      >
                        📄 PDF
                      </button>
                      <Link to={`/app/instruments/${rec.instrument_id}`}
                        className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors">
                        View
                      </Link>
                    </div>
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Calibrations({ defaultTab }) {
  const user = getUser()
  const [tab, setTab] = useState(defaultTab ?? 'activity')
  const [pendingCount, setPendingCount] = useState(null)

  // Load pending count for badge — and if supervisor/admin, auto-switch to approvals tab
  useEffect(() => {
    calApi.list({ record_status: 'submitted', limit: 200 })
      .then(res => {
        const count = (res?.results ?? res ?? []).length
        setPendingCount(count)
        // Default to approvals tab for approvers when there are pending records
        if (!defaultTab && count > 0 && canApprove(user)) {
          setTab('pending')
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const TABS = [
    { id: 'activity', emoji: '📋', label: 'Activity Log' },
    { id: 'pending',  emoji: '🕐', label: `Pending Approvals${pendingCount != null && pendingCount > 0 ? ` (${pendingCount})` : ''}` },
  ]

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📋 Calibrations</h1>
        <p className="text-sm text-slate-500 mt-1">Review submitted records and browse the full calibration history.</p>
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
        {tab === 'pending'  && <PendingTab onApprovalDone={() => setPendingCount(c => Math.max(0, (c ?? 1) - 1))} />}
        {tab === 'activity' && <ActivityTab />}
      </div>

    </div>
  )
}
