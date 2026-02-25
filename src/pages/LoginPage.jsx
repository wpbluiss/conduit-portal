import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate('/onboarding');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Ambient background */}
      <div style={styles.ambient}>
        <div style={{...styles.orb, ...styles.orb1}}></div>
        <div style={{...styles.orb, ...styles.orb2}}></div>
        <div style={{...styles.orb, ...styles.orb3}}></div>
        <div style={styles.dots}></div>
      </div>

      {/* Grid floor */}
      <div style={styles.gridFloor}></div>

      {/* Floating motes */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          ...styles.mote,
          left: `${15 + i * 14}%`,
          animationDelay: `${i * 2}s`,
          bottom: `${5 + (i % 3) * 8}%`
        }}></div>
      ))}

      {/* Content */}
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={styles.logoText}>Conduit<span style={{color:'#00e5a0'}}>AI</span></span>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h1 style={styles.title}>
            {isSignUp ? 'Start Your Free Trial' : 'Welcome Back'}
          </h1>
          <p style={styles.subtitle}>
            {isSignUp 
              ? '14 days free. No credit card required.' 
              : 'Sign in to your dashboard.'}
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleAuth} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a password' : 'Your password'}
                required
                minLength={6}
                style={styles.input}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading 
                ? 'Please wait...' 
                : isSignUp ? 'Start Free Trial' : 'Sign In'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={styles.toggleBtn}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Start free trial"}
          </button>
        </div>

        {/* Trust line */}
        <div style={styles.trust}>
          <span style={styles.trustDot}></span>
          14-day free trial · No setup fee · Cancel anytime
        </div>

        {/* Back to site */}
        <a href="https://conduitai.io" style={styles.backLink}>
          ← Back to conduitai.io
        </a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          background: #050508; 
          overflow-x: hidden;
        }

        input::placeholder {
          color: #55556a;
        }

        input:focus {
          outline: none;
          border-color: rgba(0,229,160,0.4) !important;
          box-shadow: 0 0 0 3px rgba(0,229,160,0.08), 0 0 20px rgba(0,229,160,0.05) !important;
        }

        button:hover {
          transform: translateY(-2px);
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(50px,-40px) scale(1.06); }
          66% { transform: translate(-40px,30px) scale(.94); }
        }

        @keyframes moteRise {
          0% { opacity:0; transform:translateY(0) scale(.5); }
          20% { opacity:.5; }
          80% { opacity:.3; }
          100% { opacity:0; transform:translateY(-40vh) scale(1.2); }
        }

        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: '#050508',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem 1.25rem',
  },
  ambient: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(140px)',
    animation: 'orbFloat 30s ease-in-out infinite',
  },
  orb1: {
    width: '50vw',
    height: '50vw',
    maxWidth: '600px',
    maxHeight: '600px',
    background: 'rgba(0,229,160,0.06)',
    top: '-15%',
    right: '-10%',
  },
  orb2: {
    width: '40vw',
    height: '40vw',
    maxWidth: '400px',
    maxHeight: '400px',
    background: 'rgba(59,130,246,0.04)',
    bottom: '-10%',
    left: '-8%',
    animationDelay: '-10s',
  },
  orb3: {
    width: '30vw',
    height: '30vw',
    maxWidth: '300px',
    maxHeight: '300px',
    background: 'rgba(255,107,53,0.03)',
    top: '40%',
    left: '50%',
    animationDelay: '-20s',
  },
  dots: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
  },
  gridFloor: {
    position: 'fixed',
    bottom: 0,
    left: '-50%',
    right: '-50%',
    height: '40vh',
    backgroundImage: 'linear-gradient(rgba(0,229,160,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.025) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    transform: 'perspective(400px) rotateX(65deg)',
    transformOrigin: 'center bottom',
    maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 80%)',
    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 80%)',
    animation: 'gridScroll 15s linear infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  mote: {
    position: 'fixed',
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#00e5a0',
    opacity: 0,
    animation: 'moteRise 12s ease-in-out infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
    animation: 'fadeIn 0.8s ease-out',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #00e5a0, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0,229,160,0.3)',
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: '1.3rem',
    color: '#f0f0f5',
    letterSpacing: '-0.02em',
  },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#f0f0f5',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    marginBottom: '0.35rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#8e8ea0',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  error: {
    background: 'rgba(255,107,53,0.08)',
    border: '1px solid rgba(255,107,53,0.15)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#ff6b35',
    fontSize: '0.82rem',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#8e8ea0',
    letterSpacing: '0.01em',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.03)',
    color: '#f0f0f5',
    fontSize: '0.92rem',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
  },
  button: {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '12px',
    border: 'none',
    background: '#00e5a0',
    color: '#050508',
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    boxShadow: '0 0 30px rgba(0,229,160,0.3), 0 4px 16px rgba(0,0,0,0.3)',
    marginTop: '0.5rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.05)',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: '#55556a',
    fontWeight: 500,
  },
  toggleBtn: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'transparent',
    color: '#8e8ea0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
  },
  trust: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    fontSize: '0.72rem',
    color: '#55556a',
    fontFamily: "'Space Mono', monospace",
  },
  trustDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#00e5a0',
    boxShadow: '0 0 8px rgba(0,229,160,0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.78rem',
    color: '#55556a',
    transition: 'color 0.3s',
    textDecoration: 'none',
  },
};

export default LoginPage;
