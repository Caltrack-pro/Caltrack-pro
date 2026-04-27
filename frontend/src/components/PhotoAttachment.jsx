import { useEffect, useMemo, useState } from 'react'
import {
  capturePhoto,
  uploadCalibrationPhoto,
  signCalibrationPhotos,
  deleteCalibrationPhoto,
} from '../utils/photoCapture'

// Photo attachment grid for the CalibrationForm.
//
// Each thumbnail represents one entry in `value` (an array of storage paths).
// The "Add photo" tile triggers the camera/picker, uploads to Supabase Storage,
// and appends the new path. The X button on each thumbnail removes the upload
// from the bucket and from the value array.
//
// All photos for one form session live under a single `uploadSessionId`
// prefix, so the bucket can be GC'd by prefix later if a form is abandoned.

export default function PhotoAttachment({
  value = [],
  onChange,
  siteName,
  uploadSessionId,
  disabled = false,
  onError,
}) {
  const [busy, setBusy] = useState(false)
  const [signed, setSigned] = useState([])

  // Re-sign whenever the path list changes. Signed URLs expire (30 min) but
  // the form is rarely open that long; we live with a refresh-on-mount.
  useEffect(() => {
    let cancelled = false
    if (!value || value.length === 0) { setSigned([]); return }
    signCalibrationPhotos(value).then((urls) => {
      if (!cancelled) setSigned(urls)
    })
    return () => { cancelled = true }
  }, [value])

  const tiles = useMemo(() => value.map((path, i) => ({ path, url: signed[i] ?? null })), [value, signed])

  async function handleAdd() {
    if (busy || disabled) return
    setBusy(true)
    try {
      const { blob, ext } = await capturePhoto()
      const path = await uploadCalibrationPhoto({ blob, ext, siteName, uploadSessionId })
      onChange([...(value || []), path])
    } catch (err) {
      // Treat user cancel quietly — Capacitor throws "User cancelled photos app"
      const msg = err?.message || ''
      if (/cancel/i.test(msg) || /no file selected/i.test(msg) || /no image captured/i.test(msg)) return
      onError?.(msg || 'Could not attach photo')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(path) {
    if (busy) return
    onChange(value.filter((p) => p !== path))
    try { await deleteCalibrationPhoto(path) } catch { /* best-effort */ }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {tiles.map(({ path, url }) => (
          <div key={path} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            {url
              ? <img src={url} alt="Calibration evidence" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading…</div>}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(path)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!disabled && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 text-slate-500 text-sm flex flex-col items-center justify-center gap-1 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
          >
            <span className="text-2xl leading-none">{busy ? '…' : '📷'}</span>
            <span className="text-xs">{busy ? 'Uploading…' : 'Add photo'}</span>
          </button>
        )}
      </div>

      {value.length === 0 && !disabled && (
        <p className="mt-2 text-xs text-slate-500">
          Optional — attach photos of the instrument tag, install location, or post-cal evidence.
        </p>
      )}
    </div>
  )
}
