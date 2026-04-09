# CalTrack Pro — Project Master Reference

## What This Project Is
CalTrack Pro is an industrial instrument calibration management web application.
It is a full-stack application with a React frontend and a Python FastAPI backend,
using a PostgreSQL database (via Supabase).

The app has two distinct parts:
1. **Marketing site** — public-facing homepage, pricing, blog, FAQ, contact (no auth required)
2. **Calibration app** — the actual tool, lives under /app/* (currently ungated, auth planned)

---

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Python 3.11 + FastAPI
- Database: PostgreSQL via Supabase (supabase.com), using PgBouncer pooler
- Auth: localStorage-based user context (Supabase Auth migration is pending — see DECISIONS.md)
- Charts: Recharts
- PDF generation: jsPDF + jspdf-autotable (client-side, no backend required)
- Deployment: Railway.app (live) — single service, FastAPI serves React SPA in production
- Production URL: caltrack-pro-production.up.railway.app (custom domain pending — see ROADMAP.md)

---

## Complete File Map

### Frontend — src/App.jsx (router root)
All routes are defined here. Two layout trees: marketing (no sidebar) and app (with sidebar).

### Frontend — src/pages/ (app pages, all live under /app/*)
- Dashboard.jsx          — main dashboard: stats, alerts, compliance by area, upcoming, bad actors
- InstrumentList.jsx     — paginated/filterable instrument register
- InstrumentForm.jsx     — create and edit instrument (shared form)
- InstrumentDetail.jsx   — single instrument view with calibration history and trend charts
- CalibrationForm.jsx    — enter calibration results (as-found / as-left test points)
- Alerts.jsx             — overdue, due-soon, failed, consecutive-failure alerts
- PendingApprovals.jsx   — supervisor approval queue for submitted calibration records
- Reports.jsx            — compliance reporting and calibration history export
- BadActors.jsx          — ranked list of instruments with repeated as-found failures
- Profile.jsx            — user profile page (added; route: /app/profile)

### Frontend — src/pages/marketing/ (public pages, no /app prefix)
- Landing.jsx            — homepage with hero, features, industries, testimonials, CTA
- Pricing.jsx            — 3-tier pricing (Starter / Professional / Enterprise)
- Blog.jsx               — article index with tag filters
- BlogPost.jsx           — individual article page, content keyed by slug
- FAQ.jsx                — accordion FAQ across 5 sections
- Contact.jsx            — enquiry form with type selector

### Frontend — src/components/
- Layout.jsx             — app shell: wraps Sidebar + Header + <Outlet>
- Sidebar.jsx            — left nav, user section, "Back to Website" link at bottom
- Header.jsx             — top bar with sign-in modal (3-step: site → password → name+role)
- Badges.jsx             — shared status/result badge components
- Toast.jsx              — notification toast system
- TrendCharts.jsx        — calibration trend charts (used in InstrumentDetail)
- marketing/MarketingNav.jsx    — shared nav for all marketing pages
- marketing/MarketingFooter.jsx — shared footer for all marketing pages

### Frontend — src/utils/
- userContext.js      — ALL user/site state: getUser, setUser, canEdit, ROLES, site password logic
- api.js              — all API calls, every function accepts a `site` param for isolation
- calEngine.js        — pass/fail/marginal calculation logic (mirrors backend rules)
- formatting.js       — shared date and number formatting helpers
- reportGenerator.js  — jsPDF-based PDF generation: single calibration cert + multi-calibration history report

### Backend — backend/
- main.py               — FastAPI app entry point, CORS, router registration
- models.py             — SQLAlchemy ORM models (Instrument, CalibrationRecord, CalTestPoint)
- schemas.py            — Pydantic v2 request/response schemas
- database.py           — Supabase/PostgreSQL connection via SQLAlchemy
- auth.py               — authentication helpers
- calibration_engine.py — server-side pass/fail calculation (source of truth)
- routes/instruments.py  — CRUD for instruments, accepts ?site= filter param
- routes/calibrations.py — CRUD for calibration records, site filter via instrument join
- routes/dashboard.py    — 5 dashboard endpoints (stats, alerts, compliance, upcoming, bad-actors)

### Root-level scripts (Caltrack-pro/)
- seed_instruments.py              — populates 30 demo instruments for the "Admin" site
- import_instruments.py            — CSV bulk import script (MEX migration tool)
- caltrack_import_TEMPLATE.csv     — template CSV with correct column headers and example rows

---

## Routing (complete)

### Marketing routes (no sidebar/header)
| Path          | Component     | Notes                                      |
|---------------|---------------|--------------------------------------------|
| /             | Landing       | Homepage                                   |
| /pricing      | Pricing       | 3-tier pricing page                        |
| /blog         | Blog          | Article index                              |
| /blog/:slug   | BlogPost      | Full article, content stored in BlogPost.jsx |
| /faq          | FAQ           | Accordion FAQ                              |
| /contact      | Contact       | Enquiry form                               |

### App routes (inside Layout with Sidebar + Header)
| Path                              | Component        | Notes                          |
|-----------------------------------|------------------|--------------------------------|
| /app                              | Dashboard        | index route                    |
| /app/instruments                  | InstrumentList   | accepts ?site=, ?calibration_status= etc |
| /app/instruments/new              | InstrumentForm   | create mode                    |
| /app/instruments/:id              | InstrumentDetail | detail + history               |
| /app/instruments/:id/edit         | InstrumentForm   | edit mode                      |
| /app/calibrations/new/:instrumentId | CalibrationForm | new calibration for an instrument |
| /app/alerts                       | Alerts           |                                |
| /app/approvals                    | PendingApprovals |                                |
| /app/reports                      | Reports          |                                |
| /app/bad-actors                   | BadActors        | ranked failure list            |
| /app/profile                      | Profile          | user profile page              |

### Legacy redirects (old bookmarks still work)
/dashboard → /app | /instruments → /app/instruments | /alerts → /app/alerts
/reports → /app/reports | /approvals → /app/approvals

---

## User / Auth System (current — localStorage)

User state is stored in localStorage under key `caltrack_user`.

### User object shape
```js
{ siteName: "IXOM", userName: "John Smith", role: "technician" }
```

### Site isolation mechanism
- Sites are stored in localStorage under `caltrack_sites` (array of {name, passwordHash})
- Members stored under `caltrack_members` (array of {siteName, userName, role})
- On sign-in, `siteName` is written to the user object
- All API calls pass `?site=siteName` as a query param
- Backend filters `Instrument.created_by == site` on every query
- New instruments are stamped `created_by = siteName` in InstrumentForm.jsx

### Cross-component state sync
Custom DOM event `caltrack-user-change` fires on sign-in/out.
Dashboard.jsx and InstrumentList.jsx both listen for this and re-fetch data.

### Role permissions
- admin: full access
- supervisor: read/write + approve calibration records
- technician: read + create/edit calibration records (own until submitted). CAN edit instruments.
- planner: read + edit scheduling fields
- readonly: read only

`canEdit()` in userContext.js returns true for: admin, supervisor, planner, technician.

### Demo account
- Site name: "Demo" (no password) — previously "Admin", renamed April 2026
- Pre-seeded with 30 instruments via seed_instruments.py (SITE = "Demo")
- All existing DB records updated: UPDATE instruments SET created_by = 'Demo' WHERE created_by = 'Admin'
- Mix of areas, instrument types, pass/fail states, overdue/current/due-soon

---

## Site Isolation — Backend

Every backend route that returns instruments or calibration data accepts `?site=` param.

### instruments.py
```python
if site:
    q = q.filter(Instrument.created_by == site)
```

### calibrations.py (joins to instruments)
```python
if site:
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
- **Custom domain** — caltrack-pro-production.up.railway.app must be replaced; kills sales conversations
- **Supabase Auth migration** — replace localStorage with proper JWT auth (email + password, session tokens, password reset). Requires new `sites` and `site_members` DB tables.
- **Stripe payment integration** — subscription billing (Starter / Professional / Enterprise), webhook handling, `subscription_status` on sites table
- **Account gating** — /app/* must require a valid login + active subscription
- **Self-serve sign-up** — registration → Stripe checkout → site creation flow

### Phase 1 — Core Product Hardening (first 30 days post-launch)
- **Immutable audit trail** — timestamp + user attribution on every record change. Regulatory requirement for ISO 9001 / ISO 17025. New `audit_log` table. Non-negotiable.
- **CSV import UI** — frontend upload page for import_instruments.py (currently script-only). #1 onboarding blocker.
- **Email notifications** — overdue alerts + approval notifications via Resend/SendGrid. Daily/weekly digests.
- **Mobile/tablet UI audit** — CalibrationForm and InstrumentDetail must work on a tablet in the field.
- **Demo account hardening** — nightly reset of Demo site data OR make Demo read-only for unauthenticated visitors.

### Phase 2 — Product Depth (30–90 days post-launch)
- **Drift prediction engine** — per-instrument drift rate calculation + projected failure date. The product's clearest differentiator. Rule-based (no ML needed at this stage).
- **Role-based views** — technician task queue vs manager compliance dashboard vs planner schedule.
- **Reporting improvements** — scheduled report delivery, compliance certificate PDF, date-range filtering.
- **Instrument bulk actions** — checkbox selection + bulk status change, area reassignment, CSV export.

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
