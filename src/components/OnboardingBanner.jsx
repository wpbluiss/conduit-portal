cat > ~/Projects/conduit-portal/src/components/OnboardingBanner.jsx << 'BANNER_EOF'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const MissingCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function OnboardingBanner() {
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    async function fetchClient() {
      if (!user) return
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      if (data?.[0]) {
        setClient(data[0])
        setForm({
          business_name: data[0].business_name || '',
          contact_name: data[0].contact_name || '',
          phone: data[0].phone || '',
          services_offered: data[0].services_offered || '',
          business_hours: data[0].business_hours || '',
          forwarding_number: data[0].forwarding_number || '',
          notification_email: data[0].notification_email || data[0].email || '',
          notification_phone: data[0].notification_phone || '',
          location: data[0].location || '',
        })
      }
      setLoading(false)
    }
    fetchClient()
  }, [user])

  if (loading || !client) return null

  const requiredFields = [
    { key: 'business_name', label: 'Business name', value: client.business_name },
    { key: 'contact_name', label: 'Your name', value: client.contact_name },
    { key: 'phone', label: 'Business phone', value: client.phone },
    { key: 'services_offered', label: 'Services you offer', value: client.services_offered },
    { key: 'business_hours', label: 'Business hours', value: client.business_hours },
  ]

  const optionalFields = [
    { key: 'forwarding_number', label: 'Call forwarding number', value: client.forwarding_number },
    { key: 'notification_phone', label: 'SMS notification number', value: client.notification_phone },
    { key: 'location', label: 'Location', value: client.location },
  ]

  const isMissing = (val) => !val || val.trim() === '' || val.trim().toLowerCase() === client.industry
  const missingRequired = requiredFields.filter(f => isMissing(f.value))
  const allFields = [...requiredFields, ...optionalFields]
  const completedCount = allFields.filter(f => !isMissing(f.value)).length
  const totalCount = allFields.length
  const progress = Math.round((completedCount / totalCount) * 100)

  if (missingRequired.length === 0 && client.onboarding_complete) return null

  const handleSave = async () => {
    setSaving(true)
    const updates = { ...form }
    const allRequiredFilled = requiredFields.every(f => {
      const val = updates[f.key]
      return val && val.trim() !== '' && val.trim().toLowerCase() !== client.industry
    })
    if (allRequiredFilled) updates.onboarding_complete = true
    const { error } = await supabase.from('clients').update(updates).eq('id', client.id)
    if (!error) {
      setClient(prev => ({ ...prev, ...updates }))
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(100,116,139,0.3)', color: '#e2e8f0',
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.05))',
      border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px',
      padding: '20px 24px', marginBottom: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <AlertIcon />
            </div>
            <div>
              <h3 style={{ color: '#f59e0b', fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Complete your setup to go live
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                We need a few more details to build your AI voice agent.
                {missingRequired.length > 0 && (
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    {' '}{missingRequired.length} required field{missingRequired.length > 1 ? 's' : ''} missing.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{progress}% complete</div>
              <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'rgba(30,41,59,0.6)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', borderRadius: '3px',
                  background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #f97316)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <button onClick={() => { setExpanded(!expanded); if (!expanded) setEditing(true) }}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: editing && expanded ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: editing && expanded ? '#94a3b8' : 'white',
                border: editing && expanded ? '1px solid rgba(100,116,139,0.3)' : 'none', cursor: 'pointer' }}>
              {expanded ? 'Cancel' : 'Complete Now'}
            </button>
          </div>
        </div>

        {saved && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle />
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Saved! We will configure your agent with these details.</span>
          </div>
        )}

        {expanded && editing && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Your Name <span style={{ color: '#f59e0b' }}>*</span>
                </label>
                <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                  placeholder="John Smith" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Business Name <span style={{ color: '#f59e0b' }}>*</span>
                </label>
                <input value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))}
                  placeholder="Premier Med Spa" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Business Phone <span style={{ color: '#f59e0b' }}>*</span>
                </label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="(561) 555-0000" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Location</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Miami, FL" style={inputStyle} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Services You Offer <span style={{ color: '#f59e0b' }}>*</span>
                </label>
                <input value={form.services_offered} onChange={e => setForm(p => ({ ...p, services_offered: e.target.value }))}
                  placeholder="e.g. Botox, Fillers, Facials, Laser Hair Removal" style={inputStyle} />
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>List all services so your AI agent can ask callers the right questions</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Business Hours <span style={{ color: '#f59e0b' }}>*</span>
                </label>
                <input value={form.business_hours} onChange={e => setForm(p => ({ ...p, business_hours: e.target.value }))}
                  placeholder="e.g. Mon-Fri 9am-6pm, Sat 10am-3pm, Sun Closed" style={inputStyle} />
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>Your agent will tell after-hours callers when you are next available</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Notification Email</label>
                <input value={form.notification_email} onChange={e => setForm(p => ({ ...p, notification_email: e.target.value }))}
                  placeholder="leads@yourbusiness.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>SMS Notification Number</label>
                <input value={form.notification_phone} onChange={e => setForm(p => ({ ...p, notification_phone: e.target.value }))}
                  placeholder="(561) 555-0000" style={inputStyle} />
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>Get instant text alerts when your agent captures a lead</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setEditing(false); setExpanded(false) }}
                style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: 'transparent', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white',
                  border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save & Continue Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
BANNER_EOF
echo "✅ OnboardingBanner.jsx created!"

