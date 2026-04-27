import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import MoreSheet from './MoreSheet'

// Bottom nav for mobile (native + small web viewports). Five slots — four primary
// destinations + a "More" sheet for everything else. Sits inside a fixed bar with
// safe-area-bottom padding so iPhone home-indicator devices don't overlap the icons.
//
// The Calibrations slot shows a red badge for pending approvals to keep parity with
// the desktop sidebar. Pending count is supplied by Layout (single fetch on mount).

function NavItem({ to, end, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1 ` +
        `relative text-[11px] font-medium transition-colors ` +
        (isActive
          ? 'text-blue-600'
          : 'text-slate-500 hover:text-slate-700 active:text-slate-900')
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="leading-none">{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-1/2 translate-x-[18px]
                         min-w-[16px] h-4 px-1
                         bg-red-500 text-white text-[9px] font-bold
                         rounded-full leading-4 text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  )
}

function MoreItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1
                 text-[11px] font-medium text-slate-500 hover:text-slate-700 active:text-slate-900
                 transition-colors"
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="leading-none">{label}</span>
    </button>
  )
}

export default function BottomNav({ pendingCount, role, isSuperadmin }) {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30
                   bg-white border-t border-slate-200
                   flex items-stretch
                   pb-[env(safe-area-inset-bottom,0px)]
                   shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
        aria-label="Primary navigation"
      >
        <NavItem to="/app"              end icon="🏠" label="Home"     />
        <NavItem to="/app/instruments"      icon="🔧" label="Instr."   />
        <NavItem to="/app/calibrations"     icon="📋" label="Calibs"  badge={pendingCount} />
        <NavItem to="/app/schedule"         icon="📅" label="Schedule" />
        <MoreItem                            icon="⚙️" label="More"     onClick={() => setMoreOpen(true)} />
      </nav>

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        role={role}
        isSuperadmin={isSuperadmin}
      />
    </>
  )
}
