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
            <img src="/icon.svg" alt="Conduit AI" width={32} height={32} style={{ borderRadius: 8 }} />
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
