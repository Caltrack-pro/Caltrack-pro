# Documentation Audit + Operations Manual — Prompt

A two-part workstream: (1) audit every existing doc, prune what's stale, and (2) build a single narrative `OPERATIONS.md` that covers how CalCheq actually runs day-to-day. Run in a fresh Cowork chat at the Caltrack-pro repo root.

Copy everything between the fences and paste as your **first message**.

---

```
You're going to do a deep documentation audit of the CalCheq project and produce one new file: a narrative operations manual that I can re-read after a long break and immediately get back up to speed. Tone: written for future-me, not for a new hire and not for Claude.

## Read these first (in this order)
1. `CLAUDE.md` — master reference. The file map, routes, models, conventions.
2. `DECISIONS.md` — architectural decisions and why.
3. `ROADMAP.md` — what's shipped vs pending.
4. `README.md` — current setup steps for a new developer.
5. `DOMAIN_SETUP.md` — DNS / domain ops record.
6. `docs/CLAUDE_WORKFLOW.md` — the rules-of-engagement doc I built earlier.
7. `docs/QA_TEST_PLAN.md` — the recurring QA prompt.
8. Every file under `docs/prompts/` — these are prompts I've used to build features (super-admin, mobile, UX fixes, etc.). They tell you what shipped recently.
9. `docs/business/`, `docs/specs/`, `docs/marketing/` — the longer-form supporting material.
10. The actual codebase: `frontend/src/`, `backend/`, `scripts/`. Skim, don't memorise — you only need this to verify whether the docs match reality.

## Phase 1 — Audit (no writing yet)

Build an inventory in chat (don't save it as a file — it's a working artefact for me to react to). For every Markdown file in the repo, list:

| File | Purpose (one sentence) | Audience | Last meaningful update | Verdict |
|------|------------------------|----------|------------------------|---------|

Verdict is one of: **keep**, **trim** (still relevant but bloated/duplicated), **merge** (overlaps with another file — name which one), **archive** (historical interest only — move to `docs/archive/`), **delete** (no longer relevant).

Then flag specifically:

1. **Duplications** — anywhere the same fact lives in two places (e.g. is "Demo is read-only" stated in three different files?). Pick a canonical home for each duplicated fact.
2. **Staleness** — references to files that no longer exist, features that were renamed, env vars that have changed, routes that were moved. Cross-reference each MD against the actual codebase.
3. **Gaps** — things that ARE in the code but aren't documented anywhere. Examples to look for: how Stripe webhooks are tested; how to manually approve a pilot from the database; how to recover if Railway loses its build cache; what to do if Supabase Auth JWKS rotation breaks signin; how to roll back a bad deploy; what the recurring email digest does and when.
4. **Things only in chat history or scattered prompt files** — concepts that have been built but never written down in a stable place (impersonation guardrails, the calibration approval flow change, the documents bucket RLS shape, etc.).

Pause after Phase 1 and wait for my response. I'll either approve the verdicts wholesale or push back on individual ones.

## Phase 2 — Trim & consolidate (after I sign off Phase 1)

Execute the verdicts:
- Files marked **trim**: cut to the verdict. Do not delete — edit in place.
- Files marked **merge**: copy the still-useful content into its new home, then delete the old file.
- Files marked **archive**: move to `docs/archive/` with no edits.
- Files marked **delete**: delete.
- ROADMAP.md specifically: collapse anything older than this calendar quarter into a single rollup line per quarter ("Q1 2026: Supabase Auth migration, Stripe integration, marketing site shipped"). Keep the current quarter's detail.
- CLAUDE.md specifically: grep for references to renamed/moved/deleted files (after the cleanup) and update or remove them.

Commit this phase as one commit: "docs: trim and consolidate MD files".

## Phase 3 — Build OPERATIONS.md

Create `docs/OPERATIONS.md`. Audience: future-me, six months from now, after a long break. Tone: plain English, the way a thoughtful colleague would walk me through the business if they were handing it back. Australian spelling. No marketing voice.

Structure (use these as the actual section headings):

### What CalCheq is
- One paragraph: what the product does, who buys it, current pricing, current customer count and pilot count. Pull real numbers from the database via Supabase MCP — don't guess.
- One paragraph: the founding story / why this exists, in two sentences. Keep it factual.

### The architecture in one diagram
- A simple ASCII (or Mermaid) diagram showing: browser → Vercel-style React SPA → FastAPI on Railway → Supabase Postgres + Auth + Storage. With Stripe and Resend as side services. One page. Resist the urge to over-detail.

### How the system works (end-to-end flows)
For each of these, write a numbered walkthrough in plain English. No code. Just the story.
1. A new user signs up self-service from the marketing site.
2. A pilot fills out the contact form and gets approved.
3. A technician records a calibration → submits it → an admin approves it → a PDF gets emailed.
4. A customer's trial expires. What happens at exactly the right moment?
5. A super-admin impersonates a customer site to debug an issue.
6. A site cancels their subscription.
7. A field tech opens the mobile app, scans a QR tag, takes a calibration photo.

### Where things live
- A short paragraph for each of: code (frontend + backend), data (Supabase, what tables matter), storage (the two private buckets), secrets (Railway env vars + the password manager), domain (Cloudflare or wherever DNS is), email (Resend), payments (Stripe), the codebase (GitHub repo).
- For each, name the URL, the dashboard, and the credential location. Never write the credential value itself.

### The runbook — things you'll be asked to do
For each of the following, give a numbered procedure. Where it's a SQL query or shell command, include it inline. Where it's clicking through a UI, name the exact path.
1. Approve a pilot manually from the database (when the contact form approval link doesn't work).
2. Extend a customer's trial by N days.
3. Override a customer's plan without charging them.
4. Pause/resume a customer's subscription.
5. Refund a Stripe charge.
6. Reset a user's password (when the email reset doesn't reach them).
7. Add a new super-admin email to the allowlist.
8. Manually approve a calibration in the database (last-resort if the UI is broken).
9. Investigate why a calibration PDF didn't send.
10. Investigate why a Stripe webhook didn't fire.
11. Roll back a bad Railway deploy.
12. Rotate a key (Supabase service role, Stripe secret, Resend API).

### Troubleshooting by symptom
For each common symptom, a short flowchart of what to check.
- "Customer says they can't sign in"
- "Customer says calibration PDF didn't arrive"
- "I'm getting 500s on /api/dashboard/recommendations"
- "Stripe webhook isn't updating the subscription"
- "Mobile app crashes on startup after a deploy"
- "Production site shows a blank screen"
- "A user is reporting they see another site's data" (this one is highest priority — escalate immediately)
- Add any others you spot in the codebase that are likely to break.

### External dependencies
Table of every third-party service CalCheq depends on. Columns: service, what it does, monthly cost (real numbers from billing if you can find them; otherwise estimate), what breaks if it disappears, where the credentials live.

### The scary list
Actions that need a deep breath before clicking. Examples:
- Deleting a customer site (cascades through instruments, calibrations, documents)
- Force-pushing to main
- Running a destructive migration without a backup
- Changing the SUPABASE_JWT verification key
- Touching anything in the auth.users table directly
- Pausing the Railway service

For each, write one sentence on the consequence and one sentence on what to do instead if you can.

### Money & business operations
- Where revenue lives (Stripe → bank).
- The subscription tiers and what each includes.
- What free pilots get vs paid customers.
- How to issue a refund vs how to issue a credit.
- The pricing model in AUD with current prices.

### Roadmap context (high level)
- One paragraph on where the product is going next (pull from ROADMAP.md "Next" section).
- One paragraph on what's been deliberately deferred and why (link to DECISIONS.md sections where relevant).

### When this document is wrong
A short closing section: how to update OPERATIONS.md when you discover something has changed. Include the schedule for the quarterly review.

## Phase 4 — Maintenance plumbing

After OPERATIONS.md is in place:
1. Add a line to CLAUDE.md pointing future-Claude at OPERATIONS.md as the human-readable counterpart.
2. Add a line to README.md saying "If you're new and want the full picture, read docs/OPERATIONS.md".
3. Use the `schedule` skill (or just leave a clear note in OPERATIONS.md) to remind me to do a quarterly audit.

Commit this as one commit: "docs: add OPERATIONS.md operating manual + maintenance plumbing".

## Guardrails
- Don't invent facts. If you're not sure whether something is true, check the code or the database. If you still can't tell, leave a `TODO(Nate)` comment in the doc and flag it back to me.
- Australian English throughout.
- Don't pad. If a section is two sentences, leave it at two sentences.
- Don't include code snippets longer than 5 lines unless they're a literal copy-paste-able runbook command. Long code snippets belong in CLAUDE.md or in the codebase, not in the operations manual.
- Don't write OPERATIONS.md for a new employee or a buyer. Write it for me, in six months, after I've forgotten things. That framing changes the level of detail.
- Don't push commits. I'll review and push manually.

## How to work
1. Phase 1 first. Stop and wait for my sign-off before phase 2.
2. After my sign-off, do phases 2 → 3 → 4 in order, with a commit at the end of each.
3. Use the Supabase MCP for any data you need to look up live (customer count, pricing, subscription states).
4. Use Read tool aggressively. Don't summarise from memory.

## What I'll do after you finish
- Read OPERATIONS.md end-to-end and tell you what's wrong, missing, or unclear.
- Set the quarterly review reminder.
- Push the commits.
```

---

## After it finishes

1. Sit down somewhere quiet and read OPERATIONS.md straight through. Time how long it takes — if it's under 20 minutes you've got the right depth; if it's an hour you over-wrote it and should ask for a trim pass.
2. Skim the runbook section against the actual product — try one of the procedures (e.g. "extend a trial") and confirm the steps work as written.
3. Set the quarterly reminder. Calendar invite to yourself titled "Audit OPERATIONS.md — what's stale?"
4. Print a copy. Honestly — keep a paper copy in your desk drawer. The day production goes down hard, you don't want to be SSHing into Railway from your phone trying to remember what to grep for.
