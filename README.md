# Calcheq

Industrial instrument calibration management — web application for process plants.

**Stack:** React 18 + Vite + Tailwind CSS · Python 3.11 + FastAPI · PostgreSQL via Supabase · Deployed on Railway

**Live:** https://calcheq.com

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

---

## Environment Variables

All set in Railway for production. For local dev, create `backend/.env`.

| Variable                  | Description                                              |
|---------------------------|----------------------------------------------------------|
| `SUPABASE_URL`            | Supabase project URL (backend JWKS verification)         |
| `VITE_SUPABASE_URL`       | Same URL (frontend Supabase client)                      |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anon/public key (frontend)                      |
| `VITE_DEMO_EMAIL`         | Demo account email (Try Demo button)                     |
| `VITE_DEMO_PASSWORD`      | Demo account password                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — required for team member invite; bypasses RLS, keep secret |
| `RESEND_API_KEY`          | Resend API key for email notifications                   |
| `RESEND_FROM_EMAIL`       | Sender address (info@calcheq.com)                        |
| `APP_URL`                 | Public URL of the app (https://calcheq.com)              |

---

## Project Structure

```
Caltrack-pro/
  backend/
    main.py               # FastAPI entry point, CORS, router registration
    database.py           # SQLAlchemy engine + Supabase connection
    models.py             # ORM models: Instrument, CalibrationRecord, CalTestPoint, AuditLog
    schemas.py            # Pydantic v2 schemas
    auth.py               # ES256 JWT verification, user/site resolution
    calibration_engine.py # Pass/fail/marginal calculation (source of truth)
    notifications.py      # Resend email: submit/approve/reject/overdue/invite
    routes/
      auth.py             # /api/auth/* endpoints
      instruments.py      # /api/instruments/* CRUD
      calibrations.py     # /api/calibrations/* CRUD + workflow
      dashboard.py        # /api/dashboard/* aggregation endpoints
      audit.py            # /api/audit + /api/instruments/{id}/audit-log
  frontend/
    src/
      components/         # Layout, Sidebar, Header, AuthGuard, Badges, Toast, TrendCharts
      pages/              # Full page components (app + marketing + auth)
      utils/              # api.js, supabase.js, userContext.js, calEngine.js, formatting.js, reportGenerator.js, calibratorCsvParser.js
  seed_instruments.py     # Seed 30 demo instruments
  seed_riverdale_demo.sql # 130-instrument water treatment plant demo dataset
  caltrack_import_TEMPLATE.csv  # Template for bulk instrument CSV import
```

---

## Deployment

Railway auto-deploys on every push to `main`. Build takes 2–3 minutes.

FastAPI serves the React SPA in production (Vite builds to `frontend/dist`, FastAPI serves it as static files + falls back to index.html for React Router).
