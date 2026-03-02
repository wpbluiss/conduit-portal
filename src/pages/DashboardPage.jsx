import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Icons, StatCard, StatusBadge } from '../components/ui'
import OnboardingWalkthrough from '../components/OnboardingWalkthrough'
import OnboardingBanner from '../components/OnboardingBanner'

const VOICE_NAMES = { alloy: "Alloy", ash: "Ash", ballad: "Ballad", coral: "Coral", echo: "Echo", sage: "Sage", shimmer: "Shimmer", verse: "Verse" }
const LANG_FLAGS = { en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", pt: "🇧🇷", de: "🇩🇪", it: "🇮🇹", zh: "🇨🇳", ja: "🇯🇵", ko: "🇰🇷", hi: "🇮🇳" }
const LANG_NAMES = { en: "English", es: "Spanish", fr: "French", pt: "Portuguese", de: "German", it: "Italian", zh: "Chinese", ja: "Japanese", ko: "Korean", hi: "Hindi" }

export default function DashboardPage() {
  const { user } = useAuth()
  const [calls, setCalls] = useState([])
  const [client, setClient] = useState(null)
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, converted: 0, revenue: 0, newLeads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch client info
        if (user) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
          if (clientData && clientData[0]) setClient(clientData[0])
        }

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
  }, [user])

  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0

  return (
    <div>
      <OnboardingWalkthrough />
      <OnboardingBanner />

      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Your lead recovery overview</p>
      </div>

      {/* Agent Status Card */}
      {client && (
        <div className="mb-6 rounded-xl p-5" style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${client.agent_configured ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: client.agent_configured ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)" }}>
                <span className="text-2xl">{client.agent_configured ? "🤖" : "⏳"}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>AI Agent</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                    background: client.agent_configured ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                    color: client.agent_configured ? "#10b981" : "#f59e0b",
                  }}>
                    {client.agent_configured ? "● Live" : "● Setting up"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    {VOICE_NAMES[client.agent_voice] || "Alloy"} voice
                  </span>
                  <span className="text-xs hidden sm:inline" style={{ color: "#475569" }}>·</span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    {LANG_FLAGS[client.agent_language] || "🇺🇸"} {LANG_NAMES[client.agent_language] || "English"}
                  </span>
                  <span className="text-xs hidden sm:inline" style={{ color: "#475569" }}>·</span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    {(client.agent_personality || "professional").charAt(0).toUpperCase() + (client.agent_personality || "professional").slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right ml-16 sm:ml-0">
              {client.assigned_phone && (
                <p className="text-sm font-mono font-semibold" style={{ color: "#06b6d4" }}>{client.assigned_phone}</p>
              )}
              <a href="/settings" className="text-xs" style={{ color: "#64748b" }}>Configure →</a>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div data-tour="calls">
          <StatCard label="Total Calls Recovered" value={stats.total} icon={Icons.phone} color="#06b6d4" sparkData={[5, 8, 6, 9, 7, 11, stats.thisWeek]} subtext={`+${stats.thisWeek} this week`} />
        </div>
        <StatCard label="Revenue Recovered" value={`$${stats.revenue.toLocaleString()}`} icon={Icons.dollar} color="#10b981" sparkData={[3, 5, 8, 6, 9, 11, 14]} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={Icons.trending} color="#f59e0b" sparkData={[20, 25, 22, 28, 30, conversionRate]} />
        <div data-tour="agent-status">
          <StatCard label="New Leads" value={stats.newLeads} icon={Icons.mail} color="#8b5cf6" subtext="Awaiting follow-up" />
        </div>
      </div>

      {/* Recent Calls Table */}
      <div data-tour="leads" className="rounded-xl overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.12)" }}>
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
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <table className="w-full" style={{ minWidth: 600 }}>
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
                    <td className="px-5 py-3.5 text-sm font-semibold font-mono" style={{ color: "#10b981" }}>${(call.estimated_value || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={call.status} /></td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#64748b" }}>{new Date(call.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
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
