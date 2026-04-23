import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, ROLES, signOut, setDemoMode, DEMO_SITE } from '../utils/userContext'

// ---------------------------------------------------------------------------
// Colour constants
// ---------------------------------------------------------------------------

const NAVY   = '#0B1F3A'
const SKY    = '#2196F3'
const IDLE   = 'rgba(255,255,255,0.75)'
const BORDER = 'rgba(255,255,255,0.1)'

// ---------------------------------------------------------------------------
// Nav link — emoji + label style
// ---------------------------------------------------------------------------

function NavItem({ to, emoji, label, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 12px',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
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
      <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>
        {emoji}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          background: '#EF4444',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 700,
          borderRadius: 10,
          padding: '1px 6px',
          minWidth: 18,
          textAlign: 'center',
          flexShrink: 0,
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  )
}

// Plain button nav item (for actions like Try Demo, Sign Out)
function NavBtn({ emoji, label, onClick, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 12px',
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
      <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar({ onNavigate, pendingCount }) {
  const navigate = useNavigate()
  const [user, setUserState] = useState(() => getUser())

  useEffect(() => {
    function onUserChange(e) { setUserState(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  const isDemoMode    = user?.isDemoMode ?? false
  const isOwnSite     = !isDemoMode && !!user
  const role          = user?.role ?? 'readonly'
  const isSuperadmin  = user?.isSuperadmin === true

  return (
    <aside style={{
      width: 248,
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
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <img
          src="/assets/calcheq-logo-horizontal-lockup.svg"
          alt="CalCheq"
          style={{ height: 34, width: 'auto' }}
        />
      </div>

      {/* ── Demo mode banner ── */}
      {isDemoMode && (
        <div style={{
          margin: '10px 12px 0',
          padding: '9px 12px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8,
        }}>
          <p style={{ color: '#FCD34D', fontSize: '0.74rem', fontWeight: 600, margin: 0 }}>👁 Viewing Demo site</p>
          <button
            onClick={() => { setDemoMode(false); onNavigate?.() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#FDE68A', fontSize: '0.7rem', textDecoration: 'underline',
              padding: 0, marginTop: 3,
            }}
          >
            Switch back to {user?.userName ? 'your site' : 'sign in'}
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>

        <p style={{
          padding: '0 12px 6px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
        }}>
          Navigation
        </p>

        <NavItem to="/app"                emoji="🏠" label="Dashboard"           onClick={onNavigate} />
        <NavItem to="/app/instruments"    emoji="🔧" label="Instruments"       onClick={onNavigate} />
        <NavItem to="/app/schedule"       emoji="📅" label="Schedule"          onClick={onNavigate} />
        <NavItem to="/app/calibrations"   emoji="📋" label="Calibrations"      badge={pendingCount} onClick={onNavigate} />
        {role !== 'technician' && (
          <NavItem to="/app/diagnostics"    emoji="🔬" label="Smart Diagnostics" onClick={onNavigate} />
        )}
        <NavItem to="/app/documents"      emoji="📁" label="Documents"         onClick={onNavigate} />
        {role !== 'technician' && (
          <NavItem to="/app/reports"        emoji="📄" label="Reports"           onClick={onNavigate} />
        )}
        <NavItem to="/app/settings"       emoji="⚙️"  label="Settings"         onClick={onNavigate} />
        <NavItem to="/app/support"        emoji="🆘" label="Support"           onClick={onNavigate} />
        {isSuperadmin && (
          <NavItem to="/app/admin"        emoji="👑" label="Platform Admin"   onClick={onNavigate} />
        )}

        {/* ── Divider + utility links ── */}
        <div style={{ paddingTop: 12, marginTop: 10, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isOwnSite && (
            <NavBtn
              emoji="🔍"
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
              gap: 11,
              padding: '9px 12px',
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
            <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>🌐</span>
            <span>Back to Website</span>
          </a>
        </div>
      </nav>

      {/* ── User section ── */}
      <div style={{
        padding: '10px 10px 12px',
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {/* User card → Settings */}
        <NavLink
          to="/app/settings"
          onClick={onNavigate}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
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
          {/* Avatar circle */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(33,150,243,0.25)',
            border: '1px solid rgba(33,150,243,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: SKY,
          }}>
            {(user?.userName ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {user?.siteName && (
              <p style={{ fontSize: '0.62rem', lineHeight: 1.2, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {user.siteName}
              </p>
            )}
            <p style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, margin: 0 }}>
              {user?.userName ?? 'Account'}
            </p>
          </div>
        </NavLink>

        {/* Sign out */}
        {user && (
          <NavBtn
            emoji="🚪"
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
