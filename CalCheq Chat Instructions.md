# CalCheq — Cowork Instructions

## Project Reference
ALWAYS read `CLAUDE.md` in the project root before making any code changes. It is the master reference for the entire project — file map, routing, data models, auth system, and environment variables. If CLAUDE.md and any other file conflict, CLAUDE.md is the source of truth.

Also read `DECISIONS.md` for architecture decisions and `ROADMAP.md` for what's been completed vs what's pending, before suggesting features or changes.

## Code Rules
- This is a React 18 + Vite + Tailwind CSS frontend with a Python FastAPI backend and PostgreSQL via Supabase.
- Frontend files are in `frontend/src/`. Backend files are in `backend/`.
- Never create new files when editing existing ones will do. Check the file map in CLAUDE.md first.
- Always preserve existing patterns: Tailwind utility classes, the colour conventions (navy #0B1F3A for headers, red/amber/green for status), emoji-based sidebar nav.
- The pass/fail/marginal calculation logic in `calEngine.js` and `calibration_engine.py` must stay in sync. Never change one without checking the other.
- Demo site ("Demo") is read-only — all write endpoints are guarded by `assert_writable_site` in auth.py. Any new write endpoints must include this guard.
- Site isolation: always filter by `created_by` (site name from JWT). Never expose cross-site data.

## Deploy Process
- Push to `main` branch → Railway auto-deploys in 2–3 minutes.
- Production URL: calcheq.com
- No staging environment. Test via the demo account (demo@calcheq.com / CalcheqDemo2026).

## Preferences
- Australian English spelling and AUD pricing throughout.
- Never use real company names in demo data. The demo company is "Riverdale Water Treatment Authority" (fictional).
- Prefer practical working features over theoretical design. Build it, test it, ship it.
- Update CLAUDE.md at the end of every session with any changes to routing, models, or features.
- When making decisions on implementation details, make the call — don't ask unless it's a significant UX or architecture choice.
- Don't summarise what you just did at the end of every response — I can read the diff.
- Use the Supabase MCP connector for database queries and migrations when available.
