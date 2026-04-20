import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

const RESOURCES = [
  {
    slug: 'pressure-transmitter-procedure',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔩',
    title: 'How to Calibrate a Pressure Transmitter: A Step-by-Step Field Procedure',
    description: 'A complete five-point calibration procedure for 4–20 mA pressure transmitters. Covers as-found checks, zero and span adjustment, as-left verification, and ISO 17025 documentation requirements.',
    readTime: '8 min read',
    type: 'Guide',
  },
  {
    slug: 'iso-17025-audit',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '📋',
    title: 'ISO/IEC 17025 Audit? Here\'s What Your Calibration Records Actually Need',
    description: 'Auditors consistently find the same gaps: missing reference standard traceability, no as-found data, no adjustment documentation. This guide covers every clause that applies to industrial calibration records.',
    readTime: '7 min read',
    type: 'Compliance',
  },
  {
    slug: 'cascade-loop-calibration',
    tag: 'Industry Insights',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔄',
    title: 'Calibration Errors in Cascade Loops: How One Drifting Transmitter Affects the Whole Loop',
    description: 'In cascade control, a transmitter error in the outer loop propagates silently through to the process variable. Learn how error compounds, why tolerances aren\'t symmetrical, and how to detect drift between calibrations.',
    readTime: '6 min read',
    type: 'Industry Insights',
  },
  {
    slug: 'ph-probe-health',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🧪',
    title: 'Calibrating a pH Transmitter Is Not the Same as Fixing a Degraded pH Probe',
    description: 'A perfect calibration record can still mean a wrong measurement. Learn why, and how tracking as-found slope and offset trends across calibration history gives you early warning of probe degradation.',
    readTime: '7 min read',
    type: 'Guide',
  },
  {
    slug: 'paper-to-digital',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '📄',
    title: 'Moving Off Paper Calibration Logs: A Practical Guide for Maintenance Teams',
    description: 'Paper hides its failures well — until an audit. This five-step guide covers taking stock of your instrument register, importing data, establishing the digital workflow, and retiring the paper system for good.',
    readTime: '6 min read',
    type: 'Guide',
  },
  {
    slug: 'consecutive-failures',
    tag: 'Feature Deep Dive',
    tagColor: 'bg-purple-100 text-purple-700',
    emoji: '⚠️',
    title: 'Consecutive Failures: The Alert That Catches Systematic Instrument Problems Early',
    description: 'One calibration failure can be random. Two consecutive failures almost never are. Learn how consecutive failure detection works, what investigation steps it should trigger, and how to clear the alert.',
    readTime: '4 min read',
    type: 'Guide',
  },
  {
    slug: 'pharmaceutical-validation',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '💊',
    title: 'Calibration Management in Pharma: 21 CFR Part 11 and What You Need to Know',
    description: 'What 21 CFR Part 11 actually requires for calibration records, the difference between electronic records and electronic signatures, and a step-by-step approach to validating a SaaS calibration system.',
    readTime: '8 min read',
    type: 'Compliance',
  },
  {
    slug: 'field-technician-workflow',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔧',
    title: 'A Day in the Life: How Field Technicians Use Calcheq',
    description: 'From the morning schedule check to the end-of-shift handover, this walkthrough shows exactly how the technician workflow looks — from the instrument list to submitting calibration records for approval.',
    readTime: '5 min read',
    type: 'Guide',
  },
]

const TAGS = ['All', 'Guide', 'Compliance', 'Industry Insights', 'Feature Deep Dive']

export default function Resources() {
  const [activeTag, setActiveTag] = useState('All')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    document.title = 'Resources — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Guides, case studies, compliance resources, and industry insights to help you build a world-class calibration program. For instrumentation and maintenance teams.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  const filtered = activeTag === 'All' ? RESOURCES : RESOURCES.filter(r => r.type === activeTag)

  return (
    <div className="min-h-screen bg-white font-sans">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-14 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Resources for Instrumentation &amp; Calibration Teams
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Guides, case studies, compliance resources, and industry insights to help you build a world-class calibration program.
          </p>
        </div>
      </section>

      {/* ── FILTER TABS ───────────────────────────────────────────────────── */}
      <section className="py-6 px-4 sm:px-6 border-b border-slate-100 bg-white sticky top-16 z-10">
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ── RESOURCE GRID ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => (
              <Link
                key={i}
                to={`/resources/${r.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="text-3xl mb-4">{r.emoji}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.tagColor}`}>{r.tag}</span>
                  <span className="text-xs text-slate-400">{r.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {r.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{r.description}</p>
                <p className="text-xs font-semibold text-blue-600 mt-4">Read more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Stay Updated on Calibration Best Practices</h2>
          <p className="text-slate-500 text-sm mb-6">
            Get new guides, compliance resources, and industry insights delivered to your inbox every month.
          </p>
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4">
              <p className="text-sm font-semibold text-green-700">✓ You're subscribed! We'll be in touch.</p>
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); setSubscribed(true) }}
              className="flex gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Need personalised help with your calibration program?</h2>
          <p className="text-slate-500 mb-8">Chat with our team about your specific compliance and operational challenges.</p>
          <Link to="/contact" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-lg">
            Start Your Free Pilot →
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
