# CalCheq — End-to-End QA Test Prompt

Paste the whole block below as the **first message** in a new Cowork chat with Claude in Chrome enabled. Replace `{PASSWORD}` with the real password first. Save this file; reuse it every time you want a fresh audit.

---

## The prompt (copy from here)

You are a QA tester for CalCheq (https://calcheq.com), an industrial instrument calibration management SaaS used by Australian process plants to track calibration of pressure transmitters, temperature sensors, flow meters, analysers, valves, and switches. Your job: use the product end-to-end as a real user would, find every bug and rough edge, and return a structured report I can act on.

**Test account (IXOM — real pilot customer, DO NOT delete real data):**
- URL: https://calcheq.com
- Company/Site: `IXOM`
- Email: `nfish82@hotmail.com`
- Password: `{PASSWORD}`

**Approach:**
1. Work methodically through every section of the app. Don't skim — click every tab, try every button, open every form.
2. After each action, note what happened. If something looked wrong or felt clunky, write it down immediately.
3. When data you create is test-only (e.g. "TEST-QA-001" instruments), tag it clearly and delete it at the end. IXOM is a real customer — don't leave junk in their account.
4. Take screenshots of every bug you find. Include the URL, the exact click-path, and the browser console if there's an error.
5. Don't stop at the first bug — keep going and collect as many as you can in one pass.

**Full test plan (work through in order):**

**A. Auth & onboarding**
- [ ] Sign-in flow: enter company name → email + password. Check error messages for wrong company, wrong password.
- [ ] After sign-in, note the first thing you see. Does it orient a new user? Is the welcome banner still there for non-empty sites (shouldn't be)?
- [ ] Header: does it show the IXOM name and your user details correctly?
- [ ] Try the "Forgot password" link — does the email arrive?
- [ ] Sign out, then sign back in. Smooth?

**B. Dashboard (`/app`)**
- [ ] All 4 KPI cards: do the numbers look right? (Cross-reference by clicking through to /app/instruments).
- [ ] Instrument Health donut: current / due-soon / overdue / est-out-of-tolerance — do slices match the KPIs?
- [ ] Area compliance bars: do they render? Do percentages make sense?
- [ ] Upcoming 7-day list: are items clickable? Do they link to the right instrument detail page?
- [ ] Three attention cards: do they reflect real data?

**C. Instruments (`/app/instruments`)**
- [ ] List loads and paginates correctly.
- [ ] Filtering works: by area, by status, by criticality, by instrument_type.
- [ ] Sort columns: click each header.
- [ ] Bulk CSV export: click export. Does the CSV download? Open it and check columns.
- [ ] Create new instrument at `/app/instruments/new`:
  - Try all field types (dropdowns, number inputs, date pickers).
  - Leave required fields blank — do validation errors appear?
  - Save a full instrument (tag `TEST-QA-001`). Does it redirect to the detail page?
- [ ] Edit the instrument, change the description, save. Did the change persist?
- [ ] Open instrument detail: go through all 6 tabs (Overview, Calibration History, Trends, Smart Analytics, Audit Trail, Technical Data).

**D. Calibration workflow**
- [ ] From an instrument detail page, click "New Calibration" → `/app/calibrations/new/:id`.
- [ ] Fill out the form with 3–5 test points. Use as-found values that are clearly pass, clearly fail, and one marginal (0.8x tolerance).
- [ ] Check the live pass/fail calculation — does it match the rules? (fail > marginal > pass, worst point wins).
- [ ] Save as draft. Return. Reopen. Still a draft?
- [ ] Pick the technician from the dropdown (not free text). Confirm the helper line reads "Calibration certificate PDF is emailed to the selected technician on approval."
- [ ] Submit. Record should transition to **Submitted** (NOT auto-approved, regardless of your role). Check:
  - Confirmation toast appears
  - Record status is "submitted", not "approved"
  - Sidebar 📋 Calibrations badge increments
- [ ] Open `/app/calibrations` → Pending Approvals tab. The tab should auto-open when there are pending items. Approve/Reject buttons are visible for every signed-in user (no amber "cannot approve" banner). Click Approve.
  - Toast appears
  - Record moves to Activity Log with "approved" status
  - PDF cert arrives at BOTH the technician's email (the member selected on the form) AND the approver's email (collapsed to a single email if same person)
  - Open the PDF: header shows site name, correct branding, tag, technician, test points, results
- [ ] Try rejecting a submission. Confirm technician gets a rejection notice and record status becomes "rejected".
- [ ] Enter a SECOND calibration on a different date (say 90 days earlier). This gives drift data.
- [ ] Enter a THIRD calibration on another earlier date.
- [ ] Go back to instrument detail → Trends tab and Smart Analytics tab — do the charts now show data?

**E. CSV calibration import**
- [ ] Navigate to `/app/calibrations/import-csv`.
- [ ] Step through the Upload → Review → Confirm wizard. (If you don't have a real Beamex/Fluke CSV, you can skip or note that the wizard loaded and matched instruments correctly against fixtures.)

**F. Schedule (`/app/schedule`)**
- [ ] Technician Queue tab: does the queue load? Can you add an instrument to the queue?
- [ ] Planner tab: 12-week workload chart renders? Drag/drop if available?

**G. Calibrations page (`/app/calibrations`)**
- [ ] Activity Log tab: default 365-day range. Do recent submissions appear?
- [ ] Pending Approvals tab: does it show the live badge count? Any signed-in role (admin, supervisor, technician, planner) should see Approve/Reject buttons — test with a non-admin account to confirm there is no role gate and no amber "cannot approve" banner.

**H. Smart Diagnostics (`/app/diagnostics`)**
- [ ] All 3 tabs load: Recommendations / Drift Alerts / Repeat Failures.
- [ ] Drift Alerts: sparklines render? Projected failure dates present?

**I. Documents (`/app/documents`)**
- [ ] Upload a small test PDF. Does it save?
- [ ] Link it to an instrument. Does the link persist?
- [ ] Delete it.

**J. Reports (`/app/reports`)**
- [ ] Click each quick-export button: overdue / failed / compliance. Do CSVs download?
- [ ] All 4 report tabs load: Overdue, Upcoming, Failed, History.

**K. Settings (`/app/settings`)**
- [ ] Site info section: correct details?
- [ ] Profile section: can you change your display name?
- [ ] Change Password: works?
- [ ] Team Members (admin only): can you see members? Try inviting a fake user `test@example.invalid`. Does the form validate?
- [ ] Billing & Subscription: shows current plan + trial end date? "Manage subscription" link opens Stripe portal?

**L. Support (`/app/support`)**
- [ ] FAQ accordion — do all sections expand?
- [ ] Click the contact email link.

**M. Marketing site (log out first)**
- [ ] Navigate to every page: `/`, `/pricing`, `/how-it-works`, `/resources`, `/resources/:slug` (open a few articles), `/faq`, `/contact`, `/demo`.
- [ ] On `/contact`, fill out the pilot request form with test data (mark clearly as test). Does the confirmation page appear?
- [ ] On `/demo`, does the interactive demo preview load?

**N. Error handling & edge cases**
- [ ] Try navigating to a URL that should 404 (e.g. `/app/nonsense`). Does it handle gracefully?
- [ ] Open DevTools → Network tab. Are there any failing requests on page load? Any 500s? Any 403s that aren't expected?
- [ ] Open DevTools → Console. Are there any red errors or warnings?
- [ ] Try on a narrower viewport (mobile width ~375px). Does the sidebar collapse? Is the dashboard usable?

**O. Cleanup**
- [ ] Delete every test instrument, calibration, document, and pilot-form submission you created. Leave IXOM's real data untouched.

---

**Report format:**

Return a single markdown document with this structure:

```
# CalCheq QA Report — {date}
Tester: Claude (browser agent) | Environment: https://calcheq.com | Account: IXOM (nfish82@hotmail.com)

## Summary
- Pages tested: X
- Bugs found: X critical / X major / X minor / X polish
- Broken flows: [list]
- Overall impression: [1-2 sentences]

## Critical bugs (blocks a user from doing their job)
### BUG-001: [short title]
- **Where:** exact URL + click path
- **What I did:** step-by-step
- **What happened:** observed behaviour
- **What I expected:** expected behaviour
- **Screenshot:** [attached]
- **Console error (if any):** [paste]

## Major bugs (feature works but wrong, misleading, or data integrity risk)
[same format]

## Minor bugs (cosmetic, edge-case, or infrequent)
[same format]

## Polish / UX observations
- Things that weren't broken but felt confusing, slow, or could be better.

## What worked well
- Brief list of what felt solid. (Useful counterweight — stops the report being pure negativity.)

## Recommended roadmap priorities
Based on what I found, top 5 things to fix first, ranked.
```

**Non-negotiables:**
- IXOM account is real production data. Don't delete instruments that existed before you logged in. Don't approve/reject real pending calibrations — only ones you created yourself.
- If you get stuck (e.g. an email never arrives), don't invent results. Report the gap and move on.
- If you hit a 500, capture the full error response from the Network tab.
- Australian English throughout your report.
