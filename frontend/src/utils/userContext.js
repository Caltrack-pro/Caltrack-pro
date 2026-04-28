/**
 * CalCheq — User context and auth utilities.
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
import { isNative } from './platform'

const API_BASE = isNative()
  ? `${import.meta.env.VITE_API_BASE_URL || 'https://calcheq.com'}/api`
  : '/api'

export const DEMO_SITE = 'Demo'

// ---------------------------------------------------------------------------
// Platform-admin impersonation (super-admin only)
//
// When a super-admin clicks "Impersonate" on a site in /app/admin, we store
// the target site id + name in sessionStorage. All subsequent API calls in
// api.js attach X-Impersonate-Site-Id, and the red banner in Layout.jsx
// reads the name from here. Scoped to the tab (sessionStorage) by design.
// ---------------------------------------------------------------------------

const IMPERSONATE_ID_KEY   = 'caltrack-impersonate-site-id'
const IMPERSONATE_NAME_KEY = 'caltrack-impersonate-site-name'

export function getImpersonationSiteId() {
  try { return sessionStorage.getItem(IMPERSONATE_ID_KEY) || null } catch { return null }
}
export function getImpersonationSiteName() {
  try { return sessionStorage.getItem(IMPERSONATE_NAME_KEY) || null } catch { return null }
}

/** Set the impersonation target. Caller is responsible for calling
 *  /api/superadmin/sites/{id}/impersonate-start for the audit marker. */
export function startImpersonation(siteId, siteName) {
  try {
    sessionStorage.setItem(IMPERSONATE_ID_KEY,   siteId)
    sessionStorage.setItem(IMPERSONATE_NAME_KEY, siteName)
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('caltrack-impersonation-change', { detail: { siteId, siteName } }))
}

/** Clear impersonation. Caller is responsible for calling impersonate-end
 *  AFTER this returns so the audit row carries the super-admin's identity. */
export function exitImpersonation() {
  try {
    sessionStorage.removeItem(IMPERSONATE_ID_KEY)
    sessionStorage.removeItem(IMPERSONATE_NAME_KEY)
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('caltrack-impersonation-change', { detail: null }))
}

// ---------------------------------------------------------------------------
// Module-level state — synchronous reads for backward compat
// ---------------------------------------------------------------------------

const DEMO_MODE_KEY = 'caltrack-demo-mode'

function _readPersistedDemoMode() {
  try {
    return sessionStorage.getItem(DEMO_MODE_KEY) === '1'
  } catch {
    return false
  }
}

function _writePersistedDemoMode(enabled) {
  try {
    if (enabled) sessionStorage.setItem(DEMO_MODE_KEY, '1')
    else sessionStorage.removeItem(DEMO_MODE_KEY)
  } catch { /* sessionStorage unavailable */ }
}

let _currentUser   = null                        // { userId, email, userName, siteName, role }
let _isDemoMode    = _readPersistedDemoMode()    // true when logged-in user is viewing the Demo site
let _initialised   = false                       // true once the first session check has completed

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _fetchUserContext(session) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
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
      userId:             session.user.id,
      email:              session.user.email,
      userName:           data.display_name || session.user.email.split('@')[0],
      siteName:           data.site_name,
      role:               data.role,
      subscriptionStatus: data.subscription_status || null,
      subscriptionPlan:   data.subscription_plan   || null,
      trialEndsAt:        data.trial_ends_at       || null,
      isSuperadmin:       data.is_superadmin === true,
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
    await fetch(`${API_BASE}/auth/register`, {
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
// Reactive: keep module cache in sync with Supabase auth state changes.
// onAuthStateChange fires INITIAL_SESSION on subscribe (so no separate bootstrap
// needed). We skip TOKEN_REFRESHED / USER_UPDATED refetches since the user
// record doesn't change on token refresh — avoids extra /api/auth/me calls.
// ---------------------------------------------------------------------------

let _lastUserId = null

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    const sameUser = session.user?.id === _lastUserId
    const skipRefetch = sameUser && (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')
    if (!skipRefetch) {
      _currentUser = await _fetchUserContext(session)
      _lastUserId  = session.user?.id ?? null
    }
  } else {
    _currentUser = null
    _lastUserId  = null
    _isDemoMode  = false
    _writePersistedDemoMode(false)
  }
  _initialised = true
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
  _writePersistedDemoMode(_isDemoMode)
  _dispatch(getUser())
}

/** Signs out of Supabase Auth. */
export function signOut() {
  _isDemoMode = false
  _writePersistedDemoMode(false)
  return supabase.auth.signOut()
}

/** Signs in as the demo account using env-var credentials. */
export async function signInAsDemo() {
  const { error } = await supabase.auth.signInWithPassword({
    email:    import.meta.env.VITE_DEMO_EMAIL    ?? 'demo@calcheq.com',
    password: import.meta.env.VITE_DEMO_PASSWORD ?? '',
  })
  if (error) throw error
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
  return user.role === 'admin' || user.role === 'supervisor' || user.role === 'technician' || user.role === 'planner'
}

export function isReadOnly(user) {
  if (!user) return true
  return user.role === 'readonly'
}
