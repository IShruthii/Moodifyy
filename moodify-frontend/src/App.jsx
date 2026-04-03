import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { MoodProvider } from './context/MoodContext'
import InstallPrompt from './components/common/InstallPrompt'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MoodPage from './pages/MoodPage'
import RecommendationsPage from './pages/RecommendationsPage'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import GamesPage from './pages/GamesPage'
import AlertsPage from './pages/AlertsPage'

// ── Splash screen shown while auth state loads ──────────────────────────────
function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-inner">
        <div className="splash-logo animate-float">🎭</div>
        <h1 className="splash-title">Moodify</h1>
        <p className="splash-sub">Your emotional companion</p>
        <div className="splash-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

// ── Error boundary for crash recovery ───────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-inner">
            <span className="error-boundary-icon">😵</span>
            <h2>Something went wrong</h2>
            <p>Don't worry, your data is safe. Let's get you back on track.</p>
            <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Route guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <SplashScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <SplashScreen />
  return user ? <Navigate to="/dashboard" replace /> : children
}

// ── Page transition wrapper ──────────────────────────────────────────────────
function PageTransition({ children }) {
  const location = useLocation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.18s ease' }}>
      {children}
    </div>
  )
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/games/:gameId" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/report" element={<Navigate to="/analytics" replace />} />
        {/* Friendly 404 */}
        <Route path="*" element={
          <div className="error-boundary">
            <div className="error-boundary-inner">
              <span className="error-boundary-icon">🔍</span>
              <h2>Page not found</h2>
              <p>That page doesn't exist, but your feelings do.</p>
              <a href="/dashboard" className="btn btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </PageTransition>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <MoodProvider>
              <NotificationProvider>
                <AppRoutes />
                <InstallPrompt />
              </NotificationProvider>
            </MoodProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
