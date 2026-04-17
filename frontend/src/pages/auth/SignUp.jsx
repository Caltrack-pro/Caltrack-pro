import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

// ---------------------------------------------------------------------------
// Plan options
// ---------------------------------------------------------------------------

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$199',
    period: '/month',
    description: 'Up to 200 instruments. Ideal for single-site teams.',
    features: ['200 instruments', 'Unlimited calibrations', 'ISO 9001 audit trail', 'PDF certificate generation', '3 team members'],
    highlight: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$449',
    period: '/month',
    description: 'Up to 1,000 instruments. Full feature set for serious programs.',
    features: ['1,000 instruments', 'Unlimited team members', 'Drift prediction engine', 'Beamex / Fluke CSV import', 'Priority support'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$899',
    period: '/month',
    description: 'Unlimited instruments. Multi-site and complex programs.',
    features: ['Unlimited instruments', 'Multi-site management', 'Dedicated onboarding', 'SLA-backed uptime', 'Custom integrations'],
    highlight: false,
  },
]

// ---------------------------------------------------------------------------
// Sub-components
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

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map((n, i) => (
        <>
          <div
            key={n}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${step >= n ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
          >
            {n}
          </div>
          {i < 1 && (
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SignUp() {
  const navigate = useNavigate()

  // Step 1 — plan selection
  const [step,          setStep]          = useState(1)
  const [selectedPlan,  setSelectedPlan]  = useState('professional')
  const [interval,      setInterval]      = useState('monthly')

  // Step 2 — account details
  const [siteName,      setSiteName]      = useState('')
  const [displayName,   setDisplayName]   = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [confirm,       setConfirm]       = useState('')
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState(false)
  const [loading,       setLoading]       = useState(false)

  // ── Submit account details ────────────────────────────────────────────────

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
      const { error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // After clicking the confirmation link Supabase redirects here.
          // AuthCallback.jsx exchanges the code, registers the site, and
          // then sends the user to Stripe Checkout for the chosen plan.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            site_name:        siteName.trim(),
            display_name:     displayName.trim() || null,
            plan_preference:  selectedPlan,
            billing_interval: interval,
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  const annualPrice = (plan) => {
    const monthly = parseInt(plan.price.replace('$', ''), 10)
    return `$${(monthly * 10).toLocaleString()}`
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (success) {
    const plan = PLANS.find(p => p.id === selectedPlan)
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
            <p className="text-sm text-slate-500 mb-4">
              We sent a confirmation link to <strong>{email}</strong>.
            </p>
            <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs font-semibold text-blue-700 mb-1">What happens next</p>
              <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                <li>Click the link in your email to confirm your address</li>
                <li>You'll be taken to checkout for the <strong>{plan?.name}</strong> plan</li>
                <li>After payment, your workspace is ready</li>
              </ol>
            </div>
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

  // ── Step 1: Plan selection ────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <Logo />

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Choose your plan</h2>
            <p className="text-sm text-slate-500 mt-1">30-day free trial on all plans — no credit card charged until after the trial</p>
          </div>

          {/* Monthly / Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                interval === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval('annual')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                interval === 'annual' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              Annual <span className="text-xs font-bold text-green-600 ml-1">2 months free</span>
            </button>
          </div>

          {/* Plan cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative text-left rounded-2xl border-2 p-5 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                {selectedPlan === plan.id && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <div className="font-bold text-slate-800 mb-1">{plan.name}</div>
                <div className="mb-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {interval === 'annual' ? annualPrice(plan) : plan.price}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {interval === 'annual' ? '/year' : plan.period}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-snug">{plan.description}</p>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-lg"
            >
              Continue with {PLANS.find(p => p.id === selectedPlan)?.name} →
            </button>
            <p className="text-xs text-slate-400 mt-3">
              All prices in AUD · Cancel anytime
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Step 2: Account details ───────────────────────────────────────────────

  const chosenPlan = PLANS.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <StepIndicator step={2} />

          <div className="mb-4">
            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-1"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {chosenPlan?.name} plan
            </button>
            <h2 className="text-lg font-semibold text-slate-800">Create your account</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Set up your calibration workspace
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
              <p className="text-xs text-slate-400 mt-1">Your tenant name — must be unique</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Jane Smith"
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
              {loading ? 'Creating account…' : 'Create Account & Continue to Checkout'}
            </button>

            <p className="text-xs text-center text-slate-400">
              You'll be redirected to checkout after confirming your email.
            </p>
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
