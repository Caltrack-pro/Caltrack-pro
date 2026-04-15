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
- SignUp.jsx             — self-serve registration: creates Supabase user + calls /api/auth/register
- ForgotPassword.jsx     — sends Supabase password reset email
- ResetPassword.jsx      — handles reset link, sets new password

### Frontend — src/pages/ (app pages, all under /app/*)
- Dashboard.jsx          — metrics hub: horizontal quick actions bar, 4 KPI stat cards, Instrument Health donut (current/due-soon/overdue/est-out-of-tolerance), 3 attention cards, area compliance bars, upcoming 7-day list
- InstrumentList.jsx     — paginated/filterable instrument register with bulk CSV export
- InstrumentForm.jsx     — create and edit instrument (shared form)
- InstrumentDetail.jsx   — single instrument view: calibration history, trend charts, drift analysis, audit trail tabs
- CalibrationForm.jsx    — enter calibration results (as-found / as-left test points, 1–20 points)
- ImportCalibratorCSV.jsx — 3-step Beamex/Fluke CSV import: Upload → Review → Confirm; route: /app/calibrations/import-csv
- ImportInstruments.jsx  — bulk instrument CSV import UI; route: /app/import
- Schedule.jsx           — 2 tabs: Technician Queue (default, shows queued instruments as table) / Planner (queue any active instrument, 12-week workload chart); route: /app/schedule
- Calibrations.jsx       — 2 tabs: Activity Log (default, with PDF cert download per row) / Pending Approvals (with live count badge); route: /app/calibrations
- SmartDiagnostics.jsx   — 3 tabs: Recommendations (critical/advisory/optimisation, rule-based engine) / Drift Alerts (sparklines, projected failure dates) / Repeat Failures (bad actors); route: /app/diagnostics
- Documents.jsx          — document library: upload/manage procedures, manuals, certificates; link to instruments; CRUD via /api/documents; route: /app/documents
- AppSettings.jsx        — 5 sections: Site info / Profile / Change Password / Team Members (admin) / Billing & Subscription (admin); route: /app/settings
- Reports.jsx            — export centre: quick export bar (overdue/failed/compliance CSV), 4 report tabs (overdue/upcoming/failed/history); route: /app/reports
- Support.jsx            — FAQ accordion (5 sections, 20 Q&As), tutorial placeholders, contact email; route: /app/support
- Onboarding.jsx         — 3-step welcome wizard (site setup → add instruments → invite team); route: /app/onboarding; no sidebar, full-page

### Legacy pages (files still exist but routes now redirect to above)
- Alerts.jsx → /app/schedule | PendingApprovals.jsx → /app/calibrations | BadActors.jsx → /app/schedule | Profile.jsx → /app/settings

### Frontend — src/pages/marketing/
- Landing.jsx            — homepage: Australian-focused, pain-point cards, features, AUD pricing preview, compliance badge strip, FAQ strip, CTA
- Pricing.jsx            — 3-tier pricing (Starter / Professional / Enterprise), monthly/annual toggle (AUD), feature comparison table
- HowItWorks.jsx         — "Up and running in 48 hours" — 4-step setup, 6 feature deep-dive cards, 4 role cards
- Resources.jsx          — resource library: 10 cards, tag filter, newsletter subscribe
- Blog.jsx               — article index with tag filters
- BlogPost.jsx           — individual article, content keyed by slug (6 articles, static in component)
- FAQ.jsx                — accordion FAQ: 23 Q&As across 5 sections
- Contact.jsx            — enquiry form: role select, instrument count select, 3-step process

### Frontend — src/components/
- Layout.jsx             — app shell: fetches pendingCount for sidebar badge on mount, passes to Sidebar; renders Header + <Outlet> + DemoBlockModal
- AuthGuard.jsx          — protects /app/* routes; redirects to /auth/sign-in if no Supabase session
- DemoBlockModal.jsx     — global modal: listens for 'caltrack-demo-blocked' event; shows friendly conversion message when demo user tries a write action
- Sidebar.jsx            — emoji nav: 🏠 Dashboard, 🔧 Instruments, 📅 Schedule, 📋 Calibrations (red badge), 🔬 Smart Diagnostics, 📁 Documents, 📄 Reports, ⚙️ Settings, 🆘 Support; user avatar; Try Demo toggle; Back to Website
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
- routes/contact.py     — POST /api/contact; accepts lead form, emails notification to CONTACT_NOTIFY_EMAIL via Resend; always returns 200
- routes/instruments.py — CRUD; site derived from JWT via resolve_site
- routes/calibrations.py — CRUD + submit/approve/reject; ownership checks
- routes/dashboard.py   — stats, alerts, compliance-by-area, upcoming, bad-actors
- routes/queue.py       — GET/POST/DELETE/PATCH /api/queue; calibration work queue with auto-cleanup
- routes/documents.py   — GET/POST/PUT/DELETE /api/documents; document library with instrument linking
- routes/audit.py       — GET /api/instruments/{id}/audit-log, GET /api/audit (admin only)
- routes/billing.py     — POST /api/billing/create-checkout-session, POST /api/billing/create-portal-session, GET /api/billing/subscription, POST /api/billing/webhook (Stripe)

### Root-level scripts
- seed_instruments.py              — 30 demo instruments for "Demo" site
- seed_riverdale_demo.sql          — 130-instrument Riverdale Water Treatment Plant demo dataset
- import_instruments.py            — CSV bulk import script
- caltrack_import_TEMPLATE.csv     — template CSV for bulk instrument import

---

## Routing (current)

### Auth routes
| Path                    | Component      |
|-------------------------|----------------|
| /auth/signin            | SignIn         |
| /auth/sign-in           | → /auth/signin |
| /auth/signup            | SignUp         |
| /auth/forgot-password   | ForgotPassword |
| /auth/reset-password    | ResetPassword  |

### Marketing routes
| Path            | Component   |
|-----------------|-------------|
| /               | Landing     |
| /pricing        | Pricing     |
| /how-it-works   | HowItWorks  |
| /resources      | Resources   |
| /blog           | Blog        |
| /blog/:slug     | BlogPost    |
| /faq            | FAQ         |
| /contact        | Contact     |

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
- `GET  /api/auth/me`                 — current user: name, email, role, site
- `GET  /api/auth/members`            — list site members (admin/supervisor only)
- `POST /api/auth/invite`             — create user + add to site + send invite email (admin only; needs SUPABASE_SERVICE_ROLE_KEY)

### Roles
- admin: full access
- supervisor: read/write + approve calibrations
- technician: read + create/edit calibrations + edit instruments
- planner: read + edit scheduling fields
- readonly: read only

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
- `APP_URL`                   — https://calcheq.com
- `STRIPE_SECRET_KEY`         — Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET`     — Stripe webhook signing secret (whsec_...)

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

## UI Colour Conventions
- Red (#EF4444 / #C62828): overdue, failed, critical
- Amber (#F59E0B / #B45309): due soon, marginal, warning
- Green (#22C55E / #2E7D32): current, pass, healthy
- Blue (#3B82F6 / #2196F3): informational, primary action
- Navy (#0B1F3A): headings, table headers
- Grey (#6B7280): decommissioned, inactive, muted text

---

## Pending Work

### Before first paying customer (must do)
- **Stripe payment integration** — plan selection (Starter/Professional/Enterprise), webhooks, `subscription_status` on sites table, billing page at /app/settings/billing
- **Subscription enforcement** — gate feature access behind active subscription (auth gating done; plan check not built)
- **Self-serve sign-up → Stripe checkout** — registration built; needs Stripe connection

### Phase 2 (30–90 days post-launch)
- **Role-based views** — technician task queue vs manager compliance dashboard vs planner calendar
- **Scheduled report delivery** — weekly/monthly compliance PDF by email (Resend + APScheduler already in place)

### Phase 3 (post-launch with real customers)
- CMMS integration (MEX first, then Maximo / SAP PM)
- QR code / NFC labels per instrument
- Advanced analytics / statistical failure prediction
- Public API + webhooks for Enterprise tier

### Do not build yet
- SIL / IEC 61511 functional safety module | HART hardware integration | SMS notifications | Native mobile app | AI/ML prediction (rule-based drift engine covers this for now)
