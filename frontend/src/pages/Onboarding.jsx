/**
 * Onboarding — 3-step welcome wizard for new sites.
 *
 * Step 1: Confirm site details (industry, timezone)
 * Step 2: Add first instruments (CSV import or manual)
 * Step 3: Invite first team member
 *
 * All steps are skippable. Progress is visual via a stepper bar.
 */

import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getUser } from '../utils/userContext'
import { instruments as instrApi, auth as authApi } from '../utils/api'

// ── Colours ──────────────────────────────────────────────────────────────────
const NAVY  = '#0B1F3A'
const BLUE  = '#1565C0'
const SKY   = '#2196F3'
const GREEN = '#22C55E'
const MUTED = '#5A6B7B'

// ── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }) {
  const steps = [
    { num: 1, label: 'Site Setup' },
    { num: 2, label: 'Add Instruments' },
    { num: 3, label: 'Invite Team' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => {
        const done = current > s.num
        const active = current === s.num
        return (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem',
                background: done ? GREEN : active ? BLUE : '#e2e8f0',
                color: done || active ? '#fff' : MUTED,
                transition: 'all 0.3s ease',
              }}>
                {done ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                color: active ? NAVY : MUTED, marginTop: 6,
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 60, height: 2, margin: '0 4px',
                background: done ? GREEN : '#e2e8f0',
                borderRadius: 1, transition: 'background 0.3s',
                alignSelf: 'flex-start', marginTop: 17,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Site Setup ───────────────────────────────────────────────────────

function StepSiteSetup({ onNext, onSkip }) {
  const user = getUser()
  const [industry, setIndustry] = useState('')
  const [timezone, setTimezone] = useState('Australia/Sydney')

  const industries = [
    'Water & Wastewater',
    'Mining & Resources',
    'Oil & Gas',
    'Food & Beverage',
    'Pharmaceutical',
    'Chemical Processing',
    'Power Generation',
    'Manufacturing',
    'Other',
  ]

  const timezones = [
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Australia/Hobart',
  ]

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏭</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: NAVY, marginBottom: 8 }}>
          Welcome to CalCheq, {user?.userName || 'there'}!
        </h2>
        <p style={{ color: MUTED, fontSize: '0.9rem' }}>
          Tell us a bit about your site so we can tailor your experience.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px 28px' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Company / Site
          </label>
          <div style={{
            padding: '10px 14px', background: '#f8fafc', borderRadius: 8,
            border: '1px solid #e2e8f0', color: NAVY, fontWeight: 600, fontSize: '0.9rem',
          }}>
            {user?.siteName || '—'}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Industry
          </label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: '0.9rem', color: NAVY,
              background: '#fff', cursor: 'pointer',
            }}
          >
            <option value="">Select your industry…</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Timezone
          </label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: '0.9rem', color: NAVY,
              background: '#fff', cursor: 'pointer',
            }}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz.replace('Australia/', '')}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onSkip}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0',
              background: '#fff', color: MUTED, fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 2, padding: '12px', borderRadius: 10, border: 'none',
              background: BLUE, color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Add Instruments ──────────────────────────────────────────────────

function StepAddInstruments({ onNext, onSkip }) {
  const [mode, setMode] = useState(null)  // null, 'csv', 'manual'
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  // Manual entry state (3 quick instruments)
  const emptyInstr = { tag_number: '', description: '', area: '', instrument_type: 'pressure', calibration_interval_days: 365 }
  const [manualRows, setManualRows] = useState([{ ...emptyInstr }])

  function updateRow(idx, field, value) {
    setManualRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }
  function addRow() {
    if (manualRows.length < 5) setManualRows(prev => [...prev, { ...emptyInstr }])
  }
  function removeRow(idx) {
    setManualRows(prev => prev.filter((_, i) => i !== idx))
  }

  async function saveManual() {
    setError('')
    const valid = manualRows.filter(r => r.tag_number.trim() && r.description.trim())
    if (valid.length === 0) {
      setError('Enter at least one instrument with a tag number and description.')
      return
    }
    setSaving(true)
    try {
      for (const row of valid) {
        await instrApi.create({
          tag_number: row.tag_number.trim(),
          description: row.description.trim(),
          area: row.area.trim() || 'General',
          instrument_type: row.instrument_type,
          calibration_interval_days: Number(row.calibration_interval_days) || 365,
          status: 'active',
          criticality: 'standard',
          tolerance_type: 'percent_span',
          tolerance_value: 1.0,
          num_test_points: 5,
        })
      }
      setSuccess(`${valid.length} instrument${valid.length > 1 ? 's' : ''} added!`)
      setTimeout(onNext, 1200)
    } catch (err) {
      setError(err.detail || err.message || 'Failed to save instruments.')
    } finally {
      setSaving(false)
    }
  }

  const instrTypes = ['pressure', 'temperature', 'flow', 'level', 'analyser', 'ph', 'conductivity', 'switch', 'valve', 'other']

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔧</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: NAVY, marginBottom: 8 }}>
          Add Your First Instruments
        </h2>
        <p style={{ color: MUTED, fontSize: '0.9rem' }}>
          Import your instrument register to see CalCheq in action with your real data.
        </p>
      </div>

      {!mode && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => setMode('csv')}
            style={{
              background: '#fff', borderRadius: 16, border: '2px solid #e2e8f0',
              padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = SKY}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>📥</div>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Import CSV</div>
            <div style={{ fontSize: '0.8rem', color: MUTED }}>Upload an Excel or CSV file with your instrument data</div>
          </button>
          <button
            onClick={() => setMode('manual')}
            style={{
              background: '#fff', borderRadius: 16, border: '2px solid #e2e8f0',
              padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = SKY}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>✏️</div>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Add Manually</div>
            <div style={{ fontSize: '0.8rem', color: MUTED }}>Enter a few instruments by hand to get started</div>
          </button>
        </div>
      )}

      {mode === 'csv' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ color: MUTED, fontSize: '0.9rem', marginBottom: 20 }}>
            Our CSV import wizard handles Excel, CSV, and Beamex/Fluke exports.
          </p>
          <Link
            to="/app/import"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: 10,
              background: BLUE, color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            Open Import Wizard →
          </Link>
          <p style={{ color: MUTED, fontSize: '0.8rem', marginTop: 16 }}>
            You'll return here after the import completes.
          </p>
        </div>
      )}

      {mode === 'manual' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 20px' }}>
          {manualRows.map((row, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr 1fr auto',
              gap: 8, marginBottom: 12, alignItems: 'end',
            }}>
              <div>
                {idx === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: 4 }}>Tag #</label>}
                <input
                  value={row.tag_number}
                  onChange={e => updateRow(idx, 'tag_number', e.target.value)}
                  placeholder="PT-001"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                {idx === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: 4 }}>Description</label>}
                <input
                  value={row.description}
                  onChange={e => updateRow(idx, 'description', e.target.value)}
                  placeholder="Suction pressure transmitter"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                {idx === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: 4 }}>Area</label>}
                <input
                  value={row.area}
                  onChange={e => updateRow(idx, 'area', e.target.value)}
                  placeholder="Plant"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                {idx === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: 4 }}>Type</label>}
                <select
                  value={row.instrument_type}
                  onChange={e => updateRow(idx, 'instrument_type', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff' }}
                >
                  {instrTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                {idx === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: 4 }}>&nbsp;</label>}
                {manualRows.length > 1 && (
                  <button
                    onClick={() => removeRow(idx)}
                    style={{ padding: '8px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                  >×</button>
                )}
              </div>
            </div>
          ))}

          {manualRows.length < 5 && (
            <button onClick={addRow} style={{
              display: 'block', width: '100%', padding: '10px', borderRadius: 8,
              border: '1px dashed #e2e8f0', background: 'transparent', color: SKY,
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: 16,
            }}>
              + Add another instrument
            </button>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
          {success && <p style={{ color: GREEN, fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{success}</p>}

          <button
            onClick={saveManual}
            disabled={saving}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: BLUE, color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save & Continue →'}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {mode && (
          <button onClick={() => setMode(null)} style={{
            background: 'none', border: 'none', color: MUTED, fontSize: '0.85rem',
            cursor: 'pointer', marginRight: 16,
          }}>
            ← Back
          </button>
        )}
        <button onClick={onSkip} style={{
          background: 'none', border: 'none', color: MUTED, fontSize: '0.85rem',
          cursor: 'pointer', textDecoration: 'underline',
        }}>
          Skip for now — I'll add instruments later
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Invite Team ──────────────────────────────────────────────────────

function StepInviteTeam({ onNext, onSkip }) {
  const [email, setEmail]           = useState('')
  const [name, setName]             = useState('')
  const [role, setRole]             = useState('technician')
  const [password, setPassword]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const roles = [
    { value: 'technician', label: 'Technician', desc: 'Can enter and submit calibrations' },
    { value: 'supervisor', label: 'Supervisor', desc: 'Can approve or reject submitted records' },
    { value: 'planner',    label: 'Planner',    desc: 'Can edit calibration schedules' },
    { value: 'readonly',   label: 'Read-only',  desc: 'View access only' },
    { value: 'admin',      label: 'Admin',      desc: 'Full access including team management' },
  ]

  async function handleInvite() {
    setError('')
    if (!email.trim() || !name.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      await authApi.inviteMember({
        email: email.trim(),
        display_name: name.trim(),
        role,
        temp_password: password,
      })
      setSuccess(`Invite sent to ${email}!`)
      setTimeout(onNext, 1200)
    } catch (err) {
      setError(err.detail || err.message || 'Failed to send invite.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: NAVY, marginBottom: 8 }}>
          Invite Your First Team Member
        </h2>
        <p style={{ color: MUTED, fontSize: '0.9rem' }}>
          CalCheq works best with your whole team. You can always add more from Settings.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px 28px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jake Williams"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jake@company.com"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', background: '#fff' }}
          >
            {roles.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Temporary Password
          </label>
          <input
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
          <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 4 }}>
            They'll receive an email with these login details.
          </p>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: GREEN, fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{success}</p>}

        <button
          onClick={handleInvite}
          disabled={saving}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: BLUE, color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Sending invite…' : 'Send Invite & Finish →'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={onSkip} style={{
          background: 'none', border: 'none', color: MUTED, fontSize: '0.85rem',
          cursor: 'pointer', textDecoration: 'underline',
        }}>
          Skip — I'll invite team members later
        </button>
      </div>
    </div>
  )
}

// ── Completion ───────────────────────────────────────────────────────────────

function StepComplete() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: '2.2rem',
      }}>
        🎉
      </div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: NAVY, marginBottom: 12 }}>
        You're all set!
      </h2>
      <p style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
        Your CalCheq workspace is ready. Head to the dashboard to see your instrument health overview, or add more instruments from the register.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/app')}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: BLUE, color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
        <Link
          to="/app/instruments"
          style={{
            padding: '12px 28px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: NAVY, fontWeight: 600, fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          View Instruments
        </Link>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(1)

  const next = useCallback(() => setStep(s => Math.min(s + 1, 4)), [])
  const skip = useCallback(() => setStep(s => Math.min(s + 1, 4)), [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F7FC 0%, #E8EEF7 100%)',
      padding: '60px 20px',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/assets/calcheq-logo-light.svg"
            alt="CalCheq"
            style={{ height: 48, width: 'auto' }}
          />
        </div>

        {step <= 3 && <Stepper current={step} />}

        {step === 1 && <StepSiteSetup onNext={next} onSkip={skip} />}
        {step === 2 && <StepAddInstruments onNext={next} onSkip={skip} />}
        {step === 3 && <StepInviteTeam onNext={next} onSkip={skip} />}
        {step === 4 && <StepComplete />}
      </div>
    </div>
  )
}
