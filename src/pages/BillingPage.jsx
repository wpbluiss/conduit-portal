import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Icons, StatCard } from '../components/ui'

const PLAN_MAP = {
  starter: { name: "Personal", price: 19.99, leads: 25 },
  pro: { name: "Beauty & Wellness", price: 199, leads: 200 },
  enterprise: { name: "Home Services", price: 349, leads: 500 },
}

const MOCK_INVOICES = [
  { id: "INV-001", date: "Feb 1, 2026", description: "Monthly subscription", amount: null, status: "paid" },
  { id: "INV-002", date: "Jan 1, 2026", description: "Monthly subscription", amount: null, status: "paid" },
  { id: "INV-003", date: "Dec 1, 2025", description: "Monthly subscription", amount: null, status: "paid" },
]

export default function BillingPage() {
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
      if (data && data[0]) setClient(data[0])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const planKey = client?.plan || "starter"
  const plan = PLAN_MAP[planKey] || PLAN_MAP.starter
  const displayPrice = client?.monthly_rate ? parseFloat(client.monthly_rate) : plan.price
  const isTrialing = client?.status === "trialing"
  const isActive = client?.status === "active" || isTrialing

  // Trial estimation: created_at + 14 days
  let trialDaysLeft = 0
  let trialProgress = 100
  if (isTrialing && client?.created_at) {
    const created = new Date(client.created_at)
    const trialEnd = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000)
    const now = new Date()
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)))
    trialProgress = Math.min(100, Math.max(0, ((14 - trialDaysLeft) / 14) * 100))
  }

  const invoices = MOCK_INVOICES.map(inv => ({ ...inv, amount: inv.amount || displayPrice }))

  const statusBadge = (status) => {
    const config = {
      paid: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Paid" },
      pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pending" },
      failed: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Failed" },
    }
    const c = config[status] || config.paid
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: c.bg, color: c.color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
        {c.label}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>Billing</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Manage your subscription and payment details</p>
      </div>

      {/* Sample Data Banner */}
      <div className="rounded-lg p-4 mb-6 flex items-start gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <span className="text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>Sample Data</p>
          <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Payment method and billing history shown below are sample data. Full billing integration coming soon.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Current Plan</h3>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: isTrialing ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: isTrialing ? "#f59e0b" : "#10b981" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: isTrialing ? "#f59e0b" : "#10b981" }} />
                {isTrialing ? "Trial" : "Active"}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-outfit" style={{ color: "#e2e8f0" }}>{plan.name}</span>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold font-outfit" style={{ color: "#06b6d4" }}>${displayPrice.toFixed(2)}</span>
            <span className="text-sm" style={{ color: "#64748b" }}>/month</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
            <Icons.check size={14} style={{ color: "#10b981" }} />
            Up to {plan.leads} leads included per month
          </div>
        </div>

        {/* Trial Status (conditional) */}
        {isTrialing && (
          <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Trial Status</h3>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: "#94a3b8" }}>Day {Math.round(14 - trialDaysLeft)} of 14</span>
                <span style={{ color: "#f59e0b" }}>{trialDaysLeft} days remaining</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(100,116,139,0.2)" }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${trialProgress}%`, background: "linear-gradient(90deg, #f59e0b, #06b6d4)" }} />
              </div>
            </div>
            <div className="p-3 rounded-lg mt-3" style={{ background: "rgba(245,158,11,0.06)" }}>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                When your trial ends, your subscription will automatically begin at <strong style={{ color: "#e2e8f0" }}>${displayPrice.toFixed(2)}/month</strong>. You can cancel anytime before the trial ends.
              </p>
            </div>
          </div>
        )}

        {/* Payment Method (mock) */}
        <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Payment Method</h3>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(30,41,59,0.3)", border: "1px solid rgba(100,116,139,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1f71, #2d5aba)" }}>
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>Visa ending in 4242</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Expires 12/2027</p>
              </div>
            </div>
            <button disabled className="px-4 py-2 rounded-lg text-xs font-medium transition-all opacity-50 cursor-not-allowed" style={{ background: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.2)" }}>
              Update — Coming Soon
            </button>
          </div>
        </div>

        {/* Billing History (mock) */}
        <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>Billing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(100,116,139,0.15)" }}>
                  <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Date</th>
                  <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Description</th>
                  <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Amount</th>
                  <th className="text-left text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}>Status</th>
                  <th className="text-right text-xs font-medium py-3 px-2" style={{ color: "#64748b" }}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}>
                    <td className="py-3 px-2 text-sm" style={{ color: "#e2e8f0" }}>{inv.date}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: "#94a3b8" }}>{inv.description}</td>
                    <td className="py-3 px-2 text-sm font-medium" style={{ color: "#e2e8f0" }}>${inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-2">{statusBadge(inv.status)}</td>
                    <td className="py-3 px-2 text-right">
                      <button disabled className="text-xs opacity-40 cursor-not-allowed" style={{ color: "#06b6d4" }}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Section */}
        <div className="rounded-xl p-6" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(100,116,139,0.12)" }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "#e2e8f0" }}>Cancel Subscription</h3>
          <p className="text-xs mb-4" style={{ color: "#64748b" }}>
            Need to cancel? Contact us at <a href="mailto:support@conduitai.io" className="underline" style={{ color: "#06b6d4" }}>support@conduitai.io</a> or use the button below.
          </p>
          <button disabled className="px-5 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            Cancel Plan — Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}
