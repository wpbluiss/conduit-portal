import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icons } from './ui'

export default function Sidebar() {
  const { signOut, user, isAdmin } = useAuth()

  const clientNav = [
    { to: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
    { to: "/calls", label: "Call Log", icon: Icons.phone },
    { to: "/settings", label: "Settings", icon: Icons.settings },
  ]
  const adminNav = [
    { to: "/admin", label: "Admin Panel", icon: Icons.shield },
    { to: "/clients", label: "All Clients", icon: Icons.users },
    { to: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
    { to: "/calls", label: "Call Log", icon: Icons.phone },
    { to: "/settings", label: "Settings", icon: Icons.settings },
  ]
  const nav = isAdmin ? adminNav : clientNav

  return (
    <div className="w-64 min-h-screen flex flex-col shrink-0" style={{ background: "rgba(8, 12, 24, 0.95)", borderRight: "1px solid rgba(6, 182, 212, 0.1)" }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <span className="text-lg font-bold tracking-tight font-outfit" style={{ color: "#e2e8f0" }}>
          Conduit<span style={{ color: "#06b6d4" }}>AI</span>
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 mt-2">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:bg-slate-800/50'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? "rgba(6, 182, 212, 0.12)" : undefined
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-5">
        <div className="p-3 rounded-lg" style={{ background: "rgba(30, 41, 59, 0.3)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "white" }}>
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#e2e8f0" }}>{user?.email || ""}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>{isAdmin ? "Admin" : "Client"}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 transition-colors">
              <Icons.logout size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
