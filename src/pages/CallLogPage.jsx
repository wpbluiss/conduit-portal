import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StatusBadge } from '../components/ui'

export default function CallLogPage() {
  const [calls, setCalls] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setCalls(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === "all" ? calls : calls.filter(c => c.status === filter)
  const filters = ["all", "new", "contacted", "converted", "lost"]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>Call Log</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>All recovered leads and their status</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? "rgba(6, 182, 212, 0.15)" : "rgba(30, 41, 59, 0.3)",
              color: filter === f ? "#06b6d4" : "#64748b",
              border: `1px solid ${filter === f ? "rgba(6, 182, 212, 0.3)" : "rgba(100, 116, 139, 0.15)"}`,
            }}>
            {f} {f !== "all" && `(${calls.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.12)" }}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.1)" }}>
                  {["Caller", "Phone", "Service", "Est. Value", "Status", "Date"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(call => (
                  <tr key={call.id} className="transition-colors hover:bg-slate-800/30" style={{ borderBottom: "1px solid rgba(100, 116, 139, 0.06)" }}>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "#e2e8f0" }}>{call.caller_name || "Unknown"}</td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "#94a3b8" }}>{call.caller_phone}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#94a3b8" }}>{call.service_needed || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold font-mono" style={{ color: "#10b981" }}>${(call.estimated_value || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={call.status} /></td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#64748b" }}>{new Date(call.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#64748b" }}>No calls matching this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
