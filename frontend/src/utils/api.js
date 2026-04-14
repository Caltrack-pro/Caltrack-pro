/**
 * Calcheq — API service layer
 * All communication with the FastAPI backend goes through here.
 * Base URL reads from the Vite proxy (dev) or an env variable (prod).
 */

import { supabase } from './supabase'

const BASE_URL = '/api'

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

  let response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
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
    const formData = new FormData()
    formData.append('file', file)
    let response
    try {
      response = await fetch(`${BASE_URL}/instruments/bulk-import?dry_run=${dryRun}`, {
        method: 'POST',
        headers: { ...authHeader },  // no Content-Type — let browser set multipart boundary
        body: formData,
      })
    } catch (networkErr) {
      throw new ApiError('Cannot reach the server', 0, networkErr.message)
    }
    if (!response.ok) {
      let detail = response.statusText
      try { const b = await response.json(); detail = b.detail ?? detail } catch {}
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
// Convenience re-export for one-line imports
// ---------------------------------------------------------------------------

const api = { instruments, calibrations, dashboard, queue, documents }
export default api
