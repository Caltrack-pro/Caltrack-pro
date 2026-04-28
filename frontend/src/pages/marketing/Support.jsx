import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

function Card({ title, body, href, cta }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed mb-6 flex-1">{body}</p>
      {href.startsWith('mailto:') || href.startsWith('http') ? (
        <a href={href} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          {cta} →
        </a>
      ) : (
        <Link to={href} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          {cta} →
        </Link>
      )}
    </div>
  )
}

export default function Support() {
  return (
    <>
      <MarketingNav />

      <main className="bg-slate-50 min-h-screen">
        {/* Hero */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Support</p>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">We're here to help</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Most questions are answered in the FAQ. For anything else, email us — a real person responds within one Australian business day.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card
              title="Email support"
              body="Best for everything — bugs, billing, feature requests, calibration setup advice. Reply within one business day, usually faster."
              href="mailto:info@calcheq.com"
              cta="info@calcheq.com"
            />
            <Card
              title="FAQ"
              body="Quick answers on pricing, plans, the 14-day trial, calibration workflow, and account management."
              href="/faq"
              cta="Browse the FAQ"
            />
            <Card
              title="Resources"
              body="Articles on calibration intervals, drift analysis, audit prep, and how CalCheq compares to spreadsheets and MEX."
              href="/resources"
              cta="Read the resources"
            />
          </div>

          {/* What to include */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">When you email us, please include:</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Your CalCheq site name (so we can find your account quickly)</li>
              <li>What you tried, what you expected, what actually happened</li>
              <li>Screenshots if it's a UI issue — they help us diagnose much faster</li>
              <li>Browser + device if you suspect a compatibility issue (e.g. <em>Chrome 138 on Windows 11</em> or <em>CalCheq mobile on Android 13</em>)</li>
              <li>Approximate time the problem occurred, if it's intermittent</li>
            </ul>
          </div>

          {/* Status & SLA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Response times</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Production-down issues</strong> (no one in your site can sign in or save records): we aim to respond within 2 business hours.</li>
              <li><strong>Bugs and questions:</strong> within one Australian business day.</li>
              <li><strong>Feature requests:</strong> we respond within a week to acknowledge, then prioritise alongside the rest of the roadmap.</li>
            </ul>
            <p className="text-sm text-slate-500 mt-4">
              Australian business hours are Monday–Friday, 9 am to 5 pm AEST/AEDT, excluding NSW public holidays.
            </p>
          </div>

          {/* Account changes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Account, billing, and data requests</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Cancel or change your plan:</strong> Settings → Billing inside the app, or email us.</li>
              <li><strong>Change billing email or company name:</strong> email <a href="mailto:info@calcheq.com" className="text-blue-600 hover:underline">info@calcheq.com</a> from the address on file.</li>
              <li><strong>Export your data:</strong> Reports section in-app, or email us for a full data export.</li>
              <li><strong>Delete your account / data:</strong> email us and we'll confirm + action within 30 days. See our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for retention details.</li>
            </ul>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Still stuck?</h2>
            <p className="text-slate-600 mb-6">Send us an email — we read every message.</p>
            <a
              href="mailto:info@calcheq.com"
              className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              info@calcheq.com
            </a>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </>
  )
}
