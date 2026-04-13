import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

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
  const [isAnnual, setIsAnnual] = useState(true)

  useEffect(() => {
    document.title = 'Pricing — Calcheq Instrument Calibration Management'
    const desc = document.querySelector('meta[name="description"]')
    const content = 'Transparent pricing for Australian processing plants. Calcheq instrument calibration management — scale from 50 to unlimited instruments. No surprises. Cancel anytime.'
    if (desc) desc.setAttribute('content', content)
    else { const m = document.createElement('meta'); m.name = 'description'; m.content = content; document.head.appendChild(m) }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Transparent pricing for Australian processing plants
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            From 150 instruments to unlimited. No surprises. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Billing toggle */}
      <section className="py-12 px-4 sm:px-6 text-center bg-white">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-4 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                !isAnnual
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all relative ${
                isAnnual
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              {isAnnual && (
                <span className="absolute -top-6 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Save 2 months
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-start">

          <PlanCard
            name="Starter"
            price={isAnnual ? '$199' : '$239'}
            priceNote="/mo AUD"
            description="Perfect for smaller operations with up to 150 instruments and basic compliance needs."
            features={[
              { text: 'Up to 150 instruments', included: true },
              { text: 'Up to 5 users', included: true },
              { text: 'Real-time dashboard', included: true },
              { text: 'Automated alerts', included: true },
              { text: 'Certificate generation (AS/NZS ISO 17025)', included: true },
              { text: 'CSV/Excel import wizard', included: true },
              { text: 'Multi-site management', included: false },
              { text: 'Criticality ranking', included: false },
            ]}
            cta="Get Started"
          />

          <PlanCard
            name="Professional"
            price={isAnnual ? '$449' : '$539'}
            priceNote="/mo AUD"
            badge="MOST POPULAR"
            highlight
            description="Everything you need: predictive alerts, criticality ranking, and unlimited users. Trusted by mid-market sites."
            features={[
              { text: 'Up to 500 instruments', included: true },
              { text: 'Unlimited users', included: true },
              { text: 'Criticality ranking (Red/Yellow/Green)', included: true },
              { text: 'Predictive degradation alerts', included: true },
              { text: 'Beamex/Fluke CSV integration', included: true },
              { text: 'Multi-site management', included: true },
              { text: 'Mobile browser access (no app download needed)', included: true },
              { text: 'Advanced reporting', included: true },
              { text: 'Priority support', included: true },
            ]}
            cta="Start Free 30-Day Pilot"
          />

          <PlanCard
            name="Enterprise"
            price="Custom"
            description="Unlimited instruments, advanced integrations, and dedicated support for large multi-site deployments."
            features={[
              { text: 'Unlimited instruments', included: true },
              { text: 'Unlimited users', included: true },
              { text: 'All Professional features', included: true },
              { text: 'SAP/MEX/Maximo integration', included: true },
              { text: 'Configurable compliance reporting', included: true },
              { text: 'On-site training (optional)', included: true },
              { text: '99.5% uptime commitment', included: true },
              { text: 'Dedicated account manager', included: true },
            ]}
            cta="Request Quote"
          />

        </div>
      </section>

      {/* Info box */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>All prices in AUD including GST.</strong> Annual billing saves you 2 months. You can upgrade, downgrade, or cancel anytime. Free 30-day trial includes full Professional plan features.
          </p>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Feature</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Starter</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Professional</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Max Instruments', starter: true, prof: true, ent: true, value: '150 / 500 / Unlimited' },
                  { feature: 'Max Users', starter: '5', prof: 'Unlimited', ent: 'Unlimited', valueOnly: true },
                  { feature: 'Dashboard & Alerts', starter: true, prof: true, ent: true },
                  { feature: 'Criticality Ranking', starter: false, prof: true, ent: true },
                  { feature: 'Predictive Degradation', starter: false, prof: true, ent: true },
                  { feature: 'Calibrator Integration (Beamex/Fluke)', starter: false, prof: true, ent: true },
                  { feature: 'Mobile Browser Access', starter: true, prof: true, ent: true },
                  { feature: 'Multi-Site Management', starter: false, prof: true, ent: true },
                  { feature: 'SAP/MEX/Maximo Integration', starter: false, prof: false, ent: true },
                  { feature: 'On-Site Training', starter: false, prof: false, ent: true },
                  { feature: '99.5% Uptime Commitment', starter: false, prof: false, ent: true },
                ].map(({ feature, starter, prof, ent, valueOnly }) => (
                  <tr key={feature} className="border-b border-slate-200 hover:bg-white transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">{feature}</td>
                    <td className="py-4 px-4 text-slate-600">
                      {valueOnly ? starter : (starter ? <Check /> : <Cross />)}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {valueOnly ? prof : (prof ? <Check /> : <Cross />)}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {valueOnly ? ent : (ent ? <Check /> : <Cross />)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Pricing FAQ</h2>
          <div className="space-y-1">
            <AccordionFaqItem
              q="Is there a free trial?"
              a="Yes. Start a 30-day free trial with the full Professional plan. No credit card required. After 30 days, you can choose to upgrade to a paid plan, downgrade to Starter, or cancel."
            />
            <AccordionFaqItem
              q="Can I change plans anytime?"
              a="Yes. Upgrade to Professional or Enterprise anytime. Downgrade to Starter at the end of your billing cycle. No early-termination fees, no lock-in contracts."
            />
            <AccordionFaqItem
              q="What's included in the free trial?"
              a="The full Professional plan — criticality ranking, drift prediction, approval workflow, Beamex/Fluke CSV import, unlimited users — for 30 days. You import your own instrument data using our guided CSV wizard. Email support is included. No credit card required, no automatic billing."
            />
            <AccordionFaqItem
              q="How does annual billing work?"
              a="Annual plans are billed once per year and give you 2 months free (you pay for 10 months, get 12). Monthly plans renew each month. You can switch from monthly to annual anytime."
            />
            <AccordionFaqItem
              q="What if I outgrow my plan?"
              a="Upgrade instantly. You'll be billed the difference for the remainder of your billing cycle. No penalty, no waiting."
            />
            <AccordionFaqItem
              q="Is there a discount for non-profits or education?"
              a="Contact us at info@calcheq.com to discuss special pricing for non-profit research institutions and technical colleges."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 text-center bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Ready to simplify calibration management?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Start your 30-day free trial today. No credit card required.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            Start Your Free Pilot
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
