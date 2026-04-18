import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/pricing',      label: 'Pricing'      },
    { to: '/demo',         label: 'Demo'         },
    { to: '/resources',    label: 'Resources'    },
    { to: '/faq',          label: 'FAQ'          },
    { to: '/contact',      label: 'Contact'      },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: '#0B1F3A', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div className="px-[5%] flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          <img
            src="/assets/calcheq-logo-horizontal-lockup.svg"
            alt="CalCheq"
            height="38"
            style={{ height: 38, width: 'auto' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.85)' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth/signin"
            className="text-sm font-bold rounded-md px-4 py-2 border-2 transition-all"
            style={{ color: '#00BCD4', borderColor: '#00BCD4', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00BCD4'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00BCD4' }}
          >
            Sign In
          </Link>
          <Link
            to="/contact"
            className="text-sm font-bold text-white rounded-md px-5 py-2 transition-colors"
            style={{ background: '#F57C00' }}
            onMouseEnter={e => e.target.style.background = '#FFA000'}
            onMouseLeave={e => e.target.style.background = '#F57C00'}
          >
            Start Free Trial
          </Link>
          <Link
            to="/auth/signup"
            className="text-sm font-bold text-white rounded-md px-5 py-2 transition-colors"
            style={{ background: '#16a34a' }}
            onMouseEnter={e => e.target.style.background = '#15803d'}
            onMouseLeave={e => e.target.style.background = '#16a34a'}
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t py-4 px-[5%] space-y-1" style={{ background: '#0B1F3A', borderColor: 'rgba(255,255,255,0.1)' }}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth/signin"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 py-3 text-sm font-bold text-center rounded-md border-2"
            style={{ color: '#00BCD4', borderColor: '#00BCD4' }}
          >
            Sign In
          </Link>
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="block mt-3 py-3 text-sm font-bold text-white text-center rounded-md"
            style={{ background: '#F57C00' }}
          >
            Start Free Trial
          </Link>
          <Link
            to="/auth/signup"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 py-3 text-sm font-bold text-white text-center rounded-md"
            style={{ background: '#16a34a' }}
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  )
}
