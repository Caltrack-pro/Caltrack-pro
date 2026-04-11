import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'
import { signInAsDemo } from '../../utils/userContext'

function Icon({ d, size = 6 }) {
  return (
    <svg className={`w-${size} h-${size}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function StepCard({ num, title, body }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-blue-200">
        {num}
      </div>
      <div className="pt-1">
        <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, body }) {
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

function RoleCard({ emoji, role, body }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{role}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  )
}

export default function HowItWorks() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'How It Works — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'See how Calcheq transforms your instrument calibration management from spreadsheet chaos to compliance clarity — in 48 hours. 4-step setup process for Australian processing plants.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  async function openDemo() {
    try { await signInAsDemo() } catch { /* AuthGuard will redirect */ }
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            From spreadsheet chaos to calibration clarity
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight">
            Up and running in 48 hours — not six months.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
            See how Calcheq transforms your instrument management, compliance, and team workflows from day one.
          </p>
        </div>
      </section>

      {/* ── 4-STEP SETUP ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">The 4-Step Setup Process</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Get your entire calibration program live faster than you thought possible.</p>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-blue-100 hidden sm:block" />

            <div className="space-y-10">
              <StepCard
                num="1"
                title="Import Your Instruments"
                body="Upload your instrument data via CSV, Excel, or our guided import wizard. Map your columns, validate data, and have your instrument register loaded in minutes. Supports data from MEX, SAP, Maximo, and manual spreadsheets."
              />
              <StepCard
                num="2"
                title="Configure Your Program"
                body="Set calibration intervals, define criticality levels, assign team members to instruments, and configure alert thresholds. Use our templates for common equipment types or customise per-instrument. No technical knowledge required."
              />
              <StepCard
                num="3"
                title="Record Calibrations"
                body="Log calibrations in real-time from the dashboard or via mobile. Attach certificates, record as-found and as-left readings, upload calibrator data (Beamex, Fluke CSV), and generate automated compliance evidence instantly."
              />
              <StepCard
                num="4"
                title="Stay Compliant and Ahead"
                body="Run compliance reports, export certificates aligned with AS/NZS ISO 17025, track overdue instruments, and monitor criticality status across your site. Scheduled reporting and dashboard alerts keep everyone informed."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE DEEP DIVE ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Feature Deep-Dive</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Six core capabilities that set Calcheq apart.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
              title="Instrument Criticality Ranking"
              body="Automatically assign Red (safety-critical SIS), Yellow (process-critical), or Green (reference) ratings based on your site's risk matrix. Prioritise maintenance and compliance audits on the instruments that matter most. Critical for IEC 61511 and SIS programs."
            />
            <FeatureCard
              icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Real-Time Calibration Dashboard"
              body="See at a glance: overdue instruments, upcoming calibrations, compliance status by criticality, technician workload, and historical trends. Mobile-responsive for shop floor access."
            />
            <FeatureCard
              icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              title="Compliance Certificate Generation"
              body="Auto-generate AS/NZS ISO 17025–aligned calibration certificates in seconds. Include as-found/as-left readings, measurement uncertainty, technician sign-off, and full traceability. Export as PDF or archive digitally. NATA-ready format."
            />
            <FeatureCard
              icon={<Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
              title="Predictive Degradation Alerts"
              body="Calcheq learns from your historical calibration data and flags instruments showing degradation trends before they exceed tolerance. Reduce emergency repairs and keep your process stable. Red instruments get highest alert priority."
            />
            <FeatureCard
              icon={<Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
              title="Multi-Site Management"
              body="Manage calibration programs across multiple processing plants from a single dashboard. Site-specific permissions, separate calibration schedules, and consolidated compliance reporting. Perfect for corporate groups and mining networks."
            />
            <FeatureCard
              icon={<Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />}
              title="Field Data Entry & Calibrator Integration"
              body="Technicians record calibrations on mobile, even offline. Push data when connected. Direct integration with Beamex and Fluke CSV output lets you upload calibrator readings directly. No manual transcription, zero data-entry errors."
            />
          </div>
        </div>
      </section>

      {/* ── WHO USES CALCHEQ ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Who Uses Calcheq</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Designed for every role in your calibration team.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <RoleCard
              emoji="🎯"
              role="Instrumentation Supervisor"
              body="Own the compliance program. Calcheq gives you audit-ready reports, predictive alerts on failing instruments, and centralised criticality tracking. Spend less time chasing spreadsheets, more time on strategy and risk."
            />
            <RoleCard
              emoji="📅"
              role="Maintenance Planner"
              body="Schedule with confidence. See upcoming calibrations, technician capacity, and multi-site workload in one view. Prioritise by criticality and cost. No more guessing when something's due."
            />
            <RoleCard
              emoji="🏭"
              role="Site Manager"
              body="Monitor compliance without the detail. Dashboard gives you overdue count, audit readiness, and SIS status at a glance. Role-based permissions mean teams only see relevant instruments."
            />
            <RoleCard
              emoji="🔧"
              role="Instrument Technician"
              body="Record on the go. Mobile app, field-friendly forms, and direct calibrator integration mean no manual data entry. Calibration certificate generated automatically. Focus on the work, not the paperwork."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
            Ready to see how Calcheq works?
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            Start your free 30-day pilot. Full Professional plan. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
              Start Your Free Pilot →
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
