import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <img
        src="/assets/calcheq-logo-light.svg"
        alt="CalCheq"
        style={{ height: 52, width: 'auto' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sign In (2-step: company name → email + password)
// ---------------------------------------------------------------------------

export default function SignIn() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/app'

  const [step,        setStep]        = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  // ── Step 1: validate company name ────────────────────────────────────────

  async function handleCompanySubmit(e) {
    e.preventDefault()
    if (!companyName.trim()) return
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`/api/auth/check-site?name=${encodeURIComponent(companyName.trim())}`)
      const data = await res.json()
      if (!data.exists) {
        setError(`No account found for "${companyName}". Check the spelling or sign up.`)
      } else {
        setStep(2)
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: email + password sign-in ─────────────────────────────────────

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) {
        setError(authErr.message)
      } else {
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Your company</h2>
                <p className="text-sm text-slate-500 mt-0.5">Enter your company or site name to get started</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company / Site name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. IXOM"
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Checking…' : 'Continue'}
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-1"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {companyName}
                </button>
                <h2 className="text-lg font-semibold text-slate-800">Sign in</h2>
                <p className="text-sm text-slate-500 mt-0.5">Enter your credentials for {companyName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-right mt-1">
                  <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Demo shortcut */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">Want to explore without an account?</p>
            <button
              type="button"
              onClick={async () => {
                setLoading(true)
                setError('')
                const { error: err } = await supabase.auth.signInWithPassword({
                  email:    import.meta.env.VITE_DEMO_EMAIL    ?? 'demo@calcheq.com',
                  password: import.meta.env.VITE_DEMO_PASSWORD ?? 'CalcheqDemo2026',
                })
                setLoading(false)
                if (err) {
                  setError('Demo account unavailable — please sign up or contact support.')
                } else {
                  navigate('/app', { replace: true })
                }
              }}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              Try the Demo
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          New to CalCheq?{' '}
          <Link to="/auth/signup" className="text-blue-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
