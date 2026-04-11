import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, setUser, signOut, ROLES } from '../../utils/userContext'
import SignInModal from '../SignInModal'

export default function MarketingNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [currentUser, setCurrentUser] = useState(() => getUser())

  // Keep in sync with sign-in/out events
  useEffect(() => {
    function onUserChange(e) { setCurrentUser(e.detail) }
    window.addEventListener('caltrack-user-change', onUserChange)
    return () => window.removeEventListener('caltrack-user-change', onUserChange)
  }, [])

  function handleSaveUser(user) {
    setUser(user)
    setCurrentUser(user)
    navigate('/app')
  }

  function handleSignOut() {
    signOut()
    setCurrentUser(null)
    setMenuOpen(false)
  }

  const roleLabel = currentUser
    ? (ROLES.find(r => r.value === currentUser.role)?.label ?? currentUser.role)
    : null

  const links = [
    { to: '/pricing', label: 'Pricing'   },
    { to: '/blog',    label: 'Use Cases' },
    { to: '/faq',     label: 'FAQ'       },
    { to: '/contact', label: 'Contact'   },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Calc<span className="text-blue-600">heq</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === l.to
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* CTA buttons — desktop */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                // Already signed in — show user info + Go to App
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{currentUser.userName}</p>
                    <p className="text-[11px] text-slate-400 leading-tight">{currentUser.siteName} · {roleLabel}</p>
                  </div>
                  <Link
                    to="/app"
                    className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Go to App →
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                // Not signed in
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/contact"
                    className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              }
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 text-xs text-slate-500">
                      Signed in as <strong>{currentUser.userName}</strong> · {currentUser.siteName}
                    </div>
                    <Link
                      to="/app"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-center bg-blue-600 text-white rounded-lg"
                    >
                      Go to App →
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block px-4 py-2.5 text-sm text-center text-red-600 border border-red-200 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); setShowModal(true) }}
                      className="block px-4 py-2.5 text-sm text-center text-slate-600 border border-slate-200 rounded-lg"
                    >
                      Sign In
                    </button>
                    <Link
                      to="/contact"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-center bg-blue-600 text-white rounded-lg"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sign-In Modal */}
      {showModal && (
        <SignInModal
          current={currentUser}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
