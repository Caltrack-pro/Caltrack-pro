import { NavLink } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Icons (inline SVG — no external icon library needed)
// ---------------------------------------------------------------------------

function IconDashboard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconGauge({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.636 5.636a9 9 0 1 0 12.728 0" />
      <path d="M12 12 9 7.5" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconChart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19V8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11" />
      <path d="M13 19V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14" />
      <path d="M3 19h18" />
      <path d="M9 19v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
    </svg>
  )
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Logo mark — larger gauge used in the app header
// ---------------------------------------------------------------------------

function AppLogo() {
  return (
    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 32 32" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer arc — 270° gauge face, open at bottom */}
      <path d="M6.4 25.6A13 13 0 1 1 25.6 25.6" />
      {/* Scale ticks */}
      <line x1="5"  y1="16" x2="7"  y2="16" strokeWidth="1.5" />
      <line x1="27" y1="16" x2="29" y2="16" strokeWidth="1.5" />
      <line x1="16" y1="3"  x2="16" y2="5"  strokeWidth="1.5" />
      {/* Needle — pointing to ~75% (pass zone) */}
      <path d="M16 16 11 8" strokeWidth="2.5" stroke="#22C55E" />
      {/* Centre dot */}
      <circle cx="16" cy="16" r="2" fill="#22C55E" stroke="none" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Nav link helper — applies active/inactive styles
// ---------------------------------------------------------------------------

const NAV_BASE   = 'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100'
const NAV_ACTIVE = 'bg-blue-600 text-white'
const NAV_IDLE   = 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) => `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_IDLE}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 flex flex-col h-screen">

      {/* ── App name ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
        <AppLogo />
        <div>
          <div className="text-white font-bold text-base leading-tight tracking-tight">
            CalTrack Pro
          </div>
          <div className="text-slate-500 text-xs leading-tight">Calibration Management</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
          Main
        </p>
        <NavItem to="/"            icon={IconDashboard} label="Dashboard"    onClick={onNavigate} />
        <NavItem to="/instruments" icon={IconGauge}     label="Instruments"  onClick={onNavigate} />
        <NavItem to="/alerts"      icon={IconBell}      label="Alerts"       onClick={onNavigate} />
        <NavItem to="/reports"     icon={IconChart}     label="Reports"      onClick={onNavigate} />
      </nav>

      {/* ── Current user ── */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <IconUser className="w-4 h-4 text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">J. Smith</p>
            <p className="text-slate-500 text-xs truncate">Technician</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
