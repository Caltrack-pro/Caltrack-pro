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

// ── Stat card ─────────────────────────────────────────────────────────────────

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold text-blue-600 mb-1">{value}</p>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
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

// ── Testimonial card ──────────────────────────────────────────────────────────

function Testimonial({ quote, name, role, company }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ))}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
          <p className="text-xs text-slate-400 leading-tight">{role} · {company}</p>
        </div>
      </div>
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
              <span className="text-[10px] text-slate-500 font-mono">caltrackpro.com/app</span>
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-[340px]">
          {/* Sidebar */}
          <div className="w-44 bg-slate-900 flex-shrink-0 p-3 flex flex-col gap-1">
            <div className="px-2 py-1 mb-2">
              <div className="text-white text-xs font-bold opacity-90">CalTrack Pro</div>
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

  function openDemo() {
    signInAsDemo()
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                Designed for industrial environments
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                Calibration management,{' '}
                <span className="text-blue-600">done right.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                CalTrack Pro gives your instrumentation team a single, clear source of truth for every calibration record, alert, and due date — from the field to the control room.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm"
                >
                  Get Started Free →
                </Link>
                <button
                  onClick={openDemo}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Open Demo App
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">No credit card required · Free for small teams</p>
            </div>

            {/* Right: mockup */}
            <div className="relative">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="10,000+" label="Instruments tracked" />
          <Stat value="98.4%"   label="Calibration compliance achieved" />
          <Stat value="< 2 min" label="To log a calibration record" />
          <Stat value="100%"    label="Audit-ready, always" />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Everything your team needs
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              CalTrack Pro covers the full lifecycle of instruments from commissioning and setup, to preventative and corrective maintenance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature
              icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              title="Smart Calibration Records"
              body="Capture full as-found and as-left test point data with automatic pass/fail/marginal calculations per your defined tolerance — percent span, percent reading, or absolute."
            />
            <Feature
              icon={<Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
              title="Automated Alerts"
              body="Never miss a due date. Automatic overdue, due-soon, failed, and consecutive-failure alerts surface the most critical instruments on your dashboard the moment they need attention."
            />
            <Feature
              icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Compliance Dashboard"
              body="Live compliance rate by area, trending charts, bad-actor leaderboard, and a full upcoming schedule — giving supervisors an instant health snapshot of the entire instrument fleet."
            />
            <Feature
              icon={<Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
              title="Role-Based Access Control"
              body="Five roles — Admin, Supervisor, Technician, Planner, and Read-Only — ensure the right people see and do the right things. Calibration records go through a formal submit → approve workflow."
            />
            <Feature
              icon={<Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
              title="Multi-Site Isolation"
              body="Each organisation gets its own isolated environment. Staff sign in to their site, see only their instruments, and their names appear on every record — full traceability without shared accounts."
            />
            <Feature
              icon={<Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              title="Reports & Trend Analysis"
              body="Generate overdue schedules, failure analysis reports, and instrument calibration history with trend charts. Export to CSV for integration with your existing maintenance systems."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Up and running in minutes
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No month-long implementation. No consultant required. Your team is calibrating and approving records on day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            <Step
              num="1"
              title="Set up your site"
              body="Create a password-protected site for your organisation. Add instruments with their calibration intervals, tolerances, and test point definitions."
            />
            <Step
              num="2"
              title="Your team signs in"
              body="Technicians, planners, and supervisors each sign in under your site with their own name and role. Their identity is stamped on every record they create."
            />
            <Step
              num="3"
              title="Calibrate, approve, track"
              body="Log as-found and as-left readings in the field. Submit for supervisor approval. Dashboards and alerts update automatically — no manual chasing."
            />
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Built for demanding environments
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Wherever accurate instrumentation is critical to safety, quality, or compliance — CalTrack Pro fits.
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

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Trusted by instrumentation teams
            </h2>
            <p className="text-slate-500">What the people using it every day say.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              quote="We cut our overdue calibration rate from 23% down to under 4% in the first three months. The alert system is what makes the difference — you just can't miss it."
              name="David Hartley"
              role="Lead Instrument Technician"
              company="Refinery Operations"
            />
            <Testimonial
              quote="Finally a system that doesn't require a PhD to use. The guys in the field can log a calibration in two minutes and it's immediately visible to supervisors for approval."
              name="Sarah Nkosi"
              role="Maintenance Supervisor"
              company="Chemical Processing Plant"
            />
            <Testimonial
              quote="The multi-site isolation means each of our plants has its own clean dataset. Auditors love it — every record has a name, a date, and a clear pass/fail with test point data."
              name="Marcus Webb"
              role="Reliability Engineer"
              company="Power Generation"
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
            Ready to take control of your calibration program?
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Join teams across oil & gas, chemicals, and manufacturing who have moved off spreadsheets and paper logs for good.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
            >
              Get Started Free →
            </Link>
            <button
              onClick={openDemo}
              className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
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
