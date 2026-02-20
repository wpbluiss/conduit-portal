import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("login")

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setLoading(true)
    setError("")

    try {
      if (mode === "login") {
        const { error: err } = await signIn(email, password)
        if (err) { setError(err.message); setLoading(false); return }
      } else {
        const { error: err } = await signUp(email, password, { role: "client" })
        if (err) { setError(err.message); setLoading(false); return }
      }
      navigate("/dashboard")
    } catch (err) {
      setError("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 40%, #0a1628 100%)" }}>
      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-2xl font-bold tracking-tight font-outfit" style={{ color: "#e2e8f0" }}>
              Conduit<span style={{ color: "#06b6d4" }}>AI</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "#64748b" }}>Lead Recovery Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(6, 182, 212, 0.15)", backdropFilter: "blur(20px)", boxShadow: "0 0 40px rgba(6, 182, 212, 0.05)" }}>
          <h2 className="text-xl font-semibold mb-1 font-outfit" style={{ color: "#e2e8f0" }}>
            {mode === "login" ? "Welcome back" : "Get started"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            {mode === "login" ? "Sign in to your dashboard" : "Create your Conduit AI account"}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.3)", color: "#e2e8f0" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500/50"
                style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(100, 116, 139, 0.3)", color: "#e2e8f0" }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
              {loading ? "Signing in..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#64748b" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }} className="font-medium" style={{ color: "#06b6d4" }}>
              {mode === "login" ? "Get started" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          Powered by Conduit AI LLC &bull; conduitai.io
        </p>
      </div>
    </div>
  )
}
