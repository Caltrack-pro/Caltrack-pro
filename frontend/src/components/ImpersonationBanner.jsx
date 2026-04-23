/**
 * Sticky red banner shown at the very top of the app layout while the
 * platform operator is impersonating another site. Hidden when no
 * impersonation is active. Listens for 'caltrack-impersonation-change' so
 * it updates without a full refresh when the session is started or exited
 * from elsewhere in the app.
 *
 * Exit flow:
 *   1. Clear sessionStorage (exitImpersonation) — next request drops header
 *   2. Call admin.impersonateEnd for the audit marker (without header,
 *      carries super-admin's real identity)
 *   3. Force a hard refresh so every in-memory query / cache re-fetches
 *      under the real identity instead of the impersonated one.
 */
import { useEffect, useState } from 'react'
import {
  exitImpersonation,
  getImpersonationSiteId,
  getImpersonationSiteName,
} from '../utils/userContext'
import { admin } from '../utils/api'

export default function ImpersonationBanner() {
  const [state, setState] = useState(() => ({
    id:   getImpersonationSiteId(),
    name: getImpersonationSiteName(),
  }))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function onChange() {
      setState({ id: getImpersonationSiteId(), name: getImpersonationSiteName() })
    }
    window.addEventListener('caltrack-impersonation-change', onChange)
    return () => window.removeEventListener('caltrack-impersonation-change', onChange)
  }, [])

  if (!state.id) return null

  async function onExit() {
    if (busy) return
    setBusy(true)
    const id = state.id
    exitImpersonation()  // clear header BEFORE calling end, so audit sees real identity
    try {
      await admin.impersonateEnd(id)
    } catch { /* non-fatal — session is already ended client-side */ }
    // Full reload forces every page's in-memory state to re-fetch under the
    // super-admin's real identity. Simpler and safer than trying to invalidate
    // every query + component cache manually.
    window.location.assign('/app/admin')
  }

  return (
    <div
      role="alert"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#DC2626',
        color: '#fff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <span aria-hidden="true">⚠</span>
      <span>
        Impersonating <strong>{state.name ?? 'unknown site'}</strong> — all actions are scoped
        to this site and audit-logged under your real identity.
      </span>
      <button
        onClick={onExit}
        disabled={busy}
        style={{
          marginLeft: 'auto',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Exiting…' : 'Exit impersonation'}
      </button>
    </div>
  )
}
