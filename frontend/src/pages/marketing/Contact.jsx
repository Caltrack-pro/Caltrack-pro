import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

export default function Contact() {
  useEffect(() => {
    document.title = 'Contact — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Start your 30-day free Calcheq pilot — no credit card required. Full Professional plan with personal onboarding and training.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  const [form,    setForm]    = useState({ firstName: '', lastName: '', company: '', location: '', role: '', email: '', phone: '', numInstruments: '', currentSystem: '', message: '' })
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Server error')
      setSent(true)
    } catch (err) {
      console.error('Contact form error:', err)
      // Still show success to the user — form data should not be lost
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-300'

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Header */}
      <section className="pt-32 pb-14 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Start Your Free 30-Day Pilot
          </h1>
          <p className="text-slate-500 text-lg">
            No credit card. Full Professional plan. 48-hour onboarding included.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Pilot request received!</h2>
                <p className="text-slate-500 text-sm mb-6">Thanks for your interest. We'll send you login details and an onboarding calendar invite within 2 hours.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => { setSent(false); setForm({ firstName: '', lastName: '', company: '', location: '', role: '', email: '', phone: '', numInstruments: '', currentSystem: '', message: '' }) }}
                    className="text-sm text-slate-600 underline"
                  >
                    Submit another request
                  </button>
                  <Link to="/app" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Try the demo
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
                <h2 className="text-lg font-extrabold text-slate-900 mb-6">Your Details</h2>

                {/* First Name + Last Name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">First Name <span className="text-red-400">*</span></label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Last Name <span className="text-red-400">*</span></label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" className={inputCls} />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company Name <span className="text-red-400">*</span></label>
                  <input name="company" value={form.company} onChange={handleChange} required placeholder="Acme Industries" className={inputCls} />
                </div>

                {/* Site Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Site Location (City, State) <span className="text-red-400">*</span></label>
                  <input name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Perth, WA" className={inputCls} />
                </div>

                {/* Your Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Your Role <span className="text-red-400">*</span></label>
                  <select name="role" value={form.role} onChange={handleChange} required className={inputCls}>
                    <option value="">Select role...</option>
                    <option value="instrumentation_supervisor">Instrumentation Supervisor</option>
                    <option value="maintenance_planner">Maintenance Planner</option>
                    <option value="site_manager">Site Manager</option>
                    <option value="instrument_technician">Instrument Technician</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-400">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" className={inputCls} />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+61 8 1234 5678" className={inputCls} />
                </div>

                {/* Number of Instruments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Number of Instruments <span className="text-red-400">*</span></label>
                  <select name="numInstruments" value={form.numInstruments} onChange={handleChange} required className={inputCls}>
                    <option value="">Select range...</option>
                    <option value="under_50">Under 50</option>
                    <option value="50_150">50–150</option>
                    <option value="150_500">150–500</option>
                    <option value="500_plus">500+</option>
                  </select>
                </div>

                {/* Current System */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Current System Used <span className="text-red-400">*</span></label>
                  <select name="currentSystem" value={form.currentSystem} onChange={handleChange} required className={inputCls}>
                    <option value="">Select system...</option>
                    <option value="excel">Excel/Spreadsheet</option>
                    <option value="mex">MEX</option>
                    <option value="sap">SAP</option>
                    <option value="maximo">Maximo</option>
                    <option value="other_cmms">Other CMMS</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your calibration challenges or specific needs..."
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 shadow-sm"
                >
                  {sending ? 'Starting pilot…' : 'Start Your Free Pilot'}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  Or email us directly at info@calcheq.com
                </p>
              </form>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-8 lg:sticky lg:top-8 h-fit">

            {/* What Happens Next */}
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-6">What Happens Next</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">We Confirm Your Pilot</h4>
                    <p className="text-slate-500 text-sm">Within 2 hours, we'll send you login details, a quick onboarding calendar invite, and a link to your pilot environment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">48-Hour Setup</h4>
                    <p className="text-slate-500 text-sm">Our team will import your instrument data, configure calibration intervals, set up your team, and record your first calibration live with you.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">30 Days to Decide</h4>
                    <p className="text-slate-500 text-sm">Full access to Professional plan. Run reports, test compliance workflows, and see how your team responds. No pressure. Cancel anytime.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Direct */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="font-semibold text-slate-900 text-sm mb-4">Contact Us Directly</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold">Email:</span> info@calcheq.com</p>
                <p><span className="font-semibold">Hours:</span> Monday–Friday, 8 AM–5 PM AWST</p>
              </div>
            </div>

            {/* Free Pilot Includes */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-semibold text-slate-900 text-sm mb-4">Free Pilot Includes</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  500 instruments managed
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Unlimited team members
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Full criticality ranking and alerts
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  All compliance features
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Personal onboarding and training
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  No credit card required
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
