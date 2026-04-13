import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

function Logo() {
  return (
    <div className="flex items-center gap-3 justify-center mb-8">
      <svg className="w-10 h-10 text-blue-500" viewBox="0 0 32 32" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.4 25.6A13 13 0 1 1 25.6 25.6" />
        <line x1="5"  y1="16" x2="7"  y2="16" strokeWidth="1.5" />
        <line x1="27" y1="16" x2="29" y2="16" strokeWidth="1.5" />
        <line x1="16" y1="3"  x2="16" y2="5"  strokeWidth="1.5" />
        <path d="M16 16 11 8" strokeWidth="2.5" stroke="#22C55E" />
        <circle cx="16" cy="16" r="2" fill="#22C55E" stroke="none" />
      </svg>
      <div>
        <div className="text-xl font-bold text-slate-900 leading-tight">Cal<span className="text-blue-500">Cheq</span></div>
        <div className="text-xs text-slate-500">Calibration Management</div>
      </div>
    </div>
  )
}

export default function SignUp() {
  const navigate = useNavigate()

  const [siteName,     setSiteName]     = useState('')
  const [displayName,  setDisplayName]  = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!siteName.trim()) {
      setError('Company name is required.')
      return
    }

    setLoading(true)
    try {
      // Create the Supabase auth user.
      // site_name and display_name are stored in user_metadata — the backend
      // reads these when /api/auth/register is called after first sign-in.
      const { error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            site_name:    siteName.trim(),
            display_name: displayName.trim() || null,
          },
        },
      })

      if (authErr) {
        setError(authErr.message)
        return
      }

      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-6">
              We sent a confirmation link to <strong>{email}</strong>.
              Click it to activate your account and sign in.
            </p>
            <Link
              to="/auth/signin"
              className="block w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                hover:bg-blue-700 transition-colors text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Create your account</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Set up your company's calibration workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company / Site name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="e.g. IXOM, Acme Industries"
                required
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">This is your tenant name — must be unique</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/auth/signin" className="text-blue-600 font-medium hover:underline">
            Sign in
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
