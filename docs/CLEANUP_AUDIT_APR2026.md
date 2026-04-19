# Calcheq — File & Context Audit
*Produced: 19 April 2026 — for your review before any cleanup action is taken.*

This audit covers four goals: reducing Claude context load, eliminating stale/duplicate information, improving folder structure, and fixing inaccuracies in the files Claude reads first (CLAUDE.md, DECISIONS.md, ROADMAP.md).

---

## 1. Executive summary

The project has accumulated three classes of problem:

1. **Duplicate or superseded files** still living alongside current ones (two Sales One-Pagers, three seed scripts, two pre-sync handoff/prompt docs).
2. **Stale content inside otherwise-current docs** — most importantly, CLAUDE.md still claims the Demo site is read-only (your project instructions say to change it) and still lists legacy `.jsx` files as "existing but redirecting" when their routes were removed from App.jsx.
3. **Context inflation** — Claude loads CLAUDE.md (360 lines) + your Cowork project instructions (~40 lines) on every turn, with the Session Handoff (341 lines) often pulled in too. Roughly 40–50% of that is duplicated between the files.

The cleanup below is safe: everything I propose deleting is either (a) tracked in git so it can be restored, (b) generated, or (c) explicitly marked SUPERSEDED in its own header.

---

## 2. Files to DELETE (with reasoning)

| File | Size | Reason |
|---|---|---|
| `CalCheq Chat Instructions.md` | 29 lines | Near-identical to the Cowork project instructions Claude already loads. Keeping it duplicates context for zero benefit. |
| `CalCheq Opening Prompt.md` | 29 lines | One-shot prompt for starting the previous chat. References a `git push` that has already happened. Pure history. |
| `Sales One-Pager.html` (root) | 21 KB | Duplicate of `Documents/CalCheq Sales One-Pager.html` (contents differ — the Documents copy is newer and branded "CalCheq"; the root copy still says "Caltrack"). Keep the Documents version. |
| `seed_demo_data.sql` | 1,583 lines | Its own header reads: **"⚠️ SUPERSEDED — DO NOT RUN"**. Replaced by `seed_riverdale_demo.sql`. Self-declared dead file. |
| `frontend/src/pages/Alerts.jsx` | — | CLAUDE.md lists it as "legacy, redirect only". App.jsx has **zero references** to it. Dead code. |
| `frontend/src/pages/PendingApprovals.jsx` | — | Same. Dead code. |
| `frontend/src/pages/BadActors.jsx` | — | Same. Dead code. |
| `frontend/src/pages/Profile.jsx` | — | Same. Dead code. |
| `.claude/worktrees/goofy-poitras-63df22/` | 3.5 MB | Stale git worktree from a previous Claude session. |
| `.claude/worktrees/keen-faraday/` | 5.0 MB | Same. |
| `backend/__pycache__/` | — | Python bytecode cache. Already in `.gitignore`. Generated at runtime. |
| `backend/routes/__pycache__/` | — | Same. |

**Subtotal:** ~12 MB disk saved, ~2,000 lines of markdown/code removed from the project, 4 dead source files removed.

**NOT deleting** (but worth flagging):
- `Calcheq notepad.md` — contains live credentials (Supabase password, GitHub password, pooler URL). Correctly gitignored, so it isn't leaking to the repo. **Recommendation:** move these credentials into a password manager (1Password, Bitwarden) and delete this file. Plaintext passwords on disk inside OneDrive is a measurable risk.

---

## 3. Files to MOVE (reorganisation)

The root folder is currently mixing source code, operational scripts, business docs, and assets. Proposed flatter structure:

```
Caltrack-pro/
├── CLAUDE.md                   ← master reference (Claude reads first)
├── DECISIONS.md                ← architecture decisions
├── ROADMAP.md                  ← what's done + what's next
├── README.md                   ← developer setup
├── DOMAIN_SETUP.md             ← keep, it's a one-time ops record
├── .env.example                ← keep
├── .gitignore                  ← keep
├── nixpacks.toml, railway.json ← keep
│
├── backend/                    ← unchanged
├── frontend/                   ← unchanged
│
├── scripts/                    ← NEW folder, moves from root:
│   ├── seed_instruments.py             (was: seed_instruments.py)
│   ├── seed_riverdale_demo.sql         (was: seed_riverdale_demo.sql)
│   ├── import_instruments.py           (was: 3. Import instruments.py)
│   └── caltrack_import_TEMPLATE.csv    (was: 2. Caltrack import TEMPLATE.csv)
│
├── docs/                       ← NEW folder, moves from root + Documents/:
│   ├── business/
│   │   ├── Calcheq_Business_Plan.docx
│   │   ├── CalCheq 30-Day Pilot Offer.docx
│   │   ├── CalCheq Sales One-Pager.html
│   │   └── MEX to Calcheq Migration Guide.docx
│   ├── specs/
│   │   ├── CalCheq Compliance & Criticality Ranking Spec.docx
│   │   ├── CalCheq Import Wizard & Migration Guide.docx
│   │   └── CalCheq Mobile Field Access Report.docx
│   └── marketing/
│       └── CalCheq SEO Audit Report.docx
│
└── assets/                     ← NEW folder, moves from root:
    ├── branding/
    │   └── calcheq-logo-horizontal-lockup.svg    (was: Branding and logo/)
    ├── screenshots/
    │   └── (13 files)                             (was: Real website screenshots/)
    └── calibration-pdfs/
        └── Plan for uploading IXOMS Cal records.txt  (was: Calibration PDF's/)
```

**Why this helps:** Claude can infer context from folder names (`scripts/` = operational, `docs/` = reference, `assets/` = non-code). The numbered prefixes on `2. Caltrack import...` and `3. Import instruments.py` break shell globs and look like half-numbered lists — dropping them makes the files easier to reference.

**If you'd rather leave `Documents/` and `Branding and logo/` where they are** — fine, the win here is smaller than the delete list above. I'd still move the three seed/import scripts into `scripts/` because they clutter the root.

---

## 4. CLAUDE.md — specific corrections needed

Three factual errors in the current CLAUDE.md that will mislead Claude on every session:

| Line | Current text | Issue | Fix |
|---|---|---|---|
| ~8 (Code Rules via project instructions) | "Demo site ('Demo') is read-only" | Your Cowork project instructions now say **"please change it so that it is not"** — direct contradiction. | Either update CLAUDE.md to match the new policy, OR remove that conflicting line from the project instructions. Pick one source of truth. |
| ~52 (File Map) | "Legacy pages (files still exist but routes now redirect to above): Alerts.jsx, PendingApprovals.jsx, BadActors.jsx, Profile.jsx" | Files exist but **App.jsx has no imports for any of them** — the redirects are in App.jsx directly. The files are orphans. | Delete the files, then delete this paragraph from CLAUDE.md. |
| ~86 (Marketing routes) | No entry for `/demo` (DemoPage.jsx) | Session Handoff confirms `/demo` route exists and is live. Missing from CLAUDE.md. | Add `/demo → DemoPage` to the marketing routes table. |

Also worth adding to CLAUDE.md:
- The auth folder has a `AuthCallback.jsx` (handles email-confirm → Stripe checkout) that isn't in the file map.
- `contact.py` and `admin.py` backend routes are listed — good — but `AuthCallback` is missing on the frontend side.

---

## 5. ROADMAP.md — possibly stale

The "Completed 17 April 2026" block references a PDF certificate auto-email feature. Check this is still the latest entry — if work shipped on 18 April, it belongs in this file, not only in Session Handoff section 11.

Session Handoff section 11 lists six bug fixes dated 18 April ("Smart Analytics 500, Trends submitted records, PDF cert on submit, Drift Analysis rename, Activity log 365-day default"). If these are deployed, they belong in ROADMAP.md's "Completed" list. If they aren't, they belong in ROADMAP's "Next up".

---

## 6. Claude-context optimisation recommendations

These are the highest-leverage changes for reducing token usage and improving accuracy:

### 6a. Pick ONE source of truth for code rules
Right now the same rules ("Never create new files when editing existing ones will do", "Australian English", "Demo is read-only", etc.) live in THREE places:
- Your Cowork project instructions (loaded every turn)
- `CalCheq Chat Instructions.md` (a hint Claude should read it)
- `CLAUDE.md` (contains all the rules again)

**Fix:** Keep rules in CLAUDE.md only. Shorten Cowork project instructions to a single paragraph: *"Read CLAUDE.md before making any changes. It's the master reference. Read DECISIONS.md and ROADMAP.md before suggesting features."* Delete `CalCheq Chat Instructions.md`.

### 6b. CLAUDE.md is doing too much — split by rate of change
CLAUDE.md currently contains: file map (changes often), routing (changes often), data models (rarely changes), auth system (rarely changes), pass/fail rules (never changes), env vars (rarely changes), pending work (changes constantly).

The constantly-changing parts go stale. Consider splitting:
- **CLAUDE.md** → just the stable contract (tech stack, data models, pass/fail rules, auth design, colour conventions, rules Nate has set). Goal: rarely edited.
- **ROADMAP.md** → continues to hold "pending work" and completion log.
- **File map** → keep in CLAUDE.md (Claude genuinely uses this) but trim the per-file descriptions. Claude can read the actual file if it needs detail.

### 6c. Session Handoff docs should not survive into the next chat
Every time a session ends, a 341-line handoff gets written. Next session, Claude is told to read it, which duplicates everything it would learn from CLAUDE.md + ROADMAP.md + git log. Drop the handoff doc pattern entirely — update CLAUDE.md and ROADMAP.md at end-of-session instead (which is already one of your rules).

### 6d. Keep credentials in a password manager, not in the repo
`Calcheq notepad.md` is gitignored, but it still loads into your computer's OneDrive sync. Passwords should not sync. Move to 1Password / Bitwarden / browser password manager and delete the file.

---

## 7. Proposed execution order (if approved)

Phase 1 — safe, zero-risk (I can do these without further approval once you give the go-ahead):
1. Delete `__pycache__` directories.
2. Delete `.claude/worktrees/` contents.
3. Delete `seed_demo_data.sql` (self-marked SUPERSEDED).
4. Delete `Sales One-Pager.html` (root duplicate — Documents/ copy stays).
5. Delete `CalCheq Chat Instructions.md` and `CalCheq Opening Prompt.md`.
6. Delete the 4 legacy `.jsx` files (Alerts, PendingApprovals, BadActors, Profile).

Phase 2 — content fixes to CLAUDE.md and ROADMAP.md:
7. Correct the 3 inaccuracies in CLAUDE.md (§4 above).
8. Decide: is Demo read-only or not? Update one file or the other to match.
9. Move 18 April bug-fix entries from Session Handoff into ROADMAP.md "Completed" if deployed.

Phase 3 — folder reorganisation (a commit you'll want to review carefully):
10. Create `scripts/`, `docs/`, `assets/`.
11. Move files per §3.
12. Update any in-code references (CLAUDE.md file paths, README instructions).

Phase 4 — consolidation:
13. Archive or delete `CalCheq Session Handoff - April 2026.md` after its content is merged into CLAUDE.md + ROADMAP.md.
14. Move credentials out of `Calcheq notepad.md` into a password manager, then delete the file.

---

## 8. Open questions for you

- **Demo-site writability** — does the new rule in your project instructions ("please change it so that it is not") mean you now want Demo to be writable? That's a meaningful product change (every `assert_writable_site` guard gets removed, and demo data starts being mutated by random visitors). Worth confirming before we act on it.
- **Session Handoff** — destroy it, or keep the April 2026 version in `docs/archive/` as a snapshot? My recommendation: destroy, because CLAUDE.md should hold anything worth keeping.
- **Documents folder** — anything in there that's actively stale or never used? (The four .docx specs are dated 12 April. Worth a skim.)

Reply with which phases to proceed with, and I'll execute. Or pick items out of the lists above and I'll scope to those.
