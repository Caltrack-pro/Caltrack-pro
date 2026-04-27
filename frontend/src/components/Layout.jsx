import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import ScanFab from './ScanFab'
import Header from './Header'
import DemoBlockModal from './DemoBlockModal'
import ImpersonationBanner from './ImpersonationBanner'
import BiometricLockOverlay from './BiometricLockOverlay'
import { calibrations as calsApi } from '../utils/api'
import { isNative, useIsMobile } from '../utils/platform'
import { getUser } from '../utils/userContext'
import { isBiometricEnabled } from '../utils/biometricLock'

export default function Layout() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [pendingCount, setPendingCount] = useState(0)
  const [user, setUserState] = useState(() => getUser())

  // Track user (for role-aware nav gating in BottomNav / MoreSheet)
  useEffect(() => {
    function onUserChange(e) { setUserState(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  // Pending approval count for sidebar / bottom-nav badge
  useEffect(() => {
    let cancelled = false
    calsApi.list({ record_status: 'submitted', limit: 1 })
      .then(res => { if (!cancelled) setPendingCount(res?.total ?? 0) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // 402 subscription-required → redirect to billing
  useEffect(() => {
    function handler() { navigate('/app/settings?billing=required') }
    window.addEventListener('caltrack-subscription-required', handler)
    return () => window.removeEventListener('caltrack-subscription-required', handler)
  }, [navigate])

  // ── Biometric re-lock on app resume (native only) ────────────────────────
  // Lock immediately on first mount if biometric is enabled, and re-lock
  // whenever the app returns from the background. The OS already pauses the
  // WebView while we're backgrounded, so all we need is the resume signal.
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!isNative()) return
    let cancelled = false
    let removeListener = null

    isBiometricEnabled().then((enabled) => {
      if (cancelled || !enabled) return
      setLocked(true)
      // Lazy import so the web bundle never pulls Capacitor App.
      import('@capacitor/app').then(({ App }) => {
        if (cancelled) return
        const sub = App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // Returned to foreground — re-prompt.
            isBiometricEnabled().then((stillEnabled) => {
              if (stillEnabled) setLocked(true)
            })
          }
        })
        // Capacitor 6 returns either a sync handle or a Promise<handle>.
        Promise.resolve(sub).then((s) => { removeListener = () => s.remove() })
      })
    })

    return () => {
      cancelled = true
      if (removeListener) removeListener()
    }
  }, [])

  const role         = user?.role ?? 'readonly'
  const isSuperadmin = user?.isSuperadmin === true

  // ── Mobile layout: bottom nav, no sidebar, FAB on Dashboard / InstrumentList ──
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        <ImpersonationBanner />
        <Header />

        <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
          <div className="p-4">
            <Outlet />
          </div>
        </main>

        <BottomNav
          pendingCount={pendingCount}
          role={role}
          isSuperadmin={isSuperadmin}
        />
        <ScanFab />
        <DemoBlockModal />
        {locked && <BiometricLockOverlay onUnlock={() => setLocked(false)} />}
      </div>
    )
  }

  // ── Desktop layout: persistent sidebar (unchanged) ──
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="static z-auto">
        <Sidebar pendingCount={pendingCount} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImpersonationBanner />
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <DemoBlockModal />
      {locked && <BiometricLockOverlay onUnlock={() => setLocked(false)} />}
    </div>
  )
}
