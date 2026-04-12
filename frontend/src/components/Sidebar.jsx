import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, ROLES, signOut, setDemoMode, DEMO_SITE } from '../utils/userContext'

// ---------------------------------------------------------------------------
// Icons (inline SVG — no external icon library needed)
// ---------------------------------------------------------------------------

function IconDashboard({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconGauge({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.636 5.636a9 9 0 1 0 12.728 0" />
      <path d="M12 12 9 7.5" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBell({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconChart({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19V8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11" />
      <path d="M13 19V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14" />
      <path d="M3 19h18" />
      <path d="M9 19v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
    </svg>
  )
}

function IconUser({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  )
}

function IconClock({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Colour constants
// ---------------------------------------------------------------------------

const NAVY   = '#0B1F3A'
const SKY    = '#2196F3'
const IDLE   = 'rgba(255,255,255,0.75)'
const BORDER = 'rgba(255,255,255,0.1)'
const ICON_SIZE = { width: 20, height: 20, flexShrink: 0 }

// ---------------------------------------------------------------------------
// Nav link helper
// ---------------------------------------------------------------------------

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
        borderLeft: isActive ? `3px solid ${SKY}` : '3px solid transparent',
        background: isActive ? 'rgba(33,150,243,0.18)' : 'transparent',
        color: isActive ? '#fff' : IDLE,
      })}
      onMouseEnter={e => {
        // only apply hover style if not active (active element has the blue border)
        if (!e.currentTarget.style.borderLeft.includes(SKY)) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.color = '#fff'
        }
      }}
      onMouseLeave={e => {
        if (!e.currentTarget.style.borderLeft.includes(SKY)) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = IDLE
        }
      }}
    >
      <Icon style={ICON_SIZE} />
      <span>{label}</span>
    </NavLink>
  )
}

// Plain button-style nav item (for non-route actions)
function NavBtn({ icon: Icon, label, onClick, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        background: hovered ? (color ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.07)') : 'transparent',
        color: color || (hovered ? '#fff' : IDLE),
        transition: 'background 0.15s, color 0.15s',
        borderLeft: '3px solid transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon style={ICON_SIZE} />
      <span>{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate()
  const [user, setUserState] = useState(() => getUser())

  useEffect(() => {
    function onUserChange(e) { setUserState(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  const isDemoMode = user?.isDemoMode ?? false
  const isOwnSite  = !isDemoMode && !!user

  return (
    <aside style={{
      width: 256,
      flexShrink: 0,
      background: NAVY,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>

      {/* ── Logo ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px 16px',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {/* Gauge icon */}
        <svg style={{ width: 32, height: 32, color: SKY }} viewBox="0 0 32 32" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.4 25.6A13 13 0 1 1 25.6 25.6" />
          <line x1="5"  y1="16" x2="7"  y2="16" strokeWidth="1.5" />
          <line x1="27" y1="16" x2="29" y2="16" strokeWidth="1.5" />
          <line x1="16" y1="3"  x2="16" y2="5"  strokeWidth="1.5" />
          <path d="M16 16 11 8" strokeWidth="2.5" stroke="#22C55E" />
          <circle cx="16" cy="16" r="2" fill="#22C55E" stroke="none" />
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            <span style={{ color: '#fff' }}>Cal</span>
            <span style={{ color: SKY }}>Cheq</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', lineHeight: 1.2 }}>
            Calibration Management
          </div>
        </div>
      </div>

      {/* ── Demo mode banner ── */}
      {isDemoMode && (
        <div style={{
          margin: '12px 12px 0',
          padding: '10px 12px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8,
        }}>
          <p style={{ color: '#FCD34D', fontSize: '0.75rem', fontWeight: 600 }}>Viewing Demo site</p>
          <button
            onClick={() => { setDemoMode(false); onNavigate?.() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#FDE68A', fontSize: '0.7rem', textDecoration: 'underline',
              padding: 0, marginTop: 2,
            }}
          >
            Switch back to {user?.userName ? 'your site' : 'sign in'}
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          padding: '0 12px 8px',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Main
        </p>
        <NavItem to="/app"             icon={IconDashboard} label="Dashboard"  onClick={onNavigate} />
        <NavItem to="/app/instruments" icon={IconGauge}     label="Instruments" onClick={onNavigate} />
        <NavItem to="/app/alerts"      icon={IconBell}      label="Alerts"      onClick={onNavigate} />
        <NavItem to="/app/approvals"   icon={IconClock}     label="Approvals"   onClick={onNavigate} />
        <NavItem to="/app/reports"     icon={IconChart}     label="Reports"     onClick={onNavigate} />

        {/* ── Demo toggle ── */}
        <div style={{ paddingTop: 12, marginTop: 12, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isOwnSite && (
            <NavBtn
              icon={() => (
                <svg style={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              )}
              label="Try Demo"
              onClick={() => { setDemoMode(true); onNavigate?.() }}
            />
          )}

          {/* Back to website */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: IDLE,
              borderLeft: '3px solid transparent',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = IDLE }}
          >
            <svg style={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l9-9 9 9" />
              <path d="M9 21V9h6v12" />
            </svg>
            <span>Back to Website</span>
          </a>
        </div>
      </nav>

      {/* ── User + Profile + Sign Out ── */}
      <div style={{
        padding: '12px',
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>

        {/* Profile link */}
        <NavLink
          to="/app/profile"
          onClick={onNavigate}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'background 0.15s',
            borderLeft: isActive ? `3px solid ${SKY}` : '3px solid transparent',
            background: isActive ? 'rgba(33,150,243,0.18)' : 'transparent',
            color: isActive ? '#fff' : IDLE,
          })}
          onMouseEnter={e => {
            if (!e.currentTarget.style.borderLeft.includes(SKY)) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={e => {
            if (!e.currentTarget.style.borderLeft.includes(SKY)) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = IDLE
            }
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconUser style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.7)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {user?.siteName && (
              <p style={{ fontSize: '0.65rem', lineHeight: 1.2, opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {user.siteName}
              </p>
            )}
            <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2, margin: 0 }}>
              {user?.userName ?? 'Account'}
            </p>
          </div>
        </NavLink>

        {/* Sign out */}
        {user && (
          <NavBtn
            icon={() => (
              <svg style={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            )}
            label="Sign Out"
            color="#F87171"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          />
        )}
      </div>

    </aside>
  )
}
