import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { instruments as instrApi } from '../utils/api'
import { humanise } from '../utils/formatting'
import { ToastContainer, useToast } from '../components/Toast'
import { getUser } from '../utils/userContext'

// ── Constants ─────────────────────────────────────────────────────────────────

const INSTRUMENT_TYPES = ['pressure','temperature','flow','level','analyser','switch','valve','other']
const OUTPUT_TYPES     = ['4_20ma','hart','digital','pulse','other']
const STATUS_OPTIONS   = ['active','spare','out_of_service']
const CRITICALITY_OPTS = [
  {
    value: 'safety_critical',
    label: 'SIS / Trip',
    sublabel: 'Safety Instrument System — plant shutdown on failure',
    dot: '#C62828',
    bg: '#FFEBEE',
    text: '#C62828',
  },
  {
    value: 'process_critical',
    label: 'Process Critical',
    sublabel: 'Affects controllers or other plant assets when faulty',
    dot: '#F9A825',
    bg: '#FFFDE7',
    text: '#7B5800',
  },
  {
    value: 'standard',
    label: 'Standard',
    sublabel: 'Indication only — no direct control or safety function',
    dot: '#2E7D32',
    bg: '#E8F5E9',
    text: '#2E7D32',
  },
  {
    value: 'non_critical',
    label: 'Non-Critical',
    sublabel: 'Utility / general purpose',
    dot: '#94A3B8',
    bg: '#F1F5F9',
    text: '#64748B',
  },
  {
    value: 'not_applicable',
    label: 'N/A',
    sublabel: 'Not yet determined',
    dot: '#CBD5E1',
    bg: '#F8FAFC',
    text: '#64748B',
  },
]
const TOLERANCE_TYPES  = [
  { value: 'percent_span',    label: '% Span' },
  { value: 'percent_reading', label: '% Reading' },
  { value: 'absolute',        label: 'Absolute' },
]
const TEST_POINT_OPTS = Array.from({ length: 20 }, (_, i) => i + 1)
const LAST_RESULTS = ['pass','fail','marginal']

// Fallback areas shown before API data loads
const DEFAULT_AREAS = []

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionCard({ title, hint, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 rounded-t-xl overflow-hidden">
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

// Convert interval → days
function toDays(value, unit) {
  const n = parseInt(value, 10)
  if (isNaN(n) || !value) return null
  if (unit === 'weeks')  return n * 7
  if (unit === 'months') return Math.round(n * 30.44)
  return n
}

// Convert days → best display unit
function fromDays(days) {
  if (!days) return { value: '', unit: 'days' }
  if (days % 7 === 0 && days < 365) return { value: String(days / 7),         unit: 'weeks'  }
  if (days >= 28 && days % 30 === 0) return { value: String(days / 30),        unit: 'months' }
  // Approximate: if days is close to a month multiple
  const nearestMonths = Math.round(days / 30.44)
  if (nearestMonths > 0 && Math.abs(days - nearestMonths * 30.44) < 2)
    return { value: String(nearestMonths), unit: 'months' }
  return { value: String(days), unit: 'days' }
}

// ── Custom criticality select ─────────────────────────────────────────────────

function CriticalitySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = CRITICALITY_OPTS.find(o => o.value === value) ?? CRITICALITY_OPTS[2]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          fontSize: '0.875rem',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          background: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Dot */}
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: selected.dot, flexShrink: 0, display: 'inline-block',
        }} />
        {/* Label pill */}
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '1px 10px', borderRadius: 20,
          background: selected.bg, color: selected.text,
          fontSize: '0.72rem', fontWeight: 700,
        }}>
          {selected.label}
        </span>
        <span style={{ flex: 1, color: '#94a3b8', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected.sublabel}
        </span>
        {/* Chevron */}
        <svg style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', borderRadius: 10,
          border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {CRITICALITY_OPTS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderBottom: '1px solid #f1f5f9',
                background: opt.value === value ? '#f8fafc' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? '#f8fafc' : '#fff' }}
            >
              {/* Colored dot */}
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                background: opt.dot, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Pill */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '1px 10px', borderRadius: 20,
                  background: opt.bg, color: opt.text,
                  fontSize: '0.7rem', fontWeight: 700,
                  marginBottom: 2,
                }}>
                  {opt.label}
                </span>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                  {opt.sublabel}
                </p>
              </div>
              {/* Tick */}
              {opt.value === value && (
                <svg style={{ width: 14, height: 14, color: '#2196F3', flexShrink: 0 }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InstrumentForm() {
  const navigate = useNavigate()
  const { id } = useParams()      // present when editing existing instrument
  const isEdit = Boolean(id)

  const { toasts, showToast, dismissToast } = useToast()

  const [loading,        setLoading]        = useState(isEdit)
  const [saving,         setSaving]         = useState(false)
  const [errors,         setErrors]         = useState({})
  const [saveError,      setSaveError]      = useState(null)
  const [tagChecking,    setTagChecking]    = useState(false)
  const [tagExists,      setTagExists]      = useState(false)
  const [showTolRef,     setShowTolRef]     = useState(false)
  const [knownAreas,     setKnownAreas]     = useState(DEFAULT_AREAS)
  const [origTagNumber,  setOrigTagNumber]  = useState('')  // for edit — skip self-check

  // Section 1 — Identification
  const [tagNumber,      setTagNumber]      = useState('')
  const [description,    setDescription]    = useState('')
  const [area,           setArea]           = useState('')
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

  // ── Fetch existing areas for autocomplete ─────────────────────────────────
  useEffect(() => {
    const site = getUser()?.siteName ?? undefined
    instrApi.list({ limit: 500, site })
      .then(res => {
        const set = new Set((res.results ?? []).map(i => i.area).filter(Boolean))
        setKnownAreas([...set].sort())
      })
      .catch(() => {})
  }, [])

  // ── Load existing instrument when editing ─────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    instrApi.get(id)
      .then(inst => {
        setOrigTagNumber(inst.tag_number)
        setTagNumber(inst.tag_number ?? '')
        setDescription(inst.description ?? '')
        setArea(inst.area ?? '')
        setUnit(inst.unit ?? '')
        setLocation(inst.physical_location ?? '')
        setStatus(inst.status ?? 'active')
        setCriticality(inst.criticality ?? 'standard')
        setInstrType(inst.instrument_type ?? '')
        setManufacturer(inst.manufacturer ?? '')
        setModelNumber(inst.model ?? '')
        setSerialNumber(inst.serial_number ?? '')
        setLrv(inst.measurement_lrv != null ? String(inst.measurement_lrv) : '')
        setUrv(inst.measurement_urv != null ? String(inst.measurement_urv) : '')
        setEngUnits(inst.engineering_units ?? '')
        setOutputType(inst.output_type ?? '')
        setProcedureRef(inst.procedure_reference ?? '')
        setNumPoints(inst.num_test_points ?? 5)
        setTolType(inst.tolerance_type ?? 'percent_span')
        setTolValue(inst.tolerance_value != null ? String(inst.tolerance_value) : '')
        if (inst.calibration_interval_days) {
          const { value, unit: u } = fromDays(inst.calibration_interval_days)
          setCalInterval(value)
          setIntervalUnit(u)
        }
        setLastCalDate(inst.last_calibration_date ?? '')
        setLastCalResult(inst.last_calibration_result === 'not_calibrated' ? '' : (inst.last_calibration_result ?? ''))
        setLoading(false)
      })
      .catch(() => { navigate('/app/instruments'); })
  }, [id, isEdit])

  // ── Tag uniqueness check (skip if unchanged in edit mode) ─────────────────
  useEffect(() => {
    const upperTag = tagNumber.toUpperCase().trim()
    if (upperTag.length < 2) { setTagExists(false); return }
    if (isEdit && upperTag === origTagNumber.toUpperCase()) { setTagExists(false); return }
    setTagChecking(true)
    const timer = setTimeout(() => {
      const site = getUser()?.siteName ?? undefined
      instrApi.list({ limit: 500, site })
        .then(res => {
          const found = (res.results ?? []).some(i =>
            i.tag_number.toUpperCase() === upperTag && i.id !== id
          )
          setTagExists(found)
          setTagChecking(false)
        })
        .catch(() => setTagChecking(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [tagNumber, origTagNumber, isEdit, id])

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

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaveError(null)
    setSaving(true)

    const currentUser = getUser()
    const payload = {
      tag_number:                   tagNumber.toUpperCase().trim(),
      description:                  description.trim(),
      area:                         area || null,
      unit:                         unit || null,
      status,
      criticality,
      instrument_type:              instrType || null,
      manufacturer:                 manufacturer || null,
      model:                        modelNumber || null,     // backend field is "model" not "model_number"
      serial_number:                serialNumber || null,
      measurement_lrv:              lrv !== '' ? parseFloat(lrv) : null,
      measurement_urv:              urv !== '' ? parseFloat(urv) : null,
      engineering_units:            engUnits || null,
      output_type:                  outputType || null,
      calibration_interval_days:    toDays(calInterval, intervalUnit),  // backend field is "calibration_interval_days"
      num_test_points:              numPoints,
      tolerance_type:               tolType,
      tolerance_value:              tolValue !== '' ? parseFloat(tolValue) : null,
      procedure_reference:          procedureRef || null,
      last_calibration_date:        lastCalDate || null,
      last_calibration_result:      lastCalResult || null,
    }

    // On create: stamp the site name into created_by for data isolation
    if (!isEdit && currentUser?.siteName) {
      payload.created_by = currentUser.siteName
    }

    try {
      let inst
      if (isEdit) {
        inst = await instrApi.update(id, payload)
        showToast('Instrument updated successfully', 'success')
      } else {
        inst = await instrApi.create(payload)
        showToast('Instrument created successfully', 'success')
      }
      setTimeout(() => navigate(`/app/instruments/${inst.id}`), 600)
    } catch (err) {
      setSaveError(err.message)
      showToast(err.message || 'Failed to save instrument', 'error')
      setSaving(false)
    }
  }

  // ── Tolerance unit label ──────────────────────────────────────────────────
  const tolUnitLabel = tolType === 'percent_span' || tolType === 'percent_reading'
    ? '%' : engUnits || 'EU'

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/app/instruments" className="hover:text-slate-700">Instruments</Link>
        {isEdit && (
          <>
            <span>/</span>
            <Link to={`/app/instruments/${id}`} className="hover:text-slate-700 font-mono">{origTagNumber}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium">{isEdit ? 'Edit' : 'New Instrument'}</span>
      </nav>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* ── Section 1: Identification ─── */}
      <SectionCard title="Identification">
        <Field label="Tag Number" required error={errors.tagNumber}
          hint='Must be unique. Auto-uppercased. e.g. PT-1023A'>
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
          hint="What does this instrument measure?">
          <input type="text" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Reactor inlet pressure"
            className={inputCls(errors.description)} />
        </Field>

        <Field label="Plant Area"
          hint="Type a new area or pick an existing one">
          <input
            type="text"
            list="area-options"
            value={area}
            onChange={e => setArea(e.target.value)}
            placeholder="e.g. Area 1, Utilities, Offsite…"
            className={inputCls(false)}
          />
          <datalist id="area-options">
            {knownAreas.map(a => <option key={a} value={a} />)}
          </datalist>
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

        <Field label="Criticality"
          hint="Determines calibration priority, certificate requirements and risk sorting">
          <CriticalitySelect value={criticality} onChange={setCriticality} />
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
        <Field label="Calibration Interval"
          hint="Backend stores in days; weeks/months are converted automatically">
          <div className="flex gap-2">
            <input type="number" min="1" value={calInterval} onChange={e => setCalInterval(e.target.value)}
              placeholder="e.g. 12" className={`${inputCls(false)} flex-1`} />
            <select value={intervalUnit} onChange={e => setIntervalUnit(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
          {calInterval && (
            <p className="text-xs text-slate-400 mt-1">
              = {toDays(calInterval, intervalUnit)} days stored in database
            </p>
          )}
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
      <SectionCard title={isEdit ? 'Calibration Status' : 'Initial Calibration Status'}
        hint={isEdit ? undefined : 'Optional — for migrating existing instruments with known calibration history.'}>
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
        <Link
          to={isEdit ? `/app/instruments/${id}` : '/app/instruments'}
          className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || tagChecking}
          className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Instrument'}
        </button>
      </div>

    </div>
  )
}
