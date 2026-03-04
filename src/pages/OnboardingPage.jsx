import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://conduit-backend-production.up.railway.app'

const industries = [
  { id: "hvac", label: "HVAC", icon: "❄️" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "stucco", label: "Stucco/Masonry", icon: "🧱" },
  { id: "painting", label: "Painting", icon: "🎨" },
  { id: "landscaping", label: "Landscaping", icon: "🌿" },
  { id: "fire_alarm", label: "Fire Alarm", icon: "🔥" },
  { id: "pest_control", label: "Pest Control", icon: "🐛" },
  { id: "cleaning", label: "Cleaning", icon: "🧹" },
  { id: "auto_repair", label: "Auto Repair", icon: "🔧" },
  { id: "towing", label: "Towing", icon: "🚗" },
  { id: "locksmith", label: "Locksmith", icon: "🔑" },
  { id: "salon", label: "Salon/Barbershop", icon: "💇" },
  { id: "spa", label: "Spa/Wellness", icon: "💆" },
  { id: "medspa", label: "Med Spa", icon: "💉" },
  { id: "dental", label: "Dental", icon: "🦷" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "real_estate", label: "Real Estate", icon: "🏡" },
  { id: "insurance", label: "Insurance", icon: "🛡️" },
  { id: "fitness", label: "Fitness/Gym", icon: "🏋️" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "events", label: "Events", icon: "🎉" },
  { id: "veterinary", label: "Veterinary", icon: "🐾" },
  { id: "accounting", label: "Accounting", icon: "📊" },
  { id: "property_mgmt", label: "Property Mgmt", icon: "🏢" },
  { id: "personal", label: "Personal Use", icon: "👤" },
  { id: "other", label: "Other", icon: "➕" },
]

const PLANS = {
  solo: {
    name: "Solo Operator", icon: "✂️", monthly: 39, leads: 50, perLead: 2,
    desc: "For individual professionals — barbers, stylists, nail techs, solo contractors",
    features: ["50 leads/mo included", "$2 per lead after 50", "AI receptionist 24/7", "Custom greeting & voice", "Email lead notifications", "Analytics dashboard"],
  },
  business: {
    name: "Business", icon: "🏢", monthly: 199, leads: 200, perLead: 0, popular: true,
    desc: "For shops & salons with multiple staff members",
    features: ["200 leads/mo included", "AI receptionist 24/7", "Custom booking scripts", "Multi-language support", "Revenue recovery tracking", "Priority support", "Analytics dashboard"],
  },
}

const VOICES = [
  { id: "alloy", name: "Alloy", desc: "Warm & balanced", gender: "neutral" },
  { id: "ash", name: "Ash", desc: "Confident & clear", gender: "male" },
  { id: "ballad", name: "Ballad", desc: "Soft & expressive", gender: "female" },
  { id: "coral", name: "Coral", desc: "Bright & friendly", gender: "female" },
  { id: "echo", name: "Echo", desc: "Deep & professional", gender: "male" },
  { id: "sage", name: "Sage", desc: "Calm & trustworthy", gender: "female" },
  { id: "shimmer", name: "Shimmer", desc: "Energetic & upbeat", gender: "female" },
  { id: "verse", name: "Verse", desc: "Smooth & articulate", gender: "male" },
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
  { id: "after_hours", name: "After Hours Only — Evenings & Weekends", hours: "Mon-Fri 6:00 PM - 8:00 AM, Sat-Sun All Day" },
  { id: "custom", name: "Custom hours", hours: "" },
]

const CheckIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const PhoneIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSuccess = window.location.pathname.includes('/success')
  const [step, setStep] = useState(isSuccess ? 7 : 1)
  const [loading, setLoading] = useState(false)
  const [provisionStatus, setProvisionStatus] = useState(null)
  const [clientId, setClientId] = useState(null)
  const [form, setForm] = useState({
    // Step 1: Business info
    business_name: "", industry: "", phone: "", location: "",
    notification_email: user?.email || "", services_offered: "",
    avg_job_value: "", timezone: "America/New_York",
    contact_name: "", website: "",
    // Step 2: Plan selection
    plan: "",
    // Step 4: AI Agent config
    voice: "alloy", language: "en", personality: "professional",
    greeting: "", business_hours: "24_7", custom_hours: "",
  })

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const selectedIndustry = industries.find(i => i.id === form.industry)
  const selectedPlan = PLANS[form.plan] || PLANS.solo

  const inputStyle = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
  const inputBg = { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.3)", color: "#e2e8f0" }

  const getDefaultGreeting = () => {
    const name = form.business_name || "our office"
    if (form.personality === "professional") return `Thank you for calling ${name}. How may I assist you today?`
    if (form.personality === "friendly") return `Hey there! Thanks for calling ${name}. What can I help you with?`
    if (form.personality === "concise") return `${name}, how can I help?`
    if (form.personality === "empathetic") return `Thank you for reaching out to ${name}. I'm here to help — what do you need?`
    return `Thank you for calling ${name}. How can I help you?`
  }

  const handleSaveClient = async () => {
    try {
      const hoursPreset = HOURS_PRESETS.find(h => h.id === form.business_hours)
      const agentConfig = {
        voice: form.voice,
        language: form.language,
        personality: form.personality,
        greeting: form.greeting || getDefaultGreeting(),
        business_hours: form.business_hours === "custom" ? form.custom_hours : (hoursPreset?.hours || "24/7"),
      }
      const { data, error } = await supabase.from("clients").insert({
        business_name: form.business_name, contact_name: form.contact_name,
        industry: form.industry, phone: form.phone, email: user?.email,
        notification_email: form.notification_email,
        avg_job_value: parseFloat(form.avg_job_value) || 0,
        website: form.website, timezone: form.timezone, user_id: user?.id,
        status: "onboarding", plan: form.plan || "solo",
        monthly_rate: selectedPlan.monthly,
        agent_voice: form.voice, agent_language: form.language,
        agent_personality: form.personality,
        agent_greeting: form.greeting || getDefaultGreeting(),
        agent_business_hours: agentConfig.business_hours,
        services_offered: form.services_offered,
        location: form.location,
      }).select()
      if (data && data[0]) setClientId(data[0].id)
      return data?.[0]?.id || clientId
    } catch (e) {
      console.error("Save client error:", e)
      return null
    }
  }

  const handleStartFreeTrial = async () => {
    setLoading(true)
    setProvisionStatus("Saving your configuration...")
    try {
      let cId = clientId
      if (!cId) cId = await handleSaveClient()
      if (!cId) { alert("Error saving your info. Please try again."); setLoading(false); return }

      // Provision the AI agent
      setProvisionStatus("Creating your AI agent...")
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/agent/provision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: cId,
            business_name: form.business_name,
            industry: form.industry,
            voice: form.voice,
            language: form.language,
            personality: form.personality,
            greeting: form.greeting || getDefaultGreeting(),
            business_hours: form.business_hours === "custom" ? form.custom_hours : (HOURS_PRESETS.find(h => h.id === form.business_hours)?.hours || "24/7"),
            services_offered: form.services_offered,
            notification_email: form.notification_email,
            contact_name: form.contact_name,
            phone: form.phone,
            plan: form.plan || "solo",
            email: user?.email,
          }),
        })
        const result = await res.json()
        if (result.success) {
          setProvisionStatus("Your AI agent is live!")
        } else {
          setProvisionStatus("Agent queued — we'll finish setup within 24 hours")
        }
      } catch (e) {
        console.log("Agent provision queued:", e)
        setProvisionStatus("Agent queued — we'll finish setup shortly")
      }

      // Also notify admin
      try {
        await fetch(`${BACKEND_URL}/api/v1/stripe/notify-trial`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: form.plan || "solo", email: user?.email,
            business_name: form.business_name, client_id: cId,
            phone: form.phone, industry: form.industry,
            contact_name: form.contact_name,
            voice: form.voice, language: form.language,
            personality: form.personality,
          }),
        })
      } catch (e) { console.log("Notification sent or skipped") }

      setStep(7)
    } catch (e) {
      console.error("Trial signup error:", e)
      alert("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const totalSteps = 7

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 40%, #0a1628 100%)", fontFamily: "'Outfit', sans-serif" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 w-full max-w-2xl px-6 py-12">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all" style={{
                background: step >= s ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "rgba(30,41,59,0.8)",
                color: step >= s ? "white" : "#64748b",
                border: step >= s ? "none" : "1px solid rgba(100,116,139,0.3)",
                fontSize: 11,
              }}>{step > s ? <CheckIcon size={12} /> : s}</div>
              {s < totalSteps && <div className="w-6 h-0.5 rounded" style={{ background: step > s ? "#06b6d4" : "rgba(100,116,139,0.2)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(6,182,212,0.15)", backdropFilter: "blur(20px)" }}>

          {/* ─── STEP 1: Business Info ─── */}
          {step === 1 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Welcome to Conduit AI</h2>
            <p className="text-sm mb-8" style={{ color: "#64748b" }}>Let's get your AI receptionist set up. First, tell us about your business.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Your Name</label><input value={form.contact_name} onChange={e => updateForm("contact_name", e.target.value)} placeholder="John Smith" className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Business Name</label><input value={form.business_name} onChange={e => updateForm("business_name", e.target.value)} placeholder="e.g. Premier Plumbing Co" className={inputStyle} style={inputBg} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Location</label><input value={form.location} onChange={e => updateForm("location", e.target.value)} placeholder="Miami, FL" className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Website (optional)</label><input value={form.website} onChange={e => updateForm("website", e.target.value)} placeholder="www.yourbusiness.com" className={inputStyle} style={inputBg} /></div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-3" style={{ color: "#94a3b8" }}>Industry</label>
                <div className="grid grid-cols-4 gap-2" style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                  {industries.map(ind => (
                    <button key={ind.id} onClick={() => updateForm("industry", ind.id)} className="p-2.5 rounded-lg text-center transition-all" style={{
                      background: form.industry === ind.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                      border: `1px solid ${form.industry === ind.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                    }}>
                      <div className="text-base mb-0.5">{ind.icon}</div>
                      <div className="text-xs font-medium" style={{ color: form.industry === ind.id ? "#06b6d4" : "#94a3b8", fontSize: 10 }}>{ind.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>)}

          {/* ─── STEP 2: Choose Your Plan ─── */}
          {step === 2 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Choose your plan</h2>
            <p className="text-sm mb-2" style={{ color: "#64748b" }}>Both plans include a 14-day free trial. No payment required today.</p>
            <p className="text-xs mb-6" style={{ color: "#475569" }}>You can change your plan anytime after signing up.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(PLANS).map(([key, p]) => (
                <button key={key} onClick={() => updateForm("plan", key)} className="relative p-5 rounded-xl text-left transition-all hover:-translate-y-0.5" style={{
                  background: form.plan === key ? "rgba(6,182,212,0.08)" : "rgba(30,41,59,0.5)",
                  border: `2px solid ${form.plan === key ? "rgba(6,182,212,0.6)" : "rgba(100,116,139,0.15)"}`,
                }}>
                  {p.popular && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "white", fontSize: 10 }}>
                      Most Popular
                    </div>
                  )}
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: form.plan === key ? "#06b6d4" : "#e2e8f0" }}>{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold" style={{ color: form.plan === key ? "#06b6d4" : "#e2e8f0" }}>${p.monthly}</span>
                    <span className="text-sm" style={{ color: "#64748b" }}>/mo</span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>{p.desc}</p>
                  <div className="space-y-2">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5" style={{ color: "#10b981" }}><CheckIcon size={12} /></span>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>)}

          {/* ─── STEP 3: Phone & Notifications ─── */}
          {step === 3 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Phone & notification setup</h2>
            <p className="text-sm mb-8" style={{ color: "#64748b" }}>How should we capture and deliver your leads?</p>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Your Business Phone Number</label><input value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="(561) 555-0000" className={inputStyle} style={inputBg} /><p className="text-xs mt-1" style={{ color: "#475569" }}>We'll set up call forwarding from this number to your AI agent</p></div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Lead Notification Email</label><input value={form.notification_email} onChange={e => updateForm("notification_email", e.target.value)} placeholder="leads@yourbusiness.com" className={inputStyle} style={inputBg} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Average Job Value ($)</label><input value={form.avg_job_value} onChange={e => updateForm("avg_job_value", e.target.value)} placeholder="e.g. 2500" type="number" className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Services You Offer</label><input value={form.services_offered} onChange={e => updateForm("services_offered", e.target.value)} placeholder="e.g. Repairs, Installs" className={inputStyle} style={inputBg} /></div>
              </div>
            </div>
          </div>)}

          {/* ─── STEP 4: AI Agent Configuration ─── */}
          {step === 4 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Configure your AI agent</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Choose how your AI receptionist sounds and behaves.</p>
            <div className="space-y-5">

              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Voice</label>
                <div className="grid grid-cols-4 gap-2">
                  {VOICES.map(v => (
                    <button key={v.id} onClick={() => updateForm("voice", v.id)} className="p-3 rounded-lg text-center transition-all" style={{
                      background: form.voice === v.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                      border: `1px solid ${form.voice === v.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                    }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: form.voice === v.id ? "#06b6d4" : "#e2e8f0" }}>{v.name}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Language</label>
                <div className="grid grid-cols-5 gap-2">
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
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Personality</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITIES.map(p => (
                    <button key={p.id} onClick={() => updateForm("personality", p.id)} className="p-3 rounded-lg text-left transition-all" style={{
                      background: form.personality === p.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                      border: `1px solid ${form.personality === p.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{p.icon}</span>
                        <span className="text-sm font-semibold" style={{ color: form.personality === p.id ? "#06b6d4" : "#e2e8f0" }}>{p.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>When should your AI answer?</label>
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
                    <input value={form.custom_hours} onChange={e => updateForm("custom_hours", e.target.value)} placeholder="e.g. Mon-Fri 9am-5pm, Sat 10am-2pm" className={inputStyle} style={{ ...inputBg, marginTop: 8 }} />
                  )}
                </div>
              </div>
            </div>
          </div>)}

          {/* ─── STEP 5: Custom Greeting ─── */}
          {step === 5 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Set your greeting</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>This is the first thing callers will hear. Customize it or use our suggestion.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>AI Greeting Message</label>
                <textarea
                  value={form.greeting || getDefaultGreeting()}
                  onChange={e => updateForm("greeting", e.target.value)}
                  rows={3}
                  className={inputStyle}
                  style={{ ...inputBg, resize: "vertical", minHeight: 80 }}
                />
                <p className="text-xs mt-1" style={{ color: "#475569" }}>This is what your AI will say when it picks up the phone.</p>
              </div>
              <button onClick={() => updateForm("greeting", getDefaultGreeting())} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.05)" }}>
                Reset to suggested greeting
              </button>

              {/* Preview card */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <img src="/icon.svg" alt="Conduit AI" width={32} height={32} style={{ borderRadius: 16 }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>Your AI Agent Preview</p>
                    <p style={{ fontSize: 10, color: "#64748b" }}>
                      {VOICES.find(v => v.id === form.voice)?.name} voice · {LANGUAGES.find(l => l.id === form.language)?.name} · {PERSONALITIES.find(p => p.id === form.personality)?.name}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "rgba(15,23,42,0.6)" }}>
                  <p className="text-sm italic" style={{ color: "#94a3b8" }}>"{form.greeting || getDefaultGreeting()}"</p>
                </div>
              </div>
            </div>
          </div>)}

          {/* ─── STEP 6: Review & Start Trial ─── */}
          {step === 6 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Review & start your free trial</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Everything looks good? Your AI agent will be configured automatically.</p>

            {/* Business Summary */}
            <div className="rounded-xl p-5 mb-4" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(100,116,139,0.15)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>Your Setup</h3>
              <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex justify-between"><span>Business</span><span style={{ color: "#e2e8f0" }}>{form.business_name || "—"}</span></div>
                <div className="flex justify-between"><span>Industry</span><span style={{ color: "#e2e8f0" }}>{selectedIndustry?.label || "—"}</span></div>
                <div className="flex justify-between"><span>Plan</span><span style={{ color: "#06b6d4" }}>{selectedPlan.name} — ${selectedPlan.monthly}/mo</span></div>
                <div className="flex justify-between"><span>Phone</span><span style={{ color: "#e2e8f0" }}>{form.phone || "—"}</span></div>
              </div>
            </div>

            {/* Agent Summary */}
            <div className="rounded-xl p-5 mb-4" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(100,116,139,0.15)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>Your AI Agent</h3>
              <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex justify-between"><span>Voice</span><span style={{ color: "#e2e8f0" }}>{VOICES.find(v => v.id === form.voice)?.name}</span></div>
                <div className="flex justify-between"><span>Language</span><span style={{ color: "#e2e8f0" }}>{LANGUAGES.find(l => l.id === form.language)?.flag} {LANGUAGES.find(l => l.id === form.language)?.name}</span></div>
                <div className="flex justify-between"><span>Personality</span><span style={{ color: "#e2e8f0" }}>{PERSONALITIES.find(p => p.id === form.personality)?.name}</span></div>
                <div className="flex justify-between"><span>Hours</span><span style={{ color: "#e2e8f0" }}>{HOURS_PRESETS.find(h => h.id === form.business_hours)?.name?.split("—")[0]?.trim() || "Custom"}</span></div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl p-5 mb-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div className="flex justify-between text-sm"><span style={{ color: "#94a3b8" }}>Today</span><span style={{ color: "#10b981", fontSize: "1.1rem", fontWeight: 700 }}>$0 — Free Trial</span></div>
              <div className="flex justify-between text-sm mt-1"><span style={{ color: "#94a3b8" }}>After 14 days</span><span style={{ color: "#e2e8f0" }}>${selectedPlan.monthly}/mo</span></div>
              <div className="flex justify-between text-sm mt-1"><span style={{ color: "#94a3b8" }}>Leads included</span><span style={{ color: "#e2e8f0" }}>{selectedPlan.leads}/mo</span></div>
            </div>

            <button onClick={handleStartFreeTrial} disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
              {loading ? (provisionStatus || "Setting up your account...") : "Start My Free 14-Day Trial"}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "#475569" }}>No payment today · AI agent auto-configured · Cancel anytime</p>
          </div>)}

          {/* ─── STEP 7: Success ─── */}
          {step === 7 && (<div className="text-center py-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))", border: "2px solid rgba(6,182,212,0.3)" }}><CheckIcon size={36} /></div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Your AI agent is being set up!</h2>
            <p className="text-sm mb-2" style={{ color: "#10b981", fontWeight: 600 }}>14-day free trial started</p>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#64748b" }}>Here's what happens next:</p>
            <div className="text-left space-y-3 mb-8">
              {[
                { time: "Now", text: "Your dashboard is live — explore it while we finalize your agent", icon: "📊" },
                { time: "Within minutes", text: `Your ${VOICES.find(v => v.id === form.voice)?.name} voice agent is being configured in ${LANGUAGES.find(l => l.id === form.language)?.name}`, icon: "🤖" },
                { time: "Within 1 hour", text: "You'll receive your dedicated phone number via email", icon: "📞" },
                { time: "Within 1 hour", text: "Step-by-step call forwarding instructions for your carrier", icon: "📋" },
                { time: "Today", text: "Your system goes live — every missed call becomes a lead", icon: "🚀" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                  <span className="text-lg">{item.icon}</span>
                  <div><span className="text-xs font-semibold" style={{ color: "#06b6d4" }}>{item.time}</span><p className="text-sm" style={{ color: "#e2e8f0" }}>{item.text}</p></div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/dashboard")} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>Go to My Dashboard</button>
          </div>)}

          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (<button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>Back</button>) : <div />}
              <button
                onClick={async () => { if (step === 3) { await handleSaveClient() } setStep(s => s + 1) }}
                disabled={step === 2 && !form.plan}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
              >Continue</button>
            </div>
          )}
          {step === 6 && (<div className="flex justify-start mt-4"><button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>Back</button></div>)}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>Questions? Email <a href="mailto:luis@conduitai.io" style={{ color: "#06b6d4" }}>luis@conduitai.io</a> or call <a href="tel:+15614464520" style={{ color: "#06b6d4" }}>(561) 446-4520</a></p>
      </div>
    </div>
  )
}
