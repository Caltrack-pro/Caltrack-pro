# CalCheq

Industrial instrument calibration management — SaaS web application + native iOS/Android apps for process plants.

**Stack:** React 18 + Vite + Tailwind CSS · Python 3.11 + FastAPI · PostgreSQL via Supabase · Capacitor 6 (iOS/Android) · Deployed on Railway

**Live:** https://calcheq.com

> **New here?** Read `docs/OPERATIONS.md` first — it's the plain-English narrative of how the whole thing runs (architecture, end-to-end flows, runbook, troubleshooting). This README only covers local dev setup.

---

## Prerequisites

- Node.js >= 18
- Python >= 3.11
- A [Supabase](https://supabase.com) project

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 3. Mobile (Capacitor — iOS + Android)

The mobile apps are wrappers around the same Vite build that powers the web. App ID: `com.calcheq.app`. See `CLAUDE.md` "Mobile App (Capacitor wrapper)" for architecture; `mobile/store-metadata/` for store listings.

```bash
cd frontend
npm run build:mobile    # vite build + cap sync (always run before opening native IDE)
npm run open:android    # opens frontend/android/ in Android Studio
npm run open:ios        # opens frontend/ios/App/App.xcworkspace in Xcode (macOS only)
npm run icons           # regenerate iOS+Android+PWA icons/splashes from frontend/assets/*.svg
```

**Android-first** via the Windows dev machine for the IXOM pilot. iOS native build is deferred to a Codemagic CI macOS runner once the App Store account is provisioned.

**Permissions** (already declared, do not re-prompt):
- iOS — `frontend/ios/App/App/Info.plist`: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`
- Android — `frontend/android/app/src/main/AndroidManifest.xml`: `CAMERA`, `READ_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`

---

## Environment Variables

All set in Railway for production. For local dev, create `backend/.env` and `frontend/.env.local`.

| Variable                    | Description                                                        |
|-----------------------------|--------------------------------------------------------------------|
| `SUPABASE_URL`              | Supabase project URL (backend JWKS verification)                   |
| `VITE_SUPABASE_URL`         | Same URL (frontend Supabase client)                                |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anon/public key (frontend)                                |
| `VITE_DEMO_EMAIL`           | Demo account email (Try Demo button)                               |
| `VITE_DEMO_PASSWORD`        | Demo account password                                              |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — required for team member invite; bypasses RLS  |
| `RESEND_API_KEY`            | Resend API key for email notifications                             |
| `RESEND_FROM_EMAIL`         | Sender address (info@calcheq.com)                                  |
| `CONTACT_NOTIFY_EMAIL`      | Email address to receive pilot/contact form submissions            |
| `APP_URL`                   | Public URL of the app (https://calcheq.com)                        |
| `STRIPE_SECRET_KEY`         | Stripe secret key (sk_test_... or sk_live_...)                     |
| `STRIPE_WEBHOOK_SECRET`     | Stripe webhook signing secret (whsec_...)                          |
| `SUPERADMIN_EMAILS`         | Comma-separated allowlist of platform operator emails (case-insensitive). Empty/unset = no super-admins. |

---

## Project Structure

```
Caltrack-pro/
  backend/
    main.py                # FastAPI entry point, CORS, router registration
    database.py            # SQLAlchemy engine + Supabase/PgBouncer connection
    models.py              # ORM: Instrument, CalibrationRecord, CalTestPoint, AuditLog,
                           #      CalibrationQueue, Document, DocumentInstrument, Site, SiteMember
    schemas.py             # Pydantic v2 request/response schemas
    auth.py                # ES256 JWT verification, user/site resolution, assert_writable_site,
                           #      assert_active_subscription, get_superadmin_user,
                           #      impersonation via X-Impersonate-Site-Id header
    calibration_engine.py  # Pass/fail/marginal calculation (source of truth)
    notifications.py       # Resend email: submit/approve/reject/overdue/invite/cert
    pdf_generator.py       # fpdf2 — server-side PDF calibration certificate generation
    requirements.txt       # Python dependencies
    alembic.ini            # Database migration config
    routes/
      auth.py              # /api/auth/* (check-site, register, me, members, invite)
      instruments.py       # /api/instruments/* CRUD + bulk import + drift analysis
      calibrations.py      # /api/calibrations/* CRUD + submit/approve/reject workflow
      dashboard.py         # /api/dashboard/* aggregation endpoints
      audit.py             # /api/audit + /api/instruments/{id}/audit-log
      queue.py             # /api/queue — calibration work queue (DB-backed)
      documents.py         # /api/documents — document library with instrument linking
      billing.py           # /api/billing — Stripe checkout, portal, subscription webhook
      contact.py           # /api/contact — pilot request intake + approval flow
      admin.py             # /api/admin — pilot approve/deny with Supabase user creation
      superadmin.py        # /api/superadmin — platform operator console (list/extend-trial/override-plan/pause/resume/impersonate/delete)

  frontend/
    assets/                # Mobile icon + splash SVG sources (regenerate variants via `npm run icons`)
    android/               # Capacitor Android project (open in Android Studio)
    ios/                   # Capacitor iOS project (open in Xcode on macOS)
    capacitor.config.ts    # Capacitor 6 config — appId com.calcheq.app, webDir=dist
    src/
      components/          # Layout, Sidebar, Header, AuthGuard, DemoBlockModal,
                           #   ImpersonationBanner, Badges, Toast, TrendCharts,
                           #   ScanFab, PhotoAttachment, marketing/MarketingNav|Footer
      pages/
        auth/              # SignIn, SignUp, AuthCallback, ForgotPassword, ResetPassword
        marketing/         # Landing, Pricing, HowItWorks, Resources, BlogPost,
                           #   FAQ, Contact, DemoPage
        Dashboard.jsx      # KPI cards, health donut, compliance by area, upcoming list
        InstrumentList.jsx # Paginated/filterable register + bulk CSV export
        InstrumentForm.jsx # Create/edit instrument
        InstrumentDetail.jsx # Tabs: Overview, History, Trends, Smart Analytics, Audit, Technical
        CalibrationForm.jsx # Enter calibration results (1–20 test points)
        ImportCalibratorCSV.jsx # 3-step Beamex/Fluke CSV import
        ImportInstruments.jsx   # Bulk instrument CSV import
        Schedule.jsx       # Technician Queue + Planner tabs
        Calibrations.jsx   # Activity Log + Pending Approvals tabs
        SmartDiagnostics.jsx # Recommendations + Drift Alerts + Repeat Failures
        Documents.jsx      # Document library with instrument linking
        Reports.jsx        # Quick exports + 4 report tabs
        AppSettings.jsx    # Profile, Password, Team Members, Billing & Subscription
        Onboarding.jsx     # 3-step welcome wizard
        Support.jsx        # FAQ accordion, tutorials, contact
        SuperAdmin.jsx     # Platform operator console (super-admin only)
      utils/
        api.js             # All API calls with JWT injection (incl. instruments.byTag for QR scan)
        supabase.js        # Supabase client init (Preferences storage adapter on native)
        userContext.js     # getUser(), onAuthStateChange, role helpers
        calEngine.js       # Client-side pass/fail/marginal (mirrors backend)
        formatting.js      # Date and number formatting helpers
        reportGenerator.js # jsPDF certificate + multi-cal report (client-side)
        calibratorCsvParser.js # Beamex/Fluke CSV parser
        barcodeScanner.js  # @capacitor-mlkit/barcode-scanning utility (fullscreen native UI)
        photoCapture.js    # @capacitor/camera + Supabase Storage upload (calibration evidence)
        documentUpload.js  # File picker + Supabase Storage helpers for the documents bucket
        platform.js        # Capacitor.isNativePlatform() helper

  mobile/
    store-metadata/        # App Store + Play Store listing copy, permissions, screenshot plan
      app-store-listing.md
      play-store-listing.md
      screenshots/         # Final PNGs go here (see screenshots/README.md for sizes)

  scripts/                 # seed_instruments.py, seed_riverdale_demo.sql, import_instruments.py,
                           # calcheq_import_TEMPLATE.csv, seed_recommendations_examples.sql
  nixpacks.toml            # Railway build config
  railway.json             # Railway deployment config
```

---

## Deployment

Railway auto-deploys on every push to `main`. Build takes 2–3 minutes.

FastAPI serves the React SPA in production (Vite builds to `frontend/dist`, FastAPI serves static files + falls back to `index.html` for React Router).

Production URL: https://calcheq.com
