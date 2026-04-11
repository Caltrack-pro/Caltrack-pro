/**
 * Calcheq — User context and auth utilities.
 *
 * Auth is now handled by Supabase Auth (email + password).
 * After sign-in, the backend /api/auth/me endpoint is called to fetch the
 * user's site and role from the site_members DB table.
 *
 * User object shape (same as before, for backward compatibility):
 *   { userId, email, userName, siteName, role, isDemoMode }
 *
 * Public API:
 *   getUser()           → current user object or null (synchronous — reads module cache)
 *   signOut()           → calls supabase.auth.signOut()
 *   setDemoMode(bool)   → toggle Demo site viewing for the current logged-in user
 *   ROLES               → array of { value, label }
 *   canEdit(user)       → bool
 *   canApprove(user)    → bool
 *   canCalibrate(user)  → bool
 *   isReadOnly(user)    → bool
 *
 * Events:
 *   window 'caltrack-user-change' — dispatched whenever auth state changes.
 *   event.detail is the new user object (or null on sign-out).
 *   Existing listeners in Dashboard.jsx and InstrumentList.jsx continue to work.
 */

import { supabase } from './supabase'

export const DEMO_SITE = 'Demo'

// ---------------------------------------------------------------------------
// Module-level state — synchronous reads for backward compat
// ---------------------------------------------------------------------------

let _currentUser   = null   // { userId, email, userName, siteName, role }
let _isDemoMode    = false   // true when logged-in user is viewing the Demo site
let _initialised   = false   // true once the first session check has completed

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _fetchUserContext(session) {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (res.status === 401) {
      // User is authenticated but has no site membership → trigger registration
      await _autoRegister(session)
      return _fetchUserContext(session)   // retry after registering
    }

    if (!res.ok) return null

    const data = await res.json()
    return {
      userId:   session.user.id,
      email:    session.user.email,
      userName: data.display_name || session.user.email.split('@')[0],
      siteName: data.site_name,
      role:     data.role,
    }
  } catch {
    return null
  }
}

async function _autoRegister(session) {
  // Read site_name from the user_metadata that was set during signUp
  const meta = session.user.user_metadata || {}
  if (!meta.site_name) return   // nothing to register without a site name

  try {
    await fetch('/api/auth/register', {
      method:  'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
  } catch {
    // ignore — me() will still return 401 and the sign-in page will show an error
  }
}

function _dispatch(user) {
  window.dispatchEvent(new CustomEvent('caltrack-user-change', { detail: user }))
}

// ---------------------------------------------------------------------------
// Bootstrap: restore session on page load, before any component renders
// ---------------------------------------------------------------------------

supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session) {
    _currentUser = await _fetchUserContext(session)
  }
  _initialised = true
  _dispatch(getUser())
})

// ---------------------------------------------------------------------------
// Reactive: keep module cache in sync with Supabase auth state changes
// ---------------------------------------------------------------------------

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    _currentUser = await _fetchUserContext(session)
  } else {
    _currentUser = null
    _isDemoMode  = false
  }
  _dispatch(getUser())
})

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the current user object (synchronous).
 * Returns null if not authenticated or if the session has not loaded yet.
 * When in demo mode, returns the user with siteName overridden to "Demo".
 */
export function getUser() {
  if (!_currentUser) return null
  if (_isDemoMode) {
    return { ..._currentUser, siteName: DEMO_SITE, isDemoMode: true }
  }
  return { ..._currentUser, isDemoMode: false }
}

/**
 * Returns a promise that resolves once the initial session check is done.
 * Useful in AuthGuard to avoid flashing the sign-in page on hard refresh.
 */
export function waitForInit() {
  if (_initialised) return Promise.resolve()
  return new Promise(resolve => {
    function handler() {
      window.removeEventListener('caltrack-user-change', handler)
      resolve()
    }
    window.addEventListener('caltrack-user-change', handler)
  })
}

/**
 * Toggle Demo mode for the currently logged-in user.
 * When enabled, all API calls use ?site=Demo, showing public demo data.
 */
export function setDemoMode(enabled) {
  _isDemoMode = !!enabled
  _dispatch(getUser())
}

/** Signs out of Supabase Auth. */
export function signOut() {
  _isDemoMode = false
  return supabase.auth.signOut()
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = [
  { value: 'admin',      label: 'Admin'      },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'technician', label: 'Technician' },
  { value: 'planner',    label: 'Planner'    },
  { value: 'readonly',   label: 'Read Only'  },
]

// ---------------------------------------------------------------------------
// Permission helpers (unchanged — same logic as before)
// ---------------------------------------------------------------------------

export function canApprove(user) {
  if (!user) return false
  return user.role === 'admin' || user.role === 'supervisor'
}

export function canEdit(user) {
  if (!user) return false
  return (
    user.role === 'admin' ||
    user.role === 'supervisor' ||
    user.role === 'planner' ||
    user.role === 'technician'
  )
}

export function canCalibrate(user) {
  if (!user) return false
  return user.role === 'admin' || user.role === 'supervisor' || user.role === 'technician'
}

export function isReadOnly(user) {
  if (!user) return true
  return user.role === 'readonly'
}
