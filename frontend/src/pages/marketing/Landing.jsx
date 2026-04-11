import { useEffect } from 'react'
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

function PainCard({ icon, text }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-red-100 shadow-sm px-5 py-4">
      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  )
}

// ── Outcome card ──────────────────────────────────────────────────────────────

function OutcomeCard({ icon, title, body }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
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

// ── Industry badge ────────────────────────────────────────────────────────────

function Industry({ emoji, name }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3.5">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-slate-700">{name}</span>
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

// ── Dashboard Preview (SVG mockup) ────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl rounded-3xl" />

      {/* Browser chrome */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-200/50 border border-slate-200 overflow-hidden">
        {/* Title bar */}
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

        {/* App layout */}
        <div className="flex h-[340px]">
          {/* Sidebar */}
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
            {/* Alert badge row */}
            <div className="px-3 py-2 rounded-lg flex items-center gap-2 text-slate-400 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
              <span className="text-[11px] font-medium">Approvals</span>
              <span className="ml-auto text-[9px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">3</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Instruments', val: '30', color: 'text-slate-800' },
                { label: 'Overdue', val: '6', color: 'text-red-600' },
                { label: 'Due Soon', val: '5', color: 'text-amber-600' },
                { label: 'Compliance', val: '78%', color: 'text-green-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <p className="text-[9px] text-slate-500 mb-1 font-medium uppercase tracking-wide">{k.label}</p>
                  <p className={`text-lg font-extrabold ${k.color}`}>{k.val}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {/* Compliance donut placeholder */}
              <div className="col-span-3 bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Compliance by Area</p>
                <div className="space-y-2">
                  {[
                    { area: 'Unit 1', pct: 72 },
                    { area: 'Unit 2', pct: 85 },
                    { area: 'Unit 3', pct: 55 },
                    { area: 'Utilities', pct: 90 },
                  ].map(({ area, pct }) => (
                    <div key={area} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-12 flex-shrink-0">{area}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 w-7 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming list */}
              <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Upcoming</p>
                <div className="space-y-1.5">
                  {[
                    { tag: 'LT-1023', days: 7,  color: 'bg-red-100 text-red-600' },
                    { tag: 'TT-2034', days: 9,  color: 'bg-amber-100 text-amber-600' },
                    { tag: 'PT-2001', days: 10, color: 'bg-amber-100 text-amber-600' },
                    { tag: 'CV-2001', days: 11, color: 'bg-amber-100 text-amber-600' },
                  ].map(({ tag, days, color }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-slate-700">{tag}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${color}`}>{days}d</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alert chips */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'PT-1001 OVERDUE', color: 'bg-red-100 text-red-600 border-red-200' },
                { label: 'TT-3001 FAILED', color: 'bg-red-100 text-red-600 border-red-200' },
                { label: 'AT-1001 OVERDUE', color: 'bg-red-100 text-red-600 border-red-200' },
                { label: 'FT-1045 DUE SOON', color: 'bg-amber-100 text-amber-600 border-amber-200' },
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
    document.title = 'Calcheq — Instrument Calibration Management for Process Industries'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Stop chasing overdue calibrations in spreadsheets. Calcheq gives your instrumentation team a single source of truth for every calibration record, alert, and due date — built for oil & gas, chemical, pharma, and manufacturing sites.'
    if (desc) desc.setAttribute('content', content)
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = content
      document.head.appendChild(m)
    }
  }, [])

  async function openDemo() {
    try {
      await signInAsDemo()
    } catch {
      // If demo sign-in fails, still navigate — AuthGuard will redirect to sign-in
    }
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
          "description": "Instrument calibration management software built for process industries. Tracks calibration records, automates alerts, and ensures ISO 9001 and ISO 17025 compliance.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "AUD",
            "description": "Free trial available"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Calcheq",
            "url": "https://calcheq.com",
            "email": "info@calcheq.com"
          }
        }) }}
      />
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                Built for oil & gas, chemical, and process industries
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                Your pressure transmitters won't calibrate{' '}
                <span className="text-red-500">themselves.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Most sites manage calibrations through a tangle of spreadsheets, paper records, and memory. When an auditor asks for the as-found history on a safety-critical loop — you need to know the answer in seconds, not days.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm"
                >
                  Book a demo →
                </Link>
                <button
                  onClick={openDemo}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  See how it works
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">Site-based pricing from $99/month · Free 30-day trial</p>
            </div>

            {/* Right: mockup */}
            <div className="relative">
              <DashboardMockup />
              <p className="text-xs text-slate-400 text-center mt-3">Know your entire calibration status at a glance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-3">Sound familiar?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              The spreadsheet problem never goes away.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Most E&I teams manage calibration with a mix of Excel, shared drives, and individual memory — until something breaks, or an auditor arrives.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PainCard
              icon={<Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={4} />}
              text="Overdue calibrations hidden in a spreadsheet that no one checks until shutdown week — then the scramble begins."
            />
            <PainCard
              icon={<Icon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" size={4} />}
              text="Calibration certificates scattered across shared drives, email attachments, and paper folders — try finding the right one at 2am."
            />
            <PainCard
              icon={<Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={4} />}
              text="A flow meter that's failed three consecutive calibrations — and nobody noticed because the data lives in three different files."
            />
            <PainCard
              icon={<Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={4} />}
              text="A key technician leaves — and takes with them the site-specific knowledge of which instruments run hot, which drift predictably, which are problem children."
            />
            <PainCard
              icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={4} />}
              text="ISO 9001 or ISO 17025 audit incoming — and you spend a week manually pulling records to prove calibration status you should know instantly."
            />
            <PainCard
              icon={<Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={4} />}
              text="No visibility into instrument drift until a loop calibration fails completely — by which time process quality or safety may already be compromised."
            />
          </div>
        </div>
      </section>

      {/* ── OUTCOME SECTION ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3">Life after Calcheq</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Your team always knows where every instrument stands.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Outcomes — not features. Here's what changes when your calibration program has a single source of truth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <OutcomeCard
              icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              title="Know your calibration status at a glance"
              body="Open the dashboard and see exactly how many instruments are overdue, due this week, and failing — by area, by type, by criticality. No manual counting. No spreadsheet formulas."
            />
            <OutcomeCard
              icon={<Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
              title="Find any instrument's full history in seconds"
              body="Search any tag number. See every as-found and as-left reading, every adjustment, every approval — going back as far as your records exist. Ready for any audit, any time."
            />
            <OutcomeCard
              icon={<Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
              title="Catch problems before they become failures"
              body="Overdue alerts arrive before instruments are missed. Consecutive-failure alerts flag the bad actors automatically. Drift prediction surfaces instruments that are likely to fail before they do."
            />
            <OutcomeCard
              icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
              title="Every calibration properly reviewed and approved"
              body="Technicians log as-found and as-left readings in the field. Records go through a formal submit → supervisor approval workflow. No more unsigned calibration certificates."
            />
            <OutcomeCard
              icon={<Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
              title="Spot drift before it costs you"
              body="Linear regression on historical calibration data shows you which loops are trending towards failure — months before the next calibration is due. Prioritise your shutdown work accordingly."
            />
            <OutcomeCard
              icon={<Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
              title="Institutional knowledge that stays when people leave"
              body="Every calibration record is tied to a technician, a date, a result, and a set of readings. When someone leaves, the history stays. New team members can see exactly what's been done and why."
            />
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-2xl px-8 py-10 text-white">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Built from a real problem</p>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                  Calcheq started on a real process plant — because the existing tools weren't good enough.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  The original problem was simple: a large chlor-alkali facility was managing hundreds of instrument calibrations across Excel sheets uploaded to a CMMS. Due dates were missed. Failures were discovered late. When auditors came, the preparation took days.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Calcheq was built specifically to fix that — and it's been refined against the reality of process plant instrumentation ever since. If you manage pressure transmitters, flow meters, temperature elements, or any loop that requires documented calibration, this was built for you.
                </p>
              </div>
              <div className="flex-shrink-0 md:w-48 flex flex-col gap-3">
                <div className="bg-slate-800 rounded-xl px-5 py-4 text-center">
                  <p className="text-2xl font-extrabold text-blue-400 mb-1">1–20</p>
                  <p className="text-xs text-slate-400">Test points per calibration</p>
                </div>
                <div className="bg-slate-800 rounded-xl px-5 py-4 text-center">
                  <p className="text-2xl font-extrabold text-green-400 mb-1">5 roles</p>
                  <p className="text-xs text-slate-400">Built-in access control</p>
                </div>
                <div className="bg-slate-800 rounded-xl px-5 py-4 text-center">
                  <p className="text-2xl font-extrabold text-amber-400 mb-1">ISO</p>
                  <p className="text-xs text-slate-400">9001 &amp; 17025 aligned</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Up and running in days — not months.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No consultant required. No six-month implementation. Import your instrument register via CSV and your team is logging calibrations on day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            <Step
              num="1"
              title="Import your instrument register"
              body="Upload a CSV from your existing CMMS or spreadsheet. Every instrument — with tag number, calibration interval, tolerance, and test point definitions — lands in Calcheq within minutes."
            />
            <Step
              num="2"
              title="Your team signs in and starts logging"
              body="Technicians, planners, and supervisors each get their own login. Their name goes on every record they create or approve. Full traceability from day one."
            />
            <Step
              num="3"
              title="Calibrate, approve, and track drift"
              body="Log as-found and as-left readings per test point in the field. Submit for supervisor approval. Dashboards, alerts, and drift trends update automatically."
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Built for the way instrumentation teams actually work
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              From loop calibration records to drift prediction to ISO-ready audit trails — Calcheq covers the full calibration lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature
              icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              title="Multi-point calibration records"
              body="Capture full as-found and as-left data for 1–20 test points per calibration. Automatic pass/fail/marginal per point and per record, calculated against your defined tolerance — percent span, percent reading, or absolute."
            />
            <Feature
              icon={<Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
              title="Automated overdue and failure alerts"
              body="Overdue, due-soon, failed, and consecutive-failure alerts surface the most critical instruments the moment they need attention — on your dashboard and by email."
            />
            <Feature
              icon={<Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
              title="Drift prediction engine"
              body="Linear regression on historical calibration data projects when an instrument is likely to fail before its next due date — giving you the foresight to act before you have a problem."
            />
            <Feature
              icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Compliance dashboard and reports"
              body="Live compliance rate by area, trending charts, and a bad-actor leaderboard. Export overdue schedules, failure analysis, and full calibration history to CSV for your CMMS or audit pack."
            />
            <Feature
              icon={<Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
              title="Role-based access control"
              body="Five roles — Admin, Supervisor, Technician, Planner, and Read-Only — with a formal submit → approve workflow for calibration records. Each user's name is stamped on every action they take."
            />
            <Feature
              icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
              title="Immutable audit trail"
              body="Every create, edit, approval, and rejection is logged with user, timestamp, and a before/after diff. When the auditor arrives, your traceability evidence is already there."
            />
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Built for demanding process environments
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Wherever accurate instrumentation is critical to safety, quality, or regulatory compliance — Calcheq fits.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Industry emoji="🛢️" name="Oil &amp; Gas" />
            <Industry emoji="⚗️" name="Chemical" />
            <Industry emoji="💊" name="Pharma" />
            <Industry emoji="🥤" name="Food &amp; Bev" />
            <Industry emoji="⚡" name="Power Gen" />
            <Industry emoji="⛏️" name="Mining" />
          </div>

          {/* Standards callout */}
          <div className="mt-10 bg-blue-600 rounded-2xl px-8 py-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1">Supports compliance with major standards</h3>
              <p className="text-blue-200 text-sm">
                Calibration workflows and audit trails designed with ISO 9001, ISO/IEC 17025, and ISA-5.1 in mind.
              </p>
            </div>
            <Link
              to="/contact"
              className="flex-shrink-0 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
            >
              Talk to an expert →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
            Start a free 30-day pilot.
          </h2>
          <p className="text-blue-200 text-lg mb-4 leading-relaxed">
            Import your instrument register, add your team, and run your first calibrations — all within a week. Site-based pricing from $99/month after your trial.
          </p>
          <p className="text-blue-300 text-sm mb-10">
            Or book a 20-minute demo and we'll walk you through the product with your own instrument types and workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
            >
              Start a free pilot →
            </Link>
            <button
              onClick={openDemo}
              className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Explore the demo app
            </button>
          </div>
          <p className="text-blue-300 text-xs mt-6">No credit card · No lock-in · Cancel any time</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
