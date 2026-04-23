/**
 * CalCheq — API service layer
 * All communication with the FastAPI backend goes through here.
 * Base URL reads from the Vite proxy (dev) or an env variable (prod).
 */

import { supabase } from './supabase'

const BASE_URL = '/api'

// Header name the backend (auth.py) expects for platform-admin impersonation.
// We read sessionStorage directly here rather than importing userContext to
// avoid the existing static/dynamic-import cycle with userContext.js.
const IMPERSONATE_HEADER = 'X-Impersonate-Site-Id'
function _impersonationHeader() {
  try {
    const id = sessionStorage.getItem('caltrack-impersonate-site-id')
    return id ? { [IMPERSONATE_HEADER]: id } : {}
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function toQueryString(params = {}) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function _getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const authHeader = await _getAuthHeader()
  const impersonateHeader = _impersonationHeader()

  let response
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...impersonateHeader,
        ...options.headers,
      },
      ...options,
    })
  } catch (networkErr) {
    throw new ApiError(
      'Cannot reach the server — is the backend running on port 8000?',
      0,
      networkErr.message,
    )
  }

  // 204 No Content — DELETE etc.
  if (response.status === 204) return null

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = Array.isArray(body.detail)
        ? body.detail.map((e) => e.msg).join('; ')
        : body.detail ?? detail
    } catch {
      // keep statusText
    }

    // Friendly demo write-block: show conversion modal instead of raw 403
    if (response.status === 403) {
      const { getUser: _getUser } = await import('./userContext')
      const u = _getUser()
      if (u && (u.isDemoMode || u.siteName === 'Demo')) {
        window.dispatchEvent(new CustomEvent('caltrack-demo-blocked'))
        return null
      }
    }

    // Subscription expired/inactive: redirect to billing
    if (response.status === 402) {
      window.dispatchEvent(new CustomEvent('caltrack-subscription-required'))
      return null
    }

    throw new ApiError(`${response.status}: ${detail}`, response.status, detail)
  }

  return response.json()
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}
function put(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) })
}
function del(path) {
  return request(path, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Auth / Site Members
// ---------------------------------------------------------------------------

export const auth = {
  me: () => request('/auth/me'),
  /** Creates the site + site_members row after email confirmation. */
  register: () => post('/auth/register', {}),
  listMembers: () => request('/auth/members'),
  inviteMember: (data) => post('/auth/invite', data),
}

// ---------------------------------------------------------------------------
// Instruments
// ---------------------------------------------------------------------------

export const instruments = {
  /**
   * List instruments with optional filters.
   * @param {{ area?, type?, status?, calibration_status?, skip?, limit? }} params
   */
  list: (params = {}) =>
    request(`/instruments${toQueryString(params)}`),

  get: (id) =>
    request(`/instruments/${id}`),

  create: (data) =>
    post('/instruments', data),

  update: (id, data) =>
    put(`/instruments/${id}`, data),

  /** Soft-delete: sets status → decommissioned */
  delete: (id) =>
    del(`/instruments/${id}`),

  calibrationStatus: (id) =>
    request(`/instruments/${id}/calibration-status`),

  /**
   * @param {{ skip?, limit? }} params
   */
  calibrationHistory: (id, params = {}) =>
    request(`/instruments/${id}/calibration-history${toQueryString(params)}`),

  driftAnalysis: (id) =>
    request(`/instruments/${id}/drift`),

  auditLog: (id, params = {}) =>
    request(`/instruments/${id}/audit-log${toQueryString(params)}`),

  /**
   * Upload a CSV file for bulk import.
   * @param {File} file
   * @param {boolean} dryRun  - true = preview only, no records created
   */
  bulkImport: async (file, dryRun = false) => {
    const authHeader = await _getAuthHeader()
    const impersonateHeader = _impersonationHeader()
    const formData = new FormData()
    formData.append('file', file)
    let response
    try {
      response = await fetch(`${BASE_URL}/instruments/bulk-import?dry_run=${dryRun}`, {
        method: 'POST',
        headers: { ...authHeader, ...impersonateHeader },  // no Content-Type — let browser set multipart boundary
        body: formData,
      })
    } catch (networkErr) {
      throw new ApiError('Cannot reach the server', 0, networkErr.message)
    }
    if (!response.ok) {
      let detail = response.statusText
      try { const b = await response.json(); detail = b.detail ?? detail } catch {}
      // Demo write-block for bulk import too
      if (response.status === 403) {
        const { getUser: _getUser } = await import('./userContext')
        const u = _getUser()
        if (u && (u.isDemoMode || u.siteName === 'Demo')) {
          window.dispatchEvent(new CustomEvent('caltrack-demo-blocked'))
          return null
        }
      }
      throw new ApiError(`${response.status}: ${detail}`, response.status, detail)
    }
    return response.json()
  },
}

// ---------------------------------------------------------------------------
// Calibration records
// ---------------------------------------------------------------------------

export const calibrations = {
  /**
   * @param {{ instrument_id?, result?, technician?, date_from?, date_to?, record_status?, skip?, limit? }} params
   */
  list: (params = {}) =>
    request(`/calibrations${toQueryString(params)}`),

  get: (id) =>
    request(`/calibrations/${id}`),

  create: (data) =>
    post('/calibrations', data),

  /** Only allowed while record_status === 'draft' */
  update: (id, data) =>
    put(`/calibrations/${id}`, data),

  /** draft → submitted. Returns 422 if test points are incomplete. */
  submit: (id) =>
    post(`/calibrations/${id}/submit`, {}),

  /** submitted → approved. Updates parent instrument. */
  approve: (id, approvedBy) =>
    post(`/calibrations/${id}/approve`, { approved_by: approvedBy }),

  /** submitted → rejected. */
  reject: (id, notes = null) =>
    post(`/calibrations/${id}/reject`, { notes }),
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboard = {
  stats: (site) =>
    request(`/dashboard/stats${toQueryString({ site })}`),

  alerts: (site) =>
    request(`/dashboard/alerts${toQueryString({ site })}`),

  complianceByArea: (site) =>
    request(`/dashboard/compliance-by-area${toQueryString({ site })}`),

  /** Instruments due in the next N days (default 30), sorted by due date. */
  upcoming: (site, days = 30) =>
    request(`/dashboard/upcoming${toQueryString({ site, days })}`),

  /** Top-10 instruments by as-found failure count in the last 12 months. */
  badActors: (site) =>
    request(`/dashboard/bad-actors${toQueryString({ site })}`),

  /** Smart recommendations feed: critical / advisory / optimisation. */
  recommendations: () =>
    request('/dashboard/recommendations'),
}

// ---------------------------------------------------------------------------
// Calibration Queue
// ---------------------------------------------------------------------------

export const queue = {
  /** List all queued instruments for the site (auto-cleans completed items). */
  list: () => request('/queue'),

  /** Add an instrument to the queue. */
  add: (instrumentId, notes = null) =>
    post('/queue', { instrument_id: instrumentId, notes }),

  /** Remove an instrument from the queue by instrument ID. */
  remove: (instrumentId) =>
    del(`/queue/${instrumentId}`),

  /** Update a queue item's priority. */
  setPriority: (instrumentId, priority) =>
    request(`/queue/${instrumentId}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    }),
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const documents = {
  /** List all documents for the site. */
  list: () => request('/documents'),

  /** Create a new document. */
  create: (data) => post('/documents', data),

  /** Update an existing document. */
  update: (id, data) => put(`/documents/${id}`, data),

  /** Delete a document. */
  delete: (id) => del(`/documents/${id}`),

  /** Get all documents linked to an instrument. */
  byInstrument: (instrumentId) => request(`/documents/by-instrument/${instrumentId}`),
}

// ---------------------------------------------------------------------------
// Billing / Stripe
// ---------------------------------------------------------------------------

export const billing = {
  /** Get current subscription status for the site. */
  subscription: () => request('/billing/subscription'),

  /** Create a Stripe Checkout session. Returns { url } to redirect to. */
  createCheckout: (plan, interval) =>
    post('/billing/create-checkout-session', { plan, interval }),

  /** Create a Stripe Customer Portal session. Returns { url } to redirect to. */
  createPortal: () =>
    post('/billing/create-portal-session', {}),
}

// ---------------------------------------------------------------------------
// Super-admin / platform operator
// ---------------------------------------------------------------------------

export const admin = {
  /** List every site with aggregate counts. Super-admin only. */
  listSites: () => request('/superadmin/sites'),

  /** Full detail + members list for a single site. */
  siteDetail: (id) => request(`/superadmin/sites/${id}`),

  /** Extend a site's trial. Pass either { days } or { new_end_date: ISO }. */
  extendTrial: (id, body) => post(`/superadmin/sites/${id}/extend-trial`, body),

  /** Override a site's plan + interval. Does not charge Stripe. */
  overridePlan: (id, plan, interval) =>
    post(`/superadmin/sites/${id}/override-plan`, { plan, interval }),

  /** Pause a site (subscription_status → cancelled). */
  pause:  (id) => post(`/superadmin/sites/${id}/pause`, {}),

  /** Resume a site. Optionally pass a status override. */
  resume: (id, status = null) =>
    post(`/superadmin/sites/${id}/resume`, status ? { status } : {}),

  /**
   * Hard-delete a site. confirm must exactly match the site's name.
   * 'CalCheq' and 'Demo' are refused by the backend.
   */
  deleteSite: (id, confirm) =>
    request(
      `/superadmin/sites/${id}${toQueryString({ confirm })}`,
      { method: 'DELETE' },
    ),

  /** Record the start of an impersonation session (audit marker). Call this
   *  BEFORE setting the X-Impersonate-Site-Id header so the audit row carries
   *  the super-admin's real identity. */
  impersonateStart: (id) => post(`/superadmin/sites/${id}/impersonate-start`, {}),

  /** Record the end of an impersonation session. Call this AFTER clearing
   *  sessionStorage so the X-Impersonate-Site-Id header isn't sent and the
   *  audit row carries the super-admin's real identity. */
  impersonateEnd:   (id) => post(`/superadmin/sites/${id}/impersonate-end`,   {}),
}

// ---------------------------------------------------------------------------
// Convenience re-export for one-line imports
// ---------------------------------------------------------------------------

const api = { instruments, calibrations, dashboard, queue, documents, billing, admin }
export default api
