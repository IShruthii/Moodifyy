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
  const { changeTheme } = useTheme()
  const [form, setForm] = useState({
    displayName: '',
    avatarId: 'avatar_1',
    theme: 'soft_purple',
    notificationEnabled: true,
    dailyReminderTime: '09:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

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
    </Layout>
  )
}
