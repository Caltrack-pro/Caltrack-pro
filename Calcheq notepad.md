# CALCHEQ — Credentials & Notes

> ⚠️ Keep this file private. Do NOT commit to git. Contains live credentials.

---

## Service Credentials

**Supabase**
- Password: Caltrackprosoftware
- Direct DB URL: postgresql://postgres:[26Q0qDdb9uZTSOUu]@db.qdrgjjndwgrmmjvzzdhg.supabase.co:5432/postgres

**GitHub**
- User: Caltrack-pro
- Password: Employer222@

**Railway**
- DB URL (pooler): postgresql://postgres.qdrgjjndwgrmmjvzzdhg:Caltrackprosoftware@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
- Domain: caltrack-pro-production.up.railway.app

**CalTrack App — IXOM test account**
- Site: IXOM Laverton Chloralkali
- Password: 166180DohertysRd

**Microsoft 365**
- Admin: Calcheq@calcheq.onmicrosoft.com / Calmanager2026!
- Email: info@calcheq.com / Calmanager2026!

**Resend**
- Login: info@calcheq.com / Calmanager2026!
- API key: re_QpUredJ5_7P9EQxNvvq4qTcTXsgwj4GgP

**Domain:** calcheq.com (Cloudflare)
- Username: nfish82@hotmail.com / Caltrackpro2026!

**Demo account**
- Email: demo@calcheq.com / CalcheqDemo2026

---

## TO DO LIST

* Before finishing each session: **Update the docs before we finish**
* Check functionality of PDF certificate generator
* Run ChatGPT third-party critique prompt (see below)
* Create blog posts as Word docs for the website
* Browse LinkedIn: popular posts on importance of calibrated instruments
* Browse LinkedIn: posts on safety instrument systems and plant integrity
* Write blog post: calibration procedure for a typical instrument
* Replace fake "use case" on website with real sourced information
* Generate a PowerPoint presentation showcasing the product
* PDF calibration records import (see Calibration PDFs folder for plan)

---

## Stripe (not yet set up — next major task)
- Integrate Stripe Checkout for Starter / Professional / Enterprise plans
- Add subscription_status to sites table
- Handle webhooks: subscription created/updated/deleted
- Add billing page at /app/settings/billing
- Gate /app/* behind active subscription

---

## ChatGPT Third-Party Critique Prompt

You are a senior SaaS product reviewer, industrial software expert (E&I / asset management systems), UX/UI specialist, and B2B go-to-market strategist.

Your role is to act as a **highly critical third-party evaluator** of a software product called **Calcheq** — an industrial instrumentation calibration management platform.

Do NOT give surface-level feedback. Your job is to rigorously analyse, challenge, and improve the product as if you were:
- a potential customer (E&I technician / reliability engineer)
- a site manager responsible for compliance and uptime
- a software investor evaluating commercial viability

## Product Context
Calcheq was originally built to solve a real problem at an industrial site (IXOM), where calibration data was stored in Excel sheets uploaded to a CMMS (MEX), with no effective tracking of calibration due dates, instrument drift, or historical trends.

The product has evolved into a marketable SaaS solution for industrial clients.

## Structure Your Response As Follows

1. First Impression (Critical) — trustworthy? industrial-grade? valuable?
2. Core Value Proposition — is the problem/solution clear within 10–15 seconds?
3. Website & Messaging Review — headline, positioning, trust signals, CTAs
4. Product Feature Review — instrument register, calibration workflow, pass/fail, drift, dashboards, alerts, reporting
5. UX/UI & Workflow Analysis — ease of use for technicians, navigation, mobile/tablet
6. Industrial Practicality Test — shutdown environments, dirty data, rushed technicians, compliance audits
7. Competitive Positioning — vs Excel+CMMS, SAP/Maximo/MEX, niche calibration software
8. High-Impact Improvements (Top 10) — ranked by impact, ease, commercial leverage
9. Monetisation & Go-To-Market — pricing model, ideal customer, fastest path to first paying customers
10. Product Vision Upgrade — what would make this category-leading?
11. Brutal Truth Section — what will stop this from succeeding? what must be fixed immediately?

End with: **"If You Only Fix 3 Things — Fix These"**
