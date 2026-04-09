/**
 * PendingApprovals — global view of all submitted calibration records
 * awaiting review. Admins and supervisors can approve or reject directly
 * from this page without having to navigate to each instrument individually.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { calibrations as calApi } from '../utils/api'
import { ResultBadge, RecordStatusBadge } from '../components/Badges'
import { fmtDate, fmtPct, humanise } from '../utils/formatting'
import { getUser, canApprove } from '../utils/userContext'
import { ToastContainer, useToast } from '../components/Toast'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

export default function PendingApprovals() {
  const [records,   setRecords]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [actioning, setActioning] = useState({})   // recordId → 'approve'|'reject'
  const { toasts, showToast, dismissToast } = useToast()
  const currentUser = getUser()
  const userCanApprove = canApprove(currentUser)

  const fetchRecords = useCallback(() => {
    setLoading(true)
    setError(null)
    const site = currentUser?.siteName ?? null
    calApi.list({ record_status: 'submitted', limit: 200, site })
      .then(res => {
        setRecords(res?.results ?? res ?? [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  async function handleApprove(rec) {
    if (!currentUser) { showToast('No user selected — click your name in the header.', 'warning'); return }
    setActioning(a => ({ ...a, [rec.id]: 'approve' }))
    try {
      await calApi.approve(rec.id, currentUser.userName)
      showToast(`Approved calibration for ${rec.instrument?.tag_number ?? 'instrument'}`, 'success')
      setRecords(prev => prev.filter(r => r.id !== rec.id))
    } catch (e) {
      showToast(e.message ?? 'Approval failed', 'error')
    } finally {
      setActioning(a => { const n = { ...a }; delete n[rec.id]; return n })
    }
  }

  async function handleReject(rec) {
    if (!currentUser) { showToast('No user selected — click your name in the header.', 'warning'); return }
    setActioning(a => ({ ...a, [rec.id]: 'reject' }))
    try {
      await calApi.reject(rec.id, null)
      showToast(`Rejected calibration for ${rec.instrument?.tag_number ?? 'instrument'}`, 'info')
      setRecords(prev => prev.filter(r => r.id !== rec.id))
    } catch (e) {
      showToast(e.message ?? 'Rejection failed', 'error')
    } finally {
      setActioning(a => { const n = { ...a }; delete n[rec.id]; return n })
    }
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Pending Approvals</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Submitted calibration records awaiting supervisor or admin review
          </p>
        </div>
        <button
          onClick={fetchRecords}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
      </div>

      {/* Role warning if not approver */}
      {!userCanApprove && currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <strong>{currentUser.userName}</strong> — your role (<em>{currentUser.role}</em>) cannot approve records.
          Switch to Admin or Supervisor role to take action.
        </div>
      )}
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          No user signed in. Click your name in the header to select a user and role.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to load records: {error}
        </div>
      )}

      {/* Content */}
      {loading ? <Spinner /> : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className="text-slate-600 font-semibold mb-1">No pending records</p>
          <p className="text-sm text-slate-400">All submitted calibrations have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{records.length}</span> record{records.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tag','Description','Date','Type','Technician','As Found','Max Error','Adj.','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(rec => {
                  const busy = actioning[rec.id]
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/app/instruments/${rec.instrument_id}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {rec.instrument?.tag_number ?? rec.instrument_id?.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">
                        {rec.instrument?.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {fmtDate(rec.calibration_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {humanise(rec.calibration_type)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rec.technician_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={rec.as_found_result} />
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {rec.max_as_found_error_pct != null ? fmtPct(rec.max_as_found_error_pct) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={rec.adjustment_made ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                          {rec.adjustment_made ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RecordStatusBadge status={rec.record_status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {userCanApprove ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(rec)}
                              disabled={!!busy}
                              className="text-xs px-2.5 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(rec)}
                              disabled={!!busy}
                              className="text-xs px-2.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-40"
                            >
                              {busy === 'approve' ? '…' : 'Approve'}
                            </button>
                          </div>
                        ) : (
                          <Link
                            to={`/app/instruments/${rec.instrument_id}`}
                            className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                          >
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
        </div>
      )}
    </div>
  )
}
