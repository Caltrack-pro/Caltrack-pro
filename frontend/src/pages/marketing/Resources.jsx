import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

const RESOURCES = [
  {
    slug: 'overdue-calibrations',
    tag: 'Case Study',
    tagColor: 'bg-green-100 text-green-700',
    emoji: '🛢️',
    title: 'How to Migrate from MEX to Calcheq in 4 Steps',
    description: 'A step-by-step walkthrough for moving your entire instrument register from MEX without data loss. Learn how to map fields, validate data, and maintain calibration history.',
    readTime: '8 min read',
    type: 'Guide',
  },
  {
    slug: 'iso-17025',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '📋',
    title: 'AS/NZS ISO 17025:2017 — What Calibration Managers Need to Know',
    description: 'A deep dive into the requirements of the Australian/NZ standard for calibration labs. Covers scope, accreditation, traceability, measurement uncertainty, and documentation.',
    readTime: '12 min read',
    type: 'Compliance',
  },
  {
    slug: 'criticality-ranking',
    tag: 'Guide',
    tagColor: 'bg-purple-100 text-purple-700',
    emoji: '🎯',
    title: 'Why Instrument Criticality Ranking Is Your Most Valuable Compliance Tool',
    description: 'Understand the Red/Yellow/Green criticality model, why it matters for SIS programs, and how to implement it in your plant. Includes a downloadable risk matrix template.',
    readTime: '10 min read',
    type: 'Guide',
  },
  {
    slug: 'spreadsheet-cost',
    tag: 'Industry Insights',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '📊',
    title: 'The Hidden Cost of Spreadsheet-Based Calibration Management',
    description: 'Manual spreadsheet calibration tracking costs instrumentation teams significant time in admin. See how moving to a dedicated system changes the picture.',
    readTime: '6 min read',
    type: 'Industry Insights',
  },
  {
    slug: 'iec-61511',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '⚠️',
    title: 'IEC 61511 and Safety Instrumented Systems — A Calibration Checklist',
    description: 'SIS instruments (transmitters, solenoids, shut-off valves) need proof of calibration at defined intervals. Our IEC 61511 calibration checklist covers every audit requirement.',
    readTime: '9 min read',
    type: 'Compliance',
  },
  {
    slug: 'overdue-calibrations',
    tag: 'Case Study',
    tagColor: 'bg-green-100 text-green-700',
    emoji: '🏭',
    title: 'From Spreadsheet Chaos to Compliance Clarity: A Real Implementation',
    description: 'See how an Australian processing plant eliminated audit failures and deployed a real-time compliance dashboard — moving from scattered Excel records to a single source of truth.',
    readTime: '15 min read',
    type: 'Case Study',
  },
  {
    slug: 'beamex-fluke',
    tag: 'Guide',
    tagColor: 'bg-purple-100 text-purple-700',
    emoji: '🔧',
    title: 'Connecting Beamex and Fluke Calibrators to Your CMMS',
    description: 'Direct integration with Beamex and Fluke digital calibrators eliminates manual data entry. Learn how to export CSV from your calibrator and auto-upload readings into Calcheq.',
    readTime: '7 min read',
    type: 'Guide',
  },
  {
    slug: 'measurement-uncertainty',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    emoji: '📐',
    title: 'Understanding Measurement Uncertainty in Calibration Certificates',
    description: 'Measurement uncertainty is mandatory in ISO 17025 certificates but often misunderstood. Learn what it is, how to calculate it, and why it matters for critical instruments.',
    readTime: '11 min read',
    type: 'Compliance',
  },
  {
    slug: 'predictive-maintenance',
    tag: 'Industry Insights',
    tagColor: 'bg-amber-100 text-amber-700',
    emoji: '🔮',
    title: 'Predictive Maintenance Trends in Australian Processing Plants',
    description: 'Rising adoption of predictive degradation tools in calibration management is reshaping how Australian sites approach preventive maintenance. See where the industry is heading.',
    readTime: '8 min read',
    type: 'Industry Insights',
  },
  {
    slug: 'overdue-calibrations',
    tag: 'Case Study',
    tagColor: 'bg-green-100 text-green-700',
    emoji: '⛏️',
    title: 'Optimising a Multi-Site Mining Calibration Program',
    description: 'A multi-site mining operation reduced calibration costs, eliminated emergency repairs through predictive alerts, and improved audit compliance across all locations with Calcheq.',
    readTime: '16 min read',
    type: 'Case Study',
  },
]

const TAGS = ['All', 'Case Study', 'Guide', 'Compliance', 'Industry Insights']

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
