import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

// META: Calcheq pricing — simple, transparent plans for instrument calibration management. Free trial, no credit card required.

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-5 h-5 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function PlanCard({ name, price, priceNote, badge, highlight, description, features, cta }) {
  return (
    <div className={`relative flex flex-col rounded-2xl border ${
      highlight
        ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-200 scale-[1.02]'
        : 'bg-white border-slate-200 shadow-sm'
    } p-8`}>
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${highlight ? 'text-blue-200' : 'text-blue-600'}`}>{name}</p>
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-4xl font-extrabold leading-none ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
          {priceNote && <span className={`text-sm mb-1 ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{priceNote}</span>}
        </div>
        <p className={`text-sm leading-relaxed ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{description}</p>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {features.map(({ text, included }) => (
          <li key={text} className={`flex items-center gap-3 text-sm ${
            included
              ? (highlight ? 'text-white' : 'text-slate-700')
              : 'text-slate-400 line-through'
          }`}>
            {included ? <Check /> : <Cross />}
            {text}
          </li>
        ))}
      </ul>

      <Link
        to="/contact"
        className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
          highlight
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function FaqRow({ q, a }) {
  return (
    <div className="border-b border-slate-100 py-5">
      <p className="font-semibold text-slate-800 mb-2">{q}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
    </div>
  )
}

function AccordionFaqItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-200">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {q}
        </span>
        <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform ${open ? 'rotate-45' : ''}`}>
          <svg className={`w-3 h-3 transition-colors ${open ? 'text-blue-600' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Simple, honest pricing
          </h1>
          <p className="text-slate-500 text-lg">
            No per-instrument fees. No surprise add-ons. One flat price per site, per month.
          </p>
          <p className="mt-3 text-sm text-amber-600 font-semibold">
            🎉 Early access pricing — lock in your rate before our general launch.
          </p>
        </div>
      </section>

      {/* Compliance trust strip */}
      <section className="py-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { label: "ISO 9001", sub: "Quality Management" },
              { label: "ISO/IEC 17025", sub: "Calibration Labs" },
              { label: "ISA-5.1", sub: "Instrument Tagging" },
              { label: "PSSR 2000", sub: "Pressure Systems" },
              { label: "AS/NZS Aligned", sub: "Australian Standards" },
            ].map(({ label, sub }) => (
              <div key={label} className="flex flex-col items-center bg-white border border-blue-100 rounded-xl px-5 py-3 shadow-sm">
                <span className="text-xs font-bold text-blue-700">{label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">

          <PlanCard
            name="Starter"
            price="TBC"
            priceNote="/ site / month"
            description="Perfect for a single site with a small team managing a modest instrument fleet."
            features={[
              { text: 'Up to 100 instruments',           included: true },
              { text: 'Up to 5 users',                    included: true },
              { text: 'Calibration records & history',    included: true },
              { text: 'Dashboard & alerts',               included: true },
              { text: 'CSV export',                       included: true },
              { text: 'Multi-site support',               included: false },
              { text: 'Advanced reports',                 included: false },
              { text: 'Priority support',                 included: false },
            ]}
            cta="Get Started"
          />

          <PlanCard
            name="Professional"
            price="TBC"
            priceNote="/ site / month"
            badge="Most Popular"
            highlight
            description="For established maintenance teams who need the full feature set and serious reporting."
            features={[
              { text: 'Unlimited instruments',            included: true },
              { text: 'Unlimited users',                  included: true },
              { text: 'Calibration records & history',    included: true },
              { text: 'Dashboard & alerts',               included: true },
              { text: 'CSV export',                       included: true },
              { text: 'Multi-site support',               included: true },
              { text: 'Advanced reports & trend charts',  included: true },
              { text: 'Priority email support',           included: true },
            ]}
            cta="Get Started"
          />

          <PlanCard
            name="Enterprise"
            price="Custom"
            description="Multi-site organisations, custom integrations, and white-glove onboarding for large teams."
            features={[
              { text: 'Everything in Professional',       included: true },
              { text: 'Multiple sites included',          included: true },
              { text: 'Custom integrations (CMMS/ERP)',   included: true },
              { text: 'Dedicated account manager',        included: true },
              { text: 'On-site training',                 included: true },
              { text: 'SLA-backed uptime',                included: true },
              { text: 'Custom reporting',                 included: true },
              { text: 'SSO / LDAP',                       included: true },
            ]}
            cta="Book a Demo →"
          />

        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 mt-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Pricing FAQ</h2>
          <FaqRow
            q="When will pricing be finalised?"
            a="We're currently in early access. Pricing will be confirmed ahead of general launch. Contact us to register interest and lock in an early-access rate."
          />
          <FaqRow
            q="Is there a free trial?"
            a="Yes — you can use the demo app right now with full functionality. All features are available to try before you commit."
          />
          <FaqRow
            q="What counts as a 'site'?"
            a="A site is a single physical or logical installation — a refinery, a processing plant, a manufacturing facility. Each site has its own isolated instrument database and user list."
          />
          <FaqRow
            q="Can I change plans later?"
            a="Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle."
          />
          <FaqRow
            q="Do you offer annual billing?"
            a="Yes — annual billing will be available at a discount versus monthly. Exact rates will be confirmed at launch."
          />
        </div>
      </section>

      {/* General FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-1">
            <AccordionFaqItem
              q="Is my data secure?"
              a="Yes. All data is isolated per organisation — no other company can see your instruments or calibration records. Data is stored in a managed PostgreSQL database on Supabase with encryption at rest and in transit. We do not share or sell your data."
            />
            <AccordionFaqItem
              q="Can I export my data?"
              a="Absolutely. You can export your full calibration history to CSV at any time from the Reports page. You're never locked in — your data is yours."
            />
            <AccordionFaqItem
              q="What happens at the end of my free trial?"
              a="You'll be prompted to select a plan. If you don't upgrade, your account moves to read-only mode — you can still view and export your data, but won't be able to add new calibration records."
            />
            <AccordionFaqItem
              q="Do I need to sign a contract?"
              a="No long-term contracts. All plans are month-to-month and can be cancelled at any time from your account settings."
            />
            <AccordionFaqItem
              q="Can I change plans later?"
              a="Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 text-center bg-white">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Not sure which plan is right for you?</h2>
        <p className="text-slate-500 mb-6">Talk to us — we'll help you find the right fit.</p>
        <Link to="/contact" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          Contact us →
        </Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
