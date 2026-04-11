import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'
import { signInAsDemo } from '../../utils/userContext'

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ d, size = 6 }) {
  return (
    <svg className={`w-${size} h-${size}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ── Pain card ─────────────────────────────────────────────────────────────────

function PainCard({ title, body }) {
  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2" />
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-1">"{title}"</p>
          <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function Feature({ icon, title, body }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────

function Step({ num, title, body }) {
  return (
    <div className="text-center max-w-xs mx-auto">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
        {num}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  )
}

// ── FAQ accordion item ────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left flex items-start justify-between py-4 gap-4 hover:text-blue-600 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && <p className="text-sm text-slate-500 leading-relaxed pb-4">{a}</p>}
    </div>
  )
}

// ── Dashboard Preview ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl rounded-3xl" />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-200/50 border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-200 rounded-md h-5 flex items-center px-3">
              <span className="text-[10px] text-slate-500 font-mono">calcheq.com/app</span>
            </div>
          </div>
        </div>
        <div className="flex h-[340px]">
          <div className="w-44 bg-slate-900 flex-shrink-0 p-3 flex flex-col gap-1">
            <div className="px-2 py-1 mb-2">
              <div className="text-white text-xs font-bold opacity-90">Calcheq</div>
            </div>
            {['Dashboard', 'Instruments', 'Alerts', 'Approvals', 'Reports'].map((item, i) => (
              <div key={item} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-white' : 'bg-slate-600'}`} />
                <span className="text-[11px] font-medium">{item}</span>
              </div>
            ))}
            <div className="px-3 py-2 rounded-lg flex items-center gap-2 text-slate-400 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
              <span className="text-[11px] font-medium">Approvals</span>
              <span className="ml-auto text-[9px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">3</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Instruments', val: '222', color: 'text-slate-800' },
                { label: 'Overdue', val: '7', color: 'text-red-600' },
                { label: 'Due Soon', val: '14', color: 'text-amber-600' },
                { label: 'Compliance', val: '91%', color: 'text-green-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <p className="text-[9px] text-slate-500 mb-1 font-medium uppercase tracking-wide">{k.label}</p>
                  <p className={`text-lg font-extrabold ${k.color}`}>{k.val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="col-span-3 bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Compliance by Area</p>
                <div className="space-y-2">
                  {[{ area: 'Unit 1', pct: 88 }, { area: 'Unit 2', pct: 95 }, { area: 'SIS Loop', pct: 72 }, { area: 'Utilities', pct: 91 }].map(({ area, pct }) => (
                    <div key={area} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-14 flex-shrink-0">{area}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 w-7 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Criticality</p>
                <div className="space-y-1.5">
                  {[
                    { label: '🔴 SIS Critical', n: '7', color: 'text-red-600' },
                    { label: '🟡 Process', n: '43', color: 'text-amber-600' },
                    { label: '🟢 Reference', n: '172', color: 'text-green-600' },
                  ].map(({ label, n, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">{label}</span>
                      <span className={`text-[9px] font-bold ${color}`}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'PT-3001 OVERDUE — 🔴 SIS', color: 'bg-red-100 text-red-600 border-red-200' },
                { label: 'AT-1001 OVERDUE', color: 'bg-red-100 text-red-600 border-red-200' },
                { label: 'TT-2034 DUE SOON', color: 'bg-amber-100 text-amber-600 border-amber-200' },
              ].map(({ label, color }) => (
                <span key={label} className={`text-[9px] border rounded px-2 py-0.5 font-bold ${color}`}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Calcheq — Instrument Calibration Management for Australian Process Plants'
    const desc = document.querySelector('meta[name="description"]')
    const content = "Calcheq gives instrumentation and maintenance teams at Australian processing plants real-time visibility of every instrument's calibration status, compliance history, and asset risk — without the enterprise price tag."
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  async function openDemo() {
    try { await signInAsDemo() } catch { /* AuthGuard will redirect */ }
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Calcheq",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "url": "https://calcheq.com",
          "description": "Instrument calibration management software built for Australian process industries. Tracks calibration records, automates alerts, and ensures ISO 9001, AS/NZS ISO 17025, and IEC 61511 compliance.",
          "offers": { "@type": "Offer", "price": "199", "priceCurrency": "AUD", "description": "Starter plan from $199 AUD/month" },
          "publisher": { "@type": "Organization", "name": "Calcheq", "url": "https://calcheq.com", "email": "info@calcheq.com" }
        }) }}
      />
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                Purpose-built for Australian industry
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                Your calibration spreadsheet is a{' '}
                <span className="text-red-500">compliance liability</span>{' '}
                waiting to happen.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Calcheq gives instrumentation and maintenance teams at Australian processing plants real-time visibility of every instrument's calibration status, compliance history, and asset risk — in one place, without the enterprise price tag.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm">
                  Start Your 30-Day Pilot — Free →
                </Link>
                <button onClick={openDemo} className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  See the Live Demo
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">No credit card required · Full Professional plan · 48-hour onboarding</p>
              <div className="flex flex-wrap gap-3 mt-6">
                {['⚡ No IT Department Needed', '📋 Audit-Ready Certificates', '🇦🇺 Australian-Built', '🔒 Secure Cloud'].map(b => (
                  <span key={b} className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">{b}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <DashboardMockup />
              <p className="text-xs text-slate-400 text-center mt-3">Real-time calibration status across your entire instrument fleet</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-3">Sound familiar?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              These are the problems we hear from instrumentation teams every week.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">If any of these hit close to home, you need Calcheq.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PainCard title="We're still managing calibrations in Excel" body="Spreadsheets can't alert you when instruments go overdue, can't generate compliant certificates, and can't show you what's at risk — across multiple sites, simultaneously." />
            <PainCard title="We found out a safety-critical instrument was overdue — after the audit" body="Without real-time visibility and risk-based prioritisation, safety-critical instruments fall through the cracks. That's not just a compliance failure — it's a plant risk." />
            <PainCard title="Calibration certificates live in 3 different places" body="Email attachments, shared drives, and physical binders mean your compliance evidence is scattered. When an auditor arrives, it becomes a frantic search." />
            <PainCard title="We're reacting to failures instead of preventing them" body="Without degradation tracking and predictive alerts, your team is always one step behind — replacing instruments after they fail instead of before they cost you production." />
            <PainCard title="Enterprise CMMS is overkill for our instrumentation team" body="SAP, Maximo, and MEX are built for entire maintenance departments. They're expensive, complex to implement, and require IT teams — for a calibration problem that shouldn't need all that." />
            <PainCard title="We can't see across all our sites from one screen" body="Multi-site operations need a single dashboard. Without it, managers are chasing status updates by email and phone instead of acting on real data." />
          </div>
        </div>
      </section>

      {/* ── SOLUTION / FEATURES ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">The Solution</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Calibration intelligence, built for the way your team works
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Calcheq is not another generic asset management system. It is purpose-built for instrumentation and maintenance teams who need to manage calibrations, certifications, and asset health — without a six-month implementation project.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />} title="Real-Time Calibration Dashboard" body="Every instrument's calibration status — current, upcoming, and overdue — on a single screen. Filter by site, area, criticality, or due date. Know exactly what needs attention, right now." />
            <Feature icon={<Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />} title="Instrument Criticality Ranking" body="Assign instruments as Green (indication only), Yellow (process-critical), or Red (safety-critical SIS). Sort your overdue dashboard by risk so your team always works on what matters most." />
            <Feature icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} title="Compliant Calibration Certificates" body="Generate AS/NZS ISO 17025-aligned calibration certificates in one click. Full calibration history, measurement uncertainty, technician sign-off, and NATA traceability — audit ready, every time." />
            <Feature icon={<Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />} title="Degradation & Predictive Alerts" body="Calcheq tracks calibration drift over time. When an instrument shows a pattern of degradation, you get an alert before it fails — giving you time to plan maintenance, not react to breakdowns." />
            <Feature icon={<Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />} title="Spreadsheet Import Wizard" body="Already have instruments in Excel, MEX, or another CMMS? Our guided import wizard maps your existing data into Calcheq in minutes — not months. No IT department required." />
            <Feature icon={<Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />} title="Multi-Site Visibility" body="Manage calibrations across multiple sites from one account. Site managers see their area; operations leaders see everything. Role-based access ensures the right people see the right data." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Up and running in days, not months</h2>
            <p className="text-slate-500 max-w-xl mx-auto">No lengthy implementation projects. No IT consultants. Calcheq is designed for teams who need a solution this week, not next quarter.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Step num="1" title="Import Your Instruments" body="Upload your existing spreadsheet or use our guided template. We map your data, you review it." />
            <Step num="2" title="Set Calibration Schedules" body="Define intervals, assign technicians, and set alert thresholds for each instrument or instrument class." />
            <Step num="3" title="Record Calibrations" body="Log calibrations via desktop or mobile. Attach certificates, record as-found and as-left readings automatically." />
            <Step num="4" title="Stay Compliant, Stay Ahead" body="Dashboard alerts keep you ahead of due dates. Export compliance certificates on demand." />
          </div>
          <div className="text-center mt-10">
            <Link to="/how-it-works" className="text-sm font-semibold text-blue-600 hover:underline">See the full walkthrough →</Link>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Transparent Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Simple pricing. No surprises.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Priced for Australian processing plants — not global enterprise software budgets. Start with your 30-day free pilot, no credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Starter</p>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">$199 <span className="text-base font-normal text-slate-500">AUD/mo</span></p>
              <p className="text-xs text-slate-400 mb-5">Billed annually · Up to 150 instruments</p>
              <Link to="/contact" className="block text-center px-4 py-2.5 border border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 text-sm mb-5">Start Free Trial</Link>
              <ul className="space-y-2 text-sm text-slate-600">
                {['Calibration dashboard', 'Overdue alerts & email notifications', 'Compliance certificate export', 'Up to 5 users', 'Spreadsheet import wizard'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Professional */}
            <div className="bg-blue-600 rounded-2xl border border-blue-600 shadow-lg p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">MOST POPULAR</span>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Professional</p>
              <p className="text-3xl font-extrabold text-white mb-1">$449 <span className="text-base font-normal text-blue-200">AUD/mo</span></p>
              <p className="text-xs text-blue-300 mb-5">Billed annually · Up to 500 instruments</p>
              <Link to="/contact" className="block text-center px-4 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 text-sm mb-5">Start Free 30-Day Pilot</Link>
              <ul className="space-y-2 text-sm text-blue-100">
                {['Everything in Starter', 'Instrument criticality ranking (R/A/G)', 'Predictive degradation alerts', 'Risk-sorted overdue dashboard', 'Unlimited users', 'Calibrator data import (Beamex/Fluke)', 'Advanced reporting'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-white font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Enterprise */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Enterprise</p>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">Custom</p>
              <p className="text-xs text-slate-400 mb-5">Tailored to your operation · Unlimited instruments</p>
              <Link to="/contact" className="block text-center px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm mb-5">Talk to Sales</Link>
              <ul className="space-y-2 text-sm text-slate-600">
                {['Everything in Professional', 'Multi-site management', 'SAP / MEX / Maximo integration', 'Dedicated onboarding support', 'Custom compliance reporting', 'SLA-backed uptime guarantee', 'On-site training available'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">All plans include a 30-day free pilot with your real plant data. No credit card required. Cancel anytime during the trial.</p>
        </div>
      </section>

      {/* ── 30-DAY PILOT CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-2xl px-8 py-10 text-white">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">The 30-Day Pilot Offer</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">We'll set up Calcheq with your real instrument data.</h2>
              <p className="text-slate-300 max-w-xl mx-auto">Up to 500 instruments — have you live within 48 hours. No risk, no commitment, no IT project.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[['30 Days', 'Free Trial'], ['500', 'Instruments Included'], ['48h', 'Time to Go Live'], ['$0', 'No Credit Card']].map(([val, label]) => (
                <div key={label} className="bg-slate-800 rounded-xl px-4 py-5 text-center">
                  <p className="text-2xl font-extrabold text-blue-400 mb-1">{val}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/contact" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 text-sm shadow-lg">
                Claim Your Pilot Spot →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE BADGES ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">✅ Built for Australian Compliance</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-xl mx-auto">
            Calcheq calibration certificates are designed to meet or exceed the requirements of Australian and international calibration compliance standards — from ISO 17025 to IEC 61511 safety instrumented systems.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['AS/NZS ISO/IEC 17025:2017', 'NATA Traceability', 'IEC 61511 SIS', 'ISO 9001:2015', 'Work Health & Safety Act', 'ILAC-G24 / OIML D 10'].map(badge => (
              <span key={badge} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ STRIP ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Common Questions</h2>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-2">
            <FaqItem q="How long does it take to get set up?" a="Most teams are live within 48 hours of starting their pilot. You upload your instrument list (we accept Excel, CSV, and direct import from MEX), we map the data, and you're running." />
            <FaqItem q="We use MEX / SAP — can we import our existing instruments?" a="Yes. Calcheq includes a guided spreadsheet import wizard that supports Excel and CSV. For MEX users, we have a specific migration guide that maps MEX instrument fields directly to Calcheq. For SAP and Maximo, contact us — our Enterprise tier includes custom integration support." />
            <FaqItem q="Can technicians record calibrations in the field?" a="Calcheq is mobile browser-compatible, meaning technicians can record calibrations from any smartphone or tablet — including intrinsically safe tablets in hazardous areas. We also support CSV import from Beamex and Fluke documenting calibrators for paperless field workflows." />
            <FaqItem q="Are the calibration certificates compliant?" a="Yes. Calcheq generates certificates aligned with AS/NZS ISO/IEC 17025:2017, NATA traceability requirements, and ILAC-G24 guidelines — including as-found/as-left readings, measurement uncertainty, calibration standards used, technician sign-off, and next due date." />
            <FaqItem q="What's included in the 30-day pilot?" a="The full Professional plan — up to 500 instruments, all features, unlimited users — for 30 days at no cost. We'll onboard you with your real plant data so you see genuine value, not a demo. No credit card required, no automatic billing at the end." />
          </div>
          <div className="text-center mt-6">
            <Link to="/faq" className="text-sm font-semibold text-blue-600 hover:underline">See all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
            Ready to get your calibrations under control?
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Join Australian processing plants that have replaced spreadsheet chaos with real-time calibration intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
              Start Your Free 30-Day Pilot →
            </Link>
            <button onClick={openDemo} className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm">
              Explore the Demo
            </button>
          </div>
          <p className="text-blue-300 text-xs mt-6">No credit card · No lock-in · Cancel any time</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
