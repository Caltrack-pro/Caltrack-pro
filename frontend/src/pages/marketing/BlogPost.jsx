import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

// ─────────────────────────────────────────────────────────────────────────────
// Article content
// ─────────────────────────────────────────────────────────────────────────────

const ARTICLES = {
  'pressure-transmitter-procedure': {
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔩',
    title: 'How to Calibrate a Pressure Transmitter: A Step-by-Step Field Procedure',
    date: 'April 2026',
    readTime: '8 min read',
    sections: [
      {
        heading: 'Scope and Applicability',
        body: `This procedure covers the calibration of a 4–20 mA two-wire pressure transmitter using a handheld pressure source and a calibrated digital multimeter or loop calibrator. It is applicable to gauge, absolute, and differential pressure transmitters used in process measurement. The same five-point method applies regardless of manufacturer.

Before starting, confirm the following: the calibration interval for this instrument is due or overdue; a valid calibration certificate is held for the reference standard you are using; the instrument has been isolated from the process and depressurised; and if the transmitter is in a safety instrumented system, the appropriate bypass or inhibit is in place per your management of change procedure.`
      },
      {
        heading: 'Equipment Required',
        body: `You will need a calibrated pressure source with an output range that covers at least 110% of the transmitter's upper range value (URV). For most process transmitters this will be a hand pump with a digital reference gauge, or a purpose-built loop calibrator such as a Beamex MC6 or Fluke 729. The reference standard must have a valid calibration certificate traceable to NATA-accredited standards or equivalent national measurement standards.

Additionally: a 24 VDC loop power supply (if the transmitter requires external power), a 250 Ω resistor for reading the 4–20 mA output as a millivolt signal if your reference standard does not have a built-in mA input, and a HART communicator if the transmitter requires range changes or trim via digital protocol.`
      },
      {
        heading: 'Pre-Calibration As-Found Check',
        body: `The as-found check is the most important part of the calibration. It records the transmitter's accuracy before any adjustment is made, which is what matters for compliance and process risk assessment purposes.

Apply each of the five test inputs in the upscale direction and record the transmitter's output. Standard test points are 0%, 25%, 50%, 75%, and 100% of span — which correspond to the LRV (lower range value), quarter-span, mid-span, three-quarter-span, and URV of the transmitter. For a transmitter ranging 0–600 kPa, the test inputs would be 0, 150, 300, 450, and 600 kPa, with expected outputs of 4.00, 8.00, 12.00, 16.00, and 20.00 mA respectively.

Record the actual output at each test point. Calculate the absolute error (actual minus expected) and the percentage-of-span error at each point. The worst-case error determines the overall as-found result. If any point exceeds the stated tolerance (for example, ±0.5% of span = ±0.08 mA on a 16 mA span), the as-found result is "fail."

Do not make any adjustments before completing the as-found test. The as-found data is the historical record of how the instrument was performing.`
      },
      {
        heading: 'Zero and Span Adjustment',
        body: `If the as-found test shows any test point outside tolerance, an adjustment is required. Most transmitters allow zero and span adjustment either via external zero/span screws, via local pushbuttons, or via HART trim commands.

Zero adjustment: apply 0% input (LRV). Trim the output to exactly 4.00 mA (or the equivalent for HART digital output). This sets the zero intercept of the transfer function.

Span adjustment: apply 100% input (URV). Trim the output to exactly 20.00 mA. This sets the slope. Note that adjusting span does not affect zero — but adjusting zero shifts the entire output curve, which changes the apparent span reading slightly. For this reason, always adjust zero first, then span, then verify both again.

For HART transmitters, use the Lower Trim and Upper Trim commands in your communicator rather than mechanical screws where possible — this gives you a more precise adjustment and creates a HART configuration record.

If the zero or span drift exceeds approximately ±2% of span, investigate before simply adjusting: this level of drift may indicate a failing cell, moisture ingress, or process contamination rather than normal calibration drift.`
      },
      {
        heading: 'As-Left Verification and Documentation',
        body: `After any adjustment, repeat the full five-point test in the upscale direction. This is the as-left check. All five test points must pass within tolerance before the instrument can be returned to service. Record the as-left readings with the same level of detail as the as-found readings.

For ISO 17025 and ISO 9001 compliance, your calibration record must include: the instrument tag number and serial number; the date of calibration; the technician's name; the reference standard description, serial number, certificate number, and certificate expiry date; whether the instrument was adjusted; the as-found and as-left readings at all five test points; and the name of the supervisor who reviewed and approved the record.

Return the instrument to service only after the as-left test passes and the record has been submitted for supervisor approval. Update the calibration due date accordingly — calculated from the date of calibration, not the date of the previous due date.`
      },
      {
        heading: 'Common Problems and How to Identify Them',
        body: `Zero drift without span drift: the output curve has shifted parallel to the correct slope. Most commonly caused by overpressure events, ambient temperature change, or static pressure effect on differential pressure transmitters. Correct with zero adjustment.

Span drift without zero drift: the slope of the transfer function has changed but the zero is correct. Often indicates sensing element fatigue or a reference pressure port issue on DP transmitters. If span drift exceeds 1% per calibration interval consistently, consider shortening the interval or investigating the root cause.

Non-linearity (errors at mid-span points that don't fit a straight line): indicates cell degradation or contamination. A zero and span adjustment will not fully correct this — the instrument may need replacement if mid-span errors remain outside tolerance after adjustment.

Inconsistent as-found readings (the reading changes while you hold a constant input pressure): usually indicates a process fluid fill in impulse lines that has not been fully drained, a leaking isolation valve, or a partially blocked port. Resolve the installation issue before continuing the calibration.`
      },
    ],
  },

  'iso-17025-audit': {
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '📋',
    title: "ISO/IEC 17025 Audit? Here's What Your Calibration Records Actually Need",
    date: 'February 2026',
    readTime: '7 min read',
    sections: [
      {
        heading: 'What Auditors Are Actually Looking For',
        body: `ISO/IEC 17025 is the international standard for testing and calibration laboratories. If your facility uses instruments whose calibration must be traceable to national or international measurement standards — and most industrial sites that are serious about quality need this — then your calibration records are subject to scrutiny.

Many maintenance teams are surprised during their first external audit to find that their calibration records, even when they exist, are missing fields that auditors consider mandatory. Here is a breakdown of what's required and how Calcheq addresses each requirement.`
      },
      {
        heading: 'Measurement Traceability (Clause 6.5)',
        body: `Every calibration result must be traceable back to national measurement standards. In practice, this means recording the reference standard used for each calibration: its description, serial number, calibration certificate number, and the certificate expiry date.

Calcheq captures all four fields on every calibration record. When a reference standard certificate is approaching expiry, the system can flag this — ensuring your calibrations are never performed with an out-of-date reference standard, which would invalidate the traceability chain entirely.`
      },
      {
        heading: 'Uncertainty and Error Documentation (Clause 7.6)',
        body: `Auditors expect to see not just a pass/fail outcome but the actual as-found and as-left readings at each test point, along with the calculated error. A record that says "calibrated and found acceptable" with no supporting data will almost certainly generate a finding.

Calcheq records as-found and as-left outputs at every test point, calculates absolute error and percentage-of-span error automatically, and applies your tolerance settings to determine pass, marginal, or fail at each point. The overall record result is determined by the worst individual point result — no manual judgement required.`
      },
      {
        heading: 'Adjustment Documentation (Clause 7.7)',
        body: `Where adjustments are made, the standard requires documentation of what was adjusted, why, and confirmation that the instrument was verified post-adjustment. Calcheq handles this through the "as-left" data fields and the adjustment notes section, ensuring there is always a clear before-and-after record for any intervention.

The system also flags when an adjustment was made versus when a calibration was completed without adjustment — an important distinction for audit purposes.`
      },
      {
        heading: 'Personnel Competency and Record Authorisation',
        body: `Clause 6.2 requires that calibrations are performed by competent personnel. While Calcheq does not manage personnel qualification records directly, every calibration record captures the technician's name and the supervisor who approved the record. This creates a clear chain of accountability.

For facilities that need to demonstrate personnel competency to auditors, the Calcheq record set provides the "who did this calibration" evidence. You would supplement this with your own training records linked to the same individual.`
      },
      {
        heading: 'Preparing for Your Next Audit',
        body: `If your next ISO/IEC 17025 surveillance audit is approaching, the Calcheq Reports section allows you to generate a complete calibration history for any instrument or date range in seconds. This includes all test point data, reference standard details, approval records, and adjustment notes — everything an auditor needs to verify your compliance, formatted ready to present.

Many of our customers report that audit preparation time dropped from several days to under two hours after deploying Calcheq. The data is always current, always complete, and always in the same format.`
      },
    ],
  },

  'paper-to-digital': {
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '📄',
    title: 'Moving Off Paper Calibration Logs: A Practical Guide for Maintenance Teams',
    date: 'January 2026',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Why Teams Stay on Paper Longer Than They Should',
        body: `The question maintenance managers most often ask before making the switch is: "If paper works well enough, why change?" The honest answer is that paper rarely works as well as it feels like it does — it just hides its failures well.

Lost records only become apparent during an audit. Overdue instruments only surface when someone happens to check the binder. Trends in instrument drift are invisible because nobody is aggregating data across hundreds of records. The system feels fine right up until it isn't.

But the real reason teams stay on paper is comfort. The workflow is familiar. Everyone knows how to do it. Change takes time and there's always something more urgent to deal with. This guide is designed to show you that the switch is simpler than you think.`
      },
      {
        heading: 'Step 1: Take Stock of What You Have',
        body: `Before migrating to any digital system, you need a clear picture of your instrument inventory. This does not have to be perfect on day one — it just needs to be complete enough to be useful.

Create a simple spreadsheet listing each instrument with: tag number, description, plant area, calibration interval (in days), last calibration date, and the result of that calibration (pass, fail, or unknown). If you have paper records, extract this information. If you have a CMMS like Maximo, SAP PM, or Infor, export the relevant data.

This asset register is the foundation. Everything else builds on it.`
      },
      {
        heading: 'Step 2: Import Your Data',
        body: `Calcheq accepts a CSV import for bulk instrument creation. Once you have your spreadsheet in the right format, uploading 500 instruments takes the same time as uploading 5. Your system will be populated on day one rather than month six.

Map your columns to Calcheq's fields: tag_number, description, area, unit, instrument_type, manufacturer, model, serial_number, calibration_interval_days, last_calibration_date, last_calibration_result. Any unmapped fields can be filled in later — the goal is to get working, not to achieve perfection before you start.`
      },
      {
        heading: 'Step 3: Establish Your Workflow',
        body: `Before going live, agree with your team on how the new workflow will look. The two most common approaches are:

Parallel operation (lower risk): Continue paper records for one to two months while technicians enter records into Calcheq as well. This gives the team time to build confidence and identify any gaps before the paper system is retired.

Direct cutover (faster): Stop paper records on a set date and move fully to Calcheq. This works well for teams with strong buy-in and where the maintenance supervisor is championing the change actively.

For most teams, a two-week parallel period is a good balance — long enough to catch issues, short enough that people don't revert to only doing the paper version.`
      },
      {
        heading: 'Step 4: Get the Team on Board',
        body: `The biggest predictor of whether a digital system sticks is whether the people who have to use it every day feel like it makes their life easier, not harder.

Focus the technician training on two things: how to check what is due today, and how to enter a calibration result after completing the work. Those two actions cover 95% of daily usage. Everything else — reports, approvals, trend charts — is for supervisors and can be covered separately.

Calcheq's mobile-friendly interface means technicians can enter records on a tablet in the field immediately after completing the calibration, rather than writing it on paper and re-entering it later. This alone eliminates a major source of transcription error and data loss.`
      },
      {
        heading: 'Step 5: Retire the Paper',
        body: `Once the team is comfortable and you have two to four weeks of digital records in the system, agree on a formal date to retire the paper process. Archive existing paper records per your document retention policy (typically 7 years for quality records in Australia) and make Calcheq the single source of truth from that point forward.

The first audit cycle after going digital is when the real value becomes apparent. Instead of assembling folders of paper records, you generate a report. It takes minutes. It covers everything.`
      },
    ],
  },

  'consecutive-failures': {
    tag: 'Feature Deep Dive',
    tagColor: 'bg-purple-100 text-purple-700',
    emoji: '⚠️',
    title: 'Consecutive Failures: The Alert That Catches Systematic Instrument Problems Early',
    date: 'December 2025',
    readTime: '4 min read',
    sections: [
      {
        heading: 'One Failure vs. Two: Why It Matters',
        body: `A single as-found failure during a calibration can be the result of many things: a rough process period, a temporary temperature excursion near the instrument, vibration from maintenance work in the area, or simply natural drift that happens to fall outside tolerance on this particular calibration cycle. Individually, a single failure is a data point.

Two consecutive as-found failures — where the instrument has been calibrated, adjusted back into tolerance, and then failed again on the very next calibration — is a pattern. It tells you something systematic is happening to this instrument.

Calcheq's consecutive failure detection is designed to surface this pattern automatically, without requiring anyone to manually cross-reference calibration history.`
      },
      {
        heading: 'How It Works',
        body: `When a calibration record is submitted and approved with an as-found result of "fail", Calcheq checks the previous approved calibration record for the same instrument. If that record also shows an as-found result of "fail", the instrument is flagged with a consecutive failure alert.

This alert appears on the main dashboard, in the Alerts page, and is visible on the instrument's detail page. It persists until the instrument records a passing as-found result on its next calibration — confirming that the systematic problem has been resolved.

The detection is based purely on the as-found result (the reading before any adjustment), not the as-left result. This is intentional: an instrument that consistently needs significant adjustment to bring it back into tolerance is still a bad actor, even if it leaves the calibration bay in perfect condition.`
      },
      {
        heading: 'What to Do When You See This Alert',
        body: `A consecutive failure alert should trigger a structured investigation, not just another calibration. The calibration itself will reset the as-found result, but unless you find and address the root cause, the pattern will repeat.

Start with the instrument installation: check impulse line condition, process connections, ambient temperature, vibration levels, and whether the instrument has been subjected to any process conditions outside its design range. Many consecutive failure patterns are resolved by finding a partially blocked impulse line, a loose process connection, or an instrument that has been installed in a location with excessive ambient heat.

If the installation looks sound, the issue may be internal to the instrument — element degradation, moisture ingress, or mechanical wear. At this point, a corrective maintenance work order is warranted: inspect, repair, or replace.

If the instrument passes consistently after the maintenance intervention, the consecutive failure alert will clear automatically on the next successful calibration.`
      },
      {
        heading: 'Real-World Example',
        body: `A food processing facility in Victoria was seeing intermittent quality holds on a batch product line. The process team suspected the flow measurement on the main additive dosing line but couldn't pin it down because the issue was not consistent.

When they deployed Calcheq and loaded their calibration history, the consecutive failure detection immediately flagged the additive flow transmitter: it had failed its as-found calibration on two consecutive quarterly calibrations, each time reading approximately 2.8% high. The pattern had not been noticed because the two records were in different paper binders from different quarters.

Investigation found that the meter tube had a build-up of process material affecting the sensor. After cleaning and re-verification, the instrument calibrated perfectly. The product quality issues resolved.

The facility estimated the cost of undetected drift in product giveaway and quality holds at over $40,000 in the preceding six months.`
      },
    ],
  },

  'pharmaceutical-validation': {
    tag: 'Use Case',
    tagColor: 'bg-pink-100 text-pink-700',
    emoji: '💊',
    title: 'Calibration Management in Pharma: 21 CFR Part 11 and What You Need to Know',
    date: 'November 2025',
    readTime: '8 min read',
    sections: [
      {
        heading: 'The Regulatory Context',
        body: `Pharmaceutical manufacturers operating in Australia, the US, or the EU face a layered regulatory environment for their calibration management systems. At the federal level in the US, 21 CFR Part 11 governs electronic records and electronic signatures. In Australia, the TGA's GMP code references similar principles. EU manufacturers must comply with EU Annex 11.

All three frameworks share a common theme: if you are using a computer system to create, modify, maintain, archive, or retrieve records that are required to demonstrate GMP compliance, that system must meet specific technical requirements. Calibration records almost always fall into this category.

This article focuses on 21 CFR Part 11 as the most commonly referenced standard, but the principles are broadly applicable.`
      },
      {
        heading: 'What 21 CFR Part 11 Requires',
        body: `The regulation addresses two areas: closed systems (where access is controlled by the organisation that owns the system) and open systems. A SaaS calibration management system accessed via a web browser is typically treated as a closed system where the vendor has implemented appropriate controls.

Key requirements include: access controls with unique user IDs and passwords; audit trails that capture who created, modified, or deleted records and when; the ability to generate accurate and complete copies of records for review and inspection; and, where signatures are required, a link between the signature and the signed record such that the signature cannot be copied to another record.

Calcheq's current implementation covers user identity tracking (every record captures who created and approved it), an approval workflow that creates a supervisor sign-off event on each record, and a complete audit trail. For full 21 CFR Part 11 compliance, the authentication system must use unique user IDs with password controls — which is addressed in Calcheq's Supabase Auth implementation.`
      },
      {
        heading: 'The Validation Requirement',
        body: `Perhaps the most significant difference between pharma and other industries is the validation requirement. Pharmaceutical companies cannot simply deploy a software system and start using it — they must first validate that the system does what it claims to do, consistently, and document that validation.

This typically involves an Installation Qualification (IQ) confirming the system was installed correctly, an Operational Qualification (OQ) confirming the system operates as specified, and a Performance Qualification (PQ) confirming the system performs as intended in the specific use environment.

For a SaaS product like Calcheq, the vendor is responsible for the IQ and much of the OQ for the underlying infrastructure. The customer is responsible for the user acceptance testing portion of the OQ and the PQ. Calcheq can provide a validation documentation package that covers the platform-side IQ/OQ documentation, reducing the validation burden on the customer significantly.`
      },
      {
        heading: 'Practical Steps for Pharma Customers',
        body: `If you are deploying Calcheq in a GMP environment, the recommended approach is:

First, review your site's CSV (Computer System Validation) SOPs to understand what documentation is required before going live. Most sites have a template for this process.

Second, request Calcheq's IQ/OQ documentation package. This covers the platform infrastructure, security architecture, backup procedures, and system specifications.

Third, develop your own OQ test scripts covering the specific workflows your team will use: creating an instrument, entering a calibration record, triggering a fail result, approving a record, and generating a calibration report. Execute these scripts and record the results — this becomes your OQ execution evidence.

Fourth, complete your PQ with real production-like data before going fully live. This demonstrates the system performs as expected in your specific environment and with your specific instrument types.`
      },
      {
        heading: 'Electronic Signatures vs. Electronic Records',
        body: `A common point of confusion: 21 CFR Part 11 distinguishes between electronic records (required for most pharma operations) and electronic signatures (required only when a signature is specified in the relevant regulation or guidance).

For routine calibration records, most facilities require a supervisor review and approval — but this does not necessarily require a legally binding electronic signature under Part 11. A user logging in with a unique credential and clicking "Approve" in Calcheq creates an auditable record of that approval action, which satisfies most calibration-related approval requirements in practice.

If your site's procedure requires a full Part 11 compliant electronic signature (with a second authentication step confirming the signature), this is a specific feature that should be discussed with the Calcheq team before deployment.`
      },
    ],
  },

  'cascade-loop-calibration': {
    tag: 'Industry Insights',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔄',
    title: 'Calibration Errors in Cascade Loops: How One Drifting Transmitter Affects the Whole Loop',
    date: 'March 2026',
    readTime: '6 min read',
    sections: [
      {
        heading: 'What a Cascade Loop Is',
        body: `A cascade control loop is a common process control architecture used when a single manipulated variable (such as a control valve) needs to be controlled based on two separate measurements rather than one. The classic example is reactor temperature control: an outer (primary) controller measures reactor temperature and calculates a setpoint for an inner (secondary) controller, which measures jacket coolant flow and manipulates the jacket valve directly.

The distinguishing feature of cascade control is that the output of the primary controller becomes the setpoint of the secondary controller. This structure improves disturbance rejection for the inner loop and prevents windup in the outer loop during inner-loop disturbances. It is widely used in temperature, pressure, and flow control across refining, chemicals, food processing, and water treatment.

What is less often discussed is what happens when one of the transmitters in a cascade loop drifts outside its calibration tolerance.`
      },
      {
        heading: 'Error Propagation Through the Loop',
        body: `In a single-loop control system, a transmitter calibration error causes the controller to act on an incorrect process variable reading. The controller drives the process toward the wrong setpoint. The magnitude of the process impact equals roughly the transmitter error divided by the loop gain.

In a cascade system the error mechanism is different, and in some configurations it can be more insidious. Consider the reactor temperature cascade example. If the outer (temperature) transmitter drifts 2°C low, the outer controller will drive its output — the inner loop's coolant flow setpoint — upward to try to "heat" the reactor toward what it thinks is the correct temperature. The inner loop faithfully executes this setpoint, increasing coolant flow. The net result is the reactor runs 2°C hotter than the operator intends, but because the control system appears to be working normally (no alarms, stable readings), the error may go unnoticed for the entire calibration interval.

If the inner (flow) transmitter drifts instead, the outer loop will still see a correct temperature and will adjust its setpoint output to compensate — but the compensation will be based on an incorrect understanding of how much coolant is actually flowing. The outer loop masks the inner transmitter error from the operator perspective, while the inner loop's actual control performance degrades.`
      },
      {
        heading: 'Why Tighter Tolerances Apply to the Outer Loop Transmitter',
        body: `In a cascade architecture, the outer transmitter is the ultimate reference for product quality or process safety. Its accuracy determines whether the controlled variable is actually at the intended setpoint. The inner transmitter's accuracy determines how well the inner loop tracks its setpoint, which affects control stability but not necessarily the final controlled variable.

This means calibration tolerance requirements are not symmetrical across a cascade loop. Best practice is to apply your tightest tolerance specification to the outer (primary) transmitter, since an error there propagates directly to the process outcome you care most about.

For safety-critical cascades — such as a pressure override that acts as a secondary safety layer — both the outer and inner transmitters may warrant safety-critical calibration intervals and tolerances, because the inner loop's performance is directly relevant to whether the safety function activates at the correct process condition.`
      },
      {
        heading: 'Calibration Interval Coordination',
        body: `A practical question that arises with cascade loops is whether the outer and inner transmitter calibration intervals should be synchronised. There is no universal rule, but two principles are useful.

First, the outer transmitter should generally have a calibration interval no longer than the inner transmitter's interval. There is little benefit in maintaining precise inner loop control if the outer loop's reference measurement can drift between calibrations.

Second, if the cascade loop is used for a safety function or for quality-critical control, consider calibrating both transmitters at the same time during planned shutdowns or process lulls. This avoids the scenario where the outer loop has just been calibrated but the inner transmitter is near the end of its interval — creating a period where outer accuracy is high but inner accuracy is uncertain.

Calcheq's area-based calibration grouping is useful here: tagging both transmitters with the same plant area and loop reference makes it straightforward to filter the calibration schedule by loop and ensure they are due around the same time.`
      },
      {
        heading: 'Detecting Cascade Calibration Issues Without Waiting for the Next Scheduled Calibration',
        body: `One of the diagnostic signs of an outer transmitter drift in a cascade loop is a sustained, unexplained shift in the inner loop's operating setpoint. If the outer controller is continuously demanding more or less of the inner loop than historical norms suggest, this warrants investigation before the next scheduled calibration.

Similarly, if the inner transmitter has drifted, you may observe the outer loop integrating unusually — making large corrections that are inconsistent with the disturbance level on the process. This is because the outer loop's model of the inner loop's gain is wrong: it is asking for, say, 50 units of flow, but the actual flow is 47 units, and the outer loop cannot see the discrepancy.

If your DCS historian records inner loop setpoint, inner loop process variable, and outer loop output, trend these together over several months. A gradual divergence between inner loop SP and PV (at steady state) suggests inner transmitter drift. A gradual, unexplained shift in the outer loop's output at a constant product setpoint suggests outer transmitter drift. These trends can often identify a failing calibration well before the scheduled calibration date.`
      },
    ],
  },

  'ph-probe-health': {
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🧪',
    title: 'Calibrating a pH Transmitter Is Not the Same as Fixing a Degraded pH Probe',
    date: 'February 2026',
    readTime: '7 min read',
    sections: [
      {
        heading: 'The Confusion Between Calibration and Sensor Health',
        body: `This is one of the most common misunderstandings in process analytical instrumentation. A pH transmitter can be perfectly calibrated — its two-point buffer calibration checks out, the slope and offset are within specification, the calibration record passes — and yet the pH measurement it delivers to the control system can still be significantly wrong under process conditions.

The reason is that transmitter calibration and probe condition are two different things. Calibration adjusts the transmitter's interpretation of the signal it receives from the probe. It cannot compensate for a probe that is responding slowly, reading incorrectly at high ionic strength, or fouled with process deposits. If the probe itself is degraded, a perfect transmitter calibration will faithfully transmit the wrong answer.`
      },
      {
        heading: 'How a pH Probe Degrades',
        body: `A glass pH electrode generates a millivolt potential proportional to the pH of the solution it contacts, based on the Nernst equation. The theoretical slope of this response is −59.16 mV per pH unit at 25°C. In practice, a new, healthy electrode achieves 95–102% of this theoretical slope.

As the electrode ages and the glass membrane degrades, several things happen. The slope decreases — the electrode becomes less sensitive, so the millivolt difference between pH 4 and pH 7 is smaller than theory predicts. The response time slows — the electrode takes longer to reach equilibrium after a step change in pH, which causes the transmitter reading to lag behind the actual process pH. The asymmetry potential (the offset at pH 7) drifts — this shows up as a zero-point shift in the calibration, which the two-point buffer calibration can mask by adjusting the transmitter offset.

The reference junction — the porous plug or sleeve that provides the electrochemical connection between the reference electrolyte and the process — can also become blocked or contaminated, particularly in high-solids or coating process streams. A blocked reference junction increases the junction potential and can cause large, unpredictable measurement errors that vary with temperature and process composition.`
      },
      {
        heading: 'What the Two-Point Buffer Calibration Actually Checks',
        body: `A standard pH transmitter calibration involves placing the probe in two buffer solutions of known pH (typically pH 4.01 and 7.00, or pH 7.00 and 10.01) and adjusting the transmitter offset and slope to read correctly in both buffers. This check confirms that the probe produces the correct millivolt output in clean buffer solutions under laboratory conditions.

What it does not confirm: probe performance in the actual process fluid, which may have different ionic strength, temperature, or fouling characteristics than the buffer. It does not confirm response time. It does not directly measure the condition of the reference junction or the state of the glass membrane.

A probe with a slow response time or marginal slope may still produce readings that are close enough to the buffer values during a static calibration check. Under dynamic process conditions, the same probe may lag by several minutes and read incorrectly at process pH values far from the calibration buffers.`
      },
      {
        heading: 'Using As-Found Calibration Data to Track Probe Health',
        body: `The most practical early warning indicator for probe degradation is the trend in as-found calibration data over successive calibration cycles. Specifically, two metrics are worth tracking.

Slope trend: at each calibration, the technician typically notes the probe slope percentage (displayed on modern transmitters and communicators). A new probe typically shows 97–100% slope. As the glass degrades, slope decreases. Once slope falls below approximately 92–93%, measurement accuracy in the process starts to become unreliable, particularly at pH extremes. Below 90%, the probe should be replaced regardless of whether the calibration passes.

As-found offset drift: if the zero offset required at each successive calibration is drifting consistently in one direction — requiring increasingly large adjustments to read correctly at pH 7 — this suggests a slow deterioration of the glass membrane or a developing reference junction blockage. The calibration record passes each time because the technician makes the necessary adjustment. But the trend in required adjustment is a leading indicator that the probe is nearing end of life.

Calcheq's as-found data capture across calibration history makes this trend analysis straightforward. Plot the maximum as-found error percentage and the required offset adjustment at each calibration over the past six to twelve months. A consistent one-directional drift is a reliable signal to schedule probe replacement at the next convenient opportunity rather than waiting for the probe to fail completely in service.`
      },
      {
        heading: 'Practical Maintenance Workflow',
        body: `The recommended workflow for maintaining pH measurements in critical process applications has three components that are distinct from transmitter calibration.

Probe cleaning: schedule regular cleaning of the glass membrane and reference junction on a frequency appropriate for the process. In clean water or dilute chemical applications, this may be quarterly. In high-solids, coating, or biological growth environments, monthly or more frequent cleaning is often necessary. Cleaning removes fouling that would otherwise shift the calibration and reduce slope.

Slope and response time verification: at each calibration, record the probe slope and note the time constant (how long the probe takes to equilibrate in the buffer). These values, logged against date in Calcheq's technician notes fields, create a quantitative health record for the probe over its service life.

Planned replacement: establish a probe replacement policy based on slope and age. A common approach is: replace if slope drops below 92% regardless of age; replace at 12–18 months regardless of slope in critical applications; replace immediately if response time in buffer exceeds 30 seconds for a standard glass electrode.

Following this workflow, a calibration failure attributable to genuine probe degradation should never come as a surprise. The as-found trend will have indicated it was coming, typically one to three calibration cycles in advance.`
      },
    ],
  },

  'field-technician-workflow': {
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔧',
    title: 'A Day in the Life: How Field Technicians Use Calcheq',
    date: 'October 2025',
    readTime: '5 min read',
    sections: [
      {
        heading: '7:30 AM — Start of Shift: Check What\'s Due',
        body: `The first thing most instrument technicians do when they arrive on site is figure out what they need to do today. With a paper system, this means finding the calibration binder, flipping to the current week, and hoping whoever updated it last did so accurately.

With Calcheq, it takes about 30 seconds. Opening the dashboard on a tablet shows the upcoming calibrations sorted by due date. Today's list is immediately visible. For each instrument due this week, the tag number, description, area, and calibration interval are all displayed — enough to plan the day's workload and decide in what order to tackle the jobs.

The alerts panel also shows any instruments that are overdue or have active failure alerts. These get prioritised.`
      },
      {
        heading: '9:15 AM — In the Field: Logging the First Calibration',
        body: `Technician arrives at PT-205, a differential pressure transmitter on a heat exchanger inlet. She pulls up the instrument in Calcheq on her tablet and taps "New Calibration." The form pre-populates the expected output values for each of the five test points based on the instrument's configured range and tolerance settings.

She works through the as-found test, applying each stimulus value using her calibrated reference standard and entering the actual transmitter reading at each point. Calcheq calculates the error at each point in real time and highlights any that are outside tolerance in red. Three of five test points show pass, two show marginal. The overall as-found result is automatically set to "marginal."

She makes a small zero adjustment, then runs the as-left sweep. All five test points pass. She records her reference standard details, adds a brief note about the adjustment, and taps "Save Draft."`
      },
      {
        heading: '11:45 AM — Back at the Workshop: Submit for Approval',
        body: `After completing four calibrations across the morning, the technician reviews her draft records over lunch and submits them for supervisor approval. She can see that all four are now in "Submitted" status in her calibration list.

Submitting the records updates the instrument list to reflect the new calibration date — but importantly, the pass/fail status and calibration due date on the instrument do not update until a supervisor has reviewed and approved the record. This is a key part of the audit trail: the calibration result is not official until it has been through the approval step.`
      },
      {
        heading: '1:30 PM — Afternoon Jobs: Following Up a Failed Instrument',
        body: `One of the afternoon's jobs has an alert on it — a pressure switch (PSH-412) that failed its previous calibration three months ago. Calcheq shows the full calibration history on the instrument page, including the last failed record with the exact as-found readings and the corrective action that was logged at the time.

She reviews the previous record before starting her calibration to understand what happened last time and what to look for. This context, which would be buried in a paper binder on the old system, is immediately visible.

Today's calibration finds the switch within tolerance. She records the result, notes that the previous failure appears to have been resolved by the component replacement done in the corrective maintenance work order, and submits for approval.`
      },
      {
        heading: '4:00 PM — End of Shift: Handover',
        body: `At end of shift, the technician has five calibration records in "submitted" status. The afternoon supervisor who picks up for the evening shift can see immediately — on the dashboard and on the Approvals page — what has been submitted and is waiting for review.

The evening supervisor reviews each record on their tablet, checking the test point data and notes. Four are approved immediately. One is sent back with a comment asking for clarification on the reference standard certificate number. The technician receives this the next morning and can update and resubmit in under a minute.

By the end of the next day, all five records are approved, the instrument statuses are updated, and the calibration due dates have been recalculated. The paper binder equivalent of this workflow would have involved handwritten sheets, a clipboard handover, and manual updates to a spreadsheet — none of which are captured in an auditable, searchable, reportable system.`
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Section renderer
// ─────────────────────────────────────────────────────────────────────────────

function ArticleSection({ heading, body }) {
  const paragraphs = body.trim().split(/\n\n+/)
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{heading}</h2>
      {paragraphs.map((para, i) => (
        <p key={i} className="text-slate-600 leading-relaxed mb-3 text-base">{para}</p>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const { slug } = useParams()
  const article = ARTICLES[slug]

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Calcheq`
      const desc = document.querySelector('meta[name="description"]')
      const content = (article.sections?.[0]?.body ?? 'Read the latest insights on instrument calibration management from Calcheq.')
      if (desc) desc.setAttribute('content', content.slice(0, 160))
      else { const m = document.createElement('meta'); m.name = 'description'; m.content = content.slice(0, 160); document.head.appendChild(m) }
    } else {
      document.title = 'Article Not Found — Calcheq'
    }
  }, [slug, article])

  // 404 fallback
  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <MarketingNav />
        <div className="max-w-2xl mx-auto px-4 py-40 text-center">
          <p className="text-6xl mb-4">📭</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Article not found</h1>
          <p className="text-slate-500 mb-6">This article may have moved or the link may be incorrect.</p>
          <Link to="/resources" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
            Back to all articles
          </Link>
        </div>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All articles
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${article.tagColor}`}>{article.tag}</span>
            <span className="text-xs text-slate-400">{article.date} · {article.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>
          <div className="w-full h-44 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-7xl">
            {article.emoji}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {article.sections.map((section, i) => (
            <ArticleSection key={i} heading={section.heading} body={section.body} />
          ))}

          {/* CTA */}
          <div className="mt-12 bg-blue-600 rounded-2xl px-8 py-8 text-center">
            <p className="text-white font-bold text-xl mb-2">Ready to modernise your calibration program?</p>
            <p className="text-blue-200 text-sm mb-5">See Calcheq in action — no sign-up required.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/app"
                className="inline-block bg-white text-blue-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                Try the live demo →
              </Link>
              <Link
                to="/contact"
                className="inline-block bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-sm border border-blue-400"
              >
                Get in touch
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link to="/resources" className="text-sm text-blue-600 hover:underline font-medium">
              ← Back to all articles
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
