/**
 * ImportCalibratorCSV — Upload and import calibrator CSV files (Beamex / Fluke)
 *
 * Flow:
 *   1. Upload  — drag & drop or file picker (CSV only)
 *   2. Review  — show parsed data, warnings, allow manual corrections
 *   3. Confirm — submit to API as a new calibration record
 *
 * Can be reached:
 *   /app/calibrations/import-csv                  — standalone (user selects instrument)
 *   /app/calibrations/import-csv?instrumentId=xxx — pre-fills instrument from URL
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { parseCalibratorCSV } from '../utils/calibratorCsvParser'
import { instruments as instrApi, calibrations as calApi } from '../utils/api'
import { fmtDate, todayISO } from '../utils/formatting'
import { generateTestPoints } from '../utils/calEngine'
import { ToastContainer, useToast } from '../components/Toast'

// ── Helpers ─────────────────────────────────────────────────────────────────

const RESULT_COLOURS = {
  pass:     'text-green-600 font-semibold',
  marginal: 'text-amber-600 font-semibold',
  fail:     'text-red-600 font-semibold',
}

function ResultPill({ result }) {
  if (!result) return <span className="text-slate-400">—</span>
  const cls = RESULT_COLOURS[result] ?? 'text-slate-600'
  const labels = { pass: '✓ PASS', marginal: '~ MARGINAL', fail: '✗ FAIL' }
  return <span className={`text-xs ${cls}`}>{labels[result] ?? result.toUpperCase()}</span>
}

function OverallBanner({ result }) {
  if (!result) return null
  const cfg = {
    pass:     { bg: 'bg-green-50 border-green-300 text-green-800', label: '✓ OVERALL PASS' },
    marginal: { bg: 'bg-amber-50 border-amber-300 text-amber-800', label: '~ OVERALL MARGINAL' },
    fail:     { bg: 'bg-red-50  border-red-300  text-red-800',     label: '✗ OVERALL FAIL'     },
  }[result]
  if (!cfg) return null
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${cfg.bg}`}>
      {cfg.label}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 sm:px-6 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
    </div>
  )
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white text-slate-700'
  }`

const FORMAT_LABELS = { beamex: 'Beamex', fluke: 'Fluke', generic: 'Generic / Unknown' }

// ── Step 1: Upload ───────────────────────────────────────────────────────────

function UploadStep({ onParsed }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState('')
  const inputRef = useRef()

  function processFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a .csv file exported from your calibrator.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = parseCalibratorCSV(e.target.result)
        onParsed(result, file.name)
      } catch (err) {
        setError(`Could not parse file: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'}`}
      >
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <polyline points="9 15 12 18 15 15"/>
          </svg>
        </div>
        <p className="text-base font-semibold text-slate-700 mb-1">
          Drop your calibrator CSV here
        </p>
        <p className="text-sm text-slate-500 mb-4">or click to browse</p>
        <p className="text-xs text-slate-400">
          Supports Beamex MC6 / MC4 / MC2 &nbsp;·&nbsp; Fluke 754 / 729 / 726
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => processFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Beamex MC6 / MC4 / MC2', body: 'Export from the Results Manager or MC6 desktop software. Choose CSV or text export.' },
          { label: 'Fluke 754 / 729 / 726',  body: 'Use Fluke DPCTrack2 or Results Manager to export calibration records as CSV.' },
        ].map(({ label, body }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Review & Map ─────────────────────────────────────────────────────

function ReviewStep({ parsed, fileName, instrumentId: initialInstrumentId, onBack, onConfirm }) {
  const [instruments, setInstruments]  = useState([])
  const [instrLoading, setInstrLoading] = useState(true)
  const [selectedInstr, setSelected]   = useState(null)

  // Editable fields (pre-filled from CSV, user can override)
  const [calDate,     setCalDate]     = useState(parsed.date     || todayISO())
  const [technician,  setTechnician]  = useState(parsed.technician  || '')
  const [refDesc,     setRefDesc]     = useState(parsed.referenceStandard || '')
  const [refSerial,   setRefSerial]   = useState(parsed.referenceStandardSerial || '')
  const [calType,     setCalType]     = useState('routine')
  const [notes,       setNotes]       = useState('')
  const [errors,      setErrors]      = useState({})

  useEffect(() => {
    instrApi.list({ limit: 500 })
      .then(res => {
        const list = res.results ?? res
        setInstruments(list)
        // auto-select if instrumentId param provided, or if tag matched
        if (initialInstrumentId) {
          const found = list.find(i => i.id === initialInstrumentId)
          if (found) setSelected(found)
        } else if (parsed.tag) {
          const found = list.find(i =>
            i.tag_number?.toLowerCase() === parsed.tag.toLowerCase()
          )
          if (found) setSelected(found)
        }
        setInstrLoading(false)
      })
      .catch(() => setInstrLoading(false))
  }, [initialInstrumentId, parsed.tag])

  function validate() {
    const errs = {}
    if (!selectedInstr)   errs.instrument = 'Please select an instrument'
    if (!calDate)         errs.calDate    = 'Date is required'
    if (!technician.trim()) errs.technician = 'Technician name is required'
    return errs
  }

  function handleConfirm() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onConfirm({
      instrument: selectedInstr,
      calDate,
      technician: technician.trim(),
      refDesc,
      refSerial,
      calType,
      notes,
      parsed,
    })
  }

  // Build test points table columns based on what the instrument expects
  const instrTestPoints = selectedInstr
    ? generateTestPoints(selectedInstr)
    : []

  const parsedPts = parsed.testPoints || []

  return (
    <div className="space-y-5">

      {/* Parser info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-0.5">
              Detected format: <span className="font-bold">{FORMAT_LABELS[parsed.format] ?? parsed.format}</span>
              {' · '}<span className="font-mono text-xs">{fileName}</span>
            </p>
            <p className="text-xs text-blue-600">
              {parsedPts.length} test point{parsedPts.length !== 1 ? 's' : ''} found
              {parsed.tag   ? ` · Tag: ${parsed.tag}`         : ''}
              {parsed.date  ? ` · Date: ${parsed.date}`       : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Parse warnings */}
      {parsed.errors?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Parser Warnings</p>
          {parsed.errors.map((e, i) => (
            <p key={i} className="text-sm text-amber-700">⚠ {e}</p>
          ))}
        </div>
      )}

      {/* Instrument selection */}
      <SectionCard title="Instrument">
        <div className="space-y-3">
          <Field label="Select Instrument" required>
            {instrLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Loading instruments…
              </div>
            ) : (
              <select
                value={selectedInstr?.id ?? ''}
                onChange={e => setSelected(instruments.find(i => i.id === e.target.value) || null)}
                className={inputCls(errors.instrument)}
              >
                <option value="">— Select instrument —</option>
                {instruments.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.tag_number} — {i.description || 'No description'}
                  </option>
                ))}
              </select>
            )}
            {errors.instrument && <p className="text-xs text-red-600 mt-1">{errors.instrument}</p>}
          </Field>

          {selectedInstr && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-lg p-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tag</p>
                <p className="font-mono font-bold text-slate-800">{selectedInstr.tag_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Area</p>
                <p className="text-slate-700">{selectedInstr.area || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tolerance</p>
                <p className="text-slate-700">{selectedInstr.tolerance_value}% {selectedInstr.tolerance_type?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Range</p>
                <p className="text-slate-700">
                  {selectedInstr.measurement_lrv} – {selectedInstr.measurement_urv} {selectedInstr.engineering_units}
                </p>
              </div>
            </div>
          )}

          {parsed.tag && selectedInstr && parsed.tag.toLowerCase() !== selectedInstr.tag_number?.toLowerCase() && (
            <p className="text-xs text-amber-600">
              ⚠ CSV tag "{parsed.tag}" doesn't match selected instrument "{selectedInstr.tag_number}" — verify this is the correct instrument.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Calibration details */}
      <SectionCard title="Calibration Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Calibration Date" required>
            <input
              type="date"
              value={calDate}
              onChange={e => setCalDate(e.target.value)}
              className={inputCls(errors.calDate)}
            />
            {errors.calDate && <p className="text-xs text-red-600 mt-1">{errors.calDate}</p>}
          </Field>

          <Field label="Calibration Type">
            <select
              value={calType}
              onChange={e => setCalType(e.target.value)}
              className={inputCls(false)}
            >
              {['routine','corrective','post_repair','initial'].map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Technician Name" required>
            <input
              type="text"
              value={technician}
              onChange={e => setTechnician(e.target.value)}
              placeholder="e.g. John Smith"
              className={inputCls(errors.technician)}
            />
            {errors.technician && <p className="text-xs text-red-600 mt-1">{errors.technician}</p>}
          </Field>
        </div>
      </SectionCard>

      {/* Reference standard */}
      <SectionCard title="Reference Standard (from CSV)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Description">
            <input
              type="text"
              value={refDesc}
              onChange={e => setRefDesc(e.target.value)}
              placeholder="e.g. Beamex MC6 S/N 123456"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Serial / Certificate Number">
            <input
              type="text"
              value={refSerial}
              onChange={e => setRefSerial(e.target.value)}
              placeholder="e.g. SN123456"
              className={inputCls(false)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Test points preview */}
      <SectionCard title="Test Points from CSV">
        {parsedPts.length === 0 ? (
          <p className="text-sm text-slate-500">No test point data was found in this CSV file.</p>
        ) : (
          <>
            <OverallBanner result={parsed.overallResult} />
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nominal Input</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">As-Found Output</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">As-Found Error %</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">AF Result</th>
                    {parsedPts.some(p => p.asLeftOutput != null) && (
                      <>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">As-Left Output</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">As-Left Error %</th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">AL Result</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPts.map((pt, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500">{pt.pointNumber}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{pt.nominalInput ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {pt.asFoundOutput != null ? pt.asFoundOutput : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                        {pt.asFoundErrorPct != null ? `${pt.asFoundErrorPct.toFixed(3)}%` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <ResultPill result={pt.asFoundResult} />
                      </td>
                      {parsedPts.some(p => p.asLeftOutput != null) && (
                        <>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {pt.asLeftOutput != null ? pt.asLeftOutput : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                            {pt.asLeftErrorPct != null ? `${pt.asLeftErrorPct.toFixed(3)}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <ResultPill result={pt.asLeftResult} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedPts.length > 0 && instrTestPoints.length > 0 &&
              parsedPts.length !== instrTestPoints.length && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠ CSV has {parsedPts.length} test points but this instrument is configured for {instrTestPoints.length}.
                Points will be mapped by position — verify data looks correct before submitting.
              </p>
            )}
          </>
        )}
      </SectionCard>

      {/* Notes */}
      <SectionCard title="Notes (optional)">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional observations about this calibration…"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 resize-none"
        />
      </SectionCard>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          ← Upload Different File
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Review & Submit →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Confirm & Submit ─────────────────────────────────────────────────

function ConfirmStep({ formData, onBack, onSuccess }) {
  const { instrument, calDate, technician, refDesc, refSerial, calType, notes, parsed } = formData
  const [saving, setSaving]     = useState(false)
  const [error,  setError]      = useState('')
  const [savedId, setSavedId]   = useState(null)
  const [submitting, setSubing] = useState(false)
  const navigate                = useNavigate()
  const { showToast, toasts, dismissToast } = useToast()

  async function handleSave(andSubmit) {
    setSaving(true)
    setError('')
    try {
      // Build test points from parsed CSV, mapped to instrument test point positions
      const instrPts  = generateTestPoints(instrument)
      const parsedPts = parsed.testPoints || []
      const hasAsLeft = parsedPts.some(p => p.asLeftOutput != null)

      const test_points = instrPts.map((pt, idx) => {
        const csvPt = parsedPts[idx]
        return {
          point_number:    pt.point_number,
          nominal_input:   csvPt?.nominalInput  ?? pt.nominal_input,
          expected_output: pt.expected_output,
          as_found_output: csvPt?.asFoundOutput ?? null,
          as_left_output:  hasAsLeft ? (csvPt?.asLeftOutput ?? null) : null,
        }
      })

      const payload = {
        instrument_id:                  instrument.id,
        calibration_date:               calDate,
        calibration_type:               calType,
        technician_name:                technician,
        reference_standard_description: refDesc || null,
        reference_standard_serial:      refSerial || null,
        adjustment_made:                hasAsLeft,
        technician_notes:               notes || null,
        defect_found:                   false,
        return_to_service:              true,
        test_points,
      }

      const record = await calApi.create(payload)
      setSavedId(record.id)

      if (andSubmit) {
        setSubing(true)
        await calApi.submit(record.id)
        showToast('Calibration imported and submitted for approval', 'success')
        setTimeout(() => navigate(`/app/instruments/${instrument.id}`), 1500)
      } else {
        showToast('Calibration saved as draft', 'info')
        setTimeout(() => navigate(`/app/instruments/${instrument.id}`), 1500)
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
      setSubing(false)
    }
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-green-800 mb-0.5">Ready to import</p>
        <p className="text-xs text-green-700">
          Review the summary below, then save as draft or submit directly for supervisor approval.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <SectionCard title="Calibration Summary">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            ['Instrument',         `${instrument.tag_number} — ${instrument.description || ''}`],
            ['Calibration Date',   calDate],
            ['Calibration Type',   calType.replace(/_/g, ' ')],
            ['Technician',         technician],
            ['Reference Standard', refDesc || '—'],
            ['Reference Serial',   refSerial || '—'],
            ['Test Points',        `${(parsed.testPoints || []).length} point(s) from CSV`],
            ['As-Left Data',       parsed.testPoints?.some(p => p.asLeftOutput != null) ? 'Yes (adjustment recorded)' : 'No'],
            ['Overall Result (CSV)',parsed.overallResult ? parsed.overallResult.toUpperCase() : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
              <dd className="text-sm text-slate-800 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={saving}
          className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving && !submitting ? (
              <><span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2 align-middle" />Saving…</>
            ) : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <><span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2 align-middle" />Submitting…</>
            ) : 'Import & Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress stepper ─────────────────────────────────────────────────────────

function Stepper({ step }) {
  const steps = ['Upload CSV', 'Review Data', 'Confirm & Submit']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, idx) => (
        <div key={idx} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${idx < step  ? 'bg-green-500 text-white'
              : idx === step ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-400'}`}
            >
              {idx < step ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (idx + 1)}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${idx === step ? 'text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 ${idx < step ? 'bg-green-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ImportCalibratorCSV() {
  const [searchParams] = useSearchParams()
  const instrumentId   = searchParams.get('instrumentId')

  const [step,      setStep]      = useState(0)
  const [parsed,    setParsed]    = useState(null)
  const [fileName,  setFileName]  = useState('')
  const [formData,  setFormData]  = useState(null)

  // Pre-load instrument name for breadcrumb if instrumentId present
  const [instrName, setInstrName] = useState(null)
  useEffect(() => {
    if (!instrumentId) return
    instrApi.get(instrumentId)
      .then(i => setInstrName(i.tag_number))
      .catch(() => {})
  }, [instrumentId])

  function handleParsed(result, name) {
    setParsed(result)
    setFileName(name)
    setStep(1)
  }

  function handleReview(data) {
    setFormData(data)
    setStep(2)
  }

  return (
    <div className="max-w-4xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/app/instruments" className="hover:text-slate-700">Instruments</Link>
        {instrumentId && instrName && (
          <>
            <span>/</span>
            <Link to={`/app/instruments/${instrumentId}`} className="hover:text-slate-700 font-mono text-slate-700">
              {instrName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium">Import Calibrator CSV</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Import from Calibrator CSV</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a CSV exported from a Beamex or Fluke calibrator to import test point data directly.
        </p>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <UploadStep onParsed={handleParsed} />
      )}

      {step === 1 && parsed && (
        <ReviewStep
          parsed={parsed}
          fileName={fileName}
          instrumentId={instrumentId}
          onBack={() => { setParsed(null); setStep(0) }}
          onConfirm={handleReview}
        />
      )}

      {step === 2 && formData && (
        <ConfirmStep
          formData={formData}
          onBack={() => setStep(1)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
