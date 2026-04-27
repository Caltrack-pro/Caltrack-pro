# Calcheq — Architecture Decisions

Records the "why" behind key technical and product decisions so context isn't lost between sessions.

---

## Auth: Supabase Auth (ES256 JWT) — migrated April 2026

**Decision:** User identity and site membership are managed by Supabase Auth plus two DB tables (`sites`, `site_members`). Replaced localStorage-based auth.

**Sign-in flow (2-step UX):**
1. User enters company/site name → validated via `GET /api/auth/check-site`
2. User enters email + password → Supabase `signInWithPassword` → JWT issued
3. Frontend calls `GET /api/auth/me` → backend verifies JWT, returns site + role

**JWT verification (ES256 asymmetric — NOT HS256):**
- Supabase signs JWTs with ECC P-256 (ES256), not HMAC-SHA256
- Backend fetches public JWKS from `https://qdrgjjndwgrmmjvzzdhg.supabase.co/auth/v1/.well-known/jwks.json` and caches keys for 1 hour
- `SUPABASE_JWT_SECRET` is NOT required — `SUPABASE_URL` is sufficient for key resolution
- `python-jose` used for decoding/verification

**User object shape (userContext.js):**
```js
{ userId, email, userName, siteName, role, isDemoMode }
```

**Key auth dependencies (auth.py):**
- `get_current_user(token)` — verifies JWT, returns UserContext. Raises 401 if invalid.
- `get_optional_user(token)` — same but returns None (for public/demo routes)
- `resolve_site(user)` — returns site name string for DB queries
- `assert_writable_site(user)` — raises HTTP 403 if site is "Demo" (read-only protection)

**DB tables:**
```sql
sites        (id UUID PK, name TEXT UNIQUE, slug, created_at)
site_members (id UUID PK, site_id FK→sites, user_id UUID, role TEXT, display_name TEXT, email TEXT, created_at)
```

**Gating:**
- `/app/*` requires a valid Supabase session (AuthGuard component)
- Marketing pages remain fully public

---

## Site Isolation: `created_by` field on instruments table

**Decision:** Multi-tenancy via `created_by` (site name string) on `instruments` table. Site is resolved from JWT, not from a `?site=` query param.

**Why:** Simpler than a foreign key at this stage. Avoids migration complexity. The site name from JWT is trusted and verified server-side.

**Note:** The `sites` table now exists. Renaming `created_by` → `site_id` FK is deferred to the Stripe integration phase (requires schema migration + backfill).

---

## Navigation Restructure — 9 tabs (April 2026)

**Decision:** Replaced the original 5-tab nav with a 9-tab emoji-based nav with clear, non-overlapping purposes.

**Tabs and their single purpose:**
- 🏠 **Dashboard** — health donut, quick actions, KPI stat cards, attention cards
- 🔧 **Instruments** — instrument register (search, filter, bulk actions, add new)
- 📅 **Schedule** — Technician Queue (default) + Planner (queue any active instrument, 12-week workload chart)
- 📋 **Calibrations** — Activity Log (default, with PDF cert per row) + Pending Approvals (live badge count)
- 🔬 **Smart Diagnostics** — Recommendations (critical/advisory/optimisation) + Drift Alerts (sparklines, projected failure) + Repeat Failures
- 📁 **Documents** — document library: upload/manage procedures, manuals, certificates; link to instruments
- 📄 **Reports & Exports** — quick export bar (overdue/failed/compliance CSV) + 4 report tabs
- ⚙️ **Settings** — Site info, Profile, Change Password, Team Members (admin)
- 🆘 **Support** — FAQ accordion, tutorials, contact

**Why:** The old nav had heavy overlap — Dashboard, Instruments, Alerts, and Reports all showed similar instrument tables. Each tab now has one clear job. Smart Diagnostics, Documents, and Support were added to surface features that previously had no dedicated home.

**Legacy routes redirect:** `/app/alerts` → `/app/schedule`, `/app/approvals` → `/app/calibrations`, `/app/bad-actors` → `/app/schedule`, `/app/profile` → `/app/settings`

---

## Marketing / App Routing Split

**Decision:** Marketing pages render in a separate layout tree from app pages. Marketing has no Sidebar or Header. App pages render inside Layout.

**Why:** Homepage needed a completely different visual treatment. Two separate layout trees in React Router v6 is the cleanest solution.

---

## Team Member Management (April 2026)

**Decision:** Admin users can invite new team members directly from the Settings page (`/app/settings`). Invitations are processed server-side.

**How it works:**
1. Admin fills in name, email, role, and a temporary password in the invite form
2. Frontend calls `POST /api/auth/invite`
3. Backend calls Supabase Admin REST API (`POST {SUPABASE_URL}/auth/v1/admin/users`) using `SUPABASE_SERVICE_ROLE_KEY` to create the Supabase user
4. Backend creates a `site_members` row linking the new user to the site
5. Backend calls `notifications.send_member_invite()` which emails the user their credentials via Resend
6. New user signs in with the temporary password and changes it via Settings

**Requirement:** `SUPABASE_SERVICE_ROLE_KEY` must be set in Railway env vars. It bypasses Row Level Security — keep it secret.

---

## Technician Role Can Edit Instruments

**Decision:** `canEdit()` in userContext.js returns true for admin, supervisor, planner, and technician.

**Why:** On smaller sites, the instrument technician is also the person who commissions and sets up instruments. Restricting to admin/supervisor only causes unnecessary friction.

---

## Demo Account: "Demo" Site (read-only)

**Decision:** The site named "Demo" serves as the public demo. Pre-seeded with 30 instruments. All write operations are blocked server-side (HTTP 403) via `assert_writable_site`.

**Credentials:** demo@calcheq.com / CalcheqDemo2026

**Why read-only:** Prevents demo data corruption. Any visitor can log in as demo.

---

## Approval Workflow: `approved_by` Stores Name String

**Decision:** `approved_by` on calibration records stores the approving user's display name, not their UUID.

**Why:** Simple to display. If a user's name changes, historical approvals won't auto-update — acceptable trade-off for now.

**Future:** Once subscription/billing is in place and user profiles are more established, `approved_by` could store the user UUID with name resolved at query time via a join to `site_members`.

---

## PDF Generation: Client-Side (jsPDF), No Backend Required

**Decision:** Calibration certificates and history reports are generated in the browser using jsPDF + jspdf-autotable. No backend endpoint needed.

**Why:** Avoids server-side PDF library dependencies (wkhtmltopdf, WeasyPrint, etc.) and keeps the backend stateless. The data is already in the frontend at generation time.

**Files:** `frontend/src/utils/reportGenerator.js`

---

## Blog Content: Static in BlogPost.jsx (no CMS)

**Decision:** All 6 blog articles are stored as static content objects inside `BlogPost.jsx`, keyed by slug.

**Why:** No CMS infrastructure needed for 6 articles. Simple and fast.

**Articles:** overdue-calibrations, iso-17025-audit, paper-to-digital, consecutive-failures, pharmaceutical-validation, field-technician-workflow

**Future:** Move to markdown files or a headless CMS (Contentlayer, Sanity) when there are 10+ articles. Keep slugs stable.

---

## Role-Based Views: Smarter Defaults, Not Hard Gating (April 2026)

**Decision:** Different roles see different default tabs and a simplified nav, but all roles still have URL access to every page.

**Changes:**
- **Technician:** Sidebar hides Smart Diagnostics and Reports (manager-only tools). Reduces clutter.
- **Planner:** Schedule page defaults to the Planner tab (workload chart) instead of Technician Queue.
- **Any role with pending work:** Calibrations page auto-switches to Pending Approvals tab when there are items waiting for review. Approve/Reject is open to every authenticated site user (see "Calibration Approval Flow" decision below for why).

**Why soft gating, not hard:** At many smaller sites, one person wears multiple hats. Hard-blocking a technician from viewing reports creates friction. The nav simplification guides them to what they need most, but direct URL access remains available.

---

## Onboarding Wizard: 3-Step Welcome Flow (April 2026)

**Decision:** New sites see a welcome banner on the Dashboard (when 0 instruments) with a link to `/app/onboarding`. The wizard is a full-page 3-step flow outside the Layout shell.

**Steps:**
1. Site setup (industry, timezone)
2. Add first instruments (CSV import or manual entry of up to 5)
3. Invite first team member

**Why:** New users with empty dashboards don't know where to start. The wizard provides a guided path. All steps are skippable — experienced users can dismiss and go straight to bulk import.

---

## Super-Admin Privilege Model — April 2026

**Decision:** CalCheq now has a platform-operator privilege level that sits above all sites. It is granted via an env-var email allowlist (`SUPERADMIN_EMAILS`), exposes a `/app/admin` console for running the business (extend trial, override plan, pause/resume, delete, impersonate), and implements impersonation as a per-request header rather than a separate JWT.

**Three sub-decisions, each with a rationale:**

### 1. Env-var allowlist over a DB column

A `site_members.role = 'superadmin'` row would be the "obvious" DB-native choice. We chose `SUPERADMIN_EMAILS=nfish82@hotmail.com,...` instead.

**Why:**
- Revocation is a Railway env change + restart, not a SQL UPDATE someone could forget to audit
- Can't be granted by compromising the web app or a site admin account — requires infrastructure access
- Zero migration complexity; zero new RLS policies; no "is this admin row trustworthy?" question
- Super-admin is a platform operator concept, not a customer-site concept, so keeping it out of `site_members` is semantically correct

**Trade-off:** No UI for granting/revoking. For a team-of-one platform this is fine; if the ops team grows we revisit.

### 2. DB-only trial override over a Stripe-backed extension

The "Extend Trial" action updates `sites.trial_ends_at` (and `subscription_status = 'trialing'`) directly; it does NOT call Stripe.

**Why:**
- Most trial extensions happen before Stripe ever sees the customer (pilot leads, sales hand-shakes, edge cases). A Stripe-backed flow would need a Stripe customer/subscription to exist first, which isn't true for most of these situations
- The DB is already the source of truth for `assert_active_subscription` — so a DB-only write is sufficient for access control
- Keeps the super-admin console fully functional when Stripe is down or in a weird state
- Stripe can still be reconciled later when the customer actually checks out

**Trade-off:** Invoices issued by Stripe won't reflect the extended trial. Acceptable — `/app/admin` is an operator tool, not a billing tool. For customer-facing billing changes, use the Stripe dashboard.

### 3. Header-based impersonation over a separate JWT

Impersonation is implemented as a client-sent `X-Impersonate-Site-Id: <uuid>` header, read by `get_optional_user` and used to rewrite the `UserContext` at a single choke-point. No second JWT is issued.

**Why:**
- Every downstream auth helper (`resolve_site`, `assert_writable_site`, `assert_active_subscription`) automatically respects impersonation with no per-route changes
- The super-admin's real identity is never lost — it's retained on `UserContext.real_user_id`/`real_email` and used for audit rows, so every impersonated write is traceable to the human who did it
- Flipping `is_superadmin = False` on the impersonated context (but keeping `is_impersonating = True`) means a super-admin CAN still be blocked by `assert_writable_site` (Demo) and `assert_active_subscription` (paused customer) while impersonating — they see exactly what the target site sees, which is the whole point
- A separate JWT would require a token-issuance endpoint, token storage, token refresh, and a way to prove "this JWT is an impersonation JWT" — all of which this header approach avoids
- `/api/auth/me` and `get_superadmin_user` depend on `get_real_user` (decodes JWT directly, ignores header) so the sidebar's 👑 entry and the Exit button stay accessible across page refreshes during an impersonated session

**Trade-off:** The header must be stripped on exit before calling `impersonate-end`, otherwise the audit marker would be attributed to the impersonated site instead of the real operator. Handled explicitly in `ImpersonationBanner.onExit`.

**Audit scope:** Every write (POST/PUT/PATCH/DELETE) during an impersonated session writes an audit row via an independent `SessionLocal()`, so the audit persists even if the surrounding route 403s and rolls back. GETs are not audited — noise-to-signal ratio was too low. Impersonate-start and impersonate-end also write audit markers for session boundaries.

---

## Calibration PDF Import: Client-Side Parser

**Decision:** Beamex and Fluke calibrator CSV exports are parsed in the browser (`calibratorCsvParser.js`) before being sent to the backend.

**Why:** Keeps parsing logic testable in isolation, avoids multipart file upload complexity for the review step, and allows the user to see a full preview before any data is written to the database.

**Supported formats:** Beamex MC6/MC4/MC2, Fluke 754/729/726

---

## Calibration Approval Flow — April 2026 Rewrite

**Decision:** Every calibration record goes through an explicit approval step, and **any authenticated site user can approve or reject** (not restricted to admin/supervisor). Self-approval is allowed — the same person may submit and then approve.

**Flow:**
1. A signed-in user enters a calibration on `CalibrationForm` and picks the responsible technician from the dropdown. The technician dropdown is populated from `/api/auth/members` so `technician_id` (Supabase user_id) and `technician_name` are bound atomically.
2. Clicking **Submit for Approval** transitions the record to `SUBMITTED` — regardless of the submitter's role. There is no longer an admin/supervisor auto-approve shortcut.
3. The record appears in the **Pending Approvals** tab on `/app/calibrations`. The sidebar's 📋 Calibrations badge shows the count for everyone. When the count is >0 the page auto-defaults to that tab for any logged-in user.
4. Any site member can click **Approve** or **Reject**. On approve: the backend generates the fpdf2 PDF certificate and Resend emails it to (a) the technician recorded on the record, and (b) the approver. The same email appearing for both is collapsed to a single send.
5. Submission also emails any site admins/supervisors a "pending approval" notification so they can triage, but the approval itself is not gated to them.

**Why no role restriction on approval:** In many smaller plants an internal CalCheq user enters data on behalf of a contractor (who doesn't have a CalCheq seat). That user needs to be able to both submit and approve so the record is closed off, while still producing the audit trail. MHF / safety-critical compliance requires a second party signature — we satisfy that at the workflow level (contractor → internal user) rather than by hard role separation, because the contractor isn't in the system to sign as a first party.

**Why no auto-approve shortcut for admins anymore:** The prior "admin/supervisor submit → APPROVED in one step" path skipped the visible Pending tab and the audit distinction between submission and approval. It also hid cert-send failures because the send happened inside the same try/except as the state change. Forcing every record through `SUBMITTED → APPROVED` gives every calibration the same two-step paper trail and makes failures easier to diagnose.

**Cert recipients — narrow vs broad:** We considered copying all site admins/supervisors on every cert (previous behaviour) but dropped it. Reasoning: the technician needs it for the work order, the approver needs it as their signed artefact, and anyone else who wants a copy can pull the PDF from the instrument's history tab. Broad CC lists turned into noise that users filtered to trash.

---

## Mobile App: Capacitor Wrapper over a Native Rewrite — April 2026

**Decision:** Ship iOS + Android as a Capacitor 6 wrapper around the same React build that runs on the web. App ID `com.calcheq.app`. No separate mobile codebase.

**Why Capacitor over React Native:**
- 95%+ code reuse with the web app — calibration form, drift charts, smart diagnostics, PDF generation all work as-is. A React Native rewrite would have meant maintaining two implementations of every screen forever, which doesn't earn its keep at a 1-pilot scale.
- Native features we actually need (camera, QR scan, secure JWT storage) are all available as Capacitor plugins. WebView performance is non-issue for a forms-and-tables app.
- One language (JS), one router, one auth flow, one state model. Bug fixed once = fixed everywhere.

**Why Capacitor over Cordova or a pure PWA:**
- Cordova's plugin ecosystem is in maintenance mode; Capacitor 6 is the actively-maintained successor with first-class TypeScript bindings and native ES modules.
- Pure PWA can't access ML Kit's native scanner UI (which is materially better than `getUserMedia` + a JS QR library on cheap Android tablets), and store presence (App Store / Play Store) is a real distribution + trust signal for industrial customers buying calibration software.

**Trade-offs accepted:**
- Heavier app binary than RN (WebView is bundled). Acceptable — install size isn't a sales objection for a B2B work tool.
- App Store reviewers occasionally push back on "wrapped websites." Mitigated by genuine native features (camera, scanner, native splash, native nav chrome on mobile breakpoint) and store-listing copy that frames it as a field tool, not a website.

### 1. Photo storage — Supabase Storage with prefix-based RLS

**Decision:** Calibration evidence photos go to a private Supabase Storage bucket `calibration-photos`, path-keyed `{site_name}/{uploadSessionId}/{filename}`. The 4 RLS policies (select/insert/update/delete) check `split_part(name, '/', 1) IN (SELECT s.name FROM sites s JOIN site_members sm ON sm.site_id = s.id WHERE sm.user_id = auth.uid())`.

**Why path-prefix RLS over a separate `photos` table with FK to `calibration_records`:**
- Storage already enforces tenant isolation in the database, with no extra row to keep in sync. The bucket IS the access-control surface.
- Reads use signed URLs (30-min TTL) generated on demand — the client never gets a long-lived URL, and a leaked URL stops working in 30 minutes. Good enough for a B2B tool; we can shorten the TTL later if customers ask.
- A `photos` table would have meant another model, another migration, another join, and a chicken-and-egg around "the photo exists before the calibration record does."

**Why a UUID upload session in the path instead of `record_id`:**
- The calibration record doesn't exist when the user starts attaching photos — the form is still being filled out. We can't put `record_id` in the path because there's no ID to put.
- A client-generated `uploadSessionId` UUID groups one form's worth of uploads and makes the path deterministic. RLS only cares about the first segment (site name); the second segment is purely organisational.
- Side benefit: if the user abandons the form, the bucket can be GC'd by `uploadSessionId` prefix later without touching the records table.

**Why TEXT[] on `calibration_records` instead of a join table:**
- Photos belong to exactly one calibration record. There's no many-to-many. A junction table would just be a `photo_id → record_id` lookup with no second relation worth tracking.
- Postgres TEXT[] is queryable enough for our needs (`unnest`, `cardinality`) and a Pydantic `List[str]` round-trips cleanly through SQLAlchemy + FastAPI.

### 2. Barcode scanner as a utility, not a component

**Decision:** `frontend/src/utils/barcodeScanner.js` exports `scanBarcode()`, `isScanSupported()`, and a `CameraPermissionDeniedError`. Nothing renders in React.

**Why:** `@capacitor-mlkit/barcode-scanning`'s `scan()` opens its own fullscreen native UI — there is no React surface to put a `<Scanner />` component into. The caller awaits a Promise and gets either a string or an error. Modelling that as a component would have required either a dummy invisible component (confusing) or a portal (pointless) — a function is the right primitive.

**Why we lookup by tag, not by encoded payload:** The scanned string IS the tag number — no JSON, no URL scheme, no signed payload. Sites print plain QR codes with their existing tag numbers; we don't make them re-print labels. The new endpoint `GET /api/instruments/by-tag/{tag_number}` resolves that to an instrument within the caller's site (composite uniqueness on `(tag_number, created_by)` means the same tag at different sites doesn't collide).

**Path ordering matters:** `/by-tag/{tag_number}` is registered BEFORE `/{instrument_id}` in `routes/instruments.py` so FastAPI doesn't try to coerce the literal string "by-tag" into a UUID and 404 the request before the by-tag handler even runs.

### 3. JWT storage on native — `@capacitor/preferences`, with a localStorage fallback for web

**Decision:** Supabase Auth's storage adapter is wired to `@capacitor/preferences` when `Capacitor.isNativePlatform()` is true, and to `window.localStorage` otherwise.

**Why:**
- `@capacitor/preferences` writes to the iOS Keychain and Android EncryptedSharedPreferences — both OS-level encrypted stores, which is the right home for a long-lived auth token.
- `localStorage` is fine on the web (it's already the Supabase default) and survives page reloads. We didn't want to introduce a separate web token store just because native needed one.
- One adapter swap point, no per-call branching in our app code — Supabase handles the rest.

**Trade-off:** Preferences is async; localStorage is sync. The Supabase storage adapter interface accepts async, so this is invisible — but it does mean `getUser()` callers must `await`, which they already did anyway.

### 4. Brand assets generated, not hand-edited

**Decision:** Two SVG sources live in `frontend/assets/` (`icon-only.svg`, `splash.svg`). All platform variants are generated by `npm run icons` (`@capacitor/assets`). Generated PNGs are committed but never hand-edited.

**Why commit generated PNGs:** Native projects need them present at build time, and Codemagic CI (planned for iOS) shouldn't have to install Node + run a generator before xcodebuild. Cost is ~1 MB of binary churn per regeneration — acceptable for a 1× per quarter change.

**Why iOS icons aren't pre-rounded:** iOS applies its own corner mask. Pre-rounding would produce a double-rounded or weirdly-cropped icon on certain devices. The source SVG has square corners on a full-bleed navy fill.
