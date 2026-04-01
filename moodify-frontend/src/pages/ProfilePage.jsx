import React, { useEffect, useState } from 'react'
import Layout from '../components/common/Layout'
import AvatarPicker, { getAvatarEmoji } from '../components/profile/AvatarPicker'
import ThemeSelector from '../components/profile/ThemeSelector'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getPreference, savePreference } from '../api/preferenceApi'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { changeTheme, darkMode, toggleDarkMode } = useTheme()
  const [form, setForm] = useState({
    displayName: '',
    avatarId: 'avatar_1',
    theme: 'soft_purple',
    notificationEnabled: true,
    dailyReminderTime: '09:00',
    musicLanguage: 'english',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showPushPrompt, setShowPushPrompt] = useState(false)

  useEffect(() => {
    getPreference()
      .then(res => {
        const pref = res.data.data
        setForm({
          displayName: pref.displayName || user?.name || '',
          avatarId: pref.avatarId || 'avatar_1',
          theme: pref.theme || 'soft_purple',
          notificationEnabled: pref.notificationEnabled ?? true,
          dailyReminderTime: pref.dailyReminderTime || '09:00',
          musicLanguage: pref.musicLanguage || 'english',
        })
        changeTheme(pref.theme || 'soft_purple')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await savePreference(form)
      changeTheme(form.theme)
      updateUser({ name: form.displayName, profileSetup: true, avatarId: form.avatarId })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Ask to push to GitHub after saving
      setTimeout(() => setShowPushPrompt(true), 1000)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading...</div></Layout>

  return (
    <Layout>
      <div className="profile-page animate-fade-in">
        <div className="profile-header">
          <div className="profile-avatar-display">
            <span className="profile-avatar-emoji">{getAvatarEmoji(form.avatarId)}</span>
          </div>
          <div>
            <h1 className="profile-name">{form.displayName || user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-sections">
          {/* Display Name */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">Display Name</h2>
            <input
              type="text"
              className="input"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              placeholder="What should we call you?"
            />
          </div>

          {/* Avatar */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">Choose Avatar</h2>
            <AvatarPicker
              selected={form.avatarId}
              onSelect={id => setForm({ ...form, avatarId: id })}
            />
          </div>

          {/* Theme */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">App Theme</h2>
            <ThemeSelector
              selected={form.theme}
              onSelect={theme => {
                setForm({ ...form, theme })
                changeTheme(theme)
              }}
            />
          </div>

          {/* Display Mode */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">Display Mode</h2>
            <div className="mode-toggle-row">
              <button
                className={`mode-btn ${darkMode ? '' : 'mode-btn--active'}`}
                onClick={() => toggleDarkMode(false)}
              >
                <span style={{fontSize:22}}>☀️</span>
                <span>Light</span>
              </button>
              <button
                className={`mode-btn ${darkMode ? 'mode-btn--active' : ''}`}
                onClick={() => toggleDarkMode(true)}
              >
                <span style={{fontSize:22}}>🌙</span>
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">Notifications</h2>
            <div className="notif-toggle-row">
              <div>
                <p className="notif-toggle-label">Daily mood reminders</p>
                <p className="notif-toggle-sub">Get a gentle reminder to check in each day</p>
              </div>
              <button
                className={`toggle-btn ${form.notificationEnabled ? 'on' : 'off'}`}
                onClick={() => setForm({ ...form, notificationEnabled: !form.notificationEnabled })}
              >
                <div className="toggle-thumb" />
              </button>
            </div>
            {form.notificationEnabled && (
              <div className="reminder-time">
                <label className="label">Reminder Time</label>
                <input
                  type="time"
                  className="input"
                  value={form.dailyReminderTime}
                  onChange={e => setForm({ ...form, dailyReminderTime: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Music Language */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">🎵 Music Language</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Pick the language of songs you love most
            </p>
            <div className="music-lang-grid">
              {[
                { key: 'telugu',  label: 'Telugu',  emoji: '🎶' },
                { key: 'hindi',   label: 'Hindi',   emoji: '🎵' },
                { key: 'english', label: 'English', emoji: '🎸' },
                { key: 'bts',     label: 'BTS / K-Pop', emoji: '💜' },
                { key: 'private', label: 'Private Album', emoji: '🔒' },
              ].map(lang => (
                <button
                  key={lang.key}
                  className={`music-lang-btn ${form.musicLanguage === lang.key ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, musicLanguage: lang.key })}
                >
                  <span>{lang.emoji}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            className="btn btn-primary btn-lg profile-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
          {saveError && (
            <p style={{ color: '#f87171', textAlign: 'center', fontSize: 14, marginTop: 8 }}>
              ⚠️ {saveError}
            </p>
          )}
        </div>
      </div>
      <ChatbotFAB />

      {/* Push to GitHub prompt */}
      {showPushPrompt && (
        <div className="push-backdrop" onClick={() => setShowPushPrompt(false)}>
          <div className="push-modal" onClick={e => e.stopPropagation()}
            style={{ '--p-gradient': theme.gradient, '--p-accent': theme.accent }}>
            <div className="push-icon">🚀</div>
            <div className="push-title">Push to GitHub?</div>
            <div className="push-sub">Your profile preferences are saved. Want to push the latest changes to GitHub too?</div>
            <div className="push-actions">
              <a
                className="push-btn-yes"
                href="https://github.com/IShruthii/Moodifyy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPushPrompt(false)}
              >
                Open GitHub
              </a>
              <button className="push-btn-no" onClick={() => setShowPushPrompt(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
