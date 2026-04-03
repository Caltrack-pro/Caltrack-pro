import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { instruments as instrApi, calibrations as calApi } from '../utils/api'
import { CalStatusBadge, ResultBadge, RecordStatusBadge } from '../components/Badges'
import { fmtDate, fmtPct, fmtNum, humanise } from '../utils/formatting'
import TrendCharts from '../components/TrendCharts'

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide-out calibration detail panel
// ─────────────────────────────────────────────────────────────────────────────

function SlidePanel({ recordId, onClose }) {
  const [rec, setRec]     = useState(null)
  const [loading, setLd]  = useState(true)

  useEffect(() => {
    if (!recordId) return
    setLd(true)
    calApi.get(recordId)
      .then(r => { setRec(r); setLd(false) })
      .catch(() => setLd(false))
  }, [recordId])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Calibration Record</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <Spinner /> : !rec ? (
            <p className="text-center text-slate-400 py-12">Failed to load record.</p>
          ) : (
            <div className="px-6 py-5 space-y-6">

              {/* Summary row */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Date: </span><strong>{fmtDate(rec.calibration_date)}</strong></div>
                <div><span className="text-slate-500">Type: </span><strong>{humanise(rec.calibration_type)}</strong></div>
                <div><span className="text-slate-500">Technician: </span><strong>{rec.technician_name || '—'}</strong></div>
                <div><span className="text-slate-500">Work Order: </span><strong>{rec.work_order_reference || '—'}</strong></div>
              </div>

              {/* Results */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">As Found</p>
                  <ResultBadge result={rec.as_found_result} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">As Left</p>
                  <ResultBadge result={rec.as_left_result} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Max Error</p>
                  <span className="text-sm font-bold text-slate-700">{fmtPct(rec.max_as_found_error_pct)}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Adj. Made</p>
                  <span className={`text-sm font-bold ${rec.adjustment_made ? 'text-amber-600' : 'text-slate-500'}`}>
                    {rec.adjustment_made ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Reference standard */}
              {rec.reference_standard_description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reference Standard</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Description"  value={rec.reference_standard_description} />
                    <Field label="Serial No."   value={rec.reference_standard_serial} mono />
                    <Field label="Cert No."     value={rec.reference_standard_cert_number} mono />
                    <Field label="Cert Expiry"  value={fmtDate(rec.reference_standard_cert_expiry)} />
                  </div>
                </div>
              )}

              {/* Test points */}
              {rec.test_points?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Test Points ({rec.test_points.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[520px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {['Pt','Input','Expected','As Found','Error','%Span','AF Result','As Left','AL Result'].map(h => (
                            <th key={h} className="px-2 py-2 text-left font-semibold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rec.test_points.map(tp => (
                          <tr key={tp.point_number}>
                            <td className="px-2 py-2 font-mono text-slate-600">{tp.point_number}</td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.nominal_input)}</td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.expected_output)}</td>
                            <td className="px-2 py-2 font-mono font-semibold">{fmtNum(tp.as_found_output)}</td>
                            <td className="px-2 py-2 font-mono text-slate-600">{fmtNum(tp.as_found_error_abs)}</td>
                            <td className="px-2 py-2 font-mono text-slate-600">{fmtPct(tp.as_found_error_pct)}</td>
                            <td className="px-2 py-2"><ResultBadge result={tp.as_found_result} /></td>
                            <td className="px-2 py-2 font-mono">{fmtNum(tp.as_left_output) === '—' ? '—' : fmtNum(tp.as_left_output)}</td>
                            <td className="px-2 py-2"><ResultBadge result={tp.as_left_result} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {rec.technician_notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{rec.technician_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Calibration History', 'Trends', 'Documents', 'Technical Data']

// ── Tab 1: Overview ───────────────────────────────────────────────────────

function TabOverview({ instrument, history }) {
  const i = instrument
  const calCount = history?.total ?? 0

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">

      {/* Instrument details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Instrument Details</h3>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5">
          <Field label="Manufacturer"   value={i.manufacturer} />
          <Field label="Model"          value={i.model} />
          <Field label="Serial Number"  value={i.serial_number} mono />
          <Field label="Type"           value={humanise(i.instrument_type)} />
          <Field label="Output Type"    value={i.output_type} />
          <Field label="Engineering Units" value={i.engineering_units} />
          <Field label="Range (LRV)"    value={i.measurement_lrv != null ? `${i.measurement_lrv} ${i.engineering_units ?? ''}` : null} />
          <Field label="Range (URV)"    value={i.measurement_urv != null ? `${i.measurement_urv} ${i.engineering_units ?? ''}` : null} />
          <Field label="Tolerance"      value={i.tolerance_value != null
            ? `±${i.tolerance_value} ${humanise(i.tolerance_type ?? '')}` : null} />
          <Field label="Test Points"    value={i.num_test_points} />
          <Field label="Interval"       value={i.calibration_interval_days ? `${i.calibration_interval_days} days` : null} />
          <Field label="Procedure Ref"  value={i.procedure_reference} mono />
          <Field label="Criticality"    value={humanise(i.criticality)} />
          <Field label="Area"           value={i.area} />
          <Field label="Unit"           value={i.unit} />
          <Field label="Created By"     value={i.created_by} />
        </dl>
      </div>

      {/* Calibration status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Calibration Status</h3>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Last result — large badge */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">Last Result</span>
            <ResultBadge result={i.last_calibration_result} />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Last Calibration" value={fmtDate(i.last_calibration_date)} />
            <Field label="Next Due"         value={fmtDate(i.calibration_due_date)} />
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {i.alert_status === 'overdue' ? 'Days Overdue' : 'Days Until Due'}
              </dt>
              <dd className={`mt-0.5 text-sm font-bold ${
                i.alert_status === 'overdue'   ? 'text-red-600' :
                i.alert_status === 'due_soon'  ? 'text-amber-600' : 'text-green-600'
              }`}>
                {i.days_overdue > 0   ? `${i.days_overdue} days overdue` :
                 i.days_until_due != null ? `${i.days_until_due} days` : '—'}
              </dd>
            </div>
            <Field label="Calibration Count" value={calCount} />
          </dl>

        </div>
      </div>
    </div>
  )
}

// ── Tab 2: Calibration History ────────────────────────────────────────────

function TabHistory({ history, onView }) {
  if (!history || history.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-400 text-sm">No calibration records found for this instrument.</p>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date','Technician','As Found','As Left','Max Error %','Adj.','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.results.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{fmtDate(rec.calibration_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{rec.technician_name || '—'}</td>
                  <td className="px-4 py-3"><ResultBadge result={rec.as_found_result} /></td>
                  <td className="px-4 py-3"><ResultBadge result={rec.as_left_result} /></td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {fmtPct(rec.max_as_found_error_pct)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={rec.adjustment_made ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                      {rec.adjustment_made ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><RecordStatusBadge status={rec.record_status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onView(rec.id)}
                      className="text-xs px-2.5 py-1 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab 5: Technical Data ─────────────────────────────────────────────────

function TabTechnical({ instrument: i }) {
  const ALL_FIELDS = [
    ['id',                       i.id,                        true ],
    ['tag_number',               i.tag_number,                true ],
    ['description',              i.description,               false],
    ['area',                     i.area,                      false],
    ['unit',                     i.unit,                      false],
    ['instrument_type',          humanise(i.instrument_type), false],
    ['manufacturer',             i.manufacturer,              false],
    ['model',                    i.model,                     false],
    ['serial_number',            i.serial_number,             true ],
    ['measurement_lrv',          i.measurement_lrv,           true ],
    ['measurement_urv',          i.measurement_urv,           true ],
    ['engineering_units',        i.engineering_units,         false],
    ['output_type',              i.output_type,               false],
    ['calibration_interval_days',i.calibration_interval_days, false],
    ['tolerance_type',           humanise(i.tolerance_type),  false],
    ['tolerance_value',          i.tolerance_value,           false],
    ['num_test_points',          i.num_test_points,           false],
    ['criticality',              humanise(i.criticality),     false],
    ['status',                   humanise(i.status),          false],
    ['procedure_reference',      i.procedure_reference,       true ],
    ['last_calibration_date',    fmtDate(i.last_calibration_date), false],
    ['last_calibration_result',  humanise(i.last_calibration_result), false],
    ['calibration_due_date',     fmtDate(i.calibration_due_date), false],
    ['created_at',               i.created_at ? new Date(i.created_at).toLocaleString() : '—', false],
    ['updated_at',               i.updated_at ? new Date(i.updated_at).toLocaleString() : '—', false],
    ['created_by',               i.created_by, false],
  ]

  return (
    <div className="pt-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">All Fields</h3>
          <button
            disabled
            className="text-xs px-3 py-1.5 border border-slate-200 rounded text-slate-400 cursor-not-allowed"
            title="Edit requires supervisor or admin role"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 px-5 py-5">
          {ALL_FIELDS.map(([label, value, mono]) => (
            <Field key={label} label={label} value={value ?? '—'} mono={mono} />
          ))}
        </dl>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function InstrumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [instrument, setInstrument] = useState(null)
  const [history,    setHistory]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState(0)
  const [slideId,    setSlideId]    = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      instrApi.get(id),
      instrApi.calibrationHistory(id, { limit: 100 }),
    ])
      .then(([instr, hist]) => {
        setInstrument(instr)
        setHistory(hist)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <Spinner />
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-slate-600 font-medium mb-2">Failed to load instrument</p>
      <p className="text-slate-400 text-sm mb-4">{error}</p>
      <button onClick={() => navigate('/instruments')} className="text-sm text-blue-600 hover:underline">
        ← Back to instruments
      </button>
    </div>
  )
  if (!instrument) return null

  const i = instrument

  // Alert banner conditions
  const isOverdue = i.alert_status === 'overdue'
  const isFailed  = i.last_calibration_result === 'fail'

  return (
    <div className="space-y-0 max-w-6xl">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link to="/instruments" className="hover:text-slate-700">Instruments</Link>
        <span>/</span>
        <span className="text-slate-800 font-mono font-semibold">{i.tag_number}</span>
      </nav>

      {/* ── Alert banner ── */}
      {(isOverdue || isFailed) && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 border text-sm font-medium
          ${isFailed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {isOverdue
            ? `OVERDUE — ${i.days_overdue} day${i.days_overdue !== 1 ? 's' : ''} past calibration due date`
            : 'LAST CALIBRATION FAILED — instrument may not be fit for service'}
        </div>
      )}

      {/* ── Header card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-mono text-slate-900">{i.tag_number}</h1>
            <CalStatusBadge alertStatus={i.alert_status} instrumentStatus={i.status} />
          </div>
          <p className="text-slate-600 text-base">{i.description || '—'}</p>
          {(i.area || i.unit) && (
            <p className="text-sm text-slate-500 mt-0.5">
              {[i.area, i.unit].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to={`/instruments/${i.id}/edit`}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Edit
          </Link>
          <Link
            to={`/calibrations/new/${i.id}`}
            className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Calibration
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-slate-200 mt-4 bg-white rounded-t-xl -mb-px pt-1 px-2">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === idx
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              {tab}
              {tab === 'Calibration History' && history?.total > 0 && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">
                  {history.total}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 0 && <TabOverview instrument={i} history={history} />}
      {activeTab === 1 && <TabHistory  history={history} onView={setSlideId} />}
      {activeTab === 2 && <TrendCharts instrument={i} history={history?.results ?? []} />}
      {activeTab === 3 && (
        <div className="pt-6 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-8 text-center text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="font-medium text-slate-600 mb-1">Document Management — Coming Soon</p>
          <p className="text-sm">Attach datasheets, certificates, and procedures to this instrument.</p>
        </div>
      )}
      {activeTab === 4 && <TabTechnical instrument={i} />}

      {/* ── Slide-out panel ── */}
      {slideId && <SlidePanel recordId={slideId} onClose={() => setSlideId(null)} />}
    </div>
  )
}
