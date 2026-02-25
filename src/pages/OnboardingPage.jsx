import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://conduit-backend-production.up.railway.app'

const industries = [
  { id: "hvac", label: "HVAC", icon: "❄️", plan: "home_services" },
  { id: "plumbing", label: "Plumbing", icon: "🔧", plan: "home_services" },
  { id: "roofing", label: "Roofing", icon: "🏠", plan: "home_services" },
  { id: "electrical", label: "Electrical", icon: "⚡", plan: "home_services" },
  { id: "stucco", label: "Stucco/Masonry", icon: "🧱", plan: "home_services" },
  { id: "painting", label: "Painting", icon: "🎨", plan: "home_services" },
  { id: "landscaping", label: "Landscaping", icon: "🌿", plan: "home_services" },
  { id: "fire_alarm", label: "Fire Alarm", icon: "🔥", plan: "home_services" },
  { id: "salon", label: "Salon/Barbershop", icon: "💇", plan: "beauty" },
  { id: "spa", label: "Spa/Wellness", icon: "💆", plan: "beauty" },
  { id: "medspa", label: "Med Spa", icon: "💉", plan: "beauty" },
  { id: "other", label: "Other", icon: "🔨", plan: "home_services" },
]

const PLANS = {
  beauty: {
    name: "Beauty & Wellness", icon: "💇", setup: 0, monthly: 199, leads: 50, perLead: 3,
    features: ["Up to 50 leads/mo included", "$3/lead after 50", "Custom booking scripts", "24/7 call capture", "Email lead notifications", "Analytics dashboard"],
  },
  home_services: {
    name: "Home Services", icon: "🔧", setup: 0, monthly: 349, leads: 75, perLead: 5, popular: true,
    features: ["Up to 75 leads/mo included", "$5/lead after 75", "Emergency call prioritization", "Job estimate capture", "24/7 call capture", "Revenue recovery tracking", "Analytics dashboard", "Priority support"],
  },
}

const CheckIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const PhoneIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSuccess = window.location.pathname.includes('/success')
  const [step, setStep] = useState(isSuccess ? 5 : 1)
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState(null)
  const [form, setForm] = useState({
    business_name: "", industry: "", phone: "", location: "",
    notification_email: user?.email || "", services_offered: "",
    avg_job_value: "", timezone: "America/New_York",
    contact_name: "", website: "",
  })

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const selectedIndustry = industries.find(i => i.id === form.industry)
  const detectedPlan = selectedIndustry?.plan || "home_services"
  const plan = PLANS[detectedPlan]

  const inputStyle = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
  const inputBg = { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.3)", color: "#e2e8f0" }

  const handleSaveClient = async () => {
    try {
      const { data, error } = await supabase.from("clients").insert({
        business_name: form.business_name, contact_name: form.contact_name,
        industry: form.industry, phone: form.phone, email: user?.email,
        notification_email: form.notification_email,
        avg_job_value: parseFloat(form.avg_job_value) || 0,
        website: form.website, timezone: form.timezone, user_id: user?.id,
        status: "onboarding", plan: detectedPlan === "beauty" ? "starter" : "pro",
        monthly_rate: plan.monthly,
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
    try {
      let cId = clientId
      if (!cId) cId = await handleSaveClient()
      if (!cId) { alert("Error saving your info. Please try again."); setLoading(false); return }
      try {
        await fetch(`${BACKEND_URL}/api/v1/stripe/notify-trial`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: detectedPlan, email: user?.email,
            business_name: form.business_name, client_id: cId,
            phone: form.phone, industry: form.industry,
            contact_name: form.contact_name,
          }),
        })
      } catch (e) { console.log("Notification sent or skipped") }
      setStep(5)
    } catch (e) {
      console.error("Trial signup error:", e)
      alert("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const totalSteps = 5

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 40%, #0a1628 100%)", fontFamily: "'Outfit', sans-serif" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all" style={{
                background: step >= s ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "rgba(30,41,59,0.8)",
                color: step >= s ? "white" : "#64748b",
                border: step >= s ? "none" : "1px solid rgba(100,116,139,0.3)",
              }}>{step > s ? <CheckIcon size={14} /> : s}</div>
              {s < totalSteps && <div className="w-8 h-0.5 rounded" style={{ background: step > s ? "#06b6d4" : "rgba(100,116,139,0.2)" }} />}
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-8" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(6,182,212,0.15)", backdropFilter: "blur(20px)" }}>
          {step === 1 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Welcome to Conduit AI</h2>
            <p className="text-sm mb-8" style={{ color: "#64748b" }}>Let's get your lead recovery system set up. First, tell us about your business.</p>
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
                <div className="grid grid-cols-4 gap-2">
                  {industries.map(ind => (
                    <button key={ind.id} onClick={() => updateForm("industry", ind.id)} className="p-3 rounded-lg text-center transition-all" style={{
                      background: form.industry === ind.id ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.5)",
                      border: `1px solid ${form.industry === ind.id ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.2)"}`,
                    }}>
                      <div className="text-lg mb-0.5">{ind.icon}</div>
                      <div className="text-xs font-medium" style={{ color: form.industry === ind.id ? "#06b6d4" : "#94a3b8" }}>{ind.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>)}
          {step === 2 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Phone & notification setup</h2>
            <p className="text-sm mb-8" style={{ color: "#64748b" }}>How should we capture and deliver your leads?</p>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Your Business Phone Number</label><input value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="(561) 555-0000" className={inputStyle} style={inputBg} /><p className="text-xs mt-1" style={{ color: "#475569" }}>We'll set up call forwarding from this number to your dedicated agent</p></div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Lead Notification Email</label><input value={form.notification_email} onChange={e => updateForm("notification_email", e.target.value)} placeholder="leads@yourbusiness.com" className={inputStyle} style={inputBg} /><p className="text-xs mt-1" style={{ color: "#475569" }}>Where we send instant lead alerts when a call is captured</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Average Job Value ($)</label><input value={form.avg_job_value} onChange={e => updateForm("avg_job_value", e.target.value)} placeholder="e.g. 2500" type="number" className={inputStyle} style={inputBg} /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Services You Offer</label><input value={form.services_offered} onChange={e => updateForm("services_offered", e.target.value)} placeholder="e.g. Repairs, Installs" className={inputStyle} style={inputBg} /></div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                <div className="flex items-start gap-3">
                  <PhoneIcon size={18} className="mt-0.5" style={{ color: "#22d3ee" }} />
                  <div><p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>How call forwarding works</p><p className="text-xs mt-1" style={{ color: "#94a3b8" }}>We'll assign you a dedicated phone number. You set up call forwarding on your business line so missed calls go to your agent. We'll send you step-by-step instructions for your carrier within 24-48 hours.</p></div>
                </div>
              </div>
            </div>
          </div>)}
          {step === 3 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Your plan</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Based on your industry, here's the best plan. All plans include a <span style={{ color: "#10b981", fontWeight: 700 }}>free 14-day trial</span> — no payment required to start.</p>
            <div className="space-y-4">
              {Object.entries(PLANS).map(([key, p]) => {
                const isSelected = detectedPlan === key
                return (
                  <div key={key} className="rounded-xl p-5 transition-all cursor-pointer" onClick={() => { const ind = industries.find(i => i.plan === key); if (ind && !isSelected) updateForm("industry", ind.id) }} style={{ background: isSelected ? "rgba(6,182,212,0.1)" : "rgba(30,41,59,0.3)", border: `2px solid ${isSelected ? "rgba(6,182,212,0.5)" : "rgba(100,116,139,0.15)"}` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{p.icon}</span>
                          <h3 className="text-lg font-bold" style={{ color: "#e2e8f0" }}>{p.name}</h3>
                          {p.popular && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.2)", color: "#06b6d4" }}>Popular</span>}
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold" style={{ color: "#06b6d4" }}>${p.monthly}</span>
                          <span className="text-sm" style={{ color: "#64748b" }}>/mo after trial</span>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "#10b981", fontWeight: 600 }}>First 14 days free - No setup fee</p>
                        <div className="grid grid-cols-2 gap-1">
                          {p.features.map((f, i) => (<p key={i} className="text-xs flex items-center gap-1.5" style={{ color: "#94a3b8" }}><span style={{ color: "#06b6d4" }}>✓</span> {f}</p>))}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: isSelected ? "#06b6d4" : "transparent", border: `2px solid ${isSelected ? "#06b6d4" : "rgba(100,116,139,0.3)"}` }}>{isSelected && <CheckIcon size={14} />}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <p className="text-xs" style={{ color: "#10b981" }}>Zero-risk guarantee — Try it free for 14 days. No credit card required. Cancel anytime, no questions asked.</p>
            </div>
          </div>)}
          {step === 4 && (<div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Review & start your free trial</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Confirm your details and we'll get you set up right away. No payment needed today.</p>
            <div className="rounded-xl p-5 mb-4" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(100,116,139,0.15)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>Your Setup</h3>
              <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
                <div className="flex justify-between"><span>Business</span><span style={{ color: "#e2e8f0" }}>{form.business_name || "—"}</span></div>
                <div className="flex justify-between"><span>Industry</span><span style={{ color: "#e2e8f0" }}>{selectedIndustry?.label || "—"}</span></div>
                <div className="flex justify-between"><span>Plan</span><span style={{ color: "#06b6d4" }}>{plan?.name}</span></div>
                <div className="flex justify-between"><span>Phone</span><span style={{ color: "#e2e8f0" }}>{form.phone || "—"}</span></div>
                <div className="flex justify-between"><span>Notifications</span><span style={{ color: "#e2e8f0" }}>{form.notification_email || "—"}</span></div>
                <div style={{ borderTop: "1px solid rgba(100,116,139,0.15)", margin: "12px 0" }} />
                <div className="flex justify-between font-semibold"><span>Today</span><span style={{ color: "#10b981", fontSize: "1.1rem" }}>$0 — Free Trial</span></div>
                <div className="flex justify-between"><span>After 14 days</span><span style={{ color: "#e2e8f0" }}>${plan?.monthly}/mo</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg mb-4 text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <p className="text-xs" style={{ color: "#10b981" }}>No credit card required. You'll only be asked to add payment after your 14-day trial if you want to continue.</p>
            </div>
            <button onClick={handleStartFreeTrial} disabled={loading} className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
              {loading ? "Setting up your account..." : "Start My Free 14-Day Trial"}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "#475569" }}>No payment today - Live in 24-48 hours - Cancel anytime</p>
          </div>)}
          {step === 5 && (<div className="text-center py-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))", border: "2px solid rgba(6,182,212,0.3)" }}><CheckIcon size={36} /></div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>You're all set!</h2>
            <p className="text-sm mb-2" style={{ color: "#10b981", fontWeight: 600 }}>Your 14-day free trial has started</p>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#64748b" }}>Your lead recovery agent is being configured. Here's what happens next:</p>
            <div className="text-left space-y-3 mb-8">
              {[
                { time: "Now", text: "Your dashboard is live — explore it while we set up your agent", icon: "📊" },
                { time: "Within 24 hrs", text: "We'll configure your custom voice agent for your industry", icon: "🎙️" },
                { time: "Within 24 hrs", text: "You'll receive your dedicated phone number via email", icon: "📞" },
                { time: "Within 24 hrs", text: "We'll send step-by-step call forwarding instructions", icon: "📋" },
                { time: "Within 48 hrs", text: "Your system goes live — every missed call becomes a lead", icon: "🚀" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.3)" }}>
                  <span className="text-lg">{item.icon}</span>
                  <div><span className="text-xs font-semibold" style={{ color: "#06b6d4" }}>{item.time}</span><p className="text-sm" style={{ color: "#e2e8f0" }}>{item.text}</p></div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/dashboard")} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>Go to My Dashboard</button>
          </div>)}
          {step < 5 && step !== 4 && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (<button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>Back</button>) : <div />}
              <button onClick={async () => { if (step === 2) { await handleSaveClient() } setStep(s => s + 1) }} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>Continue</button>
            </div>
          )}
          {step === 4 && (<div className="flex justify-start mt-4"><button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}>Back</button></div>)}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>Questions? Call us at <a href="tel:+15614464520" style={{ color: "#06b6d4" }}>(561) 446-4520</a></p>
      </div>
    </div>
  )
}
