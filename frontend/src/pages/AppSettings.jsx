/**
 * AppSettings — site, profile, password, team members, sign-out.
 * Replaces the old /app/profile route. All tabs in one place.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getUser, signOut, ROLES, DEMO_SITE } from '../utils/userContext'
import { supabase } from '../utils/supabase'
import { auth as authApi, billing as billingApi } from '../utils/api'
import { isNative } from '../utils/platform'
import {
  isBiometricAvailable,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  getBiometryName,
} from '../utils/biometricLock'

// ── Role colours ──────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  admin:      'bg-purple-100 text-purple-700',
  supervisor: 'bg-blue-100 text-blue-700',
  technician: 'bg-green-100 text-green-700',
  planner:    'bg-amber-100 text-amber-700',
  readonly:   'bg-slate-100 text-slate-600',
}

const INVITE_ROLES = [
  { value: 'technician',  label: 'Technician',  desc: 'Can enter and submit calibration records' },
  { value: 'supervisor',  label: 'Supervisor',   desc: 'Can approve or reject submitted records' },
  { value: 'planner',     label: 'Planner',      desc: 'Can edit calibration schedules' },
  { value: 'readonly',    label: 'Read-only',    desc: 'View access only' },
  { value: 'admin',       label: 'Admin',        desc: 'Full access including team management' },
]

// ── Small helpers ─────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const label = ROLES.find(r => r.value === role)?.label ?? role
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  )
}

function Card({ title, emoji, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function InlineAlert({ type, message, onDismiss }) {
  const cls = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'
  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${cls}`}>
      <span className="flex-1">{message}</span>
      {onDismiss && <button onClick={onDismiss} className="opacity-60 hover:opacity-100 ml-2 flex-shrink-0 text-xs">✕</button>}
    </div>
  )
}

// ── Section: Profile info ─────────────────────────────────────────────────────

function ProfileSection({ user }) {
  return (
    <Card title="Your Profile" emoji="👤">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xl font-bold">
            {(user.userName ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{user.userName}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="mt-1.5"><RoleBadge role={user.role} /></div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Display Name</p>
            <p className="text-slate-800 font-medium">{user.userName || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-slate-800">{user.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Role</p>
            <RoleBadge role={user.role} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Site</p>
            <p className="text-slate-800 font-medium">{user.siteName || '—'}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          {user.role === 'admin'
            ? 'As an admin, you can manage team members and roles in the Team Members section below.'
            : 'To update your display name or role, contact your site administrator.'}
        </p>
      </div>
    </Card>
  )
}

// ── Section: Security (biometric unlock — native only) ───────────────────────

function SecuritySection() {
  const [available, setAvailable] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [biometryName, setBiometryName] = useState('Biometric')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!isNative()) return
    let cancelled = false
    Promise.all([isBiometricAvailable(), isBiometricEnabled(), getBiometryName()])
      .then(([avail, en, name]) => {
        if (cancelled) return
        setAvailable(avail)
        setEnabled(en)
        setBiometryName(name)
      })
    return () => { cancelled = true }
  }, [])

  if (!isNative() || !available) return null

  async function handleToggle() {
    if (busy) return
    setBusy(true)
    setMsg(null)
    try {
      if (enabled) {
        await disableBiometric()
        setEnabled(false)
        setMsg({ type: 'success', text: `${biometryName} unlock disabled.` })
      } else {
        const ok = await enableBiometric()
        if (ok) {
          setEnabled(true)
          setMsg({ type: 'success', text: `${biometryName} unlock enabled. You'll be prompted on app resume.` })
        } else {
          setMsg({ type: 'error', text: `${biometryName} prompt was cancelled or failed.` })
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Security" emoji="🔒">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Unlock with {biometryName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Re-prompt {biometryName} every time the app comes back to the foreground.
            You can still sign out from the lock screen.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          aria-pressed={enabled}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform mt-0.5 ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
      </div>
      {msg && (
        <div className="mt-3">
          <InlineAlert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />
        </div>
      )}
    </Card>
  )
}

// ── Section: Change password ──────────────────────────────────────────────────

function PasswordSection({ isDemo }) {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState(null)

  if (isDemo) {
    return (
      <Card title="Change Password" emoji="🔑">
        <p className="text-sm text-slate-500">Password changes are not available on the Demo account.</p>
      </Card>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (next !== confirm) { setMsg({ type: 'error', text: 'New passwords do not match.' }); return }
    if (next.length < 8)  { setMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('No authenticated user.')
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current })
      if (signInErr) throw new Error('Current password is incorrect.')
      const { error: updateErr } = await supabase.auth.updateUser({ password: next })
      if (updateErr) throw new Error(updateErr.message)
      setMsg({ type: 'success', text: 'Password changed successfully.' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Change Password" emoji="🔑">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {msg && <InlineAlert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}
        {[
          { label: 'Current Password', val: current, set: setCurrent, auto: 'current-password' },
          { label: 'New Password',     val: next,    set: setNext,    auto: 'new-password' },
          { label: 'Confirm New',      val: confirm, set: setConfirm, auto: 'new-password' },
        ].map(({ label, val, set, auto }) => (
          <div key={label}>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</label>
            <input type="password" value={val} onChange={e => set(e.target.value)} required minLength={auto === 'current-password' ? 1 : 8}
              autoComplete={auto}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <button type="submit" disabled={saving || !current || !next || !confirm}
          className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </Card>
  )
}

// ── Section: Team members ─────────────────────────────────────────────────────

function TeamSection({ currentUserId, isDemo }) {
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [msg,        setMsg]        = useState(null)
  const [invEmail,   setInvEmail]   = useState('')
  const [invName,    setInvName]    = useState('')
  const [invRole,    setInvRole]    = useState('technician')
  const [invPwd,     setInvPwd]     = useState('')
  const [inviting,   setInviting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setMembers(await authApi.listMembers()) }
    catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function generatePwd() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
    setInvPwd(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
  }

  async function handleInvite(e) {
    e.preventDefault(); setMsg(null)
    if (invPwd.length < 8) { setMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return }
    setInviting(true)
    try {
      await authApi.inviteMember({ email: invEmail, display_name: invName, role: invRole, temp_password: invPwd })
      setMsg({ type: 'success', text: `Invite sent to ${invEmail}.` })
      setShowInvite(false); setInvEmail(''); setInvName(''); setInvRole('technician'); setInvPwd('')
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setInviting(false) }
  }

  return (
    <Card title="Team Members" emoji="👥">
      <div className="space-y-4">
        {msg && <InlineAlert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}

        {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Name','Email','Role','Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(m => (
                  <tr key={m.id} className={m.user_id === currentUserId ? 'bg-blue-50/40' : ''}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {m.display_name || '—'}
                      {m.user_id === currentUserId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">you</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{m.email || '—'}</td>
                    <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isDemo && !showInvite && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ➕ Invite Team Member
          </button>
        )}

        {showInvite && (
          <div className="border border-blue-200 rounded-xl bg-blue-50/30 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Invite a new team member</h3>
            <p className="text-xs text-slate-500">An account will be created and login details emailed. Ask them to change their password after first sign-in.</p>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                  <input type="text" value={invName} onChange={e => setInvName(e.target.value)} required placeholder="e.g. Sarah Mitchell"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</label>
                  <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INVITE_ROLES.map(r => (
                    <label key={r.value} className={`flex items-start gap-3 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                      invRole === r.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="radio" name="role" value={r.value} checked={invRole === r.value}
                        onChange={() => setInvRole(r.value)} className="mt-0.5 accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.label}</p>
                        <p className="text-xs text-slate-500">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Temporary Password</label>
                <div className="flex gap-2">
                  <input type="text" value={invPwd} onChange={e => setInvPwd(e.target.value)} required minLength={8}
                    placeholder="Min. 8 characters"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={generatePwd}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={inviting}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {inviting ? 'Sending…' : '✉ Send Invite'}
                </button>
                <button type="button" onClick={() => { setShowInvite(false); setMsg(null) }}
                  className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Section: Billing ─────────────────────────────────────────────────────────

const PLAN_DETAILS = {
  starter:      { label: 'Starter',       monthlyPrice: 199,  yearlyPrice: 1990,  color: 'bg-slate-100 text-slate-700' },
  professional: { label: 'Professional',  monthlyPrice: 449,  yearlyPrice: 4490,  color: 'bg-blue-100 text-blue-700' },
  enterprise:   { label: 'Enterprise',    monthlyPrice: 899,  yearlyPrice: 8990,  color: 'bg-purple-100 text-purple-700' },
}

function BillingSection({ isDemo }) {
  const [sub, setSub]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [selectedInterval, setSelectedInterval] = useState('month')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    billingApi.subscription()
      .then(data => setSub(data))
      .catch(() => setSub(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleCheckout() {
    setActionLoading(true); setMsg(null)
    try {
      const { url } = await billingApi.createCheckout(selectedPlan, selectedInterval)
      if (url) window.location.href = url
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to start checkout.' })
    } finally { setActionLoading(false) }
  }

  async function handlePortal() {
    setActionLoading(true); setMsg(null)
    try {
      const { url } = await billingApi.createPortal()
      if (url) window.location.href = url
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to open billing portal.' })
    } finally { setActionLoading(false) }
  }

  if (isDemo) {
    return (
      <Card title="Billing & Subscription" emoji="💳">
        <p className="text-sm text-slate-500">Billing is not available on the Demo account. Sign up for your own site to manage subscriptions.</p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card title="Billing & Subscription" emoji="💳">
        <p className="text-sm text-slate-400">Loading billing info…</p>
      </Card>
    )
  }

  const plan = sub?.subscription_plan ? PLAN_DETAILS[sub.subscription_plan] : null
  const status = sub?.subscription_status || 'trialing'
  const isActive = status === 'active' || status === 'trialing'

  const STATUS_LABELS = {
    active: { text: 'Active', cls: 'bg-green-100 text-green-700' },
    trialing: { text: 'Free Trial', cls: 'bg-blue-100 text-blue-700' },
    past_due: { text: 'Past Due', cls: 'bg-red-100 text-red-700' },
    cancelled: { text: 'Cancelled', cls: 'bg-slate-100 text-slate-600' },
    incomplete: { text: 'Incomplete', cls: 'bg-amber-100 text-amber-700' },
  }
  const statusBadge = STATUS_LABELS[status] || { text: status, cls: 'bg-slate-100 text-slate-600' }

  return (
    <Card title="Billing & Subscription" emoji="💳">
      <div className="space-y-5">
        {msg && <InlineAlert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}

        {/* Current plan summary */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge.cls}`}>{statusBadge.text}</span>
            {plan && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.color}`}>{plan.label}</span>
            )}
            {sub?.subscription_interval && (
              <span className="text-xs text-slate-400">{sub.subscription_interval === 'year' ? 'Annual' : 'Monthly'} billing</span>
            )}
          </div>
        </div>

        {/* Trial / period info */}
        {status === 'trialing' && sub?.trial_ends_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            Your free trial ends on{' '}
            <strong>{new Date(sub.trial_ends_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
            Choose a plan below to continue after your trial.
          </div>
        )}

        {status === 'past_due' && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
            Your last payment failed. Please update your payment method to keep your account active.
          </div>
        )}

        {status === 'active' && sub?.current_period_end && (
          <p className="text-sm text-slate-500">
            Next billing date:{' '}
            <strong>{new Date(sub.current_period_end).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
        )}

        {/* Actions: manage existing or choose a plan */}
        {sub?.has_subscription ? (
          <button onClick={handlePortal} disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {actionLoading ? 'Opening…' : '💳 Manage Subscription'}
          </button>
        ) : (
          <>
            {!showPlans ? (
              <button onClick={() => setShowPlans(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ background: '#F57C00' }}
                onMouseEnter={e => e.target.style.background = '#FFA000'}
                onMouseLeave={e => e.target.style.background = '#F57C00'}>
                Choose a Plan
              </button>
            ) : (
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                {/* Interval toggle */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 w-fit">
                  {['month', 'year'].map(iv => (
                    <button key={iv} onClick={() => setSelectedInterval(iv)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        selectedInterval === iv ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}>
                      {iv === 'month' ? 'Monthly' : 'Annual'}
                      {iv === 'year' && <span className="ml-1.5 text-xs text-green-600 font-semibold">Save 17%</span>}
                    </button>
                  ))}
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(PLAN_DETAILS).map(([key, p]) => {
                    const price = selectedInterval === 'year' ? p.yearlyPrice : p.monthlyPrice
                    const perMonth = selectedInterval === 'year' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice
                    return (
                      <button key={key} onClick={() => setSelectedPlan(key)}
                        className={`text-left border rounded-xl p-4 transition-colors ${
                          selectedPlan === key
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <p className="text-sm font-bold text-slate-800">{p.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          ${perMonth}<span className="text-sm font-normal text-slate-400">/mo</span>
                        </p>
                        {selectedInterval === 'year' && (
                          <p className="text-xs text-slate-400 mt-0.5">Billed ${price}/year</p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Subscribe button */}
                <div className="flex items-center gap-3">
                  <button onClick={handleCheckout} disabled={actionLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors"
                    style={{ background: '#F57C00' }}
                    onMouseEnter={e => e.target.style.background = '#FFA000'}
                    onMouseLeave={e => e.target.style.background = '#F57C00'}>
                    {actionLoading ? 'Redirecting to Stripe…' : `Subscribe to ${PLAN_DETAILS[selectedPlan].label}`}
                  </button>
                  <button onClick={() => setShowPlans(false)}
                    className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-400">30-day free trial included. No charge until the trial ends. Cancel anytime.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AppSettings() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, setUserState] = useState(() => getUser())
  const [billingMsg, setBillingMsg] = useState(null)

  useEffect(() => {
    function onUserChange(e) { setUserState(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  // Handle Stripe redirect query params
  useEffect(() => {
    const billingResult = searchParams.get('billing')
    if (billingResult === 'success') {
      setBillingMsg({ type: 'success', text: 'Subscription activated! Welcome to CalCheq.' })
      searchParams.delete('billing'); searchParams.delete('session_id')
      setSearchParams(searchParams, { replace: true })
    } else if (billingResult === 'cancelled') {
      setBillingMsg({ type: 'error', text: 'Checkout was cancelled. No charges were made.' })
      searchParams.delete('billing')
      setSearchParams(searchParams, { replace: true })
    } else if (billingResult === 'required') {
      setBillingMsg({ type: 'error', text: 'Your subscription is inactive. Please choose a plan to continue using CalCheq.' })
      searchParams.delete('billing')
      setSearchParams(searchParams, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isDemo  = user?.siteName?.toLowerCase() === DEMO_SITE.toLowerCase()
  const isAdmin = user?.role === 'admin'

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-slate-500 mb-4">You are not signed in.</p>
        <button onClick={() => navigate('/app')}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, password, and team.</p>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Demo site — read-only</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Profile changes are not available in the Demo.{' '}
              <button onClick={() => navigate('/contact')} className="underline font-medium hover:text-amber-900">Get in touch</button>{' '}
              to set up your own site.
            </p>
          </div>
        </div>
      )}

      {/* Billing redirect message */}
      {billingMsg && (
        <InlineAlert type={billingMsg.type} message={billingMsg.text} onDismiss={() => setBillingMsg(null)} />
      )}

      {/* Site card */}
      <Card title="Site" emoji="🏢">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">🏭</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{user.siteName}</p>
            <p className="text-sm text-slate-400">Your organisation site</p>
          </div>
        </div>
      </Card>

      <ProfileSection user={user} />
      <PasswordSection isDemo={isDemo} />
      <SecuritySection />
      {isAdmin && <TeamSection currentUserId={user.userId} isDemo={isDemo} />}
      {isAdmin && <BillingSection isDemo={isDemo} />}

      {/* Sign out */}
      <Card title="Session" emoji="🚪">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Sign out of {user.siteName}</p>
            <p className="text-xs text-slate-400 mt-0.5">You will be returned to the homepage. Your data is not affected.</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
          >
            🚪 Sign Out
          </button>
        </div>
      </Card>

    </div>
  )
}
