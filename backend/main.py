from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import pathlib

load_dotenv()

app = FastAPI(
    title="CalTrack Pro API",
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
from routes.instruments import router as instruments_router               # noqa: E402
from routes.calibrations import router as calibrations_router             # noqa: E402
from routes.calibrations import instruments_router as cal_instr_router    # noqa: E402
from routes.dashboard    import router as dashboard_router                # noqa: E402

app.include_router(instruments_router)
app.include_router(calibrations_router)
app.include_router(cal_instr_router)
app.include_router(dashboard_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": ENVIRONMENT}


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
