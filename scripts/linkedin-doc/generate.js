"use strict";
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, PageBreak,
  ShadingType, Footer, SimpleField, NumberFormat, convertInchesToTwip,
} = require("docx");
const fs = require("fs");

const NAVY  = "1E3A5F";
const WHITE = "FFFFFF";
const LGREY = "F2F4F7";
const MGREY = "D0D7E2";

// ── helpers ──────────────────────────────────────────────────────────
const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 480, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: "Calibri" })],
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 140 },
  children: [new TextRun({ text, bold: true, size: 28, color: NAVY, font: "Calibri" })],
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 100 },
  children: [new TextRun({ text, bold: true, size: 22, color: "2A5FA8", font: "Calibri" })],
});
const p = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: "222222", font: "Calibri" })],
  spacing: { before: 60, after: 80 },
});
const b = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: NAVY, bold: true, font: "Calibri" })],
  spacing: { before: 100, after: 60 },
});
const li = (text, level = 0) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: "222222", font: "Calibri" })],
  bullet: { level },
  spacing: { before: 40, after: 40 },
});
const pg = () => new Paragraph({ children: [new PageBreak()] });
const hr = () => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [new TableRow({
    children: [new TableCell({
      children: [new Paragraph({ children: [], spacing: { before: 80, after: 80 } })],
      borders: {
        top:    { style: BorderStyle.NONE, size: 0, color: "auto" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: MGREY },
        left:   { style: BorderStyle.NONE, size: 0, color: "auto" },
        right:  { style: BorderStyle.NONE, size: 0, color: "auto" },
      },
    })],
  })],
  borders: {
    top:     { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom:  { style: BorderStyle.NONE, size: 0, color: "auto" },
    left:    { style: BorderStyle.NONE, size: 0, color: "auto" },
    right:   { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideH: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideV: { style: BorderStyle.NONE, size: 0, color: "auto" },
  },
});
const quote = (text) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [new TableRow({
    children: [new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, size: 22, color: NAVY, bold: true, italics: true, font: "Calibri" })],
        spacing: { before: 120, after: 120 },
      })],
      borders: {
        top:    { style: BorderStyle.NONE, size: 0, color: "auto" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
        left:   { style: BorderStyle.SINGLE, size: 14, color: "2A5FA8" },
        right:  { style: BorderStyle.NONE, size: 0, color: "auto" },
      },
      shading: { type: ShadingType.SOLID, color: LGREY },
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
    })],
  })],
  borders: {
    top:     { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom:  { style: BorderStyle.NONE, size: 0, color: "auto" },
    left:    { style: BorderStyle.NONE, size: 0, color: "auto" },
    right:   { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideH: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideV: { style: BorderStyle.NONE, size: 0, color: "auto" },
  },
});

// ── table helpers ────────────────────────────────────────────────────
const hCell = (text) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
  })],
  shading: { type: ShadingType.SOLID, color: NAVY },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
});
const dCell = (text, shade) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, size: 18, color: "222222", font: "Calibri" })],
    spacing: { before: 40, after: 40 },
  })],
  shading: shade ? { type: ShadingType.SOLID, color: LGREY } : undefined,
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
});
const tbl = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ tableHeader: true, children: headers.map(hCell) }),
    ...rows.map((row, ri) => new TableRow({
      children: row.map((cell) => dCell(cell, ri % 2 === 0)),
    })),
  ],
  borders: {
    top:     { style: BorderStyle.SINGLE, size: 4, color: MGREY },
    bottom:  { style: BorderStyle.SINGLE, size: 4, color: MGREY },
    left:    { style: BorderStyle.SINGLE, size: 4, color: MGREY },
    right:   { style: BorderStyle.SINGLE, size: 4, color: MGREY },
    insideH: { style: BorderStyle.SINGLE, size: 2, color: MGREY },
    insideV: { style: BorderStyle.SINGLE, size: 2, color: MGREY },
  },
});

// ════════════════════════════════════════════════════════════════════
// COVER
// ════════════════════════════════════════════════════════════════════
const cover = [
  new Paragraph({ spacing: { before: 2400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CalCheq", bold: true, size: 80, color: NAVY, font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text: "LinkedIn Brand Growth System", bold: true, size: 48, color: "2A5FA8", font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 600 },
    children: [new TextRun({ text: "A Complete Playbook for Establishing Authority and Generating Qualified Leads", size: 24, color: "555555", italics: true, font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "April 2026  ·  Confidential", size: 20, color: "888888", font: "Calibri" })],
  }),
  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 1: BRAND STRATEGY
// ════════════════════════════════════════════════════════════════════
const s1 = [
  h1("Section 1: LinkedIn Brand Strategy"),
  hr(),

  h2("1.1  Brand Personality & Tone of Voice"),
  p("CalCheq's voice is that of a seasoned instrumentation professional who also built software — technically credible, plainspoken, and genuinely invested in helping the industry do better work. Think: the most knowledgeable person in the room who never makes you feel stupid for asking."),
  b("The four tone pillars:"),
  li("Technically credible — uses real industry language (drift, tolerance, as-found/as-left, CMMS) without over-explaining to insiders"),
  li("Human, not corporate — first-person where possible; admits limitations; no buzzword soup"),
  li("Opinionated but fair — takes clear positions on what good calibration management looks like"),
  li("Evidence-led — backs claims with numbers, scenarios, and real-world patterns from industry"),
  b("What CalCheq never sounds like:"),
  li("Generic SaaS marketing (\"unlock your potential\", \"revolutionise your workflow\")"),
  li("Condescending toward legacy systems — acknowledge why they existed before explaining why they're no longer enough"),
  li("Buzzword-heavy AI/ML hype — CalCheq is rule-based, data-driven, and honest about that"),

  h2("1.2  Five Content Pillars"),
  tbl(
    ["Pillar", "Description", "LinkedIn Goal"],
    [
      ["1. Calibration Insight", "Practical, technical content about calibration management — drift, intervals, tolerance, pass/fail logic", "Build authority with practitioners"],
      ["2. Hidden Costs & Risk", "The business cost of poor calibration tracking: downtime, audit failures, rework, insurance risk", "Connect with managers & finance stakeholders"],
      ["3. Data as a Strategic Asset", "How calibration data — when captured properly — reveals maintenance patterns and supports better decisions", "Reach reliability engineers & plant managers"],
      ["4. Industry Observations", "Candid commentary on how heavy industry manages (or mismanages) maintenance data", "Thought leadership & shareability"],
      ["5. CalCheq Product & Journey", "Transparent product updates, behind-the-scenes building, customer stories, feature spotlights", "Trust-building & conversion"],
    ]
  ),

  h2("1.3  Authority Positioning Strategy"),
  p("CalCheq's authority rests on three assets competitors cannot easily replicate:"),
  li("Founder credibility — built by someone who did the job, not a generic SaaS team that spotted a market gap"),
  li("Technical specificity — goes deeper than competitors on calibration concepts (drift projections, tolerance calculations, as-found vs as-left analysis)"),
  li("Industry honesty — willing to acknowledge what CalCheq doesn't do, which makes everything it claims more believable"),
  quote("\"CalCheq is built for the people who actually do calibration work — and the managers trying to make sense of it.\""),

  h2("1.4  Posting Frequency & Content Mix"),
  p("Recommended: 3 posts per week (Mon / Wed / Fri) from the founder account, with company page reposts. Quality threshold: every post must pass the 'would a senior instrumentation engineer nod at this?' test."),
  tbl(
    ["Content Type", "Target %", "Examples"],
    [
      ["Educational / Technical", "35%", "How drift trending works, calibration interval logic, audit checklist breakdown"],
      ["Thought Leadership / Opinion", "20%", "Why spreadsheets keep failing, the real cost of reactive maintenance"],
      ["Product & Platform", "20%", "Feature spotlights, workflow demos, before/after comparisons"],
      ["Story & Human", "15%", "Why CalCheq was built, industry experiences, building in public updates"],
      ["Engagement Prompts", "10%", "Polls, questions, challenges to the industry status quo"],
    ]
  ),

  h2("1.5  What NOT to Do on LinkedIn"),
  li('Post press-release-style product announcements with no human angle (\"We\'re excited to announce…\")'),
  li("Use stock photos of people in hard hats who clearly aren't calibration technicians"),
  li('Engagement bait (\"Comment YES if you agree\") — industrial professionals ignore this'),
  li("Share competitor-bashing content — point out problems, not people"),
  li("Over-post — three great posts beat seven forgettable ones every time"),
  li("Ignore comments — every comment is a warm lead; reply within 4 hours where possible"),
  li("Gate everything behind a demo request — build trust with free value before asking for time"),
  li("Repost generic industry news without adding a CalCheq-specific perspective"),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 2: PROFILE SETUP
// ════════════════════════════════════════════════════════════════════
const s2 = [
  h1("Section 2: Complete LinkedIn Profile Setup"),
  hr(),

  h2("2.1  Company Page — CalCheq"),
  h3("Tagline Options (under 120 characters — pick one)"),
  li("Calibration management built for the people who actually do the work — and the managers who rely on the data."),
  li("Industrial calibration software with built-in analytics. Replace spreadsheets. Pass audits. Prevent failures."),
  li("Know what's calibrated, what's drifting, and what needs attention — before it becomes a problem."),

  h3("About Section (~1,950 characters)"),
  p("CalCheq is a calibration management and analytics platform built specifically for heavy industry — mining, oil & gas, water treatment, power generation, and manufacturing."),
  p("We built CalCheq because we've seen what happens when calibration is managed in spreadsheets: missed due dates buried in columns, certificates that no one can find during an audit, drift trends that stay invisible until something fails. The data is there — it just isn't working for anyone."),
  p("CalCheq changes that. Every calibration result is captured, stored, and automatically analysed. Due dates are tracked and flagged before they become overdue. Pass/fail determinations are calculated against instrument-specific tolerances. Drift trends are visualised so your team can see which instruments are trending toward failure before they get there."),
  p("The result: your calibration data becomes a maintenance intelligence asset, not a compliance checkbox."),
  p("CalCheq is designed for instrumentation technicians, E&I supervisors, reliability engineers, maintenance planners, and the managers who need to understand the calibration story without having to dig for it."),
  b("Key capabilities:"),
  li("Calibration scheduling and due date management"),
  li("Pass/fail automation with tolerance enforcement"),
  li("As-found and as-left data capture per test point"),
  li("Drift trending and projected failure dates"),
  li("Calibration certificate and history access"),
  li("Audit-ready reporting (generated in seconds)"),
  li("Team workflows with supervisor approval routing"),
  li("Bulk CSV import for Beamex and Fluke calibrators"),
  p("Built in Australia. Priced for the mid-market. Designed for the realities of heavy industry."),

  h3("Mission Statement"),
  p("To give industrial maintenance teams full visibility over their calibration program — so they can move from reactive fire-fighting to proactive, data-driven asset care."),

  h3("Specialties List"),
  p("Calibration Management · Instrument Calibration Software · Calibration Scheduling · Drift Analysis · Predictive Maintenance · Compliance and Audit Readiness · Industrial Instrumentation · E&I Maintenance · Calibration Analytics · Maintenance Intelligence · Heavy Industry Software"),

  h3("CTA Text Options"),
  li("Start your free 30-day trial → calcheq.com"),
  li("See how CalCheq works → Book a demo"),
  li("Try it free — no credit card required"),

  h3("Banner Headline Ideas"),
  li('\"Your calibration data should work harder than a spreadsheet\" — navy background, white text, CalCheq logo centred'),
  li('\"Built by instrumentation people, for instrumentation people\" — industrial site imagery with dark overlay and text'),
  li('\"See what\'s calibrated. See what\'s drifting. Stay audit-ready.\" — three-icon horizontal layout'),

  h3("Profile Slogan Options"),
  li("Calibration management built for heavy industry"),
  li("Industrial calibration software with built-in analytics"),
  li("Replace the spreadsheet. Prevent the failure. Pass the audit."),

  h2("2.2  Founder Personal Brand"),
  h3("Headline Options (220 characters max — pick one)"),
  li("Founder @ CalCheq · Calibration management software for heavy industry · Built from 10+ years on industrial sites · Helping maintenance teams replace spreadsheets with real data"),
  li("Building CalCheq — industrial calibration software that actually works for the people doing the job · Mining · O&G · Water Treatment"),
  li("I spent years tracking calibration in spreadsheets on industrial sites. Now I'm fixing that. Founder @ CalCheq — calibration management & analytics for heavy industry"),

  h3("About Summary (first-person, ~1,900 characters)"),
  p("I spent over a decade working in and around heavy industrial sites — the kind of places where a missed calibration can mean a process exceedance, a safety incident, or a failed regulatory audit."),
  p('What I kept seeing was the same problem: incredibly skilled instrumentation teams managing their calibration programs in spreadsheets, PDF folders, and CMMS attachment fields that weren\'t built for this. The data existed — but it was invisible. You couldn\'t see what was drifting. You couldn\'t see trends. You couldn\'t answer \"are we audit-ready?\" without spending a day hunting through files.'),
  p("I built CalCheq to fix that."),
  p("CalCheq is a calibration management and analytics platform built for heavy industry — mining, oil & gas, power generation, water treatment, and manufacturing. It captures calibration data, automates pass/fail calculations, tracks due dates, surfaces drift trends, and gives your team a single place to manage and report on the entire calibration program."),
  p("The goal isn't to add another tool. It's to make the data that already exists in your calibration program actually work for your maintenance decisions."),
  p("I write about calibration management, maintenance data strategy, industrial instrumentation, and building software for industries that are underserved by the tech world. If any of that resonates — I'd enjoy connecting."),
  p("→ Try CalCheq free at calcheq.com"),

  h3("Credibility Positioning Notes"),
  li("Lead with the problem you lived, not the solution you built — practitioners trust people who understand the pain"),
  li("Name specific industries (mining, O&G, water treatment) — vague 'industrial' is less credible"),
  li("Reference technical specifics (drift, as-found/as-left, tolerance) to signal domain expertise"),
  li("Avoid overloading the About section with product features — that belongs on the company page"),

  h3("Origin Story Framework (structural guide)"),
  li("Act 1 — The moment: a specific, real situation where calibration data was invisible or inaccessible"),
  li("Act 2 — The pattern: recognising this wasn't a one-site problem, it was industry-wide"),
  li("Act 3 — The decision: why building software was the answer, and what the first version looked like"),
  li("Act 4 — The mission: what CalCheq is trying to change, in one clear sentence"),
  p("Keep it under 600 words when written as a post. Specificity beats comprehensiveness."),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 3: 90-DAY CONTENT CALENDAR
// ════════════════════════════════════════════════════════════════════
const s3 = [
  h1("Section 3: 90-Day LinkedIn Content Calendar"),
  hr(),
  p("Three posts per week: Monday / Wednesday / Friday. Strategy arc: Weeks 1–4 establish authority, Weeks 5–8 build social proof and deepen technical credibility, Weeks 9–12 drive conversion."),
  tbl(
    ["Week", "Day", "Post Topic", "Content Type", "Target Audience", "Objective", "CTA Angle"],
    [
      ["1","Mon","Why CalCheq was built — the moment I knew spreadsheets weren't enough","Story","Broad / cold","Awareness + follow growth","Follow for more"],
      ["1","Wed","What as-found vs as-left data actually tells you about instrument health","Educational","Techs & supervisors","Authority building","Comment with experience"],
      ["1","Fri","The calibration data hiding in your CMMS (and why it's invisible)","Thought leadership","Reliability engineers","Problem framing","Link to blog"],
      ["2","Mon","5 signs your calibration program is running on hope, not data","Educational","Supervisors & managers","Engagement / shareability","Tag someone who needs this"],
      ["2","Wed","CalCheq dashboard walkthrough — what a compliant site looks like in one screen","Product","All personas","Product awareness","Try it free link"],
      ["2","Fri","What auditors actually look for when they ask for calibration records","Educational","Compliance stakeholders","Authority & trust","Download audit checklist"],
      ["3","Mon","The real cost of a missed calibration — beyond the fine","Thought leadership","Plant managers","Business case framing","Comment: your biggest risk?"],
      ["3","Wed","How drift trending works — and why most plants ignore it","Educational","Reliability engineers","Technical credibility","Try CalCheq free"],
      ["3","Fri","Behind the scenes: what we got wrong in version 1 of CalCheq","Story / transparency","Broad audience","Trust building","Follow the journey"],
      ["4","Mon","Calibration intervals: are yours based on data or just habit?","Educational","Engineers & planners","Problem awareness","Comment with your approach"],
      ["4","Wed","Your CMMS wasn't built for calibration. Here's why that matters.","Contrarian","Supervisors","Positioning vs CMMS","Book a 15-min demo"],
      ["4","Fri","Compliance vs quality: why passing an audit doesn't mean your instruments are accurate","Thought leadership","Compliance & ops","Depth / credibility","Share with your team"],
      ["5","Mon","What I saw on an industrial site that changed how I think about calibration data","Story","Broad audience","Engagement & sharing","Follow for more"],
      ["5","Wed","CalCheq feature spotlight: due date tracking — how we flag overdue before it's a problem","Product","Technicians & planners","Product education","Try it free"],
      ["5","Fri","Why 'good enough' maintenance tracking isn't good enough anymore","Contrarian","Managers & reliability","Challenge status quo","Comment: agree or disagree?"],
      ["6","Mon","The three things a calibration certificate should tell you (and usually doesn't)","Educational","Techs & supervisors","Authority","Comment with what you check"],
      ["6","Wed","Before CalCheq: 3 hours to build an audit report. After: 3 minutes.","Product / before-after","Supervisors & managers","Conversion","Book a demo"],
      ["6","Fri","Why most plants are sitting on a goldmine of unused maintenance data","Thought leadership","Reliability & ops","Insight / shareability","Link to blog"],
      ["7","Mon","How to calculate calibration tolerance — the right way","Educational","Technicians","Deep technical authority","Download tolerance guide"],
      ["7","Wed","CalCheq feature spotlight: drift alerts — see failure coming before it happens","Product","Reliability engineers","Product awareness","Try it free"],
      ["7","Fri","The myth of 'set and forget' calibration intervals","Contrarian","Engineers & managers","Engagement","Comment: how often do you review?"],
      ["8","Mon","A day in the life of a calibration program with CalCheq","Story / product","All personas","Conversion-ready trust","Book a demo"],
      ["8","Wed","Repeat failures: how to spot a bad actor instrument before it takes down a process","Educational","Reliability engineers","Technical depth","Try diagnostics free"],
      ["8","Fri","What we're building next — and why we're building it first","Transparency / product","Broad audience","Follow growth & trust","Follow for updates"],
      ["9","Mon","If your calibration data lives in a spreadsheet, here's what you can't see","Educational","Managers & supervisors","Problem awareness + conversion","Try CalCheq free"],
      ["9","Wed","CalCheq and Beamex: how to import calibrator data in minutes","Product","Technicians","Feature education","Try it free"],
      ["9","Fri","The gap between maintenance data and maintenance decisions","Thought leadership","Reliability & ops leaders","Strategic framing","Link to blog"],
      ["10","Mon","Why I talk to instrumentation technicians first, not plant managers","Story / positioning","Broad","Brand personality","Connect if you're in the field"],
      ["10","Wed","CalCheq compliance rate dashboard — what 'healthy' looks like across your site","Product","Supervisors & managers","Visual product proof","Book a demo"],
      ["10","Fri","Is your calibration program reactive or predictive? How to tell.","Educational","Reliability engineers","Self-diagnostic engagement","Comment: where does your site land?"],
      ["11","Mon","The five calibration metrics every maintenance manager should be tracking","Educational","Managers","Business value","Download KPI guide"],
      ["11","Wed","How CalCheq handles approval workflows — technician to supervisor in one system","Product","Supervisors","Feature education","Try it free"],
      ["11","Fri","Why more software isn't always the answer (and when it is)","Contrarian","All personas","Trust / credibility","Comment with your take"],
      ["12","Mon","12 weeks of posting about calibration — here's what I've learned","Story / reflection","Broad audience","Engagement & milestone","Follow for more"],
      ["12","Wed","If I were starting a calibration program from scratch today","Thought leadership","All personas","Authority + conversion","Book a demo"],
      ["12","Fri","30 days free. No credit card. See your calibration program differently.","CTA / conversion","Warm audience","Direct conversion","calcheq.com — start trial"],
    ]
  ),
  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 4: POST BANK
// ════════════════════════════════════════════════════════════════════
const s4 = [
  h1("Section 4: LinkedIn Post Bank — 30 Ready-to-Post Posts"),
  hr(),

  // ── EDUCATIONAL ──────────────────────────────────────────────────
  h2("Educational Posts (8)"),

  h3("EDU-1: The Hidden Cost of Missed Calibrations"),
  b("Hook:"),
  p("A missed calibration isn't just a compliance problem."),
  p("It's a process quality problem. A safety risk. And a downstream cost most plants never fully account for."),
  b("Full post:"),
  p("When an instrument drifts past its tolerance and no one catches it, the calibration failure is the least expensive part."),
  p("The real costs:\n→ Process measurements that have been incorrect for weeks or months\n→ Product batches that may not meet spec\n→ Control decisions made on bad data\n→ Insurance exposure if a safety system was involved\n→ The rework cost when the audit finds it"),
  p("And the part that's hardest to swallow: in most plants, you wouldn't know. Not until something downstream told you."),
  p("That's not a people problem. It's a visibility problem. When calibration data lives in spreadsheets and CMMS attachments, drift is invisible until it isn't."),
  p("CTA: What's your current process for catching drift before it causes problems? Drop it in the comments."),
  p("[Image idea: Before/after — spreadsheet with missed due dates in red vs CalCheq dashboard showing overdue count and due-soon list at a glance]"),
  hr(),

  h3("EDU-2: Why Spreadsheets Fail Audits"),
  b("Hook:"),
  p("Spreadsheets don't fail audits. The process behind them does."),
  p("But spreadsheets make it almost impossible to build a robust process. Here's why:"),
  b("Full post:"),
  p("1. Version control — which file is current? Shared drives become graveyards of outdated versions.\n2. Traceability — can you show exactly when a calibration was done, by whom, with what reference standard?\n3. Certificate access — when the auditor asks for the cert for instrument FT-202, how long does it take to find it?\n4. Gap identification — can you prove you know which instruments were due and when, and that none were missed?"),
  p("Auditors aren't looking to catch you out. They're checking whether your system gives you control of your own program. Spreadsheets make that hard to demonstrate."),
  p("A calibration management system doesn't just store data — it makes your process auditable by design."),
  p("CTA: If an auditor walked in tomorrow and asked to see your calibration records from the last 12 months — how long would it take to pull them together?"),
  p("[Image idea: Checklist infographic of what auditors look for, with a CalCheq tick against each item]"),
  hr(),

  h3("EDU-3: What Drift Trends Reveal"),
  b("Hook:"),
  p("Drift is your instrument telling you something. Most plants aren't listening."),
  b("Full post:"),
  p("Every calibration produces an as-found reading — the instrument's actual output before any adjustment. Plot those readings over time, and you get a drift trend."),
  p("What that trend tells you:\n→ Is the instrument stable or deteriorating?\n→ Is it drifting in a consistent direction (systematic error) or randomly (environmental or wear issue)?\n→ Will it reach its tolerance limit before the next calibration is due?\n→ Should the calibration interval be shortened — or could it safely be extended?"),
  p("Right now, most plants capture as-found data and do nothing with it. The number goes into a form, the form goes into a CMMS, and no one sees it again."),
  p("That's where predictive maintenance potential lives — and it's being left on the table."),
  p("CTA: Does your team review as-found trends? Or does that data disappear into the records system? Curious what's common out there."),
  p("[Image idea: Line graph showing drift trend for a single instrument across 6 calibrations, tolerance band overlaid, projected failure date marked]"),
  hr(),

  h3("EDU-4: Calibration Interval Optimisation"),
  b("Hook:"),
  p("Your calibration intervals are probably wrong. And that's nobody's fault."),
  b("Full post:"),
  p("Most calibration intervals were set at commissioning — based on manufacturer recommendations, industry standards, or the judgment of whoever set up the maintenance program. That's a reasonable starting point."),
  p("The problem: few plants ever revisit them."),
  p("An instrument that consistently passes within 10% of its tolerance might safely run for twice as long. An instrument arriving at calibration near the edge of its tolerance might need a shorter interval."),
  p("The data to make that call exists in every calibration record. But without the ability to see trends across records, it's invisible."),
  p("Interval optimisation isn't just about efficiency — it's about allocating your technicians' time where the actual risk is."),
  p("CTA: How often does your site review calibration intervals? Based on data, or the original schedule?"),
  p("[Image idea: Table showing 5 instruments — current interval, average as-found error trend, and recommended adjustment based on drift data]"),
  hr(),

  h3("EDU-5: Predictive Maintenance Through Calibration Data"),
  b("Hook:"),
  p("The best source of predictive maintenance data on your site might already exist."),
  p("It's your calibration records."),
  b("Full post:"),
  p("Every as-found reading is a data point about instrument health. When you capture those readings systematically, you can:\n→ Project when an instrument will reach its tolerance limit\n→ Identify instruments with accelerating drift\n→ Flag repeat failures as bad actors\n→ Build a risk-based maintenance priority list from real performance data"),
  p("This is predictive maintenance — not through expensive IoT sensors or AI black boxes, but through the calibration data your technicians are already capturing."),
  p("Most plants are generating this data and not using it. The gap isn't data collection. It's data visibility."),
  p("CTA: If you could see a projected failure date for every instrument on your site — what would change in how you planned maintenance?"),
  p("[Image idea: CalCheq Drift Alerts screen showing sparklines for 8 instruments with projected failure dates and red alert badges on the most urgent]"),
  hr(),

  h3("EDU-6: The Real Cost of Reactive Maintenance"),
  b("Hook:"),
  p("Reactive maintenance feels cheaper. It almost never is."),
  b("Full post:"),
  p("When you fix things after they fail, you pay for the repair. When you maintain proactively, you pay for the maintenance. Reactive feels like saving money — right up until it isn't."),
  p("The hidden costs of reactive calibration management:\n→ Emergency callouts when an out-of-tolerance instrument causes a process trip\n→ Unplanned downtime during investigation\n→ Product quality incidents from measurements that were wrong for an unknown period\n→ Audit findings from gaps in the calibration record\n→ The time cost of the scramble to prove compliance after the fact"),
  p("None of these show up in the cost of the calibration itself. They show up in operational loss, rework, and regulatory risk."),
  p("Proactive calibration management doesn't cost more. It costs differently — and the return is predictability."),
  p("CTA: What's the most expensive reactive maintenance event you've seen that started with a missed calibration? (Anonymised is fine.)"),
  p("[Image idea: Two-column comparison — Reactive vs Proactive — with costs listed; reactive column in red, proactive in green]"),
  hr(),

  h3("EDU-7: What Auditors Actually Look For"),
  b("Hook:"),
  p("I've spoken to a lot of people who've been through calibration audits. Most describe them as stressful."),
  p("They don't have to be."),
  b("Full post:"),
  p("Audits are stressful when your records aren't organised, your traceability is patchy, and you're not sure what the auditor is going to find."),
  p("Here's what they're actually checking:\n1. Completeness — was every instrument that should have been calibrated actually calibrated?\n2. Traceability — can you trace the calibration back to a reference standard with a valid certificate?\n3. Timeliness — were calibrations done on schedule? Were any overdue?\n4. Results — pass or fail? If fail, was corrective action taken and documented?\n5. Approvals — was the calibration reviewed and signed off by someone with authority?"),
  p("If you can answer yes to all five with a few clicks — you're audit-ready. If you have to dig through folders — you have a process risk."),
  p("CTA: Which of these five areas is hardest for your site to demonstrate quickly? I'd like to build content around the most common gaps."),
  p("[Image idea: Five-point checklist with icons for each audit check category — styled as an audit readiness scorecard]"),
  hr(),

  h3("EDU-8: Calibration Data as a Strategic Asset"),
  b("Hook:"),
  p("Most maintenance managers see calibration as a compliance function. The ones I respect most see it as intelligence."),
  b("Full post:"),
  p("The calibration data sitting in your records right now answers questions like:\n→ Which instruments are consistently close to their tolerance limit?\n→ Which areas of the plant have the worst calibration performance?\n→ Are certain procedures producing better results?\n→ Which instruments are most likely to cause a process problem in the next 3 months?"),
  p("That's not compliance data. That's operational intelligence."),
  p("The plants that will run best over the next decade won't just have better equipment. They'll have better visibility into how that equipment is performing — and calibration is one of the most reliable performance signals available."),
  p("The data already exists. The question is whether it's organised in a way that lets you use it."),
  p("CTA: Has your site ever used calibration performance data to make a maintenance planning decision? I'd love to hear examples."),
  p("[Image idea: CalCheq area compliance chart — bar chart showing compliance rate by plant area, lowest-performing area highlighted in amber]"),
  hr(),

  // ── STORY ────────────────────────────────────────────────────────
  h2("Story Posts (5)"),

  h3("STORY-1: Why CalCheq Was Built"),
  b("Hook:"),
  p("I didn't set out to build calibration software."),
  p("I set out to fix a problem I kept seeing on industrial sites."),
  b("Full post:"),
  p("Calibration programs that worked — technically — but produced data that no one could use."),
  p("Spreadsheets with 800 rows. Certificates buried in CMMS attachment fields. Technicians spending more time filing paperwork than doing calibrations. Supervisors having no idea which instruments were overdue until the audit asked."),
  p("And here's the thing — the people running these programs were skilled. The problem wasn't competence. It was that the tools weren't built for what calibration management actually requires."),
  p("CMMS systems are built for work orders, not calibration data. Spreadsheets are built for lists, not trend analysis. Generic document management is built for storage, not compliance traceability."),
  p("CalCheq is built for calibration. Specifically, deliberately, entirely."),
  p("That focus changes what's possible. And that's why I built it."),
  p("CTA: If you've lived this problem — I'd genuinely like to hear your version of it. What was the moment you knew the old way wasn't working?"),
  p('[Image idea: Dark navy background, white text — \"Built because the spreadsheet wasn\'t good enough. And everyone knew it.\"]'),
  hr(),

  h3("STORY-2: The Moment I Knew Spreadsheets Weren't Enough"),
  b("Hook:"),
  p("The spreadsheet had 847 rows."),
  b("Full post:"),
  p("It was the calibration register for a mid-sized industrial site. Colour-coded. Well maintained — someone had clearly put real effort into it."),
  p('But when I asked a simple question — \"which instruments are due in the next 30 days?\" — the answer required filtering three columns, cross-referencing another tab, and hoping the formula in column P was correct.'),
  p('When I asked a harder question — \"which instruments have failed calibration more than once in the last two years?\" — the answer required manually going through each record.'),
  p("These aren't exotic questions. They're basic operational questions that a calibration program should be able to answer instantly."),
  p("The spreadsheet couldn't. Not because the person running it wasn't capable — but because that's not what spreadsheets are built for."),
  p("That was the moment CalCheq started taking shape."),
  p("CTA: What's the question your current calibration system can't answer quickly? Drop it below — I'm building a list."),
  p("[Image idea: Two screenshots side by side — a busy Excel spreadsheet with filters highlighted vs CalCheq's overdue instrument list with one-click filtering]"),
  hr(),

  h3("STORY-3: Lessons From Real Industrial Sites"),
  b("Hook:"),
  p("Three things I've learned from talking to calibration teams in heavy industry:"),
  b("Full post:"),
  p("1. Everyone knows the spreadsheet isn't good enough. Nobody is surprised when I describe the problem. What surprises them is that software built specifically for calibration exists at all."),
  p("2. The bottleneck is almost never the technicians. It's visibility at the supervisory and management level. The people doing the calibrations know their instruments. The people making decisions about the program often can't see what's happening."),
  p("3. 'Compliance' and 'quality' are not the same thing. A site can have 100% of calibrations completed on time and still have instruments drifting toward failure. Compliance is the floor. Quality is the ceiling. Most plants stop at the floor."),
  p("If any of these land for you — I'd like to hear which one. Different sites have very different versions of this problem."),
  p("CTA: Which of these three resonates most with your experience? Comment with the number."),
  p("[Image idea: Three-panel numbered graphic — one lesson per panel, industrial imagery in the background]"),
  hr(),

  h3("STORY-4: The Gap Between Maintenance Data and Decisions"),
  b("Hook:"),
  p("There's a gap in most maintenance departments."),
  b("Full post:"),
  p("On one side: technicians who know their instruments well. They can tell you which pressure transmitter drifts high in summer, which flow meter has been marginal for three cycles, which temperature element is getting worse every time."),
  p("On the other side: managers and reliability engineers who make planning decisions — but are working from summary reports, gut feel, and reactive triggers."),
  p("The gap between those two groups is where bad decisions get made. And it's not because people aren't smart or experienced. It's because the data that would close the gap is trapped in calibration records that no one is synthesising."),
  p("CalCheq is built to close that gap. The technician captures the data. The system surfaces the insights. The manager can see the story."),
  p("CTA: Who at your site sees your calibration data? Is it just the people doing the work, or does it reach decision-makers?"),
  p("[Image idea: Diagram showing data flow — calibration form → system → dashboard visible to technician, supervisor, and manager — CalCheq as the connective layer]"),
  hr(),

  h3("STORY-5: What Version 1 Got Wrong"),
  b("Hook:"),
  p("Version 1 of CalCheq had a problem."),
  b("Full post:"),
  p("It was built the way I thought calibration management should work. Clean, logical, well-structured. And the people I showed it to were polite about the gaps."),
  p("The honest feedback came later, from people who'd actually tried to use it: the calibration form had too many mandatory fields for a routine check. The import from Beamex wasn't there. The due date logic didn't account for outage-based scheduling."),
  p("Good feedback. Uncomfortable to hear. But that's how software should be built."),
  p("The lesson: I knew the problem well from my own experience. But every site has its own version of the problem, and they're not all the same. Building in public — talking to users early, shipping before it's perfect, iterating on real use — is the only way to build something that actually works."),
  p("CalCheq is better because of every uncomfortable conversation. And there are more to have."),
  p("CTA: If you're an instrumentation professional willing to give CalCheq honest feedback — reach out. I'll give you free access."),
  p("[Image idea: Side-by-side of an early wireframe vs the current CalCheq dashboard — showing visible progression]"),
  hr(),

  // ── THOUGHT LEADERSHIP ───────────────────────────────────────────
  h2("Contrarian / Thought Leadership Posts (5)"),

  h3("TL-1: Why More Software Isn't Always Better"),
  b("Hook:"),
  p("The worst thing I could tell you is that you need more software."),
  b("Full post:"),
  p("Most maintenance departments are already drowning in systems. CMMS. EAM. DCS. SAP. Permit systems. Document management. Adding another tool has a real cost: training, integration, licence management, another vendor relationship."),
  p("So when I talk about CalCheq, I try to be honest about this."),
  p("CalCheq makes sense when:\n→ Your calibration program has grown to a size where manual tracking creates real risk\n→ You're struggling with audits because your records aren't organised enough\n→ You're losing visibility across technicians, areas, or sites\n→ You're managing safety-critical instruments where a missed calibration has genuine consequences"),
  p("If none of those apply — a well-maintained spreadsheet might genuinely be sufficient. I'd rather tell you that honestly than sell you something you don't need."),
  p("CTA: What would make a purpose-built calibration system worth it for your site? Trying to understand where the bar actually is."),
  p('[Image idea: Simple text graphic — \"The right tool for the job. Sometimes that\'s a spreadsheet. Sometimes it isn\'t. Here\'s how to tell.\"]'),
  hr(),

  h3("TL-2: Most Plants Are Sitting on Unused Data"),
  b("Hook:"),
  p("Your plant is generating valuable maintenance intelligence every week."),
  p("It's just not being captured in a way that makes it accessible."),
  b("Full post:"),
  p("Every calibration produces:\n→ An as-found reading — what the instrument was doing before adjustment\n→ An as-left reading — what it was doing after\n→ The error at each test point\n→ Whether the instrument passed, failed, or was marginal"),
  p("Across a 12-month calibration program, that's a data set that could tell you which instruments are drifting, which are stable, which are getting worse, and which calibration intervals need reviewing."),
  p("But in most plants, that data lives in a form. The form goes into a folder. Nobody looks at it again unless there's an audit or an incident."),
  p("The data isn't the problem. The system that can't use it is."),
  p("CTA: If you could ask one question of your historical calibration data and get an instant answer — what would it be?"),
  p("[Image idea: Iceberg — above water: 'compliance data'. Below: 'drift trends, interval optimisation, bad actors, failure prediction, area performance']"),
  hr(),

  h3("TL-3: Why Calibration Is More Strategic Than People Think"),
  b("Hook:"),
  p("Calibration sits at the intersection of safety, quality, and operational efficiency."),
  p("And most organisations treat it as an administrative task."),
  b("Full post:"),
  p("That mismatch creates real risk — not because teams don't care, but because the strategic importance of calibration isn't visible to the people who allocate resources. When calibration is framed as a compliance checkbox, it gets the resources of a compliance checkbox."),
  p("But consider what calibration actually underpins:\n→ Process measurements that control product quality\n→ Safety systems that protect people and plant\n→ Environmental monitoring that supports regulatory compliance\n→ Energy efficiency decisions made from flow and temperature data"),
  p("An out-of-tolerance instrument doesn't just fail an audit. It potentially compromises every decision made using its output."),
  p("If calibration got the strategic attention it deserved, maintenance programs would look very different."),
  p("CTA: Has calibration ever had a strategic impact at your site — beyond the audit? I'd like to hear the examples that don't get talked about."),
  p("[Image idea: Venn diagram — Safety / Quality / Operational Efficiency — with Calibration at the centre]"),
  hr(),

  h3("TL-4: The Myth of 'Good Enough' Maintenance Tracking"),
  b("Hook:"),
  p("'Good enough' calibration tracking is good enough — until it isn't."),
  b("Full post:"),
  p("And the problem with 'until it isn't' is that you usually don't know when that moment is until it's already happened."),
  p("I've spoken to sites that ran on spreadsheets for years without a serious incident — and genuinely believed their system was adequate. Then an audit, an incident, or a near-miss revealed the gaps: instruments never added to the register, a schedule no one had updated since 2019, as-found data that couldn't be retrieved."),
  p("The system was 'good enough' right up until it wasn't. And then it wasn't by a lot."),
  p("The right standard isn't 'good enough'. It's: can you answer any audit question in under 5 minutes? Can you identify your riskiest instruments right now? Can you see what's overdue without building a report?"),
  p("If the answer is no — 'good enough' is carrying more risk than it looks like."),
  p("CTA: What's the audit question your current system would struggle to answer quickly?"),
  p("[Image idea: A meter / dial — from 'good enough' to 'audit ready' — with the needle just below the line]"),
  hr(),

  h3("TL-5: Compliance Doesn't Equal Quality"),
  b("Hook:"),
  p("A site can have 100% calibration compliance and still have a serious instrumentation quality problem."),
  b("Full post:"),
  p("Compliance means every instrument was calibrated on schedule. It doesn't mean every instrument is accurate."),
  p("An instrument calibrated on time that arrives at calibration 15% over its tolerance limit has been providing bad measurements since the last calibration. It complied with the schedule. It didn't provide reliable data."),
  p("This matters because compliance-focused programs optimise for the schedule. Quality-focused programs optimise for the measurement. Those aren't the same thing."),
  p("Quality-focused calibration management asks:\n→ What was the as-found error, and what does it trend over time?\n→ Was this instrument accurate between calibrations, or just within spec at the calibration moment?\n→ Is the calibration interval matched to the instrument's actual drift rate?"),
  p("Compliance is the minimum. Quality is the goal. The data to close that gap already exists — it just needs to be used."),
  p("CTA: Does your site track compliance rate or quality of measurement? Is there a difference at your organisation?"),
  p("[Image idea: Two gauges — Compliance Rate (100%, green) and Calibration Quality Score (72%, amber) — to visually make the distinction]"),
  hr(),

  // ── PRODUCT ──────────────────────────────────────────────────────
  h2("Product Posts (6)"),

  h3("PROD-1: Dashboard Overview"),
  b("Hook:"),
  p("This is what a calibration program looks like when all the data is in one place."),
  b("Full post:"),
  p("The CalCheq dashboard gives you the calibration status of your entire site in a single view. Not after building a report. Not after querying the CMMS. Right now, when you log in."),
  p("What you see:\n→ Total instruments and their compliance status (current / due soon / overdue)\n→ Last calibration results across the site (pass / fail / marginal)\n→ Instruments that need attention right now — flagged by due date, failure, or drift\n→ Compliance rate by area — which part of the plant is performing and which isn't\n→ Upcoming calibrations in the next 7 days"),
  p("No filters. No pivot tables. No hunting. It's just there."),
  p("CTA: How long does it currently take you to get this information for your site?"),
  p("[Image idea: CalCheq Dashboard — KPI stat cards at top, instrument health donut chart, area compliance bar chart, upcoming calibrations list]"),
  hr(),

  h3("PROD-2: Due Date Tracking"),
  b("Hook:"),
  p("The most common calibration problem on industrial sites isn't technical. It's visibility."),
  b("Full post:"),
  p("Specifically: knowing what's due, when it's due, and whether it's been done."),
  p("CalCheq tracks every instrument's calibration due date and flags it automatically:\n→ Overdue: past the due date — shown immediately on the dashboard\n→ Due soon: within the next 14 days — flagged before it becomes a problem\n→ Current: within the calibration interval — visible but not urgent"),
  p("When a calibration is completed and approved, the due date updates automatically based on the interval. No manual updates. No spreadsheet formulas. No version control issues."),
  p("Your technicians stop chasing due dates. Your supervisors stop getting surprised by overdue instruments. Your managers get a compliance picture without having to ask for one."),
  p("CTA: How does your site currently track calibration due dates? Spreadsheet, CMMS, email reminders? Curious what's most common."),
  p("[Image idea: Instrument list screen — colour-coded status column showing red Overdue, amber Due Soon, and green Current for a list of instruments]"),
  hr(),

  h3("PROD-3: Drift Alert Feature"),
  b("Hook:"),
  p("CalCheq can tell you which instruments are going to fail before they fail."),
  b("Full post:"),
  p("Not through machine learning or sensor fusion — through your own calibration history."),
  p("Every time an instrument is calibrated, CalCheq captures the as-found error. Over multiple calibrations, it plots the drift trend. When the trend projects an instrument reaching its tolerance limit before the next calibration is due — it flags it."),
  p("The Drift Alerts screen shows:\n→ Each instrument trending toward failure\n→ A sparkline of its drift history\n→ The projected failure date based on current drift rate\n→ Whether it's already marginal or still within tolerance"),
  p("This is how you move from reactive to predictive — using the data you're already collecting."),
  p("CTA: If you knew which instruments were going to fail calibration in the next 3 months — what would you do differently?"),
  p("[Image idea: Drift Alerts tab — list of instruments with sparkline charts, projected failure dates in amber/red, sorted by urgency]"),
  hr(),

  h3("PROD-4: Calibration Certificate & History"),
  b("Hook:"),
  p('\"Can you show me the last three calibrations for this instrument?\"'),
  p("If that question takes more than 30 seconds to answer — there's a better way."),
  b("Full post:"),
  p("In CalCheq, every instrument has a complete calibration history. Every record includes:\n→ Calibration date and type\n→ The technician who performed it\n→ The reference standard used (with cert number and expiry)\n→ As-found and as-left results at each test point\n→ The calculated pass/fail result\n→ Any adjustments made\n→ The supervisor approval"),
  p("Click any record to see the full detail. Or generate a PDF certificate in one click."),
  p("The answer to the auditor's question goes from a 20-minute document hunt to a 15-second lookup."),
  p("CTA: How long does it currently take to retrieve a full calibration record for a specific instrument and date?"),
  p("[Image idea: Instrument Detail — calibration history tab showing past calibrations with pass/fail badges and a Generate Certificate button highlighted]"),
  hr(),

  h3("PROD-5: Approval Workflow"),
  b("Hook:"),
  p("Calibration approval isn't a bureaucratic requirement. It's a quality control step."),
  b("Full post:"),
  p("When a technician completes a calibration, someone with appropriate authority should review it. Not to slow things down — to catch errors, confirm the result is credible, and create an auditable record of sign-off."),
  p("CalCheq's approval workflow makes this practical:\n→ Technician submits a completed calibration record\n→ Supervisor sees it in the Pending Approvals queue with a count badge\n→ Supervisor reviews the test points, result, and reference standard details\n→ Approves or rejects with a comment\n→ The record is locked and the instrument's calibration status updates"),
  p("Every step is timestamped. Every approval is recorded. The audit trail is built automatically."),
  p("CTA: Does your site have a formal calibration approval process? How is it currently managed?"),
  p("[Image idea: Calibrations page — Pending Approvals tab, 4 records awaiting review, one expanded showing full result details]"),
  hr(),

  h3("PROD-6: Beamex / Fluke CSV Import"),
  b("Hook:"),
  p("Your calibrator already has the data. You shouldn't have to retype it."),
  b("Full post:"),
  p("CalCheq supports direct CSV import from Beamex MC6, MC4, and MC2, and Fluke 754, 729, and 726. The import wizard walks you through three steps:"),
  p("1. Upload — drag and drop the CSV exported from your calibrator\n2. Review — CalCheq parses the data and shows you what it found: instrument tag, test points, as-found and as-left values, timestamps\n3. Confirm — map to the correct instrument in your register and import"),
  p("No manual data entry. No transcription errors. The data goes from calibrator to calibration record in minutes."),
  p("For sites doing high volumes of calibration, this is the feature that makes daily use practical."),
  p("CTA: Do you use Beamex or Fluke calibrators? What's your current process for getting data from the calibrator into your records system?"),
  p("[Image idea: 3-step import wizard — Upload screen with drag-drop area, Review screen showing parsed test points, Confirm with success message]"),
  hr(),

  // ── TRUST ────────────────────────────────────────────────────────
  h2("Trust-Building Posts (6)"),

  h3("TRUST-1: The Philosophy Behind CalCheq"),
  b("Hook:"),
  p("Here's what I believe about software for heavy industry:"),
  p("The people who use it know more about their industry than the people who built it. Full stop."),
  b("Full post:"),
  p("My job as a software builder is to understand the problem well enough to build a tool that genuinely helps — and then get out of the way. Not to tell instrumentation professionals how calibration should work."),
  p("CalCheq's design reflects this:\n→ The calibration form captures what technicians actually record, in the language they use\n→ The dashboard shows what supervisors actually need to see, not what a product manager thought was interesting\n→ The pass/fail logic is transparent and matches the calculation method used in calibration engineering"),
  p("I built CalCheq for the people in the field first. If it works for them, everything else follows."),
  p("CTA: What's one thing you wish software built for heavy industry actually understood about your job?"),
  p('[Image idea: Simple quote card — dark navy background, white text — \"Built for the people in the field first.\"]'),
  hr(),

  h3("TRUST-2: What CalCheq Doesn't Do"),
  b("Hook:"),
  p("CalCheq doesn't do everything. And I think that's worth being upfront about."),
  b("Full post:"),
  p("It doesn't integrate with every CMMS (yet — MEX is the priority).\nIt doesn't handle HART device configuration.\nIt doesn't have SIL/functional safety calculations.\nIt doesn't have an offline mobile app (yet — browser works on tablets).\nIt doesn't do SMS notifications."),
  p("These things are on the roadmap. But I'd rather tell you what we don't do than let you find out after you've switched over."),
  p("What CalCheq does very well: calibration records, due date management, pass/fail automation, drift trending, audit readiness, approval workflows, and making calibration data visible to the people who need it."),
  p("If that matches your problem — it's worth a look. If your problem requires what we don't do yet — I'll tell you honestly and stay in touch."),
  p("CTA: What's the capability that would make CalCheq a no-brainer for your site?"),
  p("[Image idea: Clean split-screen — 'What CalCheq does' (green check icons) vs 'What's coming' (amber clock icons)]"),
  hr(),

  h3("TRUST-3: What Good Calibration Management Looks Like"),
  b("Hook:"),
  p("I get asked a lot: what does a well-run calibration program look like?"),
  p("Here's my honest answer — it's not about the software."),
  b("Full post:"),
  p("A well-run calibration program has:\n→ A complete instrument register (every instrument that needs calibration is on it)\n→ Calibration intervals actually based on instrument performance, not just defaults\n→ Technicians who understand the purpose of each test point, not just the procedure\n→ Records that capture as-found results, not just as-left\n→ Someone reviewing and approving calibrations — not rubber-stamping\n→ Visibility at the supervisory level into what's overdue and drifting"),
  p("Software can make all of this easier and more reliable. But the software is the tool, not the program."),
  p("The best calibration programs I've seen are built by people who understand why accurate measurement matters. CalCheq is built to support those people."),
  p("CTA: What's the one element of a calibration program that gets underestimated most?"),
  p("[Image idea: Six-panel grid — one element per panel — illustrated with simple icons and a one-line description each]"),
  hr(),

  h3("TRUST-4: Six Months of Building — Here's What I've Learned"),
  b("Hook:"),
  p("Six months of building CalCheq in public."),
  p("Here's what the experience has taught me that I didn't expect:"),
  b("Full post:"),
  p("1. Industrial software has a trust problem, not a feature problem. The barrier to adoption isn't capability — it's 'will this still work in two years and will someone answer the phone if it doesn't?'"),
  p("2. The best feedback comes from the people who are polite first and give you the real answer later. Value those people enormously."),
  p("3. Specificity is everything. 'Calibration management software for industry' means nothing. 'Calibration management for mining and oil & gas, with Beamex import and drift trending' reaches the right people."),
  p("4. Building something people actually need is a different experience from building something people think they want. The validation loop is slower but the product is better."),
  p("I'll keep sharing this as we go. Building in public keeps me honest."),
  p("CTA: If you've built something for a niche industrial market — what surprised you most about the process?"),
  p("[Image idea: Four numbered lessons in a polaroid-style layout]"),
  hr(),

  h3("TRUST-5: Who CalCheq Is Built For"),
  b("Hook:"),
  p("I want to be specific about who CalCheq is built for."),
  p("Not because exclusivity is a good marketing strategy — but because being specific about fit means better outcomes for everyone."),
  b("Full post:"),
  p("CalCheq is built for:\n→ Industrial sites with 50+ instruments on a calibration schedule\n→ Teams using spreadsheets or CMMS attachments and running into the limits of those tools\n→ Sites where calibration compliance and audit readiness are genuine operational priorities\n→ Instrumentation teams where the supervisor or reliability engineer needs visibility across the program\n→ Organisations in mining, oil & gas, water treatment, power generation, or manufacturing"),
  p("CalCheq is probably not the right fit for:\n→ Very small sites with fewer than 30 instruments (a well-maintained spreadsheet may genuinely be sufficient)\n→ Organisations whose primary challenge is the calibrator hardware itself\n→ Sites looking for a full CMMS replacement"),
  p("Honest fit saves everyone time. If you're in the first group — let's talk."),
  p("CTA: Does this match your situation? If so, I'd love to show you CalCheq."),
  p("[Image idea: Two-column card — 'This is you if...' vs 'Maybe not yet if...' with bullet points in each column]"),
  hr(),

  h3("TRUST-6: What We're Working on Next"),
  b("Hook:"),
  p("Here's what we're working on at CalCheq right now."),
  b("Full post:"),
  p("MEX CMMS integration — for sites already running MEX, a direct sync so calibration results flow into MEX work orders without manual entry. Most requested feature from Australian industrial sites."),
  p("Scheduled report delivery — weekly or monthly PDF compliance reports emailed automatically to supervisors and managers. No logging in. Just the report, on schedule."),
  p("Mobile field access — a better experience for technicians working in the field on tablets. The current browser experience works — we're making it better."),
  p("Why share this publicly? Because building in isolation is how you build the wrong thing. If any of these are relevant to your operation — or if there's something you'd deprioritise in favour of something else — I'd genuinely like to hear it."),
  p("CTA: What would you add to this list? Or push down? Your input literally changes what we build."),
  p("[Image idea: Roadmap card with three upcoming features listed, each with a status indicator (In progress / Planned / Under consideration)]"),
  hr(),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 5: BLOG CONTENT SYSTEM
// ════════════════════════════════════════════════════════════════════
const s5 = [
  h1("Section 5: Blog Content System — 20 Post Outlines"),
  hr(),
  p("All posts can be repurposed across channels. Primary SEO keyword and repurposing options are noted for each."),

  h2("Compliance & Audit (4 posts)"),
  tbl(
    ["#","Title","Outline","Keyword","Repurpose As","Words"],
    [
      ["1","The Instrumentation Calibration Audit Checklist: What Auditors Actually Look For","(1) What auditors check in a calibration audit. (2) The five categories: completeness, traceability, timeliness, results, approvals. (3) How to structure records to make each demonstrable. (4) Common audit findings and how to avoid them.","calibration audit checklist","LinkedIn article, downloadable PDF, email nurture","1,800"],
      ["2","How to Prepare for a Calibration Audit in 30 Days","(1) Assess the current state of your calibration register. (2) Identify gaps: missing records, expired reference standards, unapproved results. (3) Close the gaps systematically. (4) Build a repeatable pre-audit review process.","calibration audit preparation","LinkedIn carousel, email series, SEO page","2,200"],
      ["3","ISO 9001 and Calibration: What You Need to Have and What You Need to Prove","(1) What ISO 9001:2015 clause 7.1.5 requires. (2) The difference between having calibrated instruments and being able to prove it. (3) Records, traceability, and retention requirements. (4) Common non-conformances and how to prevent them.","ISO 9001 calibration requirements","LinkedIn article, guide download","2,000"],
      ["4","What Is Calibration Traceability? (And Why It Matters for Your Audit)","(1) Definition: traceability to national measurement standards. (2) What a traceable calibration certificate must contain. (3) How to verify reference standard certificates are valid. (4) What happens when traceability breaks down.","calibration traceability","LinkedIn educational post, FAQ page","1,500"],
    ]
  ),

  h2("Calibration Best Practice (5 posts)"),
  tbl(
    ["#","Title","Outline","Keyword","Repurpose As","Words"],
    [
      ["5","How to Calculate Calibration Tolerance — The Right Way","(1) The three tolerance types: percent span, percent reading, absolute. (2) Step-by-step calculation for each with examples. (3) How to set appropriate tolerances for different instrument types. (4) Why tolerance setting matters for pass/fail reliability.","calibration tolerance calculation","LinkedIn article, downloadable guide","2,000"],
      ["6","Calibration Intervals: How to Set Them, Review Them, and Optimise Them","(1) How calibration intervals are typically set at commissioning. (2) The case for reviewing intervals based on drift performance data. (3) How to lengthen or shorten intervals based on as-found trends. (4) Risk-based interval management for critical instruments.","calibration interval","LinkedIn article, email","2,200"],
      ["7","As-Found vs As-Left: The Calibration Data Most Plants Are Ignoring","(1) Definitions: as-found vs as-left. (2) Why as-found data is more valuable for maintenance planning. (3) What as-found trends tell you about instrument health. (4) How to use as-found data to improve your program.","as-found calibration","LinkedIn post, email nurture","1,500"],
      ["8","Calibration Documentation Best Practice: What to Record and Why","(1) Minimum required calibration record fields. (2) Additional fields that add audit value. (3) Reference standard documentation requirements. (4) How to structure records for quick retrieval.","calibration documentation","LinkedIn carousel, guide download","1,800"],
      ["9","How to Build a Calibration Register From Scratch","(1) What belongs on a calibration register. (2) How to categorise instruments by criticality and type. (3) Setting due dates, intervals, and tolerance specifications. (4) How to maintain the register as instruments change.","calibration register","LinkedIn article, SEO landing page","2,500"],
    ]
  ),

  h2("Data & Analytics (4 posts)"),
  tbl(
    ["#","Title","Outline","Keyword","Repurpose As","Words"],
    [
      ["10","Drift Analysis in Industrial Instrumentation: What the Data Is Telling You","(1) What instrument drift is and why it happens. (2) How to identify systematic vs random drift from as-found data. (3) Drift rate calculation and trend projection. (4) Using drift data to predict failure dates.","instrument drift analysis","LinkedIn article, downloadable guide","2,200"],
      ["11","Calibration KPIs Every Maintenance Manager Should Be Tracking","(1) Five essential metrics: compliance rate, overdue count, first-pass rate, average as-found error, repeat failure rate. (2) How to calculate each. (3) Industry benchmarks where available. (4) How to use metrics to improve the program.","calibration KPIs","LinkedIn carousel, email, SEO page","2,000"],
      ["12","Predictive Maintenance Using Calibration Data: A Practical Guide","(1) The connection between calibration performance and predictive maintenance. (2) What calibration data can predict. (3) How to set up a drift-based failure prediction system. (4) How CalCheq automates this process.","predictive maintenance calibration","LinkedIn article, guide download","2,500"],
      ["13","How to Identify 'Bad Actor' Instruments in Your Calibration Program","(1) What a bad actor instrument is. (2) How repeat failures indicate systematic problems. (3) The analytical process for identifying bad actors from calibration history. (4) What to do when you find them.","calibration bad actor instruments","LinkedIn post, email","1,500"],
    ]
  ),

  h2("Industry Trends (4 posts)"),
  tbl(
    ["#","Title","Outline","Keyword","Repurpose As","Words"],
    [
      ["14","Why Industrial Software Is Finally Catching Up to Heavy Industry's Needs","(1) The historical gap between enterprise software and industrial operational needs. (2) Why heavy industry has been underserved. (3) The shift toward purpose-built tools. (4) What good industrial software looks like in practice.","industrial maintenance software","LinkedIn thought leadership, email","2,000"],
      ["15","CMMS vs Dedicated Calibration Management: What's the Difference?","(1) What a CMMS does well. (2) Where CMMS falls short for calibration-specific data. (3) The case for a dedicated calibration tool. (4) How to decide which approach suits your site.","CMMS calibration management","LinkedIn article, SEO page","2,200"],
      ["16","The Hidden Costs of Poor Calibration Management in Mining and Resources","(1) Compliance failures. (2) Process quality costs. (3) Downtime from unexpected failures. (4) Rework and investigation. (5) How to build the business case for better calibration management.","calibration management mining","LinkedIn post, email, guide","2,500"],
      ["17","Maintenance Data Strategy: Why Calibration Is Your Most Undervalued Asset","(1) Treating maintenance data as a strategic asset. (2) How calibration data differs from other maintenance data. (3) How to build a calibration data strategy. (4) Business outcomes of better calibration data use.","maintenance data strategy","LinkedIn thought leadership, guide","2,200"],
    ]
  ),

  h2("Product & Platform (3 posts)"),
  tbl(
    ["#","Title","Outline","Keyword","Repurpose As","Words"],
    [
      ["18","How CalCheq Calculates Pass/Fail Results: The Logic Behind the Numbers","(1) The three tolerance types and how each is applied. (2) Calculation logic at each test point. (3) How overall record results are determined. (4) Why transparent pass/fail logic matters for audit credibility.","calibration pass fail calculation","LinkedIn article, help documentation","1,800"],
      ["19","Migrating from Spreadsheets to Calibration Software: A Practical Guide","(1) How to assess whether it's time to move away from spreadsheets. (2) What to do with existing calibration data. (3) How to structure the transition. (4) What to look for in a calibration management system.","calibration software migration","LinkedIn article, guide, email series","2,500"],
      ["20","Beamex and Fluke Calibrator Integration: Eliminating Manual Data Entry","(1) The problem with manual data transfer from calibrators. (2) How CSV import works with Beamex and Fluke hardware. (3) The CalCheq import process step by step. (4) Time savings and error reduction.","Beamex calibration software","LinkedIn article, product page","1,800"],
    ]
  ),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 6: LEAD GENERATION STRATEGY
// ════════════════════════════════════════════════════════════════════
const s6 = [
  h1("Section 6: Lead Generation Strategy"),
  hr(),

  h2("6.1  Profile-as-Funnel Strategy"),
  tbl(
    ["Profile Element","Job","Conversion Goal"],
    [
      ["Headline","Immediately communicate who you help and how","Stop the scroll / trigger follow"],
      ["Profile photo","Build instant trust and human connection","Approachability"],
      ["About section","Tell the story, surface the pain, explain the solution","Click to website / book demo"],
      ["Featured section","Showcase a high-value piece of content (guide, demo link)","Email capture or demo booking"],
      ["Activity / posts","Demonstrate expertise and consistency","Follow growth and ongoing nurture"],
      ["Recommendations","Third-party validation from industry peers","Trust acceleration"],
    ]
  ),

  h2("6.2  CTA Strategy"),
  b("Use a progression from soft to hard CTAs as the relationship warms:"),
  li("Cold audience (first 2 weeks): soft CTAs — comment with your experience, share with your team, follow for more"),
  li("Warming audience (engaged with 3+ posts): medium CTAs — download the guide, read the full article, check out calcheq.com"),
  li("Warm audience (engaged consistently, viewed profile): hard CTAs — book a 15-minute demo, start your free 30-day trial"),
  p("Never lead with a demo request to a cold audience. The trust threshold for booking time hasn't been earned yet."),

  h2("6.3  DM Outreach Framework"),
  p("Use only after someone has engaged with your content (liked, commented, or viewed your profile). Cold DMs to strangers are rarely worth the cost in credibility."),
  b("Template 1 — After a comment on your post:"),
  p('\"Hi [Name], thanks for your comment on [post topic] — your point about [specific thing they said] was exactly the kind of real-world perspective I was hoping to hear. Given your background in [industry/role], I\'d love to know if [specific question related to their situation]. Happy to share a bit more about what we\'re building at CalCheq if it\'s relevant — or just good to have the conversation either way.\"'),
  b("Template 2 — After someone views your profile:"),
  p('\"Hi [Name], noticed you\'d had a look at my profile — thanks for the visit. I build CalCheq, calibration management software for heavy industry. If you\'re dealing with any of the calibration tracking challenges I write about, happy to have a no-pressure chat. Either way, good to connect with someone in [industry/role].\"'),
  b("Template 3 — After a content share:"),
  p('\"Hi [Name], I noticed you shared [post] — really appreciate it. I write for the people doing this work in the field every day, so it means a lot when it reaches someone with real experience. Would love to hear your take on [specific question]. No pitch — just genuinely interested in the view from your role.\"'),

  h2("6.4  Comment Strategy"),
  li("Target posts from instrumentation, reliability, and maintenance professionals with high engagement"),
  li("Add a substantive comment — not 'great post' — that demonstrates domain knowledge"),
  li("Reference your own experience or a CalCheq insight without being promotional"),
  li("Reply to others' comments on the same post to build visibility within that thread"),
  li("Aim for 5–10 quality comments per week, prioritising posts from your target personas"),

  h2("6.5  Connection Request Strategy"),
  b("Who to connect with:"),
  li("Instrumentation technicians and E&I supervisors — most likely to champion CalCheq from the bottom up"),
  li("Reliability engineers and maintenance planners — strategic buyers who understand the value of data"),
  li("Plant managers and maintenance managers in target industries — economic buyers"),
  li("People who have engaged with your content — warm connection, much higher acceptance rate"),
  b("Connection request message template:"),
  p('\"Hi [Name], I build CalCheq — calibration management software built specifically for [their industry]. I write a lot about calibration data and maintenance intelligence, which I suspect overlaps with challenges you deal with. Would be good to connect — no sales pitch, just keen to be in the same network as people doing this work.\"'),

  h2("6.6  Trust-Building Timeline"),
  tbl(
    ["Timeframe","Focus","Realistic Outcome"],
    [
      ["Weeks 1–4","Post consistently, comment actively, grow connections","50–150 new relevant followers, first DM conversations"],
      ["Weeks 5–8","Deepen technical content, share social proof, offer value","Profile views from target personas, 2–5 qualified DMs"],
      ["Weeks 9–12","Introduce CTAs, direct demo invitations, trial offers","First 2–5 demo bookings from LinkedIn"],
      ["Month 4–6","Compounding reach, referrals, content repurposing","10–20 qualified leads per month"],
    ]
  ),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 7: GROWTH TACTICS
// ════════════════════════════════════════════════════════════════════
const s7 = [
  h1("Section 7: Growth Tactics"),
  hr(),

  h2("7.1  Founder-Led Content"),
  p("For early-stage B2B industrial software, founder-led content is the single highest-ROI LinkedIn activity. It works because practitioners trust people, not brands — especially in industries with a track record of overpromised software."),
  b("To sustain it:"),
  li("Batch content creation — write 3 posts in one 2-hour session rather than writing one per day"),
  li("Keep a running list of post ideas from conversations, industry observations, and user feedback"),
  li("Share the process, not just the product — people follow the journey, not the launch"),

  h2("7.2  Niche Networking"),
  b("LinkedIn Groups to engage:"),
  li("Instrumentation & Control Engineers (search for active groups in your region)"),
  li("Reliability Engineering and Asset Management"),
  li("Mining and Resources Industry forums"),
  li("Process Automation and Instrumentation"),
  b("High-value hashtags to use and follow:"),
  li("#calibration  #instrumentation  #predictivemaintenance  #reliabilityengineering  #maintenancemanagement  #heavyindustry  #assetmanagement  #processsafety  #mining  #oilandgas"),

  h2("7.3  Strategic Partnerships"),
  li("Calibrator manufacturers (Beamex, Fluke) — content co-creation; they have the audience you want"),
  li("CMMS vendors (MEX, Pronto) — complementary positioning, not direct competition; integration stories"),
  li("Engineering consulting firms specialising in instrumentation and control"),
  li("Industry associations: MESA, Engineers Australia instrumentation communities"),
  li("Maintenance and reliability consultants who work with the target industries"),

  h2("7.4  Case Study Development (Before Big Logos)"),
  p("You don't need enterprise customers to have compelling social proof. Early-stage case studies should focus on:"),
  li("Problem specificity — describe the exact situation in detail even without naming the company"),
  li("Quantified outcomes — time saved, audit results improved, instruments tracked, overdue items reduced"),
  li("Role-based stories — a technician story, a supervisor story, a manager story — different for each persona"),
  b("Framework:"),
  p('\"[Company type] with [N] instruments was tracking calibration in [old method]. After switching to CalCheq: [specific outcome 1], [specific outcome 2]. The most unexpected benefit was [something non-obvious].\"'),

  h2("7.5  Demo-Driven Content"),
  li("Screen recordings of the dashboard — short, narrated, posted natively to LinkedIn (not YouTube links)"),
  li("'Here's what your calibration program looks like in CalCheq' posts using realistic demo data"),
  li("Before/after comparisons using actual product screenshots"),
  li("Feature announcement posts when new capabilities ship — these consistently outperform general content"),

  h2("7.6  Engagement and Community"),
  li("Reply to every comment within 4 hours — the first hour is particularly important for LinkedIn algorithm reach"),
  li("Ask genuine questions at the end of posts — not engagement bait, but questions you actually want answered"),
  li("When someone writes a particularly useful comment, turn it into a follow-up post (with credit)"),
  li("Create a quarterly 'what the community taught me' post — aggregates insights from comments and DMs"),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 8: COMPETITIVE MESSAGING
// ════════════════════════════════════════════════════════════════════
const s8 = [
  h1("Section 8: Competitive Advantage Messaging"),
  hr(),

  h2("8.1  vs. Spreadsheets"),
  tbl(["Element","Content"], [
    ["Pain point","Spreadsheets create invisible risk: missed due dates buried in rows, as-found trends that exist nowhere, audit preparation that takes days, and version control that makes the register unreliable"],
    ["Contrast statement","Spreadsheets are general-purpose tools being asked to do a specialist job. They can store calibration data. They can't analyse it, surface trends, enforce approval workflows, or tell you which instruments are overdue without being asked."],
    ["CalCheq advantage","Purpose-built for calibration: due dates tracked automatically, as-found trends calculated from every record, audit reports generated in seconds, approval workflows that create a traceable record by design"],
    ["One-liner","\"Still using Excel for calibration? You're storing data without using it.\""],
  ]),

  h2("8.2  vs. CMMS Attachment Workflows"),
  tbl(["Element","Content"], [
    ["Pain point","CMMS systems are designed for work orders and asset registers, not calibration-specific data capture. Calibration records stored as PDF attachments to work orders are inaccessible for trending, impossible to query, and create an audit nightmare"],
    ["Contrast statement","Your CMMS wasn't built for calibration. It was built for work order management. Calibration data attached to a work order is stored — but it's not structured, queryable, or analysable."],
    ["CalCheq advantage","Calibration-first data structure: every test point is captured in a structured format, enabling trend analysis, automated pass/fail, compliance reporting, and drift alerting that CMMS attachment storage cannot provide"],
    ["One-liner","\"Your CMMS stores calibration PDFs. CalCheq uses calibration data.\""],
  ]),

  h2("8.3  vs. Legacy Calibration Systems"),
  tbl(["Element","Content"], [
    ["Pain point","Legacy calibration management systems were built in an era of desktop software and compliance-first thinking. They're often expensive, inflexible, require on-premise infrastructure, and lack modern analytics capabilities"],
    ["Contrast statement","Legacy systems built for compliance capture what you did. CalCheq is built for intelligence — capturing what you did and what it means for the maintenance program going forward."],
    ["CalCheq advantage","Modern architecture (cloud, web, mobile-accessible), intuitive UI for field technicians, built-in analytics and drift trending, Beamex and Fluke integration, transparent pricing"],
    ["One-liner","\"Built for compliance, not intelligence. There's a difference.\""],
  ]),

  h2("8.4  vs. Generic Asset Management Tools"),
  tbl(["Element","Content"], [
    ["Pain point","Generic asset management platforms cover many things broadly but calibration specifically poorly. Calibration-specific fields, tolerance calculations, test point structures, and as-found/as-left tracking require specialisation that generic tools don't provide"],
    ["Contrast statement","Calibration has specific requirements: tolerance types, test point structures, as-found vs as-left tracking, approval workflows, reference standard traceability. Generic asset management tools add these as afterthoughts — if at all."],
    ["CalCheq advantage","Every feature is designed for calibration: the data model, the calculation logic, the approval workflow, the reporting structure — all built specifically for how calibration works in heavy industry"],
    ["One-liner","\"Calibration needs its own system. Not a module bolted onto something else.\""],
  ]),

  h2("8.5  vs. Reactive Maintenance Culture"),
  tbl(["Element","Content"], [
    ["Pain point","Sites that manage calibration reactively — responding to overdue notifications, failures, and audit findings rather than proactively managing performance — pay a hidden cost in process risk, rework, and audit exposure"],
    ["Contrast statement","Reactive calibration management means you find out an instrument was out of tolerance when the calibration happens — or worse, at the audit. Proactive management means you see it coming: drift trends, projected failure dates, interval reviews based on real performance data."],
    ["CalCheq advantage","Drift alerting, bad actor identification, compliance rate trending, and projected failure dates give maintenance teams the foresight to act before instruments fail — shifting from reactive to proactive without requiring additional resources"],
    ["One-liner","\"What if you could see calibration problems before they become production problems?\""],
  ]),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 9: VISUAL CONTENT IDEAS
// ════════════════════════════════════════════════════════════════════
const s9 = [
  h1("Section 9: Visual Content Ideas"),
  hr(),

  h2("9.1  Infographic Concepts"),
  tbl(["#","Title","Description"], [
    ["1","The Calibration Audit Checklist","Vertical checklist with 5 sections (Completeness, Traceability, Timeliness, Results, Approvals). Each section has 3–4 sub-items. Colour-coded: green for best-practice, amber for common gaps. A4 format. CalCheq logo footer."],
    ["2","How Drift Trending Works","Three-panel horizontal infographic: Panel 1 — calibration data over time as dots; Panel 2 — drift trend line with tolerance band overlaid; Panel 3 — projected failure date with a red marker. Engineering-style visual."],
    ["3","Reactive vs Proactive Calibration Management","Two-column comparison. Left (Reactive): red-toned icons, 'find out when it fails', 'scramble before the audit'. Right (Proactive): green-toned icons, 'see failure coming', 'always audit-ready'. CalCheq as the path from left to right."],
    ["4","The Real Cost of a Missed Calibration","Iceberg graphic. Above water: 'The calibration fee'. Below: 'Process measurement error period', 'Product quality risk', 'Audit finding', 'Investigation cost', 'Insurance exposure', 'Rework cost'. Dark blue water, white text."],
    ["5","Calibration Data: Captured vs Used","Two circles (Venn-style). Left: 'Data captured at every calibration' — as-found, as-left, test points, reference standard, technician, date. Right: 'Data being used' — usually just pass/fail and date. Tiny overlap. Message: the data exists; the system to use it doesn't."],
  ]),

  h2("9.2  Before / After Post Ideas"),
  tbl(["#","Before","After"], [
    ["1","Finding overdue instruments: Filter 3 columns in a spreadsheet, cross-reference a second tab, check formula in column P, email the supervisor → 20 minutes","CalCheq dashboard: overdue instruments shown in red on login → 10 seconds"],
    ["2","Preparing for an audit: 2 days pulling records from email, CMMS attachments, a shared drive, and a colleague's desktop → partial report with gaps","CalCheq: filter by date range and area, export PDF → 3 minutes"],
    ["3","Identifying drift trends: Export from CMMS, paste into Excel, build a chart manually, interpret the trend → one afternoon","CalCheq drift alerts: open the tab, see sparklines and projected failure dates → instant"],
    ["4","New technician calibration workflow: Complete paper form in field, return to office, enter into spreadsheet, email to supervisor → 2-day lag on records","CalCheq: submit calibration on tablet in the field, supervisor notified immediately → same-day records"],
    ["5","Reference standard traceability: Search email for the cert PDF, check if expiry has passed → often not found without a search","CalCheq: cert number and expiry stored per calibration record, expiry flagged automatically → always traceable"],
  ]),

  h2("9.3  Product Screenshot Concepts"),
  tbl(["#","Screen","What It Shows"], [
    ["1","Dashboard — site overview","Four KPI stat cards (Total Instruments: 247, Overdue: 12, Due This Week: 8, Compliance Rate: 94.6%). Instrument Health donut chart. Area compliance bar chart for 6 plant areas. Upcoming calibrations sidebar list."],
    ["2","Instrument List — filtered view","Paginated table with columns: Tag Number, Description, Area, Type, Due Date (colour-coded badges), Last Result (pass/fail/marginal). Filter showing 'Status: Overdue' — 12 instruments visible with red badges. CSV export button visible."],
    ["3","Instrument Detail — drift trend","Single instrument view for FT-203A. Calibration trend chart with as-found error percentage over 8 calibrations. Tolerance band overlaid. Trend line moving toward tolerance limit. Projected failure date marker shown. History table below."],
    ["4","Smart Diagnostics — Drift Alerts","List of 8 at-risk instruments, each with a mini sparkline chart, a projected failure date, and a status badge (Marginal / At Risk / Approaching Tolerance). Sorted by urgency. Filter options at top. Export to PDF button."],
    ["5","Calibration Form — test point entry","As-found / as-left test point grid. Five test points: 0%, 25%, 50%, 75%, 100% of range. Columns: Nominal Input, Expected Output, As-Found Output, As-Found Error %, As-Left Output, As-Left Error %, Result. Pass results in green, one marginal in amber."],
  ]),

  h2("9.4  Carousel Post Outlines"),

  h3("Carousel 1: '5 Signs Your Calibration Program Is Running on Hope'"),
  li("Slide 1 (Cover): Title, CalCheq branding, industrial background"),
  li("Slide 2: Sign 1 — 'You don't know your overdue count without building a report'"),
  li("Slide 3: Sign 2 — 'Your last audit prep took more than a day'"),
  li("Slide 4: Sign 3 — 'You can't see which instruments are drifting toward failure'"),
  li("Slide 5: Sign 4 — 'A new technician can't find calibration history without asking someone'"),
  li("Slide 6: Sign 5 — 'Your calibration register lives in a file that someone might have updated last month. Or might not have.'"),
  li("Slide 7 (CTA): 'If three or more of these sound familiar — CalCheq was built for this. Try it free at calcheq.com'"),

  h3("Carousel 2: 'What Auditors Check — and How CalCheq Makes It Easy'"),
  li("Slide 1 (Cover): 'Audit ready in 3 minutes, not 3 days'"),
  li("Slide 2: Completeness — 'Every instrument that should have been calibrated, was.' (CalCheq: compliance rate dashboard, overdue tracker)"),
  li("Slide 3: Traceability — 'Every calibration traces back to a reference standard with a valid cert.' (CalCheq: reference standard fields on every record)"),
  li("Slide 4: Timeliness — 'Calibrations were done on schedule — and you can prove it.' (CalCheq: due date tracking with timestamps)"),
  li("Slide 5: Results — 'Pass/fail results are documented and failures have corrective action.' (CalCheq: automated pass/fail, approval workflow)"),
  li("Slide 6: Approvals — 'Someone with authority reviewed and signed off each record.' (CalCheq: supervisor approval with timestamp)"),
  li("Slide 7 (CTA): 'CalCheq builds your audit trail automatically — so the answer is always ready.'"),

  h3("Carousel 3: 'Drift Trending in 60 Seconds'"),
  li("Slide 1 (Cover): 'What is drift trending, and why does it matter?'"),
  li("Slide 2: 'Every calibration produces an as-found reading — what the instrument was doing before adjustment.'"),
  li("Slide 3: 'Plot those readings over time and you get a drift trend.' (Simple line graph graphic)"),
  li("Slide 4: 'A stable instrument stays near zero error. A drifting instrument moves toward its tolerance limit.'"),
  li("Slide 5: 'If the trend continues, you can project when it will reach the limit — before it gets there.'"),
  li("Slide 6: 'That's predictive maintenance — using calibration data you're already collecting.'"),
  li("Slide 7: 'CalCheq does this automatically for every instrument on your register.' (Product screenshot)"),
  li("Slide 8 (CTA): 'Try CalCheq free — see your drift trends on day one.'"),

  h2("9.5  Short-Form Video Concepts"),

  h3("Video 1: 'The 30-Second Calibration Dashboard Tour' (30 sec)"),
  li("0–5s: 'This is what your calibration program looks like when all the data is in one place.'"),
  li("5–15s: Dashboard walkthrough — overdue count, compliance rate, instrument health donut, area chart"),
  li("15–25s: Drill down — click on an overdue instrument, show calibration history and drift trend"),
  li("25–30s: CTA — 'Try CalCheq free. 30-day trial, no credit card.'"),
  li("Format: Screen recording with voiceover. Captions mandatory. Navy text overlays for key stats."),

  h3("Video 2: 'Why I Built CalCheq' (60 sec)"),
  li("0–10s: 'I spent years on industrial sites watching calibration data disappear into spreadsheets and CMMS folders. Here's why I decided to fix it.'"),
  li("10–35s: The pattern across sites — invisible drift, audit scrambles, data that exists but can't be used"),
  li("35–50s: 'CalCheq is purpose-built for this. Every calibration record is structured, searchable, and automatically analysed.'"),
  li("50–60s: 'If this is your problem too — calcheq.com. 30 days free.'"),
  li("Format: Founder to camera. Authentic, non-scripted feel. Simple background. Captions."),

  h3("Video 3: 'Beamex CSV Import in 2 Minutes' (45 sec)"),
  li("0–5s: 'Your Beamex has the data. You shouldn't have to retype it.'"),
  li("5–35s: Screen recording of the import wizard — drag and drop CSV, review parsed test points, confirm import"),
  li("35–40s: Show the resulting calibration record populated with all test point data"),
  li("40–45s: 'Try CalCheq with your own calibrator data. Free for 30 days.'"),
  li("Format: Screen recording with voiceover. Fast-paced, confident delivery."),

  h2("9.6  Industrial Meme Concepts"),

  h3("Meme 1: The Calibration Register"),
  p("Format: 'Is this a pigeon?' meme template."),
  p("Character labelled 'Calibration supervisor'. Butterfly labelled 'A colour-coded spreadsheet with 7 hidden columns'. Caption: 'Is this a calibration management system?'"),
  p("Target: E&I supervisors who've lived this. Tone: wry, not mean."),

  h3("Meme 2: The Audit Scramble"),
  p("Format: 'This is fine' dog in burning room."),
  p("Dog labelled 'Me, the day before an audit'. Room on fire labelled 'The calibration register hasn't been updated since March'. Cup labelled 'Coffee'."),
  p("Caption: 'Totally fine. Everything is fine.'"),

  h3("Meme 3: The CMMS Calibration Record"),
  p("Format: 'Expectation vs Reality' two-panel meme."),
  p("Expectation: A structured calibration report with test points, tolerances, as-found/as-left values, and trend charts."),
  p("Reality: A PDF attachment on a work order. File named 'Calibration_FT202_v3_FINAL_actually_final.pdf'."),
  p("Caption: 'Your CMMS was not built for this.'"),

  pg(),
];

// ════════════════════════════════════════════════════════════════════
// SECTION 10: EXECUTION PLAN
// ════════════════════════════════════════════════════════════════════
const s10 = [
  h1("Section 10: Execution Plan & First 10 Leads"),
  hr(),

  h2("10.1  Weekly Execution Workflow"),
  tbl(
    ["Day","Activity","Time"],
    [
      ["Monday","Write and schedule all three posts for the week. Engage with comments from Friday's post. Comment on 3–5 posts from target personas.","~2.5 hours"],
      ["Tuesday","Reply to comments from Monday's post. Send 2–3 personalised connection requests to people who engaged with content or fit the ideal customer profile.","~30 minutes"],
      ["Wednesday","Review post performance from Monday. Check for DM opportunities. Engage with comments on Wednesday's post (posted via scheduler).","~30 minutes"],
      ["Thursday","Research and note 3 new post ideas from industry conversations, observations, or user feedback. Add to the content bank.","~30 minutes"],
      ["Friday","Engage with comments on Friday's post. Weekly check: new followers, profile views, DM conversations started, demo bookings.","~30 minutes"],
    ]
  ),

  h2("10.2  Content Batching System"),
  p("Goal: create one week of content in a single 2-hour Monday morning session."),
  li("Keep a running ideas list (Notion, Notes, or a doc) — add to it immediately when an idea surfaces"),
  li("At the start of each week, pick 3 ideas from the list spanning different content types"),
  li("Write all three posts back-to-back — the writing momentum carries across posts"),
  li("Use the post bank in Section 4 as a template — adapt rather than starting from scratch"),
  li("Schedule all three posts immediately using LinkedIn's native scheduler (Mon / Wed / Fri)"),
  li("Done. No daily writing pressure."),

  h2("10.3  Performance Metrics to Track"),
  tbl(
    ["Metric","Track How Often","Target (Month 3)"],
    [
      ["Follower count (founder profile)","Weekly","500+ relevant followers"],
      ["Post impressions (average)","Per post","1,000+ impressions per post"],
      ["Engagement rate","Per post","3%+ (likes + comments + shares / impressions)"],
      ["Profile views","Weekly","50+ per week"],
      ["DM conversations started","Weekly","5+ per week"],
      ["Demo bookings from LinkedIn","Monthly","3–5 per month by Month 3"],
      ["Free trial sign-ups attributed to LinkedIn","Monthly","5–10 per month by Month 3"],
    ]
  ),

  h2("10.4  Monthly Review Process"),
  p("At the end of each month, spend 30 minutes reviewing:"),
  li("Which posts performed best — and why (topic, format, hook, timing)"),
  li("Which content type drove the most profile views and DM conversations"),
  li("Which hashtags generated the most non-follower reach"),
  li("What the top comments said — these are your best ideas for next month's content"),
  li("How many warm leads you have in active DM conversations"),
  li("Whether next month's content calendar reflects what's working"),

  h2("10.5  Fastest Path to First 10 Qualified Leads"),

  h3("Target Personas"),
  tbl(
    ["Persona","Job Titles","Industries","Company Size"],
    [
      ["Champion (bottom-up)","Instrumentation Technician, E&I Technician, Lead Technician, Calibration Technician","Mining, Oil & Gas, Water Treatment, Power Generation","50–2,000 employees"],
      ["Technical Buyer","E&I Supervisor, Reliability Engineer, Maintenance Engineer, Instrumentation Engineer","Mining, Oil & Gas, Water Treatment, Manufacturing","100–5,000 employees"],
      ["Economic Buyer","Maintenance Manager, Plant Manager, Engineering Manager, Asset Manager","Mining, Oil & Gas, Water Treatment, Power Generation, Manufacturing","200–5,000 employees"],
    ]
  ),

  h3("First 2 Weeks — What to Post"),
  b("Week 1: Establish who you are and why you're credible."),
  li("Post 1 (Mon): Origin story — why CalCheq was built (STORY-1). This is your most important first post. It sets the tone."),
  li("Post 2 (Wed): Educational — as-found vs as-left data (EDU-3). Technical credibility with practitioners."),
  li("Post 3 (Fri): Thought leadership — the calibration data hiding in your CMMS (TL-2 adapted). Problem framing."),
  b("Week 2: Deepen authority, start building direct engagement."),
  li("Post 4 (Mon): Educational — 5 signs your calibration program is running on hope (EDU-1 adapted). High shareability."),
  li("Post 5 (Wed): Product — CalCheq dashboard overview (PROD-1). First product mention — done after establishing credibility."),
  li("Post 6 (Fri): Audit post (EDU-2) — what auditors look for. Reaches compliance-conscious personas."),

  h3("CTA to Use in the First 2 Weeks"),
  p("Do NOT use a demo request CTA in the first two weeks. Use:"),
  li("'Comment with your experience' — generates engagement data and DM opportunities"),
  li("'What's the question your current system can't answer?' — surfaces specific pain points"),
  li("'Follow for more from the field' — grows audience"),
  p("Introduce a trial CTA only from Week 3 onward, and only on product posts."),

  h3("Profile Elements That Matter Most"),
  li("Headline — must contain the industry (heavy industry / mining / oil & gas) and the problem being solved"),
  li("Featured section — link directly to calcheq.com and one high-value piece of content"),
  li("About section — origin story in the first three lines, product value proposition in the middle, CTA at the end"),
  li("Recent activity — visible when someone visits your profile; must show consistent, credible content"),

  h3("Daily Actions — First 30 Days"),
  tbl(
    ["Day","Action","Time"],
    [
      ["Monday","Batch write and schedule 3 posts. Comment on 5 target persona posts.","2.5 hrs"],
      ["Tuesday","Reply to all comments from Monday's post. Send 3 connection requests with personalised notes to people who engaged or fit ICP.","30 min"],
      ["Wednesday","Check DMs. Reply to all comments on Wednesday's post. Comment on 3 more target posts.","30 min"],
      ["Thursday","Add 3 ideas to content bank. Research one target company for personalised outreach.","20 min"],
      ["Friday","Reply to all comments on Friday's post. Weekly review: followers, profile views, DM count.","30 min"],
    ]
  ),

  h3("How to Identify Warm Leads from Engagement Signals"),
  p("A warm lead has done one of these:"),
  li("Comments substantively on two or more of your posts — they're a practitioner who finds the content relevant"),
  li("Shares your post to their feed — they think it's good enough to associate with their name"),
  li("Sends you a connection request after viewing a post or your profile"),
  li("Views your profile after engaging with a post — they're checking you out"),
  li("Responds to a DM with a question rather than a brush-off"),
  p("When any of these happen: move to a personalised DM within 24 hours."),

  h3("DM Templates for Converting Interest to Demo Bookings"),
  b("Template — Converting a warm commenter:"),
  p('\"Hi [Name], really appreciated your comment on [post] — the point you made about [specific detail] is exactly the kind of real-world insight I was hoping to surface. Given what you described about your setup, I think CalCheq might be worth 15 minutes of your time. Not a sales pitch — I\'d rather show you the product and get your honest reaction from someone who clearly knows the space. Would you be open to a quick screen share this week?\"'),
  b("Template — Converting someone who viewed your profile:"),
  p('\"Hi [Name], I noticed you\'d checked out my profile — thanks for the visit. I build CalCheq, calibration management software for heavy industry. Given your role at [company], I suspect we\'re solving a problem you\'ve run into. I\'d be happy to show you the product in 15 minutes — or if you\'d rather start with the free trial at calcheq.com, that works too. Either way, good to connect.\"'),
  b("Template — After a free trial sign-up from LinkedIn:"),
  p('\"Hi [Name], I saw you\'ve started a CalCheq trial — thank you. I\'m the founder, and I personally reach out to every new trial user in the first week. Happy to answer questions, walk you through anything that isn\'t obvious, or just hear what problem you\'re trying to solve. What does your calibration setup look like right now?\"'),

  h3("Summary: The 10-Lead Roadmap"),
  tbl(
    ["Lead #","Source","Timeline","Conversion Path"],
    [
      ["1–2","Founder's existing network","Week 1–2","Origin story post → DM from known contact → demo booked"],
      ["3–4","Post engagement (commenters)","Week 3–4","Educational post commenter → personalised DM → 15-min call"],
      ["5–6","Profile views after posts","Week 4–6","Post triggers profile view → DM sent → demo or trial"],
      ["7–8","Direct free trial sign-ups","Month 2","CTA post → calcheq.com → trial start → founder DM"],
      ["9–10","Referrals from early engagers","Month 2–3","Engaged follower shares post → warm intro → demo"],
    ]
  ),

  new Paragraph({ spacing: { before: 300 } }),
  quote("The first 10 leads don't require a large audience. They require consistent, specific content that reaches the right people — and a founder willing to have real conversations."),
];

// ════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ════════════════════════════════════════════════════════════════════

const doc = new Document({
  title: "CalCheq LinkedIn Brand Growth System",
  sections: [{
    properties: {
      page: {
        size: {
          width:  convertInchesToTwip(8.27),
          height: convertInchesToTwip(11.69),
        },
        margin: {
          top:    convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left:   convertInchesToTwip(1.1),
          right:  convertInchesToTwip(1.1),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CalCheq — LinkedIn Brand Growth System  |  Page ", size: 16, color: "888888", font: "Calibri" }),
              new SimpleField("PAGE"),
            ],
          }),
        ],
      }),
    },
    children: [
      ...cover,
      ...s1, ...s2, ...s3, ...s4, ...s5,
      ...s6, ...s7, ...s8, ...s9, ...s10,
    ],
  }],
});

Packer.toBuffer(doc)
  .then((buf) => {
    const out = "CalCheq-LinkedIn-Brand-Growth-System.docx";
    fs.writeFileSync(out, buf);
    console.log(`Written: ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
  })
  .catch((err) => {
    console.error("ERROR:", err);
    process.exit(1);
  });
