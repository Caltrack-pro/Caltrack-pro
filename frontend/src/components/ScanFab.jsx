import { useLocation } from 'react-router-dom'
import { isNative } from '../utils/platform'

// Floating "scan instrument tag" button for the field-tech workflow.
//
// Visible only on:
//   - native shell (iOS/Android via Capacitor)
//   - the Dashboard or Instrument List screens
// Hidden on non-native web per spec — desktop users have no camera affordance.
//
// Phase 2: button renders + logs intent. Phase 3 wires the actual barcode
// scanner (@capacitor-mlkit/barcode-scanning) and instrument lookup flow.

const VISIBLE_PATHS = ['/app', '/app/instruments']

export default function ScanFab() {
  const { pathname } = useLocation()

  if (!isNative()) return null
  if (!VISIBLE_PATHS.includes(pathname)) return null

  function handleClick() {
    // Phase 3 will replace this with the BarcodeScanner component invocation.
    // Keeping a no-op handler here keeps Phase 2 self-contained and testable.
    console.info('[ScanFab] Phase 3 will wire @capacitor-mlkit/barcode-scanning here')
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Scan instrument tag"
      className="fixed z-40 right-5
                 bottom-[calc(72px+env(safe-area-inset-bottom,0px))]
                 w-14 h-14 rounded-full
                 bg-blue-600 text-white text-2xl
                 shadow-lg shadow-blue-600/30
                 flex items-center justify-center
                 active:scale-95 transition-transform"
    >
      📷
    </button>
  )
}
