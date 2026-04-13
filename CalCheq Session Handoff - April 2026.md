# CalCheq — Complete Session Handoff Document

*Generated: 13 April 2026*
*Purpose: Enable a fresh Claude session to pick up development immediately with zero prior context.*

---

## 1. What CalCheq Is

CalCheq (calcheq.com) is an industrial instrument calibration management SaaS application. It replaces Excel spreadsheets and paper logs that industrial sites use to track calibration of pressure transmitters, temperature sensors, flow meters, analysers, valves, and switches.

The product has two distinct parts:

1. **Marketing site** — public-facing pages at calcheq.com (no auth required): homepage, pricing, how-it-works, resources, blog, FAQ, contact
2. **Calibration app** — the actual tool at /app/* (gated behind Supabase Auth): dashboard, instrument register, calibration workflow, scheduling, reports, settings

The target market is Australian industrial sites (mining, water treatment, chemical plants, manufacturing). Pricing is in AUD. Compliance standards referenced: AS/NZS ISO 17025:2017, NATA, IEC 61511, ISO 9001.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL via Supabase (PgBouncer pooler) |
| Auth | Supabase Auth (JWT ES256, email + password) |
| Charts | Recharts |
| PDF generation | jsPDF + jspdf-autotable (client-side) |
| Email | Resend (transactional + digest emails) |
| Deployment | Railway.app — single service, FastAPI serves React SPA |
| Domain | calcheq.com (Cloudflare DNS) |
| Railway internal URL | caltrack-pro-production.up.railway.app |

---

## 3. Local Development

- **Project folder (Windows):** `C:\Users\nfish\OneDrive\Documents\AI Projects\Caltrack-pro`
- **GitHub remote:** `https://github.com/Caltrack-pro/Caltrack-pro.git` (branch: main)
- **Deploy process:** Push to main → Railway auto-deploys (2–3 min build time)
- **Push command:** Open PowerShell in project folder → `git add -A` → `git commit -m "message"` → `git push`

---

## 4. Project File Structure

### Root-level files
```
CLAUDE.md                         — Master project reference (THE most important file — read this first)
DECISIONS.md                      — Architecture decision records (auth, routing, roles, etc.)
ROADMAP.md                        — Phased product roadmap with completion status
Calcheq notepad.md                — Credentials & to-do list (PRIVATE — do not commit)
README.md                         — Basic project readme
nixpacks.toml                     — Railway build config
railway.json                      — Railway deployment config
seed_instruments.py               — 30 demo instruments seeder
seed_riverdale_demo.sql           — 130-instrument Riverdale Water Treatment Plant demo dataset
seed_demo_data.sql                — Additional demo data
caltrack_import_TEMPLATE.csv      — Template CSV for bulk instrument import (listed as "2. Caltrack import TEMPLATE.csv")
import_instruments.py             — CSV bulk import script (listed as "3. Import instruments.py")
.gitignore                        — Ignores .env, node_modules, __pycache__, .venv, dist, .claude/
.env.example                      — Example environment variables
```

### Root-level marketing/sales documents (NOT part of the app — reference material)
```
Calcheq_Business_Plan.docx
CalTrackPro_Business_Plan.docx
CalCheq 30-Day Pilot Offer.docx
CalCheq Compliance & Criticality Ranking Spec.docx
CalCheq Import Wizard & Migration Guide.docx
CalCheq Mobile Field Access Report.docx
CalCheq SEO Audit Report.docx
CalCheq Sales One-Pager.html
Sales One-Pager.html
Marketing Action Plan.html
MEX to Calcheq Migration Guide.docx
```

### Root-level static HTML files (legacy marketing pages, superseded by React marketing pages)
```
index.html, demo.html, contact.html, faq.html, how-it-works.html, pricing.html, resources.html
1_INDEX.html, 2_DEMO.html
```

### Calibration PDFs folder
```
Calibration PDF's/                — Contains sample calibration PDF certificates and a plan for PDF import feature
```

### Frontend structure
```
frontend/
├── index.html                    — SPA entry point (has OG tags, meta, canonical URL)
├── package.json                  — Dependencies
├── vite.config.js                — Vite config (proxy /api to backend in dev)
├── tailwind.config.js            — Tailwind config
├── postcss.config.js
├── .env.local                    — Local env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .env.example
└── src/
    ├── main.jsx                  — React entry point
    ├── index.css                 — Tailwind imports + custom styles
    ├── App.jsx                   — Router root (two layout trees: marketing + app)
    ├── components/
    │   ├── AuthGuard.jsx         — Protects /app/* routes; redirects to /auth/sign-in
    │   ├── Layout.jsx            — App shell: fetches pendingCount, renders Header + Sidebar + Outlet
    │   ├── Sidebar.jsx           — Emoji nav (Dashboard, Instruments, Schedule, Calibrations, Reports, Settings)
    │   ├── Header.jsx            — Top bar with user name, role, sign-out
    │   ├── Badges.jsx            — CriticalityBadge, ResultBadge, StatusBadge components
    │   ├── Toast.jsx             — Notification toast system
    │   ├── TrendCharts.jsx       — Recharts calibration trend charts (used in InstrumentDetail)
    │   └── marketing/
    │       ├── MarketingNav.jsx  — Shared nav for marketing pages
    │       └── MarketingFooter.jsx — Shared footer for marketing pages
    ├── pages/
    │   ├── auth/
    │   │   ├── SignIn.jsx        — 2-step: company name → email + password
    │   │   ├── SignUp.jsx        — Self-serve registration
    │   │   ├── ForgotPassword.jsx
    │   │   └── ResetPassword.jsx
    │   ├── Dashboard.jsx         — KPI cards, attention cards, compliance gauge, area bars, upcoming list
    │   ├── InstrumentList.jsx    — Paginated/filterable instrument register + bulk CSV export
    │   ├── InstrumentForm.jsx    — Create/edit instrument (shared form)
    │   ├── InstrumentDetail.jsx  — Tabs: Overview, History, Trends, Drift Analysis, Audit Trail, Technical
    │   ├── CalibrationForm.jsx   — Enter calibration results (1–20 test points, as-found/as-left)
    │   ├── ImportCalibratorCSV.jsx — 3-step Beamex/Fluke CSV import (Upload → Review → Confirm)
    │   ├── ImportInstruments.jsx — Bulk instrument CSV import
    │   ├── Schedule.jsx          — 5 tabs: Overdue / Due Soon / Repeat Failures / Drift Alerts / Planner
    │   ├── Calibrations.jsx      — 2 tabs: Pending Approvals (with badge) / Activity Log
    │   ├── Reports.jsx           — Compliance reporting + PDF export
    │   ├── AppSettings.jsx       — Site info / Profile / Change Password / Team Members (admin)
    │   ├── Support.jsx           — FAQ accordion, tutorial placeholders, contact email
    │   ├── CalibrationReport.jsx — (appears to be a reporting sub-page)
    │   ├── Alerts.jsx            — LEGACY: redirects to /app/schedule
    │   ├── BadActors.jsx         — LEGACY: redirects to /app/schedule
    │   ├── PendingApprovals.jsx  — LEGACY: redirects to /app/calibrations
    │   ├── Profile.jsx           — LEGACY: redirects to /app/settings
    │   └── marketing/
    │       ├── Landing.jsx       — Homepage (Australian-focused, pain-point cards, AUD pricing)
    │       ├── Pricing.jsx       — 3-tier pricing, monthly/annual toggle, feature comparison
    │       ├── HowItWorks.jsx    — "Up and running in 48 hours", setup steps, features
    │       ├── Resources.jsx     — 10 resource cards, tag filter, newsletter
    │       ├── Blog.jsx          — Article index with tag filters
    │       ├── BlogPost.jsx      — Individual articles (6 static articles, keyed by slug)
    │       ├── FAQ.jsx           — 23 Q&As across 5 sections
    │       ├── Contact.jsx       — Enquiry form with role/instrument count selects
    │       └── DemoPage.jsx      — Interactive demo preview page
    └── utils/
        ├── supabase.js           — Supabase client init
        ├── userContext.js        — getUser(), onAuthStateChange, demo mode toggle
        ├── api.js                — All API calls with JWT injection (instruments, calibrations, dashboard, auth, queue)
        ├── calEngine.js          — Client-side pass/fail/marginal calculation (mirrors backend)
        ├── formatting.js         — Date and number formatting helpers
        ├── reportGenerator.js    — jsPDF certificate + multi-cal report generation
        └── calibratorCsvParser.js — Beamex/Fluke CSV parser
```

### Backend structure
```
backend/
├── main.py                       — FastAPI app, CORS, router registration
├── models.py                     — SQLAlchemy ORM (Instrument, CalibrationRecord, CalTestPoint, CalibrationQueue, AuditLog)
├── schemas.py                    — Pydantic v2 request/response schemas
├── database.py                   — Supabase/PostgreSQL connection via SQLAlchemy
├── auth.py                       — ES256 JWT verification via JWKS, get_current_user, resolve_site, assert_writable_site
├── calibration_engine.py         — Server-side pass/fail calculation (source of truth)
├── notifications.py              — Resend email integration (submit/approve/reject + daily/weekly digests)
├── requirements.txt              — Python dependencies
├── alembic.ini                   — Database migration config
├── .env / .env.example           — Environment variables
└── routes/
    ├── __init__.py
    ├── auth.py                   — check-site, register, me, members, invite
    ├── instruments.py            — Full CRUD, site-scoped, supports last_calibration_result filter
    ├── calibrations.py           — Full CRUD + submit/approve/reject workflow
    ├── dashboard.py              — Stats, alerts, compliance-by-area, upcoming, bad-actors
    ├── audit.py                  — Per-instrument and admin-only site-wide audit log
    └── queue.py                  — Calibration queue: GET (list + auto-cleanup), POST, DELETE, PATCH priority
```

---

## 5. Routing (Complete)

### Auth routes
| Path | Component |
|------|-----------|
| /auth/signin | SignIn |
| /auth/sign-in | → /auth/signin |
| /auth/signup | SignUp |
| /auth/forgot-password | ForgotPassword |
| /auth/reset-password | ResetPassword |

### Marketing routes
| Path | Component |
|------|-----------|
| / | Landing |
| /pricing | Pricing |
| /how-it-works | HowItWorks |
| /resources | Resources |
| /blog | Blog |
| /blog/:slug | BlogPost |
| /faq | FAQ |
| /contact | Contact |
| /demo | DemoPage |

### App routes (AuthGuard + Layout)
| Path | Component | Notes |
|------|-----------|-------|
| /app | Dashboard | index |
| /app/instruments | InstrumentList | |
| /app/instruments/new | InstrumentForm | create mode |
| /app/instruments/:id/edit | InstrumentForm | edit mode |
| /app/instruments/:id | InstrumentDetail | supports ?tab= param |
| /app/schedule | Schedule | 5 tabs, supports ?tab= param |
| /app/calibrations | Calibrations | Pending Approvals / Activity Log |
| /app/calibrations/new/:instrumentId | CalibrationForm | |
| /app/calibrations/import-csv | ImportCalibratorCSV | |
| /app/reports | Reports | |
| /app/settings | AppSettings | Profile / Password / Team |
| /app/import | ImportInstruments | bulk CSV import |
| /app/support | Support | FAQ, tutorials, contact |

### Legacy redirects
| Old path | → New path |
|----------|-----------|
| /app/alerts | /app/schedule |
| /app/approvals | /app/calibrations |
| /app/bad-actors | /app/schedule |
| /app/profile | /app/settings |
| /dashboard | /app |
| /instruments | /app/instruments |
| /alerts | /app/schedule |
| /reports | /app/reports |
| /approvals | /app/calibrations |

### Backend API routes
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/auth/check-site?name=X | Validate site name (public) |
| POST | /api/auth/register | Create site + site_members row |
| GET | /api/auth/me | Current user info |
| GET | /api/auth/members | List site members (admin/supervisor) |
| POST | /api/auth/invite | Create user + invite email (admin) |
| GET/POST | /api/instruments | List (with filters) / Create |
| GET/PUT/DELETE | /api/instruments/:id | Read / Update / Delete |
| POST | /api/instruments/bulk-import | CSV bulk import (?dry_run=true) |
| GET | /api/instruments/:id/drift | Drift analysis data |
| GET | /api/instruments/:id/audit-log | Per-instrument audit trail |
| GET/POST | /api/calibrations | List / Create |
| GET/PUT/DELETE | /api/calibrations/:id | Read / Update / Delete |
| POST | /api/calibrations/:id/submit | Submit for approval |
| POST | /api/calibrations/:id/approve | Approve |
| POST | /api/calibrations/:id/reject | Reject |
| GET | /api/dashboard/stats | KPI stats |
| GET | /api/dashboard/alerts | Alert list |
| GET | /api/dashboard/compliance-by-area | Area compliance |
| GET | /api/dashboard/upcoming | Upcoming calibrations |
| GET | /api/audit | Admin-only site-wide audit log |
| GET | /api/queue | List queue items (auto-cleans completed) |
| POST | /api/queue | Add to queue |
| DELETE | /api/queue/:instrument_id | Remove from queue |
| PATCH | /api/queue/:instrument_id/priority | Update priority |

---

## 6. Auth System

### Flow
1. User enters company name → `GET /api/auth/check-site` validates it
2. User enters email + password → Supabase `signInWithPassword` → JWT issued
3. `GET /api/auth/me` → backend verifies JWT, returns site + role

### JWT
- ES256 asymmetric signing (NOT HS256)
- Backend fetches JWKS from Supabase and caches 1 hour
- `SUPABASE_JWT_SECRET` is NOT required

### Roles
- **admin:** full access
- **supervisor:** read/write + approve calibrations
- **technician:** read + create/edit calibrations + edit instruments
- **planner:** read + edit scheduling fields
- **readonly:** read only

### Demo account
- Email: demo@calcheq.com | Password: CalcheqDemo2026
- Site: "Demo" | Role: admin | All writes return HTTP 403 via `assert_writable_site`

### Site isolation
- Multi-tenancy via `created_by` field (site name string) on instruments table
- Site resolved from JWT, not from query params

---

## 7. Database Models

### instruments table
tag_number (unique), description, area, unit, instrument_type (pressure/temperature/flow/level/analyser/switch/valve/other), manufacturer, model, serial_number, measurement_lrv, measurement_urv, engineering_units, output_type, calibration_interval_days, tolerance_type (percent_span/percent_reading/absolute), tolerance_value, num_test_points, test_point_values (JSON), criticality (safety_critical/process_critical/standard/non_critical), status (active/spare/out_of_service/decommissioned), procedure_reference, last_calibration_date, last_calibration_result, calibration_due_date, created_by (site name), created_at, updated_at

### calibration_records table
instrument_id (FK), calibration_date, calibration_type (routine/corrective/post_repair/initial), technician_name, technician_id, reference_standard_description, reference_standard_serial, reference_standard_cert_number, reference_standard_cert_expiry, procedure_used, adjustment_made, adjustment_notes, technician_notes, defect_found, defect_description, return_to_service, as_found_result, as_left_result (pass/fail/marginal/not_required), max_as_found_error_pct, max_as_left_error_pct, record_status (draft/submitted/approved/rejected), work_order_reference, approved_by (name string), approved_at

### cal_test_points table
calibration_record_id (FK), point_number, nominal_input, expected_output, as_found_output, as_left_output, as_found_error_abs, as_found_error_pct, as_left_error_abs, as_left_error_pct, as_found_result, as_left_result

### calibration_queue table (NEW — April 2026)
id (UUID PK), site_name, instrument_id (FK), added_by_name, added_at, priority (integer), notes

### audit_log table
site_id, entity_type, entity_id, user_id, user_name, action, changed_fields (JSONB), created_at

### sites table
id (UUID), name, slug, created_at

### site_members table
site_id (FK), user_id (FK→auth.users), role, display_name, email, created_at

---

## 8. Pass/Fail Calculation Rules (CRITICAL — must be implemented exactly)

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

## 9. Alert Rules

- **OVERDUE:** today > calibration_due_date
- **DUE_SOON:** today > (calibration_due_date - 14 days) AND not overdue
- **FAILED:** last_calibration_result == "fail"
- **CONSECUTIVE_FAILURES:** last 2+ records both have as_found_result == "fail"
- **PREDICTED_TO_FAIL:** drift engine projects failure before next due date

---

## 10. UI Colour Conventions

- Red (#EF4444 / #C62828): overdue, failed, critical
- Amber (#F59E0B / #B45309): due soon, marginal, warning
- Green (#22C55E / #2E7D32): current, pass, healthy
- Blue (#3B82F6 / #2196F3): informational, primary action
- Navy (#0B1F3A): headings, table headers
- Grey (#6B7280): decommissioned, inactive, muted text

---

## 11. Key Design Decisions Made

These are documented in DECISIONS.md but are critical to know:

1. **Auth is Supabase Auth (ES256 JWT)** — migrated from localStorage in April 2026. The 2-step sign-in (company name first, then email+password) is intentional.
2. **Site isolation via `created_by` string** — not a FK to sites table yet. Will be migrated to `site_id` FK during Stripe integration.
3. **6-tab emoji navigation** — each tab has one clear purpose. No overlap between Dashboard, Instruments, Schedule, Calibrations, Reports, Settings.
4. **Marketing and app are separate layout trees** in React Router.
5. **Technicians can edit instruments** — intentional for smaller sites.
6. **Demo site is read-only** — `assert_writable_site` returns 403 for "Demo" site.
7. **`approved_by` stores name string, not UUID** — trade-off for display simplicity.
8. **PDF generation is client-side** (jsPDF) — no server-side PDF dependencies needed.
9. **Blog is static in BlogPost.jsx** — no CMS. 6 articles keyed by slug.
10. **Calibrator CSV import is client-side parsing** — Beamex MC6/MC4/MC2 and Fluke 754/729/726.
11. **The demo company is "Riverdale Water Treatment Authority"** — NOT "Pilbara Minerals" (which is a real company). This was explicitly changed.

---

## 12. Features Built & Working

### Fully complete (shipped)
- Full instrument CRUD with filtering, pagination, bulk CSV export
- Calibration workflow: create → submit → approve/reject (with email notifications)
- 1-20 test point calibration with as-found/as-left, error calculation, pass/fail/marginal
- Immutable audit trail (per-instrument + admin-only site-wide)
- Instrument bulk CSV import with dry-run preview
- Beamex/Fluke calibrator CSV import (3-step UI)
- Email notifications via Resend (immediate + daily overdue + weekly due-soon digests)
- Drift prediction engine (linear regression on as-found error)
- Dashboard with 5 KPI cards, 3 attention cards, compliance gauge, area bars, upcoming list
- Schedule page with 5 tabs: Overdue, Due Soon, Repeat Failures, Drift Alerts, Planner
- Planner tab: DB-backed queue system with 12-week workload chart, add/remove/reorder, auto-cleanup on calibration
- Drift Alerts tab: sortable columns, projected current error, "Fail At" date column
- Deep-linking between pages via URL params (e.g., ?tab=drift-analysis on InstrumentDetail)
- Calibrations page: Pending Approvals (with live count badge) + Activity Log
- Reports page with area/type/technician filters and PDF export
- Support page with FAQ accordion
- Team member management (admin invite with Supabase admin API)
- Role-based permissions (admin/supervisor/technician/planner/readonly)
- Mobile/tablet responsive layout
- Demo account (read-only, 130 instruments - Riverdale Water Treatment Plant dataset)
- Full marketing site: Landing, Pricing, How It Works, Resources, Blog (6 articles), FAQ, Contact, Demo
- Custom domain (calcheq.com) with SSL
- SEO meta tags on all marketing pages

### Drift projection formulas (used in Schedule.jsx Drift Alerts tab)
```
drift_rate_per_day = (last_error - first_error) / ((n-1) * interval_days)
current_error = last_error + drift_rate * days_since_last_cal
fail_date = today + (tolerance - current_error) / drift_rate
```

---

## 13. What Still Needs Doing (Priority Order)

### BLOCKING — Before first paying customer
1. **Stripe payment integration** — plan selection (Starter $49/Professional $99/Enterprise $249 AUD/mo), webhooks, `subscription_status` on sites table, billing page at /app/settings/billing
2. **Subscription enforcement** — gate feature access behind active subscription
3. **Self-serve sign-up → Stripe checkout** — registration flow into payment

### Phase 2 (30-90 days post-launch)
4. **Role-based views** — technician task queue vs manager compliance dashboard vs planner calendar
5. **Scheduled report delivery** — weekly/monthly compliance PDF by email

### Phase 3 (post-launch)
6. CMMS integration (MEX first, then Maximo / SAP PM)
7. QR code / NFC labels per instrument
8. Advanced analytics / statistical failure prediction
9. Public API + webhooks for Enterprise tier

### Do NOT build yet
- SIL / IEC 61511 functional safety module
- HART hardware integration
- SMS notifications
- Native mobile app
- AI/ML prediction (rule-based drift engine covers this for now)

### Smaller items from the to-do list
- Check functionality of PDF certificate generator
- Create blog posts as Word docs
- Replace fake "use case" on website with real sourced information
- Generate a PowerPoint presentation showcasing the product
- PDF calibration records import (see Calibration PDFs folder for plan)

---

## 14. Environment Variables (Railway)

| Variable | Value/Purpose |
|----------|--------------|
| SUPABASE_URL | https://qdrgjjndwgrmmjvzzdhg.supabase.co |
| VITE_SUPABASE_URL | Same (frontend) |
| VITE_SUPABASE_ANON_KEY | Supabase anon key |
| VITE_DEMO_EMAIL | demo@calcheq.com |
| VITE_DEMO_PASSWORD | CalcheqDemo2026 |
| SUPABASE_SERVICE_ROLE_KEY | For admin user creation (keep secret) |
| RESEND_API_KEY | Email notifications |
| RESEND_FROM_EMAIL | info@calcheq.com |
| APP_URL | https://calcheq.com |

---

## 15. Git Status (as of 13 April 2026)

Latest commit: `c1339d8 Planner tab + queue system, fix drift count/display, AT-101 error, Pilbara rename, sortable drift table, Fail At column, drift analysis deep-link`

There are uncommitted demo mode improvements to Schedule.jsx from the current session (guards on queue add/remove/reorder buttons in demo mode). These need to be committed and pushed.

Total commits on main: 20+ commits, all by the developer (Nate).

---

## 16. Nate's Preferences and Rules

Based on our working sessions, here are important patterns:

1. **Always update CLAUDE.md** before finishing a session — it's the master reference
2. **Australian English and AUD pricing** — the product targets Australian industrial sites
3. **Don't use real company names** for demo data — we got burned using "Pilbara Minerals" (real ASX-listed company). Demo data uses "Riverdale Water Treatment Authority" (fictional).
4. **Nate trusts technical decisions** — when given options, he prefers the developer to make the call on implementation details (e.g., 5th tab placement, DB-persisted queue)
5. **Nate prefers practical, working features** over theoretical design — build it, test it, ship it
6. **The demo site must be read-only** — all writes blocked via `assert_writable_site`. Demo users should see a clear indicator that they're in demo mode.
7. **Changes deploy via git push to main** — Railway auto-deploys. No staging environment.
8. **Supabase MCP tool is available** for direct DB queries and migrations — use it for schema changes
9. **Nate values when Claude catches bugs proactively** — like the AT-101 max error being wrong (1.82% stored vs 1.98% actual), or the dashboard count not matching

---

## 17. Known Quirks and Gotchas

1. **Dashboard drift count** — The backend alerts API never emits a `PREDICTED_TO_FAIL` alert type. The drift count on the dashboard is fetched separately via `instrApi.list({ last_calibration_result: 'marginal', status: 'active', limit: 1 })`. If you see 0 drift count on the dashboard but instruments flagged on the Schedule page, this is the area to check.

2. **`backend/.venv/`** — The project folder contains a full Windows Python venv with all site-packages. This is checked into the OneDrive folder but .gitignored. It's ~490KB of files. Don't be alarmed by it.

3. **Legacy HTML files at root** — Files like `index.html`, `demo.html`, `faq.html` etc. at the project root are OLD static marketing pages that predate the React app. They are NOT served in production. The React marketing pages in `frontend/src/pages/marketing/` are the live ones.

4. **Legacy React pages** — `Alerts.jsx`, `BadActors.jsx`, `PendingApprovals.jsx`, `Profile.jsx` still exist but only contain redirect logic to their new locations. They can be deleted eventually.

5. **`Calcheq notepad.md`** — Contains live credentials (Supabase, GitHub, Railway, Microsoft 365, Resend, Cloudflare). This file is NOT in .gitignore — it should be, or should be removed from the repo. Handle with care.

6. **The project was originally called "CalTrack Pro"** — renamed to "CalCheq" in April 2026. Some files still reference the old name (CalTrackPro_Business_Plan.docx, the GitHub org name "Caltrack-pro").

7. **Test accounts** — There's an IXOM test account (Site: "IXOM Laverton Chloralkali") which is a real customer pilot. Treat this data carefully.

8. **No test suite** — There are no automated tests (no Jest, no pytest). Testing is manual via the demo account and browser.

---

## 18. Where We Left Off (13 April 2026)

The most recent session completed 6 items:

1. **Renamed "Pilbara Minerals" → "Riverdale Water Treatment Authority"** everywhere (Dashboard.jsx DemoBanner, DemoPage.jsx ×4 instances)
2. **Fixed AT-101 max error** — DB had 1.82% stored, actual max was 1.98%. Fixed via SQL UPDATE. The calEngine.js calculation logic is correct; this was a seeding bug.
3. **Fixed dashboard drift count showing 0** — Added separate API call for marginal instrument count instead of relying on never-emitted PREDICTED_TO_FAIL alert type
4. **Rebuilt Drift Alerts tab** — Sortable columns, projected current error (drift rate × days since last cal), new "Fail At" date column, deep-links to ?tab=drift-analysis
5. **Fixed "View Trend → not enough data"** — Changed link target from Trends tab (TrendCharts, index 2) to Drift Analysis tab (linear regression, index 3) via ?tab=drift-analysis URL param support
6. **Built full Planner tab** — New 5th tab on Schedule page with:
   - DB migration (calibration_queue table)
   - CalibrationQueue ORM model + Pydantic schemas
   - routes/queue.py with GET/POST/DELETE/PATCH endpoints
   - api.js queue methods
   - Full React PlannerTab: 12-week workload BarChart, Add to Schedule panel with filter pills + search, Scheduled Queue with priority reordering (▲▼), demo mode protection

**Immediate next step:** The demo mode improvements to Schedule.jsx (guards on Add/remove/reorder buttons) need to be committed and pushed:
```
git add -A
git commit -m "Guard queue buttons in demo mode + cleanup isDemoMode placement"
git push
```

Then the **#1 priority** going forward is **Stripe payment integration** — this is the main blocker before the first paying customer.

---

## 19. Supabase Database Access

The Supabase project is at: https://qdrgjjndwgrmmjvzzdhg.supabase.co

When using the Supabase MCP connector in Cowork, you can:
- Run SQL queries via `execute_sql`
- Apply migrations via `apply_migration`
- List tables, extensions, branches
- Generate TypeScript types

The database contains the full schema described in section 7.
