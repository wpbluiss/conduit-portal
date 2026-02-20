import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Icons, StatCard, StatusBadge } from '../components/ui'

export default function DashboardPage() {
  const [calls, setCalls] = useState([])
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, converted: 0, revenue: 0, newLeads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch recent calls
        const { data: callsData } = await supabase
          .from('calls')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15)

        if (callsData) {
          setCalls(callsData)

          const now = new Date()
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

          setStats({
            total: callsData.length,
            thisWeek: callsData.filter(c => new Date(c.created_at) > weekAgo).length,
            converted: callsData.filter(c => c.status === 'converted').length,
            revenue: callsData.reduce((s, c) => s + (c.estimated_value || 0), 0),
            newLeads: callsData.filter(c => c.status === 'new').length,
          })
        }
      } catch (e) {
        console.error('Failed to load dashboard:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Your lead recovery overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Calls Recovered" value={stats.total} icon={Icons.phone} color="#06b6d4"
          sparkData={[5, 8, 6, 9, 7, 11, stats.thisWeek]} subtext={`+${stats.thisWeek} this week`} />
        <StatCard label="Revenue Recovered" value={`$${stats.revenue.toLocaleString()}`} icon={Icons.dollar} color="#10b981"
          sparkData={[3, 5, 8, 6, 9, 11, 14]} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={Icons.trending} color="#f59e0b"
          sparkData={[20, 25, 22, 28, 30, conversionRate]} />
        <StatCard label="New Leads" value={stats.newLeads} icon={Icons.mail} color="#8b5cf6" subtext="Awaiting follow-up" />
      </div>

      {/* Recent Calls Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.12)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.1)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Recent Recovered Leads</h3>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>{calls.length} leads</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm mt-3" style={{ color: "#64748b" }}>Loading calls...</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center">
            <Icons.phone size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm" style={{ color: "#64748b" }}>No calls recovered yet. They'll appear here once your AI agent starts handling calls.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.08)" }}>
                  {["Caller", "Service Needed", "Est. Value", "Status", "Time"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr key={call.id} className="transition-colors hover:bg-slate-800/30" style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.06)" }}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{call.caller_name || "Unknown"}</p>
                      <p className="text-xs font-mono" style={{ color: "#64748b" }}>{call.caller_phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#94a3b8" }}>{call.service_needed || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold font-mono" style={{ color: "#10b981" }}>
                      ${(call.estimated_value || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={call.status} /></td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#64748b" }}>
                      {new Date(call.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
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
