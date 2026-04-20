import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

const SECTIONS = [
  {
    section: 'Getting Started',
    faqs: [
      {
        q: 'How long does the 30-day free trial last?',
        a: 'Your 30-day trial starts the day you sign up and gives you full access to the Professional plan — all features, up to 500 instruments, unlimited users. No credit card required. After 30 days, you can choose to start a paid subscription, downgrade to Starter, or cancel without any fees or penalties.',
      },
      {
        q: 'How fast can I set up CalCheq?',
        a: 'Most customers are operational within 48 hours. Our onboarding includes: data import from your existing system (Excel, MEX, SAP), instrument configuration with templates, team member setup, and your first calibration recorded. We guide you through each step. For larger deployments (500+ instruments), we recommend 3–5 days, with on-site support available for Enterprise customers.',
      },
      {
        q: 'Can I migrate data from my current system?',
        a: 'Yes. We support direct import from Excel, MEX, SAP, Maximo, and other CMMs via CSV. Our import wizard validates your data, maps columns, and loads everything automatically. If your system is not listed, we can build a custom import — contact us for a quote. Historical calibration records can be imported as well.',
      },
      {
        q: 'Do I need to re-enter all my instruments?',
        a: 'No. As long as you have a current equipment list, we can import it in bulk. You\'ll need: instrument tag/ID, description, model, calibration interval, and location. We handle the rest. Bulk import typically takes 30–60 minutes for most sites.',
      },
      {
        q: 'What if I want to see CalCheq before committing?',
        a: 'Visit our live demo or request a personalised walkthrough from our team. In a demo call, we\'ll show you how calibration recording, certificate generation, and compliance reporting work using realistic instrument data. No pressure — you can trial the full product free for 30 days after.',
      },
    ],
  },
  {
    section: 'Features',
    faqs: [
      {
        q: 'How does the compliance certificate generation work?',
        a: 'After a calibration is recorded, CalCheq auto-generates AS/NZS ISO 17025–aligned certificates with one click. Include as-found readings, as-left readings, measurement uncertainty, technician sign-off, traceability information, and calibration date. Export as PDF, email to your customer, or archive in CalCheq for audit retrieval.',
      },
      {
        q: 'Can technicians record calibrations on mobile?',
        a: 'Yes. The mobile app works on iPhone and Android, online and offline. Technicians log readings in real time on the shop floor, photograph the instrument or calibrator display, and upload calibrator data (Beamex/Fluke CSV). Data syncs to the dashboard when reconnected. Perfect for remote sites and multi-location plants.',
      },
      {
        q: 'What does "criticality ranking" do and why do I need it?',
        a: 'Criticality ranking assigns Red (safety-critical), Yellow (process-critical), or Green (reference) labels to each instrument based on its role in your process and SIS program. This helps you prioritise maintenance on the instruments that matter most, allocate technician time effectively, and demonstrate risk-based compliance to auditors — especially for IEC 61511.',
      },
      {
        q: 'How do predictive degradation alerts work?',
        a: 'CalCheq learns from your historical calibration data over time. If an instrument shows a trend toward exceeding tolerance (e.g., accuracy drifting over multiple calibrations), we flag it with an alert before it fails. This reduces emergency repairs and process downtime. Red (safety-critical) instruments get the highest alert priority. Available on Professional and Enterprise plans.',
      },
      {
        q: 'Can I manage multiple sites in one account?',
        a: 'Yes. Professional and Enterprise plans include multi-site management. Create separate sites, assign instruments to each, set site-specific calibration intervals, and manage team permissions by role and location. Corporate dashboards roll up compliance status across all sites.',
      },
    ],
  },
  {
    section: 'Compliance & Standards',
    faqs: [
      {
        q: 'Is CalCheq AS/NZS ISO 17025 compliant?',
        a: 'CalCheq helps you comply with AS/NZS ISO 17025 by automating calibration scheduling, recording, traceability, and certificate generation. Our certificates include all required elements: as-found/as-left readings, measurement uncertainty, technician identification, date, and scope. We\'re not an accrediting body, but our workflows are designed to meet the standard.',
      },
      {
        q: 'Can CalCheq help with NATA accreditation?',
        a: 'NATA accreditation requires strict calibration controls, traceability, and documented procedures. CalCheq supports these by providing audit-ready records, automated scheduling, and certificate generation aligned with ISO 17025. You\'ll still need to document your QMS and quality procedures, but CalCheq eliminates the manual tracking that typically causes audit failures.',
      },
      {
        q: 'What\'s the connection to IEC 61511 (Safety Instrumented Systems)?',
        a: 'IEC 61511 requires rigorous proof that SIS instruments (pressure transmitters, shut-off valves, emergency stop buttons) are calibrated and functioning within tolerance. Criticality ranking in CalCheq automates Red (SIS-critical) instrument identification, predicts degradation, and generates compliance certificates proving when each device was last calibrated. Critical for major hazard facilities.',
      },
      {
        q: 'What audit documentation does CalCheq produce?',
        a: 'Audit-ready reports include: calibration history (all as-found/as-left readings), compliance status (overdue instruments, missed intervals), technician sign-offs, certificate archive, multi-site rollup, and criticality status by instrument. All timestamped with full traceability. Export as PDF or keep online.',
      },
    ],
  },
  {
    section: 'Data & Security',
    faqs: [
      {
        q: 'Where is my data hosted?',
        a: 'CalCheq data is hosted on secure cloud infrastructure with redundant backups. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). If you have specific data residency or security requirements, Enterprise customers can discuss custom hosting arrangements.',
      },
      {
        q: 'How often is my data backed up?',
        a: 'Daily automated backups, with point-in-time recovery up to 30 days. We also maintain replication across multiple data centres. Enterprise customers get 90-day backup retention.',
      },
      {
        q: 'Who owns my data?',
        a: 'You do. CalCheq is your data processor, not your data owner. You can export all your data at any time as CSV or PDF. If you cancel, we\'ll provide a full data export and then delete your account after 90 days. We never sell, share, or use your calibration data for any other purpose.',
      },
    ],
  },
  {
    section: 'Pricing & Billing',
    faqs: [
      {
        q: 'What\'s the difference between Starter and Professional plans?',
        a: 'Starter is for small operations (up to 150 instruments, 5 users). Professional is for mid-market sites (up to 500 instruments, unlimited users) and includes criticality ranking, predictive alerts, Beamex/Fluke integration, and multi-site. Enterprise is unlimited instruments with custom integrations and on-site support. See the pricing page for full comparison.',
      },
      {
        q: 'Can I start on Starter and upgrade to Professional later?',
        a: 'Yes. Upgrade anytime. You\'ll be charged the difference for the remainder of your billing cycle. No penalty, no waiting. Many customers start on Starter and move to Professional after seeing value and needing criticality ranking or multi-site.',
      },
      {
        q: 'What happens if I cancel?',
        a: 'You can cancel anytime, with no early-termination fees or lock-in contracts. On cancellation, you have 30 days to download your full data as CSV/PDF. After 90 days, your account is deleted. If you change your mind, you can reactivate within the 90-day window.',
      },
    ],
  },
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-100">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center transition-transform ${open ? 'rotate-45 bg-blue-50 border-blue-200' : ''}`}>
          <svg className={`w-3 h-3 transition-colors ${open ? 'text-blue-600' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  useEffect(() => {
    document.title = 'FAQ — CalCheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Frequently asked questions about CalCheq — instrument calibration management software for oil & gas, chemical, pharma, and mining industries.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Header */}
      <section className="pt-32 pb-14 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Frequently asked questions
          </h1>
          <p className="text-slate-500 text-lg">
            Everything you need to know about CalCheq, implementation, and calibration management best practices.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-12">
          {SECTIONS.map(({ section, faqs }) => (
            <div key={section}>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1 pb-3 border-b-2 border-blue-600">
                {section}
              </h2>
              <div>
                {faqs.map(({ q, a }) => (
                  <AccordionItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Still have questions?</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Contact our team directly. We're here to help with implementation, compliance, or general calibration management advice.
          </p>
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <p className="font-semibold">Email: info@calcheq.com</p>
              <p className="font-semibold">Hours: Monday–Friday, 8 AM–5 PM AWST</p>
            </div>
            <Link to="/contact" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
              Start Your Free Pilot →
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
