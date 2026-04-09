/**
 * Site-based user context with password-protected site accounts.
 *
 * Storage keys:
 *   caltrack_user    — current session { siteName, userName, role }
 *   caltrack_sites   — registered sites { [siteNameLower]: { siteName, password } }
 *   caltrack_members — per-site members { [siteNameLower]: { [userNameLower]: { userName, role } } }
 *
 * Workflow:
 *   1. Enter site name (e.g. "IXOM")
 *   2. If new site → set site password (required)
 *   3. If existing site → enter site password to access
 *   4. Enter personal name + role (for traceability on calibration records)
 *   5. Role remembered per site-member, can be changed on re-sign-in
 */

const STORAGE_KEY  = 'caltrack_user'
const SITES_KEY    = 'caltrack_sites'
const MEMBERS_KEY  = 'caltrack_members'

// The public demo site — no password required, auto-seeded instruments
export const DEMO_SITE = 'Demo'

// ── Site store helpers ────────────────────────────────────────────────────────

/** Returns all sites as { [siteNameLower]: { siteName, password } } */
export function getSites() {
  try {
    const stored = localStorage.getItem(SITES_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function saveSites(sites) {
  localStorage.setItem(SITES_KEY, JSON.stringify(sites))
}

/** Returns the saved site for a given name (case-insensitive), or null. */
export function findSite(siteName) {
  if (!siteName) return null
  return getSites()[siteName.trim().toLowerCase()] ?? null
}

/**
 * Registers or updates a site.
 * @param {string} siteName
 * @param {string} password  — required for new sites
 */
export function saveSite(siteName, password) {
  const sites = getSites()
  sites[siteName.trim().toLowerCase()] = {
    siteName: siteName.trim(),
    password: password || null,
  }
  saveSites(sites)
}

/** Verifies a site password. Returns true if correct (or site has no password).
 *  The Demo site never requires a password. */
export function verifySitePassword(siteName, password) {
  if (siteName?.trim().toLowerCase() === DEMO_SITE.toLowerCase()) return true
  const site = findSite(siteName)
  if (!site) return true
  if (!site.password) return true
  return site.password === (password ?? '')
}

/** Returns true if a site requires no password (Demo site or unprotected). */
export function siteHasNoPassword(siteName) {
  if (!siteName) return false
  if (siteName.trim().toLowerCase() === DEMO_SITE.toLowerCase()) return true
  const site = findSite(siteName)
  return site ? !site.password : false
}

// ── Member store helpers ──────────────────────────────────────────────────────

/** Returns all members map: { [siteNameLower]: { [userNameLower]: { userName, role } } } */
export function getMembers() {
  try {
    const stored = localStorage.getItem(MEMBERS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function saveMembers(members) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

/** Returns the saved member record for a given site + user name, or null. */
export function findMember(siteName, userName) {
  if (!siteName || !userName) return null
  const allMembers = getMembers()
  const siteMembers = allMembers[siteName.trim().toLowerCase()] ?? {}
  return siteMembers[userName.trim().toLowerCase()] ?? null
}

/** Returns all members for a given site as an array of { userName, role }. */
export function getSiteMembers(siteName) {
  if (!siteName) return []
  const allMembers = getMembers()
  const siteMembers = allMembers[siteName.trim().toLowerCase()] ?? {}
  return Object.values(siteMembers)
}

/** Registers or updates a site member's role. */
export function saveMember(siteName, userName, role) {
  const allMembers = getMembers()
  const siteKey = siteName.trim().toLowerCase()
  if (!allMembers[siteKey]) allMembers[siteKey] = {}
  allMembers[siteKey][userName.trim().toLowerCase()] = {
    userName: userName.trim(),
    role,
  }
  saveMembers(allMembers)
}

// ── Current user ──────────────────────────────────────────────────────────────

/** Returns the current user object or null if not signed in.
 *  Shape: { siteName, userName, role }
 *
 *  Automatically migrates the old format { name, role } to the new shape.
 */
export function getUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const user = JSON.parse(stored)
      // Migrate legacy format: { name, role } → { userName, role, siteName }
      if (user.name && !user.userName) {
        const migrated = {
          userName: user.name,
          role:     user.role ?? 'technician',
          siteName: user.siteName ?? null,
        }
        // Persist the migrated shape so this only runs once
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }
      return user
    }
  } catch {}
  return null
}

/** Persists user to localStorage and notifies all listeners. */
export function setUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('caltrack-user-change', { detail: user }))
}

/** Clears the stored user (sign out). */
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('caltrack-user-change', { detail: null }))
}

/** Alias for clearUser — matches the "Sign Out" label in the UI. */
export function signOut() {
  clearUser()
}

/** Signs in as the public Demo account immediately (no password required).
 *  Used by "Open Demo App" / "Explore the Demo" buttons on the marketing site. */
export function signInAsDemo() {
  const demoUser = { siteName: DEMO_SITE, userName: 'Demo Visitor', role: 'admin' }
  setUser(demoUser)
  return demoUser
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export const ROLES = [
  { value: 'admin',      label: 'Admin'       },
  { value: 'supervisor', label: 'Supervisor'  },
  { value: 'technician', label: 'Technician'  },
  { value: 'planner',    label: 'Planner'     },
  { value: 'readonly',   label: 'Read Only'   },
]

// ── Permission helpers ────────────────────────────────────────────────────────

/** Returns true if the user can approve calibration records. */
export function canApprove(user) {
  if (!user) return false
  return user.role === 'admin' || user.role === 'supervisor'
}

/** Returns true if the user can create/edit instruments and manage scheduling. */
export function canEdit(user) {
  if (!user) return false
  return (
    user.role === 'admin' ||
    user.role === 'supervisor' ||
    user.role === 'planner' ||
    user.role === 'technician'
  )
}

/** Returns true if the user can create calibration records. */
export function canCalibrate(user) {
  if (!user) return false
  return user.role === 'admin' || user.role === 'supervisor' || user.role === 'technician'
}

/** Returns true if the user only has read access. */
export function isReadOnly(user) {
  if (!user) return true
  return user.role === 'readonly'
}
