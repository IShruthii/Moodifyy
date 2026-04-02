import React, { useEffect, useState } from 'react'
import Layout from '../components/common/Layout'
import AvatarPicker, { getAvatarEmoji } from '../components/profile/AvatarPicker'
import ThemeSelector from '../components/profile/ThemeSelector'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getPreference, savePreference } from '../api/preferenceApi'
import './ProfilePage.css'

const PERSONALITIES = [
  { key: 'flirty',       emoji: '😏', label: 'Flirty',       desc: 'Romantic & playful' },
  { key: 'friendly',     emoji: '🤗', label: 'Friendly',     desc: 'Warm best-friend energy' },
  { key: 'sassy',        emoji: '💅', label: 'Sassy',        desc: 'Bold, witty & cheeky' },
  { key: 'calm',         emoji: '🌿', label: 'Calm',         desc: 'Gentle & grounding' },
  { key: 'motivational', emoji: '🔥', label: 'Motivational', desc: 'Hype coach vibes' },
  { key: 'therapist',    emoji: '💙', label: 'Therapist',    desc: 'Empathetic & reflective' },
  { key: 'funny',        emoji: '😂', label: 'Funny',        desc: 'Humor & good vibes' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { changeTheme, darkMode, toggleDarkMode, theme } = useTheme()
  const [form, setForm] = useState({
    displayName: '',
    avatarId: 'avatar_1',
    theme: 'soft_purple',
    notificationEnabled: true,
    dailyReminderTime: '09:00',
    musicLanguage: 'english',
    botName: 'Moo',
    botPersonality: 'flirty',
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
          musicLanguage: pref.musicLanguage || 'english',
          botName: pref.botName || 'Moo',
          botPersonality: pref.botPersonality || 'flirty',
        })
        changeTheme(pref.theme || 'soft_purple')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Persist bot settings to localStorage so ChatbotPanel can read them instantly
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moodify_bot_name', form.botName || 'Moo')
      localStorage.setItem('moodify_bot_personality', form.botPersonality || 'flirty')
    }
  }, [form.botName, form.botPersonality, loading])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await savePreference(form)
      changeTheme(form.theme)
      updateUser({ name: form.displayName, profileSetup: true, avatarId: form.avatarId })
      // Persist bot settings immediately
      localStorage.setItem('moodify_bot_name', form.botName || 'Moo')
      localStorage.setItem('moodify_bot_personality', form.botPersonality || 'flirty')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading...</div></Layout>

  const selectedPersonality = PERSONALITIES.find(p => p.key === form.botPersonality) || PERSONALITIES[0]

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

          {/* ── Companion Settings ── */}
          <div className="profile-section glass companion-section">
            <h2 className="profile-section-title">🤖 Your AI Companion</h2>
            <p className="companion-desc">
              Name your companion and choose how they talk to you.
              Changes apply instantly next time you open the chat.
            </p>

            {/* Bot Name */}
            <div className="companion-name-row">
              <label className="label">Companion Name</label>
              <div className="companion-name-input-wrap">
                <span className="companion-name-emoji">{selectedPersonality.emoji}</span>
                <input
                  type="text"
                  className="input companion-name-input"
                  value={form.botName}
                  onChange={e => setForm({ ...form, botName: e.target.value })}
                  placeholder="e.g. Moo, Luna, Kai, Aria..."
                  maxLength={20}
                />
              </div>
              <p className="companion-name-hint">
                Your companion will introduce themselves as "{form.botName || 'Moo'}"
              </p>
            </div>

            {/* Personality Picker */}
            <div>
              <label className="label" style={{ marginBottom: 10 }}>Personality Style</label>
              <div className="personality-grid">
                {PERSONALITIES.map(p => (
                  <button
                    key={p.key}
                    className={`personality-btn ${form.botPersonality === p.key ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, botPersonality: p.key })}
                  >
                    <span className="personality-emoji">{p.emoji}</span>
                    <span className="personality-label">{p.label}</span>
                    <span className="personality-desc">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="companion-preview">
              <div className="companion-preview-avatar">{selectedPersonality.emoji}</div>
              <div className="companion-preview-bubble">
                <span className="companion-preview-name">{form.botName || 'Moo'}</span>
                <span className="companion-preview-text">
                  {getPersonalityPreview(form.botPersonality, form.botName || 'Moo')}
                </span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">App Theme</h2>
            <ThemeSelector
              selected={form.theme}
              onSelect={t => { setForm({ ...form, theme: t }); changeTheme(t) }}
            />
          </div>

          {/* Display Mode */}
          <div className="profile-section glass">
            <h2 className="profile-section-title">Display Mode</h2>
            <div className="mode-toggle-row">
              <button
                className={`mode-btn ${!darkMode ? 'mode-btn--active' : ''}`}
                onClick={() => toggleDarkMode(false)}
              >
                <span style={{ fontSize: 22 }}>☀️</span>
                <span>Light</span>
              </button>
              <button
                className={`mode-btn ${darkMode ? 'mode-btn--active' : ''}`}
                onClick={() => toggleDarkMode(true)}
              >
                <span style={{ fontSize: 22 }}>🌙</span>
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
                { key: 'telugu',  label: 'Telugu',       emoji: '🎶' },
                { key: 'hindi',   label: 'Hindi',        emoji: '🎵' },
                { key: 'english', label: 'English',      emoji: '🎸' },
                { key: 'bts',     label: 'BTS / K-Pop',  emoji: '💜' },
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

          {/* Save */}
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

function getPersonalityPreview(personality, botName) {
  const previews = {
    flirty:       `Hey you 😏 I was literally just thinking about you. Tell me everything.`,
    friendly:     `Omg hi!! I'm so glad you're here 🤗 How's your day going?`,
    sassy:        `Oh honey, you came to the right place 💅 Spill.`,
    calm:         `Hey. Take a breath. I'm here, and there's no rush 🌿`,
    motivational: `LET'S GO! 🔥 You showed up today and that already counts. What are we crushing?`,
    therapist:    `I'm really glad you're here. How are you really feeling right now? 💙`,
    funny:        `Okay I'm legally required to ask — how chaotic has your day been? 😂`,
  }
  return previews[personality] || `Hi, I'm ${botName}! How can I help you today? 💜`
}
