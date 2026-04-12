import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, signOut, ROLES, DEMO_SITE } from '../utils/userContext'
import { supabase } from '../utils/supabase'
import { auth as authApi } from '../utils/api'

// ── Colour constants ──────────────────────────────────────────────────────────

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

// ── Small components ──────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const label = ROLES.find(r => r.value === role)?.label ?? role
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  )
}

function IconUser() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  )
}

function Alert({ type, message, onDismiss }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error:   'bg-red-50   border-red-200   text-red-700',
  }
  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 ml-2 flex-shrink-0">✕</button>
      )}
    </div>
  )
}

// ── Password Change section ───────────────────────────────────────────────────

function ChangePasswordSection({ isDemo }) {
  const [current, setCurrent]   = useState('')
  const [next,    setNext]      = useState('')
  const [confirm, setConfirm]   = useState('')
  const [saving,  setSaving]    = useState(false)
  const [msg,     setMsg]       = useState(null) // { type, text }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (next !== confirm) { setMsg({ type: 'error', text: 'New passwords do not match.' }); return }
    if (next.length < 8)  { setMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return }

    setSaving(true)
    try {
      // Re-authenticate with current password first to confirm identity
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('No authenticated user.')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    user.email,
        password: current,
      })
      if (signInError) throw new Error('Current password is incorrect.')

      const { error: updateError } = await supabase.auth.updateUser({ password: next })
      if (updateError) throw new Error(updateError.message)

      setMsg({ type: 'success', text: 'Password changed successfully.' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (isDemo) {
    return (
      <p className="text-sm text-slate-500">Password changes are not available on the Demo account.</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {msg && <Alert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Current Password</label>
        <input
          type="password" value={current} onChange={e => setCurrent(e.target.value)}
          required autoComplete="current-password"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">New Password</label>
        <input
          type="password" value={next} onChange={e => setNext(e.target.value)}
          required autoComplete="new-password" minLength={8}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Confirm New Password</label>
        <input
          type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          required autoComplete="new-password"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit" disabled={saving || !current || !next || !confirm}
        className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Change Password'}
      </button>
    </form>
  )
}

// ── Team Members section ──────────────────────────────────────────────────────

function TeamMembersSection({ currentUserId, isDemo }) {
  const [members, setMembers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [msg, setMsg]               = useState(null)

  // Invite form state
  const [invEmail,    setInvEmail]    = useState('')
  const [invName,     setInvName]     = useState('')
  const [invRole,     setInvRole]     = useState('technician')
  const [invPassword, setInvPassword] = useState('')
  const [inviting,    setInviting]    = useState(false)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authApi.listMembers()
      setMembers(data)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  async function handleInvite(e) {
    e.preventDefault()
    setMsg(null)
    if (isDemo) { setMsg({ type: 'error', text: 'Cannot invite members to the Demo site.' }); return }
    if (invPassword.length < 8) { setMsg({ type: 'error', text: 'Temporary password must be at least 8 characters.' }); return }
    setInviting(true)
    try {
      await authApi.inviteMember({
        email:         invEmail,
        display_name:  invName,
        role:          invRole,
        temp_password: invPassword,
      })
      setMsg({ type: 'success', text: `Invitation sent to ${invEmail}. They will receive login details by email.` })
      setShowInvite(false)
      setInvEmail(''); setInvName(''); setInvRole('technician'); setInvPassword('')
      loadMembers()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setInviting(false)
    }
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
    let p = ''
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)]
    setInvPassword(p)
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading team members…</p>
  }

  return (
    <div className="space-y-4">
      {msg && <Alert type={msg.type} message={msg.text} onDismiss={() => setMsg(null)} />}

      {/* Member list */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Name', 'Email', 'Role', 'Joined'].map(h => (
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
                <td className="px-4 py-3 text-slate-500">{m.email || '—'}</td>
                <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite button */}
      {!isDemo && !showInvite && (
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Invite Team Member
        </button>
      )}

      {/* Invite form */}
      {showInvite && (
        <div className="border border-blue-200 rounded-xl bg-blue-50/30 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Invite a new team member</h3>
          <p className="text-xs text-slate-500">
            An account will be created with the details below. The new user will receive an email with their login credentials. Ask them to change their password after first sign-in.
          </p>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text" value={invName} onChange={e => setInvName(e.target.value)}
                  required placeholder="e.g. Sarah Mitchell"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                  required placeholder="e.g. sarah@yourcompany.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INVITE_ROLES.map(r => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                      invRole === r.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio" name="role" value={r.value}
                      checked={invRole === r.value} onChange={() => setInvRole(r.value)}
                      className="mt-0.5 accent-blue-600"
                    />
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
                <input
                  type="text" value={invPassword} onChange={e => setInvPassword(e.target.value)}
                  required minLength={8} placeholder="Min. 8 characters"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button" onClick={generatePassword}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">This will be emailed to the new user. Ask them to change it after first sign-in.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit" disabled={inviting}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Sending invite…' : 'Send Invite'}
              </button>
              <button
                type="button" onClick={() => { setShowInvite(false); setMsg(null) }}
                className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUserState] = useState(() => getUser())

  const isDemo  = user?.siteName?.toLowerCase() === DEMO_SITE.toLowerCase()
  const isAdmin = user?.role === 'admin'

  // Keep in sync with Supabase auth state changes
  useEffect(() => {
    function onUserChange(e) { setUserState(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">You are not signed in.</p>
        <button
          onClick={() => navigate('/app')}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and team members.</p>
      </div>

      {/* Demo site banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">You are using the Demo site</p>
            <p className="text-sm text-amber-700 mt-0.5">
              The Demo site is read-only. To set up your own site,{' '}
              <button onClick={() => navigate('/contact')} className="underline font-medium hover:text-amber-900">
                get in touch
              </button>.
            </p>
          </div>
        </div>
      )}

      {/* ── Site card ── */}
      <SectionCard title="Site">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{user.siteName}</p>
            <p className="text-sm text-slate-400">Your organisation site</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Profile card ── */}
      <SectionCard title="Your Profile">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
              <IconUser />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">{user.userName}</p>
              <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Name</p>
              <p className="text-slate-800 font-medium">{user.userName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-slate-800">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Role</p>
              <RoleBadge role={user.role} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Site</p>
              <p className="text-slate-800 font-medium">{user.siteName}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-1">
            To update your display name or role, contact your site administrator.
          </p>
        </div>
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard title="Change Password">
        <ChangePasswordSection isDemo={isDemo} />
      </SectionCard>

      {/* ── Team Members (admin only) ── */}
      {isAdmin && (
        <SectionCard title="Team Members">
          <TeamMembersSection currentUserId={user.userId} isDemo={isDemo} />
        </SectionCard>
      )}

      {/* ── Sign out ── */}
      <SectionCard title="Session">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Sign out of {user.siteName}</p>
            <p className="text-xs text-slate-400 mt-0.5">You will be returned to the homepage. Your data is not affected.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </SectionCard>

    </div>
  )
}
