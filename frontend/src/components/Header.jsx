import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { dashboard as dashApi } from '../utils/api'

// ---------------------------------------------------------------------------
// Derive the page title from the current URL
// ---------------------------------------------------------------------------

const STATIC_TITLES = {
  '/':                 'Dashboard',
  '/instruments':      'Instruments',
  '/instruments/new':  'New Instrument',
  '/alerts':           'Alerts & Notifications',
  '/reports':          'Reports',
}

function getPageTitle(pathname) {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname]
  if (pathname.startsWith('/calibrations/new/')) return 'New Calibration Record'
  if (pathname.match(/^\/instruments\/[^/]+$/)) return 'Instrument Detail'
  return 'CalTrack Pro'
}

// ---------------------------------------------------------------------------
// Search icon SVG
// ---------------------------------------------------------------------------

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const REFRESH_MS = 5 * 60 * 1000  // 5 minutes

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    function fetchCount() {
      dashApi.alerts()
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">

      {/* ── Hamburger (mobile only) ── */}
      {onMenuClick && (
        <button onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}

      {/* ── Page title ── */}
      <h1 className="text-lg font-semibold text-slate-800 flex-1 min-w-0 truncate">
        {title}
      </h1>

      {/* ── Search bar ── */}
      <div className="relative hidden sm:block">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search instruments…"
          className="w-56 pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
                     text-slate-700 placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-colors"
        />
      </div>

      {/* ── Alert badge ── */}
      <Link
        to="/alerts"
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

    </header>
  )
}
