import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isNative } from '../utils/platform'
import { scanBarcode, CameraPermissionDeniedError } from '../utils/barcodeScanner'
import { instruments as instrumentsApi } from '../utils/api'
import { ToastContainer, useToast } from './Toast'

// Floating "scan instrument tag" button for the field-tech workflow.
//
// Visible only on:
//   - native shell (iOS/Android via Capacitor)
//   - the Dashboard or Instrument List screens
// Hidden on non-native web per spec — desktop users have no camera affordance.
//
// On tap: opens the ML Kit native scanner UI; the scanned tag is looked up
// via GET /api/instruments/by-tag/{tag} and navigates to the detail page.

const VISIBLE_PATHS = ['/app', '/app/instruments']

export default function ScanFab() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { toasts, showToast, dismissToast } = useToast()
  const [busy, setBusy] = useState(false)

  if (!isNative()) return null
  if (!VISIBLE_PATHS.includes(pathname)) return null

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      const tag = await scanBarcode()
      if (!tag) return  // user cancelled

      try {
        const instr = await instrumentsApi.byTag(tag)
        navigate(`/app/instruments/${instr.id}`)
      } catch (err) {
        if (err?.status === 404) {
          showToast(`No instrument with tag '${tag}' on this site`, 'error')
        } else {
          showToast(err?.message || 'Lookup failed — try again', 'error')
        }
      }
    } catch (err) {
      if (err instanceof CameraPermissionDeniedError) {
        showToast('Camera permission required — enable it in device settings', 'error')
      } else {
        showToast(err?.message || 'Scan failed — try again', 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        aria-label="Scan instrument tag"
        className="fixed z-40 right-5
                   bottom-[calc(72px+env(safe-area-inset-bottom,0px))]
                   w-14 h-14 rounded-full
                   bg-blue-600 text-white text-2xl
                   shadow-lg shadow-blue-600/30
                   flex items-center justify-center
                   active:scale-95 transition-transform
                   disabled:opacity-60"
      >
        {busy ? '…' : '📷'}
      </button>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
