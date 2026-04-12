# Calcheq — Project Master Reference

## Local Development Path (Windows)
- Project folder: `C:\Users\nfish\OneDrive\Documents\AI Projects\Caltrack-pro`
- GitHub remote: `https://github.com/Caltrack-pro/Caltrack-pro.git` (branch: main)
- To push changes: open PowerShell in the project folder → `git push`
- Railway auto-deploys on every push to main (allow 2–3 min for build)

---

## What This Project Is
Calcheq is an industrial instrument calibration management web application.
It is a full-stack application with a React frontend and a Python FastAPI backend,
using a PostgreSQL database (via Supabase).

The app has two distinct parts:
1. **Marketing site** — public-facing homepage, pricing, blog, FAQ, contact (no auth required)
2. **Calibration app** — the actual tool, lives under /app/* (gated behind Supabase Auth via AuthGuard)

---

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Python 3.11 + FastAPI
- Database: PostgreSQL via Supabase (supabase.com), using PgBouncer pooler
- Auth: Supabase Auth (JWT, email + password) — migration from localStorage completed April 2026
- Charts: Recharts
- PDF generation: jsPDF + jspdf-autotable (client-side, no backend required)
- Deployment: Railway.app (live) — single service, FastAPI serves React SPA in production
- Production URL: calcheq.com (custom domain — see ROADMAP.md 0.1 for setup checklist)
- Railway internal URL: caltrack-pro-production.up.railway.app (keep this in Railway until domain DNS is verified)

---

## Complete File Map

### Frontend — src/App.jsx (router root)
All routes are defined here. Two layout trees: marketing (no sidebar) and app (with sidebar).

### Frontend — src/pages/auth/ (public auth pages, no sidebar)
- SignIn.jsx             — 2-step sign-in: company name → email + password (uses Supabase Auth)
- SignUp.jsx             — self-serve registration: creates Supabase user + calls /api/auth/register
- ForgotPassword.jsx     — sends Supabase password reset email
- ResetPassword.jsx      — handles reset link from email, sets new password

### Frontend — src/pages/ (app pages, all live under /app/*)
- Dashboard.jsx          — main dashboard: stats, alerts, compliance by area, upcoming, bad actors
- InstrumentList.jsx     — paginated/filterable instrument register
- InstrumentForm.jsx     — create and edit instrument (shared form)
- InstrumentDetail.jsx   — single instrument view with calibration history and trend charts
- CalibrationForm.jsx    — enter calibration results (as-found / as-left test points)
- ImportCalibratorCSV.jsx — 3-step Beamex/Fluke CSV import: Upload → Review → Confirm; heuristic format detection, test point preview, instrument auto-match by tag; route: /app/calibrations/import-csv
- Alerts.jsx             — overdue, due-soon, failed, consecutive-failure, predicted-to-fail alerts
- PendingApprovals.jsx   — supervisor approval queue for submitted calibration records
- Reports.jsx            — compliance reporting and calibration history export
- BadActors.jsx          — ranked list of instruments with repeated as-found failures
- Profile.jsx            — user profile page (route: /app/profile)

### Frontend — src/pages/marketing/ (public pages, no /app prefix)
- Landing.jsx            — homepage: Australian-focused hero, 6 pain-point cards, features, 4-step setup, AUD pricing preview, compliance badge strip, FAQ strip, CTA (full rewrite Apr 2026)
- Pricing.jsx            — 3-tier pricing (Starter / Professional / Enterprise) with monthly/annual toggle (AUD), feature comparison table, pricing FAQ accordion (full rewrite Apr 2026)
- HowItWorks.jsx         — "Up and running in 48 hours" — 4-step setup, 6 feature deep-dive cards, 4 role cards, CTA (created Apr 2026)
- Resources.jsx          — resource library: 10 cards, tag filter (Case Study / Guide / Compliance / Industry Insights), newsletter subscribe (created Apr 2026)
- Blog.jsx               — article index with tag filters (legacy — still active)
- BlogPost.jsx           — individual article page, content keyed by slug
- FAQ.jsx                — accordion FAQ: 23 Q&As across 5 sections (Getting Started / Features / Compliance / Data & Security / Pricing) (full rewrite Apr 2026)
- Contact.jsx            — two-column enquiry form: role select, instrument count select, "What Happens Next" 3-step process (full rewrite Apr 2026)

### Frontend — src/components/
- Layout.jsx             — app shell: wraps Sidebar + Header + <Outlet>
- AuthGuard.jsx          — protects /app/* routes; redirects to /auth/sign-in if no session
- Sidebar.jsx            — left nav, user section, "Try Demo" toggle, "Back to Website" link
- Header.jsx             — top bar showing logged-in user name + role; sign-out via Supabase
- Badges.jsx             — shared status/result badge components
- Toast.jsx              — notification toast system
- TrendCharts.jsx        — calibration trend charts (used in InstrumentDetail)
- marketing/MarketingNav.jsx    — shared nav for all marketing pages
- marketing/MarketingFooter.jsx — shared footer for all marketing pages

### Frontend — src/utils/
- supabase.js             — Supabase client (createClient with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- userContext.js          — getUser(), onAuthStateChange, demo mode toggle; backward-compatible with all pages
- api.js                  — all API calls; auto-injects Authorization: Bearer <JWT> header on every request
- calEngine.js            — pass/fail/marginal calculation logic (mirrors backend rules)
- formatting.js           — shared date and number formatting helpers
- reportGenerator.js      — jsPDF-based PDF generation: single calibration cert + multi-calibration history report
- calibratorCsvParser.js  — client-side CSV parser for Beamex MC6/MC4/MC2 and Fluke 754/729/726 exports; exports parseCalibratorCSV(text) → { format, tag, date, technician, referenceStandard, referenceStandardSerial, testPoints, overallResult, errors }

### Backend — backend/
- main.py               — FastAPI app entry point, CORS, router registration
- models.py             — SQLAlchemy ORM models (Instrument, CalibrationRecord, CalTestPoint)
- schemas.py            — Pydantic v2 request/response schemas
- database.py           — Supabase/PostgreSQL connection via SQLAlchemy
- auth.py               — JWT verification via python-jose; get_current_user / get_optional_user / resolve_site dependencies
- calibration_engine.py — server-side pass/fail calculation (source of truth)
- routes/auth.py         — GET /api/auth/check-site, POST /api/auth/register, GET /api/auth/me
- routes/instruments.py  — CRUD for instruments; site derived from JWT (not ?site= param)
- routes/calibrations.py — CRUD for calibration records; ownership checks on GET/PUT/DELETE
- routes/dashboard.py    — 5 dashboard endpoints (stats, alerts, compliance, upcoming, bad-actors)

### Root-level scripts (Caltrack-pro/)
- seed_instruments.py              — populates 30 demo instruments for the "Admin" site
- import_instruments.py            — CSV bulk import script (MEX migration tool)
- caltrack_import_TEMPLATE.csv     — template CSV with correct column headers and example rows

---

## Routing (complete)

### Auth routes (no sidebar/header)
| Path                    | Component          | Notes                              |
|-------------------------|--------------------|------------------------------------|
| /auth/sign-in           | SignIn             | 2-step: company → email + password |
| /auth/sign-up           | SignUp             | Self-serve registration            |
| /auth/forgot-password   | ForgotPassword     | Sends Supabase reset email         |
| /auth/reset-password    | ResetPassword      | Handles reset link from email      |

### Marketing routes (no sidebar/header)
| Path            | Component     | Notes                                           |
|-----------------|---------------|-------------------------------------------------|
| /               | Landing       | Homepage (Australian-focused, full rewrite Apr 2026) |
| /pricing        | Pricing       | 3-tier AUD pricing with monthly/annual toggle   |
| /how-it-works   | HowItWorks    | 4-step setup, feature deep-dive, role cards     |
| /resources      | Resources     | Resource library with tag filter (replaces /blog index) |
| /blog           | Blog          | Legacy article index (still active)             |
| /blog/:slug     | BlogPost      | Full article, content stored in BlogPost.jsx    |
| /faq            | FAQ           | Accordion FAQ — 23 Q&As across 5 sections       |
| /contact        | Contact       | Enquiry form with role/instrument-count selects |

### App routes (inside Layout with Sidebar + Header)
| Path                                    | Component           | Notes                                         |
|-----------------------------------------|---------------------|-----------------------------------------------|
| /app                                    | Dashboard           | index route                                   |
| /app/instruments                        | InstrumentList      | accepts ?site=, ?calibration_status= etc      |
| /app/instruments/new                    | InstrumentForm      | create mode                                   |
| /app/instruments/:id                    | InstrumentDetail    | detail + history; "Import CSV" button in header |
| /app/instruments/:id/edit               | InstrumentForm      | edit mode                                     |
| /app/calibrations/new/:instrumentId     | CalibrationForm     | new calibration for an instrument             |
| /app/calibrations/import-csv            | ImportCalibratorCSV | Beamex/Fluke CSV import; ?instrumentId= pre-fills |
| /app/alerts                             | Alerts              |                                               |
| /app/approvals                          | PendingApprovals    |                                               |
| /app/reports                            | Reports             |                                               |
| /app/bad-actors                         | BadActors           | ranked failure list                           |
| /app/profile                            | Profile             | user profile page                             |

### Legacy redirects (old bookmarks still work)
/dashboard → /app | /instruments → /app/instruments | /alerts → /app/alerts
/reports → /app/reports | /approvals → /app/approvals

---

## User / Auth System (Supabase Auth — migrated April 2026)

Auth is now handled by Supabase Auth (JWT, email + password). The old localStorage
system has been replaced. See DECISIONS.md for migration history.

### Database tables (Supabase)
- `sites` — one row per company: id (UUID), name, slug, created_at
- `site_members` — maps users to sites: site_id (FK), user_id (FK to auth.users), role, created_at

### Auth flow
1. User signs in at /auth/sign-in (2-step: company name → email + password)
2. Supabase returns a JWT session token
3. Frontend stores the session via Supabase client (not localStorage)
4. api.js auto-injects `Authorization: Bearer <JWT>` on every API request
5. Backend auth.py verifies the JWT using SUPABASE_JWT_SECRET (python-jose)
6. `get_current_user` dependency extracts user_id from JWT and looks up site_members
7. `resolve_site` dependency returns the site name for the authenticated user
8. All routes use `resolve_site` instead of `?site=` query param

### Backend auth dependencies (auth.py)
- `get_current_user(token)` — verifies JWT, returns user_id + site_id + role. Raises 401 if invalid.
- `get_optional_user(token)` — same but returns None instead of raising (used for public/demo routes)
- `resolve_site(user)` — returns site name string for use in DB queries

### Auth routes (routes/auth.py)
- `GET /api/auth/check-site?name=X` — checks if a site name exists (used in sign-in step 1)
- `POST /api/auth/register` — called after Supabase sign-up; creates site + site_members row
- `GET /api/auth/me` — returns current user's profile: name, email, role, site name

### Role permissions (unchanged)
- admin: full access
- supervisor: read/write + approve calibration records
- technician: read + create/edit calibration records (own until submitted). CAN edit instruments.
- planner: read + edit scheduling fields
- readonly: read only

`canEdit()` in userContext.js returns true for: admin, supervisor, planner, technician.

### Demo account (Supabase Auth)
- Email: demo@calcheq.com  |  Password: CalTrackDemo2026
- Supabase user ID: 832b2b94-417f-4cda-a7de-71c598baff50
- Linked to Demo site (site ID: 004c156b-5012-45d8-892d-4a34e159e6f9) with role: admin
- "Try Demo" toggle in Sidebar auto-signs in using VITE_DEMO_EMAIL + VITE_DEMO_PASSWORD env vars
- 30 instruments pre-seeded via seed_instruments.py (SITE = "Demo")
- DB instruments stamped: created_by = 'Demo'

### Required environment variables
**Railway (backend + Vite build):**
- `SUPABASE_URL` — https://qdrgjjndwgrmmjvzzdhg.supabase.co (backend fetches public JWKS from here for ES256 JWT verification)
- `SUPABASE_JWT_SECRET` — no longer needed; SUPABASE_URL replaces it. Can be removed or left (ignored).
- `VITE_SUPABASE_URL` — https://qdrgjjndwgrmmjvzzdhg.supabase.co (frontend Supabase client)
- `VITE_SUPABASE_ANON_KEY` — see frontend/.env.example
- `VITE_DEMO_EMAIL` — demo@calcheq.com
- `VITE_DEMO_PASSWORD` — CalTrackDemo2026

**JWT verification approach (updated April 2026):**
Supabase uses ECC P-256 asymmetric signing (ES256). auth.py fetches the public JWKS from
https://qdrgjjndwgrmmjvzzdhg.supabase.co/auth/v1/.well-known/jwks.json and caches keys
for 1 hour. SUPABASE_JWT_SECRET is no longer required.

**Supabase Auth URL Configuration (Dashboard → Authentication → URL Configuration):**
- Site URL: https://calcheq.com  (update from railway URL once DNS is verified)
- Redirect URLs (add ALL of these):
  - https://calcheq.com/auth/reset-password
  - https://caltrack-pro-production.up.railway.app/auth/reset-password  (keep until domain is live)
  - http://localhost:5173/auth/reset-password  (local dev)

---

## Site Isolation — Backend

Site is now derived from the authenticated user's JWT (via `resolve_site` dependency in auth.py),
not from a `?site=` query param. The filtering logic on the DB queries is unchanged.

### instruments.py
```python
# site comes from: site = resolve_site(current_user)
q = q.filter(Instrument.created_by == site)
```

### calibrations.py (joins to instruments)
```python
q = q.join(Instrument, CalibrationRecord.instrument_id == Instrument.id)
     .filter(Instrument.created_by == site)
```

### dashboard.py
```python
def _active_instruments_query(db, site=None):
    q = db.query(Instrument).filter(Instrument.status.in_(_ACTIVE_STATUSES))
    if site:
        q = q.filter(Instrument.created_by == site)
    return q
```

---

## Core Data Models

### Instrument Record (instruments table)
- id (UUID, primary key)
- tag_number (string, unique) — e.g. PT-1023A
- description (string) — service description
- area (string) — plant area / location
- unit (string) — plant unit
- instrument_type (enum) — pressure/temperature/flow/level/analyser/switch/valve/other
- manufacturer (string)
- model (string)
- serial_number (string)
- measurement_lrv (float) — lower range value
- measurement_urv (float) — upper range value
- engineering_units (string) — e.g. kPa, degC, m3/h
- output_type (string) — e.g. 4-20mA, HART, Digital
- calibration_interval_days (integer)
- tolerance_type (enum) — percent_span / percent_reading / absolute
- tolerance_value (float)
- num_test_points (integer, default 5)
- test_point_values (JSON array of floats) — expected input values
- criticality (enum) — safety_critical / process_critical / standard / non_critical
- status (enum) — active / spare / out_of_service / decommissioned
- procedure_reference (string)
- last_calibration_date (date)
- last_calibration_result (enum) — pass / fail / marginal / not_calibrated
- calibration_due_date (date, calculated)
- created_at (timestamp)
- updated_at (timestamp)
- created_by (string) — used for site isolation (stores site name)

### Calibration Record (calibration_records table)
- id (UUID, primary key)
- instrument_id (UUID, FK to instruments)
- calibration_date (date)
- calibration_type (enum) — routine / corrective / post_repair / initial
- technician_name (string)
- technician_id (UUID, FK to users)
- reference_standard_description (string)
- reference_standard_serial (string)
- reference_standard_cert_number (string)
- reference_standard_cert_expiry (date)
- procedure_used (string)
- adjustment_made (boolean)
- adjustment_type (string)
- adjustment_notes (text)
- technician_notes (text)
- defect_found (boolean)
- defect_description (text)
- return_to_service (boolean)
- as_found_result (enum) — pass / fail / marginal
- as_left_result (enum) — pass / fail / marginal / not_required
- max_as_found_error_pct (float)
- max_as_left_error_pct (float)
- record_status (enum) — draft / submitted / approved / rejected
- work_order_reference (string)
- created_at (timestamp)
- approved_by (string)
- approved_at (timestamp)

### Calibration Test Points (cal_test_points table)
- id (UUID, primary key)
- calibration_record_id (UUID, FK to calibration_records)
- point_number (integer)
- nominal_input (float) — the stimulus applied
- expected_output (float) — ideal instrument output
- as_found_output (float) — actual reading before adjustment
- as_left_output (float) — actual reading after adjustment (nullable)
- as_found_error_abs (float, calculated)
- as_found_error_pct (float, calculated) — % of span
- as_left_error_abs (float, calculated)
- as_left_error_pct (float, calculated)
- as_found_result (enum) — pass / fail / marginal
- as_left_result (enum) — pass / fail / marginal / not_required

---

## Pass/Fail Calculation Rules (CRITICAL — implement exactly)

### Span
span = measurement_urv - measurement_lrv

### Tolerance in output units (for 4-20mA: span = 16mA)
if tolerance_type == "percent_span":
    tolerance_abs = (tolerance_value / 100) * output_span
if tolerance_type == "percent_reading":
    tolerance_abs = (tolerance_value / 100) * expected_output
if tolerance_type == "absolute":
    tolerance_abs = tolerance_value

### Per-point result
error_abs = actual_output - expected_output
error_pct = (error_abs / output_span) * 100
marginal_threshold = tolerance_abs * 0.8
if abs(error_abs) > tolerance_abs: result = "fail"
elif abs(error_abs) > marginal_threshold: result = "marginal"
else: result = "pass"

### Overall record result
if any point is "fail": overall = "fail"
elif any point is "marginal": overall = "marginal"
else: overall = "pass"

---

## Alert Rules
- OVERDUE: today > calibration_due_date
- DUE_SOON: today > (calibration_due_date - 14 days) AND not overdue
- FAILED: last_calibration_result == "fail"
- CONSECUTIVE_FAILURES: last 2+ calibration records both have as_found_result == "fail"

---

## UI Colour Conventions (use consistently throughout)
- Red (#EF4444): overdue, failed, critical
- Amber (#F59E0B): due soon, marginal, warning
- Green (#22C55E): current, pass, healthy
- Blue (#3B82F6): informational
- Grey (#6B7280): decommissioned, inactive

---

## Pending Work

A full phased roadmap with signal/noise analysis from two independent product reviews
is documented in ROADMAP.md. Summary of priorities below.

### Phase 0 — Commercial Readiness (must complete before any sales activity)
- ✅ **Custom domain** — calcheq.com LIVE (April 2026). Domain purchased, Railway configured, APP_URL set to https://calcheq.com, Supabase Site URL updated, all marketing/app code updated to Calcheq branding.
- ✅ **Supabase Auth migration** — COMPLETE (April 2026). JWT auth, email + password, password reset, AuthGuard on /app/*, self-serve sign-up, Demo account in Supabase.
- ✅ **Railway env vars** — COMPLETE (April 2026). APP_URL, SUPABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_DEMO_EMAIL, VITE_DEMO_PASSWORD, RESEND_API_KEY, RESEND_FROM_EMAIL all set.
- ✅ **Supabase redirect URLs** — COMPLETE (April 2026). /auth/reset-password whitelisted for calcheq.com, caltrack-pro-production.up.railway.app, and localhost.
- ✅ **Microsoft 365 email** — COMPLETE (April 2026). info@calcheq.com active. MX, SPF, DKIM all verified green in M365 Admin. Cloudflare DNS records confirmed.
- ✅ **Demo account updated** — COMPLETE (April 2026). Email: demo@calcheq.com, Password: CalcheqDemo2026. Updated via direct SQL in Supabase auth.users.
- **Stripe payment integration** — subscription billing (Starter / Professional / Enterprise), webhook handling, `subscription_status` on sites table
- **Account gating** — /app/* login gate is done; subscription enforcement (active paid plan) still needed
- **Self-serve sign-up** — registration flow is built; needs to connect to Stripe checkout

### Phase 1 — Core Product Hardening (first 30 days post-launch)
- ✅ **Immutable audit trail** — COMPLETE (April 2026). `audit_log` table. Backend writes on every create/update/delete/submit/approve/reject. "Audit Trail" tab on InstrumentDetail. `GET /api/instruments/{id}/audit-log` + `GET /api/audit` (admin-only site-wide log).
- ✅ **CSV import UI** — COMPLETE (April 2026). `POST /api/instruments/bulk-import` endpoint with ?dry_run=true preview. Frontend at `/app/import` with file picker → preview → confirm workflow. "Import CSV" button on InstrumentList.
- ✅ **Email notifications** — COMPLETE (April 2026). Resend integration (`notifications.py`). Immediate emails: submit → supervisors, approve/reject → technician. Daily overdue digest + weekly due-soon digest via APScheduler. Requires `RESEND_API_KEY` + `RESEND_FROM_EMAIL` env vars. `site_members.email` populated on register + back-filled on `/api/auth/me`.
- ✅ **Mobile/tablet UI audit** — COMPLETE (April 2026). Sidebar hamburger already in place (Layout.jsx). Fixed: BadActors overflow on mobile, CalibrationForm SectionCard responsive padding, InstrumentList search full-width on mobile. All tables already had overflow-x-auto.
- ✅ **Demo account hardening** — COMPLETE (April 2026). `assert_writable_site(current_user, created_by?)` in auth.py blocks all writes to Demo site (HTTP 403). Applied to all instrument + calibration write endpoints.

### Phase 2 — Product Depth (30–90 days post-launch)
- ✅ **Drift prediction engine** — COMPLETE (April 2026). Linear regression on historical as-found error % per instrument. `GET /api/instruments/{id}/drift` returns drift_rate_per_year, projected_failure_date, drift_status (critical/warning/watch/stable/exceeded). DriftAnalysis tab added to InstrumentDetail. "Predicted to Fail" alert type added to Alerts page.
- ✅ **Reporting improvements** — COMPLETE (April 2026). Area filter on Overdue/Upcoming tabs; area, instrument type, and technician filters on Failed tab. Date-range filtering via useMemo client-side.
- ✅ **Instrument bulk actions** — COMPLETE (April 2026). Checkbox selection with select-all/indeterminate state, bulk CSV export, clear selection bar added to InstrumentList.
- ✅ **Compliance certificate PDF** — COMPLETE (prior). `reportGenerator.js` (jsPDF + jspdf-autotable): `generateSingleCalibrationCert()` and `generateMultiCalibrationReport()`. "Download Calibration Certificate" in SlidePanel; "History Report" in InstrumentDetail header.
- ✅ **Beamex / Fluke calibrator CSV integration** — COMPLETE (April 2026). `calibratorCsvParser.js` parses CSV exports from Beamex MC6/MC4/MC2 and Fluke 754/729/726. `ImportCalibratorCSV.jsx` 3-step UI at `/app/calibrations/import-csv`. "Import CSV" button on InstrumentDetail. Auto-matches instrument by tag number, previews all test points, saves as draft or submits for approval.
- ✅ **Marketing site overhaul** — COMPLETE (April 2026). Landing, Pricing, FAQ, Contact fully rewritten. HowItWorks and Resources created. Nav updated. All pages have Australian focus, AUD pricing, compliance badge strip.
- **Role-based views** — technician task queue vs manager compliance dashboard vs planner schedule.
- **Scheduled report delivery** — weekly/monthly compliance PDF by email to supervisors (requires Resend — item 4 done).

### Phase 3 — Ecosystem (3–6 months post-launch)
- CMMS integration (MEX first, then Maximo / SAP PM)
- QR code / NFC label generation per instrument
- Advanced analytics (after 12+ months of real customer data exists)
- Public API + webhooks for Enterprise tier

### What NOT to build yet (premature — see ROADMAP.md for detail)
- SIL / IEC 61511 functional safety module
- HART / 4-20mA communicator hardware integration
- SMS notifications (email covers this)
- Native mobile app
- AI/ML failure prediction (build rule-based drift engine first)

### Already built — reviewers incorrectly flagged as missing
- **Multi-point calibration** — CalibrationForm supports 1–20 test points with full as-found/as-left per point, error calculation, and pass/fail/marginal per point. This is complete.
