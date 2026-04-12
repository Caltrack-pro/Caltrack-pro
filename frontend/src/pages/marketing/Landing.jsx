import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

// ── Colours (from HTML CSS vars) ─────────────────────────────────────────────
const C = {
  navy:   '#0B1F3A',
  blue:   '#1565C0',
  sky:    '#2196F3',
  orange: '#F57C00',
  amber:  '#FFA000',
  green:  '#2E7D32',
  red:    '#C62828',
  light:  '#F4F7FC',
  mid:    '#E3EAF4',
  text:   '#1A2B3C',
  muted:  '#5A6B7B',
  border: '#D0DAE8',
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: '0.75rem', background: '#fff' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '1.1rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 600, color: C.navy, fontSize: '0.95rem',
        }}
      >
        <span>{q}</span>
        <span style={{ fontSize: '1.2rem', color: C.blue, fontWeight: 700, flexShrink: 0, marginLeft: '1rem' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p style={{ padding: '0 1.25rem 1.25rem', color: C.muted, fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
          {a}
        </p>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Landing() {
  useEffect(() => {
    document.title = 'CalCheq — Calibration Management for Australian Processing Plants'
  }, [])

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #163566 60%, #1a4a8a 100%)`,
        color: '#fff',
        padding: 'calc(64px + 100px) 5% 80px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(33,150,243,0.2)',
          border: '1px solid rgba(33,150,243,0.4)',
          color: '#90CAF9',
          fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '0.35rem 1rem', borderRadius: 20, marginBottom: '1.5rem',
        }}>
          Purpose-built for Australian Industry
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
          fontWeight: 800, lineHeight: 1.2,
          maxWidth: 820, margin: '0 auto 1.5rem',
          letterSpacing: '-0.5px',
        }}>
          Always know which instruments need attention —{' '}
          <span style={{ color: '#90CAF9' }}>before they become a problem</span>
        </h1>

        <p style={{
          fontSize: '1.2rem', color: 'rgba(255,255,255,0.78)',
          maxWidth: 640, margin: '0 auto 2.5rem', lineHeight: 1.7,
        }}>
          CalCheq gives instrumentation and maintenance teams at Australian processing plants real-time visibility of every instrument's calibration status, compliance history, and drift trends — in one place, without the enterprise price tag.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{
            background: C.orange, color: '#fff',
            padding: '1rem 2rem', borderRadius: 8,
            fontSize: '1rem', fontWeight: 700,
            display: 'inline-block', textDecoration: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.amber}
            onMouseLeave={e => e.currentTarget.style.background = C.orange}
          >
            Start Free 30-Day Trial
          </Link>
          <Link to="/demo" style={{
            background: 'transparent', color: '#fff',
            padding: '1rem 2rem', borderRadius: 8,
            fontSize: '1rem', fontWeight: 600,
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'inline-block', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
          >
            See the Live Demo
          </Link>
        </div>

        {/* ── Dashboard preview ── */}
        <div style={{ marginTop: '3.5rem', maxWidth: 900, margin: '3.5rem auto 0', position: 'relative' }}>
          {/* Browser chrome */}
          <div style={{ background: '#1e3a5f', borderRadius: '12px 12px 0 0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 22, marginLeft: 12, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>calcheq.com/app</span>
            </div>
          </div>
          {/* Dashboard body */}
          <div style={{ background: '#F4F7FC', borderRadius: '0 0 12px 12px', padding: '18px 18px 12px', boxShadow: '0 32px 64px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Overdue', val: '14', color: '#C62828', bg: '#FFF5F5' },
                { label: 'Due in 30 Days', val: '31', color: '#B45309', bg: '#FFFBEB' },
                { label: 'Current', val: '243', color: '#2E7D32', bg: '#F0FFF4' },
                { label: 'Total Instruments', val: '288', color: '#1565C0', bg: '#EFF6FF' },
                { label: 'Compliance Rate', val: '91.3%', color: '#2E7D32', bg: '#F0FFF4' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '12px 10px', borderLeft: `3px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', color: '#5A6B7B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{val}</div>
                </div>
              ))}
            </div>
            {/* Attention cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { emoji: '🔴', label: 'Overdue', count: 14, sub: 'Past calibration due date', color: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
                { emoji: '🕐', label: 'Pending Approvals', count: 6, sub: 'Awaiting supervisor review', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                { emoji: '↗', label: 'Drift Alerts', count: 3, sub: 'Predicted to fail before next due', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
              ].map(({ emoji, label, count, sub, color, bg, border }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${color}`, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '1.4rem' }}>{emoji}</div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: '#5A6B7B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{count}</div>
                    <div style={{ fontSize: '0.6rem', color: '#5A6B7B' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Chart + list row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Compliance gauge placeholder */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, alignSelf: 'flex-start' }}>Calibration Compliance</div>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#22C55E" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray="226" strokeDashoffset="20"
                    transform="rotate(-90 45 45)" />
                  <text x="45" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill="#2E7D32" fontFamily="system-ui">91.3%</text>
                  <text x="45" y="54" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="system-ui">Site Compliance</text>
                </svg>
                {/* Area bars */}
                {[['Filtration', 96], ['Treatment', 91], ['Intake', 87], ['Distribution', 83]].map(([area, pct]) => (
                  <div key={area} style={{ width: '100%', marginTop: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: '0.6rem', color: '#374151' }}>{area}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: pct >= 90 ? '#16A34A' : '#D97706' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#22C55E' : '#F59E0B', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Upcoming list */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Upcoming — Next 7 Days</div>
                {[
                  { tag: 'PT-204', desc: 'Feed water pressure', days: 'Today', c: '#DC2626', bg: '#FEE2E2' },
                  { tag: 'FT-118', desc: 'Chlorine dosing flow', days: '2d', c: '#D97706', bg: '#FEF3C7' },
                  { tag: 'AT-406', desc: 'Residual chlorine', days: '4d', c: '#D97706', bg: '#FEF3C7' },
                  { tag: 'LT-302', desc: 'Sedimentation level', days: '6d', c: '#1D4ED8', bg: '#DBEAFE' },
                ].map(({ tag, desc, days, c, bg }) => (
                  <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0B1F3A', fontFamily: 'monospace' }}>{tag}</div>
                      <div style={{ fontSize: '0.6rem', color: '#5A6B7B' }}>{desc}</div>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, color: c }}>{days}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(to bottom, transparent 60%, rgba(11,31,58,0.15) 100%)', pointerEvents: 'none' }} />
        </div>

        <div style={{ marginTop: '2.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
          <div>Trusted by Australian process plants | Built for IECEx, AS/NZS ISO 17025 &amp; NATA compliance</div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {['⚡ No IT Department Needed', '📋 Audit-Ready Certificates', '🇦🇺 Australian-Built', '🔒 Secure Cloud'].map(b => (
              <span key={b} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.78rem',
              }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN ──────────────────────────────────────────────────────────── */}
      <section style={{ background: C.light, padding: '80px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: C.navy, marginBottom: '0.75rem' }}>
          Sound familiar?
        </h2>
        <p style={{ color: C.muted, maxWidth: 580, margin: '0 auto 3rem' }}>
          These are the problems we hear from instrumentation teams every week. If any of these hit close to home, you need CalCheq.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
          {[
            { icon: '📊', title: '"We\'re still managing calibrations in Excel"', body: 'Spreadsheets can\'t alert you when instruments go overdue, can\'t generate compliant certificates, and can\'t show you what\'s at risk — across multiple sites, simultaneously.' },
            { icon: '🔍', title: '"We found out a safety-critical instrument was overdue — after the audit"', body: 'Without real-time visibility and risk-based prioritisation, safety-critical instruments fall through the cracks. That\'s not just a compliance failure — it\'s a plant risk.' },
            { icon: '📁', title: '"Calibration certificates live in 3 different places"', body: 'Email attachments, shared drives, and physical binders mean your compliance evidence is scattered. When an auditor arrives, it becomes a frantic search.' },
            { icon: '⏰', title: '"We don\'t know an instrument is drifting until it fails"', body: 'If a transmitter reads 3% high every calibration, the process control system has been running on bad data for months — causing inefficiencies, off-spec product, and unnecessary wear on downstream assets.' },
            { icon: '💰', title: '"Enterprise CMMS is overkill for our instrumentation team"', body: 'SAP, Maximo, and MEX are built for entire maintenance departments. They\'re expensive, complex to implement, and require IT teams — for a calibration problem that shouldn\'t need all that.' },
            { icon: '🏭', title: '"A failed instrument caused a process upset — and we didn\'t see it coming"', body: 'When a measurement device goes out of calibration, your plant runs on inaccurate data. Flow rates are wrong. Temperatures are wrong. The DCS responds to readings that don\'t reflect reality — and the consequences range from inefficiency to unplanned shutdown.' },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{
              background: '#fff', borderRadius: 12,
              border: `1px solid ${C.border}`,
              padding: '2rem 1.5rem', textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 5%', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', background: '#E3F2FD', color: C.blue,
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '0.3rem 0.9rem', borderRadius: 20, marginBottom: '1rem',
        }}>The Solution</span>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: C.navy, marginBottom: '0.75rem' }}>
          Calibration intelligence, built for the way your team works
        </h2>
        <p style={{ color: C.muted, maxWidth: 620, margin: '0 auto 3.5rem' }}>
          CalCheq is not another generic asset management system. It is purpose-built for instrumentation and maintenance teams who need to manage calibrations, certifications, and asset health — without a six-month implementation project.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: 1100, margin: '0 auto', textAlign: 'left' }}>
          {[
            { icon: '📡', title: 'Real-Time Calibration Dashboard', body: "Every instrument's calibration status — current, upcoming, and overdue — on a single screen. Filter by site, area, criticality, or due date. Know exactly what needs attention, right now." },
            { icon: '🚦', title: 'Instrument Criticality Ranking', body: 'Assign instruments as Green (indication only), Yellow (controller), or Red (safety-critical SIS). Sort your overdue dashboard by risk, not just date, so your team always works on what matters most.' },
            { icon: '📜', title: 'Compliant Calibration Certificates', body: 'Generate AS/NZS ISO 17025-aligned calibration certificates in one click. Full calibration history, measurement uncertainty, technician sign-off, and NATA traceability — audit ready, every time.' },
            { icon: '📈', title: 'Drift Prediction — Know Before It Fails', body: 'CalCheq tracks every instrument\'s as-found error over successive calibrations and models the drift rate. If a transmitter is reading 1% worse each calibration cycle, the system projects when it will breach tolerance — and flags it weeks in advance. No other entry-level calibration tool does this.' },
            { icon: '📥', title: 'Spreadsheet Import Wizard', body: 'Already have instruments in Excel, MEX, or another CMMS? Our guided import wizard maps your existing data into CalCheq in minutes — not months. No IT department required.' },
            { icon: '🌐', title: 'Multi-Site Visibility', body: 'Manage calibrations across multiple sites from one account. Site managers see their area; operations leaders see everything. Role-based access ensures the right people see the right data.' },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{
              border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '2rem', background: C.light,
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,101,192,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', marginBottom: '1.25rem',
              }}>{icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.navy, marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS UPSETS CALLOUT ─────────────────────────────────────── */}
      <section style={{ background: '#FFF8F0', borderTop: `3px solid ${C.orange}`, borderBottom: `3px solid ${C.orange}`, padding: '60px 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: '#FEE2E2', color: C.red, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.3rem 0.9rem', borderRadius: 20, marginBottom: '1rem' }}>
              The hidden cost of drift
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: C.navy, lineHeight: 1.25, marginBottom: '1rem' }}>
              A miscalibrated instrument doesn't just fail a compliance check — it runs your plant on wrong numbers
            </h2>
            <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              When a flow transmitter reads 4% high, your DCS responds to a number that doesn't exist. Control valves adjust. Dosing systems compensate. Other instruments in the loop follow. The result isn't just one bad reading — it's a cascade of process decisions made on inaccurate data.
            </p>
            <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              CalCheq's drift prediction engine tracks each instrument's as-found error over successive calibrations. If an instrument is consistently 3% out every 12 months, CalCheq projects when it will breach its tolerance band — and alerts you while you still have time to plan.
            </p>
            <Link to="/how-it-works" style={{ color: C.orange, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              See how drift prediction works →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '📉', heading: 'Process inefficiency', body: 'Controllers chase setpoints that are moving for the wrong reasons. Energy consumption rises. Yield drops. The instrument is the root cause — but it\'s invisible without drift tracking.' },
              { icon: '⚠️', heading: 'Unplanned shutdowns', body: 'A safety-critical instrument that\'s slowly drifting toward its trip point is a shutdown waiting to happen. Predictive alerts give you a maintenance window instead of an emergency.' },
              { icon: '🔗', heading: 'Cascade asset damage', body: 'Pumps, compressors, and heat exchangers respond to the readings they receive. If those readings are wrong, they run outside their design envelope — shortening asset life.' },
            ].map(({ icon, heading, body }) => (
              <div key={heading} style={{ background: '#fff', borderRadius: 10, padding: '1.25rem 1.5rem', border: `1px solid ${C.border}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.navy, marginBottom: '0.25rem' }}>{heading}</h4>
                  <p style={{ fontSize: '0.83rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS STRIP ──────────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: '70px 5%', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
          Up and running in days, not months
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 3rem' }}>
          No lengthy implementation projects. No IT consultants. CalCheq is designed for teams who need a solution this week, not next quarter.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
          {[
            { num: 1, title: 'Import Your Instruments', body: 'Upload your existing spreadsheet or use our guided template. We map your data, you review it.' },
            { num: 2, title: 'Set Calibration Schedules', body: 'Define intervals, assign technicians, and set alert thresholds for each instrument or instrument class.' },
            { num: 3, title: 'Record Calibrations', body: 'Log calibrations via desktop or mobile. Attach certificates, record as-found and as-left readings automatically.' },
            { num: 4, title: 'Stay Compliant, Stay Ahead', body: 'Dashboard alerts keep you ahead of due dates. Export compliance certificates on demand.' },
          ].map(({ num, title, body }) => (
            <div key={num} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: C.sky, color: '#fff',
                fontSize: '1.2rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>{num}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '3rem' }}>
          <Link to="/how-it-works" style={{
            background: 'transparent', color: '#fff',
            padding: '1rem 2rem', borderRadius: 8,
            fontSize: '1rem', fontWeight: 600,
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'inline-block', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
          >
            See the full walkthrough →
          </Link>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section style={{ background: C.light, padding: '80px 5%', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', background: '#E3F2FD', color: C.blue,
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '0.3rem 0.9rem', borderRadius: 20, marginBottom: '1rem',
        }}>Transparent Pricing</span>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: C.navy, marginBottom: '0.75rem' }}>
          Simple pricing. No surprises.
        </h2>
        <p style={{ color: C.muted, maxWidth: 520, margin: '0 auto 3rem' }}>
          Priced for Australian processing plants — not global enterprise software budgets. Start with your 30-day free pilot, no credit card required.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>

          {/* Starter */}
          <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${C.border}`, padding: '2.5rem 2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginBottom: '0.5rem' }}>Starter</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: C.navy, lineHeight: 1 }}><sup style={{ fontSize: '1.2rem', verticalAlign: 'top', paddingTop: '0.5rem' }}>$</sup>199</div>
            <div style={{ fontSize: '0.85rem', color: C.muted, marginBottom: '0.5rem' }}>AUD / month, billed annually</div>
            <div style={{ fontSize: '0.85rem', color: C.blue, fontWeight: 600, marginBottom: '1.5rem' }}>Up to 150 instruments</div>
            <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '1.25rem 0' }} />
            {[
              [true,  'Calibration dashboard'],
              [true,  'Overdue alerts & email notifications'],
              [true,  'Compliance certificate export'],
              [true,  'Up to 5 users'],
              [true,  'Spreadsheet import wizard'],
              [false, 'Instrument criticality ranking'],
              [false, 'Predictive degradation alerts'],
              [false, 'Multi-site management'],
            ].map(([tick, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                <span style={{ color: tick ? C.green : C.muted, fontWeight: 700, flexShrink: 0 }}>{tick ? '✔' : '–'}</span>
                <span>{label}</span>
              </div>
            ))}
            <Link to="/contact" style={{
              display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 8,
              fontSize: '0.95rem', fontWeight: 700, marginTop: '1.75rem', textDecoration: 'none',
              border: `2px solid ${C.border}`, color: C.navy,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.navy }}
            >Start Free Trial</Link>
          </div>

          {/* Professional (featured) */}
          <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${C.blue}`, padding: '2.5rem 2rem', textAlign: 'left', position: 'relative', boxShadow: '0 8px 32px rgba(21,101,192,0.15)' }}>
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: C.blue, color: '#fff',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              padding: '0.3rem 1rem', borderRadius: 20,
            }}>Most Popular</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginBottom: '0.5rem' }}>Professional</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: C.navy, lineHeight: 1 }}><sup style={{ fontSize: '1.2rem', verticalAlign: 'top', paddingTop: '0.5rem' }}>$</sup>449</div>
            <div style={{ fontSize: '0.85rem', color: C.muted, marginBottom: '0.5rem' }}>AUD / month, billed annually</div>
            <div style={{ fontSize: '0.85rem', color: C.blue, fontWeight: 600, marginBottom: '1.5rem' }}>Up to 500 instruments</div>
            <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '1.25rem 0' }} />
            {[
              [true,  'Everything in Starter'],
              [true,  'Instrument criticality ranking (R/A/G)'],
              [true,  'Predictive degradation alerts'],
              [true,  'Risk-sorted overdue dashboard'],
              [true,  'Unlimited users'],
              [true,  'Calibrator data import (Beamex/Fluke CSV)'],
              [true,  'Advanced reporting'],
              [false, 'Multi-site management'],
            ].map(([tick, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                <span style={{ color: tick ? C.green : C.muted, fontWeight: 700, flexShrink: 0 }}>{tick ? '✔' : '–'}</span>
                <span>{label}</span>
              </div>
            ))}
            <Link to="/contact" style={{
              display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 8,
              fontSize: '0.95rem', fontWeight: 700, marginTop: '1.75rem', textDecoration: 'none',
              background: C.blue, color: '#fff',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.navy}
              onMouseLeave={e => e.currentTarget.style.background = C.blue}
            >Start Free Trial</Link>
          </div>

          {/* Enterprise */}
          <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${C.border}`, padding: '2.5rem 2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginBottom: '0.5rem' }}>Enterprise</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy, lineHeight: 1, paddingTop: '0.4rem' }}>Custom</div>
            <div style={{ fontSize: '0.85rem', color: C.muted, marginTop: '0.5rem', marginBottom: '0.5rem' }}>Tailored to your operation</div>
            <div style={{ fontSize: '0.85rem', color: C.blue, fontWeight: 600, marginBottom: '1.5rem' }}>Unlimited instruments</div>
            <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '1.25rem 0' }} />
            {[
              'Everything in Professional',
              'Multi-site management',
              'SAP / MEX / Maximo integration',
              'Dedicated onboarding support',
              'Custom compliance reporting',
              'SLA-backed uptime guarantee',
              'On-site training available',
            ].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✔</span>
                <span>{label}</span>
              </div>
            ))}
            <Link to="/contact" style={{
              display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 8,
              fontSize: '0.95rem', fontWeight: 700, marginTop: '1.75rem', textDecoration: 'none',
              border: `2px solid ${C.border}`, color: C.navy,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.navy }}
            >Talk to Sales</Link>
          </div>
        </div>

        <p style={{ marginTop: '2rem', color: C.muted, fontSize: '0.85rem' }}>
          All plans include a <strong>30-day free pilot</strong> with your real plant data. No credit card required. Cancel anytime during the trial.
        </p>
      </section>

      {/* ── FREE TRIAL ──────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`,
        padding: '80px 5%', textAlign: 'center', color: '#fff',
      }}>
        <span style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
          color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '0.3rem 1rem', borderRadius: 20, marginBottom: '1.25rem',
        }}>No credit card required</span>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Start your free 30-day trial today
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Full Professional plan — all features, unlimited users — for 30 days at no cost. Import your instrument list using our guided CSV wizard and be live within hours. No IT project. No consultant. No setup fee.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: 860, margin: '0 auto 2.5rem' }}>
          {[
            { icon: '✅', heading: 'Full Professional plan', body: 'Criticality ranking, drift prediction, approval workflow, Beamex/Fluke CSV import — everything unlocked.' },
            { icon: '📥', heading: 'Guided import wizard', body: 'Upload your instrument list as a CSV or Excel file. Our wizard maps your columns and has you live within hours.' },
            { icon: '📧', heading: 'Email support included', body: 'Questions during your trial? Our team responds within one business day.' },
            { icon: '🚫', heading: 'No lock-in', body: 'After 30 days, choose a paid plan or walk away. No automatic billing. No cancellation fees.' },
          ].map(({ icon, heading, body }) => (
            <div key={heading} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '1.25rem 1.5rem', textAlign: 'left',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{icon}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem', color: '#fff' }}>{heading}</h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
        <Link to="/contact" style={{
          background: C.orange, color: '#fff',
          padding: '1rem 2.25rem', borderRadius: 8,
          fontSize: '1rem', fontWeight: 700,
          display: 'inline-block', textDecoration: 'none',
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.amber}
          onMouseLeave={e => e.currentTarget.style.background = C.orange}
        >
          Start Your Free Trial →
        </Link>
        <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
          Need help importing a large dataset? Contact us — we can assist.
        </p>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 5%', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
          {[
            ['100%',       'Australian-built & hosted'],
            ['5 min',      'CSV import — instruments loaded'],
            ['AS/NZS\n17025', 'Compliance-aligned certificates'],
            ['Zero',       'IT department required'],
          ].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: C.blue, whiteSpace: 'pre-line', lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: '0.88rem', color: C.muted, marginTop: '0.25rem' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPLIANCE STRIP ─────────────────────────────────────────────── */}
      <section style={{ background: '#E8F5E9', padding: '50px 5%', textAlign: 'center', borderTop: '3px solid #A5D6A7' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.green, marginBottom: '0.5rem' }}>
          ✅ Built for Australian Compliance
        </h3>
        <p style={{ color: '#2E4A2E', fontSize: '0.9rem', maxWidth: 680, margin: '0 auto 1.5rem' }}>
          CalCheq calibration certificates are designed to meet or exceed the requirements of Australian and international calibration compliance standards — from ISO 17025 to IEC 61511 safety instrumented systems.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['AS/NZS ISO/IEC 17025:2017', 'NATA Traceability', 'IEC 61511 SIS', 'ISO 9001:2015', 'Work Health & Safety Act', 'ILAC-G24 / OIML D 10'].map(b => (
            <span key={b} style={{
              background: '#fff', border: '1px solid #A5D6A7',
              padding: '0.4rem 1rem', borderRadius: 20,
              fontSize: '0.78rem', fontWeight: 600, color: C.green,
            }}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── FAQ STRIP ────────────────────────────────────────────────────── */}
      <section style={{ background: C.light, padding: '70px 5%' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.navy, marginBottom: '2.5rem' }}>
          Common Questions
        </h2>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <FaqItem
            q="How long does it take to get set up?"
            a="Most teams import their instrument list and are recording calibrations the same day. You upload your existing spreadsheet or CSV (we accept Excel, CSV, and MEX exports), our guided wizard maps the fields, and you review before importing. No IT team, no configuration project."
          />
          <FaqItem
            q="We use MEX / SAP — can we import our existing instruments?"
            a="Yes. CalCheq includes a guided spreadsheet import wizard that supports Excel and CSV. For MEX users, we have a specific migration guide that maps MEX instrument fields directly to CalCheq. For SAP and Maximo, contact us — our Enterprise tier includes custom integration support."
          />
          <FaqItem
            q="Can technicians record calibrations in the field?"
            a="CalCheq is mobile browser-compatible, meaning technicians can record calibrations from any smartphone or tablet — including intrinsically safe tablets (Ecom, Bartec, Getac) in hazardous areas. We also support CSV import from Beamex and Fluke documenting calibrators for paperless field workflows."
          />
          <FaqItem
            q="Are the calibration certificates compliant?"
            a="Yes. CalCheq generates certificates aligned with AS/NZS ISO/IEC 17025:2017, NATA traceability requirements, and ILAC-G24 guidelines — including as-found/as-left readings, measurement uncertainty, calibration standards used, technician sign-off, and next due date."
          />
          <FaqItem
            q="What's included in the 30-day free trial?"
            a="The full Professional plan — drift prediction, criticality ranking, approval workflows, Beamex/Fluke CSV import, unlimited users — for 30 days at no cost. You import your own instrument data using the guided wizard. Email support is included throughout the trial. No credit card required, no automatic billing at the end."
          />
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────────────────── */}
      <section style={{ background: C.orange, padding: '60px 5%', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
          Ready to get your calibrations under control?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem' }}>
          Import your instrument list, invite your team, and start recording calibrations — today.
        </p>
        <Link to="/contact" style={{
          background: '#fff', color: C.orange,
          padding: '1rem 2rem', borderRadius: 8,
          fontSize: '1rem', fontWeight: 700,
          display: 'inline-block', textDecoration: 'none',
          transition: 'transform 0.1s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          Start Your Free 30-Day Trial
        </Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
