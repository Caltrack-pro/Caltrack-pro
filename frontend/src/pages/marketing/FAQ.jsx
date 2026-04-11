import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

const SECTIONS = [
  {
    section: 'Getting Started',
    faqs: [
      {
        q: 'What is Calcheq?',
        a: 'Calcheq is a web-based calibration management system built for industrial instrumentation teams. It replaces paper logs and spreadsheets with a structured, audit-ready record of every calibration performed — including full test point data, pass/fail calculations, approval workflows, and live dashboards.',
      },
      {
        q: 'Who is Calcheq designed for?',
        a: 'Calcheq is built for instrument technicians, reliability engineers, and maintenance supervisors in industries where accurate instrumentation is critical — oil and gas, chemical processing, food and beverage, pharmaceuticals, mining, and power generation.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No. Calcheq is a fully responsive web application. You access it from any modern browser — desktop, tablet, or mobile. There is nothing to install or configure on your local machine.',
      },
      {
        q: 'How long does it take to get started?',
        a: 'Most teams are up and running within a day. Create your site, add your instruments (with calibration intervals and tolerances), and your team can start logging calibrations immediately. You can also bulk-import your instrument list from a CSV file.',
      },
    ],
  },
  {
    section: 'Features & Functionality',
    faqs: [
      {
        q: 'How does multi-point calibration work?',
        a: 'Calcheq supports 1–20 test points per instrument. For each calibration, you define the expected outputs and a tolerance (as % span, % reading, or absolute value). Technicians record as-found and as-left readings at each point. Calcheq automatically calculates the error at each point and assigns a pass, marginal (within 80–100% of tolerance), or fail result. The overall record result is determined by the worst individual point.',
      },
      {
        q: 'What are the different alert types?',
        a: 'Calcheq monitors four alert conditions: OVERDUE (past the calibration due date), DUE SOON (within 14 days of due), FAILED (last calibration result was a fail), and CONSECUTIVE FAILURES (two or more consecutive as-found failures — indicating a systematic instrument problem).',
      },
      {
        q: 'How does the approval workflow work?',
        a: 'Technicians create calibration records as drafts, fill in test point data, then submit the record for approval. Supervisors and Admins can then approve or reject submitted records directly from the instrument detail or the Pending Approvals page. Only approved records update the instrument\'s calibration status and due date on the dashboard.',
      },
      {
        q: 'Can multiple users access the same site simultaneously?',
        a: 'Yes. Calcheq supports concurrent multi-user access. Each user\'s name and role is stored separately, so you always know who created, submitted, or approved a record.',
      },
      {
        q: 'What do the different user roles allow?',
        a: 'Admin and Supervisor: full access including approvals. Technician: can create and edit instruments and calibration records. Planner: can view and update scheduling fields. Read-Only: view-only access for operations and management stakeholders.',
      },
    ],
  },
  {
    section: 'Data & Security',
    faqs: [
      {
        q: 'Is my data isolated from other organisations?',
        a: 'Yes. Calcheq uses site-based isolation — every instrument, calibration record, and dashboard is scoped to your specific site. Users from other sites cannot see your data, and users from your site cannot see theirs.',
      },
      {
        q: 'Can different sites within our company have separate accounts?',
        a: 'Yes. Each physical site or operating unit can have its own Calcheq site with its own password, instrument list, and user base. Enterprise customers can get a unified overview across sites — contact us for details.',
      },
      {
        q: 'How are calibration records stored?',
        a: 'Records are stored in a PostgreSQL database hosted via Supabase, with daily backups. All data is retained for the lifetime of your subscription and is exportable to CSV at any time.',
      },
    ],
  },
  {
    section: 'Pricing & Billing',
    faqs: [
      {
        q: 'How much does Calcheq cost?',
        a: 'Pricing is to be confirmed ahead of general launch. We are currently in early access. Visit the Pricing page for plan details, or contact us to register interest and secure an early-access rate.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes — the demo app is fully functional and free to explore. You can sign up at any time and try all features without a credit card.',
      },
      {
        q: 'What happens if I do not upgrade after the trial?',
        a: 'Your account will move to read-only mode. You can still view and export your data, but you won\'t be able to add new instruments or calibration records until you upgrade.',
      },
      {
        q: 'What happens to my data if I cancel?',
        a: 'You retain full access to export your data at any time. You can download your full calibration history to CSV from the Reports page before or after cancellation.',
      },
    ],
  },
  {
    section: 'Compliance & Standards',
    faqs: [
      {
        q: 'Does Calcheq support ISO/IEC 17025?',
        a: 'Calcheq\'s calibration workflows — reference standard tracking, as-found/as-left recording, technician identification, immutable audit trail, and approval workflows — are designed with ISO/IEC 17025 requirements in mind. Your quality manager should confirm applicability for your specific accreditation scope.',
      },
      {
        q: 'Can Calcheq help with our ISO 9001 calibration requirements?',
        a: 'ISO 9001 Clause 7.1.5 requires documented evidence of calibration, traceability to measurement standards, and records of calibration status. Calcheq provides all three out of the box, with an immutable audit trail and CSV export for compliance records.',
      },
      {
        q: 'Is there an audit trail?',
        a: 'Yes. Calcheq maintains a complete immutable audit trail of every action — creation, submission, approval, rejection, and editing of instruments and calibration records. Every event is timestamped and tracks who made the change. The audit trail cannot be modified or deleted.',
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
    document.title = 'FAQ — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Frequently asked questions about Calcheq — instrument calibration management software for oil & gas, chemical, pharma, and mining industries.'
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
            Everything you need to know about Calcheq. Can't find what you're looking for?{' '}
            <Link to="/contact" className="text-blue-600 hover:underline font-medium">Contact us.</Link>
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
            We're happy to answer anything specific to your site, your industry, or your compliance requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
              Contact us
            </Link>
            <Link to="/app" className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Try the demo
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
