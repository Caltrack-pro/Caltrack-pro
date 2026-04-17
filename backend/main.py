from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os
import pathlib

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Calcheq API",
    description="Industrial instrument calibration management backend",
    version="0.1.0",
)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

origins = (
    ["*"]
    if ENVIRONMENT == "development"
    else [os.getenv("FRONTEND_URL", "")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- routers ---
from routes.auth         import router as auth_router                     # noqa: E402
from routes.instruments  import router as instruments_router              # noqa: E402
from routes.calibrations import router as calibrations_router             # noqa: E402
from routes.calibrations import instruments_router as cal_instr_router    # noqa: E402
from routes.dashboard    import router as dashboard_router                # noqa: E402
from routes.audit        import router as audit_router                    # noqa: E402
from routes.queue        import router as queue_router                    # noqa: E402
from routes.documents    import router as documents_router                # noqa: E402
from routes.contact      import router as contact_router
from routes.billing      import router as billing_router                  # noqa: E402
from routes.admin        import router as admin_router                    # noqa: E402

app.include_router(auth_router)
app.include_router(instruments_router)
app.include_router(calibrations_router)
app.include_router(cal_instr_router)
app.include_router(dashboard_router)
app.include_router(audit_router)
app.include_router(queue_router)
app.include_router(documents_router)
app.include_router(contact_router)
app.include_router(billing_router)
app.include_router(admin_router)


# ---------------------------------------------------------------------------
# Notification scheduler (daily overdue digest + weekly due-soon digest)
# ---------------------------------------------------------------------------

@app.on_event("startup")
def start_scheduler():
    if not os.getenv("RESEND_API_KEY"):
        logger.info("RESEND_API_KEY not set — notification scheduler will not send emails")

    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger
        from database import SessionLocal
        import notifications as notif

        def run_overdue_digest():
            db = SessionLocal()
            try:
                sent = notif.send_overdue_digest(db)
                logger.info("Overdue digest sent %d email(s)", sent)
            except Exception as exc:
                logger.warning("Overdue digest failed: %s", exc)
            finally:
                db.close()

        def run_due_soon_digest():
            db = SessionLocal()
            try:
                sent = notif.send_due_soon_digest(db)
                logger.info("Due-soon digest sent %d email(s)", sent)
            except Exception as exc:
                logger.warning("Due-soon digest failed: %s", exc)
            finally:
                db.close()

        scheduler = BackgroundScheduler()
        # Daily overdue digest at 08:00 UTC
        scheduler.add_job(run_overdue_digest, CronTrigger(hour=8, minute=0))
        # Weekly due-soon digest on Mondays at 08:00 UTC
        scheduler.add_job(run_due_soon_digest, CronTrigger(day_of_week="mon", hour=8, minute=0))
        scheduler.start()
        logger.info("Notification scheduler started")
    except Exception as exc:
        logger.warning("Could not start notification scheduler: %s", exc)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": ENVIRONMENT}


@app.get("/api/health/db")
def health_check_db():
    """Diagnose database connectivity — safe to expose (no sensitive data returned)."""
    from database import engine
    import sqlalchemy
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        return {"db": "ok"}
    except Exception as e:
        # Redact password from URL if present in error message
        msg = str(e)
        import re
        msg = re.sub(r":[^:@]+@", ":***@", msg)
        return {"db": "error", "detail": msg}


# ---------------------------------------------------------------------------
# Production: serve the React build from frontend/dist
#
# This block runs only when ENVIRONMENT=production.  The catch-all route is
# registered AFTER all API routes so /api/* is never intercepted by it.
# ---------------------------------------------------------------------------

if ENVIRONMENT == "production":
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    # backend/main.py → ../../frontend/dist
    DIST = pathlib.Path(__file__).parent.parent / "frontend" / "dist"

    if not DIST.exists():
        raise RuntimeError(
            f"frontend/dist not found at {DIST}. "
            "Run 'cd frontend && npm run build' before starting the server."
        )

    # Serve hashed assets (JS, CSS, images) with long cache headers
    app.mount(
        "/assets",
        StaticFiles(directory=DIST / "assets"),
        name="static-assets",
    )

    # Explicit root route — /{full_path:path} does not match bare "/"
    @app.get("/", include_in_schema=False)
    def serve_root():
        return FileResponse(DIST / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """
        SPA catch-all: return the requested file if it exists in dist/,
        otherwise return index.html so React Router handles the URL.
        """
        requested = DIST / full_path
        if requested.exists() and requested.is_file():
            return FileResponse(requested)
        return FileResponse(DIST / "index.html")
