# Calcheq — Project Master Reference

## Local Development Path (Windows)
- Project folder: `C:\Users\nfish\OneDrive\Documents\AI Projects\Caltrack-pro`
- GitHub remote: `https://github.com/Caltrack-pro/Caltrack-pro.git` (branch: main)
- To push changes: open PowerShell in the project folder → `git add -A` → `git commit -m "message"` → `git push`
- Railway auto-deploys on every push to main (allow 2–3 min for build)

---

## What This Project Is
Calcheq is an industrial instrument calibration management web application.
Full-stack: React 18 frontend + Python FastAPI backend + PostgreSQL via Supabase.

Two distinct parts:
1. **Marketing site** — public-facing homepage, pricing, blog, FAQ, contact (no auth required)
2. **Calibration app** — the actual tool, lives under /app/* (gated behind Supabase Auth via AuthGuard)

---

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Python 3.11 + FastAPI
- Database: PostgreSQL via Supabase, using PgBouncer pooler
- Auth: Supabase Auth (JWT ES256, email + password) — migrated from localStorage April 2026
- Charts: Recharts
- PDF generation: jsPDF + jspdf-autotable (client-side)
- Deployment: Railway.app — single service, FastAPI serves React SPA in production
- Production URL: calcheq.com
- Railway internal URL: caltrack-pro-production.up.railway.app

---

## Complete File Map

### Frontend — src/App.jsx
Router root. Two layout trees: marketing (no sidebar) and app (with sidebar + AuthGuard).

### Frontend — src/pages/auth/
- SignIn.jsx             — 2-step: company name → email + password (Supabase Auth)
- SignUp.jsx             — self-serve registration: step 1 = plan selection (stored in user_metadata), creates Supabase user + calls /api/auth/register
- AuthCallback.jsx       — handles email-confirm redirect → Stripe checkout
- ForgotPassword.jsx     — sends Supabase password reset email
- ResetPassword.jsx      — handles reset link, sets new password

### Frontend — src/pages/ (app pages, all under /app/*)
- Dashboard.jsx          — metrics hub: horizontal quick actions bar, 4 KPI stat cards, Instrument Health donut (current/due-soon/overdue/est-out-of-tolerance), 3 attention cards, area compliance bars, upcoming 7-day list; welcome banner for new sites with 0 instruments
- InstrumentList.jsx     — paginated/filterable instrument register with bulk CSV export
- InstrumentForm.jsx     — create and edit instrument (shared form)
- InstrumentDetail.jsx   — single instrument view: calibration history, trend charts, drift analysis, audit trail tabs
- CalibrationForm.jsx    — enter calibration results (as-found / as-left test points, 1–20 points)
- ImportCalibratorCSV.jsx — 3-step Beamex/Fluke CSV import: Upload → Review → Confirm; route: /app/calibrations/import-csv
- ImportInstruments.jsx  — bulk instrument CSV import UI; route: /app/import
- Schedule.jsx           — 2 tabs: Technician Queue / Planner; default tab is role-aware (planner role → Planner tab); route: /app/schedule
- Calibrations.jsx       — 2 tabs: Activity Log / Pending Approvals (with live count badge); auto-switches to Pending Approvals tab for every user when items exist; Approve/Reject buttons visible to all site members (no role gate); route: /app/calibrations
- SmartDiagnostics.jsx   — 3 tabs: Recommendations (critical/advisory/optimisation, 9-rule engine — each card shows a "Recommended action" solution box, category-coloured styling, View-instrument / Calibrate-now / Dismiss actions, and metric tile for projections) / Drift Alerts (sparklines, projected failure dates) / Repeat Failures (bad actors); route: /app/diagnostics
- Documents.jsx          — document library: upload/manage procedures, manuals, certificates; link to instruments; CRUD via /api/documents; route: /app/documents
- AppSettings.jsx        — 5 sections: Site info / Profile / Change Password / Team Members (admin) / Billing & Subscription (admin); route: /app/settings
- Reports.jsx            — export centre: quick export bar (overdue/failed/compliance CSV), 4 report tabs (overdue/upcoming/failed/history); route: /app/reports
- Support.jsx            — FAQ accordion (5 sections, 20 Q&As), tutorial placeholders, contact email; route: /app/support
- Onboarding.jsx         — 3-step welcome wizard (site setup → add instruments → invite team); route: /app/onboarding; no sidebar, full-page
- SuperAdmin.jsx         — platform operator console: sortable/searchable table of all sites, inline Trial/Plan/Pause/Impersonate/Delete actions, three modals (ExtendTrial, OverridePlan, DeleteSite); route: /app/admin; visible only to super-admins (others get 404)

### Legacy routes
Old paths (/app/alerts, /app/approvals, /app/bad-actors, /app/profile, /dashboard, /instruments, /alerts, /reports, /approvals) redirect in App.jsx — see "Legacy redirects" table below. Legacy page files were removed April 2026.

### Frontend — src/pages/marketing/
- Landing.jsx            — homepage: Australian-focused, pain-point cards, features, AUD pricing preview, compliance badge strip, FAQ strip, CTA
- Pricing.jsx            — 3-tier pricing (Starter / Professional / Enterprise), monthly/annual toggle (AUD), feature comparison table
- HowItWorks.jsx         — "Up and running in 48 hours" — 4-step setup, 6 feature deep-dive cards, 4 role cards
- Resources.jsx          — resource library: 10 cards, tag filter, newsletter subscribe
- BlogPost.jsx           — individual article, content keyed by slug (6 articles, static in component); served at /resources/:slug and /blog/:slug
- FAQ.jsx                — accordion FAQ: 23 Q&As across 5 sections
- Contact.jsx            — enquiry form: role select, instrument count select, 3-step process
- DemoPage.jsx           — interactive demo preview at /demo

### Frontend — src/components/
- Layout.jsx             — app shell: fetches pendingCount for sidebar badge on mount, passes to Sidebar; renders Header + <Outlet> + DemoBlockModal
- AuthGuard.jsx          — protects /app/* routes; redirects to /auth/sign-in if no Supabase session
- DemoBlockModal.jsx     — global modal: listens for 'caltrack-demo-blocked' event; shows friendly conversion message when demo user tries a write action
- ImpersonationBanner.jsx — sticky red banner at top of app layout while super-admin is impersonating a site; listens for 'caltrack-impersonation-change'; Exit button clears sessionStorage, calls admin.impersonateEnd for audit marker under real identity, then hard-reloads to /app/admin
- Sidebar.jsx            — emoji nav: 🏠 Dashboard, 🔧 Instruments, 📅 Schedule, 📋 Calibrations (red badge), 🔬 Smart Diagnostics (hidden for technician), 📁 Documents, 📄 Reports (hidden for technician), ⚙️ Settings, 🆘 Support; user avatar; Try Demo toggle; Back to Website
- Header.jsx             — top bar: logged-in user name + role; sign-out via Supabase
- Badges.jsx             — shared status/result badge components (CriticalityBadge, ResultBadge, etc.)
- Toast.jsx              — notification toast system
- TrendCharts.jsx        — calibration trend charts (used in InstrumentDetail)
- marketing/MarketingNav.jsx    — shared nav for all marketing pages
- marketing/MarketingFooter.jsx — shared footer for all marketing pages

### Frontend — src/utils/
- supabase.js            — Supabase client (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- userContext.js         — getUser(), onAuthStateChange, demo mode toggle; shape: { userId, email, userName, siteName, role, isDemoMode, subscriptionStatus, subscriptionPlan, trialEndsAt }
- api.js                 — all API calls; auto-injects Authorization: Bearer <JWT>; 403 in demo mode dispatches 'caltrack-demo-blocked' event; 402 dispatches 'caltrack-subscription-required' event; exports: instruments, calibrations, dashboard, queue, documents, auth, billing
- calEngine.js           — pass/fail/marginal calculation logic (mirrors backend)
- formatting.js          — shared date and number formatting helpers
- reportGenerator.js     — jsPDF: generateSingleCalibrationCert() + generateMultiCalibrationReport()
- calibratorCsvParser.js — client-side CSV parser for Beamex MC6/MC4/MC2 and Fluke 754/729/726

### Backend — backend/
- main.py               — FastAPI app entry point, CORS, router registration
- models.py             — SQLAlchemy ORM models (Instrument, CalibrationRecord, CalTestPoint, AuditLog, CalibrationQueue, Document, DocumentInstrument, Site, SiteMember)
- schemas.py            — Pydantic v2 request/response schemas
- database.py           — Supabase/PostgreSQL connection via SQLAlchemy
- auth.py               — ES256 JWT verification via JWKS; get_current_user / get_optional_user / resolve_site / assert_writable_site / assert_active_subscription
- calibration_engine.py — server-side pass/fail calculation (source of truth)
- notifications.py      — Resend email: submit/approve/reject alerts + daily overdue digest + weekly due-soon digest + member invite email
- routes/auth.py        — GET /api/auth/check-site, POST /api/auth/register, GET /api/auth/me, GET /api/auth/members, POST /api/auth/invite
- routes/contact.py     — POST /api/contact; saves to pilot_requests table with token; emails notification (with Approve/Deny links) to CONTACT_NOTIFY_EMAIL; sends confirmation to lead; always returns 200
- routes/admin.py      — GET /api/admin/pilot/approve?token=X (creates Supabase user + site, sends welcome email, 30-day trial); GET /api/admin/pilot/deny?token=X (marks denied, sends denial email); returns branded HTML pages
- routes/instruments.py — CRUD; site derived from JWT via resolve_site
- routes/calibrations.py — CRUD + submit/approve/reject; ownership checks
- routes/dashboard.py   — stats, alerts, compliance-by-area, upcoming, bad-actors, recommendations (9-rule smart engine)
- routes/queue.py       — GET/POST/DELETE/PATCH /api/queue; calibration work queue with auto-cleanup
- routes/documents.py   — GET/POST/PUT/DELETE /api/documents; document library with instrument linking
- routes/audit.py       — GET /api/instruments/{id}/audit-log, GET /api/audit (admin only)
- routes/billing.py     — POST /api/billing/create-checkout-session, POST /api/billing/create-portal-session, GET /api/billing/subscription, POST /api/billing/webhook (Stripe)
- routes/superadmin.py  — /api/superadmin/* platform operator endpoints (all require get_superadmin_user): GET /sites, GET /sites/{id}, POST /sites/{id}/extend-trial, POST /sites/{id}/override-plan, POST /sites/{id}/pause, POST /sites/{id}/resume, POST /sites/{id}/impersonate-start, POST /sites/{id}/impersonate-end, DELETE /sites/{id}?confirm=&lt;name&gt; (refuses 'calcheq' and 'demo')

### Operational scripts — scripts/
- scripts/seed_instruments.py              — 30 demo instruments for "Demo" site (Python, hits local API)
- scripts/seed_riverdale_demo.sql          — 130-instrument Riverdale Water Treatment Plant demo dataset (run via Supabase)
- scripts/seed_recommendations_examples.sql — supplementary seed that reshapes 6 demo instruments so every Smart Recommendations rule fires at least once (run AFTER seed_riverdale_demo.sql)
- scripts/import_instruments.py            — CSV bulk import script
- scripts/caltrack_import_TEMPLATE.csv     — template CSV for bulk instrument import

### Project folders (non-code)
- docs/business/     — Business Plan, Pilot Offer, Sales One-Pager, MEX migration guide
- docs/specs/        — Compliance/criticality spec, Import wizard spec, Mobile field access report
- docs/marketing/    — SEO Audit Report
- assets/branding/   — Calcheq logo SVG
- assets/screenshots/ — Real website screenshots for reference + marketing
- assets/calibration-pdfs/ — IXOM upload plan and related calibration PDFs

---

## Routing (current)

### Auth routes
| Path                    | Component      |
|-------------------------|----------------|
| /auth/signin            | SignIn         |
| /auth/sign-in           | → /auth/signin |
| /auth/signup            | SignUp         |
| /auth/callback          | AuthCallback   |
| /auth/forgot-password   | ForgotPassword |
| /auth/reset-password    | ResetPassword  |

### Marketing routes
| Path            | Component   |
|-----------------|-------------|
| /               | Landing     |
| /pricing        | Pricing     |
| /how-it-works   | HowItWorks  |
| /resources      | Resources   |
| /resources/:slug| BlogPost    |
| /blog           | → /resources |
| /blog/:slug     | BlogPost    |
| /faq            | FAQ         |
| /contact        | Contact     |
| /demo           | DemoPage    |

### App routes (AuthGuard + Layout)
| Path                                | Component           | Notes                           |
|-------------------------------------|---------------------|---------------------------------|
| /app                                | Dashboard           | index                           |
| /app/instruments                    | InstrumentList      |                                 |
| /app/instruments/new                | InstrumentForm      | create mode                     |
| /app/instruments/:id/edit           | InstrumentForm      | edit mode                       |
| /app/instruments/:id                | InstrumentDetail    |                                 |
| /app/schedule                       | Schedule            | Technician Queue / Planner      |
| /app/calibrations                   | Calibrations        | Activity Log / Pending Approvals |
| /app/calibrations/new/:instrumentId | CalibrationForm     |                                 |
| /app/calibrations/import-csv        | ImportCalibratorCSV |                                 |
| /app/diagnostics                    | SmartDiagnostics    | Recommendations / Drift Alerts / Repeat Failures |
| /app/documents                      | Documents           | Document library with instrument linking |
| /app/reports                        | Reports             | Export centre: quick exports + 4 report tabs |
| /app/settings                       | AppSettings         | Profile / Password / Team       |
| /app/import                         | ImportInstruments   | bulk CSV import                 |
| /app/support                        | Support             | FAQ accordion, tutorials, contact |
| /app/onboarding                     | Onboarding          | 3-step welcome wizard (no sidebar) |
| /app/admin                          | SuperAdmin          | platform operator console — super-admin only (others 404) |

### Legacy redirects (old bookmarks still work)
| Old path        | → New path          |
|-----------------|---------------------|
| /app/alerts     | /app/schedule       |
| /app/approvals  | /app/calibrations   |
| /app/bad-actors | /app/schedule       |
| /app/profile    | /app/settings       |
| /dashboard      | /app                |
| /instruments    | /app/instruments    |
| /alerts         | /app/schedule       |
| /reports        | /app/reports        |
| /approvals      | /app/calibrations   |

---

## Auth System (Supabase Auth — ES256 JWT)

### Database tables
- `sites`        — id (UUID), name, slug, created_at, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_interval, trial_ends_at, subscription_current_period_end
- `site_members` — site_id (FK), user_id (FK→auth.users), role, display_name, email, created_at
- `calibration_queue` — id, site_name, instrument_id (FK), added_by_name, added_at, priority, notes
- `documents`    — id, site_name, title, doc_type, file_name, file_size, file_url, notes, uploaded_by, created_at, updated_at
- `document_instruments` — id, document_id (FK→documents), instrument_id (FK→instruments), UNIQUE(doc, instr)
- `pilot_requests`      — id (UUID), created_at, first_name, last_name, company, location, role, email, phone, num_instruments, current_system, message, status (pending/approved/denied), token (UUID, unique — used in approve/deny links), actioned_at

### Sign-in flow (2-step)
1. Company name → GET /api/auth/check-site validates it exists
2. Email + password → Supabase signInWithPassword → JWT issued
3. GET /api/auth/me → backend returns site + role

### JWT verification
- ES256 asymmetric signing; backend fetches JWKS from Supabase and caches 1 hour
- JWKS URL: https://qdrgjjndwgrmmjvzzdhg.supabase.co/auth/v1/.well-known/jwks.json
- `SUPABASE_JWT_SECRET` is NOT required (SUPABASE_URL is sufficient)
- `assert_writable_site` raises HTTP 403 if user's site is "Demo" (Demo is read-only)

### Auth API routes
- `GET  /api/auth/check-site?name=X`  — validates site name (public)
- `POST /api/auth/register`           — creates site + site_members row
- `GET  /api/auth/me`                 — current user: name, email, role, site, subscription, `is_superadmin` (bool, derived from SUPERADMIN_EMAILS); uses `get_real_user` so impersonation never rewrites the identity reported to the sidebar/avatar
- `GET  /api/auth/members`            — list site members (any authenticated site user — needed for the CalibrationForm technician dropdown; intra-site only so no tenant leakage; mutation endpoints remain admin-only)
- `POST /api/auth/invite`             — create user + add to site + send invite email (admin only; needs SUPABASE_SERVICE_ROLE_KEY)

### Roles
- admin: full access (manage team, billing, delete records)
- supervisor: read/write
- technician: read + create/edit calibrations + edit instruments
- planner: read + edit scheduling fields
- readonly: read only
- superadmin: platform operator — not a DB role, granted via `SUPERADMIN_EMAILS` env var allowlist; bypasses `assert_active_subscription`; sees 👑 Platform Admin sidebar entry; can impersonate any site

**Calibration approval is open to every authenticated site user** (not role-gated) — see DECISIONS.md "Calibration Approval Flow". Role differences above cover mutation scope and nav layout, not approval rights.

### Demo account
- Email: demo@calcheq.com  |  Password: CalcheqDemo2026
- Site: Demo, role: admin; all writes return HTTP 403
- display_name in site_members set to "Demo User" (was null, showed "—" in Settings Team table)

### Required Railway env vars
- `SUPABASE_URL`              — https://qdrgjjndwgrmmjvzzdhg.supabase.co
- `VITE_SUPABASE_URL`         — same (frontend)
- `VITE_SUPABASE_ANON_KEY`    — Supabase anon key
- `VITE_DEMO_EMAIL`           — demo@calcheq.com
- `VITE_DEMO_PASSWORD`        — CalcheqDemo2026
- `SUPABASE_SERVICE_ROLE_KEY` — for POST /api/auth/invite (bypasses RLS — keep secret)
- `RESEND_API_KEY`            — email notifications
- `RESEND_FROM_EMAIL`         — info@calcheq.com
- `CONTACT_NOTIFY_EMAIL`      — email address to receive pilot/contact form submissions (e.g. nfish82@hotmail.com); falls back to RESEND_FROM_EMAIL if not set
- `APP_URL`                   — https://calcheq.com
- `STRIPE_SECRET_KEY`         — Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET`     — Stripe webhook signing secret (whsec_...)
- `SUPERADMIN_EMAILS`         — comma-separated allowlist of platform operator emails (case-insensitive, whitespace-trimmed). NOT a DB role. Empty or unset = no super-admins exist

### Impersonation (super-admin only)
- Super-admin starts a session via `POST /api/superadmin/sites/{id}/impersonate-start`; frontend stores `site_id` + `site_name` in sessionStorage (tab-scoped)
- `api.js` attaches header `X-Impersonate-Site-Id: <uuid>` on every subsequent request
- `get_optional_user` reads the header; if the caller is super-admin the UserContext is rewritten to the target site with role='admin', `is_superadmin=False` (so `assert_writable_site` + `assert_active_subscription` still fire on Demo/paused sites), `is_impersonating=True`, `real_user_id`/`real_email` retained
- Writes (POST/PUT/PATCH/DELETE) during an impersonated session automatically write an audit row via an independent SQLAlchemy session (persists even if the surrounding route 403s and rolls back)
- Impersonate-start/end endpoints emit session-marker audit rows; end is called AFTER sessionStorage is cleared so the marker carries the super-admin's real identity
- Sidebar's 👑 Platform Admin entry + `/api/auth/me` always show the real identity because `/me` and `get_superadmin_user` depend on `get_real_user` (bypasses impersonation)
- `ImpersonationBanner` is sticky red at top of Layout; Exit button does hard reload to drop in-memory query caches

---

## Stripe Billing Integration

### Stripe Account
- Account: CalCheq sandbox (acct_1TMZ6QCMuZPI8s0m)
- Mode: Test (sandbox) — switch to live keys for production

### Products & Prices (AUD)
| Plan          | Product ID             | Monthly Price ID                          | Annual Price ID                           |
|---------------|------------------------|-------------------------------------------|-------------------------------------------|
| Starter       | prod_ULFonbTdcyxDUS    | price_1TMZiHCMuZPI8s0maMKcFOjC ($199)     | price_1TMZiICMuZPI8s0mOMAdEphF ($1,990)   |
| Professional  | prod_ULFoborT7qGhoA    | price_1TMZiKCMuZPI8s0mJTZeAXd6 ($449)     | price_1TMZiLCMuZPI8s0mb2WfQE7t ($4,490)   |
| Enterprise    | prod_ULFplYpi6ymvkI    | price_1TMZiNCMuZPI8s0mAuuMqELL ($899)     | price_1TMZiOCMuZPI8s0mZLuhfHFu ($8,990)   |

### Flow
1. User clicks "Choose a Plan" in Settings → Billing
2. Frontend calls POST /api/billing/create-checkout-session with plan + interval
3. Backend creates Stripe Checkout Session with 14-day trial, redirects to Stripe
4. On success, Stripe sends webhook → backend updates sites table
5. User redirected to /app/settings?billing=success

### Subscription Statuses
- `trialing` — 14-day free trial (default for new sites)
- `active` — paying customer
- `past_due` — payment failed, 7-day grace
- `cancelled` — subscription cancelled
- `incomplete` — first payment pending

### Webhook Events Handled
- `checkout.session.completed` — link Stripe sub to site
- `customer.subscription.created` / `updated` — sync status, plan, period
- `customer.subscription.deleted` — mark cancelled
- `invoice.payment_failed` — mark past_due

### Subscription Enforcement
- `assert_active_subscription(user, db)` in auth.py raises HTTP 402 if not active/trialing
- Frontend api.js catches 402 → dispatches 'caltrack-subscription-required' event → redirects to Settings billing
- Not yet applied to all write routes — add gradually after launch

---

## Core Data Models

### Instrument (instruments table)
tag_number (unique), description, area, unit, instrument_type (pressure/temperature/flow/level/analyser/switch/valve/other), manufacturer, model, serial_number, measurement_lrv, measurement_urv, engineering_units, output_type, calibration_interval_days, tolerance_type (percent_span/percent_reading/absolute), tolerance_value, num_test_points, test_point_values (JSON), criticality (safety_critical/process_critical/standard/non_critical), status (active/spare/out_of_service/decommissioned), procedure_reference, last_calibration_date, last_calibration_result, calibration_due_date, created_by (site name — isolation key), created_at, updated_at

### Calibration Record (calibration_records table)
instrument_id (FK), calibration_date, calibration_type (routine/corrective/post_repair/initial), technician_name, technician_id, reference_standard_description, reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry, procedure_used, adjustment_made, adjustment_notes, technician_notes, defect_found, defect_description, return_to_service, as_found_result, as_left_result (pass/fail/marginal/not_required), max_as_found_error_pct, max_as_left_error_pct, record_status (draft/submitted/approved/rejected), work_order_reference, approved_by (name string), approved_at

### Calibration Test Points (cal_test_points table)
calibration_record_id (FK), point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result

---

## Pass/Fail Calculation Rules (CRITICAL — implement exactly)

```
span = measurement_urv - measurement_lrv

tolerance_abs:
  percent_span    → (tolerance_value / 100) * output_span
  percent_reading → (tolerance_value / 100) * expected_output
  absolute        → tolerance_value

error_abs = actual_output - expected_output
error_pct = (error_abs / output_span) * 100
marginal_threshold = tolerance_abs * 0.8

result per point:
  abs(error_abs) > tolerance_abs      → "fail"
  abs(error_abs) > marginal_threshold → "marginal"
  else                                → "pass"

overall record: fail > marginal > pass (worst point wins)
```

---

## Alert Rules
- OVERDUE: today > calibration_due_date
- DUE_SOON: today > (calibration_due_date − 14 days) AND not overdue
- FAILED: last_calibration_result == "fail"
- CONSECUTIVE_FAILURES: last 2+ records both have as_found_result == "fail"
- PREDICTED_TO_FAIL: drift engine projects failure before next due date

---

## Smart Recommendations Rules (9 rules — GET /api/dashboard/recommendations)

Each rule produces a card on the Recommendations tab. Cards are grouped into three buckets — `critical` (red), `advisory` (amber), `optimisation` (blue) — and every card includes a **Recommended action** solution box.

**Critical**
- `CRIT_SAFETY_OVERDUE` — safety-critical instrument is past its calibration due date.
- `CRIT_CANNOT_CALIBRATE` — last approved calibration's as-left result was `fail` (could not be brought back within tolerance — recommend replacement).
- `CRIT_LAST_CAL_OOT` — last approved calibration's as-found error exceeded 5% of span (large drift since previous cal).
- `CRIT_EST_OOT_NOW` — drift projection using ≥3 approved records indicates the instrument is currently over tolerance (projected error > tol at today's date).
- `CRIT_REPEAT_FAILURE` — 3+ consecutive approved records with as_found_result == `fail` (chronic bad actor).

**Advisory**
- `ADV_DRIFT_MARGINAL` — last approved calibration result was `marginal` (as-found error > 80% of tolerance).
- `ADV_OVERDUE_NONCRITICAL` — non-safety/non-process-critical instrument is overdue.
- `ADV_EST_OOT_30_DAYS` — drift projection indicates the instrument will exceed tolerance within 30 days (but not yet).

**Optimisation**
- `OPT_EXTEND_INTERVAL` — last 3+ approved calibrations all passed with peak as-found error < 20% of tolerance (stable — consider extending interval).

Dropped April 2026: the old `LAST_CAL_FAIL` rule (misleading when as-left passed — issue already resolved).

---

## UI Colour Conventions
- Red (#EF4444 / #C62828): overdue, failed, critical
- Amber (#F59E0B / #B45309): due soon, marginal, warning
- Green (#22C55E / #2E7D32): current, pass, healthy
- Blue (#3B82F6 / #2196F3): informational, primary action
- Navy (#0B1F3A): headings, table headers
- Grey (#6B7280): decommissioned, inactive, muted text

---

## Pending Work

### Completed (April 2026)
- ✅ Approval flow: everyone submits to Pending, anyone can approve, cert goes to technician + approver (24 Apr 2026) — three changes:
  - **Backend `calibrations.py` submit** — removed the admin/supervisor auto-approve branch. Every submission now goes to `SUBMITTED` regardless of role, guaranteeing a second-party approval step (MHF / safety-critical compliance requirement). Audit action is always `submit` — `submit_and_approve` is gone.
  - **Backend `calibrations.py` approve** — cert recipients narrowed from `technician + all site admins/supervisors` to `technician + approver` (de-duplicated so a single email when the same user entered and approved, which is the intentional "entering on behalf of a contractor" workflow).
  - **Frontend `Calibrations.jsx` Pending tab** — dropped the `canApprove()` role gate. Every authenticated site user sees Approve/Reject buttons; the old amber "your role cannot approve" banner is gone; the tab auto-defaults to Pending whenever `count > 0` for everyone, not just approvers.
  - **Behavioural contract:** self-approval is explicitly allowed — a user can submit and approve the same record. The two-party control comes from the workflow (contractor entering → internal approver) rather than a role separation, because contractors don't have CalCheq seats.
- ✅ Calibration cert auto-email hardening (23 Apr 2026) — three fixes so the PDF always reaches the technician who did the work:
  - **Backend `calibrations.py` submit auto-approve path** now resolves the recipient via `_technician_email(rec.technician_id, db)` (same helper the approve path already used), with `current_user.email` as a fallback. Prior code sent the cert to whoever clicked Submit, which for admin/supervisor self-approval was the submitter — not the technician on the record.
  - **Backend `routes/auth.py` `/api/auth/members`** — removed the admin/supervisor role gate (technicians need it for the dropdown; it's intra-site only so no tenant leakage) and added `user_id` to the response so the frontend can bind the Supabase user ID, not just the `site_members` row PK.
  - **Frontend `CalibrationForm.jsx`** — replaced the free-text Technician input with a dropdown populated from `/api/auth/members`. Submitting now sets both `technician_id` (Supabase user_id) and `technician_name` (member's display_name) atomically, so they can't drift. Helper copy under the field tells the user the cert will be emailed to the selected technician.
  - **Cert email flow, end state:** on approval (or on submit when submitter is admin/supervisor and auto-approval fires), backend generates the fpdf2 PDF, base64-encodes it, and sends via Resend to the email resolved from `rec.technician_id` → `SiteMember.email`. Audit action is `submit_and_approve` for the auto-path, `approve` for the normal path. If Resend shows no send attempt at all, the failure is upstream of `resend.Emails.send` — check Railway logs for an ERROR on PDF generation or import.
- ✅ Super-admin / platform operator console (23 Apr 2026) — three phases shipped in one build:
  - **Phase 1 gate:** `SUPERADMIN_EMAILS` env var (frozenset, case-insensitive); `UserContext.is_superadmin` + `is_impersonating` + `real_user_id` + `real_email`; `get_superadmin_user` dependency; `is_superadmin` added to `/api/auth/me`; `assert_active_subscription` bypass for super-admins on their own account
  - **Phase 2 platform console:** new `backend/routes/superadmin.py` (7 endpoints + audit helper); list-sites uses grouped aggregate queries; extend-trial uses `days XOR new_end_date` Pydantic model_validator and extends from `max(now, trial_ends_at)`; delete refuses `calcheq`/`demo` via `UNDELETABLE_SITES` case-insensitive set, requires `?confirm=<name>` match, cascades instruments (by `created_by`) + documents + queue + members; new `frontend/src/pages/SuperAdmin.jsx` with sortable/searchable table and 3 modals; 👑 Platform Admin sidebar entry shown only when `is_superadmin`; `/app/admin` renders `<AppNotFound />` (not redirect) for non-super-admins
  - **Phase 3 impersonation:** header-based (`X-Impersonate-Site-Id`) — no separate JWT; `_apply_impersonation` in `auth.py` rewrites UserContext at the single choke-point so every downstream helper (`resolve_site`, `assert_writable_site`, `assert_active_subscription`) respects it for free; `is_superadmin` flipped off on the impersonated context so subscription/demo gates still fire; writes audited via independent `SessionLocal()` (persists across 403 rollbacks); impersonate-start/end session markers; `ImpersonationBanner` sticky red banner + Exit button hard-reloads to `/app/admin`
- ✅ Stripe payment integration — 3 plans ($199/$449/$899 AUD), checkout sessions, webhooks, customer portal, billing settings, 402 enforcement
- ✅ Subscription enforcement — `assert_active_subscription` in auth.py; 402 → redirect to billing
- ✅ Self-serve sign-up → Stripe checkout — full flow working
- ✅ Role-based views — technician nav simplified, planner defaults to Planner tab, supervisor defaults to Approvals
- ✅ Onboarding wizard — 3-step welcome wizard at /app/onboarding; Dashboard welcome banner for empty sites
- ✅ Demo environment polish — Riverdale header, team seeded, friendly 403 modal, queue/docs/links seeded
- ✅ Website overhaul — hero, pricing ($199/$449/$899), 14-day trial, social proof, SEO (robots.txt, sitemap, JSON-LD)
- ✅ Blog/Resources merge — /blog → /resources, BlogPost served at /resources/:slug, nav shows Resources only
- ✅ Plan-first sign-up — SignUp step 1 = plan selection, stores plan in Supabase user_metadata; AuthCallback (new) handles email confirm → Stripe checkout
- ✅ Pilot approval system — pilot_requests table; contact form saves to DB with token; notification email has Approve/Deny links; admin routes create Supabase user + site + 30-day trial; welcome email with credentials; trial auto-expiry in assert_active_subscription
- ✅ Trial abuse prevention — domain-based check in billing.py; personal email providers use exact match, company domains use domain-wide match
- ✅ MarketingNav — "Start Free Trial" → /contact (30-day managed pilot); green "Sign Up" button → /auth/signup (self-serve plan selection)
- ✅ Brand casing unified — "CalCheq" now consistent across all 16 frontend + backend files (was "Calcheq" in many places)
- ✅ Minor-1: Compliance Rate KPI card shows "—" on empty sites instead of red "0.0%"
- ✅ Polish-3: Planner "+ Add" refreshes queue panel — confirmed `handleAdd` calls `await loadQueue()` after queueApi.add()
- ✅ Polish-7: Trial length unified to 30 days across all marketing copy (Landing, Pricing, FAQ, Contact, HowItWorks, DemoPage, SignUp, AppSettings, SignUp); backend billing.py already set trial_period_days=30 — now consistent everywhere
- ✅ Smart Recommendations engine rewrite (22 Apr 2026) — dropped misleading `LAST_CAL_FAIL` rule; added 4 new rules (`CRIT_CANNOT_CALIBRATE`, `CRIT_LAST_CAL_OOT` >5% span, `CRIT_EST_OOT_NOW` drift projection, `ADV_EST_OOT_30_DAYS` drift projection); every card now carries a "Recommended action" solution box with category-coloured styling and metric tile for projections; new backend endpoint `GET /api/dashboard/recommendations` evaluates all 9 rules per active instrument; `scripts/seed_recommendations_examples.sql` reshapes 6 Riverdale demo instruments so public demo visitors see every rule fire
- ✅ QA bug-fix sprint (20–21 Apr 2026) — 21 bugs resolved across 7 commits; DB migration applied via MCP:
  - ✅ CRITICAL-1: tag_number uniqueness → composite (tag_number, created_by) per site; DB constraint swapped live
  - ✅ CRITICAL-2: last_calibration_date uses calendar MAX not submission order; approval guard + DB recompute
  - ✅ CRITICAL-3: canonical URL + og:url now set per-route by CanonicalManager in App.jsx
  - ✅ Major-1: SignIn cross-checks typed company name against /api/auth/me after auth; signs out + errors on mismatch
  - ✅ Major-2: Dashboard useDashboard depends on siteName/isDemoMode (not tick); guards fetch when site is null
  - ✅ Major-3/4: Dashboard drift card + DriftAlertsTab now include exceeded (fail) instruments, not just marginal
  - ✅ Major-5: Recommendations engine fetches fail instruments and surfaces each as a critical recommendation
  - ✅ Major-6: bad_actors query requires ≥ 2 failures (matches UI copy)
  - ✅ Major-7: InstrumentForm save errors now show toast regardless of scroll position
  - ✅ Major-8: CriticalityBadge renders amber "Unclassified" for null; form defaults null, shows placeholder
  - ✅ Major-9: Documents.jsx reads `results` from API response (was `.documents` / `.instruments`)
  - ✅ Major-11: Document delete now explicitly removes document_instruments rows first (FK constraint fix)
  - ✅ Major-13: AppNotFound component + catch-all Route inside /app AuthGuard layout
  - ✅ Major-14: Mobile drawer already fully implemented in Layout.jsx + Header.jsx (confirmed, not deferred)
  - ✅ Minor-2: status=all no longer returns 500 — treated as no filter
  - ✅ Polish-5: Documents "Uploaded By" column reads `uploaded_by` field
  - ✅ Polish-6: Billing "30-day free trial" copy corrected to "14-day"
  - ✅ Polish-9: Resources cards link to /resources/:slug (canonical), not /blog/:slug

### Known open items (low priority / design decisions)
- Minor-3: DELETE /api/instruments is intentional soft-delete — preserves calibration history; returns 200 with decommissioned instrument. By design, no code change needed.
- ✅ Minor-4: DELETE /api/calibrations/{id} hard-delete endpoint added (admin only); deletes CalTestPoint rows + writes audit entry + recomputes instrument cal state if the deleted record was approved
- Major-12: Supabase JWT refresh blips — infra/CSP issue, no app-code fix; check Railway response headers for CSP

### Phase 2 (30–90 days post-launch)
- **Scheduled report delivery** — weekly/monthly compliance PDF by email (Resend + APScheduler already in place)
- **Subscription plan enforcement** — gate specific features (drift prediction, imports) behind Professional+ plan

### Phase 3 (post-launch with real customers)
- CMMS integration (MEX first, then Maximo / SAP PM)
- QR code / NFC labels per instrument
- Advanced analytics / statistical failure prediction
- Public API + webhooks for Enterprise tier

### Do not build yet
- SIL / IEC 61511 functional safety module | HART hardware integration | SMS notifications | Native mobile app | AI/ML prediction (rule-based drift engine covers this for now)
