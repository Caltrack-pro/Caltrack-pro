import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { instruments as instrApi } from '../utils/api'

const TEMPLATE_HEADERS = [
  'tag_number','description','area','unit','instrument_type','status','criticality',
  'calibration_interval_days','tolerance_type','tolerance_value','measurement_lrv',
  'measurement_urv','engineering_units','last_calibration_date','last_calibration_result',
  'num_test_points','manufacturer','model','serial_number','procedure_reference',
]
const TEMPLATE_EXAMPLE = [
  'PT-1001','Feed Pump Discharge Pressure','Pump Station','Unit 1','pressure','active','standard',
  '365','percent_span','0.5','0','1000','kPa','2024-06-15','pass',
  '5','Endress+Hauser','Cerabar M','SN-12345','CAL-PROC-001',
]

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'caltrack_import_TEMPLATE.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const STATUS_COLOUR = {
  created: 'bg-green-100 text-green-700',
  skipped: 'bg-amber-100 text-amber-700',
  error:   'bg-red-100 text-red-700',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOUR[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export default function ImportInstruments() {
  const [file,       setFile]       = useState(null)
  const [preview,    setPreview]    = useState(null)   // dry-run result
  const [result,     setResult]     = useState(null)   // live-run result
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const inputRef = useRef()

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  async function handlePreview() {
    if (!file) return
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const data = await instrApi.bulkImport(file, true)
      setPreview(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await instrApi.bulkImport(file, false)
      setResult(data)
      setPreview(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const data = result || preview

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/app/instruments" className="hover:text-slate-700">Instruments</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Import from CSV</span>
      </nav>

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Import Instruments</h1>
        <p className="text-slate-500 text-sm">
          Upload a CSV file to bulk-import instruments into your site.
          Use{' '}
          <button onClick={downloadTemplate} className="text-blue-600 hover:underline font-normal">
            the import template
          </button>{' '}
          for the correct column format.
        </p>
      </div>

      {/* ── File picker ── */}
      {!result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">1. Select CSV File</h2>

          <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}>
            <svg className="w-8 h-8 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {file ? (
              <span className="text-sm font-medium text-blue-700">{file.name}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-600">Click to select a CSV file</span>
                <span className="text-xs text-slate-400 mt-1">or drag and drop</span>
              </>
            )}
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>

          {file && !preview && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Validating…' : 'Preview & Validate'}
              </button>
              <button onClick={handleReset} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Preview results ── */}
      {preview && !result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">2. Review Preview</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="text-slate-600">Will create: <strong className="text-green-700">{preview.created}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-600">Will skip (duplicate): <strong className="text-amber-700">{preview.skipped}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="text-slate-600">Errors: <strong className="text-red-700">{preview.errors}</strong></span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Row','Tag','Status','Message'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.rows.map(row => (
                  <tr key={row.row} className={row.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{row.row}</td>
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{row.tag}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            {preview.created > 0 ? (
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-5 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Importing…' : `Confirm Import (${preview.created} instrument${preview.created !== 1 ? 's' : ''})`}
              </button>
            ) : (
              <p className="text-sm text-slate-500 py-1">No valid rows to import.</p>
            )}
            <button onClick={handleReset} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Import complete ── */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-5 ${result.errors > 0 ? 'bg-amber-50 border-b border-amber-100' : 'bg-green-50 border-b border-green-100'}`}>
            <h2 className="font-semibold text-slate-800 mb-2">Import Complete</h2>
            <div className="flex flex-wrap gap-5 text-sm">
              <span className="text-green-700">✓ Created: <strong>{result.created}</strong></span>
              {result.skipped > 0 && <span className="text-amber-700">◦ Skipped: <strong>{result.skipped}</strong></span>}
              {result.errors > 0  && <span className="text-red-700">✗ Errors: <strong>{result.errors}</strong></span>}
            </div>
          </div>

          {result.rows.some(r => r.status === 'error') && (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Row','Tag','Status','Message'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.rows.filter(r => r.status !== 'created').map(row => (
                    <tr key={row.row} className={row.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{row.row}</td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{row.tag}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <Link
              to="/app/instruments"
              className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Instruments
            </Link>
            <button onClick={handleReset} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              Import Another File
            </button>
          </div>
        </div>
      )}

      {/* ── Column reference ── */}
      {!data && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Supported Columns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs">
            {[
              ['tag_number','Required — unique instrument tag (e.g. PT-1023A)'],
              ['description','Instrument service description'],
              ['area','Plant area or location'],
              ['unit','Plant unit'],
              ['instrument_type','pressure / temperature / flow / level / analyser / ph / conductivity / switch / valve / other'],
              ['status','active / spare / out_of_service (default: active)'],
              ['criticality','safety_critical / process_critical / standard / non_critical'],
              ['calibration_interval_days','Number (default: 365 if blank)'],
              ['tolerance_type','percent_span / percent_reading / absolute'],
              ['tolerance_value','Numeric tolerance value'],
              ['measurement_lrv','Lower range value'],
              ['measurement_urv','Upper range value'],
              ['engineering_units','e.g. kPa, degC, m3/h'],
              ['last_calibration_date','YYYY-MM-DD or DD/MM/YYYY'],
              ['last_calibration_result','pass / fail / marginal / not_calibrated'],
              ['num_test_points','1–20 (default: 5)'],
              ['manufacturer','Instrument manufacturer'],
              ['model','Instrument model'],
              ['serial_number','Serial number'],
              ['procedure_reference','Calibration procedure reference'],
            ].map(([col, desc]) => (
              <div key={col} className="flex gap-2 py-1 border-b border-slate-50">
                <span className="font-mono text-slate-700 w-44 flex-shrink-0">{col}</span>
                <span className="text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
