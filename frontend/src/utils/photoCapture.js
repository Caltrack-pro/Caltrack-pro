// Camera + storage helpers for the mobile calibration workflow.
//
// Two surfaces:
//   - capturePhoto()           — opens camera (native via @capacitor/camera,
//                                falls back to <input type=file capture> on web)
//   - uploadCalibrationPhoto() — sends a Blob to Supabase Storage at
//                                {site_name}/{uploadSessionId}/{filename} and
//                                returns the path stored in calibration_records.photo_urls
//   - signCalibrationPhotos()  — turns stored paths into short-lived signed URLs
//                                for display in the history slide-out

import { supabase } from './supabase'
import { isNative } from './platform'

const BUCKET = 'calibration-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 30   // 30 min — cover one viewing session

// ── capture ────────────────────────────────────────────────────────────────

export async function capturePhoto() {
  if (isNative()) return await _captureNative()
  return await _capturePickerWeb()
}

async function _captureNative() {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
  const { camera, photos } = await Camera.checkPermissions()
  if (camera !== 'granted' || photos !== 'granted') {
    const r = await Camera.requestPermissions({ permissions: ['camera', 'photos'] })
    if (r.camera !== 'granted') throw new Error('Camera permission denied')
  }
  const photo = await Camera.getPhoto({
    quality: 75,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Prompt,    // user picks Camera or Gallery
    saveToGallery: false,
    correctOrientation: true,
  })
  if (!photo?.base64String) throw new Error('No image captured')
  const blob = _base64ToBlob(photo.base64String, _mimeForFormat(photo.format))
  return { blob, ext: photo.format || 'jpeg' }
}

// On desktop the web fallback keeps the calibration form usable for
// admin/supervisor work even without a phone in hand.
function _capturePickerWeb() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'   // hint — phone browsers honour it
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return reject(new Error('No file selected'))
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      resolve({ blob: file, ext })
    }
    input.click()
  })
}

function _mimeForFormat(format) {
  const f = (format || 'jpeg').toLowerCase()
  if (f === 'png')  return 'image/png'
  if (f === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function _base64ToBlob(base64, mime) {
  const bin = atob(base64)
  const len = bin.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// ── upload ─────────────────────────────────────────────────────────────────

/**
 * Upload a captured photo to the calibration-photos bucket.
 * @param {object} args
 * @param {Blob}   args.blob
 * @param {string} args.ext              - 'jpg' | 'png' | 'webp'
 * @param {string} args.siteName         - tenant key (RLS first segment)
 * @param {string} args.uploadSessionId  - per-form UUID (groups photos for one record)
 * @returns {Promise<string>} - the object path stored in photo_urls
 */
export async function uploadCalibrationPhoto({ blob, ext, siteName, uploadSessionId }) {
  if (!siteName)        throw new Error('Site context not loaded — sign in again')
  if (!uploadSessionId) throw new Error('Upload session not initialised')

  const safeExt  = (ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const filename = `${Date.now()}_${crypto.randomUUID()}.${safeExt}`
  const path     = `${siteName}/${uploadSessionId}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || `image/${safeExt}`, upsert: false })

  if (error) throw new Error(error.message || 'Photo upload failed')
  return path
}

// ── signed URLs for read ───────────────────────────────────────────────────

/**
 * Sign storage paths for display. Returns array aligned to input order;
 * paths that fail signing yield null so callers can render a placeholder.
 */
export async function signCalibrationPhotos(paths) {
  if (!paths || paths.length === 0) return []
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
  if (error) return paths.map(() => null)
  return paths.map((p) => data.find((d) => d.path === p)?.signedUrl ?? null)
}

// ── delete (on undo) ───────────────────────────────────────────────────────

export async function deleteCalibrationPhoto(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}
