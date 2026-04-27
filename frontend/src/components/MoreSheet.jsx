import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut, setDemoMode, getUser } from '../utils/userContext'

// Bottom-sheet drawer for nav items that don't fit in the 5-slot bottom bar.
// Mirrors the role/superadmin gates from Sidebar.jsx so technicians keep the
// simplified view on mobile too.

function SheetLink({ to, icon, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 min-h-[52px] text-sm font-medium ` +
        `border-b border-slate-100 last:border-b-0 ` +
        (isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100')
      }
    >
      <span className="text-xl w-6 text-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

function SheetButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 min-h-[52px] text-sm font-medium
                  border-b border-slate-100 last:border-b-0 text-left
                  ${danger ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                           : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'}`}
    >
      <span className="text-xl w-6 text-center">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default function MoreSheet({ open, onClose, role, isSuperadmin }) {
  const navigate = useNavigate()

  // Lock body scroll while the sheet is open so the page underneath doesn't
  // jiggle when the user drags within the drawer.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const user = getUser()
  const isDemoMode = user?.isDemoMode ?? false
  const isOwnSite  = !isDemoMode && !!user

  async function handleSignOut() {
    onClose()
    await signOut()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl
                   shadow-2xl pb-[env(safe-area-inset-bottom,0px)]
                   max-h-[85vh] overflow-y-auto animate-slide-up"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="px-4 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">More</p>
        </div>

        <div className="border-t border-slate-100">
          {role !== 'technician' && (
            <SheetLink to="/app/diagnostics" icon="🔬" label="Smart Diagnostics" onClose={onClose} />
          )}
          <SheetLink to="/app/documents" icon="📁" label="Documents" onClose={onClose} />
          {role !== 'technician' && (
            <SheetLink to="/app/reports" icon="📄" label="Reports" onClose={onClose} />
          )}
          <SheetLink to="/app/settings" icon="⚙️"  label="Settings" onClose={onClose} />
          <SheetLink to="/app/support"  icon="🆘" label="Support"  onClose={onClose} />
          {isSuperadmin && (
            <SheetLink to="/app/admin" icon="👑" label="Platform Admin" onClose={onClose} />
          )}
        </div>

        <div className="border-t border-slate-100 mt-2">
          {isOwnSite && (
            <SheetButton
              icon="🔍"
              label="Try Demo"
              onClick={() => { setDemoMode(true); onClose() }}
            />
          )}
          {isDemoMode && (
            <SheetButton
              icon="↩️"
              label="Switch back to your site"
              onClick={() => { setDemoMode(false); onClose() }}
            />
          )}
          <SheetButton icon="🚪" label="Sign out" onClick={handleSignOut} danger />
        </div>
      </div>
    </div>
  )
}
