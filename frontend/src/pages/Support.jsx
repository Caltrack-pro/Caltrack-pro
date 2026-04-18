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

// ── Tutorial card (collapsible) ───────────────────────────────────────────────

function TutorialCard({ tutorial }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl transition-all overflow-hidden ${open ? 'border-blue-300 bg-blue-50/30 shadow-sm sm:col-span-2' : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left p-4 flex items-start gap-3 focus:outline-none group"
      >
        <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{tutorial.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold leading-snug transition-colors ${open ? 'text-blue-800' : 'text-slate-800 group-hover:text-blue-700'}`}>
            {tutorial.title}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-snug">{tutorial.blurb}</p>
        </div>
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
          open ? 'bg-blue-600 text-white rotate-45' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
        }`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          <div className="h-px bg-blue-100 mb-4" />
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            {tutorial.body}
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

// ── Tutorial content ──────────────────────────────────────────────────────────

const TUTORIALS = [
  {
    emoji: '📥',
    title: 'Importing your instrument register',
    blurb: 'Bulk-load your whole register from a CSV in 3 steps.',
    body: (
      <>
        <p>This is the fastest way to get started when you have more than a handful of instruments.</p>
        <ol className="list-decimal list-outside ml-5 space-y-2 mt-2">
          <li><strong>Open the importer.</strong> In the sidebar click <strong>🔧 Instruments</strong>, then the <strong>Import</strong> button (top-right), or go directly to <code className="px-1 py-0.5 bg-slate-100 rounded">/app/import</code>.</li>
          <li><strong>Download the template.</strong> Click <strong>Download CSV template</strong>. The file <code className="px-1 py-0.5 bg-slate-100 rounded">caltrack_import_TEMPLATE.csv</code> includes every field with example rows.</li>
          <li><strong>Fill it in.</strong> Required columns: <em>tag_number, description, instrument_type, measurement_lrv, measurement_urv, engineering_units, tolerance_type, tolerance_value, calibration_interval_days</em>. Recommended extras: <em>area, criticality, manufacturer, model, serial_number, last_calibration_date, last_calibration_result</em>.</li>
          <li><strong>Upload.</strong> Drag the file onto the upload zone. CalCheq validates every row before importing — you'll see a green/red summary showing how many rows will be created, skipped, or updated.</li>
          <li><strong>Confirm.</strong> Review any warnings (duplicates, missing ranges, bad tolerance types). Click <strong>Import</strong> to write the records.</li>
        </ol>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <strong>Tips:</strong> <em>tag_number</em> must be unique within your site — existing tags are skipped, not overwritten. Dates use <code>YYYY-MM-DD</code>. <em>instrument_type</em> must be one of: pressure, temperature, flow, level, analyser, switch, valve, other. If you omit <em>last_calibration_date</em>, instruments start as Not Calibrated and won't appear in overdue counts until their first calibration is approved.
        </div>
      </>
    ),
  },
  {
    emoji: '🔧',
    title: 'Recording your first calibration',
    blurb: 'From opening the form to submitting for approval.',
    body: (
      <>
        <ol className="list-decimal list-outside ml-5 space-y-2">
          <li><strong>Find the instrument.</strong> Go to <strong>🔧 Instruments</strong> and search or filter by tag, area, or status. You can also open the <strong>📅 Schedule</strong> page and pick a due/overdue instrument from the Technician Queue.</li>
          <li><strong>Open the calibration form.</strong> Click the instrument to open its detail page, then click <strong>📋 Record Calibration</strong>. The form pre-fills the tag, range, tolerance, and test points from the instrument record.</li>
          <li><strong>Enter the calibration header.</strong> Set the calibration date (defaults to today), calibration type (Routine / Corrective / Post-Repair / Initial), and technician name. Fill the <strong>reference standard</strong>: description, serial number, certificate number, and expiry — these are required for traceability.</li>
          <li><strong>Enter as-found readings.</strong> For each test point, type the actual reading you measured at that nominal input. Error %, pass/fail, and marginal flags calculate automatically as you type.</li>
          <li><strong>Decide on adjustment.</strong> If any point failed or was marginal and you adjusted the instrument, toggle <strong>Adjustment made</strong> to Yes, then enter the as-left readings. If no adjustment was needed, leave as-left blank — it will copy from as-found.</li>
          <li><strong>Add notes and return-to-service.</strong> Record defects, replaced parts, or observations. Tick <strong>Return to Service</strong> if the instrument is back in operation.</li>
          <li><strong>Submit.</strong> Click <strong>Submit for Approval</strong>. The record moves to the Pending Approvals queue. Admins auto-approve their own records — technicians and supervisors must wait for a supervisor or admin review.</li>
        </ol>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Remember:</strong> The calibration due date doesn't update until the record is approved. Check the Calibrations → Pending Approvals tab if an instrument is still flagged as overdue right after you entered data.
        </div>
      </>
    ),
  },
  {
    emoji: '✅',
    title: 'Approving calibration records',
    blurb: 'For supervisors and admins — the review & approve workflow.',
    body: (
      <>
        <ol className="list-decimal list-outside ml-5 space-y-2">
          <li><strong>Watch the sidebar badge.</strong> The red number on <strong>📋 Calibrations</strong> shows how many records are waiting for approval. Supervisors and admins landing on this page are auto-switched to the Pending Approvals tab when items exist.</li>
          <li><strong>Open a record.</strong> Click the row to expand the full calibration — you'll see every test point with as-found and as-left readings, error %, and pass/fail per point, plus the reference standard details and technician notes.</li>
          <li><strong>Review the essentials.</strong> Check that: (a) the reference standard has a valid, unexpired certificate, (b) the results look correct against the tolerance, (c) the technician's notes explain any adjustments or defects, and (d) the calibration date and type are right.</li>
          <li><strong>Approve or reject.</strong>
            <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
              <li><strong>Approve</strong> — the record becomes permanent, the instrument's last-calibration fields update, and a new due date is calculated (cal date + interval days).</li>
              <li><strong>Reject</strong> — you'll be asked for a reason. The technician gets an email with your note so they can correct and re-submit.</li>
            </ul>
          </li>
          <li><strong>Audit trail.</strong> Every approve/reject is timestamped with your name and appears on the instrument's Audit Log tab.</li>
        </ol>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <strong>Cannot edit:</strong> Once submitted, records cannot be edited by anyone — only rejected back for correction. This protects the calibration trail for audit purposes.
        </div>
      </>
    ),
  },
  {
    emoji: '📊',
    title: 'Reading the dashboard',
    blurb: 'A guided tour of every widget on the home screen.',
    body: (
      <>
        <p>The Dashboard is your daily health check. Top to bottom:</p>
        <ul className="list-disc list-outside ml-5 space-y-2 mt-2">
          <li><strong>Quick Actions bar</strong> — one-click shortcuts to Add Instrument, Record Calibration, Import CSV, and Run Report.</li>
          <li><strong>4 KPI cards</strong> — <em>Overdue</em> (calibration past due), <em>Due Soon</em> (due in the next 14 days), <em>Total Active Instruments</em>, and <em>Compliance %</em>. Click any card to jump to the filtered list.</li>
          <li><strong>Instrument Health donut</strong> — at-a-glance breakdown: green (current), amber (due soon), red (overdue), and yellow (est. out-of-tolerance based on drift). Hover a segment for the count.</li>
          <li><strong>3 Attention cards</strong> — curated lists of the items that need action today: recent Overdue, recent Failures, and Consecutive Failures (same instrument failed twice in a row). Click a row to open the instrument.</li>
          <li><strong>Compliance by Area</strong> — horizontal bars sorted worst first. Quickly spot which plant areas are falling behind.</li>
          <li><strong>Upcoming (next 7 days)</strong> — a rolling to-do list of calibrations coming due this week.</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Empty dashboard?</strong> Brand-new sites with 0 instruments see a welcome banner instead. Click <strong>Get Started</strong> to open the onboarding wizard or go directly to Import.
        </div>
      </>
    ),
  },
  {
    emoji: '🗂️',
    title: 'Importing from Beamex / Fluke',
    blurb: 'Turn a calibrator CSV export into approved records.',
    body: (
      <>
        <p>Supported calibrators: <strong>Beamex MC6 / MC4 / MC2</strong> and <strong>Fluke 754 / 729 / 726</strong>. If yours isn't listed, email us with a sample CSV — new parsers take ~a day to add.</p>
        <ol className="list-decimal list-outside ml-5 space-y-2 mt-2">
          <li><strong>Export the CSV from your calibrator software.</strong> Beamex CMX: Reports → Export → CSV. Fluke DPCTrack/Track-It: Export → Calibration Results (CSV). Keep all default columns.</li>
          <li><strong>Open the importer.</strong> From the sidebar go to <strong>📋 Calibrations</strong> and click <strong>Import from Calibrator CSV</strong>, or go directly to <code className="px-1 py-0.5 bg-slate-100 rounded">/app/calibrations/import-csv</code>.</li>
          <li><strong>Step 1 — Upload.</strong> Drag the CSV onto the drop zone. CalCheq auto-detects the calibrator brand from the file structure and parses every record.</li>
          <li><strong>Step 2 — Review.</strong> You'll see a table of parsed calibrations with tag match status:
            <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
              <li><span className="text-green-700 font-semibold">✓ Matched</span> — tag exists in your register</li>
              <li><span className="text-red-700 font-semibold">✗ Unknown</span> — no matching tag; row will be skipped</li>
              <li><span className="text-amber-700 font-semibold">⚠ Tolerance mismatch</span> — calibrator's tolerance differs from CalCheq; review which is correct</li>
            </ul>
            Click any row to see the raw test-point data.
          </li>
          <li><strong>Step 3 — Confirm.</strong> Choose whether to submit records as Draft or Submitted. Click <strong>Import</strong>. Records go into the approval queue in exactly the same state as manually entered calibrations.</li>
        </ol>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <strong>Before you import:</strong> Make sure the tag numbers in your calibrator match the tag numbers in CalCheq exactly (case-sensitive). Mismatched tags are the #1 cause of skipped rows.
        </div>
      </>
    ),
  },
  {
    emoji: '👥',
    title: 'Setting up your team',
    blurb: 'Invite members, assign roles, and manage access.',
    body: (
      <>
        <p><strong>Admin access required.</strong> Only admins can invite or remove team members.</p>
        <ol className="list-decimal list-outside ml-5 space-y-2 mt-2">
          <li><strong>Open Team Members.</strong> Sidebar → <strong>⚙️ Settings</strong> → scroll to <strong>Team Members</strong>.</li>
          <li><strong>Invite a new member.</strong> Click <strong>Invite Member</strong>. Enter their email, a display name, and choose a role. Click Send. They receive an email with a link that lets them set a password and sign in — their account is tied to your site automatically.</li>
          <li><strong>Pick the right role.</strong>
            <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
              <li><strong>Admin</strong> — everything: team, billing, approvals, imports, instrument CRUD.</li>
              <li><strong>Supervisor</strong> — same as Admin minus team and billing; can approve calibrations.</li>
              <li><strong>Technician</strong> — enter calibrations and edit instruments. Cannot approve. Sidebar is simplified (no Reports, no Smart Diagnostics).</li>
              <li><strong>Planner</strong> — read access plus the ability to edit scheduling fields (intervals, due dates). Cannot enter calibrations. Defaults to the Planner tab in Schedule.</li>
              <li><strong>Read Only</strong> — viewing access to everything, no writes.</li>
            </ul>
          </li>
          <li><strong>Change or remove a role.</strong> In the Team Members table, click the role dropdown to update or click the red <strong>Remove</strong> button. Removed members lose access immediately.</li>
          <li><strong>Password resets.</strong> Each member manages their own password via <strong>Forgot Password</strong> on the sign-in page. Admins cannot see or reset passwords directly — Supabase handles all password storage.</li>
        </ol>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Seat count:</strong> Your subscription plan determines how many active members you can have. The Settings → Billing section shows your current usage vs limit.
        </div>
      </>
    ),
  },
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
        <h2 className="text-lg font-bold text-slate-800 mb-1">📘 How-to tutorials</h2>
        <p className="text-sm text-slate-500 mb-4">Step-by-step walkthroughs for the most common tasks. Click a card to expand.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TUTORIALS.map(t => (
            <TutorialCard key={t.title} tutorial={t} />
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
