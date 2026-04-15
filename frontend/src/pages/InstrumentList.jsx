import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { instruments as instrApi } from '../utils/api'
import { CalStatusBadge, ResultBadge, CriticalityBadge } from '../components/Badges'
import { fmtDate, humanise } from '../utils/formatting'
import { getUser, canEdit, canCalibrate } from '../utils/userContext'

const INSTRUMENT_TYPES = ['pressure','temperature','flow','level','analyser','switch','valve','other']
const CAL_STATUSES     = ['overdue','due_soon','current','not_calibrated']
const LAST_RESULTS     = ['pass','fail','marginal']
const PAGE_SIZE        = 50

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function EmptyState({ filtered }) {
  return (
    <tr>
      <td colSpan={10} className="px-6 py-16 text-center">
        {filtered ? (
          <div className="text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            No instruments match your filters.
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No instruments yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              Add your first instruments to start tracking calibrations. Import from a CSV file or add them one by one.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/app/import" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                📥 Import CSV
              </Link>
              <Link to="/app/instruments/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
                ✏️ Add Manually
              </Link>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}

// Sort comparator
function applySort(items, key, dir) {
  if (!key) return items
  return [...items].sort((a, b) => {
    let av = a[key], bv = b[key]
    if (av == null) av = ''
    if (bv == null) bv = ''
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
    return dir === 'asc' ? cmp : -cmp
  })
}

// Sort indicator icon
function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-1 opacity-30">↕</span>
  return <span className="ml-1 text-blue-600">{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function InstrumentList() {
  const navigate = useNavigate()
  const currentUser = getUser()
  const userCanEdit      = canEdit(currentUser)
  const userCanCalibrate = canCalibrate(currentUser)

  // ── Sort state ─────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // ── Server-side filter state ──────────────────────────────────────────────
  const [serverFilters, setServerFilters] = useState({
    area:               '',
    type:               '',
    calibration_status: '',
  })

  // ── Client-side filter state ──────────────────────────────────────────────
  const [search,     setSearch]     = useState('')
  const [lastResult, setLastResult] = useState('')

  // ── Checkbox selection state ───────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set())

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(0)

  // ── Data ──────────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [response, setResponse] = useState({ total: 0, results: [] })

  // Reset to page 0 whenever server filters change
  useEffect(() => { setPage(0) }, [serverFilters])

  // Re-fetch whenever the signed-in user (and therefore site) changes
  const [userTick, setUserTick] = useState(0)
  useEffect(() => {
    function onUserChange() { setUserTick(t => t + 1); setPage(0) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const site = getUser()?.siteName ?? undefined
    instrApi.list({
      ...Object.fromEntries(Object.entries(serverFilters).filter(([, v]) => v !== '')),
      site,
      skip:  page * PAGE_SIZE,
      limit: PAGE_SIZE,
    })
      .then((res) => { if (!cancelled) { setResponse(res); setSelected(new Set()); setLoading(false) } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [serverFilters, page, userTick])

  // ── Derive unique areas for dropdown ──────────────────────────────────────
  // We always show all areas even when only one page is loaded; this is a known
  // limitation that will disappear once we have a dedicated /areas endpoint.
  const uniqueAreas = useMemo(() => {
    const set = new Set(response.results.map(i => i.area).filter(Boolean))
    return [...set].sort()
  }, [response.results])

  // ── Client-side filtering + sorting ──────────────────────────────────────
  const displayed = useMemo(() => {
    const q = search.toLowerCase().trim()
    const filtered = response.results.filter((inst) => {
      if (q && !inst.tag_number.toLowerCase().includes(q) &&
               !(inst.description ?? '').toLowerCase().includes(q)) return false
      if (lastResult && inst.last_calibration_result !== lastResult) return false
      return true
    })
    return applySort(filtered, sortKey, sortDir)
  }, [response.results, search, lastResult, sortKey, sortDir])

  const totalPages = Math.ceil(response.total / PAGE_SIZE)

  function setServerFilter(key, val) {
    setServerFilters(f => ({ ...f, [key]: val }))
  }

  // ── Checkbox selection logic ──────────────────────────────────────────────
  const allSelected = displayed.length > 0 && displayed.every(i => selected.has(i.id))
  const someSelected = displayed.some(i => selected.has(i.id)) && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(displayed.map(i => i.id)))
    }
  }

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── CSV export for selected ───────────────────────────────────────────────
  function exportSelected() {
    const sel = displayed.filter(i => selected.has(i.id))
    const CRIT_LABELS = { safety_critical: 'SIS / Trip', process_critical: 'Process Critical', standard: 'Standard', non_critical: 'Non-Critical' }
    const headers = ['Tag Number','Criticality','Description','Area','Type','Due Date','Status','Last Result']
    const rows = sel.map(i => [
      i.tag_number,
      CRIT_LABELS[i.criticality] ?? (i.criticality ?? ''),
      i.description ?? '',
      i.area ?? '',
      humanise(i.instrument_type),
      i.calibration_due_date ?? '',
      i.alert_status ?? '',
      i.last_calibration_result ?? '',
    ])
    const escape = v => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s }
    const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'selected-instruments.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tag or description…"
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
          />
        </div>

        {/* Area */}
        <select
          value={serverFilters.area}
          onChange={e => setServerFilter('area', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Areas</option>
          {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Type */}
        <select
          value={serverFilters.type}
          onChange={e => setServerFilter('type', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {INSTRUMENT_TYPES.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
        </select>

        {/* Cal status */}
        <select
          value={serverFilters.calibration_status}
          onChange={e => setServerFilter('calibration_status', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Cal. Status — All</option>
          {CAL_STATUSES.map(s => <option key={s} value={s}>{humanise(s)}</option>)}
        </select>

        {/* Last result (client-side) */}
        <select
          value={lastResult}
          onChange={e => setLastResult(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Last Result — All</option>
          {LAST_RESULTS.map(r => <option key={r} value={r}>{humanise(r)}</option>)}
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        <p className="text-sm text-slate-500 whitespace-nowrap">
          Showing <span className="font-semibold text-slate-700">{displayed.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{response.total}</span> instruments
        </p>

        {/* Add / Import buttons */}
        {userCanEdit && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/app/import"
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import CSV
            </Link>
            <Link
              to="/app/instruments/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Instrument
            </Link>
          </div>
        )}
      </div>

      {/* ── Bulk action bar ──────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm">
          <span className="font-semibold text-blue-700">{selected.size} instrument{selected.size !== 1 ? 's' : ''} selected</span>
          <div className="flex-1" />
          <button
            onClick={exportSelected}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/></svg>
            Export CSV
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-xs font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to load instruments: {error}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected }}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />
                  </th>
                  {[
                    { label: 'Tag Number',   key: 'tag_number'              },
                    { label: 'Criticality',  key: 'criticality'             },
                    { label: 'Description',  key: 'description'             },
                    { label: 'Area',         key: 'area'                    },
                    { label: 'Type',         key: 'instrument_type'         },
                    { label: 'Due Date',     key: 'calibration_due_date'    },
                    { label: 'Status',       key: 'alert_status'            },
                    { label: 'Last Result',  key: 'last_calibration_result' },
                    { label: 'Actions',      key: null                      },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={key ? () => handleSort(key) : undefined}
                      className={`text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap
                        ${key ? 'cursor-pointer select-none hover:text-slate-700 hover:bg-slate-100 transition-colors' : ''}`}
                    >
                      {label}
                      {key && <SortIcon active={sortKey === key} dir={sortDir} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.length === 0
                  ? <EmptyState filtered={search !== '' || lastResult !== '' || Object.values(serverFilters).some(Boolean)} />
                  : displayed.map(inst => (
                    <tr
                      key={inst.id}
                      onClick={() => navigate(`/app/instruments/${inst.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 w-10" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(inst.id)}
                          onChange={() => toggleOne(inst.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Tag number */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-sm">{inst.tag_number}</span>
                      </td>

                      {/* Criticality */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <CriticalityBadge criticality={inst.criticality} />
                      </td>

                      {/* Description */}
                      <td className="px-3 py-3 max-w-[160px]">
                        <span className="text-slate-600 truncate block">{inst.description || '—'}</span>
                      </td>

                      {/* Area */}
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {inst.area || '—'}
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {humanise(inst.instrument_type)}
                      </td>

                      {/* Due Date */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {inst.calibration_due_date ? (
                          <span className={inst.alert_status === 'overdue' ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                            {fmtDate(inst.calibration_due_date)}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>

                      {/* Status badge */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <CalStatusBadge alertStatus={inst.alert_status} instrumentStatus={inst.status} />
                      </td>

                      {/* Last result */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <ResultBadge result={inst.last_calibration_result} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/app/instruments/${inst.id}`}
                            className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            View
                          </Link>
                          {userCanCalibrate && (
                            <Link
                              to={`/app/calibrations/new/${inst.id}`}
                              className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Calibrate
                            </Link>
                          )}
                          {userCanEdit && (
                            <Link
                              to={`/app/instruments/${inst.id}/edit`}
                              className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
