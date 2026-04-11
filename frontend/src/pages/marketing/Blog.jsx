import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

// META: Calcheq Blog — Calibration management insights, ISO compliance tips, and instrument maintenance best practices for process industries.

const POSTS = [
  {
    slug: 'overdue-calibrations',
    tag: 'Case Study',
    tagColor: 'bg-green-100 text-green-700',
    title: 'How a Refinery Cut Overdue Calibrations from 23% to Under 4%',
    excerpt: 'When a mid-sized oil refinery in Queensland replaced spreadsheets with Calcheq, their overdue rate plummeted — and two near-miss incidents were prevented by alerts the old system would have missed entirely.',
    readTime: '5 min read',
    date: 'March 2026',
    emoji: '🛢️',
  },
  {
    slug: 'iso-17025-audit',
    tag: 'Compliance',
    tagColor: 'bg-blue-100 text-blue-700',
    title: "ISO/IEC 17025 Audit? Here's What Your Calibration Records Actually Need",
    excerpt: 'Auditors are specific about what constitutes an acceptable calibration record. We break down the exact fields, traceability requirements, and approval workflows that Calcheq provides out of the box.',
    readTime: '7 min read',
    date: 'February 2026',
    emoji: '📋',
  },
  {
    slug: 'paper-to-digital',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'Moving Off Paper Calibration Logs: A Practical Guide for Maintenance Teams',
    excerpt: 'Paper logs and shared Excel sheets feel safer than they are. Lost records, illegible handwriting, no audit trail — here\'s a step-by-step guide to making the switch without disrupting your team.',
    readTime: '6 min read',
    date: 'January 2026',
    emoji: '📄',
  },
  {
    slug: 'consecutive-failures',
    tag: 'Feature Deep Dive',
    tagColor: 'bg-purple-100 text-purple-700',
    title: 'Consecutive Failures: The Alert That Catches Systematic Instrument Problems Early',
    excerpt: 'A single failure could be random. Two or more in a row almost never are. Calcheq\'s consecutive failure detection surfaces instruments with systematic problems before they cause process upsets.',
    readTime: '4 min read',
    date: 'December 2025',
    emoji: '⚠️',
  },
  {
    slug: 'pharmaceutical-validation',
    tag: 'Use Case',
    tagColor: 'bg-pink-100 text-pink-700',
    title: 'Calibration Management in Pharma: 21 CFR Part 11 and What You Need to Know',
    excerpt: 'Pharmaceutical manufacturers face strict electronic records requirements. We look at how Calcheq\'s approval workflow, user traceability, and audit trail helps teams stay compliant.',
    readTime: '8 min read',
    date: 'November 2025',
    emoji: '💊',
  },
  {
    slug: 'field-technician-workflow',
    tag: 'Guide',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'A Day in the Life: How Field Technicians Use Calcheq',
    excerpt: 'Follow an instrument technician through a full calibration day — from checking their due-this-week list in the morning to submitting calibration records for approval before knocking off.',
    readTime: '5 min read',
    date: 'October 2025',
    emoji: '🔧',
  },
]

function PostCard({ post, featured = false }) {
  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 text-white text-center">
          <span className="text-6xl">{post.emoji}</span>
        </div>
        <div className="p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${post.tagColor}`}>{post.tag}</span>
            <span className="text-xs text-slate-400">{post.date} · {post.readTime}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-3 leading-tight">{post.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">{post.excerpt}</p>
          <span className="text-sm font-semibold text-blue-600">Read more →</span>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
          {post.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${post.tagColor}`}>{post.tag}</span>
            <span className="text-xs text-slate-400">{post.date} · {post.readTime}</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 leading-tight mb-2">{post.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
          <Link to={`/blog/${post.slug}`} className="text-xs font-semibold text-blue-600 hover:underline">Read more →</Link>
        </div>
      </div>
    </div>
  )
}

export default function Blog() {
  const [featured, ...rest] = POSTS

  useEffect(() => {
    document.title = 'Use Cases — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Discover how Calcheq is used across oil & gas, chemical, pharma, and process industries to replace spreadsheet-based calibration management.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Header */}
      <section className="pt-32 pb-14 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-blue-100">
            Use Cases &amp; Insights
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Real-world calibration management
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Case studies, compliance guides, and practical advice for instrumentation teams.
          </p>
        </div>
      </section>

      {/* Featured + posts */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Featured post */}
          <div className="mb-10">
            <div className="max-w-lg mx-auto">
              <PostCard post={featured} featured />
            </div>
          </div>

          {/* Tags filter (decorative — not wired) */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['All', 'Case Study', 'Compliance', 'Guide', 'Feature Deep Dive', 'Use Case'].map(tag => (
              <button
                key={tag}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  tag === 'All'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Post grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {rest.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Stay in the loop</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            New guides, case studies, and Calcheq updates delivered to your inbox — no spam, unsubscribe any time.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
