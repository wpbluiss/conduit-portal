// ============================================================
// Icons
// ============================================================
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>
)

export const Icons = {
  phone: (p) => <Icon {...p} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
  dashboard: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  logout: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  trending: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  dollar: (p) => <Icon {...p} d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
  check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  mail: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  shield: (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  clock: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  settings: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p?.className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
}

// ============================================================
// Sparkline
// ============================================================
export function Sparkline({ data, color = "#06d6a0", width = 120, height = 40 }) {
  if (!data?.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(" ")
  const gradId = `spark-${color.replace("#", "")}`

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      <polygon fill={`url(#${gradId})`} points={`0,${height} ${points} ${width},${height}`} />
    </svg>
  )
}

// ============================================================
// Status Badge
// ============================================================
export function StatusBadge({ status }) {
  const config = {
    new: { bg: "bg-cyan-500/20", text: "text-cyan-300", dot: "bg-cyan-400", label: "New Lead" },
    contacted: { bg: "bg-yellow-500/20", text: "text-yellow-300", dot: "bg-yellow-400", label: "Contacted" },
    converted: { bg: "bg-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400", label: "Converted" },
    lost: { bg: "bg-red-500/20", text: "text-red-300", dot: "bg-red-400", label: "Lost" },
    active: { bg: "bg-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400", label: "Active" },
    onboarding: { bg: "bg-blue-500/20", text: "text-blue-300", dot: "bg-blue-400", label: "Onboarding" },
    paused: { bg: "bg-gray-500/20", text: "text-gray-300", dot: "bg-gray-400", label: "Paused" },
  }
  const c = config[status] || config.new
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// ============================================================
// Stat Card
// ============================================================
export function StatCard({ label, value, subtext, icon: IconComp, color = "#06b6d4", sparkData }) {
  return (
    <div className="rounded-xl p-5 transition-all group" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.12)" }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}33`}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.12)"}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
          {IconComp && <IconComp size={18} style={{ color }} />}
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} width={80} height={32} />}
      </div>
      <p className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#64748b" }}>{label}</p>
      {subtext && <p className="text-xs mt-1 font-medium" style={{ color }}>{subtext}</p>}
    </div>
  )
}
