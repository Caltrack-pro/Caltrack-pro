import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'
import { getUser, signOut, ROLES } from '../utils/userContext'

// ---------------------------------------------------------------------------
// Derive page title from URL
// ---------------------------------------------------------------------------

function getPageTitle(pathname) {
  const STATIC = {
    '/app':                        'Dashboard',
    '/app/instruments':            'Instruments',
    '/app/instruments/new':        'New Instrument',
    '/app/schedule':               'Schedule',
    '/app/calibrations':           'Calibrations',
    '/app/calibrations/import-csv':'Import Calibrator CSV',
    '/app/diagnostics':            'Smart Diagnostics',
    '/app/documents':              'Documents',
    '/app/reports':                'Reports & Exports',
    '/app/settings':               'Settings',
    '/app/import':                 'Import Instruments',
    '/app/support':                'Support',
    // Legacy route aliases
    '/app/alerts':                 'Schedule',
    '/app/approvals':              'Calibrations',
    '/app/bad-actors':             'Schedule',
    '/app/profile':                'Settings',
  }
  if (STATIC[pathname]) return STATIC[pathname]
  if (pathname.startsWith('/app/calibrations/new/')) return 'New Calibration Record'
  if (pathname.match(/^\/app\/instruments\/[^/]+\/edit$/)) return 'Edit Instrument'
  if (pathname.match(/^\/app\/instruments\/[^/]+$/))       return 'Instrument Detail'
  return 'CalCheq'
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

  const [alertCount,   setAlertCount]   = useState(0)
  const [currentUser,  setCurrentUser]  = useState(() => getUser())
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Sync user when auth state changes
  useEffect(() => {
    function onUserChange(e) { setCurrentUser(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
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

  // Alert badge count — refresh every 5 minutes. Only refetch when site
  // actually changes (avoids a duplicate call on every auth event).
  const site = currentUser?.siteName ?? null
  useEffect(() => {
    if (!site) return
    function fetchCount() {
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
  }, [site])

  async function handleSignOut() {
    setShowDropdown(false)
    await signOut()
    navigate('/')
  }

  const roleBadge = currentUser
    ? ROLE_COLORS[currentUser.role] ?? 'bg-slate-100 text-slate-600'
    : ''
  const roleLabel = currentUser
    ? (ROLES.find(r => r.value === currentUser.role)?.label ?? currentUser.role)
    : ''

  return (
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
        {currentUser?.isDemoMode && (
          <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Demo Mode
          </span>
        )}
      </h1>

      {/* Alert bell */}
      <Link
        to="/app/schedule"
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
                  {currentUser.isDemoMode || currentUser.siteName === 'Demo' ? 'Riverdale Water Treatment Plant' : currentUser.siteName}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleBadge}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500 hidden sm:block">Account</span>
          )}
          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {/* Dropdown menu */}
        {showDropdown && currentUser && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-40 py-1 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser.userName}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.isDemoMode || currentUser.siteName === 'Demo' ? 'Riverdale Water Treatment Plant' : currentUser.siteName}</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>

            {/* Profile */}
            <Link
              to="/app/settings"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile & Settings
            </Link>

            <div className="border-t border-slate-100 mt-1 pt-1">
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
          </div>
        )}
      </div>
    </header>
  )
}
