import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

// META: Contact Calcheq — get in touch for a demo, support, or pricing enquiries for our instrument calibration management platform.

function InfoCard({ icon, title, body, action, actionLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-3">{body}</p>
      {action && (
        <a href={action} className="text-sm font-semibold text-blue-600 hover:underline">
          {actionLabel}
        </a>
      )}
    </div>
  )
}

export default function Contact() {
  const [form,    setForm]    = useState({ name: '', company: '', email: '', industry: '', message: '', type: 'general' })
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    // Simulate send delay
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 1200)
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-300'

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Header */}
      <section className="pt-32 pb-14 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Get in touch
          </h1>
          <p className="text-slate-500 text-lg">
            Whether you want a demo, have a question, or need an Enterprise quote — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10">

          {/* Left: contact info */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              }
              title="Email us"
              body="For general enquiries, demo requests, or support questions."
              action="mailto:info@calcheq.com"
              actionLabel="info@calcheq.com"
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              }
              title="Request a demo"
              body="We'll walk you through the full system with your own instruments and workflows in mind."
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              title="Check the FAQ"
              body="Many common questions are answered on our FAQ page — worth a look before reaching out."
            />

            {/* Quick links */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3 text-lg">Jump straight in</h3>
              <p className="text-blue-200 text-sm mb-5">The demo is fully functional — no sign-up required. See everything before you commit.</p>
              <Link
                to="/app"
                className="block text-center py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Open Demo App →
              </Link>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Message sent!</h2>
                <p className="text-slate-500 text-sm mb-6">Thanks for reaching out. We'll get back to you within one business day.</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { setSent(false); setForm({ name:'', company:'', email:'', industry:'', message:'', type:'general' }) }}
                    className="text-sm text-slate-600 underline"
                  >
                    Send another message
                  </button>
                  <Link to="/app" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Try the app
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
                <h2 className="text-lg font-extrabold text-slate-900 mb-1">Send us a message</h2>

                {/* Enquiry type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">I'm interested in</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'general',    label: 'General enquiry' },
                      { value: 'demo',       label: 'Request a demo' },
                      { value: 'pricing',    label: 'Pricing / quote' },
                      { value: 'enterprise', label: 'Enterprise plan' },
                      { value: 'support',    label: 'Technical support' },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-colors ${
                          form.type === opt.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + company */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name <span className="text-red-400">*</span></label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="John Smith" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Industries" className={inputCls} />
                  </div>
                </div>

                {/* Email + industry */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email <span className="text-red-400">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Industry</label>
                    <select name="industry" value={form.industry} onChange={handleChange} className={inputCls}>
                      <option value="">Select industry...</option>
                      <option value="oil_gas">Oil &amp; Gas</option>
                      <option value="chemical">Chemical Processing</option>
                      <option value="food_bev">Food &amp; Beverage</option>
                      <option value="pharma">Pharmaceuticals</option>
                      <option value="power">Power Generation</option>
                      <option value="mining">Mining</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Message <span className="text-red-400">*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your team, your instrument fleet, or what you'd like to see in a demo..."
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 shadow-sm"
                >
                  {sending ? 'Sending…' : 'Send message →'}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  We respond within one business day. Your details are never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
