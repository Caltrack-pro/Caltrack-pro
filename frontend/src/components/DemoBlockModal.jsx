import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * Global modal that appears when a demo-mode user tries a write action.
 * Listens for the custom 'caltrack-demo-blocked' event dispatched by api.js.
 * Renders a conversion-friendly message with CTAs to sign up or contact sales.
 */
export default function DemoBlockModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handler() { setOpen(true) }
    window.addEventListener('caltrack-demo-blocked', handler)
    return () => window.removeEventListener('caltrack-demo-blocked', handler)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">This Is a Read-Only Demo</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You're exploring the Riverdale Water Treatment Plant demo.
          To create instruments, record calibrations, and manage your own site,
          start a free trial — no credit card required.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="block w-full py-2.5 px-4 text-sm font-bold text-white rounded-lg transition-colors"
            style={{ background: '#F57C00' }}
            onMouseEnter={e => e.target.style.background = '#FFA000'}
            onMouseLeave={e => e.target.style.background = '#F57C00'}
          >
            Start Free Trial
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-full py-2.5 px-4 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  )
}
