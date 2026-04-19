# Working with Claude across Chat, Cowork, and Code

How to start new conversations so Claude loads the minimum context needed, reads from a single source of truth, and stays accurate across sessions.

---

## The four canonical files Claude reads first

Everything Claude needs to know about CalCheq lives in exactly four root-level files:

| File | Purpose | When to edit |
|------|---------|---------------|
| `CLAUDE.md` | Master reference: file map, routing, data models, auth, env vars, pass/fail rules, Nate's rules | Whenever routing, models, or file structure changes |
| `DECISIONS.md` | Why we chose Supabase Auth, why teal/navy, etc. | When a new architecture decision is made (rarely) |
| `ROADMAP.md` | What's done (dated log) + what's next | End of every session |
| `README.md` | Developer setup for a new contributor | When setup steps change |

**Don't create** `SESSION_HANDOFF.md`, `OPENING_PROMPT.md`, `CHAT_INSTRUCTIONS.md`, or per-chat state files. If a fact is worth keeping between sessions, it belongs in one of the four files above. If it isn't, it's noise.

---

## Rule-of-one: where project rules live

Rules like "Australian English", "Demo is read-only", "calEngine.js ↔ calibration_engine.py must stay in sync" should live in **exactly one place**: `CLAUDE.md`. Do not also restate them in your Cowork project instructions, or in the Claude Code `CLAUDE.md` at a different level, or in individual chat system prompts.

When rules live in multiple places they drift. (See the Demo-writable contradiction that prompted this cleanup.)

---

## Starting a new conversation: product by product

### Claude.ai Chat (web/mobile)

Chat has no file access. Use it for planning, brainstorming, copy review, or one-off questions — not for multi-file code changes.

**Starting prompt (copy/paste):**
> I'm working on CalCheq, an industrial calibration SaaS (calcheq.com). I'll paste `CLAUDE.md` below for context. Help me think through [specific question].
>
> [paste CLAUDE.md contents]

**Do:** paste CLAUDE.md + the 1–2 specific files you want to discuss.
**Don't:** paste ROADMAP.md or DECISIONS.md unless they're directly relevant — CLAUDE.md already links to them conceptually.

### Cowork (this product)

Cowork has direct folder access. Best for content creation (docs, marketing copy), multi-file edits, and long research/synthesis tasks.

**Project instructions (what you've configured):** should be ~5 lines. Something like:
> Read `CLAUDE.md` in the project root before making any code changes. It's the master reference (file map, routing, data models, auth, env vars). Also read `DECISIONS.md` for architecture and `ROADMAP.md` for what's done vs pending. Australian English and AUD throughout. Use the Supabase MCP for database queries.

That's it. Anything more duplicates content that's already in CLAUDE.md and inflates every turn's context.

**Before you hit send on a new chat:** click into the project's three-dot menu → project instructions → verify you're not restating rules that already live in CLAUDE.md.

**Starting prompt for a new Cowork chat:** nothing special needed — the project instructions run automatically. Just state what you want:
> Help me fix [bug] in [file]. Read CLAUDE.md first.

**Ending a session:** say `end session`. The project instructions already tell Claude to update CLAUDE.md when you do this. Remember to also say *"update ROADMAP.md with what shipped today"* if anything did.

### Claude Code (CLI, for dev work)

Claude Code auto-loads `CLAUDE.md` from the repo root on every turn. Keep it lean — every extra line costs tokens on every interaction.

**Starting a new session:**
```
cd ~/Caltrack-pro
claude
```

Claude Code finds `CLAUDE.md` automatically. Your first message can be as simple as:
> Fix the 500 error in /api/drift-analysis. Check backend/routes/instruments.py.

Don't re-explain the project. CLAUDE.md has already loaded.

**Do:** use `claude commit` at end of a chunk of work — it reads the diff and writes a useful commit message.
**Do:** use slash commands like `/review` and `/security-review` before pushing.
**Don't:** paste large files into the prompt; Claude Code reads them directly from disk, which is cheaper.

---

## How to keep CLAUDE.md accurate (the context-accuracy problem)

CLAUDE.md goes stale because it contains rapidly-changing info (file maps, routing tables) alongside stable info (data models, pass/fail rules). Three habits to keep it honest:

1. **Grep test.** Before every release, run `grep -n "Alerts.jsx\|PendingApprovals.jsx\|legacy" CLAUDE.md` to find references to files that may have moved or been deleted. If a grep turns up hits for something you deleted, fix CLAUDE.md.

2. **"End session" must update CLAUDE.md.** When you say `end session`, Claude should scan the current session's file changes and update CLAUDE.md's file map and routing table. This is already in your project instructions. Hold Claude to it.

3. **Delete when in doubt.** If you're not sure a file, rule, or paragraph in CLAUDE.md is still correct, delete it. Claude can always read the actual code to find out. Stale docs are worse than no docs.

---

## Minimising context usage (token cost)

Each product loads CLAUDE.md on every turn. Current size is 360 lines; every line costs ~8–15 tokens × every turn. Some ways to cut:

- **Trim per-file descriptions in the file map.** "`main.py` — FastAPI entry point, CORS, router registration" is fine. A two-sentence description of each component isn't — Claude reads the file if it needs that much detail.
- **Let git history carry the "what changed" burden.** ROADMAP.md shouldn't list every commit — just milestones and "what's next".
- **One table, not three.** If a piece of information exists as a file-map list AND a routing table AND a verbose paragraph, pick one format and delete the others.
- **Ruthlessly prune ROADMAP.md quarterly.** Everything older than 3 months can move to a single-line rollup ("Q1 2026: Supabase Auth migrated, Stripe integrated, marketing site shipped") unless it's a decision with ongoing implications.

---

## Credentials and secrets (quick reminder)

`Calcheq notepad.md` still contains live credentials (Supabase DB password, GitHub password, pooler URL). It's gitignored, so it isn't in the repo — but it's plaintext in OneDrive which is syncing to Microsoft's servers.

**Recommended:** move all credentials into a password manager (1Password, Bitwarden, Apple Keychain, browser's password manager — any of them). Then delete `Calcheq notepad.md`. You'll still have CLAUDE.md for the non-secret env-var names, which is what Claude actually needs.

---

## Quick reference: the new folder map

```
Caltrack-pro/
├── CLAUDE.md          ← read first every session
├── DECISIONS.md       ← architecture decisions
├── ROADMAP.md         ← what's done + what's next
├── README.md          ← setup for a new dev
├── DOMAIN_SETUP.md    ← one-time ops record (can move to docs/ later)
│
├── backend/           ← FastAPI + routes + alembic
├── frontend/          ← React + Vite + Tailwind
│
├── scripts/           ← seed + import scripts (moved from root)
├── docs/              ← .docx specs, business plan, marketing reports
│   ├── business/
│   ├── specs/
│   └── marketing/
├── assets/            ← logos, screenshots, PDFs
│   ├── branding/
│   ├── screenshots/
│   └── calibration-pdfs/
│
├── nixpacks.toml      ← Railway build
└── railway.json       ← Railway config
```

Root-level noise removed: old session handoff, duplicate one-pager, superseded seed SQL, redundant prompt files, orphaned legacy page JSX files, pycache. See `ROADMAP.md` entry for 19 April 2026 for the full list.
