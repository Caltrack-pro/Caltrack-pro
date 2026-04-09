# CalTrack Pro — Product Roadmap

*Last updated: April 2026*
*Author: synthesised from two independent AI-assisted product reviews*

---

## Review Synthesis: Signal vs Noise

Two detailed product reviews were conducted in April 2026. Below is a distilled
analysis separating genuine product gaps from premature or already-solved concerns.

### What Reviewers Got Right (Signal)

**Infrastructure gaps (blocking commercial launch):**
- No custom domain — the railway.app URL immediately signals prototype/demo status
  to any prospective customer
- Auth is localStorage only — no real security, no password reset, no session
  management; unacceptable for paying customers
- No payment integration — the app cannot currently collect money
- No account gating — /app/* is open to the public; no subscription enforcement

**Product gaps (real UX and workflow problems):**
- No immutable audit trail — who changed what and when is not tracked; this is a
  regulatory expectation in process industries (ISO 9001, ISO 17025, ISO 55000)
- CSV import is backend-only — technicians cannot self-serve migrate their existing
  data without developer intervention
- No email notifications — overdue alerts and approval requests only exist inside
  the app; no proactive communication
- Mobile/tablet experience is untested — field technicians use tablets on the plant;
  the current layout is desktop-first
- Role-based views are undifferentiated — a technician and a maintenance manager see
  the same interface despite having fundamentally different workflows and priorities
- Drift trend prediction is missing — this is the product's clearest competitive
  differentiator and is not yet built

**Messaging and positioning weaknesses:**
- The headline does not communicate the product's industrial/regulatory context clearly
- No social proof beyond static testimonials — logo strip, case study numbers, or
  a reference to the IXOM/Acme Industries origin would increase credibility
- The pricing page does not speak to compliance value (ISO 9001, 17025, PSSR)

### What Reviewers Got Wrong (Noise — do not act on yet)

**Multi-point calibration:** Both reviewers assumed this was missing. It is already
built. The CalibrationForm captures 1–20 test points with full as-found/as-left
measurements, error calculations, and pass/fail/marginal results per point.

**CMMS integration (SAP, Maximo, MEX):** Genuinely useful but a Phase 3+ item.
Requires scoping actual customer workflows and likely bespoke API work per system.
Building this speculatively before having paying customers would be wasted effort.

**HART / 4-20mA communicator integration:** Hardware dependency (USB dongles,
protocol drivers). Phase 3+ at earliest. Cannot be specced without a device in hand.

**SIL / Functional Safety module:** A completely separate product domain (IEC 61511).
Only relevant if CalTrack explicitly targets safety instrumented systems. Do not add
until there is a clear customer demand signal.

**AI / predictive analytics:** Reviewers suggested ML-based failure prediction.
The right foundation is to first collect 12–24 months of real customer calibration
data. Build the drift prediction engine (see Phase 2) as a rule-based system first;
introduce statistical modelling when the data volume justifies it.

**SMS notifications:** Low-priority. Email covers the same use case. Revisit when
a customer specifically requests it.

---

## Phased Roadmap

---

### Phase 0 — Commercial Readiness (do first, blocks revenue)

These items must be complete before any sales or marketing activity. Nothing else
matters until these are done.

**0.1 Custom Domain**
- Purchase a domain (e.g. caltrackpro.com or caltrack.io)
- Configure DNS to point to Railway deployment
- Add SSL (Railway handles this automatically via custom domain)
- Update all hardcoded URLs in the marketing site (footer, OG tags, Contact page)
- *Effort: 1 day*

**0.2 Supabase Auth Migration**
- Replace localStorage site/user/member state with Supabase Auth (email + password)
- Add a `sites` table: id, name, slug, subscription_status, created_at
- Add a `site_members` table: site_id (FK), user_id (FK), role, invited_at
- Keep existing `created_by` site-isolation on instruments (rename to `site_id` FK later)
- Replace custom DOM event (`caltrack-user-change`) with `supabase.auth.onAuthStateChange`
- Add email verification, password reset, and session token handling
- See DECISIONS.md for the migration plan
- *Effort: 1–2 weeks*

**0.3 Stripe Payment Integration**
- Add Stripe Checkout for plan selection (Starter / Professional / Enterprise)
- Store `subscription_status` and `plan` on the `sites` table
- Handle Stripe webhooks: `customer.subscription.created`, `updated`, `deleted`
- Add a billing page under /app/settings/billing
- *Effort: 1 week*

**0.4 Account Gating**
- Gate /app/* behind Supabase Auth (must be signed in)
- Gate feature access behind subscription status (must have active subscription)
- Build a self-serve sign-up flow: registration → Stripe checkout → site creation → seeded demo instruments
- Add a 14-day free trial with no credit card required to reduce friction
- *Effort: 3–5 days (depends on 0.2 and 0.3 being complete)*

---

### Phase 1 — Core Product Hardening (first 30 days post-launch)

These are the gaps that will come up in the first customer support tickets or
the first ISO audit conversation.

**1.1 Immutable Audit Trail**
- Every create/update to instruments and calibration records must log: user ID,
  user name, timestamp, action type, and a diff of changed fields
- New table: `audit_log` (entity_type, entity_id, user_id, user_name, action,
  changed_fields JSONB, created_at)
- Backend: add an audit log write to every POST/PUT/PATCH/DELETE route
- Frontend: add an "Audit Trail" tab to InstrumentDetail showing the log for
  that instrument and all its calibration records
- This is a regulatory expectation for ISO 9001, ISO 17025, and PSSR compliance
- *Effort: 3–5 days*

**1.2 CSV Import UI**
- Build a frontend upload page at /app/import (or accessible from InstrumentList)
- File picker → column mapping preview → validation summary → confirm import
- Backend: expose the existing `import_instruments.py` logic as an API endpoint
  (POST /api/instruments/bulk-import accepting multipart/form-data)
- Support the existing caltrack_import_TEMPLATE.csv column format
- Show a results summary: X imported, Y skipped (duplicate tag numbers), Z errors
- *Effort: 3–4 days*

**1.3 Email Notifications**
- Integrate Resend or SendGrid (Resend recommended — simpler API, good free tier)
- Trigger types to implement first:
  - Overdue instrument alert (daily digest to site admin/supervisor)
  - Calibration due within 7 days (weekly digest)
  - Calibration submitted for approval (immediate, to supervisors)
  - Calibration approved/rejected (immediate, to submitting technician)
- Backend: add a `notifications` table for preference management
- Railway cron job or Supabase scheduled function for daily/weekly digests
- *Effort: 1 week*

**1.4 Mobile / Tablet UI Audit**
- Audit every app page at 768px (iPad) and 390px (iPhone 14) breakpoints
- Priority pages: CalibrationForm, InstrumentDetail, Alerts
- Fix layout issues: overflow, tap target sizes, font scaling
- CalibrationForm in particular needs to work well on a tablet in landscape mode
  (technicians fill this in at the instrument, not at a desk)
- *Effort: 3–5 days*

**1.5 Demo Account Hardening**
- The "Demo" site is public and writable — demo data gets corrupted if visitors
  make changes. Add a nightly reset job that re-seeds demo instruments to their
  baseline state. Alternatively, make the Demo site read-only for visitors.
- Update all demo references from "Admin" to "Demo" in DECISIONS.md and in any
  UI copy that hardcodes the site name
- *Effort: 1–2 days*

---

### Phase 2 — Product Depth (30–90 days post-launch)

These items deepen the product's value and build toward the key differentiator:
drift prediction.

**2.1 Role-Based Views**
- Technician view: personal task queue showing instruments due for calibration,
  assigned to their area; sorted by urgency; one-click to start a calibration
- Manager / Supervisor view: compliance dashboard showing area-by-area status,
  approval queue count, bad actor summary, upcoming workload
- Planner view: scheduling calendar showing all instruments due by week/month
- Role is already stored — this is a UI routing/layout change, not a data change
- *Effort: 1–2 weeks*

**2.2 Drift Prediction Engine**
- For each instrument with 3+ historical calibration records, calculate:
  - Average as-found error per test point over time (drift rate)
  - Projected date at which the instrument will exceed tolerance if current
    drift rate continues (drift deadline)
  - Recommended next calibration date based on drift rate (may be earlier than
    the fixed interval)
- Display on InstrumentDetail as a "Drift Analysis" section below trend charts
- Add a "Predicted to Fail" alert type on the Alerts page
- Flag instruments where predicted failure date < next calibration due date
- This is the product's clearest differentiator vs spreadsheets and basic CMMS
  calibration modules — it turns historical data into proactive risk management
- *Effort: 1–2 weeks (rule-based, no ML required at this stage)*

**2.3 Reporting Improvements**
- Scheduled report delivery: send compliance reports by email on a set schedule
  (weekly / monthly) — depends on 1.3 being complete
- Compliance certificate: a one-page PDF suitable for attaching to ISO audit
  evidence packs — summarises site-wide compliance status, signed off by supervisor
- Report filtering: date range, area, instrument type, technician, result type
- *Effort: 1 week*

**2.4 Instrument Bulk Actions**
- InstrumentList currently allows only single-instrument operations
- Add checkbox selection and bulk actions: change status, reassign area,
  update calibration interval, export selected to CSV
- *Effort: 3–4 days*

---

### Phase 3 — Ecosystem & Scale (3–6 months post-launch)

These are medium-to-long-term items that require real customer data and demand
signals before investing engineering time.

**3.1 CMMS Integration**
- Priority order based on likely customer base: MEX → Maximo → SAP PM → Infor EAM
- Start with a one-way sync: CalTrack pushes completed calibration records to the
  CMMS work order history
- Build as a webhook/API connector, not a bespoke integration per system
- Do not build until at least one paying customer requests it with a specific CMMS

**3.2 QR Code / NFC Tag Support**
- Generate printable QR code labels for instruments (links to InstrumentDetail)
- Technician scans QR code on tablet → opens instrument in app → taps "Start Calibration"
- This improves the field workflow significantly but is not a launch-blocker

**3.3 Advanced Analytics**
- Once 12+ months of real customer data exists, introduce statistical failure
  prediction (regression on drift rate, instrument age, environmental factors)
- Fleet benchmarking: how does a customer's failure rate compare to similar
  instruments across the anonymised platform dataset
- This requires data volume that will not exist at launch

**3.4 API / Webhook Access**
- Public REST API for customers who want to integrate CalTrack data into their
  own BI tools or CMMS systems
- Webhook events for key actions (calibration submitted, approved, instrument overdue)
- Required for Enterprise tier customers

---

## Marketing & Positioning Track (parallel to engineering)

These do not require code changes and can be done at any time.

**M.1 Messaging Rewrite**
- Current headline is generic. New headline should lead with the outcome and the
  audience: e.g. "Instrument calibration management built for process industries"
  or "Stop chasing overdue calibrations — know what's failing before it fails"
- Add a sub-headline that names the regulatory standards the product supports
  (ISO 9001, ISO 17025, PSSR 2000, AS/NZS standards)

**M.2 Social Proof**
- Add a logo strip to the Landing page (even 2–3 recognisable industry logos)
- Add a quantified results section: "Cut overdue instruments from 23% to 4%"
  (already referenced in the blog — lift it to the hero section)
- Add the IXOM/Acme Industries origin story to the About section or blog
  ("Built by calibration technicians, not software vendors")

**M.3 SEO Fundamentals**
- Add meta descriptions and OG tags to all marketing pages
- Add structured data (Organization, SoftwareApplication schema) to Landing
- Ensure blog article slugs and headings target relevant search terms
  (e.g. "instrument calibration management software", "ISO 17025 calibration records")

**M.4 Pricing Page Trust Signals**
- Add compliance logos/badges (ISO 9001, ISO 17025 compatible, PSSR)
- Add a FAQ section to the pricing page addressing common objections
  (data security, data export/portability, contract terms)
- Make the Enterprise tier CTA a "Book a demo" rather than just "Contact sales"

---

## What Not to Build (until there is a clear customer signal)

- SIL / IEC 61511 functional safety module
- HART communicator / 4-20mA device integration (hardware dependency)
- SMS notifications (email covers this)
- Native mobile app (responsive web is sufficient for field use)
- AI/ML failure prediction (build rule-based drift engine first; ML comes later)
- Multi-language / internationalisation (English-only is fine for the initial market)

---

## Definition of "Launch-Ready"

The product is ready for its first paid customer when:

- [ ] Custom domain is live with SSL
- [ ] Supabase Auth is in place (real login, not localStorage)
- [ ] Stripe payment integration is working end-to-end
- [ ] /app/* is gated behind a valid subscription
- [ ] Self-serve sign-up flow works without developer intervention
- [ ] Demo site resets nightly (or is read-only for guests)
- [ ] At least one real customer has completed onboarding on the live URL
