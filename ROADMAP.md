# Calcheq — Product Roadmap

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
Only relevant if Calcheq explicitly targets safety instrumented systems. Do not add
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

**0.1 Custom Domain** *(code complete — external setup remaining)*

Code changes done (April 2026):
- `backend/notifications.py` + `backend/.env.example`: `APP_URL` updated to `https://calcheq.com`
- `frontend/index.html`: OG tags, meta description, twitter:card, and canonical URL added
- All email addresses already used `@calcheq.com`; footer and Contact page already reference `calcheq.com`
- `CLAUDE.md` Supabase URL config updated with new redirect URLs

Remaining steps (must be done manually — requires dashboard access):

~~**Step 1 — Purchase the domain**~~
~~- Register `calcheq.com` at a registrar (Cloudflare Registrar, Namecheap, GoDaddy etc.)~~
~~- Optionally also register `calcheq.com.au` (Australian ccTLD) and set it to redirect to `.com`~~

~~**Step 2 — Add custom domain in Railway**~~
~~- Railway Dashboard → your project → Settings → Domains~~
~~- Click "Add custom domain" → enter `calcheq.com`~~
~~- Railway will show you a CNAME target (e.g. `something.up.railway.app`)~~

~~**Step 3 — Configure DNS at your registrar**~~
~~- Add a CNAME record: `calcheq.com` → Railway's CNAME target~~
~~- If your registrar supports CNAME flattening at the apex (Cloudflare does), use that~~
~~- Otherwise add `www` as CNAME and redirect bare domain to www~~
~~- Railway provisions SSL automatically once the CNAME propagates (usually < 5 minutes on Cloudflare)~~

**Step 4 — Update Railway environment variable**
- Railway Dashboard → your service → Variables
- Change `APP_URL` from `https://caltrack-pro-production.up.railway.app` to `https://calcheq.com`
- Redeploy (Railway does this automatically on env var save)

**Step 5 — Update Supabase Auth redirect URLs**
- Supabase Dashboard → Authentication → URL Configuration
- Site URL: change to `https://calcheq.com`
- Add `https://calcheq.com/auth/reset-password` to the Redirect URLs list
- Keep `https://caltrack-pro-production.up.railway.app/auth/reset-password` until you confirm the new domain works

**Step 6 — Smoke test**
- Visit https://calcheq.com — should load landing page
- Sign in → check JWT session works
- Request a password reset → confirm reset email link uses calcheq.com

*Effort: 1–2 hours once domain is registered and DNS propagates*

~~**0.2 Supabase Auth Migration**~~
~~- Replace localStorage site/user/member state with Supabase Auth (email + password)~~
~~- Add a `sites` table: id, name, slug, subscription_status, created_at~~
~~- Add a `site_members` table: site_id (FK), user_id (FK), role, invited_at~~
~~- Keep existing `created_by` site-isolation on instruments (rename to `site_id` FK later)~~
~~- Replace custom DOM event (`caltrack-user-change`) with `supabase.auth.onAuthStateChange`~~
~~- Add email verification, password reset, and session token handling~~
~~- See DECISIONS.md for the migration plan~~
~~- *Effort: 1–2 weeks*~~

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

~~**✅ 1.1 Immutable Audit Trail** *(completed April 2026)*~~
~~- `audit_log` table: site_id, entity_type, entity_id, user_id, user_name, action, changed_fields JSONB, created_at~~
~~- Every create/update/delete/submit/approve/reject writes an audit row in the same DB transaction~~
~~- "Audit Trail" tab on InstrumentDetail shows all entries for the instrument + its calibration records~~
~~- `GET /api/instruments/{id}/audit-log` — per-instrument; `GET /api/audit` — admin-only site-wide log~~

~~**✅ 1.2 CSV Import UI** *(completed April 2026)*~~
~~- `POST /api/instruments/bulk-import` — multipart/form-data CSV upload; `?dry_run=true` for preview~~
~~- Frontend at `/app/import`: file picker → dry-run preview table → confirm import~~
~~- "Import CSV" button added to InstrumentList header~~
~~- Supports all columns from caltrack_import_TEMPLATE.csv; duplicate tags skipped, errors reported per row~~

~~**✅ 1.3 Email Notifications** *(completed April 2026)*~~
~~- Resend integration in `backend/notifications.py`; gracefully skipped if `RESEND_API_KEY` not set~~
~~- Immediate: calibration submitted → supervisors; approved/rejected → submitting technician~~
~~- Digest: daily overdue alert (08:00 UTC) + weekly due-soon (Mondays 08:00 UTC) via APScheduler~~
~~- `site_members.email` stored on register, back-filled on every `/api/auth/me` call~~
~~- `notification_preferences` table created for future per-user opt-in/out controls~~
~~- Required Railway env vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_URL`~~

~~**✅ 1.4 Mobile / Tablet UI Audit** *(completed April 2026)*~~
~~- Layout already had mobile sidebar with hamburger + backdrop overlay (lg: breakpoint)~~
~~- Header already passes `onMenuClick`; Sidebar already accepts `onNavigate` to auto-close on navigation~~
~~- BadActors page: wrapped `grid-cols-12` list in `overflow-x-auto` + `min-w-[600px]` (was squishing on 390px)~~
~~- InstrumentList: search input changed from fixed `w-56` to `w-full sm:w-56`~~
~~- CalibrationForm: SectionCard padding responsive-reduced to `px-4 py-4 sm:px-6 sm:py-5`~~
~~- InstrumentList, PendingApprovals, CalibrationForm test-points table, InstrumentDetail tabs: all already had `overflow-x-auto`~~
~~- All form grids already used `grid-cols-1 gap-4 sm:grid-cols-2`; action buttons use `flex flex-wrap`~~

~~**✅ 1.5 Demo Account Hardening** *(completed April 2026)*~~
~~- Added `assert_writable_site(current_user, created_by?)` helper to `auth.py`~~
~~- Applied to all write endpoints: instruments (create, update, delete, bulk-import) and calibrations (create, update, submit, approve, reject)~~
~~- Returns HTTP 403 "The Demo site is read-only" when signed-in user's site is Demo OR target resource's created_by is Demo~~
~~- Also fixes a latent security bug: previously any authenticated user could modify Demo instruments (check_instrument_access returned early for Demo)~~

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

- [x] ~~Custom domain is live with SSL~~ *(partially complete: domain purchased, Railway added, DNS configured; steps 4–6 pending)*
- [x] ~~Supabase Auth is in place (real login, not localStorage)~~ *(completed April 2026)*
- [ ] Stripe payment integration is working end-to-end
- [ ] /app/* is gated behind a valid subscription *(auth gating complete; subscription enforcement pending)*
- [ ] Self-serve sign-up flow works without developer intervention
- [x] ~~Demo site resets nightly (or is read-only for guests)~~ *(completed April 2026: read-only demo implemented)*
- [ ] At least one real customer has completed onboarding on the live URL
