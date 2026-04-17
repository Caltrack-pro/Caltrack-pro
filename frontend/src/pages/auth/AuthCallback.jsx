import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase }    from '../../utils/supabase'
import { auth, billing } from '../../utils/api'

/**
 * /auth/callback
 *
 * Handles the redirect from Supabase after email confirmation.
 *
 * Flow:
 *  1. Exchange the one-time code for a session (PKCE) — or parse the hash (implicit).
 *  2. Call POST /api/auth/register to create the site + member row if it doesn't exist yet.
 *  3. If the user chose a plan during sign-up (stored in user_metadata.plan_preference),
 *     create a Stripe Checkout session and redirect there.
 *  4. Otherwise redirect to /app/onboarding.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Confirming your account…')
  const [error,  setError]  = useState('')

  useEffect(() => {
    async function handleCallback() {
      try {
        // ── 1. Exchange code for session ───────────────────────────────────
        const params = new URLSearchParams(window.location.search)
        const code   = params.get('code')

        if (code) {
          const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
          if (codeErr) throw codeErr
        }

        // getSession() also handles hash-based implicit flow automatically
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr) throw sessionErr
        if (!session) {
          // No session means the link may have already been used
          navigate('/auth/signin', { replace: true })
          return
        }

        // ── 2. Register site ───────────────────────────────────────────────
        setStatus('Setting up your workspace…')
        try {
          await auth.register()
        } catch (regErr) {
          // 409 = site already registered on a previous attempt — that's fine
          if (regErr?.status !== 409) {
            console.warn('Site registration error:', regErr)
            // Continue anyway; the site may already exist from a retry
          }
        }

        // ── 3. Redirect to Stripe if a plan was chosen during sign-up ─────
        const meta       = session.user.user_metadata ?? {}
        const plan       = meta.plan_preference
        const interval   = meta.billing_interval ?? 'monthly'

        if (plan) {
          setStatus('Redirecting to checkout…')
          try {
            const data = await billing.createCheckout(plan, interval)
            if (data?.url) {
              window.location.href = data.url
              return
            }
          } catch (checkoutErr) {
            // Non-fatal: fall through to onboarding; user can subscribe later from Settings
            console.warn('Stripe checkout error:', checkoutErr)
          }
        }

        // ── 4. Default: straight to onboarding ────────────────────────────
        navigate('/app/onboarding', { replace: true })

      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message ?? 'Something went wrong confirming your account.')
      }
    }

    handleCallback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Couldn't confirm your account</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <a
            href="/auth/signin"
            className="inline-block w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Back to Sign In
          </a>
          <p className="text-xs text-slate-400 mt-4">
            Confirmation links expire after 24 hours. If yours has expired,{' '}
            <a href="/auth/signup" className="text-blue-600 hover:underline">sign up again</a>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{status}</p>
      </div>
    </div>
  )
}
