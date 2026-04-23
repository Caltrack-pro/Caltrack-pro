import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MarketingNav from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'
import { signInAsDemo } from '../../utils/userContext'

const C = {
  navy:   '#0B1F3A',
  blue:   '#1565C0',
  sky:    '#2196F3',
  orange: '#F57C00',
  amber:  '#FFA000',
  light:  '#F4F7FC',
  border: '#D0DAE8',
  muted:  '#666',
}

function CalloutBox({ title, children }) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${C.border}`,
      padding: '1.5rem',
      borderRadius: '8px',
    }}>
      <h4 style={{ color: C.blue, marginBottom: '0.5rem', fontWeight: 700 }}>{title}</h4>
      <p style={{ color: C.muted, fontSize: '0.9rem' }}>{children}</p>
    </div>
  )
}

function FeatureItem({ num, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ color: C.blue, fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>{num}</div>
      <p style={{ color: C.muted, fontSize: '0.9rem' }}>
        <strong>{title}</strong> — {children}
      </p>
    </div>
  )
}

function DemoFAQ({ question, answer }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.border}`,
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    }}>
      <h4 style={{ color: C.navy, marginBottom: '0.5rem', fontWeight: 700 }}>{question}</h4>
      <p style={{ color: C.muted, fontSize: '0.9rem' }}>{answer}</p>
    </div>
  )
}

export default function DemoPage() {
  const navigate = useNavigate()
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    document.title = 'Live Demo — CalCheq Calibration Management'
  }, [])

  async function handleLaunchDemo() {
    setLaunching(true)
    try {
      await signInAsDemo()
      navigate('/app')
    } catch (err) {
      console.error('Demo sign-in failed', err)
      setLaunching(false)
    }
  }

  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`,
        color: '#fff',
        textAlign: 'center',
        padding: '120px 5% 80px',
      }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '1.5rem', fontWeight: 800 }}>
          See CalCheq in Action
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: 700, margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}>
          Live demo environment with realistic data from Riverdale Water Treatment Authority.
          Explore the dashboard, recording workflows, and compliance reporting.
        </p>
        <button
          onClick={handleLaunchDemo}
          disabled={launching}
          style={{
            display: 'inline-block',
            background: launching ? '#aaa' : C.orange,
            color: '#fff',
            padding: '1rem 2.5rem',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1.05rem',
            border: 'none',
            cursor: launching ? 'not-allowed' : 'pointer',
            margin: '2rem 0 1rem',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { if (!launching) e.target.style.background = C.amber }}
          onMouseLeave={e => { if (!launching) e.target.style.background = C.orange }}
        >
          {launching ? 'Signing in…' : 'Launch the Live Demo →'}
        </button>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
          Auto sign-in · No registration required · 5–10 minutes to explore
        </p>
      </section>

      {/* Main content */}
      <section style={{ padding: '60px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Demo intro */}
          <div style={{
            background: C.light,
            padding: '2rem',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}>
            <h3 style={{ color: C.navy, fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700 }}>
              What You'll See in This Demo
            </h3>
            <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.7 }}>
              We've set up a realistic calibration environment for Riverdale Water Treatment Authority — a large
              water treatment facility with 130+ instruments across pressure, temperature, flow, and analyser
              measurement. The demo shows live instrument data patterns, actual overdue/compliant instruments, and how CalCheq handles daily workflows.
            </p>
            <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.7, marginTop: '1rem' }}>
              The data is <strong>fictional but realistic</strong>. All instruments, readings, and technician names
              are simulated. However, the workflows, features, and compliance logic are production-ready.
            </p>
          </div>

          {/* Callouts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            <CalloutBox title="Fictional Client">
              Riverdale Water Treatment Authority — a large water treatment facility with multiple process areas,
              SIS instruments, and strict compliance requirements.
            </CalloutBox>
            <CalloutBox title="Realistic Data Patterns">
              Instruments with varying due dates, criticality levels (Red/Yellow/Green), and calibration
              histories. Some are overdue, others are well-maintained.
            </CalloutBox>
            <CalloutBox title="Live Dashboard">
              See real-time compliance status, overdue count by criticality, technician workload, and alerts.
              Drill down into individual instruments and calibration records.
            </CalloutBox>
          </div>

          {/* What you can do */}
          <h2 style={{ fontSize: '2rem', color: C.navy, marginBottom: '1.5rem', fontWeight: 800 }}>
            Here's What You Can Do in the Demo
          </h2>
          <div style={{
            background: C.light,
            padding: '2rem',
            borderRadius: '8px',
            marginBottom: '3rem',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.25rem',
            }}>
              <FeatureItem num="1" title="View the Dashboard">
                See overdue instruments, compliance status by criticality (Red/Yellow/Green), and upcoming calibrations.
              </FeatureItem>
              <FeatureItem num="2" title="Explore an Instrument">
                Click into a single instrument to see its full history, calibration intervals, and last calibration date.
              </FeatureItem>
              <FeatureItem num="3" title="Record a Calibration">
                Walk through the full workflow: log readings, upload a calibrator file, and see a compliance certificate auto-generate.
              </FeatureItem>
              <FeatureItem num="4" title="Generate Reports">
                Run an audit-ready compliance report showing all instruments, due dates, and technician sign-offs.
              </FeatureItem>
              <FeatureItem num="5" title="Check Drift Alerts">
                See how drift trend analysis works: instruments showing escalating as-found error across calibrations are flagged automatically before they fail.
              </FeatureItem>
              <FeatureItem num="6" title="Approve Calibration Records">
                See the approval workflow: every submitted record is reviewed and signed off on the Pending Approvals tab before it locks into the register, so every calibration has a documented second-party sign-off.
              </FeatureItem>
            </div>
          </div>

          {/* Two column CTAs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
            marginBottom: '4rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: C.navy, marginBottom: '1rem', fontWeight: 700 }}>
                Ready to Try Your Own Data?
              </h3>
              <p style={{ color: C.muted, marginBottom: '1rem', lineHeight: 1.7 }}>
                The demo is great for getting a feel for CalCheq, but the real power comes when you load
                your instruments and see your own calibration schedule in action.
              </p>
              <p style={{ color: C.muted, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Start a 30-day free trial and our team will help you import your data, configure your workflows,
                and get you recording calibrations within 48 hours.
              </p>
              <Link
                to="/contact"
                style={{
                  display: 'inline-block',
                  background: C.orange,
                  color: '#fff',
                  padding: '0.875rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.target.style.background = C.amber}
                onMouseLeave={e => e.target.style.background = C.orange}
              >
                Start Your Free Pilot
              </Link>
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: C.navy, marginBottom: '1rem', fontWeight: 700 }}>
                Or Book a Personal Walkthrough
              </h3>
              <p style={{ color: C.muted, marginBottom: '1rem', lineHeight: 1.7 }}>
                If you'd prefer a guided demo from our team, we can walk you through specific workflows
                relevant to your site — SIS instruments, multi-site management, compliance reporting, or Beamex integration.
              </p>
              <p style={{ color: C.muted, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Pick a time that works for you. Usually 30–45 minutes.
              </p>
              <Link
                to="/contact"
                style={{
                  display: 'inline-block',
                  background: '#E3F2FD',
                  color: C.blue,
                  padding: '0.875rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.target.style.background = '#BBDEFB' }}
                onMouseLeave={e => { e.target.style.background = '#E3F2FD' }}
              >
                Request a Walkthrough
              </Link>
            </div>
          </div>

          {/* Demo FAQs */}
          <h2 style={{ fontSize: '1.8rem', color: C.navy, marginBottom: '2rem', fontWeight: 800 }}>
            Demo FAQs
          </h2>
          <DemoFAQ
            question="Is the demo data real?"
            answer="No — all instruments, readings, technician names, and company details are fictional. However, the data patterns are realistic (overdue instruments, varying criticality levels, degradation trends) and the workflows are production-ready. The demo accurately represents how CalCheq handles real calibration management."
          />
          <DemoFAQ
            question="Can I test with my own data?"
            answer="Yes — start your 30-day free trial and we'll import your instrument register and historical calibration records. You'll see CalCheq working with your actual data, team, and workflow. Your pilot is completely separate from the public demo and fully editable."
          />
          <DemoFAQ
            question="How long does the demo take?"
            answer="Most people spend 5–10 minutes exploring: viewing the dashboard, clicking into an instrument, and generating a report. If you want to deep-dive into the recording workflow or try a calibration scenario, allow 15–20 minutes."
          />
          <DemoFAQ
            question="Do I need to create an account to see the demo?"
            answer="No login or registration required. Click 'Launch the Live Demo' above and you'll be signed in automatically to the demo environment. If you want to try recording a calibration or editing instrument details, start your 30-day free trial."
          />
          <DemoFAQ
            question="What if I have questions while in the demo?"
            answer="Email us anytime at info@calcheq.com — our team is available Monday–Friday, 8 AM–5 PM AWST."
          />
          <DemoFAQ
            question="Is this the same as a pilot?"
            answer="No — the demo is a shared, read-only environment to explore features. A pilot is your own account: you can record calibrations, edit settings, and truly test CalCheq with your instruments and team. Pilots get 30 days free with full Professional features."
          />
        </div>
      </section>

      {/* What's Next */}
      <section style={{ background: C.light, padding: '60px 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', color: C.navy, fontWeight: 800, marginBottom: '1rem' }}>
            What's Next?
          </h2>
          <p style={{ fontSize: '1.05rem', color: C.muted, margin: '0 0 2rem' }}>
            Explore the demo, then start your free 30-day pilot. See how CalCheq transforms your calibration program.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleLaunchDemo}
              disabled={launching}
              style={{
                background: launching ? '#aaa' : C.orange,
                color: '#fff',
                padding: '0.875rem 2rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: launching ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!launching) e.target.style.background = C.amber }}
              onMouseLeave={e => { if (!launching) e.target.style.background = C.orange }}
            >
              {launching ? 'Signing in…' : 'Launch Live Demo'}
            </button>
            <Link
              to="/contact"
              style={{
                display: 'inline-block',
                background: '#E3F2FD',
                color: C.blue,
                padding: '0.875rem 2rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.target.style.background = '#BBDEFB' }}
              onMouseLeave={e => { e.target.style.background = '#E3F2FD' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA bar */}
      <section style={{ background: C.navy, color: '#fff', textAlign: 'center', padding: '60px 5%' }}>
        <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Still have questions about CalCheq?
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
          Check our FAQ or contact our team directly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/faq"
            style={{
              display: 'inline-block',
              background: '#fff',
              color: C.orange,
              padding: '0.875rem 2rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.target.style.background = '#f0f0f0' }}
            onMouseLeave={e => { e.target.style.background = '#fff' }}
          >
            Visit FAQ
          </Link>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              background: C.orange,
              color: '#fff',
              padding: '0.875rem 2rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.target.style.background = C.amber }}
            onMouseLeave={e => { e.target.style.background = C.orange }}
          >
            Contact Us
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}
