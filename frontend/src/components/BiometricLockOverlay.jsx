import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyBiometric, getBiometryName } from '../utils/biometricLock'
import { signOut } from '../utils/userContext'

// Full-screen lock shown when the app comes back to the foreground after a
// background interval. Mounted by Layout when `locked` is true. Calls
// `onUnlock()` after a successful biometric prompt; lets the user sign out
// via the cancel path so a stuck biometric never strands them in the app.

export default function BiometricLockOverlay({ onUnlock }) {
  const navigate = useNavigate()
  const [biometryName, setBiometryName] = useState('Biometric')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Resolve the device's biometry label once on mount so the prompt copy
  // matches the hardware ("Use Face ID" vs "Use Fingerprint").
  useEffect(() => {
    let cancelled = false
    getBiometryName().then((n) => { if (!cancelled) setBiometryName(n) })
    return () => { cancelled = true }
  }, [])

  // Auto-trigger the biometric prompt on first mount. The OS owns the UI,
  // so the page behind the overlay just shows the brand mark + status.
  useEffect(() => {
    runPrompt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runPrompt() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const ok = await verifyBiometric(`Unlock CalCheq with ${biometryName}`)
      if (ok) {
        onUnlock?.()
      } else {
        setError(`${biometryName} not recognised. Tap to try again, or sign out.`)
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth/signin', { replace: true })
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0B1F3A] text-white flex flex-col items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="App locked"
    >
      <div className="text-6xl mb-4" aria-hidden="true">🔒</div>
      <h1 className="text-2xl font-semibold mb-1">CalCheq is locked</h1>
      <p className="text-sm text-slate-300 mb-8">
        Use {biometryName} to continue.
      </p>

      {error && (
        <p className="text-sm text-amber-300 mb-4 text-center max-w-xs">{error}</p>
      )}

      <button
        type="button"
        onClick={runPrompt}
        disabled={busy}
        className="w-full max-w-xs py-3 mb-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
      >
        {busy ? 'Waiting…' : `Unlock with ${biometryName}`}
      </button>

      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm text-slate-400 underline"
      >
        Sign out instead
      </button>
    </div>
  )
}
