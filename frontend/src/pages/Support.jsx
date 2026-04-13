/**
 * Support — Help, FAQs, and contact
 * Three sections:
 *   1. Getting Started quick links (placeholder for future tutorials)
 *   2. Troubleshooting FAQ accordion
 *   3. Contact / get help
 */

import { useState } from 'react'

const NAVY  = '#0B1F3A'
const BLUE  = '#1565C0'
const LIGHT = '#F4F7FC'

// ── Accordion item ────────────────────────────────────────────────────────────

function FaqItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`border rounded-xl transition-colors overflow-hidden ${open ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none group"
      >
        <span className={`text-sm font-semibold transition-colors ${open ? 'text-blue-800' : 'text-slate-800 group-hover:text-blue-700'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
          open ? 'bg-blue-600 text-white rotate-45' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
        }`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-blue-100 mb-4" />
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            {typeof answer === 'string'
              ? <p>{answer}</p>
              : answer
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ── FAQ sections ──────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    title: '🚀 Getting started',
    items: [
      {
        question: 'How do I add my instruments to CalCheq?',
        answer: (
          <>
            <p>There are three ways to get your instruments into the system:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li><strong>CSV bulk import</strong> — go to the sidebar and click <strong>Import Instruments</strong>. Download the template, fill it in with your tag list, and upload. This is the fastest way for large registers.</li>
              <li><strong>Manual entry</strong> — go to <strong>Instruments → Add Instrument</strong>. Best for adding individual instruments one at a time.</li>
              <li><strong>Calibrator CSV import</strong> — if you have a Beamex MC6/MC4/MC2 or Fluke 754/729/726, you can import directly from the calibrator's CSV export under <strong>Calibrations → Import from Calibrator</strong>.</li>
            </ol>
          </>
        ),
      },
      {
        question: 'What information do I need for each instrument?',
        answer: (
          <>
            <p>The minimum required fields are Tag Number, Description, and Instrument Type. For calibration tracking to work properly, you also need:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Measurement range</strong> (LRV and URV) and engineering units</li>
              <li><strong>Tolerance</strong> (% of span, % of reading, or absolute)</li>
              <li><strong>Calibration interval</strong> in days (e.g. 180 for 6-monthly)</li>
              <li><strong>Criticality</strong> (Safety Critical, Process Critical, Standard, Non-Critical)</li>
            </ul>
            <p className="mt-2">Without a range and tolerance, CalCheq cannot calculate pass/fail results from test point data.</p>
          </>
        ),
      },
      {
        question: 'How do I record a calibration?',
        answer: (
          <>
            <p>Navigate to the instrument either from the Instruments list or the Overdue tab in Schedule. Click <strong>📋 Calibrate</strong> to open the calibration form.</p>
            <p className="mt-2">Enter your as-found readings at each test point — CalCheq automatically calculates the error % and pass/fail result. Add your reference standard details, any notes, and submit the record for approval.</p>
          </>
        ),
      },
      {
        question: 'How does the approval workflow work?',
        answer: 'After a technician submits a calibration record, it appears in the Calibrations page under Pending Approvals. A supervisor or admin reviews the results and either approves or rejects with a note. Once approved, the instrument\'s calibration due date is automatically updated. Rejected records go back to the technician for correction.',
      },
    ],
  },
  {
    title: '📅 Scheduling & alerts',
    items: [
      {
        question: 'Why does an instrument show as Overdue even though we just calibrated it?',
        answer: 'Overdue status is based on the calibration_due_date field on the instrument. If a calibration record was submitted but not yet approved, the instrument\'s due date won\'t update until the record is approved. Check the Calibrations → Pending Approvals tab — if there\'s a record waiting for approval, that\'s the cause. Ask a supervisor or admin to approve it.',
      },
      {
        question: 'How is the calibration due date calculated?',
        answer: 'The due date is set to the calibration date of the most recently approved record, plus the instrument\'s calibration interval in days. For example, if an instrument was calibrated on 15 March and has a 180-day interval, its next due date is 11 September. If no approved calibration exists, the instrument shows as Not Calibrated.',
      },
      {
        question: 'What is a "Marginal" result?',
        answer: 'A marginal result means the instrument\'s as-found error exceeded 80% of its tolerance but stayed within the full tolerance limit. For example, if tolerance is ±0.5% and the as-found error is 0.42%, the result is marginal. It\'s a pass — but a warning. Marginal results appear in the Drift Alerts tab because they indicate the instrument is approaching failure.',
      },
      {
        question: 'What are Drift Alerts?',
        answer: 'Drift Alerts show instruments whose as-found error % has been consistently increasing across multiple calibrations. Even if they\'re still within tolerance today, the trend line predicts they\'ll fail at the next calibration. This lets you take action — shorten the interval, inspect the installation, or plan maintenance — before the instrument fails in service.',
      },
      {
        question: 'How do I stop getting alerts for a decommissioned instrument?',
        answer: 'Open the instrument record and change its Status to Decommissioned. Decommissioned instruments are excluded from all alert calculations, compliance scores, and the schedule views. They remain visible in the Instruments list with a grey badge.',
      },
    ],
  },
  {
    title: '📋 Calibration records',
    items: [
      {
        question: 'Can I edit a calibration record after submitting it?',
        answer: 'Submitted records cannot be edited by technicians — this protects the integrity of the calibration trail. If there\'s an error, a supervisor or admin can reject the record with a note explaining what needs to be corrected. The technician then needs to submit a new record.',
      },
      {
        question: 'How do I import calibration data from my Beamex or Fluke calibrator?',
        answer: (
          <>
            <p>Go to <strong>Calibrations → Import from Calibrator CSV</strong>. CalCheq supports CSV exports from:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Beamex MC6, MC4, MC2</li>
              <li>Fluke 754, 729, 726</li>
            </ul>
            <p className="mt-2">Export the completed calibrations from your calibrator software, upload the CSV file, review the parsed results, and confirm. CalCheq will match the data to your instrument tag numbers and create the records automatically.</p>
          </>
        ),
      },
      {
        question: 'How do I generate a calibration certificate?',
        answer: 'Go to Reports and use the Single Instrument Report or the Calibration History Export. Single instrument reports generate a PDF certificate with test point data, pass/fail results, reference standard details, and technician signature fields. These are suitable for NATA or QA record-keeping.',
      },
      {
        question: 'Why is my as-found result showing as "Fail" when the numbers look OK?',
        answer: 'Check the tolerance configuration on the instrument. The tolerance type (% of span, % of reading, or absolute) affects how the error is calculated. A % of span tolerance of 0.5% on a 0–1000 kPa transmitter means ±5 kPa absolute — a % of reading tolerance of 0.5% at 100 kPa means only ±0.5 kPa. If the tolerance type or value is misconfigured, results will be wrong. Edit the instrument and correct the tolerance settings.',
      },
    ],
  },
  {
    title: '👥 Team & access',
    items: [
      {
        question: 'How do I invite a team member?',
        answer: 'Go to Settings → Team Members. Click Invite Member, enter their email address and select their role. They\'ll receive an invitation email with a link to set their password. Only admins can invite new members.',
      },
      {
        question: 'What do the different roles mean?',
        answer: (
          <>
            <ul className="space-y-2 mt-1">
              <li><strong className="text-slate-800">Admin</strong> — full access: instrument CRUD, calibration entry and approval, team management, settings.</li>
              <li><strong className="text-slate-800">Supervisor</strong> — can view everything, create and edit instruments, enter calibrations, and approve/reject records.</li>
              <li><strong className="text-slate-800">Technician</strong> — can view instruments and history, enter calibration records, and edit instrument details. Cannot approve records.</li>
              <li><strong className="text-slate-800">Planner</strong> — read access plus the ability to edit scheduling fields (intervals, due dates). Cannot enter calibrations.</li>
              <li><strong className="text-slate-800">Read Only</strong> — view-only access to all data.</li>
            </ul>
          </>
        ),
      },
      {
        question: 'Can multiple sites use the same account?',
        answer: 'Each site is a separate CalCheq account. If you manage multiple facilities, each needs its own sign-up. Data is completely isolated between sites — no cross-site visibility. Contact us if you need a multi-site or enterprise arrangement.',
      },
    ],
  },
  {
    title: '📄 Reports & compliance',
    items: [
      {
        question: 'What reports can CalCheq generate?',
        answer: (
          <>
            <ul className="list-disc list-inside space-y-1">
              <li>Single instrument calibration certificate (PDF)</li>
              <li>Calibration history report — all records for an instrument over a date range</li>
              <li>Multi-instrument compliance report — overall compliance rate by area</li>
              <li>Bulk CSV export of the instrument register</li>
            </ul>
          </>
        ),
      },
      {
        question: 'How is the compliance rate calculated?',
        answer: 'Compliance rate = (instruments with an approved calibration within their due date) ÷ (total active instruments with a calibration interval set) × 100. Instruments with status "Spare", "Out of Service", or "Decommissioned" are excluded.',
      },
      {
        question: 'Does CalCheq support NATA / ISO 17025 requirements?',
        answer: 'CalCheq is designed to capture the data needed for NATA traceability: reference standard description, serial number, certificate number, certificate expiry, and calibration procedure reference. It does not replace your NATA-accredited laboratory — it manages the scheduling, recording, and history of your on-site calibrations and provides documentation that supports your quality system.',
      },
    ],
  },
]

// ── Tutorial placeholder cards ────────────────────────────────────────────────

const TUTORIALS = [
  { emoji: '📥', title: 'Importing your instrument register',   status: 'coming-soon' },
  { emoji: '🔧', title: 'Recording your first calibration',     status: 'coming-soon' },
  { emoji: '✅', title: 'Approving calibration records',        status: 'coming-soon' },
  { emoji: '📊', title: 'Reading the dashboard',               status: 'coming-soon' },
  { emoji: '🗂️', title: 'Importing from Beamex / Fluke',       status: 'coming-soon' },
  { emoji: '👥', title: 'Setting up your team',                status: 'coming-soon' },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Support() {
  return (
    <div className="space-y-10 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🆘 Support</h1>
        <p className="text-sm text-slate-500 mt-1">How-to guides, troubleshooting, and help getting the most out of CalCheq.</p>
      </div>

      {/* ── Section 1: How-to tutorials ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-1">📹 How-to tutorials</h2>
        <p className="text-sm text-slate-500 mb-4">Step-by-step video guides for common tasks. Coming soon.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TUTORIALS.map(t => (
            <div key={t.title}
              className="relative bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 opacity-75 cursor-not-allowed"
            >
              <span className="text-2xl flex-shrink-0">{t.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 leading-snug">{t.title}</p>
                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  Coming soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Troubleshooting FAQ ───────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-1">❓ Troubleshooting & FAQ</h2>
        <p className="text-sm text-slate-500 mb-5">Common questions and answers. Click any question to expand it.</p>
        <div className="space-y-8">
          {FAQ_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map(item => (
                  <FaqItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Contact ────────────────────────────────────────────────── */}
      <section>
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-1">📬 Still need help?</h2>
          <p className="text-sm text-slate-600 mb-6">
            Can't find what you're looking for? We're a small team and we read every email.
            Expect a response within one business day.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="mailto:info@calcheq.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
              style={{ background: BLUE }}
              onMouseEnter={e => e.currentTarget.style.background = '#1251A8'}
              onMouseLeave={e => e.currentTarget.style.background = BLUE}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@calcheq.com
            </a>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Typically replies within 1 business day
              </span>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-blue-100">
            <p className="text-xs text-slate-500">
              <strong>Feature requests welcome.</strong> CalCheq is actively developed. If there's something you need that isn't here yet — a report format, integration, or workflow — email us. Many features on the roadmap came directly from customer requests.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
