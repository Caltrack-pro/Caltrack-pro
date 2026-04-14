import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { instruments as instrApi, calibrations as calApi, dashboard as dashApi } from '../utils/api'
import { fmtDate, fmtPct, humanise, todayISO } from '../utils/formatting'
import { ResultBadge } from '../components/Badges'
import { getUser } from '../utils/userContext'

// ── Shared helpers ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function ErrorMsg({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-6 text-center text-sm text-red-700">
      <p className="font-semibold mb-1">Failed to load report</p>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-3 py-1.5 text-xs border border-red-300 rounded hover:bg-red-100 transition-colors">
          Try again
        </button>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="py-16 text-center text-slate-400">
      <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 17H5a2 2 0 00-2 2v1h18v-1a2 2 0 00-2-2h-4M9 17V9m6 8V9M9 9H5.5A1.5 1.5 0 014 7.5v0A1.5 1.5 0 015.5 6H9m6 3h3.5A1.5 1.5 0 0020 7.5v0A1.5 1.5 0 0018.5 6H15m0 3V6M9 6V3" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
    </svg>
  )
}

function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    if (v == null) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function dueDateCls(days) {
  if (days == null) return 'text-slate-600'
  if (days < 0)  return 'text-red-600 font-semibold'
  if (days <= 7) return 'text-amber-600 font-semibold'
  return 'text-slate-600'
}

const thCls = 'text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap'
const tdCls = 'px-4 py-3'

// ── REPORT 1: Overdue ─────────────────────────────────────────────────────────

function OverdueReport() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [rev,     setRev]     = useState(0)
  const [areaFilter, setAreaFilter] = useState('')

  useEffect(() => {
    setLoading(true); setError(null)
    const site = getUser()?.siteName ?? undefined
    instrApi.list({ calibration_status: 'overdue', limit: 500, site })
      .then(res => {
        const sorted = [...(res.results ?? [])].sort((a, b) => (b.days_overdue ?? 0) - (a.days_overdue ?? 0))
        setData(sorted); setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [rev])

  const uniqueAreas = useMemo(() => [...new Set(data.map(i => i.area).filter(Boolean))].sort(), [data])
  const displayed = areaFilter ? data.filter(i => i.area === areaFilter) : data

  function exportCSV() {
    const headers = ['Tag Number','Description','Area','Type','Due Date','Days Overdue','Last Result']
    const rows = displayed.map(i => [
      i.tag_number, i.description, i.area, humanise(i.instrument_type),
      fmtDate(i.calibration_due_date), i.days_overdue ?? '',
      i.last_calibration_result ?? '',
    ])
    downloadCSV('overdue-instruments.csv', headers, rows)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-red-600">{displayed.length}</span> of {data.length} overdue instrument{data.length !== 1 ? 's' : ''} shown
        </p>
        <div className="flex items-center gap-2">
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Areas</option>
            {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={exportCSV} disabled={!displayed.length}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => setRev(r => r + 1)} /> :
        data.length === 0 ? <EmptyState message="No overdue instruments — calibrations are up to date." /> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tag','Description','Area','Type','Due Date','Days Overdue','Last Result','Actions'].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className={tdCls}><span className="font-mono font-bold text-slate-800">{inst.tag_number}</span></td>
                    <td className={`${tdCls} text-slate-600 max-w-[180px] truncate`}>{inst.description || '—'}</td>
                    <td className={`${tdCls} text-slate-600`}>{inst.area || '—'}</td>
                    <td className={`${tdCls} text-slate-600`}>{humanise(inst.instrument_type)}</td>
                    <td className={`${tdCls} text-red-600 font-semibold whitespace-nowrap`}>{fmtDate(inst.calibration_due_date)}</td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                        {inst.days_overdue ?? '?'} days
                      </span>
                    </td>
                    <td className={tdCls}><ResultBadge result={inst.last_calibration_result} /></td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <Link to={`/app/calibrations/new/${inst.id}`}
                        className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Calibrate
                      </Link>
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

// ── REPORT 2: Upcoming ────────────────────────────────────────────────────────

function UpcomingReport() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [rev,     setRev]     = useState(0)
  const [areaFilter, setAreaFilter] = useState('')

  useEffect(() => {
    setLoading(true); setError(null)
    dashApi.upcoming()
      .then(res => { setData(res?.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [rev])

  const uniqueAreas = useMemo(() => [...new Set(data.map(i => i.area).filter(Boolean))].sort(), [data])
  const displayed = areaFilter ? data.filter(i => i.area === areaFilter) : data

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{displayed.length}</span> of {data.length} calibration{data.length !== 1 ? 's' : ''} due in the next 30 days
        </p>
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Areas</option>
          {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => setRev(r => r + 1)} /> :
        data.length === 0 ? <EmptyState message="No calibrations due in the next 30 days." /> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tag','Description','Area','Due Date','Days Until Due','Interval (days)','Actions'].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className={tdCls}><span className="font-mono font-bold text-slate-800">{inst.tag_number}</span></td>
                    <td className={`${tdCls} text-slate-600 max-w-[180px] truncate`}>{inst.description || '—'}</td>
                    <td className={`${tdCls} text-slate-600`}>{inst.area || '—'}</td>
                    <td className={`${tdCls} whitespace-nowrap ${dueDateCls(inst.days_until_due)}`}>
                      {fmtDate(inst.calibration_due_date)}
                    </td>
                    <td className={tdCls}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        (inst.days_until_due ?? 0) <= 0  ? 'bg-red-100 text-red-700' :
                        inst.days_until_due <= 7 ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {(inst.days_until_due ?? 0) <= 0
                          ? `${Math.abs(inst.days_until_due ?? 0)}d overdue`
                          : `${inst.days_until_due}d`}
                      </span>
                    </td>
                    <td className={`${tdCls} text-slate-600`}>{inst.calibration_interval ?? '—'}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <Link to={`/app/calibrations/new/${inst.id}`}
                        className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Calibrate
                      </Link>
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

// ── REPORT 3: Failed calibrations ────────────────────────────────────────────

function addDays(iso, n) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function FailedReport() {
  const today = todayISO()
  const [dateFrom, setDateFrom] = useState(addDays(today, -30))
  const [dateTo,   setDateTo]   = useState(today)
  const [data,     setData]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [rev,      setRev]      = useState(0)
  const [areaFilter,   setAreaFilter]   = useState('')
  const [typeFilter,   setTypeFilter]   = useState('')
  const [techFilter,   setTechFilter]   = useState('')

  useEffect(() => {
    setLoading(true); setError(null)
    const site = getUser()?.siteName ?? undefined
    calApi.list({ result: 'fail', date_from: dateFrom, date_to: dateTo, limit: 500, site })
      .then(res => { setData(res?.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [rev])

  const displayed = useMemo(() => {
    return data.filter(r => {
      if (areaFilter && r.instrument?.area !== areaFilter) return false
      if (typeFilter && r.instrument?.instrument_type !== typeFilter) return false
      if (techFilter && !(r.technician_name ?? '').toLowerCase().includes(techFilter.toLowerCase())) return false
      return true
    })
  }, [data, areaFilter, typeFilter, techFilter])

  const uniqueAreas = useMemo(() => [...new Set(data.map(r => r.instrument?.area).filter(Boolean))].sort(), [data])
  const uniqueTypes = useMemo(() => [...new Set(data.map(r => r.instrument?.instrument_type).filter(Boolean))].sort(), [data])

  function exportCSV() {
    const headers = ['Date','Tag Number','Area','Max Error %','Technician','Adjustment Made','Notes']
    const rows = displayed.map(r => [
      fmtDate(r.calibration_date),
      r.instrument?.tag_number ?? r.instrument_id,
      r.instrument?.area ?? '',
      r.max_as_found_error_pct != null ? fmtPct(r.max_as_found_error_pct, 2) : '',
      r.technician_name ?? '',
      r.adjustment_made ? 'Yes' : 'No',
      r.notes ?? '',
    ])
    downloadCSV('failed-calibrations.csv', headers, rows)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input type="date" value={dateFrom} max={dateTo}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input type="date" value={dateTo} min={dateFrom} max={today}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => setRev(r => r + 1)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Apply
        </button>
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Areas</option>
          {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
        </select>
        <input type="text" value={techFilter} onChange={e => setTechFilter(e.target.value)}
          placeholder="Technician…"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
        <div className="flex-1" />
        <button onClick={exportCSV} disabled={!displayed.length}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          <ExportIcon /> Export CSV
        </button>
      </div>

      <p className="text-sm text-slate-600">
        <span className="font-semibold text-red-600">{displayed.length}</span> of {data.length} failed calibration{data.length !== 1 ? 's' : ''} shown
      </p>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => setRev(r => r + 1)} /> :
        data.length === 0 ? <EmptyState message="No failed calibrations in the selected date range." /> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Date','Tag','Area','Max Error %','Technician','Adjustment','Actions'].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className={`${tdCls} whitespace-nowrap text-slate-700`}>{fmtDate(rec.calibration_date)}</td>
                    <td className={tdCls}>
                      <Link to={`/app/instruments/${rec.instrument_id}`}
                        className="font-mono font-bold text-blue-600 hover:underline">
                        {rec.instrument?.tag_number ?? rec.instrument_id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td className={`${tdCls} text-slate-600`}>{rec.instrument?.area ?? '—'}</td>
                    <td className={`${tdCls} font-mono text-red-600 font-semibold`}>
                      {rec.max_as_found_error_pct != null ? fmtPct(rec.max_as_found_error_pct, 2) : '—'}
                    </td>
                    <td className={`${tdCls} text-slate-600`}>{rec.technician_name || '—'}</td>
                    <td className={`${tdCls} text-slate-600`}>{rec.adjustment_made ? humanise(rec.adjustment_type) : 'No'}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <Link to={`/app/instruments/${rec.instrument_id}`}
                        className="text-xs px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors">
                        View
                      </Link>
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

// ── REPORT 4: History by tag ──────────────────────────────────────────────────

function HistoryReport() {
  const [search,      setSearch]      = useState('')
  const [instrument,  setInstrument]  = useState(null)
  const [records,     setRecords]     = useState([])
  const [expanded,    setExpanded]    = useState(new Set())
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSug,     setShowSug]     = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const site = getUser()?.siteName ?? undefined
      instrApi.list({ limit: 10, site })
        .then(res => {
          const q = search.toLowerCase()
          setSuggestions((res.results ?? []).filter(i => i.tag_number.toLowerCase().includes(q)))
        })
        .catch(() => {})
    }, 250)
  }, [search])

  function selectInstrument(inst) {
    setSearch(inst.tag_number)
    setInstrument(inst)
    setSuggestions([])
    setShowSug(false)
    setLoading(true)
    setError(null)
    instrApi.calibrationHistory(inst.id, { limit: 100 })
      .then(res => { setRecords(res.results ?? res ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSug(true) }}
            onFocus={() => setShowSug(true)}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            placeholder="Search tag number…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSug && suggestions.length > 0 && (
            <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map(inst => (
                <li key={inst.id}>
                  <button
                    onMouseDown={() => selectInstrument(inst)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-mono font-bold text-slate-800">{inst.tag_number}</span>
                    {inst.description && (
                      <span className="text-slate-500 ml-2 text-xs">{inst.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {instrument && (
          <>
            <span className="text-sm text-slate-500">
              {records.length} record{records.length !== 1 ? 's' : ''} for{' '}
              <span className="font-mono font-bold text-slate-700">{instrument.tag_number}</span>
            </span>
            <div className="flex-1" />
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
              </svg>
              Print / PDF
            </button>
          </>
        )}
      </div>

      {!instrument && !loading && (
        <EmptyState message="Search for an instrument tag number above to view its calibration history." />
      )}

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={() => instrument && selectInstrument(instrument)} /> :
        instrument && records.length === 0 ? (
          <EmptyState message="No calibration records found for this instrument." />
        ) : records.length > 0 && (
          <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-8 px-3 py-3" />
                  {['Date','Type','Technician','As-Found','As-Left','Adjustment','Status'].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(rec => {
                  const isOpen = expanded.has(rec.id)
                  const pts = rec.test_points ?? []
                  return (
                    <>
                      <tr key={rec.id}
                        className={`hover:bg-slate-50 ${pts.length ? 'cursor-pointer' : ''}`}
                        onClick={() => pts.length && toggleExpand(rec.id)}>
                        <td className="px-3 py-3 text-slate-400">
                          {pts.length > 0 && (
                            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          )}
                        </td>
                        <td className={`${tdCls} whitespace-nowrap text-slate-700`}>{fmtDate(rec.calibration_date)}</td>
                        <td className={`${tdCls} text-slate-600`}>{humanise(rec.calibration_type)}</td>
                        <td className={`${tdCls} text-slate-600`}>{rec.technician_name || '—'}</td>
                        <td className={tdCls}><ResultBadge result={rec.as_found_result} /></td>
                        <td className={tdCls}><ResultBadge result={rec.as_left_result} /></td>
                        <td className={`${tdCls} text-slate-600`}>{rec.adjustment_made ? humanise(rec.adjustment_type) : 'No'}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                            rec.record_status === 'approved'  ? 'bg-green-100 text-green-700' :
                            rec.record_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            rec.record_status === 'rejected'  ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{rec.record_status}</span>
                        </td>
                      </tr>
                      {isOpen && pts.length > 0 && (
                        <tr key={`${rec.id}-pts`} className="bg-slate-50/70">
                          <td />
                          <td colSpan={7} className="px-4 pb-4 pt-2">
                            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-white border-b border-slate-200">
                                  {['#','Expected','As-Found','As-Left','Error %','Result'].map(h => (
                                    <th key={h} className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {pts.map(pt => (
                                  <tr key={pt.id ?? pt.point_number} className="bg-white">
                                    <td className="px-3 py-1.5 font-mono text-slate-500">{pt.point_number}</td>
                                    <td className="px-3 py-1.5 font-mono">{pt.expected_output}</td>
                                    <td className="px-3 py-1.5 font-mono">{pt.as_found_actual_output ?? '—'}</td>
                                    <td className="px-3 py-1.5 font-mono">{pt.as_left_actual_output ?? '—'}</td>
                                    <td className="px-3 py-1.5 font-mono">
                                      {pt.as_found_error_pct != null ? fmtPct(pt.as_found_error_pct, 2) : '—'}
                                    </td>
                                    <td className={`px-3 py-1.5 font-bold uppercase ${
                                      pt.as_found_result === 'pass'     ? 'text-green-600' :
                                      pt.as_found_result === 'fail'     ? 'text-red-600' :
                                      pt.as_found_result === 'marginal' ? 'text-amber-600' : 'text-slate-400'
                                    }`}>{pt.as_found_result ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

function addDaysForExport(iso, n) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const TABS = [
  { id: 'overdue',  label: '🔴 Overdue Report' },
  { id: 'upcoming', label: '📅 Upcoming Report' },
  { id: 'failed',   label: '❌ Failed Report' },
  { id: 'history',  label: '📋 History by Tag' },
]

export default function Reports() {
  const [tab, setTab] = useState('overdue')
  const [exportLoading, setExportLoading] = useState(false)

  function exportAllOverdue() {
    setExportLoading(true)
    const site = getUser()?.siteName ?? undefined
    instrApi.list({ calibration_status: 'overdue', limit: 500, site })
      .then(res => {
        const data = res.results ?? res ?? []
        const headers = ['Tag Number', 'Description', 'Area', 'Type', 'Due Date', 'Days Overdue', 'Last Result']
        const rows = data.map(i => [
          i.tag_number,
          i.description || '',
          i.area || '',
          humanise(i.instrument_type),
          fmtDate(i.calibration_due_date),
          i.days_overdue ?? '',
          i.last_calibration_result ?? '',
        ])
        downloadCSV('overdue-instruments.csv', headers, rows)
        setExportLoading(false)
      })
      .catch(err => {
        console.error('Export failed:', err)
        setExportLoading(false)
      })
  }

  function exportAllFailed() {
    setExportLoading(true)
    const today = todayISO()
    const dateFrom = addDaysForExport(today, -90)
    const site = getUser()?.siteName ?? undefined
    calApi.list({ result: 'fail', date_from: dateFrom, date_to: today, limit: 500, site })
      .then(res => {
        const data = res.results ?? res ?? []
        const headers = ['Date', 'Tag Number', 'Area', 'Max Error %', 'Technician', 'Adjustment Made', 'Notes']
        const rows = data.map(r => [
          fmtDate(r.calibration_date),
          r.instrument?.tag_number ?? r.instrument_id,
          r.instrument?.area ?? '',
          r.max_as_found_error_pct != null ? fmtPct(r.max_as_found_error_pct, 2) : '',
          r.technician_name ?? '',
          r.adjustment_made ? 'Yes' : 'No',
          r.technician_notes ?? '',
        ])
        downloadCSV('failed-calibrations.csv', headers, rows)
        setExportLoading(false)
      })
      .catch(err => {
        console.error('Export failed:', err)
        setExportLoading(false)
      })
  }

  function exportComplianceSummary() {
    setExportLoading(true)
    dashApi.complianceByArea()
      .then(res => {
        const data = res.results ?? res ?? []
        const headers = ['Area', 'Total Instruments', 'Compliant', 'Overdue', 'Compliance %']
        const rows = data.map(area => [
          area.area || 'Unassigned',
          area.total ?? 0,
          area.compliant ?? 0,
          area.overdue ?? 0,
          area.compliance_percentage != null ? fmtPct(area.compliance_percentage, 1) : 'N/A',
        ])
        downloadCSV('compliance-summary.csv', headers, rows)
        setExportLoading(false)
      })
      .catch(err => {
        console.error('Export failed:', err)
        setExportLoading(false)
      })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📄 Reports & Exports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate compliance reports and export calibration data.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold text-slate-700">Quick Export:</span>
        <button
          onClick={exportAllOverdue}
          disabled={exportLoading}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⬇ Overdue Instruments CSV
        </button>
        <button
          onClick={exportAllFailed}
          disabled={exportLoading}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⬇ Failed Calibrations CSV
        </button>
        <button
          onClick={exportComplianceSummary}
          disabled={exportLoading}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⬇ Compliance Summary CSV
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'overdue'  && <OverdueReport />}
        {tab === 'upcoming' && <UpcomingReport />}
        {tab === 'failed'   && <FailedReport />}
        {tab === 'history'  && <HistoryReport />}
      </div>
    </div>
  )
}
