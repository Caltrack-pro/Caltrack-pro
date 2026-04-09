# **CALTRACK-PRO**



**Supabase**

Supabase password - Caltrackprosoftware

postgresql://postgres:\[26Q0qDdb9uZTSOUu]@db.qdrgjjndwgrmmjvzzdhg.supabase.co:5432/postgres



**GitHub** 

user - Caltrack-pro

password - Employer222@



**Railway**

Databas URL - postgresql://postgres.qdrgjjndwgrmmjvzzdhg:Caltrackprosoftware@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

Railway secret key - caltrack-super-secret-key-2026-change-this

Railway domain - caltrack-pro-production.up.railway.app



**CalTrack-pro** 

User - IXOM Laverton Chloralkali

Pass 166180DohertysRd



User - Demo



**TO DO LIST** 

* Unlock GitHub account
* Secure sign in between GitHub and Supabase
* Add GitHub and supabase as connectors 
* Post below prompt to add pdf generation
* Before finishing each session "**Update the docs before we finish.**"
* Check functionality of PDF creator
* Optimize skills/connectors/plugins
* Run Chat GPT third party critique prompt



**NEXT PROMPT**

Resolved thankyou. Some things i would like you to complete for me;

1\. When it says "your name" the example is my full name. please change this to John Smith instead.

2\. I think it would be great if you had the opportunity to generate a calibration report from the calibrations that are performed. I want you to do some extensive research externally and look at Instrumentation calibration documents and add the functionality to 1. Generate a calibration report from a single calibration and 2. Generate a calibration report from multiple calibrations (selected). The multi calibration report will have the trend graphics that you have in the trends tab. I want these calibration reports to be great so that if a client requests them they can be forwarded on in a report or if the calibration records are required to be kept in a seperate system then they can add the one page single calibration document



**Chat GPT third party critique prompt**

You are a senior SaaS product reviewer, industrial software expert (E\&I / asset management systems), UX/UI specialist, and B2B go-to-market strategist.



Your role is to act as a \*\*highly critical third-party evaluator\*\* of a software product called \*\*Caltrack Pro\*\* — an industrial instrumentation calibration management platform.



Do NOT give surface-level feedback. Your job is to rigorously analyse, challenge, and improve the product as if you were:

\- a potential customer (E\&I technician / reliability engineer)

\- a site manager responsible for compliance and uptime

\- a software investor evaluating commercial viability



\## Product Context

Caltrack Pro was originally built to solve a real problem at an industrial site (IXOM), where:

\- calibration data was stored in Excel sheets

\- files were uploaded to a CMMS (MEX)

\- there was no effective tracking of:

&#x20; - calibration due dates

&#x20; - instrument drift or degradation

&#x20; - historical calibration trends

\- no centralised, intelligent system existed



The product has since evolved into a \*\*marketable SaaS solution for industrial clients\*\*.



\## Your Task

You will review the product and provide a \*\*deep, structured critique and optimisation strategy\*\*.



\## Instructions



\### Step 1 — Assume Full Product Access

Assume you have access to:

\- the website (landing page, marketing content)

\- the application UI

\- dashboards and features

\- calibration workflows

\- reporting

\- user experience

\- navigation

\- onboarding



If specific details are missing, make reasonable assumptions based on best-in-class industrial software.



\---



\## Structure Your Response as Follows



\### 1. First Impression (Critical)

\- What is your immediate perception of the product?

\- Does it feel:

&#x20; - trustworthy?

&#x20; - industrial-grade?

&#x20; - valuable?

\- Would a plant manager or engineer take this seriously?



\---



\### 2. Core Value Proposition

\- Is the problem clearly defined?

\- Is the solution compelling?

\- Is the value obvious within 10–15 seconds?

\- What’s missing or unclear?



\---



\### 3. Website \& Messaging Review

Critique:

\- headline

\- positioning

\- clarity of problem/solution

\- technical credibility

\- trust signals (case studies, logos, etc.)

\- calls to action



Provide:

\- exact rewritten headline

\- improved messaging framework



\---



\### 4. Product Feature Review

Evaluate:

\- instrument register

\- calibration entry workflow

\- pass/fail logic

\- drift tracking

\- dashboards

\- alerts

\- reporting

\- search/filtering



For each:

\- what works

\- what doesn’t

\- what’s missing

\- how to improve



\---



\### 5. UX/UI \& Workflow Analysis

Assess:

\- ease of use for technicians

\- speed of completing tasks

\- clarity of navigation

\- cognitive load

\- mobile/tablet usability



Provide:

\- specific UI/UX improvements

\- workflow optimisations

\- what should be simplified or removed



\---



\### 6. Industrial Practicality Test

Challenge the product against real-world conditions:

\- shutdown environments

\- dirty data inputs

\- rushed technicians

\- compliance audits

\- large asset bases



Highlight:

\- where it will fail

\- what must be improved for real-world adoption



\---



\### 7. Competitive Positioning

Compare Caltrack Pro to:

\- Excel + CMMS workflows (current baseline)

\- SAP PM / Maximo / MEX

\- niche calibration software



Explain:

\- where it wins

\- where it loses

\- how to position it uniquely



\---



\### 8. High-Impact Improvements (Top 10)

Provide the \*\*10 highest ROI improvements\*\* ranked by:

1\. impact on user value

2\. ease of implementation

3\. commercial leverage



\---



\### 9. Monetisation \& Go-To-Market Strategy

Recommend:

\- pricing model (per user, per asset, site license, etc.)

\- ideal target customer

\- fastest path to first paying customers

\- how to leverage the IXOM origin story



\---



\### 10. Product Vision Upgrade

If you were turning this into a category-leading product:

\- what would you add?

\- what would you remove?

\- what would make it a “must-have” system globally?



\---



\### 11. Brutal Truth Section

Give an honest, no-filter assessment:

\- what will stop this product from succeeding?

\- what feels weak or amateur?

\- what must be fixed immediately?



\---



\### Output Requirements

\- Be direct and critical (not polite for the sake of it)

\- Avoid generic advice

\- Give specific, actionable recommendations

\- Think like both an engineer AND a SaaS investor

\- Prioritise real-world usability and commercial success



\## Final Requirement

End with a section titled:



\### “If You Only Fix 3 Things — Fix These”































**Folder instructions**

\# CalTrack Pro — Project Master Reference



\## What This Project Is

CalTrack Pro is an industrial instrument calibration management web application.

It is a full-stack application with a React frontend and a Python FastAPI backend,

using a PostgreSQL database (via Supabase).



The app has two distinct parts:

1\. \*\*Marketing site\*\* — public-facing homepage, pricing, blog, FAQ, contact (no auth required)

2\. \*\*Calibration app\*\* — the actual tool, lives under /app/\* (currently ungated, auth planned)



\---



\## Tech Stack

\- Frontend: React 18 + Vite + Tailwind CSS

\- Backend: Python 3.11 + FastAPI

\- Database: PostgreSQL via Supabase (supabase.com), using PgBouncer pooler

\- Auth: localStorage-based user context (Supabase Auth migration is pending — see DECISIONS.md)

\- Charts: Recharts

\- Deployment: Local dev first (localhost:5173 frontend, localhost:8000 backend), then Railway.app



\---



\## Complete File Map



\### Frontend — src/App.jsx (router root)

All routes are defined here. Two layout trees: marketing (no sidebar) and app (with sidebar).



\### Frontend — src/pages/ (app pages, all live under /app/\*)

\- Dashboard.jsx          — main dashboard: stats, alerts, compliance by area, upcoming, bad actors

\- InstrumentList.jsx     — paginated/filterable instrument register

\- InstrumentForm.jsx     — create and edit instrument (shared form)

\- InstrumentDetail.jsx   — single instrument view with calibration history and trend charts

\- CalibrationForm.jsx    — enter calibration results (as-found / as-left test points)

\- Alerts.jsx             — overdue, due-soon, failed, consecutive-failure alerts

\- PendingApprovals.jsx   — supervisor approval queue for submitted calibration records

\- Reports.jsx            — compliance reporting and calibration history export

\- BadActors.jsx          — ranked list of instruments with repeated as-found failures



\### Frontend — src/pages/marketing/ (public pages, no /app prefix)

\- Landing.jsx            — homepage with hero, features, industries, testimonials, CTA

\- Pricing.jsx            — 3-tier pricing (Starter / Professional / Enterprise)

\- Blog.jsx               — article index with tag filters

\- BlogPost.jsx           — individual article page, content keyed by slug

\- FAQ.jsx                — accordion FAQ across 5 sections

\- Contact.jsx            — enquiry form with type selector



\### Frontend — src/components/

\- Layout.jsx             — app shell: wraps Sidebar + Header + <Outlet>

\- Sidebar.jsx            — left nav, user section, "Back to Website" link at bottom

\- Header.jsx             — top bar with sign-in modal (3-step: site → password → name+role)

\- Badges.jsx             — shared status/result badge components

\- Toast.jsx              — notification toast system

\- TrendCharts.jsx        — calibration trend charts (used in InstrumentDetail)

\- marketing/MarketingNav.jsx    — shared nav for all marketing pages

\- marketing/MarketingFooter.jsx — shared footer for all marketing pages



\### Frontend — src/utils/

\- userContext.js   — ALL user/site state: getUser, setUser, canEdit, ROLES, site password logic

\- api.js           — all API calls, every function accepts a `site` param for isolation

\- calEngine.js     — pass/fail/marginal calculation logic (mirrors backend rules)

\- formatting.js    — shared date and number formatting helpers



\### Backend — backend/

\- main.py               — FastAPI app entry point, CORS, router registration

\- models.py             — SQLAlchemy ORM models (Instrument, CalibrationRecord, CalTestPoint)

\- schemas.py            — Pydantic v2 request/response schemas

\- database.py           — Supabase/PostgreSQL connection via SQLAlchemy

\- auth.py               — authentication helpers

\- calibration\_engine.py — server-side pass/fail calculation (source of truth)

\- routes/instruments.py  — CRUD for instruments, accepts ?site= filter param

\- routes/calibrations.py — CRUD for calibration records, site filter via instrument join

\- routes/dashboard.py    — 5 dashboard endpoints (stats, alerts, compliance, upcoming, bad-actors)



\### Root-level scripts (Caltrack-pro/)

\- seed\_instruments.py              — populates 30 demo instruments for the "Admin" site

\- import\_instruments.py            — CSV bulk import script (MEX migration tool)

\- caltrack\_import\_TEMPLATE.csv     — template CSV with correct column headers and example rows



\---



\## Routing (complete)



\### Marketing routes (no sidebar/header)

| Path          | Component     | Notes                                      |

|---------------|---------------|--------------------------------------------|

| /             | Landing       | Homepage                                   |

| /pricing      | Pricing       | 3-tier pricing page                        |

| /blog         | Blog          | Article index                              |

| /blog/:slug   | BlogPost      | Full article, content stored in BlogPost.jsx |

| /faq          | FAQ           | Accordion FAQ                              |

| /contact      | Contact       | Enquiry form                               |



\### App routes (inside Layout with Sidebar + Header)

| Path                              | Component        | Notes                          |

|-----------------------------------|------------------|--------------------------------|

| /app                              | Dashboard        | index route                    |

| /app/instruments                  | InstrumentList   | accepts ?site=, ?calibration\_status= etc |

| /app/instruments/new              | InstrumentForm   | create mode                    |

| /app/instruments/:id              | InstrumentDetail | detail + history               |

| /app/instruments/:id/edit         | InstrumentForm   | edit mode                      |

| /app/calibrations/new/:instrumentId | CalibrationForm | new calibration for an instrument |

| /app/alerts                       | Alerts           |                                |

| /app/approvals                    | PendingApprovals |                                |

| /app/reports                      | Reports          |                                |

| /app/bad-actors                   | BadActors        | ranked failure list            |



\### Legacy redirects (old bookmarks still work)

/dashboard → /app | /instruments → /app/instruments | /alerts → /app/alerts

/reports → /app/reports | /approvals → /app/approvals



\---



\## User / Auth System (current — localStorage)



User state is stored in localStorage under key `caltrack\_user`.



\### User object shape

```js

{ siteName: "IXOM", userName: "John Smith", role: "technician" }

```



\### Site isolation mechanism

\- Sites are stored in localStorage under `caltrack\_sites` (array of {name, passwordHash})

\- Members stored under `caltrack\_members` (array of {siteName, userName, role})

\- On sign-in, `siteName` is written to the user object

\- All API calls pass `?site=siteName` as a query param

\- Backend filters `Instrument.created\_by == site` on every query

\- New instruments are stamped `created\_by = siteName` in InstrumentForm.jsx



\### Cross-component state sync

Custom DOM event `caltrack-user-change` fires on sign-in/out.

Dashboard.jsx and InstrumentList.jsx both listen for this and re-fetch data.



\### Role permissions

\- admin: full access

\- supervisor: read/write + approve calibration records

\- technician: read + create/edit calibration records (own until submitted). CAN edit instruments.

\- planner: read + edit scheduling fields

\- readonly: read only



`canEdit()` in userContext.js returns true for: admin, supervisor, planner, technician.



\### Demo account

\- Site name: "Admin" (no password)

\- Pre-seeded with 30 instruments via seed\_instruments.py

\- Mix of areas, instrument types, pass/fail states, overdue/current/due-soon



\---



\## Site Isolation — Backend



Every backend route that returns instruments or calibration data accepts `?site=` param.



\### instruments.py

```python

if site:

&#x20;   q = q.filter(Instrument.created\_by == site)

```



\### calibrations.py (joins to instruments)

```python

if site:

&#x20;   q = q.join(Instrument, CalibrationRecord.instrument\_id == Instrument.id)

&#x20;       .filter(Instrument.created\_by == site)

```



\### dashboard.py

```python

def \_active\_instruments\_query(db, site=None):

&#x20;   q = db.query(Instrument).filter(Instrument.status.in\_(\_ACTIVE\_STATUSES))

&#x20;   if site:

&#x20;       q = q.filter(Instrument.created\_by == site)

&#x20;   return q

```



\---



\## Core Data Models



\### Instrument Record (instruments table)

\- id (UUID, primary key)

\- tag\_number (string, unique) — e.g. PT-1023A

\- description (string) — service description

\- area (string) — plant area / location

\- unit (string) — plant unit

\- instrument\_type (enum) — pressure/temperature/flow/level/analyser/switch/valve/other

\- manufacturer (string)

\- model (string)

\- serial\_number (string)

\- measurement\_lrv (float) — lower range value

\- measurement\_urv (float) — upper range value

\- engineering\_units (string) — e.g. kPa, degC, m3/h

\- output\_type (string) — e.g. 4-20mA, HART, Digital

\- calibration\_interval\_days (integer)

\- tolerance\_type (enum) — percent\_span / percent\_reading / absolute

\- tolerance\_value (float)

\- num\_test\_points (integer, default 5)

\- test\_point\_values (JSON array of floats) — expected input values

\- criticality (enum) — safety\_critical / process\_critical / standard / non\_critical

\- status (enum) — active / spare / out\_of\_service / decommissioned

\- procedure\_reference (string)

\- last\_calibration\_date (date)

\- last\_calibration\_result (enum) — pass / fail / marginal / not\_calibrated

\- calibration\_due\_date (date, calculated)

\- created\_at (timestamp)

\- updated\_at (timestamp)

\- created\_by (string) — used for site isolation (stores site name)



\### Calibration Record (calibration\_records table)

\- id (UUID, primary key)

\- instrument\_id (UUID, FK to instruments)

\- calibration\_date (date)

\- calibration\_type (enum) — routine / corrective / post\_repair / initial

\- technician\_name (string)

\- technician\_id (UUID, FK to users)

\- reference\_standard\_description (string)

\- reference\_standard\_serial (string)

\- reference\_standard\_cert\_number (string)

\- reference\_standard\_cert\_expiry (date)

\- procedure\_used (string)

\- adjustment\_made (boolean)

\- adjustment\_type (string)

\- adjustment\_notes (text)

\- technician\_notes (text)

\- defect\_found (boolean)

\- defect\_description (text)

\- return\_to\_service (boolean)

\- as\_found\_result (enum) — pass / fail / marginal

\- as\_left\_result (enum) — pass / fail / marginal / not\_required

\- max\_as\_found\_error\_pct (float)

\- max\_as\_left\_error\_pct (float)

\- record\_status (enum) — draft / submitted / approved / rejected

\- work\_order\_reference (string)

\- created\_at (timestamp)

\- approved\_by (string)

\- approved\_at (timestamp)



\### Calibration Test Points (cal\_test\_points table)

\- id (UUID, primary key)

\- calibration\_record\_id (UUID, FK to calibration\_records)

\- point\_number (integer)

\- nominal\_input (float) — the stimulus applied

\- expected\_output (float) — ideal instrument output

\- as\_found\_output (float) — actual reading before adjustment

\- as\_left\_output (float) — actual reading after adjustment (nullable)

\- as\_found\_error\_abs (float, calculated)

\- as\_found\_error\_pct (float, calculated) — % of span

\- as\_left\_error\_abs (float, calculated)

\- as\_left\_error\_pct (float, calculated)

\- as\_found\_result (enum) — pass / fail / marginal

\- as\_left\_result (enum) — pass / fail / marginal / not\_required



\---



\## Pass/Fail Calculation Rules (CRITICAL — implement exactly)



\### Span

span = measurement\_urv - measurement\_lrv



\### Tolerance in output units (for 4-20mA: span = 16mA)

if tolerance\_type == "percent\_span":

&#x20;   tolerance\_abs = (tolerance\_value / 100) \* output\_span

if tolerance\_type == "percent\_reading":

&#x20;   tolerance\_abs = (tolerance\_value / 100) \* expected\_output

if tolerance\_type == "absolute":

&#x20;   tolerance\_abs = tolerance\_value



\### Per-point result

error\_abs = actual\_output - expected\_output

error\_pct = (error\_abs / output\_span) \* 100

marginal\_threshold = tolerance\_abs \* 0.8

if abs(error\_abs) > tolerance\_abs: result = "fail"

elif abs(error\_abs) > marginal\_threshold: result = "marginal"

else: result = "pass"



\### Overall record result

if any point is "fail": overall = "fail"

elif any point is "marginal": overall = "marginal"

else: overall = "pass"



\---



\## Alert Rules

\- OVERDUE: today > calibration\_due\_date

\- DUE\_SOON: today > (calibration\_due\_date - 14 days) AND not overdue

\- FAILED: last\_calibration\_result == "fail"

\- CONSECUTIVE\_FAILURES: last 2+ calibration records both have as\_found\_result == "fail"



\---



\## UI Colour Conventions (use consistently throughout)

\- Red (#EF4444): overdue, failed, critical

\- Amber (#F59E0B): due soon, marginal, warning

\- Green (#22C55E): current, pass, healthy

\- Blue (#3B82F6): informational

\- Grey (#6B7280): decommissioned, inactive



\---



\## Pending Work (not yet built)

\- \*\*Supabase Auth migration\*\* — replace localStorage with proper JWT auth. Highest priority before first paying customer.

\- \*\*Stripe payment integration\*\* — subscription billing, plan selection, webhook handling

\- \*\*Account gating\*\* — /app/\* should require an active paid subscription (currently open)

\- \*\*CSV import UI\*\* — frontend upload interface for import\_instruments.py functionality (currently script-only)

\- \*\*Email notifications\*\* — overdue alerts, approval notifications via Resend/SendGrid

\- \*\*Self-serve sign-up\*\* — new customer registration flow linked to Stripe checkout



