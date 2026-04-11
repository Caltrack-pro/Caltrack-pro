import { Link } from 'react-router-dom'

export default function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Calcheq</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Industrial instrument calibration management — built for the people who keep plants running.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/app"      className="hover:text-white transition-colors">Launch App</Link></li>
              <li><Link to="/pricing"  className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/blog"     className="hover:text-white transition-colors">Use Cases</Link></li>
              <li><Link to="/faq"      className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Industries</h4>
            <ul className="space-y-3 text-sm">
              <li><span className="hover:text-white transition-colors cursor-default">Oil &amp; Gas</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Chemical Processing</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Food &amp; Beverage</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Pharmaceuticals</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Power Generation</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact"  className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/contact"  className="hover:text-white transition-colors">Request Demo</Link></li>
              <li><a href="mailto:info@calcheq.com" className="hover:text-white transition-colors">info@calcheq.com</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {year} Calcheq. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-default">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-default">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
