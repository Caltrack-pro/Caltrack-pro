# Super-Admin / Platform Operator Feature — Claude Code Prompt

Copy everything between the fences below and paste as your **first message** in a new Claude Code session at the Caltrack-pro repo root.

---

```
Build a super-admin / platform operator system for CalCheq. I'm the owner of calcheq.com and currently my account has the same powers as any other admin on their own site. I need a new privilege level that sits above all sites, so I can run the business without SSHing into the database.

## Read these first (in this order)
1. `CLAUDE.md` — master reference for the whole codebase. Auth model, routes, data shape, rules.
2. `DECISIONS.md` — why we chose Supabase Auth (ES256), why per-site isolation by `created_by`, etc.
3. `ROADMAP.md` — what's shipped recently.
4. `backend/auth.py` — this is where the new privilege check plugs in.
5. `backend/routes/admin.py` — note: this already exists and handles pilot approve/deny. The new feature is NOT this. Rename the new module to `routes/superadmin.py` or `routes/platform.py` to avoid confusion.

## What to build

Three things, in this order.

### 1. Super-admin gate (backend, ~30 min)
- Add env var `SUPERADMIN_EMAILS` (comma-separated list of emails) to `.env.example` and the Railway env var list in CLAUDE.md.
- Add `get_superadmin_user()` dependency in `backend/auth.py` that:
  - Takes the existing `UserContext` from `get_current_user`
  - Checks `user.email in SUPERADMIN_EMAILS` (case-insensitive, trimmed)
  - Raises HTTP 403 with a clear message if not
- Add `is_superadmin: bool` field to the `/api/auth/me` response (in `backend/routes/auth.py`) so the frontend can show/hide the admin UI.

### 2. Platform console (backend + frontend, the bulk of the work)
A new page at `/app/admin` visible only when `is_superadmin === true` in the user context.

**Backend** — new file `backend/routes/superadmin.py`, mounted at `/api/superadmin/*`:

- `GET /api/superadmin/sites` — list every site with: id, name, created_at, subscription_status, subscription_plan, subscription_interval, trial_ends_at, stripe_customer_id, instrument_count, calibration_count, last_activity (latest calibration date or site.updated_at), member_count.
- `GET /api/superadmin/sites/{id}` — full detail for one site including members list.
- `POST /api/superadmin/sites/{id}/extend-trial` — body: `{ days: int }` or `{ new_end_date: ISO }`. Sets `sites.trial_ends_at` and sets `subscription_status = 'trialing'`. **Does NOT touch Stripe** — this is a DB-only override for pilots without cards on file. Log to audit_log.
- `POST /api/superadmin/sites/{id}/override-plan` — body: `{ plan: 'starter'|'professional'|'enterprise', interval: 'monthly'|'annual' }`. Sets subscription_plan + interval in DB. Useful for "goodwill upgrades" without charging. Log to audit_log.
- `POST /api/superadmin/sites/{id}/pause` — sets subscription_status to 'cancelled'. Log.
- `POST /api/superadmin/sites/{id}/resume` — sets subscription_status back to 'active' or 'trialing'. Log.
- `DELETE /api/superadmin/sites/{id}` — deletes site + cascades instruments, calibrations, etc. Require `?confirm=<site_name>` query param matching the site name to prevent fat-finger deletions. Refuse to delete the 'Calcheq' site or 'Demo' site. Log.
- Every endpoint guarded by `Depends(get_superadmin_user)`. Never check `assert_writable_site` (super-admin should be able to operate even when the target site is "Demo").

**Audit logging** — use the existing `audit_log` table. Write one row per super-admin action with: `entity_type='site'`, `entity_id=target_site_id`, `user_id` and `user_name` from the super-admin, `action='superadmin_<verb>'` (e.g. `superadmin_extend_trial`), `changed_fields` JSONB capturing before/after.

**Frontend** — new file `frontend/src/pages/SuperAdmin.jsx` at route `/app/admin`:
- Route in `App.jsx` gated by an inline check on `user.is_superadmin`; unauthorised users see 404, not a friendly redirect (don't advertise its existence).
- Table of all sites with columns: name, status badge, plan, trial ends, instruments, members, last activity, actions.
- Actions column: "Extend trial" (opens modal with date picker), "Override plan", "Pause/Resume", "Impersonate", "Delete" (requires typing site name to confirm).
- Sort + search.
- Use existing Tailwind utility classes and colour conventions from CLAUDE.md.
- Add `admin: {...}` bundle to `frontend/src/utils/api.js` for the new endpoints.
- Add a 👑 "Platform Admin" entry to the sidebar in `frontend/src/components/Sidebar.jsx`, shown only when `user.is_superadmin === true`.

### 3. Impersonation (backend + frontend)
The super-admin can "sign in as" any site to debug or reproduce customer issues.

**Approach** — request-level header, not a separate token. Simplest, no new signing keys.

- Frontend: when super-admin clicks "Impersonate" on a site, set `sessionStorage.impersonate_site_id = <uuid>` and show a sticky red banner at the top: "⚠ Impersonating {site_name} — [Exit]". All subsequent API calls in `api.js` attach header `X-Impersonate-Site-Id: <uuid>`.
- Backend: modify `resolve_site(user)` in `auth.py` to check for the header. If present AND the caller is super-admin, return the impersonated site instead of the caller's own. If present but caller is NOT super-admin, 403.
- Impersonation MUST still respect per-site write rules — i.e. if super-admin impersonates the Demo site, writes should still 403 via `assert_writable_site`. Impersonation is for *seeing and debugging*, not for laundering writes to Demo.
- Impersonation MUST still check `assert_active_subscription` — super-admin testing a paused customer's account should see the 402 their real customer sees.
- Every impersonated request logs an audit row with `action='impersonation'`, `entity_id=target_site_id`, `changed_fields={method, path}`.
- "Exit" button clears sessionStorage and refreshes.

## Guardrails — things NOT to do
- Do NOT create a separate JWT for impersonation. Use the header approach above.
- Do NOT grant super-admin based on site name ('site is called Calcheq' is brittle). Email allowlist via env var only.
- Do NOT let super-admin delete the 'Calcheq' site or 'Demo' site.
- Do NOT skip the audit log. Every super-admin action must be traceable.
- Do NOT break `assert_writable_site` or `assert_active_subscription` — they still apply when impersonating.
- Do NOT edit CLAUDE.md, DECISIONS.md, ROADMAP.md, or README.md until the code builds and lints clean. Docs are the LAST step.
- Do NOT push. I'll review the diff and push manually.

## How to work

1. First, propose a plan as a bullet list: files you'll create, files you'll edit, DB migrations needed (if any), env vars to add, test scenarios. Wait for my sign-off before writing code.
2. After sign-off, implement in the order above (gate → console → impersonation). Commit after each of the three phases with a descriptive message.
3. Run linting / builds after each phase: `cd frontend && npm run build` and `cd backend && python -m py_compile backend/*.py backend/routes/*.py`. Fix errors before moving on.
4. Self-review with `/review` before calling it done.

## Verification I'll run after you're done

- Sign in as a non-allowlisted email → no 👑 sidebar entry; hitting `/app/admin` renders 404; hitting `/api/superadmin/sites` returns 403.
- Set `SUPERADMIN_EMAILS=nfish82@hotmail.com` in Railway → 👑 appears; /app/admin loads the site table.
- Extend IXOM's trial by 180 days → their `trial_ends_at` updates, `subscription_status` is trialing, and `auth.assert_active_subscription` now passes without a Stripe subscription.
- Click "Impersonate IXOM" → red banner appears → dashboard now shows IXOM's instruments and KPIs. Exit impersonation → back to my own account.
- Impersonate 'Demo' and try to create an instrument → 403 (Demo write-block still active).
- Check `audit_log` table — every super-admin action is there.

## Documentation updates (final step, after all code is green)

Update these files in one final commit:

**CLAUDE.md**
- Under "Auth System" → Roles section, add a 6th role: `superadmin (platform operator) — enabled via SUPERADMIN_EMAILS env var, not a DB role, gated by email allowlist`.
- Under "Required Railway env vars", add `SUPERADMIN_EMAILS` with brief description.
- Under "App routes (AuthGuard + Layout)", add `/app/admin | SuperAdmin | super-admin only, 404 otherwise`.
- Under "Frontend — src/pages/", add `SuperAdmin.jsx — platform-wide site management; impersonation; trial + subscription overrides`.
- Under "Backend — backend/", add `routes/superadmin.py — /api/superadmin/* — list/manage all sites; extend trials; override plans; impersonation audit`.
- Under "Auth API routes", note the new `is_superadmin` boolean on `/api/auth/me` response.
- New section "Impersonation" under Auth System — explain header approach, how it interacts with assert_writable_site and assert_active_subscription, audit logging.

**DECISIONS.md**
Add a new section "Super-admin privilege model — April 2026":
- Why env-var allowlist over DB column (no foot-gun via SQL typo; easy to revoke by Railway env var change; privilege never stored alongside customer data).
- Why DB-only trial override over Stripe-backed (IXOM-style pilots have no card on file; Stripe subscriptions only exist for paying customers).
- Why header-based impersonation over separate JWT (reuses existing auth middleware; simpler; short-lived by design since it's request-scoped).

**ROADMAP.md**
- Add a "Completed {today's date} April 2026" block covering the super-admin build.
- Move any previously-listed "super-admin" item out of "Next Steps" (if present).

**README.md**
- If there's an "Environment variables" section, add `SUPERADMIN_EMAILS` with a one-line description.

## One thing to confirm before you start

Check whether the existing `backend/routes/admin.py` (pilot approve/deny) will collide with the new super-admin routes. If you mount the new router at `/api/superadmin` there's no path collision, but confirm the Python module name is distinct (`routes/superadmin.py`, not `routes/admin.py`).
```

---

## After Code finishes

1. Read the diff it produced end-to-end before pushing. Super-admin code is the kind of thing where "looks fine" and "actually fine" are different.
2. Set `SUPERADMIN_EMAILS=nfish82@hotmail.com` in Railway before pushing. Without it, nothing in the new UI will work and you'll think it's broken.
3. Run through the verification checklist at the bottom of the prompt yourself. If any of it fails, feed the failure back to Code in the same session (don't open a new one — the bug is fresh in its context).
4. Test impersonation carefully against Demo. The guardrail that keeps Demo writable-blocked even under impersonation is easy to accidentally miss.
5. Push when green. If Railway deploys cleanly and Stripe webhooks still fire normally, you're done.
