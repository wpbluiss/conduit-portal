import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CallLogPage from './pages/CallLogPage'
import SettingsPage from "./pages/SettingsPage"
import BillingPage from "./pages/BillingPage"
import AdminPage from './pages/AdminPage'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
        <div className="text-center">
          <img src="/icon.svg" alt="Conduit AI" width={48} height={48} style={{ borderRadius: 12, margin: "0 auto 16px" }} />
          <div className="inline-block w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function NewUserRedirect({ children }) {
  const { user, loading } = useAuth()
  const [checking, setChecking] = React.useState(true)
  const [hasClient, setHasClient] = React.useState(false)

  React.useEffect(() => {
    async function check() {
      if (!user) { setChecking(false); return }
      // Admins skip onboarding
      if (user.user_metadata?.role === 'admin') { setHasClient(true); setChecking(false); return }
      const { supabase } = await import('./lib/supabase')
      const { data } = await supabase.from('clients').select('id').eq('user_id', user.id).limit(1)
      setHasClient(data && data.length > 0)
      setChecking(false)
    }
    check()
  }, [user])

  if (loading || checking) return null
  if (!user) return <Navigate to="/login" replace />
  if (!hasClient) return <Navigate to="/onboarding" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/onboarding/success" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Protected app routes */}
          <Route path="/" element={<NewUserRedirect><AppLayout /></NewUserRedirect>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="calls" element={<CallLogPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="clients" element={<AdminPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
