import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getUser, setUser, signOut,
  getSiteMembers, saveMember,
  ROLES, DEMO_SITE,
} from '../utils/userContext'

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

// ── Icons ────────────────────────────────────────────────────────────────────

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
  const [members, setMembers] = useState([])

  // Edit own profile
  const [editingName, setEditingName] = useState(false)
  const [newName,     setNewName]     = useState('')
  const [newRole,     setNewRole]     = useState('')
  const [nameErr,     setNameErr]     = useState('')

  // Add team member
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberName,    setMemberName]    = useState('')
  const [memberRole,    setMemberRole]    = useState('technician')
  const [memberErr,     setMemberErr]     = useState('')
  const [addSuccess,    setAddSuccess]    = useState('')

  const isDemo = user?.siteName?.toLowerCase() === DEMO_SITE.toLowerCase()

  useEffect(() => {
    function onUserChange(e) {
      setUserState(e.detail)
    }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  useEffect(() => {
    if (user?.siteName) {
      setMembers(getSiteMembers(user.siteName))
    }
  }, [user])

  function refreshMembers() {
    if (user?.siteName) setMembers(getSiteMembers(user.siteName))
  }

  // ── Save own profile edits ────────────────────────────────────────────────
  function handleSaveProfile() {
    const trimmed = newName.trim()
    if (!trimmed) { setNameErr('Name is required'); return }
    saveMember(user.siteName, trimmed, newRole)
    const updated = { ...user, userName: trimmed, role: newRole }
    setUser(updated)
    setUserState(updated)
    setEditingName(false)
    setNameErr('')
    refreshMembers()
  }

  function startEditProfile() {
    setNewName(user?.userName ?? '')
    setNewRole(user?.role ?? 'technician')
    setEditingName(true)
  }

  // ── Add team member ───────────────────────────────────────────────────────
  function handleAddMember() {
    const trimmed = memberName.trim()
    if (!trimmed) { setMemberErr('Name is required'); return }
    const existing = members.find(m => m.userName.toLowerCase() === trimmed.toLowerCase())
    if (existing) { setMemberErr('A member with that name already exists'); return }
    saveMember(user.siteName, trimmed, memberRole)
    setMemberErr('')
    setMemberName('')
    setMemberRole('technician')
    setShowAddMember(false)
    setAddSuccess(`${trimmed} has been added to ${user.siteName}.`)
    setTimeout(() => setAddSuccess(''), 4000)
    refreshMembers()
  }

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
        <h1 className="text-2xl font-bold text-slate-800">Profile & Team</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile and the members of your site.
        </p>
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
              The Demo site is public — anyone can access it. To set up your own private, password-protected site,{' '}
              <button
                onClick={() => navigate('/contact')}
                className="underline font-medium hover:text-amber-900"
              >
                get in touch
              </button>{' '}
              or sign in with a new site name from the app header.
            </p>
          </div>
        </div>
      )}

      {/* Success toast */}
      {addSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800 font-medium">
          ✓ {addSuccess}
        </div>
      )}

      {/* ── Site card ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
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
            <p className="text-sm text-slate-400">
              {members.length} team member{members.length !== 1 ? 's' : ''} registered on this device
            </p>
          </div>
        </div>
      </div>

      {/* ── Your profile card ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Profile</h2>
          {!editingName && (
            <button
              onClick={startEditProfile}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {editingName ? (
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setNameErr('') }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameErr ? 'border-red-400' : 'border-slate-200'
                }`}
                autoFocus
              />
              {nameErr && <p className="text-xs text-red-600 mt-1">{nameErr}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => { setEditingName(false); setNameErr('') }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
              <IconUser />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">{user.userName}</p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Team members card ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Everyone who has signed into <strong>{user.siteName}</strong> on this device
            </p>
          </div>
          {!isDemo && !showAddMember && (
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Member
            </button>
          )}
        </div>

        {/* Add member form */}
        {showAddMember && (
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 space-y-3">
            <p className="text-sm font-medium text-slate-700">Add a new team member</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={memberName}
                  onChange={e => { setMemberName(e.target.value); setMemberErr('') }}
                  placeholder="Full name"
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    memberErr ? 'border-red-400' : 'border-slate-200'
                  }`}
                  autoFocus
                />
              </div>
              <select
                value={memberRole}
                onChange={e => setMemberRole(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {memberErr && <p className="text-xs text-red-600">{memberErr}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={() => { setShowAddMember(false); setMemberName(''); setMemberErr('') }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        {members.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            No members registered yet. Members are added automatically when they sign in.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(member => (
              <div
                key={member.userName}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  member.userName === user.userName ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <IconUser />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {member.userName}
                      {member.userName === user.userName && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">you</span>
                      )}
                    </p>
                  </div>
                </div>
                <RoleBadge role={member.role} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sign out ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Session</h2>
        </div>
        <div className="px-5 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Sign out of {user.siteName}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              You will be returned to the homepage. Your data is not affected.
            </p>
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
