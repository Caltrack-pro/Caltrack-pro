# CalTrack Pro — Architecture Decisions

This file records the "why" behind key technical and product decisions.
It exists so that context is not lost between sessions.

---

## Auth: localStorage (temporary, not Supabase Auth)

**Decision:** User identity and site membership are stored in localStorage,
not in Supabase Auth or the database.

**Why:** Chosen for speed of development in early build stages. Supabase Auth
requires email verification, password reset flows, and session token handling —
all of which were out of scope when the multi-user/multi-site feature was first built.

**Current user shape stored in localStorage:**
```js
// key: "caltrack_user"
{ siteName: "IXOM", userName: "John Smith", role: "technician" }

// key: "caltrack_sites"
[{ name: "IXOM", passwordHash: "abc123..." }, ...]

// key: "caltrack_members"
[{ siteName: "IXOM", userName: "John Smith", role: "technician" }, ...]
```

**Consequences:** No true server-side auth. Anyone who knows a site's password
can access its data. This is acceptable for a pre-commercial demo but must be
resolved before the first paying customer goes live.

**Migration plan:** Replace with Supabase Auth (email + password). Store
site membership in a `site_members` database table. Keep the existing
site isolation logic (created_by field) intact — only the auth layer changes.

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

**Future migration path:** Add a `sites` table with id, name, subscription_status.
Replace `created_by` string with `site_id` FK. This is the right long-term shape
but is deferred until Supabase Auth is in place.

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

**Decision:** Calibration certificates and history reports are generated entirely
in the browser using jsPDF + jspdf-autotable. No server-side PDF rendering.

**Why:** Avoids adding a PDF dependency (WeasyPrint, Puppeteer, etc.) to the
Python backend. The data is already in the browser when the user triggers the
download. Client-side generation is instant and requires no additional API calls
beyond the data fetch.

**Implementation:** `frontend/src/utils/reportGenerator.js` exports two functions:
- `generateSingleCalibrationCert(instrument, record)` — one-page cert, triggered
  from InstrumentDetail history table (per-row "Cert" button)
- `generateMultiCalibrationReport(instrument, records)` — full history report with
  trend chart, triggered from InstrumentDetail header ("History Report" button)

**Important:** Both functions require the full `CalibrationRecordResponse` (which
includes `test_points`), not the list-item shape returned by the history endpoint.
InstrumentDetail fetches full records via `calApi.get(r.id)` before calling either
function. Do not pass list-item records — the test point table will be empty.

**Limitation:** Very large reports (100+ calibration records) may be slow or cause
memory pressure in low-end browsers. If this becomes a problem, move to server-side
PDF generation (WeasyPrint recommended for Python).

---

## Pass/Fail Engine: Duplicated Frontend + Backend

**Decision:** The pass/fail/marginal calculation logic exists in two places:
- Backend: `backend/calibration_engine.py` (authoritative, used when records are saved)
- Frontend: `frontend/src/utils/calEngine.js` (used for real-time preview while entering data)

**Why:** Users need to see pass/fail results update in real time as they type
test point values in CalibrationForm. This requires the logic to run in the browser.
The backend recalculates on save to ensure the stored result is always correct
regardless of what the frontend sent.

**Important:** If the pass/fail rules ever change, update BOTH files. The backend
is the source of truth — the frontend is display-only.
