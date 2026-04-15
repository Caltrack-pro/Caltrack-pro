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

## Calibration PDF Import: Client-Side Parser

**Decision:** Beamex and Fluke calibrator CSV exports are parsed in the browser (`calibratorCsvParser.js`) before being sent to the backend.

**Why:** Keeps parsing logic testable in isolation, avoids multipart file upload complexity for the review step, and allows the user to see a full preview before any data is written to the database.

**Supported formats:** Beamex MC6/MC4/MC2, Fluke 754/729/726
