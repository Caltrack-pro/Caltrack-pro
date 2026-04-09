import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'
import { getUser, setUser, signOut, ROLES } from '../utils/userContext'
import SignInModal from './SignInModal'

// ---------------------------------------------------------------------------
// Derive page title from URL
// ---------------------------------------------------------------------------

function getPageTitle(pathname) {
  const STATIC = {
    '/app':             'Dashboard',
    '/app/instruments': 'Instruments',
    '/app/alerts':      'Alerts & Notifications',
    '/app/approvals':   'Pending Approvals',
    '/app/reports':     'Reports',
    '/app/bad-actors':  'Bad Actors',
    '/app/profile':     'Profile & Team',
  }
  if (STATIC[pathname]) return STATIC[pathname]
  if (pathname.startsWith('/app/calibrations/new/')) return 'New Calibration Record'
  if (pathname.match(/^\/app\/instruments\/[^/]+\/edit$/)) return 'Edit Instrument'
  if (pathname.match(/^\/app\/instruments\/[^/]+$/))       return 'Instrument Detail'
  if (pathname === '/app/instruments/new')                  return 'New Instrument'
  return 'CalTrack Pro'
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Role badge colours
// ---------------------------------------------------------------------------

const ROLE_COLORS = {
  admin:      'bg-purple-100 text-purple-700',
  supervisor: 'bg-blue-100 text-blue-700',
  technician: 'bg-green-100 text-green-700',
  planner:    'bg-amber-100 text-amber-700',
  readonly:   'bg-slate-100 text-slate-600',
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const REFRESH_MS = 5 * 60 * 1000

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [alertCount,  setAlertCount]  = useState(0)
  const [currentUser, setCurrentUser] = useState(() => getUser())
  const [showModal,   setShowModal]   = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Show sign-in modal on first load if no user is signed in
  useEffect(() => {
    if (!getUser()) setShowModal(true)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Re-sync user when caltrack-user-change fires
  useEffect(() => {
    function onUserChange(e) { setCurrentUser(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  // Alert badge count
  useEffect(() => {
    function fetchCount() {
      const site = getUser()?.siteName ?? null
      dashApi.alerts(site)
        .then(data => {
          const alerts = Array.isArray(data) ? data : (data.results ?? [])
          const critical = alerts.filter(a => {
            const t = a.alert_type ?? ''
            return t === 'OVERDUE' || t === 'FAILED' || t === 'CONSECUTIVE_FAILURES'
          }).length
          setAlertCount(critical)
        })
        .catch(() => {})
    }
    fetchCount()
    const id = setInterval(fetchCount, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  function handleSaveUser(user) {
    setUser(user)
    setCurrentUser(user)
  }

  function handleSignOut() {
    signOut()
    setCurrentUser(null)
    setShowDropdown(false)
    navigate('/')
  }

  const roleBadge = currentUser
    ? ROLE_COLORS[currentUser.role] ?? 'bg-slate-100 text-slate-600'
    : ''
  const roleLabel = currentUser
    ? (ROLES.find(r => r.value === currentUser.role)?.label ?? currentUser.role)
    : ''

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">

        {/* Hamburger (mobile) */}
        {onMenuClick && (
          <button onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}

        {/* Page title */}
        <h1 className="text-lg font-semibold text-slate-800 flex-1 min-w-0 truncate">
          {getPageTitle(pathname)}
        </h1>

        {/* Alert bell */}
        <Link
          to="/app/alerts"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={`${alertCount} active alerts`}
        >
          <IconBell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                             flex items-center justify-center
                             bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </Link>

        {/* User pill + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors max-w-[220px]"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IconUser className="w-4 h-4 text-blue-600" />
            </div>
            {currentUser ? (
              <div className="min-w-0 text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-700 truncate leading-tight">
                  {currentUser.userName}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {currentUser.siteName}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleBadge}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500 hidden sm:block">Sign in</span>
            )}
            {/* Chevron */}
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-40 py-1 overflow-hidden">
              {currentUser ? (
                <>
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.userName}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.siteName}</p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${roleBadge}`}>
                      {roleLabel}
                    </span>
                  </div>

                  {/* Profile */}
                  <Link
                    to="/app/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile & Team
                  </Link>

                  {/* Switch account */}
                  <button
                    onClick={() => { setShowDropdown(false); setShowModal(true) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Switch Account
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    {/* Sign out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { setShowDropdown(false); setShowModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  <IconUser className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sign-In Modal */}
      {showModal && (
        <SignInModal
          current={currentUser}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
