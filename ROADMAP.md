# CalCheq — Forward Roadmap

*Last updated: 28 April 2026*

---

## What's Been Done

### Q1 2026 (Jan–Mar) — rollup

Supabase Auth (ES256 JWT) migration, custom domain (calcheq.com), immutable audit trail, CSV import (instruments + Beamex/Fluke calibrator), email notifications (Resend), mobile/tablet responsive pass, demo account hardening (read-only), drift prediction engine, PDF certificate generation, bulk instrument actions, full marketing site (Landing, Pricing, How It Works, Resources, Blog, FAQ, Contact), UX restructure (health donut dashboard, smart diagnostics, documents library, technician queue, export centre).

### Q2 2026 (Apr–Jun, current quarter) — dated entries

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

**Completed 28 April 2026:**
- UX fix sprint — three small but high-touch improvements shipped in three commits:
  - **P1: pH + conductivity instrument types** — extended the Postgres `instrument_type` enum (`ALTER TYPE … ADD VALUE`) and the SQLAlchemy/Pydantic enums; pH defaults to 2 buffer points (4.01 / 7.00, ±0.1 absolute, 0–14 pH), conductivity defaults to 1 sample-comparison point at 2% reading with a µS/cm ⇆ mS/cm dropdown; flow type gained an "Include zero-flow check" checkbox that prepends a 0 point on save; `CalibrationForm` makes the nominal column editable for ph/conductivity only (other types stay read-only so historical comparisons can't drift). See DECISIONS.md "Specialist analyser types — April 2026" for the full rationale. Pass/fail engine untouched — these types map cleanly onto existing `absolute` / `percent_reading` tolerance rules.
  - **P2: real document file uploads** — new private `documents` Supabase Storage bucket (25 MB cap, PDF / Office / text / image MIME whitelist) with the same 4-policy site-isolation RLS shape as `calibration-photos`; `frontend/src/utils/documentUpload.js` mirrors `photoCapture.js` (browser → Storage direct, never through FastAPI); Documents.jsx grew a file picker + Download button (30-min signed URL) and keeps the notes-only mode as a fallback for users whose files live elsewhere; storage cleanup on document delete and on file replace runs from the browser under the user's JWT (RLS already permits it).
  - **P3: import UX cleanup** — three nuisances fixed: template renamed `caltrack_import_TEMPLATE.csv` → `calcheq_import_TEMPLATE.csv` everywhere it appears (file, download attribute, Support copy, backend docstring, brand casing in `scripts/import_instruments.py`); Dashboard "Import CSV" quick action now points at `/app/import` (instrument bulk import) — previously it sent users to the calibrator import page; InstrumentList toolbar surfaces all three import paths side by side (Import Instruments CSV, Import Calibrator CSV, Add Instrument); calibrator import route moved from `/app/calibrations/import-csv` → `/app/instruments/import-calibrations` so the sidebar highlights the correct nav entry, with a `Navigate` redirect from the old path. Internal `caltrack-*` event/storage-key names left alone — they're private API and renaming would churn many files for no user benefit.

**Completed 27 April 2026:**
- Mobile app shipped — Capacitor 6 wrapper for iOS + Android, app ID `com.calcheq.app`. Same React build powers web + native. Five phases:
  - **P1 scaffold** — Capacitor config, `frontend/android/` + `frontend/ios/` projects, `npm run build:mobile` / `sync` scripts
  - **P2 native auth + JWT** — `@capacitor/preferences` storage adapter for Supabase Auth (encrypted on native, localStorage fallback on web)
  - **P3 QR scanning** — `@capacitor-mlkit/barcode-scanning` fullscreen ML Kit scanner, `frontend/src/utils/barcodeScanner.js`, Scan FAB on mobile layouts, new backend `GET /api/instruments/by-tag/{tag_number}` endpoint (registered before `/{instrument_id}` to avoid path collision); permission strings for camera + photos added to iOS Info.plist + Android Manifest
  - **P4 photo evidence** — `photo_urls TEXT[]` on `calibration_records`; private `calibration-photos` Supabase Storage bucket (10 MB cap, image/* whitelist, 4 RLS policies enforcing site-prefix isolation); `frontend/src/utils/photoCapture.js` (native `@capacitor/camera` + web file-input fallback); `PhotoAttachment` grid on CalibrationForm; signed thumbnails on InstrumentDetail; path convention `{site_name}/{uploadSessionId}/{filename}` (UUID at form mount because the record doesn't exist at upload time)
  - **P5 brand assets + store metadata** — `frontend/assets/icon-only.svg` + `splash.svg`; `@capacitor/assets` + `npm run icons` script regenerates all iOS/Android/PWA variants; `mobile/store-metadata/` holds App Store + Play Store listing copy, permission strings, data-safety declarations, screenshot capture plan
  - **P6 biometric unlock** — `@aparajita/capacitor-biometric-auth` ^10 + `@capacitor/app` ^6; `frontend/src/utils/biometricLock.js` wrapper (lazy plugin import so web bundle stays clean); `BiometricLockOverlay.jsx` full-screen lock with sign-out escape hatch; `Layout.jsx` re-locks on app resume via `appStateChange`; opt-in toggle in Settings → Security (native-only, hidden if hardware unavailable); `NSFaceIDUsageDescription` added to iOS Info.plist; flag stored in `@capacitor/preferences` (`biometric_enabled`) — JWT itself stays in OS-encrypted storage, biometric is a re-auth gate not key-wrap
- Android-first via the Windows dev machine for the IXOM pilot; iOS build scaffolded via `codemagic.yaml` at repo root (mac_mini_m2 runner, App Store Connect API key signing, TestFlight publish) — first run blocked on App Store account + bundle ID provisioning
- Out of v1 (deliberate): offline mode/sync, push notifications, plan-gated mobile features, React Native rewrite — see DECISIONS.md "Mobile App: Capacitor Wrapper over a Native Rewrite" for the full rationale

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

## Next steps

### Active backlog

- **Scheduled report delivery** — weekly compliance summary (PDF) Monday morning + monthly calibration report on the 1st. Configurable per-user in notification preferences. Resend + APScheduler infrastructure already in place; needs the scheduled job + the UI toggle.
- **Subscription plan enforcement (per-feature gating)** — gate specific features (drift prediction, imports) behind Professional+ plan. `assert_active_subscription` already enforces "have a plan at all"; per-feature gating is the next layer.

### Phase 3+ — post-launch with customer signal

These are the right next steps once real customers are generating data and feedback. Do not build until there is demand.

- **CMMS integration** — MEX first (most common in Australian water/mining), then Maximo / SAP PM. Start with one-way sync: push completed calibrations to CMMS work-order history.
- **Printable QR / NFC labels** — the mobile scanner ships in v1; the label-printing pipeline (PDF sheet generator, NFC encoding) doesn't. Build once a pilot site asks for re-labelling.
- **Mobile follow-ups** (only after IXOM telemetry shows demand):
  - Offline calibration entry with replay-on-reconnect (IndexedDB queue + conflict-resolution UI). The conflict UI is non-trivial; defer until a pilot site asks.
  - Push notifications for pending approvals (Capacitor Push + APNs/FCM + per-user opt-in). Currently approvers get email + an in-app badge; push waits until we have feedback that email latency hurts workflow.
  - iOS App Store submission via the existing `codemagic.yaml` Codemagic CI runner. Blocked on: Apple Developer account ($149/yr AUD), App Store Connect app record at bundle ID `com.calcheq.app`, App Store Connect API key, "Internal Testers" beta group. Android-first ships first to IXOM. Holding until I have a Mac available.
  - Real-device screenshots for the App Store + Play Store listing — capture plan lives in `mobile/store-metadata/screenshots/README.md`.
- **Advanced analytics** — statistical failure prediction once 12+ months of real data exists; fleet benchmarking across anonymised platform data.
- **Public API / webhooks** — REST API for Enterprise customers to integrate with BI tools; webhook events for key actions (calibration submitted, instrument overdue).
- **Enterprise: AI-generated calibration procedures** — auto-generate a draft procedure (test points, tolerances, equipment list) based on instrument model + type + range. Useful for sites that haven't formalised procedures. Requires LLM integration and customer signal first.

### What not to build (until clear signal)

- SIL / IEC 61511 functional safety module — separate product domain.
- HART / 4–20 mA communicator integration — hardware dependency, niche.
- SMS notifications — email covers it.
- React Native rewrite — Capacitor wrapper is shipping; only worth revisiting if WebView perf becomes provably blocking.
- AI/ML prediction — rule-based drift engine is sufficient for now.
- Multi-language — English-only for the Australian market.
