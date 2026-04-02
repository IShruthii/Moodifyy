import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Auto-focus email on mount
  useEffect(() => { emailRef.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      // Route based on profile completion
      navigate(data.profileSetup ? '/dashboard' : '/profile', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await import('../api/axiosInstance').then(m =>
        m.default.post('/auth/forgot-password', { email: forgotEmail })
      )
    } catch { /* silent — prevent email enumeration */ }
    setForgotStatus('sent')
    setForgotLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-container">
        <div className="auth-logo">
          <span className="auth-logo-icon animate-float">🎭</span>
          <h1 className="auth-logo-text">Moodify</h1>
          <p className="auth-tagline">Your intelligent emotional companion</p>
        </div>

        <div className="auth-card glass">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue your journey</p>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <div className="input-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input input-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                type="button"
                className="forgot-link"
                onClick={() => { setShowForgot(true); setForgotStatus(''); setForgotEmail('') }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading-row"><span className="auth-spinner" /> Signing in...</span>
              ) : 'Sign In ✨'}
            </button>
          </form>

          <p className="auth-switch">
            New to Moodify? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="google-modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="google-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            {forgotStatus === 'sent' ? (
              <>
                <div className="google-modal-icon">💌</div>
                <h3 className="google-modal-title">Check your inbox</h3>
                <p className="google-modal-text">
                  If <strong>{forgotEmail}</strong> is registered, we've sent a reset link.
                </p>
                <button className="btn btn-primary" onClick={() => setShowForgot(false)} style={{ width: '100%', marginTop: 12 }}>
                  Got it
                </button>
              </>
            ) : (
              <>
                <div className="google-modal-icon">🔐</div>
                <h3 className="google-modal-title">Reset your password</h3>
                <p className="google-modal-text">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleForgot} style={{ width: '100%', marginTop: 12 }}>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    style={{ marginBottom: 12 }}
                  />
                  <button className="btn btn-primary" type="submit" disabled={forgotLoading} style={{ width: '100%' }}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link 💌'}
                  </button>
                </form>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowForgot(false)} style={{ width: '100%', marginTop: 8 }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
