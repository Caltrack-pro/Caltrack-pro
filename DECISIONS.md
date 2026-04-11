# Calcheq — Architecture Decisions

This file records the "why" behind key technical and product decisions.
It exists so that context is not lost between sessions.

---

## Auth: Supabase Auth (email + password) — migrated April 2026

**Decision:** User identity and site membership are managed by Supabase Auth
plus two new DB tables (`sites`, `site_members`).

**Sign-in flow (2-step UX):**
1. User enters company/site name → validated against `sites` table via `GET /api/auth/check-site`
2. User enters email + password → Supabase `signInWithPassword` → JWT issued
3. Frontend calls `GET /api/auth/me` → backend verifies JWT, looks up `site_members`, returns site + role

**Sign-up flow:**
1. User enters company name + display name + email + password on `/auth/signup`
2. `supabase.auth.signUp({ email, password, options: { data: { site_name, display_name } } })`
3. Email confirmation sent (Supabase default)
4. After confirmation + first sign-in, `onAuthStateChange` fires → frontend calls `POST /api/auth/register`
5. Backend creates `sites` record + `site_members` record (first user = admin)

**User object shape (module cache in userContext.js):**
```js
{ userId, email, userName, siteName, role, isDemoMode }
```

**Backend JWT verification:**
- `SUPABASE_JWT_SECRET` env var (from Supabase Project Settings → API → JWT Settings)
- `python-jose` library decodes and verifies the HS256 JWT
- Audience: "authenticated"
- `get_optional_user(request, db)` → UserContext or None
- `get_current_user(request, db)` → UserContext or 401
- `resolve_site(site, current_user)` → site name string:
  - `?site=Demo` → always allowed, public demo
  - JWT present → user's own site (ignores `?site=` unless Demo)
  - Neither → 401

**Demo mode:**
- The "Demo" site is public (always accessible via `?site=Demo`)
- Logged-in users can switch to Demo via the "Try Demo" button in the Sidebar
- `setDemoMode(true)` in userContext.js sets a module-level flag; all API calls
  then pass `?site=Demo` (because getUser() returns siteName = "Demo")
- A separate `demo@calcheq.com` Supabase account exists for the "Try Demo"
  button on the sign-in page (must be created manually in Supabase Dashboard)

**New DB tables:**
```sql
sites        (id UUID PK, name TEXT UNIQUE, subscription_status, plan, created_at)
site_members (id UUID PK, site_id FK→sites, user_id UUID, role TEXT, display_name TEXT)
```

**Site isolation (unchanged mechanism, same security model):**
- `instruments.created_by` still stores the site name string
- Backend resolves site from JWT (not from `?site=` query param, except for Demo)
- `created_by` → `site_id` FK rename is deferred to Phase 0.3+ (Stripe integration)

**Event system (backward compatible):**
- `caltrack-user-change` DOM event is still dispatched from `onAuthStateChange`
- Dashboard.jsx and InstrumentList.jsx event listeners still work without changes

**Auth routes:**
- `GET  /api/auth/check-site?name=IXOM` — public, validates site exists
- `POST /api/auth/register`             — creates site + admin membership from JWT user_metadata
- `GET  /api/auth/me`                   — returns current user's site + role

**Gating:**
- `/app/*` requires a valid Supabase session (enforced by `AuthGuard` component)
- Unauthenticated visitors are redirected to `/auth/signin`
- Marketing pages (`/`, `/pricing`, etc.) remain fully public

---

## Site Isolation: `created_by` field on instruments table

**Decision:** Multi-tenancy is implemented by storing a site name string
(`created_by`) directly on the `instruments` table, rather than using a
separate `tenants` or `organisations` table with foreign keys.

**Why:** Simpler to implement at this stage. Avoids a schema migration and
additional join complexity. The site name is passed as a query param (`?site=`)
to every API endpoint, and the backend filters by `Instrument.created_by == site`.

**Consequence:** Site names are plain strings — there is no site record in the
database. If a site needs to be renamed, a bulk UPDATE on `created_by` would
be required. This is an acceptable trade-off for the current stage.

**Update (April 2026):** The `sites` table now exists (added during Supabase Auth migration).
`created_by` string → `site_id` FK rename is deferred to the Stripe integration phase,
as it requires a schema migration and backfill of all existing instrument rows.

---

## Marketing / App Routing Split

**Decision:** Marketing pages (/, /blog, /pricing etc.) render in a completely
separate layout tree from app pages (/app/*). Marketing pages have no Sidebar
or Header. App pages render inside a Layout component that provides both.

**Why:** When the public homepage was added, it needed a completely different
visual treatment (marketing nav, full-width sections, no app chrome). Using
two separate layout trees in React Router v6 was the cleanest solution.

**Implementation in App.jsx:**
```jsx
// Marketing — no Layout wrapper
<Route path="/"        element={<Landing />} />
<Route path="/blog"    element={<Blog />} />

// App — inside Layout (Sidebar + Header)
<Route path="/app" element={<Layout />}>
  <Route index element={<Dashboard />} />
  ...
</Route>
```

---

## Technician Role Can Edit Instruments

**Decision:** The `technician` role is included in `canEdit()` in userContext.js,
meaning technicians can create and edit instruments (not just calibration records).

**Why:** On smaller sites, the instrument technician is also the person who
commissions and sets up new instruments in the system. Restricting instrument
creation to admin/supervisor only would create unnecessary friction.

**If this needs to change:** Update `canEdit()` in `frontend/src/utils/userContext.js`
and add role checks inside InstrumentForm.jsx.

---

## Demo Account: "Demo" Site (formerly "Admin")

**Decision:** The site named "Demo" (no password) serves as the public demo account.
It is pre-seeded with 30 instruments via `seed_instruments.py`.

**Rename history:** Originally named "Admin". Renamed to "Demo" in April 2026 via:
- `seed_instruments.py`: SITE constant changed from "Admin" to "Demo"
- Supabase SQL: `UPDATE instruments SET created_by = 'Demo' WHERE created_by = 'Admin'`

**Why:** Prospective customers need to see real data immediately without signing up.
The demo site shows the full capability of the app — overdue instruments, failed
calibrations, bad actors, trend data, etc.

**Consequence:** The "Demo" site is effectively public. Any visitor can sign in
to "Demo" and see/edit the demo data. This is intentional for now. Before commercial
launch, the demo site should either reset nightly (cron job) or be made read-only
for unauthenticated visitors. Paying customers get their own isolated site with a
private password.

**Instruments in demo:** 30 instruments across 6 areas (Unit 1, Unit 2, Unit 3,
Tank Farm, Compressor Area, Utilities). Mix of pressure, temperature, flow, level,
analyser, switch, control valve. Various states: current, overdue, due-soon,
failed, marginal, spare, out-of-service.

---

## Blog Article Content: Stored in BlogPost.jsx (not a CMS)

**Decision:** All 6 blog articles are stored as static content objects inside
`frontend/src/pages/marketing/BlogPost.jsx`, keyed by slug.

**Why:** No CMS infrastructure exists yet. Static content in the component is
simple and works well for a small number of articles.

**Articles and slugs:**
- `overdue-calibrations` — refinery case study (cut overdue from 23% to 4%)
- `iso-17025-audit` — what calibration records need for ISO/IEC 17025
- `paper-to-digital` — migration guide for maintenance teams
- `consecutive-failures` — feature deep dive on the consecutive failure alert
- `pharmaceutical-validation` — 21 CFR Part 11 and pharma calibration
- `field-technician-workflow` — day-in-the-life article

**Future:** When there are 10+ articles, move content to markdown files or a
headless CMS (Contentlayer, Sanity, or similar). Slugs should remain stable.

---

## Cross-Component State Sync: Custom DOM Event

**Decision:** When a user signs in or out, the app dispatches a custom DOM event
(`caltrack-user-change`) rather than using React context or a state management library.

**Why:** The Header (which handles sign-in) and multiple pages (Dashboard,
InstrumentList) all need to react to auth changes. At the time this was built,
adding React context would have required refactoring the entire component tree.
The custom event is a lightweight alternative.

**Implementation:**
```js
// Dispatch (in Header.jsx after sign-in)
window.dispatchEvent(new CustomEvent('caltrack-user-change', { detail: user }))

// Listen (in Dashboard.jsx, InstrumentList.jsx)
window.addEventListener('caltrack-user-change', onUserChange)
```

**Future:** When Supabase Auth is integrated, replace this with a Supabase
auth state listener (`supabase.auth.onAuthStateChange`). The custom event
approach can be retired at that point.

---

## Approval Workflow: approved_by Stores Name (not User ID)

**Decision:** The `approved_by` field on calibration records stores the approving
user's display name (string) rather than a user ID.

**Why:** There is no users table in the database. The current auth system uses
localStorage only, so there is no server-side user record to reference.

**Consequence:** If a user changes their name in the system, historical approvals
will not automatically update. This is acceptable in the current pre-auth state.

**Future:** Once Supabase Auth is in place and a users table exists, `approved_by`
should store the user's UUID and the name should be resolved at query time via a join.

---

## PDF Generation: Client-Side (jsPDF), No Backend Required

**Decision:** Calibration certificate