import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Icons } from '../components/ui'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 100%)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden" style={{ borderBottom: "1px solid rgba(6, 182, 212, 0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-base font-bold tracking-tight font-outfit" style={{ color: "#e2e8f0" }}>
              Conduit<span style={{ color: "#06b6d4" }}>AI</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: "#94a3b8" }}>
            <Icons.menu size={22} />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
