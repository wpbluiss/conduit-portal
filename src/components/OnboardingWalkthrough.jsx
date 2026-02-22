import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 'welcome', type: 'modal', target: null },
  {
    id: 'calls',
    type: 'tooltip',
    target: 'calls',
    title: 'Your Call Activity',
    description: "Every call your AI agent handles shows up here in real time. Missed calls, answered calls, duration — it's all tracked so you never lose a lead.",
    icon: '📞',
  },
  {
    id: 'leads',
    type: 'tooltip',
    target: 'leads',
    title: 'Your Captured Leads',
    description: "When your AI agent captures a caller's info — name, number, what they need — it lands here. Every lead with full details, ready for follow-up.",
    icon: '🎯',
  },
  {
    id: 'agent-status',
    type: 'tooltip',
    target: 'agent-status',
    title: 'AI Agent Status',
    description: "Check if your AI agent is live and handling calls. Green means active, yellow means configuring. You'll always know your coverage status at a glance.",
    icon: '🤖',
  },
  {
    id: 'notifications',
    type: 'tooltip',
    target: 'notifications',
    title: 'Real-Time Notifications',
    description: "Get instant email alerts every time your AI captures a lead. Never miss a potential client — you'll know the moment someone calls.",
    icon: '🔔',
  },
  { id: 'complete', type: 'modal', target: null },
]

// Christian @ The G Room — first client detection
const FIRST_CLIENT_EMAIL = 'christiangflairbiz@gmail.com'

export default function OnboardingWalkthrough() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' })
  const [highlightRect, setHighlightRect] = useState(null)
  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(true)
  const tooltipRef = useRef(null)

  const step = STEPS[currentStep]
  const progress = (currentStep / (STEPS.length - 1)) * 100

  // Check if user needs onboarding
  useEffect(() => {
    if (!user) return

    async function checkStatus() {
      try {
        // Check if walkthrough already completed
        const { data: client } = await supabase
          .from('clients')
          .select('id, business_name, contact_name, walkthrough_completed')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (client) {
          setClientData(client)
          if (!client.walkthrough_completed) {
            setIsVisible(true)
          }
        }
      } catch (e) {
        console.error('Walkthrough check error:', e)
      }
      setLoading(false)
    }

    checkStatus()
  }, [user])

  // Determine if this is our first client
  const isFirstClient = user?.email?.toLowerCase() === FIRST_CLIENT_EMAIL.toLowerCase()
  const clientName = clientData?.contact_name || user?.user_metadata?.full_name || 'there'
  const businessName = clientData?.business_name || 'your business'

  // Position tooltip near target element
  const positionTooltip = useCallback(() => {
    if (!step || step.type !== 'tooltip' || !step.target) return

    const el = document.querySelector(`[data-tour="${step.target}"]`)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    setHighlightRect({
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    })

    // Scroll element into view if needed
    if (rect.top < 80 || rect.bottom > vh - 80) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => positionTooltip(), 400)
      return
    }

    const tooltipWidth = Math.min(360, vw - 32)
    const tooltipHeight = 240

    let placement = 'bottom'
    let top = rect.bottom + 16
    let left = rect.left + rect.width / 2 - tooltipWidth / 2

    if (rect.bottom + tooltipHeight + 20 > vh) {
      placement = 'top'
      top = rect.top - tooltipHeight - 16
    }

    // Clamp horizontal
    left = Math.max(16, Math.min(left, vw - tooltipWidth - 16))

    // Mobile: center
    if (vw < 640) {
      left = (vw - tooltipWidth) / 2
    }

    setTooltipPos({ top, left, placement })
  }, [step])

  useEffect(() => {
    if (!isVisible) return
    positionTooltip()
    window.addEventListener('resize', positionTooltip)
    window.addEventListener('scroll', positionTooltip, true)
    return () => {
      window.removeEventListener('resize', positionTooltip)
      window.removeEventListener('scroll', positionTooltip, true)
    }
  }, [positionTooltip, currentStep, isVisible])

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
    else finish()
  }

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const finish = async () => {
    setIsVisible(false)
    // Persist to Supabase
    try {
      if (clientData?.id) {
        await supabase
          .from('clients')
          .update({
            walkthrough_completed: true,
            walkthrough_completed_at: new Date().toISOString(),
          })
          .eq('id', clientData.id)
      }
    } catch (e) {
      console.error('Failed to save walkthrough status:', e)
    }
  }

  if (loading || !isVisible) return null

  return (
    <>
      <style>{walkthroughStyles}</style>

      {/* Backdrop */}
      {step.type === 'modal' && <div className="cw-backdrop" />}

      {/* Highlight for tooltips */}
      {step.type === 'tooltip' && highlightRect && (
        <>
          <div className="cw-backdrop" />
          <div
            className="cw-highlight"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
            }}
          />
        </>
      )}

      {/* WELCOME MODAL */}
      {step.id === 'welcome' && (
        <div className="cw-modal-wrap">
          <div className="cw-modal">
            <button className="cw-skip" onClick={finish}>Skip tour</button>

            <div className="cw-badge">
              <span className="cw-badge-dot" />
              Welcome to Conduit AI
            </div>

            <h1 className="cw-h1">
              Hey {clientName}! 👋<br />
              <span className="cw-gradient">Let's get you set up.</span>
            </h1>

            <p className="cw-p">
              Welcome to your <strong>{businessName}</strong> command center.
              We'll give you a quick 60-second tour of your dashboard so you
              know exactly where everything is.
            </p>

            {isFirstClient && (
              <div className="cw-first-client">
                <span style={{ fontSize: 22 }}>⭐</span>
                <span>
                  You're our very first client — that means everything to us.
                  We're going above and beyond to make sure{' '}
                  <strong style={{ color: 'rgba(255, 215, 0, 1)' }}>{businessName}</strong>{' '}
                  gets the VIP treatment.
                </span>
              </div>
            )}

            <div className="cw-actions">
              <button className="cw-btn-primary" onClick={next}>
                Let's go
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="cw-dots">
              {STEPS.map((_, i) => (
                <div key={i} className={`cw-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOOLTIP STEPS */}
      {step.type === 'tooltip' && (
        <div
          className="cw-tooltip-wrap"
          ref={tooltipRef}
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <div className="cw-tooltip">
            <button className="cw-skip" onClick={finish}>Skip</button>
            <span className="cw-tooltip-icon">{step.icon}</span>
            <h3 className="cw-tooltip-title">{step.title}</h3>
            <p className="cw-tooltip-desc">{step.description}</p>

            <div className="cw-actions" style={{ animationDelay: '0s' }}>
              {currentStep > 1 && (
                <button className="cw-btn-secondary" onClick={back}>Back</button>
              )}
              <button className="cw-btn-primary" onClick={next}>
                {currentStep < STEPS.length - 2 ? 'Next' : 'Almost done'}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="cw-progress-wrap">
              <div className="cw-progress-bar">
                <div className="cw-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="cw-progress-text">{currentStep}/{STEPS.length - 1}</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {step.id === 'complete' && (
        <div className="cw-modal-wrap">
          <div className="cw-modal">
            <div className="cw-complete-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <h1 className="cw-h1">
              You're all set,{' '}
              <span className="cw-gradient">{clientName}!</span> 🎉
            </h1>

            <p className="cw-p">
              We're now <strong>configuring your AI agent</strong> for {businessName}.
              This includes setting up your custom greeting, call routing, and lead
              capture — tailored specifically to your business.
            </p>

            <p className="cw-p" style={{ marginTop: 12 }}>
              📧 <strong>You'll receive an email</strong> the moment your AI agent
              goes live and starts handling calls. It won't be long.
            </p>

            {isFirstClient && (
              <div className="cw-first-client" style={{ marginTop: 16 }}>
                <span style={{ fontSize: 22 }}>🤝</span>
                <span>
                  As our founding client, you have a direct line to me.
                  Anything you need — text, call, or message through the portal.
                  We're in this together.
                </span>
              </div>
            )}

            <div className="cw-actions">
              <button className="cw-btn-primary" onClick={finish}>
                Go to Dashboard
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const walkthroughStyles = `
  .cw-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 9997;
    animation: cwFadeIn 0.3s ease;
  }

  .cw-highlight {
    position: fixed;
    border-radius: 14px;
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.65);
    z-index: 9998;
    pointer-events: none;
    transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cw-highlight::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 18px;
    border: 2px solid rgba(6, 182, 212, 0.6);
    animation: cwPulseRing 2s ease-in-out infinite;
  }

  .cw-modal-wrap {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .cw-modal {
    background: linear-gradient(145deg, #0f1923 0%, #0a1118 50%, #0d1a24 100%);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 24px;
    padding: 48px 40px;
    max-width: 520px;
    width: 100%;
    position: relative;
    overflow: hidden;
    animation: cwSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cw-modal::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .cw-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.25);
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #06b6d4;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 24px;
    animation: cwFadeIn 0.6s ease 0.2s both;
  }

  .cw-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #06b6d4;
    animation: cwPulseDot 1.5s ease-in-out infinite;
  }

  .cw-h1 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #e2e8f0;
    margin: 0 0 8px 0;
    line-height: 1.2;
    animation: cwFadeIn 0.6s ease 0.3s both;
  }

  .cw-gradient {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cw-p {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.65;
    margin: 16px 0 0 0;
    animation: cwFadeIn 0.6s ease 0.4s both;
  }

  .cw-p strong {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
  }

  .cw-first-client {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 20px;
    padding: 14px 18px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 165, 0, 0.05));
    border: 1px solid rgba(255, 215, 0, 0.2);
    animation: cwFadeIn 0.6s ease 0.5s both;
  }

  .cw-first-client span {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 14px;
    color: rgba(255, 215, 0, 0.9);
    font-weight: 500;
    line-height: 1.5;
  }

  .cw-tooltip-wrap {
    position: fixed;
    z-index: 9999;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cw-tooltip {
    background: linear-gradient(145deg, #0f1923, #0a1118);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 20px;
    padding: 28px 24px 20px;
    width: min(360px, calc(100vw - 32px));
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.05);
    animation: cwPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cw-tooltip-icon {
    font-size: 28px;
    display: block;
    margin-bottom: 12px;
  }

  .cw-tooltip-title {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0 0 8px 0;
  }

  .cw-tooltip-desc {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.6;
    margin: 0;
  }

  .cw-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
    animation: cwFadeIn 0.6s ease 0.5s both;
  }

  .cw-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #fff;
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cw-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
  }

  .cw-btn-secondary {
    padding: 12px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cw-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }

  .cw-skip {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 12px;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, 0.3);
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    z-index: 1;
  }

  .cw-skip:hover { color: rgba(255, 255, 255, 0.6); }

  .cw-progress-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
  }

  .cw-progress-bar {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .cw-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #06b6d4, #3b82f6);
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cw-progress-text {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    white-space: nowrap;
  }

  .cw-dots {
    display: flex;
    gap: 6px;
    margin-top: 16px;
  }

  .cw-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    transition: all 0.3s ease;
  }

  .cw-dot.active {
    background: #06b6d4;
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
  }

  .cw-dot.done { background: rgba(6, 182, 212, 0.4); }

  .cw-complete-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.1));
    border: 2px solid rgba(6, 182, 212, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    animation: cwScaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }

  @keyframes cwFadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes cwSlideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cwPopIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes cwScaleIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes cwPulseRing {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes cwPulseDot {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @media (max-width: 640px) {
    .cw-modal { padding: 36px 24px; border-radius: 20px; }
    .cw-h1 { font-size: 26px; }
    .cw-p { font-size: 15px; }
    .cw-actions { flex-direction: column; gap: 8px; }
    .cw-btn-primary, .cw-btn-secondary { width: 100%; justify-content: center; text-align: center; }
  }
`
