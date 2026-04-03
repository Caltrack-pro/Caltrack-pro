import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { instruments as instrApi } from '../utils/api'
import { humanise } from '../utils/formatting'

// ── Constants ─────────────────────────────────────────────────────────────────

const INSTRUMENT_TYPES = ['pressure','temperature','flow','level','analyser','switch','valve','other']
const OUTPUT_TYPES     = ['4_20ma','hart','digital','pulse','other']
const STATUS_OPTIONS   = ['active','spare','out_of_service']
const CRITICALITY_OPTS = ['safety_critical','process_critical','standard','non_critical']
const TOLERANCE_TYPES  = [
  { value: 'percent_span',    label: '% Span' },
  { value: 'percent_reading', label: '% Reading' },
  { value: 'absolute',        label: 'Absolute' },
]
const TEST_POINT_OPTS = [3, 5, 7, 9, 11]
const AREAS = ['Area 1','Area 2','Area 3','Area 4','Utilities','Offsite']  // fallback list
const LAST_RESULTS = ['pass','fail','marginal']

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionCard({ title, hint, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="px-6 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, required, error, hint, span, children }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white text-slate-700'
  }`

// Typical tolerance reference by type
const TOL_REFERENCE = [
  { type: 'Safety Critical',   typical: '±0.25% span' },
  { type: 'Process Critical',  typical: '±0.5% span' },
  { type: 'Standard',          typical: '±1.0% span' },
  { type: 'Non-Critical',      typical: '±2.0% span' },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function InstrumentForm() {
  const navigate = useNavigate()

  const [saving,         setSaving]         = useState(false)
  const [errors,         setErrors]         = useState({})
  const [saveError,      setSaveError]      = useState(null)
  const [tagChecking,    setTagChecking]    = useState(false)
  const [tagExists,      setTagExists]      = useState(false)
  const [showTolRef,     setShowTolRef]     = useState(false)

  // Section 1 — Identification
  const [tagNumber,      setTagNumber]      = useState('')
  const [description,    setDescription]    = useState('')
  const [area,           setArea]           = useState('')
  const [areaCustom,     setAreaCustom]     = useState('')
  const [unit,           setUnit]           = useState('')
  const [location,       setLocation]       = useState('')
  const [status,         setStatus]         = useState('active')
  const [criticality,    setCriticality]    = useState('standard')

  // Section 2 — Technical
  const [instrType,      setInstrType]      = useState('')
  const [manufacturer,   setManufacturer]   = useState('')
  const [modelNumber,    setModelNumber]    = useState('')
  const [serialNumber,   setSerialNumber]   = useState('')
  const [lrv,            setLrv]            = useState('')
  const [urv,            setUrv]            = useState('')
  const [engUnits,       setEngUnits]       = useState('')
  const [outputType,     setOutputType]     = useState('')

  // Section 3 — Calibration config
  const [calInterval,    setCalInterval]    = useState('')
  const [intervalUnit,   setIntervalUnit]   = useState('days')
  const [numPoints,      setNumPoints]      = useState(5)
  const [tolType,        setTolType]        = useState('percent_span')
  const [tolValue,       setTolValue]       = useState('')
  const [procedureRef,   setProcedureRef]   = useState('')

  // Section 4 — Initial status
  const [lastCalDate,    setLastCalDate]    = useState('')
  const [lastCalResult,  setLastCalResult]  = useState('')

  // ── Tag uniqueness check ──────────────────────────────────────────────────
  useEffect(() => {
    if (tagNumber.length < 2) { setTagExists(false); return }
    setTagChecking(true)
    const timer = setTimeout(() => {
      instrApi.list({ limit: 1 })
        .then(res => {
          // Simple client-side check against first page; good enough for most cases
          const found = (res.results ?? []).some(i => i.tag_number.toUpperCase() === tagNumber.toUpperCase())
          setTagExists(found)
          setTagChecking(false)
        })
        .catch(() => setTagChecking(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [tagNumber])

  // ── Validate ──────────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!tagNumber.trim())   e.tagNumber    = 'Tag number is required'
    if (tagExists)           e.tagNumber    = 'This tag number already exists'
    if (!description.trim()) e.description  = 'Description is required'
    if (!instrType)          e.instrType    = 'Instrument type is required'
    if (lrv !== '' && urv !== '' && parseFloat(lrv) >= parseFloat(urv))
      e.urv = 'URV must be greater than LRV'
    if (tolValue !== '' && parseFloat(tolValue) <= 0)
      e.tolValue = 'Tolerance must be greater than 0'
    return e
  }

  // ── Compute interval in days ──────────────────────────────────────────────
  function intervalDays() {
    if (!calInterval) return null
    const n = parseInt(calInterval, 10)
    if (isNaN(n)) return null
    return intervalUnit === 'months' ? n * 30 : n
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaveError(null)
    setSaving(true)

    const effectiveArea = area === '__custom__' ? areaCustom : area

    const payload = {
      tag_number:                   tagNumber.toUpperCase().trim(),
      description:                  description.trim(),
      area:                         effectiveArea || null,
      unit:                         unit || null,
      physical_location:            location || null,
      status,
      criticality,
      instrument_type:              instrType || null,
      manufacturer:                 manufacturer || null,
      model_number:                 modelNumber || null,
      serial_number:                serialNumber || null,
      measurement_lrv:              lrv !== '' ? parseFloat(lrv) : null,
      measurement_urv:              urv !== '' ? parseFloat(urv) : null,
      engineering_units:            engUnits || null,
      output_type:                  outputType || null,
      calibration_interval:         intervalDays(),
      num_test_points:              numPoints,
      tolerance_type:               tolType,
      tolerance_value:              tolValue !== '' ? parseFloat(tolValue) : null,
      procedure_reference:          procedureRef || null,
      last_calibration_date:        lastCalDate || null,
      last_calibration_result:      lastCalResult || null,
    }

    try {
      const inst = await instrApi.create(payload)
      navigate(`/instruments/${inst.id}`)
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  // ── Tolerance unit label ──────────────────────────────────────────────────
  const tolUnitLabel = tolType === 'percent_span' || tolType === 'percent_reading'
    ? '%' : engUnits || 'EU'

  return (
    <div className="max-w-4xl space-y-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/instruments" className="hover:text-slate-700">Instruments</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">New Instrument</span>
      </nav>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* ── Section 1: Identification ─── */}
      <SectionCard title="Identification">
        <Field label="Tag Number" required error={errors.tagNumber}
          hint='Must be unique. Will be auto-uppercased. e.g. PT-1023A'>
          <div className="relative">
            <input
              type="text"
              value={tagNumber}
              onChange={e => setTagNumber(e.target.value.toUpperCase())}
              placeholder="e.g. PT-1023A"
              className={inputCls(errors.tagNumber)}
            />
            {tagChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            )}
          </div>
        </Field>

        <Field label="Service Description" required error={errors.description}
          hint="What does this instrument measure? e.g. Reactor inlet pressure">
          <input type="text" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Reactor inlet pressure"
            className={inputCls(errors.description)} />
        </Field>

        <Field label="Plant Area">
          <select value={area} onChange={e => setArea(e.target.value)} className={inputCls(false)}>
            <option value="">Select area…</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            <option value="__custom__">Other (type below)…</option>
          </select>
          {area === '__custom__' && (
            <input type="text" value={areaCustom} onChange={e => setAreaCustom(e.target.value)}
              placeholder="Type area name…"
              className={`${inputCls(false)} mt-2`} />
          )}
        </Field>

        <Field label="Unit / Plant Section">
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
            placeholder="e.g. Unit 2, Distillation"
            className={inputCls(false)} />
        </Field>

        <Field label="Physical Location" span={2}>
          <textarea rows={2} value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. North side of reactor, elevation 12m"
            className={`${inputCls(false)} resize-none`} />
        </Field>

        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls(false)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{humanise(s)}</option>)}
          </select>
        </Field>

        <Field label="Criticality">
          <select value={criticality} onChange={e => setCriticality(e.target.value)} className={inputCls(false)}>
            {CRITICALITY_OPTS.map(c => <option key={c} value={c}>{humanise(c)}</option>)}
          </select>
        </Field>
      </SectionCard>

      {/* ── Section 2: Technical ─── */}
      <SectionCard title="Technical Details">
        <Field label="Instrument Type" required error={errors.instrType}>
          <select value={instrType} onChange={e => setInstrType(e.target.value)} className={inputCls(errors.instrType)}>
            <option value="">Select type…</option>
            {INSTRUMENT_TYPES.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
          </select>
        </Field>

        <Field label="Output Type">
          <select value={outputType} onChange={e => setOutputType(e.target.value)} className={inputCls(false)}>
            <option value="">Select…</option>
            {OUTPUT_TYPES.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
          </select>
        </Field>

        <Field label="Manufacturer">
          <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)}
            placeholder="e.g. Endress+Hauser" className={inputCls(false)} />
        </Field>

        <Field label="Model / Part Number">
          <input type="text" value={modelNumber} onChange={e => setModelNumber(e.target.value)}
            placeholder="e.g. PMC71-E1A11" className={inputCls(false)} />
        </Field>

        <Field label="Serial Number">
          <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)}
            placeholder="e.g. F1234567" className={inputCls(false)} />
        </Field>

        <Field label="Engineering Units">
          <input type="text" value={engUnits} onChange={e => setEngUnits(e.target.value)}
            placeholder="e.g. kPa, degC, m3/h" className={inputCls(false)} />
        </Field>

        <Field label="Measurement LRV" hint="Lower range value">
          <input type="number" step="any" value={lrv} onChange={e => setLrv(e.target.value)}
            placeholder="0" className={inputCls(false)} />
        </Field>

        <Field label="Measurement URV" error={errors.urv} hint="Upper range value">
          <input type="number" step="any" value={urv} onChange={e => setUrv(e.target.value)}
            placeholder="100" className={inputCls(errors.urv)} />
        </Field>
      </SectionCard>

      {/* ── Section 3: Calibration config ─── */}
      <SectionCard title="Calibration Configuration">
        <Field label="Calibration Interval">
          <div className="flex gap-2">
            <input type="number" min="1" value={calInterval} onChange={e => setCalInterval(e.target.value)}
              placeholder="e.g. 12" className={`${inputCls(false)} flex-1`} />
            <select value={intervalUnit} onChange={e => setIntervalUnit(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
          </div>
        </Field>

        <Field label="Number of Test Points">
          <select value={numPoints} onChange={e => setNumPoints(+e.target.value)} className={inputCls(false)}>
            {TEST_POINT_OPTS.map(n => <option key={n} value={n}>{n} points</option>)}
          </select>
        </Field>

        <Field label="Tolerance Type">
          <select value={tolType} onChange={e => setTolType(e.target.value)} className={inputCls(false)}>
            {TOLERANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label={`Tolerance Value (${tolUnitLabel})`} error={errors.tolValue}>
          <input type="number" step="any" min="0" value={tolValue}
            onChange={e => setTolValue(e.target.value)}
            placeholder={tolType === 'absolute' ? '0.1' : '1.0'}
            className={inputCls(errors.tolValue)} />
        </Field>

        <Field label="Procedure Reference" span={2}>
          <input type="text" value={procedureRef} onChange={e => setProcedureRef(e.target.value)}
            placeholder="e.g. CAL-PROC-001, Rev 3" className={inputCls(false)} />
        </Field>

        {/* Tolerance reference table */}
        <div className="sm:col-span-2">
          <button type="button" onClick={() => setShowTolRef(v => !v)}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <svg className={`w-3 h-3 transition-transform ${showTolRef ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            Typical tolerance values by criticality
          </button>
          {showTolRef && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Criticality</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Typical Tolerance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TOL_REFERENCE.map(r => (
                    <tr key={r.type}>
                      <td className="px-3 py-2 text-slate-700">{r.type}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{r.typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Section 4: Initial calibration status ─── */}
      <SectionCard title="Initial Calibration Status"
        hint="Optional — for migrating existing instruments with known calibration history.">
        <Field label="Last Calibration Date">
          <input type="date" value={lastCalDate} onChange={e => setLastCalDate(e.target.value)}
            className={inputCls(false)} />
        </Field>

        <Field label="Last Calibration Result">
          <select value={lastCalResult} onChange={e => setLastCalResult(e.target.value)}
            className={inputCls(false)}>
            <option value="">Not specified</option>
            {LAST_RESULTS.map(r => <option key={r} value={r}>{humanise(r)}</option>)}
          </select>
        </Field>
      </SectionCard>

      {/* ── Footer ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <Link to="/instruments"
          className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || tagChecking}
          className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Instrument'}
        </button>
      </div>

    </div>
  )
}
