import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, signOut, ROLES, DEMO_SITE } from '../utils/userContext'

// ── Role colours ──────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  admin:      'bg-purple-100 text-purple-700',
  supervisor: 'bg-blue-100 text-blue-700',
  technician: 'bg-green-100 text-green-700',
  planner:    'bg-amber-100 text-amber-700',
  readonly:   'bg-slate-100 text-slate-600',
}

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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUserState] = useState(() => getUser())

  const isDemo = user?.siteName?.toLowerCase() === DEMO_SITE.toLowerCase()

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
        <p className="text-sm text-slate-500 mt-1">Your account details and session information.</p>
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Site</h2>
        </div>
        <div className="px-5 py-5 flex items-center gap-4">
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
      </div>

      {/* ── Profile card ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Profile</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
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
            To update your name or role, contact your site administrator.
          </p>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Session</h2>
        </div>
        <div className="px-5 py-5 flex items-center justify-between">
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
      </div>

    </div>
  )
}
