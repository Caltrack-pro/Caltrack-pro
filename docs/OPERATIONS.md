# CalCheq — Operations Manual

*Written for future-Nate, after a long break. Plain English. Australian spelling.*

*Last reviewed: 28 April 2026.*

---

## What CalCheq is

CalCheq is an industrial instrument calibration management platform — a SaaS web app plus iOS/Android wrappers — that replaces spreadsheets and CMMS attachments with a single register that tracks every instrument's tolerance, drift, history, and certificates. It sells into Australian process plants (water utilities, food and beverage, mining, oil and gas) on three tiers: Starter $199/mo, Professional $449/mo, Enterprise $899/mo (AUD, annual = ten months for the price of twelve). As of today there are three live sites: Calcheq (your own account, super-admin, on a trial extended to May 2027), IXOM (the first real pilot, trialing until 17 May 2026, 4 instruments, 2 members), and Demo (the public read-only demo with 130 fictitious Riverdale Water Treatment Plant instruments). One pilot lead has been approved to date; zero paying customers yet — you are pre-revenue and about to enter sales.

You built this because you're a calibration technician yourself and you watched calibration tracking happen in spreadsheets, MEX attachments, and inboxes — with drift, repeat failures, and audit-trail gaps that nobody noticed until a regulator or an MHF trip-test forced the question. CalCheq is the tool you wished existed when you were the one chasing tolerance values in the field.

---

## The architecture in one diagram

```
                    ┌─────────────────────────────┐
                    │  Browser / iOS / Android    │
                    │  (React 18 + Vite +         │
                    │   Capacitor 6 wrapper)      │
                    └──────────────┬──────────────┘
                                   │ HTTPS
                                   │ JWT (ES256)
                                   ▼
                    ┌─────────────────────────────┐
                    │  FastAPI on Railway         │
                    │  (single service —          │
                    │   serves API + SPA)         │
                    │   calcheq.com               │
                    └─────┬──────────┬──────┬─────┘
                          │          │      │
              ┌───────────┘          │      └────────────┐
              ▼                      ▼                   ▼
     ┌──────────────────┐   ┌─────────────────┐   ┌──────────────┐
     │ Supabase         │   │ Stripe          │   │ Resend       │
     │ - Postgres 17    │   │ - Checkout      │   │ - email send │
     │ - Auth (JWKS)    │   │ - subscriptions │   │   (PDF cert, │
     │ - Storage        │   │ - webhooks      │   │   digests,   │
     │   * cal-photos   │   │   → /billing/   │   │   invites)   │
     │   * documents    │   │     webhook     │   └──────────────┘
     └──────────────────┘   └─────────────────┘
```

DNS sits at Cloudflare. iOS native build runs on Codemagic CI (when you have a Mac to release).

---

## How the system works (end-to-end flows)

### 1. A new user signs up self-service from the marketing site

They click "Sign Up" on the marketing nav. Step 1 is plan selection (Starter / Professional / Enterprise + monthly or annual) — the choice is stashed in Supabase user metadata. Step 2 is email + password + site name; a Supabase user is created and `/api/auth/register` creates a row in `sites` and a row in `site_members` with role `admin`. Supabase sends a confirmation email; clicking it lands on `/auth/callback`, which redirects to a Stripe Checkout session (`/api/billing/create-checkout-session`) carrying their stashed plan choice. They enter card details, Stripe sends a `checkout.session.completed` webhook, and `routes/billing.py` updates the site's `subscription_status` to `trialing` with a 30-day trial. They land on `/app` ready to use the product.

### 2. A pilot fills out the contact form and gets approved

They fill `/contact` with company, role, instrument count, etc. `POST /api/contact` saves a row in `pilot_requests` with a unique UUID `token` and status `pending`, then emails you (via `CONTACT_NOTIFY_EMAIL`) with two big buttons: Approve and Deny — both link to `/api/admin/pilot/approve?token=X` and `/api/admin/pilot/deny?token=X`. Clicking Approve creates a Supabase user, creates a `sites` row, sets a 30-day trial, sends the customer a welcome email with their credentials, and renders a branded HTML success page. They sign in and start using the product as if they'd self-served, but with no Stripe subscription on file — `assert_active_subscription` lets them through because their `trial_ends_at` is in the future.

### 3. A technician records a calibration → submits → an admin approves → a PDF is emailed

The technician opens an instrument detail page, clicks "New Calibration", picks themself from the technician dropdown (which binds `technician_id` and `technician_name` atomically), enters as-found and as-left readings against the instrument's preset test points, and clicks Submit. The record's `record_status` becomes `submitted` regardless of the submitter's role — every record now goes through Pending Approvals. The sidebar 📋 Calibrations badge increments. Anyone signed in to the site (no role gate) can open Pending Approvals, click Approve, and the backend generates an fpdf2 PDF, base64-encodes it, and Resend emails it to the technician on the record AND the approver (deduplicated to one send if they're the same person — that's the deliberate "contractor data entry" workflow). Audit log gets a `submit` row and an `approve` row. If the approver clicks Reject instead, the technician gets a rejection email and the record state becomes `rejected`.

### 4. A customer's trial expires

`assert_active_subscription` runs on every protected write route. The moment `trial_ends_at < now()` AND `subscription_status = 'trialing'`, the helper raises HTTP 402. The frontend's `api.js` catches 402, dispatches a `caltrack-subscription-required` event, and routes the user to `/app/settings?billing=expired`. They can read their data — `assert_active_subscription` is not on every read route — but cannot write. There is no automatic email or warning before expiry today; the customer just hits a wall on their next write attempt. They click "Choose a Plan" in Settings → Billing, which opens a Stripe Checkout, and the `customer.subscription.created` webhook flips them to `active`.

### 5. A super-admin impersonates a customer site to debug an issue

You sign in normally. Your `is_superadmin` flag (derived from your email being in `SUPERADMIN_EMAILS`) lights up the 👑 Platform Admin sidebar entry. You go to `/app/admin`, find the customer site, click Impersonate. The frontend stores the target site's UUID in sessionStorage and starts attaching `X-Impersonate-Site-Id: <uuid>` to every request. A red banner sticks to the top of every page reminding you you're impersonating. The backend's auth helper rewrites your `UserContext` to that site at the single choke-point — every downstream check (`resolve_site`, `assert_writable_site`, `assert_active_subscription`) automatically respects it. Critically, your `is_superadmin` flag is flipped *off* on the impersonated context, so if you impersonate Demo and try to write you get 403, and if you impersonate a paused customer you get 402 — exactly what the customer would see. Every write you make during the session writes an audit row attributed to your real identity (via an independent SQLAlchemy session that survives 403 rollbacks). You click Exit on the banner; sessionStorage is cleared, the impersonate-end audit marker is written under your real identity, and the page hard-reloads to drop in-memory caches.

### 6. A site cancels their subscription

The customer goes to Settings → Billing and clicks "Manage subscription", which opens the Stripe Customer Portal. They cancel from inside Stripe. Stripe sends a `customer.subscription.deleted` webhook to `/api/billing/webhook`; the backend sets `subscription_status = 'cancelled'`. They retain read access until the end of the current billing period (Stripe keeps the subscription `active` until then in its own state machine). Their data is NOT deleted — sites are only deleted via the super-admin console with a `?confirm=<site_name>` guard.

### 7. A field tech opens the mobile app, scans a QR tag, takes a calibration photo

They open the CalCheq app on Android (or iOS, once that's released). It loads the same React build that runs on the web; auth state is read from `@capacitor/preferences` (encrypted storage on the device). If they've enabled Face ID / Touch ID, the BiometricLockOverlay challenges them on launch and on resume. They land on the dashboard, tap the floating Scan FAB, and the ML Kit native scanner opens fullscreen. They point at a tag like `PT-9300`, the scanner returns the raw string, the app calls `GET /api/instruments/by-tag/PT-9300` (site-isolated lookup), and navigates to that instrument's detail page. From there they hit "New Calibration", fill in test points, and tap "Add photo" — the camera plugin opens, they take a shot of the tag plate, and the photo is uploaded directly from the browser to Supabase Storage at `{site_name}/{uploadSessionId}/{filename}`. The path goes into the calibration record's `photo_urls` array. They submit; the supervisor approves from anywhere.

---

## Where things live

**Code.** Frontend at `frontend/src/`, backend at `backend/`, shared scripts at `scripts/`. GitHub remote: `https://github.com/Caltrack-pro/Caltrack-pro.git`, branch `main`. Auto-deploys to Railway on every push.

**Data.** Supabase project `qdrgjjndwgrmmjvzzdhg` in `ap-northeast-1`, Postgres 17. Dashboard: `https://supabase.com/dashboard/project/qdrgjjndwgrmmjvzzdhg`. The tables that matter: `sites` (one row per customer), `site_members` (who's on which site), `instruments` (the register, isolated by `created_by` = site name string), `calibration_records` + `cal_test_points` (the work), `audit_log` (immutable, used by every state change and every super-admin action), `documents` + `document_instruments` (the document library + its links), `calibration_queue` (the technician queue), `pilot_requests` (the contact form intake with its token-based approval flow), `notification_preferences` (per-member email toggles for overdue/due-soon/submission/approval — added recently, not yet referenced in CLAUDE.md).

**Storage.** Two private Supabase buckets, both site-isolated by RLS on `split_part(name, '/', 1)`: `calibration-photos` (10 MB cap, image/* only, mobile evidence flow) and `documents` (25 MB cap, PDF/Office/text/image, document library). Both upload directly browser → Storage; FastAPI never sees the binary.

**Secrets.** Production env vars live in Railway → caltrack-pro project → Variables. The values themselves should live in your password manager — never in this repo, never in a notes file. The names are listed in `CLAUDE.md` "Required Railway env vars". TODO(Nate): name the actual password manager you've chosen so this doc points at the right place next time.

**Domain.** `calcheq.com` registered through Cloudflare Registrar (renewal ~$8.99 USD/yr, auto-renew on). Cloudflare DNS handles CNAME flattening at the apex pointing to the Railway domain. Cloudflare dashboard: `https://dash.cloudflare.com`. Cloudflare credentials in your password manager. Microsoft 365 mail at `info@calcheq.com` is also active (MX, SPF, DKIM all verified) — this is the address Resend sends from.

**Email.** Resend dashboard at `https://resend.com/dashboard`. API key in Railway as `RESEND_API_KEY`. Sender is `info@calcheq.com`. Used for: pilot approve/deny notifications, technician submission alerts, calibration cert PDF on approval, daily overdue digest, weekly due-soon digest, member invite emails, password reset (via Supabase, not directly through Resend).

**Payments.** Stripe dashboard at `https://dashboard.stripe.com`. Account `acct_1TMZ6QCMuZPI8s0m`, currently in **test mode** — switch to live keys before you accept real payments. Three products and six prices already configured (see `CLAUDE.md` Stripe table). Webhooks fire to `https://calcheq.com/api/billing/webhook` with `STRIPE_WEBHOOK_SECRET` for signature verification.

**Hosting.** Railway dashboard at `https://railway.app/project/<your-project>`. Single service deploys from the `main` branch in 2–3 minutes. FastAPI serves both the API (`/api/*`) and the React SPA (`/*` falls back to `index.html`).

**Mobile CI.** `codemagic.yaml` at the repo root. Codemagic dashboard at `https://codemagic.io`. Currently scaffolded but blocked on Apple Developer account + bundle ID provisioning. Holding until you have a Mac available.

---

## The runbook — things you'll be asked to do

### 1. Approve a pilot manually from the database

Use this when the email approval link doesn't work (token already used, email never arrived, etc.).

```sql
-- Check the pending request
SELECT id, email, company, status, token FROM pilot_requests WHERE email = 'them@example.com';

-- Mark approved manually (the email-link route does the rest, including Supabase user creation;
-- if you need that to happen, copy the token and hit /api/admin/pilot/approve?token=<token> in your browser).
UPDATE pilot_requests SET status='approved', actioned_at=now() WHERE email='them@example.com';
```

If the email link itself is broken, the cleanest path is still to copy the `token` value and visit `https://calcheq.com/api/admin/pilot/approve?token=<token>` in a logged-out browser tab. That single endpoint creates the Supabase user, creates the site, sets a 30-day trial, and sends the welcome email.

### 2. Extend a customer's trial by N days

Easiest: use the super-admin console at `/app/admin`, click the site, click "Extend Trial", enter days. The endpoint extends from `max(now, trial_ends_at)` so it never accidentally shortens.

SQL fallback if the UI is down:

```sql
UPDATE sites
SET trial_ends_at = GREATEST(now(), trial_ends_at) + interval '30 days',
    subscription_status = 'trialing'
WHERE name = 'IXOM';
```

This does not touch Stripe — it's a DB-only override, which is the right call for pilots without cards on file (see DECISIONS.md "Super-Admin Privilege Model").

### 3. Override a customer's plan without charging them

`/app/admin` → click the site → Override Plan → pick plan + interval. SQL fallback:

```sql
UPDATE sites SET subscription_plan='professional', subscription_interval='monthly' WHERE name='IXOM';
```

Stripe is not contacted. Use this for goodwill upgrades during sales conversations.

### 4. Pause / resume a customer's subscription

`/app/admin` → click the site → Pause (or Resume). Pausing sets `subscription_status='cancelled'`; resuming sets it back to `active`. SQL fallback:

```sql
UPDATE sites SET subscription_status='cancelled' WHERE name='IXOM';   -- pause
UPDATE sites SET subscription_status='active'    WHERE name='IXOM';   -- resume
```

### 5. Refund a Stripe charge

Stripe dashboard → Payments → find the charge → click "Refund". Choose full or partial. The customer's subscription state in our DB does not change automatically — if you also want to give them more time, extend their trial in the super-admin console. If you're refunding because they cancelled, you've probably already received the `customer.subscription.deleted` webhook, so the DB is already in sync.

### 6. Reset a user's password (when the email reset doesn't reach them)

Supabase dashboard → Authentication → Users → search email → click row → "Send password reset" or "Set password" (you can type a temporary password directly). Tell the customer the temporary password verbally / over a separate channel and ask them to change it via Settings on first sign-in.

### 7. Add a new super-admin email to the allowlist

Railway dashboard → caltrack-pro → Variables → `SUPERADMIN_EMAILS` → append a comma + the new email. Save. Railway will redeploy. The new admin needs to sign out and back in to pick up the change (their JWT is fine, but `/api/auth/me` re-evaluates `is_superadmin` on every request from `SUPERADMIN_EMAILS`, so a fresh `/me` call after sign-in will surface it).

### 8. Manually approve a calibration in the database (last-resort)

Only use this if the UI is broken. The proper path is `/app/calibrations` Pending Approvals tab.

```sql
UPDATE calibration_records
SET record_status='approved',
    approved_by='Nate Fish (manual)',
    approved_at=now()
WHERE id='<record_uuid>';

-- Audit it so the trail isn't broken
INSERT INTO audit_log (entity_type, entity_id, user_id, user_name, action, changed_fields, created_at)
VALUES ('calibration_record', '<record_uuid>', '<your_user_id>', 'Nate Fish', 'manual_approve', '{}'::jsonb, now());
```

This skips the cert email — generate the PDF from the Calibrations Activity Log and send it manually if needed.

### 9. Investigate why a calibration PDF didn't send

Order of checks:

1. Railway logs for the time window — `https://railway.app/project/<id>/service/<id>/logs`. Search for `pdf_generator`, `resend`, or the calibration record ID. A failure inside `pdf_generator.py` (fpdf2 import error, missing field) shows as a stack trace.
2. Resend dashboard → Logs. Filter by recipient. If there's no entry, the send was never attempted — that's an upstream bug (PDF generation, missing technician email).
3. Check the calibration record: `SELECT technician_id, technician_name FROM calibration_records WHERE id='<uuid>';` — if `technician_id` is null, the helper falls back to `current_user.email`, which after the 24 April rewrite means whoever clicked Approve.
4. Check the technician's email is set: `SELECT email FROM site_members WHERE user_id='<technician_id>';`

### 10. Investigate why a Stripe webhook didn't fire

1. Stripe dashboard → Developers → Webhooks → click the endpoint → check delivery attempts. Stripe retries 3+ times automatically.
2. If Stripe shows "Failed", click into the event to see the response body — usually a 401 (signature mismatch — `STRIPE_WEBHOOK_SECRET` rotated and not updated in Railway) or a 500 from our code.
3. Resend the event from the Stripe dashboard once you've fixed the underlying issue ("Resend" button on each delivery attempt).
4. To test locally: `stripe listen --forward-to localhost:8000/api/billing/webhook` (Stripe CLI). The CLI prints a temporary webhook signing secret — set it as `STRIPE_WEBHOOK_SECRET` in `backend/.env` for the duration of your test.

### 11. Roll back a bad Railway deploy

Railway dashboard → caltrack-pro → Deployments → find the last good deploy → click the three-dot menu → "Redeploy". This re-runs that commit's build and points the service at it. The DB is unchanged; if the bad deploy ran a destructive migration, see "The scary list".

For something faster: `git revert <bad_commit> && git push origin main`. Railway redeploys in 2–3 min.

### 12. Rotate a key

- **Supabase service role key:** Supabase dashboard → Project Settings → API → "Reset service role key". Update `SUPABASE_SERVICE_ROLE_KEY` in Railway. The `/api/auth/invite` endpoint is the only path that uses it; verify by inviting a test user after rotation.
- **Stripe secret key:** Stripe dashboard → Developers → API keys → roll the secret key. Update `STRIPE_SECRET_KEY` in Railway. Test by visiting `/app/settings` → Billing → "Manage subscription" and seeing the portal load.
- **Stripe webhook secret:** Stripe dashboard → Developers → Webhooks → click the endpoint → "Roll signing secret". Update `STRIPE_WEBHOOK_SECRET` in Railway BEFORE saving the new secret in Stripe (otherwise webhooks fail in between). Test by triggering a test event from the Stripe dashboard.
- **Resend API key:** Resend dashboard → API Keys → revoke + create. Update `RESEND_API_KEY` in Railway. Test with `/api/auth/invite` or by approving a calibration so a cert email fires.
- **Supabase JWKS:** you don't rotate this directly — Supabase manages it. If JWKS rotation breaks signin, see "Troubleshooting by symptom".

---

## Troubleshooting by symptom

**"A user is reporting they see another site's data."** ⚠ HIGHEST PRIORITY — STOP AND ESCALATE. This is a tenant-isolation breach, the worst class of bug for a multi-tenant SaaS. Do not attempt a quick fix. Steps: (1) take screenshots of what they see, including the URL and Network tab; (2) note their email and the site they're signed in as; (3) check `audit_log` for the time window — `SELECT * FROM audit_log WHERE created_at > now() - interval '1 hour' ORDER BY created_at DESC;`; (4) check whether the response body actually contained another site's data, or whether it was a UI display bug only; (5) if data leaked, pause the affected service in Railway while you investigate. The most likely sources are a missing `created_by` filter on a backend query or an RLS policy hole on a new Storage bucket.

**"Customer says they can't sign in."** Check, in order: (1) is the site `name` they're typing exactly what's in `sites.name` (case-sensitive)? (2) does their Supabase user exist (Supabase dashboard → Authentication → Users → search email)? (3) is their `site_members` row present and pointing at the right `site_id`? (4) is their `subscription_status` in the readable set (`active`, `trialing`)? (5) check the browser Network tab on `/api/auth/me` — a 401 means JWT verification failed (JWKS issue, see below); a 402 means subscription expired (use the runbook to extend trial); a 403 with site mismatch means the SignIn cross-check failed.

**"Customer says calibration PDF didn't arrive."** Run runbook step 9.

**"500s on `/api/dashboard/recommendations`."** Railway logs. The recommendations engine touches drift projections (linear regression on as-found errors over time) which has historically blown up on edge cases — instruments with one calibration, instruments with all-zero errors, divide-by-zero on output_span. The fix in April was to wrap the calc in try/except and skip instruments rather than 500 the whole endpoint, but new edge cases can creep in. Look for the stack trace, identify the offending instrument ID, and either skip it or fix the engine.

**"Stripe webhook isn't updating the subscription."** Run runbook step 10.

**"Mobile app crashes on startup after a deploy."** The app loads `https://calcheq.com` in the WebView, so a crash on startup usually means the web build is broken. Check: (1) does the web app load in a desktop browser? If no, that's the bug — fix and redeploy. (2) If web works but mobile doesn't, check the splash-screen / status-bar Capacitor config — sometimes a plugin update breaks the launch sequence. (3) On Android, check `frontend/android/app/src/main/AndroidManifest.xml` for any permission a recent change may have removed. (4) Run `npm run build:mobile` locally and confirm it succeeds; `cap sync` errors are usually obvious.

**"Production site shows a blank screen."** Open the browser console. The most common cause is a Vite build that succeeded but emitted a JS error at runtime — typically a missing env var (`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` empty in Railway). Less common: a routing collision after merging two branches. Check Railway → Deployments → click latest → see if the build log has warnings.

**"Customer reports being signed out repeatedly on Android."** Check `@capacitor/preferences` — on a rooted device or after a fresh app install, EncryptedSharedPreferences can lose state. Also check whether they're running an Android version below the plugin's minimum. JWT refresh blips also happen due to CSP headers from Railway — check response headers; this is an infra issue, not an app fix.

**"Signin works but `/api/auth/me` returns 401 immediately after."** JWKS rotation. The backend caches the Supabase public key for 1 hour; if Supabase rotated theirs, your cache is stale. Quick fix: restart the Railway service (redeploy or hit the restart button). Long fix: shorten the cache TTL in `auth.py` or move to lazy refresh on 401.

**"Email not arriving from Resend."** Check Resend dashboard → Logs. The most common cause is a deliverability issue with the recipient's mail server (transient bounce). For your own domain (`info@calcheq.com`), verify SPF/DKIM in Cloudflare DNS are still passing — Microsoft 365 occasionally requires you to refresh the DKIM keys.

---

## External dependencies

| Service | What it does | Monthly cost (AUD) | What breaks if it disappears | Credentials |
|---------|--------------|---------------------|-------------------------------|-------------|
| Railway | Hosts the FastAPI service + serves the React SPA | ~$5–20 (usage-based) | Production goes down. App, API, everything. | Railway dashboard login |
| Supabase | Postgres + Auth + Storage | $0 (free tier today; ~$25 when you scale) | Database, auth, photo storage all gone. Hard down. | Supabase dashboard login |
| Stripe | Subscriptions + payments | 0 (transactional fees only — 2.9% + 30c per charge) | New checkouts and webhooks fail; existing customers keep working until next billing cycle. | Stripe dashboard login |
| Resend | Transactional email | $0 (free tier — 3,000/mo) | No outbound emails (cert PDFs, digests, invites, pilot approvals). App still functions. | Resend dashboard login |
| Cloudflare | DNS + domain registration | ~$1.10 (annualised — $8.99 USD/yr domain) | DNS goes; calcheq.com stops resolving. Severe. | Cloudflare dashboard login |
| Microsoft 365 | `info@calcheq.com` mailbox | ~$11 (M365 Business Basic) | Inbound replies to Resend-sent emails would bounce. | Microsoft 365 admin centre |
| GitHub | Source of truth for code | $0 (free tier) | Can't push or auto-deploy until restored. Local copies still work. | GitHub login |
| Codemagic | iOS CI build runner | $0 (not yet active) | iOS builds halt. Android still ships. | Codemagic login |
| Apple Developer | iOS App Store distribution | ~$13 ($149/yr AUD when activated) | Can't publish iOS app. Web + Android still ship. | Apple ID |
| Google Play Developer | Play Store distribution | ~$3 ($25 one-off, amortised) | Can't update Android app. Web still ships. | Google account |

Total fixed monthly run-rate today: roughly $20–40 AUD. Once Apple Developer is paid and Codemagic is on a paid tier, add another $15–25.

---

## The scary list

Things that need a deep breath before clicking.

- **Deleting a customer site from `/app/admin`.** Cascades through instruments (by `created_by`), calibration records, cal test points, documents, document_instruments, calibration_queue, site_members, audit_log entries. Refused for `calcheq` and `demo` — but everything else is fair game. *Instead:* pause the subscription, wait a month, then delete only after confirming with the customer in writing.
- **Force-pushing to `main`.** Railway auto-deploys on every push; a force-push that rewrites history can deploy unintended commits. *Instead:* never force-push to main. Branch, PR, merge.
- **Running a destructive migration without a backup.** Supabase has automatic daily backups on the free tier but they're not point-in-time. A `DROP TABLE` or a bad `UPDATE` without `WHERE` can lose data with no recovery. *Instead:* always run destructive SQL against a Supabase branch or a local Postgres first; or take a manual `pg_dump` before the change.
- **Changing the Supabase JWT verification approach.** The backend trusts JWKS from `https://qdrgjjndwgrmmjvzzdhg.supabase.co/auth/v1/.well-known/jwks.json` and caches for 1 hour. Switching to HMAC, or pointing at a different project URL, immediately breaks signin for everyone. *Instead:* if you must rotate, do it during a maintenance window, with the new value tested in a Supabase branch first.
- **Touching `auth.users` directly.** That's Supabase's internal table; deleting rows there orphans `site_members` and breaks signin. *Instead:* use the Supabase dashboard's user management UI, which cascades cleanly.
- **Pausing the Railway service.** This is fine for a planned maintenance window but means production is down. *Instead:* if you're investigating a tenant-isolation bug, only pause if you suspect ongoing leakage; otherwise mitigate at the application layer.
- **Editing a calibration record's data after approval.** The audit log tracks state transitions but the data fields themselves are not append-only. Editing as-found values on an approved record silently changes the certificate's source of truth. *Instead:* if a record needs correction, reject it and resubmit (or document the change in `technician_notes` so it's visible).
- **Switching Stripe from test mode to live mode.** Live keys can't be confused — they're prefixed `sk_live_`. But the webhook endpoint in Stripe needs to be re-pointed to the live endpoint, the webhook signing secret rotates, and any test customers in your DB will not exist on the live Stripe account. *Instead:* do this once, at a planned cutover, and test the full sign-up flow with one real card before announcing.
- **Updating `SUPERADMIN_EMAILS` to a typo.** A typo locks you out of `/app/admin` and the impersonation tools. *Instead:* always test the new value by signing in as it before removing the old one.

---

## Money & business operations

Revenue lives in Stripe (Australian dollars, GST inclusive in the listed prices), then settles to your business bank account on Stripe's standard 2-day rolling payout. ABN: 19 731 880 044 (registered as CALCHEQ — sole trader; planning Pty Ltd conversion later).

The three subscription tiers, all AUD:

- **Starter** — $199/mo or $1,990/yr (≈ 10 months for the price of 12). Aimed at single-site small operations.
- **Professional** — $449/mo or $4,490/yr. Aimed at multi-area sites with multiple technicians and a planner.
- **Enterprise** — $899/mo or $8,990/yr. Enterprise tier currently differentiates by support and a forward roadmap of Enterprise-only features (CMMS integration, public API, AI-generated procedures) — none of which are gated yet in code.

All paid plans currently get the same feature set. Per-feature plan gating is on the active backlog (see ROADMAP) but not yet enforced — `assert_active_subscription` only checks "have a plan at all".

Free pilots get a 30-day trial at the Professional feature level (because there are no plan-feature differences today, this just means full access). Pilot trials can be extended via the super-admin console without touching Stripe — the customer never has a card on file, so when they convert you'll send them through the standard self-serve checkout.

To issue a refund: Stripe dashboard → Payments → Refund (full or partial). To issue a credit instead of cash: extend their trial via `/app/admin` → Extend Trial. A trial extension is the fastest "make this right" tool because it doesn't require their billing details or any reconciliation with Stripe.

---

## Roadmap context (high level)

Where the product is going next: per-feature plan gating (so Professional unlocks drift prediction and bulk imports), and scheduled report delivery (weekly / monthly compliance PDF by email — the infrastructure is in place, just needs the scheduled job and the per-user toggle). After that, the next inflection point is real customer signal from the IXOM pilot — once we see what they actually use and where they get stuck, we make the call on offline mobile mode, push notifications, and CMMS integration.

What's been deliberately deferred: offline calibration entry with replay-on-reconnect (conflict-resolution UI is a real design problem and we have no field telemetry yet); push notifications for pending approvals (email + in-app badge is enough until proven otherwise); a React Native rewrite (Capacitor wrapper is shipping; rewriting buys nothing until WebView performance is provably blocking); SIL / IEC 61511 functional safety modules and HART hardware integration (separate product domains). Full reasoning lives in `DECISIONS.md` — particularly the "Mobile App: Capacitor Wrapper over a Native Rewrite" section.

---

## When this document is wrong

This file decays quickly because the underlying business changes faster than the docs. When you find something that doesn't match reality:

1. Fix it here, in plain English, before you forget the right answer.
2. If the fix is a runbook procedure, run through it once on a real ticket and edit it to match what actually worked — not what you intended.
3. If the architecture itself changed, also update `CLAUDE.md` (current state) and `DECISIONS.md` (why it changed).

**Quarterly review reminder.** Set a calendar invite to yourself titled "Audit OPERATIONS.md — what's stale?" repeating every three months, starting 28 July 2026. The review is twenty minutes: read the doc end-to-end, fix anything you notice is wrong, then run one runbook procedure (rotate a key, extend a trial) and confirm the steps still work as written. Print a fresh paper copy after each review and put it in your desk drawer — the day production goes down hard, you don't want to be SSHing into Railway from your phone trying to remember what to grep for.
