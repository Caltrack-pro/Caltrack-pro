import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { instruments as instrApi, calibrations as calApi, auth as authApi } from '../utils/api'
import { CalStatusBadge } from '../components/Badges'
import { fmtDate, fmtNum, fmtPct, todayISO, humanise } from '../utils/formatting'
import { calcPoint, overallResult, maxErrorPct, generateTestPoints } from '../utils/calEngine'
import { getUser } from '../utils/userContext'
import { ToastContainer, useToast } from '../components/Toast'

// ── Small helpers ────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 sm:px-6 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
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

function ResultBanner({ result }) {
  if (!result) return null
  const cfg = {
    pass:     { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✓ PASS' },
    marginal: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '~ MARGINAL' },
    fail:     { bg: 'bg-red-50 border-red-200',     text: 'text-red-700',   label: '✗ FAIL' },
  }[result]
  if (!cfg) return null
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${cfg.bg} ${cfg.text}`}>
      Overall Result: {cfg.label}
    </div>
  )
}

const RESULT_COLORS = { pass: 'text-green-600', marginal: 'text-amber-600', fail: 'text-red-600' }

// ── Test points table ────────────────────────────────────────────────────────

function TestPointsTable({ instrument, readings, onChange, label = 'Actual Output' }) {
  if (!instrument) return null

  const { tolerance_type, tolerance_value, measurement_lrv: lrv, measurement_urv: urv, engineering_units } = instrument
  const outputSpan = (urv ?? 0) - (lrv ?? 0)

  const points = useMemo(() => generateTestPoints(instrument), [instrument])

  const calculated = useMemo(() =>
    points.map((pt, i) => {
      const actual = readings[i]
      return calcPoint(actual, pt.expected_output, tolerance_type, tolerance_value, outputSpan)
    }),
    [points, readings, tolerance_type, tolerance_value, outputSpan]
  )

  const results    = calculated.map(c => c?.result ?? null)
  const overall    = overallResult(results)
  const maxErrPct  = maxErrorPct(calculated)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Expected ({engineering_units || 'EU'})
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {label} ({engineering_units || 'EU'})
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Error (EU)</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Error (%span)</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {points.map((pt, i) => {
              const calc = calculated[i]
              return (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-500 font-mono text-xs">{pt.point_number}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{fmtNum(pt.expected_output, 4)}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="any"
                      value={readings[i] ?? ''}
                      onChange={e => onChange(i, e.target.value)}
                      placeholder="—"
                      className="w-full px-2 py-1 font-mono text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600 text-xs">
                    {calc ? fmtNum(calc.errorAbs, 4) : '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600 text-xs">
                    {calc ? fmtPct(calc.errorPct, 2) : '—'}
                  </td>
                  <td className={`px-3 py-2 font-bold text-xs uppercase ${RESULT_COLORS[calc?.result] ?? 'text-slate-400'}`}>
                    {calc?.result ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <ResultBanner result={overall} />
        {maxErrPct != null && (
          <p className="text-xs text-slate-500">Max error: <span className="font-semibold">{fmtPct(maxErrPct, 2)}</span></p>
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const CAL_TYPES = ['routine','corrective','post_repair','initial']
const ADJ_TYPES = ['zero_only','span_only','zero_and_span','full_calibration','other']

export default function CalibrationForm() {
  const { instrumentId } = useParams()
  const navigate = useNavigate()
  const { toasts, showToast, dismissToast } = useToast()

  const [instrument, setInstrument] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)  // latches true after successful save — prevents duplicate submissions
  const savingRef = useRef(false)     // synchronous guard against double-click before React re-renders
  const [errors,     setErrors]     = useState({})

  // Section 2 — Calibration details
  const [calDate,       setCalDate]       = useState(todayISO())
  const [calType,       setCalType]       = useState('routine')
  const [members,       setMembers]       = useState([])        // site members for technician dropdown
  const [technicianId,  setTechnicianId]  = useState(() => getUser()?.userId ?? '')
  const [workOrder,     setWorkOrder]     = useState('')
  const [procedureUsed, setProcedureUsed] = useState('')

  // Section 3 — Reference standard
  const [refDesc,    setRefDesc]    = useState('')
  const [refSerial,  setRefSerial]  = useState('')
  const [refCert,    setRefCert]    = useState('')
  const [refExpiry,  setRefExpiry]  = useState('')

  // Section 4 — As-Found readings (array of strings, index = point index)
  const [asFoundReadings, setAsFoundReadings] = useState([])

  // Section 5 — Adjustment
  const [adjustmentMade, setAdjustmentMade] = useState(false)
  const [adjType,        setAdjType]        = useState('')
  const [adjNotes,       setAdjNotes]       = useState('')

  // Section 6 — As-Left readings
  const [asLeftReadings, setAsLeftReadings] = useState([])

  // Section 7 — Notes
  const [notes,              setNotes]              = useState('')
  const [defectFound,        setDefectFound]         = useState(false)
  const [defectDescription,  setDefectDescription]   = useState('')
  const [returnedToService,  setReturnedToService]   = useState(true)

  // ── Fetch instrument ──────────────────────────────────────────────────────
  useEffect(() => {
    instrApi.get(instrumentId)
      .then(inst => {
        setInstrument(inst)
        const pts = generateTestPoints(inst)
        setAsFoundReadings(Array(pts.length).fill(''))
        setAsLeftReadings(Array(pts.length).fill(''))
        if (inst.procedure_reference) setProcedureUsed(inst.procedure_reference)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [instrumentId])

  // ── Fetch site members for the technician dropdown ────────────────────────
  useEffect(() => {
    authApi.listMembers()
      .then(list => setMembers(Array.isArray(list) ? list : []))
      .catch(() => setMembers([]))
  }, [])

  // ── Computed as-found overall result ─────────────────────────────────────
  const asFoundCalc = useMemo(() => {
    if (!instrument) return { overall: null, maxErr: null }
    const pts = generateTestPoints(instrument)
    const { tolerance_type, tolerance_value, measurement_lrv: lrv, measurement_urv: urv } = instrument
    const span = (urv ?? 0) - (lrv ?? 0)
    const calcs = pts.map((pt, i) => calcPoint(asFoundReadings[i], pt.expected_output, tolerance_type, tolerance_value, span))
    return {
      overall: overallResult(calcs.map(c => c?.result ?? null)),
      maxErr:  maxErrorPct(calcs),
    }
  }, [instrument, asFoundReadings])

  // ── Expiry warning ────────────────────────────────────────────────────────
  const refExpired = useMemo(() => {
    if (!refExpiry) return false
    return refExpiry < todayISO()
  }, [refExpiry])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const updateAsFound = useCallback((i, val) => {
    setAsFoundReadings(prev => { const n = [...prev]; n[i] = val; return n })
  }, [])

  const updateAsLeft = useCallback((i, val) => {
    setAsLeftReadings(prev => { const n = [...prev]; n[i] = val; return n })
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!calDate)    e.calDate    = 'Date required'
    if (!technicianId) e.technician = 'Technician required'
    if (adjustmentMade && !adjType) e.adjType = 'Select adjustment type'
    if (refExpiry && refExpiry < todayISO()) e.refExpiry = 'Reference standard is expired'
    return e
  }

  // Selected technician lookup — technician_id on the record stores the Supabase user_id
  const selectedTech = useMemo(
    () => members.find(m => m.user_id === technicianId),
    [members, technicianId]
  )

  // ── Build payload ─────────────────────────────────────────────────────────
  function buildPayload() {
    const pts = generateTestPoints(instrument)
    const test_points = pts.map((pt, i) => ({
      point_number:    pt.point_number,
      nominal_input:   pt.nominal_input,
      expected_output: pt.expected_output,
      as_found_output: asFoundReadings[i] !== '' ? parseFloat(asFoundReadings[i]) : null,
      as_left_output:  adjustmentMade && asLeftReadings[i] !== ''
                         ? parseFloat(asLeftReadings[i])
                         : null,
    }))

    return {
      instrument_id:                   instrument.id,
      calibration_date:                calDate,
      calibration_type:                calType,
      technician_name:                 selectedTech?.display_name || getUser()?.userName || '',
      technician_id:                   technicianId || null,
      work_order_reference:            workOrder || null,
      procedure_used:                  procedureUsed || null,
      reference_standard_description:  refDesc || null,
      reference_standard_serial:       refSerial || null,
      reference_standard_cert_number:  refCert || null,
      reference_standard_cert_expiry:  refExpiry || null,
      adjustment_made:                 adjustmentMade,
      adjustment_type:                 adjustmentMade ? adjType : null,
      adjustment_notes:                adjustmentMade && adjNotes ? adjNotes : null,
      technician_notes:                notes || null,
      defect_found:                    defectFound,
      defect_description:              defectFound && defectDescription ? defectDescription : null,
      return_to_service:               returnedToService,
      test_points,
    }
  }

  async function handleSave(asDraft) {
    if (savingRef.current || saved) return
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    savingRef.current = true
    setSaving(true)
    try {
      const record = await calApi.create(buildPayload())
      if (!asDraft) {
        const submitted = await calApi.submit(record.id)
        const autoApproved = submitted?.record_status === 'approved'
        showToast(autoApproved ? 'Calibration approved — certificate will be emailed shortly' : 'Calibration submitted for approval', 'success')
      } else {
        showToast('Draft saved — remember to submit when complete', 'info')
      }
      setSaved(true)  // latch — buttons stay disabled until unmount
      setTimeout(() => navigate(`/app/instruments/${instrumentId}`, { replace: true }), 1200)
    } catch (err) {
      setError(err.message)
      savingRef.current = false
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  if (error && !instrument) return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-8 text-center text-red-700 text-sm">
      <p className="font-semibold mb-1">Failed to load instrument</p>
      <p>{error}</p>
      <Link to="/app/instruments" className="mt-3 inline-block text-blue-600 underline">Back to list</Link>
    </div>
  )

  return (
    <div className="max-w-4xl space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/app/instruments" className="hover:text-slate-700">Instruments</Link>
        <span>/</span>
        <Link to={`/app/instruments/${instrumentId}`} className="hover:text-slate-700 font-mono text-slate-700">
          {instrument?.tag_number ?? instrumentId}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">New Calibration</span>
      </nav>

      {/* Save error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Section 1: Instrument header ─── */}
      <SectionCard title="Instrument">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Tag Number</p>
            <p className="font-mono font-bold text-slate-800">{instrument.tag_number}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-0.5">Description</p>
            <p className="text-slate-700">{instrument.description || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Status</p>
            <CalStatusBadge alertStatus={instrument.alert_status} instrumentStatus={instrument.status} />
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-0.5">Area</p>
            <p className="text-slate-700">{instrument.area || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Type</p>
            <p className="text-slate-700">{humanise(instrument.instrument_type)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Range</p>
            <p className="font-mono text-slate-700 text-sm">
              {instrument.measurement_lrv ?? '?'} – {instrument.measurement_urv ?? '?'} {instrument.engineering_units || ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Tolerance</p>
            <p className="font-mono text-slate-700 text-sm">
              ±{instrument.tolerance_value} {instrument.tolerance_type === 'percent_span' ? '% span'
                : instrument.tolerance_type === 'percent_reading' ? '% reading' : instrument.engineering_units || 'EU'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Section 2: Calibration details ─── */}
      <SectionCard title="Calibration Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Calibration Date" required>
            <input
              type="date"
              value={calDate}
              onChange={e => setCalDate(e.target.value)}
              max={todayISO()}
              className={inputCls(errors.calDate)}
            />
            {errors.calDate && <p className="text-xs text-red-600 mt-1">{errors.calDate}</p>}
          </Field>

          <Field label="Calibration Type">
            <select value={calType} onChange={e => setCalType(e.target.value)} className={inputCls(false)}>
              {CAL_TYPES.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
            </select>
          </Field>

          <Field label="Technician" required>
            <select
              value={technicianId}
              onChange={e => setTechnicianId(e.target.value)}
              className={inputCls(errors.technician)}
            >
              <option value="">— Select technician —</option>
              {members
                .filter(m => m.user_id)
                .map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name || m.email || '(unnamed)'}{m.role ? ` · ${m.role}` : ''}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Calibration certificate PDF is emailed to the selected technician on approval.
            </p>
            {errors.technician && <p className="text-xs text-red-600 mt-1">{errors.technician}</p>}
          </Field>

          <Field label="Work Order Number">
            <input
              type="text"
              value={workOrder}
              onChange={e => setWorkOrder(e.target.value)}
              placeholder="e.g. WO-2024-001"
              className={inputCls(false)}
            />
          </Field>

          <Field label="Procedure Used">
            <input
              type="text"
              value={procedureUsed}
              onChange={e => setProcedureUsed(e.target.value)}
              placeholder={instrument?.procedure_reference ? `Default: ${instrument.procedure_reference}` : 'e.g. CAL-PROC-001, Rev 3'}
              className={inputCls(false)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 3: Reference standard ─── */}
      <SectionCard title="Reference Standard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Description">
            <input type="text" value={refDesc} onChange={e => setRefDesc(e.target.value)}
              placeholder="e.g. Fluke 754 Documenting Process Calibrator"
              className={inputCls(false)} />
          </Field>
          <Field label="Serial Number">
            <input type="text" value={refSerial} onChange={e => setRefSerial(e.target.value)}
              placeholder="e.g. SN12345678" className={inputCls(false)} />
          </Field>
          <Field label="Certificate Number">
            <input type="text" value={refCert} onChange={e => setRefCert(e.target.value)}
              placeholder="e.g. CAL-2024-0042" className={inputCls(false)} />
          </Field>
          <Field label="Certificate Expiry Date">
            <input type="date" value={refExpiry} onChange={e => setRefExpiry(e.target.value)}
              className={inputCls(refExpired)} />
            {refExpired && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                ⚠ Reference standard certificate has expired — calibration may be invalid.
              </p>
            )}
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 4: As-Found readings ─── */}
      <SectionCard title="As-Found Readings">
        <p className="text-xs text-slate-500 mb-3">
          Record instrument readings before any adjustments. Enter actual output at each test point.
        </p>
        <TestPointsTable
          instrument={instrument}
          readings={asFoundReadings}
          onChange={updateAsFound}
          label="As-Found Output"
        />
      </SectionCard>

      {/* ── Section 5: Adjustment ─── */}
      <SectionCard title="Adjustment">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAdjustmentMade(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${adjustmentMade ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${adjustmentMade ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">Adjustment was made to this instrument</span>
          </label>

          {adjustmentMade && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <Field label="Adjustment Type" required>
                <select value={adjType} onChange={e => setAdjType(e.target.value)} className={inputCls(errors.adjType)}>
                  <option value="">Select…</option>
                  {ADJ_TYPES.map(t => <option key={t} value={t}>{humanise(t)}</option>)}
                </select>
                {errors.adjType && <p className="text-xs text-red-600 mt-1">{errors.adjType}</p>}
              </Field>
              <div className="sm:col-span-2">
                <Field label="Adjustment Notes">
                  <textarea rows={3} value={adjNotes} onChange={e => setAdjNotes(e.target.value)}
                    placeholder="Describe what was adjusted and how…"
                    className={`${inputCls(false)} resize-none`} />
                </Field>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Section 6: As-Left readings (only if adjusted) ─── */}
      {adjustmentMade && (
        <SectionCard title="As-Left Readings">
          <p className="text-xs text-slate-500 mb-3">
            Record instrument readings after adjustment. These confirm the instrument is within tolerance after servicing.
          </p>
          <TestPointsTable
            instrument={instrument}
            readings={asLeftReadings}
            onChange={updateAsLeft}
            label="As-Left Output"
          />
        </SectionCard>
      )}

      {/* ── Section 7: Notes ─── */}
      <SectionCard title="Notes & Disposition">
        <div className="space-y-4">
          <Field label="General Notes">
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional observations, comments, or findings…"
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectFound}
                  onChange={e => { setDefectFound(e.target.checked); if (!e.target.checked) setDefectDescription('') }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Defect found during calibration</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={returnedToService}
                  onChange={e => setReturnedToService(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Instrument returned to service</span>
              </label>
            </div>

            {defectFound && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Defect Description <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  rows={3}
                  value={defectDescription}
                  onChange={e => setDefectDescription(e.target.value)}
                  placeholder="Describe the defect found…"
                  className={`${inputCls(false)} resize-none border-red-200 bg-red-50`}
                />
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Section 8: Summary & actions ─── */}
      <SectionCard title="Summary">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="font-semibold text-slate-700">{fmtDate(calDate)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Technician</p>
              <p className="font-semibold text-slate-700">{selectedTech?.display_name || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">As-Found Result</p>
              <p className={`font-bold uppercase ${RESULT_COLORS[asFoundCalc.overall] ?? 'text-slate-400'}`}>
                {asFoundCalc.overall ?? 'Incomplete'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Max Error</p>
              <p className="font-semibold text-slate-700">
                {asFoundCalc.maxErr != null ? fmtPct(asFoundCalc.maxErr, 2) : '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <Link
              to={`/app/instruments/${instrumentId}`}
              className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(true)}
                disabled={saving || saved}
                className="px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || saved}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saved ? 'Submitted ✓' : saving ? 'Saving…' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

    </div>
  )
}
