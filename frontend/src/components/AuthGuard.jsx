import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { waitForInit } from '../utils/userContext'

/**
 * Wraps /app/* routes. Redirects to /auth/signin if there is no active
 * Supabase session. Shows a loading spinner while the initial session
 * check is in progress (prevents flash of the sign-in page on hard refresh).
 */
export default function AuthGuard({ children }) {
  const location = useLocation()
  // undefined = still loading, null = no session, object = session present
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Wait for userContext.js to finish its first session check so that
    // the module-level cache is warm before we decide to redirect.
    waitForInit().then(() => {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s ?? null)
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  return children
}
