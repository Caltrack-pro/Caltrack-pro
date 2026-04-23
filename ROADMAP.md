# CalCheq — Forward Roadmap

*Last updated: 23 April 2026*

---

## What's Been Done (not repeated here — see git history)

Auth (Supabase ES256 JWT), custom domain (calcheq.com), immutable audit trail, CSV import (instruments + Beamex/Fluke calibrator), email notifications (Resend), mobile/tablet responsive pass, demo account hardening (read-only), drift prediction engine, PDF certificate generation, bulk instrument actions, full marketing site (Landing, Pricing, How It Works, Resources, Blog, FAQ, Contact), UX restructure (health donut dashboard, smart diagnostics, documents library, technician queue, export centre).

**Completed 16 April 2026:**
- Demo environment polish (1.1–1.4): Riverdale header, team members seeded, friendly 403 write-block modal, queue/docs/document-instrument links pre-seeded
- Stripe billing integration (2.1–2.5): 3 products + 6 prices created, checkout sessions, webhooks, customer portal, billing settings page, 402 subscription enforcement, trial_ends_at tracking
- Website improvements (3.1–3.5): hero headline sharpened, pricing set to $199/$449/$899 (research-backed), trial updated to 14 days, industry trust labels, quantified results block, robots.txt, sitemap.xml, JSON-LD structured data
- DECISIONS.md updated for 9-tab nav
- Header getPageTitle entries for new routes
- Onboarding wizard (5.1–5.2): 3-step welcome wizard (/app/onboarding), Dashboard welcome banner for empty sites, enhanced empty states on Instruments page
- Role-based views (6.1–6.3): Technician nav hides Reports + Smart Diagnostics; Planner defaults to Planner tab on Schedule; Calibrations page defaults to Pending Approvals tab whenever approvals exist (all users — see 24 Apr approval-flow rewrite)

**Completed 17 April 2026:**
- Trial period updated from 14 days to 30 days across all copy (Landing, Pricing, AppSettings) and backend Stripe checkout session
- Resources tab links fixed: cards now link to `/blog/${slug}` instead of broken `/resources/${slug}`; App.jsx redirect added for `/resources/:slug` → `/blog`
- Contact.jsx + DemoPage.jsx copy: "our team will import" → "our team will help you import"
- Drift Analysis 500 error fixed: SAEnum `.in_()` now uses enum members (not .value strings); calculation wrapped in try/except; calibration_date datetime/date coercion added; div/0 safeguards added
- Audit Trail empty state: improved message explains why seeded instruments show no entries
- PDF certificate auto-email on approval: `fpdf2` added to requirements.txt, `pdf_generator.py` created, `notifications.send_calibration_cert()` added, approve endpoint emails PDF to technician + supervisors/admins as `{tag_number}_{date}.pdf` attachment

**Completed 18 April 2026:**
- Smart Analytics 500 error fixed (`record_status.in_()` now uses string values `["approved", "submitted"]` not enum members)
- Trends tab "not enough data" bug fixed — TrendCharts now includes `submitted` records, not just `approved`
- Admin/supervisor submit → auto-approve + PDF cert emailed immediately (previously required separate approve click) [SUPERSEDED 24 Apr 2026 — auto-approve removed; every submission now routes through Pending Approvals regardless of role]
- "Drift Analysis" tab renamed to "Smart Analytics"
- Smart Analytics tab upgraded: Recharts AreaChart + tolerance bands + recommendation cards (was table only)
- Activity Log default date range extended from 90 days → 365 days (historical CSV-imported records were falling outside the 90-day window)
- Follow-up: 4 PT-9300 calibrations (IXOM pilot) still sitting in "submitted" — approve via Pending Approvals once deployed so Smart Analytics has data

**Completed 24 April 2026:**
- Calibration approval flow rewrite: every submission now goes to Pending Approvals regardless of the submitter's role (auto-approve removed); every authenticated site user can click Approve/Reject (previous admin/supervisor gate dropped, amber "cannot approve" banner removed); the Pending tab auto-opens for all users when `count > 0`; cert recipients on approve narrowed from "technician + all site supervisors/admins" to "technician + approver" (deduped when the same person). Self-approval is explicitly allowed for the contractor-data-entry workflow. See DECISIONS.md "Calibration Approval Flow".
- Calibration cert auto-email hardening: submit auto-approve path resolves recipient via `_technician_email(rec.technician_id, db)` (matches approve path); `/api/auth/members` opened to all authenticated site users and now returns `user_id` so the frontend binds the Supabase user ID not the row PK; CalibrationForm Technician field changed from free text to a dropdown populated from `/api/auth/members` so `technician_id` and `technician_name` can't drift. (This sprint ran into the 24 Apr rewrite — the auto-approve path is now unreachable but the technician-dropdown + member-endpoint changes stand.)

**Completed 23 April 2026:**
- Super-admin / platform operator console — three phases shipped end-to-end:
  - Phase 1 gate: `SUPERADMIN_EMAILS` env-var allowlist (not a DB role); `get_superadmin_user` dependency; `is_superadmin` flag on `/api/auth/me`; super-admins bypass `assert_active_subscription` on their own account
  - Phase 2 platform console: `/api/superadmin/*` endpoints for list sites, site detail, extend-trial (DB-only, no Stripe call), override-plan, pause/resume, delete (refuses `calcheq`/`demo`, requires `?confirm=<name>`, cascades instruments/documents/queue/members); new `/app/admin` page with sortable/searchable site table + 3 modals; 👑 Platform Admin sidebar entry shown only to super-admins; unauthorised visitors hit `/app/admin` get a 404 (via `AppNotFound`), not a redirect
  - Phase 3 impersonation: per-request `X-Impersonate-Site-Id` header (not a separate JWT); `UserContext` rewritten at a single choke-point so every auth helper respects it for free; `is_superadmin` flipped off on the impersonated context so `assert_writable_site` + `assert_active_subscription` still fire as if the super-admin were the site's own admin; writes audited via independent `SessionLocal()` (persists across 403 rollbacks); impersonate-start/end session markers carry the super-admin's real identity; sticky red `ImpersonationBanner` with Exit button that hard-reloads to drop in-memory caches
- Rationale for each sub-decision captured in DECISIONS.md (env-var allowlist over DB column; DB-only trial override over Stripe-backed; header-based impersonation over separate JWT)

**Completed 19 April 2026:**
- Project folder cleanup: removed 4 orphaned legacy page .jsx files (Alerts, PendingApprovals, BadActors, Profile); removed superseded `seed_demo_data.sql`; removed duplicate `Sales One-Pager.html` at root; removed redundant `CalCheq Chat Instructions.md` + `CalCheq Opening Prompt.md`; reorganised into `scripts/`, `docs/business/`, `docs/specs/`, `docs/marketing/`, `assets/branding/`, `assets/screenshots/`, `assets/calibration-pdfs/`
- CLAUDE.md corrections: removed dead "Legacy pages" paragraph, added `/demo` route + `AuthCallback.jsx`, updated Root-level scripts paths to `scripts/`, added Project folders section

---

## Next Steps

> **Status as of 18 April 2026:**
> ✅ 1. Demo Environment (1.1–1.4) — COMPLETE
> ✅ 2. Stripe Payment Integration (2.1–2.5) — COMPLETE
> ✅ 3. Website & Marketing Overhaul (3.1–3.5) — COMPLETE
> ✅ 4. Logo — COMPLETE (SVG assets in frontend/public/assets/)
> ✅ 5. Onboarding Experience (5.1–5.2) — COMPLETE
> ✅ 6. Role-Based Views (6.1–6.3) — COMPLETE
> ✅ 8. Header Updates — COMPLETE
> ⏳ 7. Scheduled Report Delivery — PENDING
> ⏳ 10. Phase 3+ — PENDING (post-launch, customer signal required)

---

### 1. Demo Environment — Make It Sell the Product ✅ COMPLETE

The demo is the most important sales tool. Right now it blocks all writes with a generic 403 and doesn't feel like a real site. Fix this.

**1.1 Show "Riverdale Water Treatment Plant" in the header**
The Header.jsx top-right pill currently shows the site name from `currentUser.siteName`, which is "Demo". When `isDemoMode` is true (or siteName is "Demo"), override the display to show "Riverdale Water Treatment Plant" instead. This makes the demo feel like a real customer environment.

**1.2 Populate the Team Members table with realistic demo staff**
Seed the `site_members` table with 5-6 fictional Riverdale employees so the Settings → Team Members section shows a realistic team:
- Sarah Chen — Admin (Instrumentation Supervisor)
- Marcus Thompson — Supervisor (Maintenance Planner)
- Jake Williams — Technician (I&E Technician)
- Priya Patel — Technician (Calibration Technician)
- Tom Bradley — Planner (Shutdown Coordinator)
- Demo User — Admin (the demo login)

This requires INSERT statements into `site_members` with the Demo site's `site_id`, using fabricated `user_id` UUIDs (they don't need to be real Supabase auth users — they just need to show up in the team list query).

**1.3 Friendly write-block experience instead of 403 errors**
When a demo user tries a write action (Calibrate, Add Instrument, Edit, Delete, Approve, Queue, Upload Document), instead of showing a raw HTTP 403 error or failing silently:
- Catch the 403 in the frontend API layer (`api.js` → `request()` function)
- When the user is in demo mode and receives a 403, show a styled modal/toast: "This is a read-only demo. Sign up for a free trial to start managing your own instruments." with a CTA button to `/contact` or `/auth/signup`
- This turns every blocked action into a conversion opportunity

**1.4 Pre-seed demo data richness**
Review the Riverdale demo dataset (130 instruments from `seed_riverdale_demo.sql`). Ensure the demo has:
- At least 3-4 instruments in each status (overdue, due soon, current, marginal)
- A populated calibration queue (so Technician Queue tab isn't empty)
- Several calibration records with approved/submitted/draft statuses
- At least 2 documents linked to instruments (so Documents page isn't empty)
- Several recommendations firing in Smart Diagnostics

The demo should show every feature in action, not empty states.

---

### 2. Stripe Payment Integration

This is the single biggest blocker to revenue. No Stripe = no paying customers.

**2.1 Stripe Checkout for plan selection**
- 3 plans: Starter ($199/mo AUD), Professional ($449/mo AUD), Enterprise ($899/mo AUD)
- Monthly/annual toggle (annual = 2 months free)
- Stripe Checkout Session created server-side, redirect to Stripe-hosted payment page
- On success, redirect back to `/app` with active subscription

**2.2 Stripe webhooks**
- `customer.subscription.created` → set `subscription_status = 'active'` on sites table
- `customer.subscription.updated` → handle plan changes, payment method updates
- `customer.subscription.deleted` → set `subscription_status = 'cancelled'`, begin grace period
- `invoice.payment_failed` → set `subscription_status = 'past_due'`, trigger email

**2.3 Billing page at /app/settings/billing**
- Current plan display
- Next billing date
- Update payment method (redirect to Stripe Customer Portal)
- Cancel subscription (with confirmation)
- Invoice history

**2.4 Subscription enforcement**
- Gate feature access behind `subscription_status` on the sites table
- Free trial: 14 days, no credit card required
- Expired trial: read-only access with upgrade banner
- Past due: 7-day grace period, then read-only

**2.5 Self-serve sign-up → Stripe checkout flow**
Registration (already built) → plan selection → Stripe checkout → site created → redirect to `/app` with first-run onboarding.

---

### 3. Website & Marketing — Visual and Strategic Overhaul

The marketing site currently works but does not maximise its potential to convert visitors into trial signups. A deep analysis follows.

**3.1 Colour palette assessment**

Current palette: Navy (#0B1F3A) backgrounds, blue (#2196F3) accents, orange (#F57C00) CTAs, light grey (#F4F7FC) sections.

What works:
- Navy conveys authority and trust — appropriate for industrial/compliance software
- The blue accent is clean and modern
- Orange CTAs have high contrast against navy backgrounds

What could improve:
- The site feels monotone — nearly everything is navy-to-blue. There is no visual "warmth" or energy outside the CTA buttons. Industrial SaaS competitors (Limble CMMS, Fiix, UpKeep) use more white space and warmer accent colours to avoid feeling cold/corporate
- The hero section gradient (navy → slightly lighter navy) lacks drama. A subtle background pattern, a diagonal cut, or a hero image/illustration of a technician with a tablet at a plant would immediately communicate "this is for real people in real facilities"
- Section transitions are abrupt — all hard colour changes. Subtle gradients or angled dividers between sections would create visual flow
- The compliance badge strip is well-intentioned but the badges are low-contrast small text. They should be more prominent — these are the trust signals that close deals in this industry

Recommendations:
- Introduce a warm accent colour (teal #0D9488 or green #059669) for "positive" elements (checkmarks, success states, trust badges) to contrast the navy/orange palette
- Add a hero illustration or product screenshot with a real "plant floor" feel — even a stylised SVG of a technician scanning instruments. The current fake browser chrome preview is generic
- Increase white space between sections by 30-40%. The page currently feels dense
- Make the compliance badge strip a full-width, visually distinct section with larger badge icons and brief explanations (not just text labels)

**3.2 Above-the-fold conversion analysis**

The hero headline "Always know which instruments need attention — before they become a problem" is solid but generic. It could apply to any monitoring tool. The subheading is too long (40+ words). 

Recommendations:
- Sharpen the headline to be more specific: "Stop Chasing Overdue Calibrations. Start Preventing Them." or "Your Calibration Spreadsheet Is a Compliance Liability" (this was the original and it's stronger)
- Subheading should be 15-20 words max: "Real-time calibration tracking, drift prediction, and compliance reporting for Australian processing plants."
- Add a third trust element above the fold: either "Trusted by X technicians" (once you have numbers) or "ISO 17025 / NATA compliant" badge prominently placed
- The two CTAs ("Start Free 30-Day Trial" + "See the Live Demo") are correct. Consider making the demo CTA more prominent — demo is lower commitment than trial and feeds the funnel

**3.3 Social proof and trust signals**

The site currently has zero social proof — no logos, no testimonials, no case study numbers. In B2B industrial SaaS, this is the single biggest credibility gap.

Before launch:
- Add an "As used at" logo strip — even if it's just 3-4 industry logos or generic industry silhouettes. If you can't use real logos yet, use industry category labels: "Water Treatment | Mining & Resources | Oil & Gas | Food Processing"
- Add a quantified results block: "30-second calibration lookups | 85% reduction in overdue instruments | 100% audit-ready records" — these can be projections from the Riverdale demo data
- "Built by a calibration technician" origin story — authenticity is the strongest trust signal for niche industrial software. A brief "About" section or blog post about why you built this

Post-launch:
- Real testimonials with name, role, and company
- Case study numbers from pilot customers

**3.4 Content strategy for organic traffic**

The blog has 6 articles — good start. To build organic traffic in this niche:
- Target long-tail keywords: "calibration management software Australia", "ISO 17025 calibration tracking", "instrument calibration spreadsheet template", "how to calculate calibration drift", "NATA calibration requirements"
- Write 2 articles per month targeting these terms
- Create a downloadable "Calibration Interval Optimisation Guide" (PDF) as a lead magnet behind an email gate
- Each blog post should end with a soft CTA to the demo or free trial

**3.5 Page speed and technical SEO**

- Add structured data (JSON-LD) for SoftwareApplication schema
- Ensure all images use WebP format with proper alt text
- Add a sitemap.xml (can be static for now)
- Add robots.txt
- Verify the site in Google Search Console
- Consider adding Plausible or Fathom analytics (privacy-friendly, no cookie banner needed in Australia)

---

### 4. Logo Recommendation

The current logo is an SVG gauge icon (semicircular dial with a needle) rendered inline in the Sidebar and marketing nav, with "CalCheq" as styled text (white "Cal" + blue "Cheq").

**Assessment:**

Strengths:
- The gauge/dial metaphor directly communicates "calibration" and "measurement" — immediately recognisable to the target audience
- The split-colour wordmark (Cal + Cheq) is clean and memorable
- Green needle on the gauge adds a "healthy/pass" connotation

Weaknesses:
- The gauge icon is generic — it could be any monitoring/dashboard product
- At small sizes (favicon, mobile), the gauge detail is lost
- There is no visual connection to the "Cheq" part of the name (check, verification, compliance)

**Recommended direction:**

Keep the gauge concept but evolve it to incorporate a "check" element:

**Option A — Gauge + Checkmark (recommended):**
A simplified gauge dial where the needle points to the green zone, and the needle tip or the green zone itself forms a subtle checkmark shape. This merges "calibration" (gauge) with "check/verified" (cheq). The wordmark stays as-is.

**Option B — Shield + Gauge:**
A shield outline (compliance/protection) containing a simplified gauge dial. This emphasises the compliance/protection value proposition. Works well at small sizes.

**Option C — Stylised "C" as gauge:**
The letter "C" rendered as a gauge arc with a needle, doubling as both the brand initial and the calibration metaphor. Minimal and scales well to favicon.

For all options:
- Primary colours: Navy (#0B1F3A) + Blue (#2196F3) + Green (#22C55E)
- The wordmark "CalCheq" with the blue "Cheq" should remain — it's already recognisable
- The logo should work at 3 sizes: full (sidebar/nav), compact (favicon/mobile tab), and icon-only (app icon)
- Commission a professional vector version once you choose a direction — the current inline SVG approach works for now but a proper logo file (.svg + .png at multiple sizes) is needed before any print material or app store listing

---

### 5. Onboarding Experience

First-run experience after sign-up — currently there is none.

**5.1 Welcome wizard (3 steps)**
- Step 1: Site name, timezone, industry type
- Step 2: Upload your first instruments (CSV or manual entry of 3-5)
- Step 3: Invite your first team member

**5.2 Empty state guidance**
Every page should have a helpful empty state when no data exists yet:
- Dashboard: "Welcome to CalCheq. Add your first instrument to get started." with a prominent button
- Instruments: "No instruments yet. Import from CSV or add manually."
- Schedule: "Your calibration queue is empty. Head to the Planner to schedule work."

Some of these already exist but should be reviewed for consistency and helpfulness.

---

### 6. Role-Based Views

Different users need different default experiences.

**6.1 Technician view**
- Dashboard shows their assigned area's instruments first
- Schedule defaults to their queue items
- Simplified nav (hide Reports, Smart Diagnostics — these are manager tools)

**6.2 Manager/Supervisor view**
- Dashboard shows site-wide compliance overview
- Smart Diagnostics prominent
- Approval queue badge always visible

**6.3 Planner view**
- Schedule → Planner tab as default
- Workload chart is the hero element

Role is already stored on `site_members` — this is a frontend routing/layout change, not a data change.

---

### 7. Scheduled Report Delivery

Automated compliance reports by email — high-value feature for managers.

- Weekly compliance summary (PDF) every Monday morning
- Monthly calibration report (PDF) on the 1st of each month
- Overdue instrument digest (already built as daily email — extend to PDF attachment)
- Configurable per-user in notification preferences
- Uses existing Resend + APScheduler infrastructure

---

### 8. Header Updates for New Pages

The Header.jsx `getPageTitle()` function needs entries for the new routes:
- `/app/diagnostics` → 'Smart Diagnostics'
- `/app/documents` → 'Documents'

Minor fix, do alongside other changes.

---

### 9. DECISIONS.md Update

Update the Navigation Restructure decision to reflect the new 9-tab structure:
- 🏠 Dashboard (health donut, quick actions, KPIs)
- 🔧 Instruments (register, search, bulk actions)
- 📅 Schedule (Technician Queue + Planner)
- 📋 Calibrations (Activity Log + Pending Approvals)
- 🔬 Smart Diagnostics (Recommendations + Drift Alerts + Repeat Failures)
- 📁 Documents (procedures, manuals, certificates)
- 📄 Reports (export centre)
- ⚙️ Settings (profile, password, team, billing)
- 🆘 Support (FAQ, tutorials, contact)

---

### 10. Phase 3+ (3-6 months post-launch, requires customer signal)

These items are not speculative — they are the right next steps once real customers are generating data and feedback. Do not build until there is demand.

- **CMMS Integration** — MEX first (most common in Australian water/mining), then Maximo/SAP PM. Start with one-way sync: push completed calibrations to CMMS work order history.
- **QR Code / NFC Tags** — Printable QR labels linking to InstrumentDetail. Technician scans on tablet → taps "Start Calibration". Significant field workflow improvement.
- **Advanced Analytics** — Statistical failure prediction once 12+ months of real data exists. Fleet benchmarking across anonymised platform data.
- **Public API / Webhooks** — REST API for Enterprise customers to integrate with BI tools. Webhook events for key actions (calibration submitted, instrument overdue).
- **Enterprise: AI-Generated Calibration Procedures** — For Enterprise tier, auto-generate a draft calibration procedure document based on instrument model, type, and range (manufacturer name + instrument model → structured procedure with test points, tolerances, equipment list). Delivered as a downloadable PDF or Word document from the instrument detail page. Requires LLM integration (OpenAI/Anthropic API). Useful for sites that need procedures but haven't yet formalised them — technicians can review and sign off rather than write from scratch. Requires customer signal before building.

---

### What Not to Build (until clear customer signal)

- SIL / IEC 61511 functional safety module (separate product domain)
- HART / 4-20mA communicator integration (hardware dependency)
- SMS notifications (email covers this)
- Native mobile app (responsive web is sufficient)
- AI/ML prediction (rule-based drift engine covers this for now)
- Multi-language (English-only for initial market)

---

## Priority Order

| # | Item | Blocks Revenue? | Effort |
|---|------|----------------|--------|
| 1 | Demo environment polish (1.1-1.4) | Indirectly — it's the sales tool | 2-3 days |
| 2 | Stripe integration (2.1-2.5) | **Yes — no Stripe = no revenue** | 1-2 weeks |
| 3 | Website visual overhaul (3.1-3.5) | Indirectly — affects conversion | 1 week |
| 4 | Logo refinement (4) | No, but improves brand perception | External: 1-2 weeks |
| 5 | Onboarding wizard (5) | No, but reduces churn | 3-4 days |
| 6 | Header + DECISIONS updates (8-9) | No | 30 minutes |
| 7 | Role-based views (6) | No | 1-2 weeks |
| 8 | Scheduled reports (7) | No | 3-5 days |

Items 1 and 2 should be done before any outbound sales or marketing activity. Item 3 should be done before spending any money on ads or SEO.
