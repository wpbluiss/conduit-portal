import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Icons } from '../components/ui'

const industries = [
  { id: "hvac", label: "HVAC", icon: "❄️" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "stucco", label: "Stucco/Masonry", icon: "🧱" },
  { id: "painting", label: "Painting", icon: "🎨" },
  { id: "landscaping", label: "Landscaping", icon: "🌿" },
  { id: "other", label: "Other", icon: "🔨" },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    business_name: "", industry: "", phone: "",
    notification_email: user?.email || "", avg_job_value: "", timezone: "America/New_York",
  })

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleFinish = async () => {
    try {
      await supabase.from("clients").insert({
        ...form,
        user_id: user?.id,
        email: user?.email,
        status: "onboarding",
        plan: "pro",
        monthly_rate: 350,
      })
    } catch (e) { console.error(e) }
    navigate("/dashboard")
  }

  const inputStyle = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
  const inputBg = { background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.3)", color: "#e2e8f0" }

  return (
    <div className="min-h-screen flex items-center justify-center font-outfit" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 40%, #0a1628 100%)" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all" style={{
                background: step >= s ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "rgba(30, 41, 59, 0.8)",
                color: step >= s ? "white" : "#64748b",
                border: step >= s ? "none" : "1px solid rgba(100, 116, 139, 0.3)",
              }}>
                {step > s ? <Icons.check size={16} /> : s}
              </div>
              {s < 3 && <div className="w-16 h-0.5 rounded" style={{ background: step > s ? "#06b6d4" : "rgba(100, 116, 139, 0.2)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(6, 182, 212, 0.15)", backdropFilter: "blur(20px)" }}>
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Tell us about your business</h2>
              <p className="text-sm mb-8" style={{ color: "#64748b" }}>We'll customize CallFlow AI for your industry.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Business Name</label>
                  <input value={form.business_name} onChange={(e) => updateForm("business_name", e.target.value)}
                    placeholder="e.g. Almighty Stucco LLC" className={inputStyle} style={inputBg} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-3" style={{ color: "#94a3b8" }}>Industry</label>
                  <div className="grid grid-cols-4 gap-2">
                    {industries.map(ind => (
                      <button key={ind.id} onClick={() => updateForm("industry", ind.id)}
                        className="p-3 rounded-lg text-center transition-all"
                        style={{
                          background: form.industry === ind.id ? "rgba(6, 182, 212, 0.15)" : "rgba(30, 41, 59, 0.5)",
                          border: `1px solid ${form.industry === ind.id ? "rgba(6, 182, 212, 0.5)" : "rgba(100, 116, 139, 0.2)"}`,
                        }}>
                        <div className="text-xl mb-1">{ind.icon}</div>
                        <div className="text-xs font-medium" style={{ color: form.industry === ind.id ? "#06b6d4" : "#94a3b8" }}>{ind.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Configure your phone line</h2>
              <p className="text-sm mb-8" style={{ color: "#64748b" }}>Set up call forwarding so we can catch every missed call.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Your Business Phone Number</label>
                  <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="(561) 555-0000" className={inputStyle} style={inputBg} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notification Email</label>
                  <input value={form.notification_email} onChange={(e) => updateForm("notification_email", e.target.value)}
                    placeholder="leads@yourbusiness.com" className={inputStyle} style={inputBg} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Average Job Value ($)</label>
                  <input value={form.avg_job_value} onChange={(e) => updateForm("avg_job_value", e.target.value)}
                    placeholder="e.g. 2500" type="number" className={inputStyle} style={inputBg} />
                </div>
                <div className="p-4 rounded-lg" style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.15)" }}>
                  <div className="flex items-start gap-3">
                    <Icons.phone size={18} className="mt-0.5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>How it works</p>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        We'll assign a Conduit AI number. Forward missed calls to it, and our AI voice agent handles the rest — capturing caller info, service needs, and sending you instant email notifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))", border: "2px solid rgba(6, 182, 212, 0.3)" }}>
                <Icons.check size={36} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>You're all set!</h2>
              <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "#64748b" }}>
                Your CallFlow AI agent is being configured. You'll receive a confirmation email with your dedicated phone number within 24 hours.
              </p>
              <div className="rounded-xl p-5 text-left mb-6" style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>Setup Summary</h3>
                <div className="space-y-2 text-xs" style={{ color: "#94a3b8" }}>
                  <div className="flex justify-between"><span>Business</span><span style={{ color: "#e2e8f0" }}>{form.business_name || "—"}</span></div>
                  <div className="flex justify-between"><span>Industry</span><span style={{ color: "#e2e8f0" }}>{form.industry || "—"}</span></div>
                  <div className="flex justify-between"><span>Phone</span><span style={{ color: "#e2e8f0" }}>{form.phone || "—"}</span></div>
                  <div className="flex justify-between"><span>Notifications</span><span style={{ color: "#e2e8f0" }}>{form.notification_email || "—"}</span></div>
                  <div className="flex justify-between"><span>Plan</span><span style={{ color: "#06b6d4" }}>Pro — $350/mo</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: "#94a3b8", border: "1px solid rgba(100, 116, 139, 0.3)" }}>Back</button>
            ) : <div />}
            <button onClick={() => step < 3 ? setStep(s => s + 1) : handleFinish()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
              {step < 3 ? "Continue" : "Go to Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
