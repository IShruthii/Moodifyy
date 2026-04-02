import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good', color: '#10b981' }
  return { score, label: 'Strong', color: '#8b5cf6' }
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const nameRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', gender: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => { nameRef.current?.focus() }, [])

  const strength = getPasswordStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.gender) { setError('Please select your gender'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.gender)
      sessionStorage.removeItem('pwa_dismissed')
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <p className="auth-tagline">Start your emotional wellness journey</p>
        </div>

        <div className="auth-card glass">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Takes less than a minute 🌟</p>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="reg-name">Your Name</label>
              <input
                id="reg-name"
                ref={nameRef}
                type="text"
                className="input"
                placeholder="What should we call you?"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="label">I am a...</label>
              <div className="gender-picker">
                {[
                  { val: 'female', label: 'Girl',  emoji: '👩' },
                  { val: 'male',   label: 'Boy',   emoji: '👨' },
                  { val: 'other',  label: 'Other', emoji: '🌈' },
                ].map(g => (
                  <button
                    key={g.val}
                    type="button"
                    className={`gender-btn ${form.gender === g.val ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, gender: g.val })}
                  >
                    <span style={{ fontSize: 24 }}>{g.emoji}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
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
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="input-password-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input input-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
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
              {/* Password strength meter */}
              {form.password.length > 0 && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-password-wrap">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`input input-password ${form.confirm && form.password !== form.confirm ? 'input-error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <span className="input-hint-error">Passwords don't match</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading-row"><span className="auth-spinner" /> Creating account...</span>
              ) : 'Get Started 🌟'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
