import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icons, StatCard, StatusBadge } from '../components/ui'

export default function AdminPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setClients(data)
      setLoading(false)
    }
    load()
  }, [])

  const activeClients = clients.filter(c => c.status === 'active')
  const mrr = activeClients.reduce((s, c) => s + (c.monthly_rate || 350), 0)
  const totalCalls = clients.reduce((s, c) => s + (c.calls_recovered || 0), 0)
  const totalRevenue = clients.reduce((s, c) => s + (c.revenue_recovered || 0), 0)
  const onboarding = clients.filter(c => c.status === 'onboarding').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>Admin Panel</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Conduit AI business overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Monthly Recurring Revenue" value={`$${mrr.toLocaleString()}`} icon={Icons.dollar} color="#10b981"
          subtext={`${activeClients.length} active clients`} />
        <StatCard label="Total Calls Recovered" value={totalCalls} icon={Icons.phone} color="#06b6d4"
          sparkData={[35, 42, 48, 52, 61, 73, 82]} />
        <StatCard label="Client Revenue Recovered" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={Icons.trending} color="#f59e0b" />
        <StatCard label="Total Clients" value={clients.length} icon={Icons.users} color="#8b5cf6"
          subtext={onboarding > 0 ? `${onboarding} onboarding` : undefined} />
      </div>

      {/* Clients Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.12)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.1)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>All Clients</h3>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>
            {clients.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.1)" }}>
                  {["Business", "Contact", "Plan", "Status", "Calls", "Revenue", "Joined"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-800/30" style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.06)" }}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{client.business_name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{client.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#94a3b8" }}>{client.contact_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full font-medium capitalize" style={{
                        background: client.plan === "pro" ? "rgba(6, 182, 212, 0.15)" : "rgba(100, 116, 139, 0.15)",
                        color: client.plan === "pro" ? "#06b6d4" : "#94a3b8",
                      }}>{client.plan}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={client.status} /></td>
                    <td className="px-5 py-3.5 text-sm font-semibold font-mono" style={{ color: "#e2e8f0" }}>{client.calls_recovered || 0}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold font-mono" style={{ color: "#10b981" }}>${(client.revenue_recovered || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#64748b" }}>{new Date(client.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
