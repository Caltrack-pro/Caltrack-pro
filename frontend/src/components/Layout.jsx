import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import DemoBlockModal from './DemoBlockModal'
import { calibrations as calsApi } from '../utils/api'

export default function Layout() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Load pending approval count for the sidebar badge
  useEffect(() => {
    let cancelled = false
    calsApi.list({ record_status: 'submitted', limit: 1 })
      .then(res => { if (!cancelled) setPendingCount(res?.total ?? 0) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar: always visible on lg+; slide-in on mobile ── */}
      <div className={`
        fixed inset-y-0 left-0 z-30 lg:static lg:z-auto
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          onNavigate={() => setSidebarOpen(false)}
          pendingCount={pendingCount}
        />
      </div>

      {/* ── Right-hand panel: header + scrollable content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(v => !v)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global demo write-block modal */}
      <DemoBlockModal />
    </div>
  )
}
