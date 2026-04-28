// Document file upload helpers.
//
// Mirrors photoCapture.js's pattern: the browser uploads directly to Supabase
// Storage (RLS enforces site isolation) and we only persist the storage path
// in our DB row. Uploads do NOT proxy through FastAPI.
//
// Bucket: 'documents' (private, 25 MB cap, common office + image MIME types).
// Path:   {site_name}/{document_uuid}/{original_filename}
//
// uploadDocumentFile()  — sends a File/Blob to Supabase Storage, returns the path.
// signDocumentUrl()     — turns a stored path into a short-lived signed URL.
// deleteDocumentFile()  — removes the object (best-effort; UI continues even if it fails).

import { supabase } from './supabase'

const BUCKET = 'documents'
const SIGNED_URL_TTL_SECONDS = 60 * 30   // 30 min — covers a download + a re-click

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

const MAX_BYTES = 25 * 1024 * 1024

// Replace anything that isn't safe in a Supabase Storage object name.
// Supabase rejects objects whose names contain certain characters (spaces are OK
// but signed URLs handle them awkwardly); collapse them to underscores.
function _safeName(filename) {
  const trimmed = (filename || 'upload').trim()
  return trimmed.replace(/[^A-Za-z0-9._-]/g, '_').replace(/_+/g, '_').slice(0, 200) || 'upload'
}

/**
 * Upload a file to the documents bucket.
 * @param {object} args
 * @param {File|Blob} args.file
 * @param {string} args.siteName     - tenant key (RLS first segment)
 * @param {string} args.documentId   - UUID grouping for this doc's files
 * @returns {Promise<{path: string, fileName: string, fileSize: number, contentType: string}>}
 */
export async function uploadDocumentFile({ file, siteName, documentId }) {
  if (!file) throw new Error('No file selected')
  if (!siteName) throw new Error('Site context not loaded — sign in again')
  if (!documentId) throw new Error('Document ID not initialised')

  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — 25 MB max`)
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error(`Unsupported file type (${file.type}). Allowed: PDF, Word, Excel, PowerPoint, text, images.`)
  }

  const originalName = _safeName(file.name || 'upload')
  const path = `${siteName}/${documentId}/${originalName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: true })

  if (error) throw new Error(error.message || 'File upload failed')

  return {
    path,
    fileName: originalName,
    fileSize: file.size,
    contentType: file.type || 'application/octet-stream',
  }
}

/**
 * Create a signed download URL for a stored path.
 * Returns null if signing fails (caller should fall back gracefully).
 */
export async function signDocumentUrl(path) {
  if (!path) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, { download: true })
  if (error) return null
  return data?.signedUrl || null
}

/**
 * Delete one or more storage objects. Best-effort — does not throw.
 */
export async function deleteDocumentFiles(paths) {
  const list = (Array.isArray(paths) ? paths : [paths]).filter(Boolean)
  if (list.length === 0) return
  try {
    await supabase.storage.from(BUCKET).remove(list)
  } catch (_) {
    // swallow — DB row deletion already happened; storage cleanup is best-effort
  }
}
