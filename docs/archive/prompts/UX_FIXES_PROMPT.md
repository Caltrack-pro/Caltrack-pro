# UX & Workflow Fixes — Claude Code Prompt

Three independent fixes I keep tripping over in production. Pasted as one prompt because it's cheaper on context than three sessions; build them as three separate phases with a commit at the end of each.

Copy everything between the fences below and paste as your **first message** in a new Claude Code session at the Caltrack-pro repo root.

---

```
Three small but real UX bugs to fix in CalCheq. Build them as three phases — separate commits — in the order below.

## Read these first (in this order)
1. `CLAUDE.md` — master reference. Auth, models, routes, file map, conventions.
2. `DECISIONS.md` — architecture choices.
3. `ROADMAP.md` — what shipped recently (so you don't undo something).
4. `frontend/src/pages/InstrumentForm.jsx` + `frontend/src/utils/calEngine.js` — phase 1 lives here.
5. `frontend/src/pages/Documents.jsx` + `backend/routes/documents.py` — phase 2 lives here.
6. `frontend/src/pages/InstrumentList.jsx`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/ImportCalibratorCSV.jsx`, `frontend/src/components/Sidebar.jsx`, `scripts/caltrack_import_TEMPLATE.csv`, `frontend/src/pages/ImportInstruments.jsx` — phase 3 lives here.

## What to build

### Phase 1 — pH, conductivity, and flow zero-check calibrations

**The problem:** Site technicians do pH and conductivity calibrations regularly. CalCheq has no instrument_type for either — they get shoehorned into "analyser" with an LRV/URV of 0–14. Worse, the calibration form auto-calculates evenly-spaced test points across the range, which is wrong for both:

- **pH** is calibrated against fixed buffer solutions, almost always 2-point at pH 4.01 and 7.00 (sometimes 7.00 and 10.01, sometimes a 3-point at 4.01 / 7.00 / 10.01). Buffer values are industry standards, NOT derived from instrument range.
- **Conductivity** is calibrated by taking a sample, confirming its conductivity with a calibrated reference meter, then doing a single-point comparison against the transmitter reading. The reference value is whatever the sample happens to be — it is not a percent-of-span point.

Pressure / temperature / level calibrations work fine and shouldn't change. Flow is mostly fine but should optionally include a zero-check.

**What to do:**

1. Add two new values to the `instrument_type` enum: `ph` and `conductivity`. Update:
   - `backend/models.py` (the enum / column choices)
   - `backend/schemas.py` (Pydantic validators)
   - `frontend/src/pages/InstrumentForm.jsx` (the type dropdown)
   - `frontend/src/pages/InstrumentList.jsx` (the filter dropdown + any badge mapping)
   - Any place that maps instrument_type to a display label or icon.
   - DB migration if the column is a Postgres enum (use Supabase MCP).

2. **Defaults when type = `ph`:**
   - `num_test_points` defaults to 2, editable up to 5
   - `test_point_values` defaults to `[4.01, 7.00]`, fully editable (the user must be able to change these to e.g. `[7.00, 10.01]`)
   - `engineering_units` defaults to `"pH"`
   - `tolerance_type` defaults to `absolute`, `tolerance_value` defaults to `0.1`
   - `measurement_lrv` / `measurement_urv` default to `0` / `14` (still editable in case someone has a 2–12 range transmitter)

3. **Defaults when type = `conductivity`:**
   - `num_test_points` defaults to 1, editable up to 5
   - `test_point_values` defaults to `[null]` (technician fills in the sample's reference value at calibration time, NOT at instrument setup time)
   - `engineering_units` defaults to `"µS/cm"` with `"mS/cm"` available in a dropdown of common conductivity units
   - `tolerance_type` defaults to `percent_reading`, `tolerance_value` defaults to `2.0`

4. **CalibrationForm test point editability:** today the test points come from `instrument.test_point_values` and are read-only on the form. For pH and conductivity, the technician must be able to override individual test point nominal values (e.g. they grabbed a sample that read 1,250 µS/cm on the reference meter — they enter 1,250, not whatever was preset). Make the `nominal_input` field editable in the calibration form when `instrument_type IN ('ph', 'conductivity')`. For all other types it stays read-only as today.

5. **Flow zero-check:** on `InstrumentForm.jsx`, when type = `flow`, add a checkbox "Include zero-flow check point". When checked, prepend a `0` test point to the `test_point_values` array on save. Default off (don't change behaviour for existing flow instruments).

6. **calEngine.js + calibration_engine.py:** the pass/fail logic for pH and conductivity points works the same way as everything else — `error_abs = actual - expected`, compared against the absolute tolerance or percent-reading tolerance. No engine changes needed UNLESS your read of the code shows a hardcoded assumption that breaks for these types. If you change one, change the other (project rule).

### Phase 2 — Real document file upload

**The problem:** the "Upload Document" button on `/app/documents` opens a form that lets the user *write* document metadata, but there's no actual file picker. Users want to upload existing PDFs, Word docs, or scanned procedures from instrument manuals — they don't want to retype them.

**What to do:**

1. Mirror the photo upload pattern from the mobile-app build (calibration-photos bucket). Create a private Supabase Storage bucket called `documents`:
   - Size cap: 25 MB per file (manuals can be big)
   - Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/png`, `image/jpeg`, `image/tiff`, `text/plain`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
   - 4 RLS policies (select / insert / update / delete) keyed on `split_part(name, '/', 1) IN (SELECT s.name FROM sites s JOIN site_members sm ON sm.site_id = s.id WHERE sm.user_id = auth.uid())`. Same shape as `calibration-photos`.

2. Path convention: `{site_name}/{document_uuid}/{original_filename}`. Generate the document UUID client-side at upload time so the path can be built before the row is inserted.

3. Add a file-picker step to `Documents.jsx` upload modal. Flow:
   - User clicks "Upload Document"
   - Modal opens with: file picker (drag-drop + click-to-browse), title field (auto-fills from filename, editable), doc_type dropdown, notes textarea, "link to instruments" multi-select (existing behaviour)
   - On save: upload the binary to the `documents` bucket → POST `/api/documents` with the file path in `file_url` plus the metadata.

4. **Backend** — confirm `routes/documents.py` already accepts `file_url` (the column exists in `documents` per CLAUDE.md). If the route ignores it, add it to the schema. Don't proxy the upload through FastAPI — go direct to Supabase Storage from the browser using the user's JWT, same as `uploadCalibrationPhoto`.

5. **List view** — for each document, show a "Download" button that fetches a 30-min signed URL from Supabase and opens it in a new tab. Keep the existing "View" / "Edit" / "Delete" actions. If `file_url` is null (legacy "written" documents), hide the Download button.

6. **Don't remove the existing "write notes" path entirely.** Some users may have created documents that are just notes with no file attached. Keep the metadata-only mode as a secondary option ("No file? Add notes only") — but the primary CTA on the modal is the file picker.

### Phase 3 — Import UX fixes

Three small fixes, all under `/app/instruments` and the import pages:

1. **Rename "Caltrack import template" → "CalCheq import template"** everywhere it appears:
   - `scripts/caltrack_import_TEMPLATE.csv` — rename the file to `calcheq_import_TEMPLATE.csv` and update any script that references it (`scripts/import_instruments.py`).
   - The download button on `ImportInstruments.jsx` — update the `download` attribute on the `<a>` tag and any toast/copy that says "Caltrack".
   - Any header row inside the CSV file itself that says "Caltrack" — rename to "CalCheq".
   - Grep the whole repo for `Caltrack` (case-insensitive) and rename to `CalCheq` UNLESS it's a legitimate historical reference (e.g. the GitHub remote URL is still `Caltrack-pro` — leave that). Use judgment; flag any ambiguous ones in your plan instead of just changing them.

2. **Dashboard "Import CSV" button currently routes to the Calibrator CSV page.** That's wrong — most users wanting to "import CSV" from the dashboard mean instrument bulk import, not calibration results. Change `Dashboard.jsx` so the "Import CSV" quick action goes to `/app/import` (the InstrumentList importer). If the button text is too generic, rename it to "Import Instruments". Add a SECOND quick action for "Import Calibrations" if there's room — but don't break the layout.

3. **Make all three import paths discoverable from the Instruments page.** On `InstrumentList.jsx`, the top-right toolbar should show three buttons (or a single dropdown with three options):
   - "+ New Instrument" → `/app/instruments/new`
   - "Import Instruments CSV" → `/app/import`
   - "Import Calibrator CSV" → `/app/calibrations/import-csv`
   
   Today the third one is unreachable from the Instruments page. Fix that.

4. **Sidebar highlighting on `/app/calibrations/import-csv`:** today the sidebar marks the Calibrations row active because the route lives under `/app/calibrations/`. The user mentally groups this with Instruments because that's where the import buttons are. **Cleanest fix:** move the route to `/app/instruments/import-calibrations` and add a redirect from the old path. This naturally fixes sidebar highlighting and aligns the mental model. Update `App.jsx`, `Sidebar.jsx` if needed, the `<Link>` you just added in step 3, and CLAUDE.md's routing table.

## Guardrails — things NOT to do
- Do NOT make Demo writable. `assert_writable_site` stays. The user is aware Demo is read-only and wants it that way.
- Do NOT change the pass/fail engine behaviour. If you touch `calEngine.js`, mirror the change in `calibration_engine.py` and vice versa (project rule).
- Do NOT break the existing analyser instrument type — there are real instruments using it. Add `ph` and `conductivity` alongside, don't replace.
- Do NOT proxy file uploads through FastAPI in phase 2. Direct browser → Supabase Storage. Same pattern as `uploadCalibrationPhoto` in `frontend/src/utils/photoCapture.js`.
- Do NOT change Demo or Calcheq site data. Don't seed test pH/conductivity instruments anywhere except your own test runs (delete them after).
- Do NOT push. I'll review the diff and push manually.
- Do NOT update CLAUDE.md, DECISIONS.md, ROADMAP.md, or README.md until all three phases build and lint clean. Docs are the LAST step (one commit covering all three phases).

## How to work

1. Propose a plan as a bullet list: files you'll create, files you'll edit, DB migrations needed (the new instrument_type values, possibly the documents bucket creation), test scenarios. Wait for my sign-off before writing code.
2. After sign-off, build phase 1 → commit → build phase 2 → commit → build phase 3 → commit → docs commit. Four commits total.
3. After each phase: `cd frontend && npm run build` and `python -m py_compile backend/*.py backend/routes/*.py`. Fix errors before moving on.
4. Self-review with `/review` before calling it done.

## Verification I'll run after you're done

**Phase 1:**
- Create a new instrument with type `ph`, range 0–14, range tolerance 0.1 absolute. Default test points should be 4.01 and 7.00. Edit them to 7.00 and 10.01, save. Reload — values stick.
- Open `/app/calibrations/new/<that-instrument>`. The test point nominal column is editable. Enter as-found values for both points and confirm pass/fail evaluates correctly.
- Create a `conductivity` instrument with default settings. Enter a calibration with reference value 1,250 µS/cm and as-found 1,265 (1.2% high). Confirm result is "pass" (within 2% tolerance).
- Create a `flow` instrument with "Include zero-flow check" ticked. Confirm `test_point_values` includes a leading 0.
- Existing pressure/temperature/level instruments still work — no regression.

**Phase 2:**
- Upload a 2 MB PDF on `/app/documents`. Confirm it lands in the `documents` bucket under `<my-site>/<uuid>/<filename>.pdf`.
- Click Download — opens the PDF in a new tab.
- Sign in to a different site, navigate to /app/documents — the PDF from site A is NOT visible. RLS works.
- Try to upload a 30 MB file — rejected with a clear error.
- Try uploading a `.exe` — rejected.

**Phase 3:**
- From `/app/instruments`, click "Import Calibrator CSV" → page loads, sidebar highlights Instruments (not Calibrations).
- Old URL `/app/calibrations/import-csv` redirects to the new path.
- Dashboard "Import CSV" / "Import Instruments" button goes to `/app/import`.
- Click "Download CalCheq Template" on `/app/import` — file downloads as `calcheq_import_TEMPLATE.csv`. Open it: header row says "CalCheq", not "Caltrack".
- Grep the repo: no user-facing "Caltrack" strings remain (excluding the GitHub remote URL).

## Documentation updates (final commit, after all three phases are green)

**CLAUDE.md**
- Under "Core Data Models → Instrument", update the `instrument_type` enum list to include `ph` and `conductivity`.
- Update the routing table: `/app/calibrations/import-csv` → `/app/instruments/import-calibrations`. Add the redirect.
- Under "Operational scripts — scripts/", rename `caltrack_import_TEMPLATE.csv` → `calcheq_import_TEMPLATE.csv`.
- New short subsection under "Storage" (create the heading if it doesn't exist) listing the two private Supabase Storage buckets: `calibration-photos` and `documents`, with the path convention and RLS shape for each.

**DECISIONS.md**
- Add a short note under a new heading "Specialist analyser types — April 2026":
  - Why pH and conductivity got their own enum values rather than staying lumped under `analyser` (test-point logic differs fundamentally — pH uses fixed buffers, conductivity uses sample comparison, neither is span-derived).
  - Why test points are editable at calibration time for these two types only (pH buffers can vary by lab; conductivity sample value is unknown until measured).

**ROADMAP.md**
- Add a "Completed {today's date} April 2026" block summarising the three phases.

**README.md**
- If there's a Storage / Supabase Storage section, add the new `documents` bucket. If not, skip.

## One thing to confirm before you start

Before phase 1: check whether `instrument_type` is a Postgres enum or a free-text column in the live DB. If it's an enum you need a migration to add the two new values; if it's free text or a CHECK constraint, the changes are app-level only. Use the Supabase MCP to inspect.
```

---

## After Code finishes

1. Read each phase's diff before pushing. Phase 1 in particular touches both calibration engines — confirm they still match.
2. Run the verification checklist yourself, ideally on a real device for the document upload (test with a real instrument manual PDF, not just a tiny test file).
3. The Supabase Storage `documents` bucket needs to exist BEFORE the frontend tries to write to it — confirm Code created it via migration or via the Supabase MCP, not just in code.
4. After push: pH and conductivity instruments are useful for the IXOM pilot, so flag this as a feature update to Wendy when it ships.
