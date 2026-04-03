# CalTrack Pro

Industrial instrument calibration management web application.

**Stack:** React 18 + Vite + Tailwind CSS · Python 3.11 + FastAPI · PostgreSQL via Supabase

---

## Prerequisites

- Node.js >= 18
- Python >= 3.11
- A [Supabase](https://supabase.com) project (free tier works)

---

## Setup

### 1. Clone and configure environment

```bash
cp .env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (once models exist)
# alembic upgrade head

# Start the API server
uvicorn main:app --reload --port 8000
```

API available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App available at: http://localhost:5173

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URI from Supabase |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public API key |
| `SECRET_KEY` | Secret for signing internal tokens |
| `ENVIRONMENT` | `development` or `production` |

---

## Project Structure

```
caltrack-pro/
  backend/
    main.py          # FastAPI app entry point
    database.py      # SQLAlchemy engine + session
    models.py        # ORM models
    schemas.py       # Pydantic schemas
    auth.py          # JWT auth helpers
    routes/          # API route modules
    alembic/         # Database migrations
  frontend/
    src/
      components/    # Reusable UI components
      pages/         # Full page components
      hooks/         # Custom React hooks
      utils/         # Helper functions
```
