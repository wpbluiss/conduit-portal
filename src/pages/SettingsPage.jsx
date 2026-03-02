import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Icons, StatCard } from '../components/ui'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://conduit-backend-production.up.railway.app'

const VOICES = [
  { id: "alloy", name: "Alloy", desc: "Warm & balanced" },
  { id: "ash", name: "Ash", desc: "Confident & clear" },
  { id: "ballad", name: "Ballad", desc: "Soft & expressive" },
  { id: "coral", name: "Coral", desc: "Bright & friendly" },
  { id: "echo", name: "Echo", desc: "Deep & professional" },
  { id: "sage", name: "Sage", desc: "Calm & trustworthy" },
  { id: "shimmer", name: "Shimmer", desc: "Energetic & upbeat" },
  { id: "verse", name: "Verse", desc: "Smooth & articulate" },
]

const LANGUAGES = [
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "es", name: "Spanish", flag: "🇪🇸" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "pt", name: "Portuguese", flag: "🇧🇷" },
  { id: "de", name: "German", flag: "🇩🇪" },
  { id: "it", name: "Italian", flag: "🇮🇹" },
  { id: "zh", name: "Chinese", flag: "🇨🇳" },
  { id: "ja", name: "Japanese", flag: "🇯🇵" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "hi", name: "Hindi", flag: "🇮🇳" },
]

const PERSONALITIES = [
  { id: "professional", name: "Professional", desc: "Formal, polished, corporate tone", icon: "👔" },
  { id: "friendly", name: "Friendly", desc: "Warm, casual, approachable", icon: "😊" },
  { id: "concise", name: "Concise", desc: "Quick, efficient, to the point", icon: "⚡" },
  { id: "empathetic", name: "Empathetic", desc: "Understanding, patient, caring", icon: "💛" },
]

const HOURS_PRESETS = [
  { id: "24_7", name: "24/7 — Always On", hours: "24/7" },
  { id: "business", name: "Business Hours — Mon-Fri 8am-6pm", hours: "Mon-Fri 8:00 AM - 6:00 PM" },
  { id: "extended", name: "Extended — Mon-Sat 7am-9pm", hours: "Mon-Sat 7:00 AM - 9:00 PM" },
  { id: "after_hours", name: "After Hours Only", hours: "Mon-Fri 6:00 PM - 8:00 AM, Sat-Sun All Day" },
  { id: "custom", name: "Custom hours", hours: "" },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("agent")
  const [affiliate, setAffiliate] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [referralClients, setReferralClients] = useState({})
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [affiliateChecked, setAffiliateChecked] = useState(false)
  const [creatingAffiliate, setCreatingAffiliate] = useState(false)
  const [affiliateError, setAffiliateError] = useState("")
  const [copied, setCopied] = useState("")
  const [form, setForm] = useState({
    voice: "alloy", language: "en", personality: "professional",
    greeting: "", business_hours: "24_7", custom_hours: "",
    notification_email: "", business_name: "", phone: "",
    services_offered: "", website: "", zapier_webhook_url: "",
  })

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
      if (data && data[0]) {
        const c = data[0]
        setClient(c)
        const matchedHours = HOURS_PRESETS.find(h => h.hours === c.agent_business_hours)
        setForm({
          voice: c.agent_voice || "alloy",
          language: c.agent_language || "en",
          personality: c.agent_personality || "professional",
          greeting: c.agent_greeting || "",
          business_hours: matchedHours ? matchedHours.id : "custom",
          custom_hours: matchedHours ? "" : (c.agent_business_hours || ""),
          notification_email: c.notification_email || "",
          business_name: c.business_name || "",
          phone: c.phone || "",
          services_offered: c.services_offered || "",
          website: c.website || "",
          zapier_webhook_url: c.zapier_webhook_url || "",
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  const updateForm = (key, val) => { setForm(prev => ({ ...prev, [key]: val })); setSaved(false) }

  // Lazy-load affiliate data when referrals tab activated
  useEffect(() => {
    if (activeTab !== "referrals" || affiliateChecked) return
    async function loadAffiliate() {
      setReferralsLoading(true)
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/affiliates`)
        const data = await res.json()
        const match = (data.affiliates || []).find(a => a.email === user?.email)
        if (match) {
          setAffiliate(match)
          // Fetch referrals
          const rRes = await fetch(`${BACKEND_URL}/api/v1/affiliates/${match.id}/referrals`)
          const rData = await rRes.json()
          const refs = rData.referrals || []
          setReferrals(refs)
          // Bulk resolve business names
          const clientIds = refs.map(r => r.referred_client_id).filter(Boolean)
          if (clientIds.length > 0) {
            const { data: clients } = await supabase
              .from("clients")
              .select("id, business_name")
              .in("id", clientIds)
            const map = {}
            ;(clients || []).forEach(c => { map[c.id] = c.business_name })
            setReferralClients(map)
          }
        }
      } catch (e) { console.log("Failed to load affiliate data:", e) }
      setAffiliateChecked(true)
      setReferralsLoading(false)
    }
    loadAffiliate()
  }, [activeTab, affiliateChecked, user?.email])

  const handleCreateAffiliate = async () => {
    if (!client || creatingAffiliate) return
    setCreatingAffiliate(true)
    setAffiliateError("")
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/affiliates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client.contact_name || client.business_name || user?.email,
          business_name: client.business_name || "",
          email: user?.email,
          phone: client.phone || "",
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || errData.error || `Request failed (${res.status})`)
      }
      const data = await res.json()
      if (data.id) {
        // Fetch the full affiliate record so dashboard has all fields
        try {
          const fullRes = await fetch(`${BACKEND_URL}/api/v1/affiliates`)
          const fullData = await fullRes.json()
          const match = (fullData.affiliates || []).find(a => a.id === data.id)
          if (match) {
            setAffiliate(match)
          } else {
            setAffiliate({ id: data.id, referral_code: data.referral_code, commission_percent: data.commission_percent, email: user?.email, name: client.business_name || user?.email, total_referrals: 0, total_earned: 0, status: "active" })
          }
        } catch {
          setAffiliate({ id: data.id, referral_code: data.referral_code, commission_percent: data.commission_percent, email: user?.email, name: client.business_name || user?.email, total_referrals: 0, total_earned: 0, status: "active" })
        }
        setReferrals([])
      } else {
        throw new Error("No affiliate ID returned")
      }
    } catch (e) {
      console.log("Failed to create affiliate:", e)
      setAffiliateError(e.message || "Something went wrong. Please try again.")
    }
    setCreatingAffiliate(false)
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(""), 2000)
  }

  const handleSave = async () => {
    if (!client) return
    setSaving(true)
    const hoursPreset = HOURS_PRESETS.find(h => h.id === form.business_hours)
    const businessHours = form.business_hours === "custom" ? form.custom_hours : (hoursPreset?.hours || "24/7")

    // Update Supabase
    await supabase.from("clients").update({
      agent_voice: form.voice,
      agent_language: form.language,
      agent_personality: form.personality,
      agent_greeting: form.greeting,
      agent_business_hours: businessHours,
      notification_email: form.notification_email,
      business_name: form.business_name,
      phone: form.phone,
      services_offered: form.services_offered,
      website: form.website,
      zapier_webhook_url: form.zapier_webhook_url,
    }).eq("id", client.id)

    // Update Vapi assistant if one exists
    if (client.vapi_assistant_id) {
      try {
        await fetch(`${BACKEND_URL}/api/v1/agent/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: client.id,
            vapi_assistant_id: client.vapi_assistant_id,
            business_name: form.business_name,
            voice: form.voice,
            language: form.language,
            personality: form.personality,
            greeting: form.greeting,
            business_hours: businessHours,
            services_offered: form.services_offered,
          }),
        })
      } catch (e) { console.log("Agent update queued") }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
  const inputBg = { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.3)", color: "#e2e8f0" }

  const tabs = [
    { id: "agent", label: "AI Agent", icon: "🤖" },
    { id: "business", label: "Business", icon: "🏢" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "referrals", label: "Referrals", icon: "🤝" },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Manage your AI agent and business preferences</p>
        </div>
        {activeTab !== "referrals" && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70" style={{ background: saved ? "#10b981" : "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg overflow-x-auto" style={{ background: "rgba(15,23,42,0.5)", WebkitOverflowScrolling: "touch" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap" style={{
            background: activeTab === t.id ? "rgba(6,182,212,0.15)" : "transparent",
            color: activeTab === t.id ? "#06b6d4" : "#64748b",
            border: activeTab === t.id ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Agent Tab */}
      {activeTab === "agent" && (
        <div className="space-y-6">
          {/* Voice */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Voice</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VOICES.map(v => (
                <button key={v.id} onClick={() => updateForm("voice", v.id)} className="p-3 rounded-lg text-center transition-all" style={{
                  background: form.voice === v.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                  border: `1px solid ${form.voice === v.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                }}>
                  <div className="text-xs font-semibold" style={{ color: form.voice === v.id ? "#06b6d4" : "#e2e8f0" }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Language</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LANGUAGES.map(l => (
                <button key={l.id} onClick={() => updateForm("language", l.id)} className="p-2.5 rounded-lg text-center transition-all" style={{
                  background: form.language === l.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                  border: `1px solid ${form.language === l.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                }}>
                  <div className="text-base">{l.flag}</div>
                  <div style={{ fontSize: 10, color: form.language === l.id ? "#06b6d4" : "#94a3b8" }}>{l.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Personality</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERSONALITIES.map(p => (
                <button key={p.id} onClick={() => updateForm("personality", p.id)} className="p-3 rounded-lg text-left transition-all" style={{
                  background: form.personality === p.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                  border: `1px solid ${form.personality === p.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                }}>
                  <span className="mr-2">{p.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: form.personality === p.id ? "#06b6d4" : "#e2e8f0" }}>{p.name}</span>
                  <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Greeting */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Greeting Message</h3>
            <textarea value={form.greeting} onChange={e => updateForm("greeting", e.target.value)} rows={3} className={inputStyle} style={{ ...inputBg, resize: "vertical" }} placeholder="Thank you for calling..." />
          </div>

          {/* Business Hours */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>When should your AI answer?</h3>
            <div className="space-y-2">
              {HOURS_PRESETS.map(h => (
                <button key={h.id} onClick={() => updateForm("business_hours", h.id)} className="w-full p-3 rounded-lg text-left transition-all" style={{
                  background: form.business_hours === h.id ? "rgba(6,182,212,0.1)" : "rgba(30,41,59,0.3)",
                  border: `1px solid ${form.business_hours === h.id ? "rgba(6,182,212,0.4)" : "rgba(100,116,139,0.15)"}`,
                }}>
                  <span className="text-sm" style={{ color: form.business_hours === h.id ? "#06b6d4" : "#e2e8f0" }}>{h.name}</span>
                </button>
              ))}
              {form.business_hours === "custom" && (
                <input value={form.custom_hours} onChange={e => updateForm("custom_hours", e.target.value)} placeholder="e.g. Mon-Fri 9am-5pm" className={inputStyle} style={{ ...inputBg, marginTop: 8 }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Business Tab */}
      {activeTab === "business" && (
        <div className="space-y-6">
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Business Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Business Name</label><input value={form.business_name} onChange={e => updateForm("business_name", e.target.value)} className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Phone</label><input value={form.phone} onChange={e => updateForm("phone", e.target.value)} className={inputStyle} style={inputBg} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notification Email</label><input value={form.notification_email} onChange={e => updateForm("notification_email", e.target.value)} className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Website</label><input value={form.website} onChange={e => updateForm("website", e.target.value)} className={inputStyle} style={inputBg} /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Services Offered</label><input value={form.services_offered} onChange={e => updateForm("services_offered", e.target.value)} className={inputStyle} style={inputBg} placeholder="e.g. AC Repair, Installation, Maintenance" /></div>
            </div>
          </div>

          {/* Agent Status */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Agent Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                <span className="text-sm" style={{ color: "#94a3b8" }}>Status</span>
                <span className="text-sm font-semibold flex items-center gap-2" style={{ color: client?.agent_configured ? "#10b981" : "#f59e0b" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: client?.agent_configured ? "#10b981" : "#f59e0b" }} />
                  {client?.agent_configured ? "Live" : "Setting up..."}
                </span>
              </div>
              {client?.assigned_phone && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>Assigned Phone</span>
                  <span className="text-sm font-mono font-semibold" style={{ color: "#06b6d4" }}>{client.assigned_phone}</span>
                </div>
              )}
              {client?.vapi_assistant_id && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>Agent ID</span>
                  <span className="text-xs font-mono" style={{ color: "#64748b" }}>{client.vapi_assistant_id}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                <span className="text-sm" style={{ color: "#94a3b8" }}>Plan</span>
                <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{client?.plan === "pro" ? "Home Services" : client?.plan === "starter" ? "Beauty & Wellness" : client?.plan || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Zapier */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,0,0.15)" }}>
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Zapier Integration</h3>
                <p style={{ fontSize: 11, color: "#64748b" }}>Automatically sync your leads to any business tool</p>
              </div>
            </div>

            {/* 3-step instructions */}
            <div className="mb-5 space-y-3">
              <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Connect your business tools in 3 steps:</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: "rgba(255,107,0,0.15)", color: "#f97316" }}>1</span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#06b6d4" }}>zapier.com</a> and create a free account</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: "rgba(255,107,0,0.15)", color: "#f97316" }}>2</span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Search for "Webhooks by Zapier" and select "Catch Hook" as your trigger</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: "rgba(255,107,0,0.15)", color: "#f97316" }}>3</span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Copy the webhook URL Zapier gives you and paste it below</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>Your leads will automatically sync to any app — Google Sheets, Booksy, ServiceTitan, Jobber, HouseCall Pro, and 6,000+ more.</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Zapier Webhook URL</label>
              <input value={form.zapier_webhook_url} onChange={e => updateForm("zapier_webhook_url", e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/..." className={inputStyle} style={inputBg} />
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#06b6d4" }}>Data sent with each lead:</p>
              <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                caller_name, caller_phone, service_needed, urgency, estimated_value, transcript, business_name, timestamp
              </p>
            </div>

            {/* Popular connections */}
            <div className="mt-5">
              <p className="text-xs font-semibold mb-3" style={{ color: "#94a3b8" }}>Popular connections:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Booksy", icon: "📅", bg: "rgba(139,92,246,0.12)" },
                  { name: "Google Sheets", icon: "📊", bg: "rgba(16,185,129,0.12)" },
                  { name: "ServiceTitan", icon: "🔧", bg: "rgba(6,182,212,0.12)" },
                  { name: "Jobber", icon: "📋", bg: "rgba(59,130,246,0.12)" },
                  { name: "HouseCall Pro", icon: "🏠", bg: "rgba(245,158,11,0.12)" },
                  { name: "Calendly", icon: "🗓️", bg: "rgba(96,165,250,0.12)" },
                ].map(app => (
                  <div key={app.name} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: app.bg, border: "1px solid rgba(100,116,139,0.1)" }}>
                    <span className="text-sm">{app.icon}</span>
                    <span className="text-xs font-medium" style={{ color: "#e2e8f0" }}>{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generic Webhook */}
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.15)" }}>
                <span className="text-lg">🔗</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Custom Webhook</h3>
                <p style={{ fontSize: 11, color: "#64748b" }}>Works with Make.com, n8n, or any custom endpoint</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "#64748b" }}>The same webhook URL field above works with any webhook receiver. We send a POST request with JSON data for every new lead.</p>
          </div>

          {/* API Access coming soon */}
          <div className="rounded-xl p-6 opacity-60" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                <span className="text-lg">🔑</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>REST API <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{ background: "rgba(139,92,246,0.2)", color: "#8b5cf6" }}>Coming Soon</span></h3>
                <p style={{ fontSize: 11, color: "#64748b" }}>Full API access to manage agents, calls, and leads programmatically</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === "referrals" && (
        <div className="space-y-6">
          {referralsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !affiliate ? (
            /* CTA: Become a Referral Partner */
            <div className="rounded-xl p-8 text-center" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(6,182,212,0.15)" }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(6,182,212,0.12)" }}>
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Become a Referral Partner</h3>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#94a3b8" }}>
                Earn <span style={{ color: "#06b6d4", fontWeight: 600 }}>20% commission</span> on every client you refer to ConduitAI. Share your unique link and start earning.
              </p>
              <div className="max-w-sm mx-auto mb-6 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <Icons.check size={12} style={{ color: "#10b981" }} />
                  </div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>Get a unique referral code and shareable link</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <Icons.check size={12} style={{ color: "#10b981" }} />
                  </div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>Earn 20% recurring commission on each referral</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <Icons.check size={12} style={{ color: "#10b981" }} />
                  </div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>Track your referrals and earnings in real time</p>
                </div>
              </div>
              {affiliateError && (
                <div className="mb-4 p-3 rounded-lg text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs font-medium" style={{ color: "#ef4444" }}>{affiliateError}</p>
                </div>
              )}
              <button onClick={handleCreateAffiliate} disabled={creatingAffiliate} className="px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
                {creatingAffiliate ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : "Start Earning"}
              </button>
            </div>
          ) : (
            /* Full Affiliate Dashboard */
            <>
              {/* Referral Code Card */}
              <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(6,182,212,0.15)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Your Referral Code</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-lg sm:text-2xl font-bold font-mono tracking-wider" style={{ color: "#06b6d4" }}>{affiliate.referral_code}</span>
                  <button onClick={() => copyToClipboard(affiliate.referral_code, "code")} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: copied === "code" ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.12)", color: copied === "code" ? "#10b981" : "#06b6d4", border: `1px solid ${copied === "code" ? "rgba(16,185,129,0.3)" : "rgba(6,182,212,0.3)"}` }}>
                    {copied === "code" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input readOnly value={`https://conduitai.io?ref=${affiliate.referral_code}`} className="flex-1 px-3 py-2 rounded-lg text-xs font-mono" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(100,116,139,0.2)", color: "#94a3b8" }} />
                  <button onClick={() => copyToClipboard(`https://conduitai.io?ref=${affiliate.referral_code}`, "link")} className="px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0" style={{ background: copied === "link" ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.12)", color: copied === "link" ? "#10b981" : "#06b6d4", border: `1px solid ${copied === "link" ? "rgba(16,185,129,0.3)" : "rgba(6,182,212,0.3)"}` }}>
                    {copied === "link" ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Total Referrals"
                  value={affiliate.total_referrals || referrals.length}
                  icon={Icons.users}
                  color="#06b6d4"
                />
                <StatCard
                  label="Total Earned"
                  value={`$${(affiliate.total_earned || 0).toFixed(2)}`}
                  icon={Icons.dollar}
                  color="#10b981"
                />
                <StatCard
                  label="Pending Commissions"
                  value={`$${referrals.filter(r => r.status !== "commission_paid").reduce((sum, r) => sum + (r.commission_amount || 0), 0).toFixed(2)}`}
                  icon={Icons.clock}
                  color="#f59e0b"
                />
              </div>

              {/* Share Section */}
              <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>Share with Friends</h3>
                <div className="relative">
                  <textarea readOnly rows={3} className="w-full px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(100,116,139,0.2)", color: "#94a3b8", resize: "none" }}
                    value={`Hey! I've been using ConduitAI to handle my business calls with AI and it's been amazing. Use my referral link to get started: https://conduitai.io?ref=${affiliate.referral_code}`}
                  />
                  <button onClick={() => copyToClipboard(`Hey! I've been using ConduitAI to handle my business calls with AI and it's been amazing. Use my referral link to get started: https://conduitai.io?ref=${affiliate.referral_code}`, "message")} className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: copied === "message" ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.12)", color: copied === "message" ? "#10b981" : "#06b6d4" }}>
                    {copied === "message" ? "Copied!" : "Copy Message"}
                  </button>
                </div>
              </div>

              {/* Referrals Table */}
              <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Your Referrals</h3>
                {referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-3xl mb-3 block">📭</span>
                    <p className="text-sm" style={{ color: "#64748b" }}>No referrals yet. Share your link to get started!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(100,116,139,0.15)" }}>
                          <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Business</th>
                          <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Date</th>
                          <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Status</th>
                          <th className="text-right text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map(ref => {
                          const statusConfig = {
                            pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pending" },
                            converted: { bg: "rgba(6,182,212,0.15)", color: "#06b6d4", label: "Converted" },
                            commission_paid: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Paid" },
                          }
                          const sc = statusConfig[ref.status] || statusConfig.pending
                          return (
                            <tr key={ref.id} style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}>
                              <td className="py-3 px-2 text-sm" style={{ color: "#e2e8f0" }}>{referralClients[ref.referred_client_id] || "—"}</td>
                              <td className="py-3 px-2 text-sm" style={{ color: "#94a3b8" }}>{ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "—"}</td>
                              <td className="py-3 px-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                                  {sc.label}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-sm font-medium text-right" style={{ color: "#e2e8f0" }}>${(ref.commission_amount || 0).toFixed(2)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
