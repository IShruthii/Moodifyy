import React, { useEffect, useState } from 'react'
import Layout from '../components/common/Layout'
import AvatarPicker, { getAvatarEmoji } from '../components/profile/AvatarPicker'
import ThemeSelector from '../components/profile/ThemeSelector'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getPreference, savePreference } from '../api/preferenceApi'
import { useAvailableVoices, pickVoice, categorizeVoice } from '../hooks/useVoice'
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
  const { voices: availableVoices, loaded: voicesLoaded, supported: ttsSupported } = useAvailableVoices()
  const [testVoiceStatus, setTestVoiceStatus] = useState('')

  const [form, setForm] = useState({
    displayName: '',
    avatarId: 'avatar_1',
    theme: 'soft_purple',
    notificationEnabled: true,
    dailyReminderTime: '09:00',
    musicLanguage: 'english',
    botName: 'Moo',
    botPersonality: 'flirty',
    voicePreference: 'auto',
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
          voicePreference: pref.voicePreference || 'auto',
        })
        changeTheme(pref.theme || 'soft_purple')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Sync bot settings to localStorage immediately on any change
  // This ensures chatbot works even if backend save fails
  useEffect(() => {
    if (!loading && form.botName) {
      localStorage.setItem('moodify_bot_name', form.botName)
    }
  }, [form.botName, loading])

  useEffect(() => {
    if (!loading && form.botPersonality) {
      localStorage.setItem('moodify_bot_personality', form.botPersonality)
    }
  }, [form.botPersonality, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moodify_voice_preference', form.voicePreference || 'auto')
    }
  }, [form.voicePreference, loading])

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
      localStorage.setItem('moodify_voice_preference', form.voicePreference || 'auto')
      // Notify service worker of personality change so scheduled notifications update
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          const target = reg.active || reg.waiting || reg.installing
          if (target) {
            target.postMessage({
              type: 'SET_PERSONALITY',
              personality: form.botPersonality || 'neutral',
            })
          }
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const [testNotifStatus, setTestNotifStatus] = useState('') // '' | 'sent' | 'denied' | 'unsupported'

  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      setTestNotifStatus('unsupported')
      return
    }
    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }
    if (permission !== 'granted') {
      setTestNotifStatus('denied')
      return
    }
    // Build personality-aware test message
    const personality = form.botPersonality
    const botName = form.botName || 'Moo'
    const PERSONALITY_TEST = {
      flirty:       { title: `${botName} 😏`, body: "Hey you… I've been thinking about you. Come tell me how you're feeling? 💜" },
      friendly:     { title: `${botName} 🤗`, body: "Hey! Just checking in — how are you doing right now? 😊" },
      sassy:        { title: `${botName} 💅`, body: "Okay so… are you going to log your mood or just ignore me? 👀" },
      calm:         { title: `${botName} 🌿`, body: "Take a gentle breath. How are you feeling right now? 🍃" },
      motivational: { title: `${botName} 🔥`, body: "LET'S GO! Time to check in and keep that streak alive! 💪" },
      therapist:    { title: `${botName} 💙`, body: "How are you really doing today? I'm here when you're ready." },
      funny:        { title: `${botName} 😂`, body: "Okay I've been waiting for you to open the app. It's been awkward." },
    }
    const notif = PERSONALITY_TEST[personality] || { title: `${botName} 💜`, body: "Notifications are working! I'll check in on you throughout the day." }
    try {
      // Try SW first (more reliable on mobile)
      const reg = await navigator.serviceWorker?.ready
      if (reg) {
        await reg.showNotification(notif.title, {
          body: notif.body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [200, 100, 200],
          data: { url: '/' },
        })
      } else {
        new Notification(notif.title, { body: notif.body, icon: '/favicon.svg' })
      }
      setTestNotifStatus('sent')
      setTimeout(() => setTestNotifStatus(''), 4000)
    } catch {
      // Fallback
      try { new Notification(notif.title, { body: notif.body }) } catch {}
      setTestNotifStatus('sent')
      setTimeout(() => setTestNotifStatus(''), 4000)
    }
  }

  const handleTestVoice = () => {
    if (!ttsSupported) { setTestVoiceStatus('unsupported'); return }
    window.speechSynthesis.cancel()
    const voices = availableVoices
    const chosen = pickVoice(form.voicePreference, voices)
    const utterance = new SpeechSynthesisUtterance(
      `Hi! I'm ${form.botName || 'Moo'}, your companion. This is how I sound with your selected voice.`
    )
    utterance.rate = 0.95
    utterance.pitch = 1.0
    if (chosen) utterance.voice = chosen
    utterance.onend = () => setTestVoiceStatus('')
    utterance.onerror = () => setTestVoiceStatus('error')
    setTestVoiceStatus('speaking')
    window.speechSynthesis.speak(utterance)
  }

  const stopTestVoice = () => {
    window.speechSynthesis.cancel()
    setTestVoiceStatus('')
  }

  const selectedPersonality = PERSONALITIES.find(p => p.key === form.botPersonality) || PERSONALITIES[0]
  const femaleVoices  = availableVoices.filter(v => categorizeVoice(v) === 'female')
  const maleVoices    = availableVoices.filter(v => categorizeVoice(v) === 'male')
  const neutralVoices = availableVoices.filter(v => categorizeVoice(v) === 'neutral')

  return (
    <Layout>
      <div className="profile-page animate-fade-in">
        <div className="profile-header">
          <div className="profile-avatar-display">
            <span className="profile-avatar-emoji">{getAvatarEmoji(form.avatarId, user?.gender)}</span>
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

            {/* Test notification button */}
            <div className="companion-test-notif">
              <button
                type="button"
                className="btn btn-secondary companion-test-btn"
                onClick={handleTestNotification}
              >
                🔔 Test Notification
              </button>
              {testNotifStatus === 'sent' && (
                <span className="companion-test-status companion-test-ok">
                  ✓ Notification sent in {selectedPersonality.label} style!
                </span>
              )}
              {testNotifStatus === 'denied' && (
                <span className="companion-test-status companion-test-err">
                  ⚠️ Notifications blocked — enable them in browser settings
                </span>
              )}
              {testNotifStatus === 'unsupported' && (
                <span className="companion-test-status companion-test-err">
                  ⚠️ Notifications not supported in this browser
                </span>
              )}
              <p className="companion-test-hint">
                Sends a test notification in your selected personality style
              </p>
            </div>
          </div>

          {/* ── Voice Settings ── */}
          <div className="profile-section glass voice-section">
            <h2 className="profile-section-title">🔊 Companion Voice</h2>
            <p className="companion-desc">
              Choose how your companion sounds when voice replies are on.
              {!ttsSupported && <span className="voice-unsupported"> Voice not supported in this browser.</span>}
            </p>

            {ttsSupported && (
              <>
                {/* Quick category buttons */}
                <div>
                  <label className="label" style={{ marginBottom: 10 }}>Voice Type</label>
                  <div className="voice-category-row">
                    {[
                      { key: 'auto',    label: 'Auto',    emoji: '🎙️', desc: 'Browser default' },
                      { key: 'female',  label: 'Female',  emoji: '👩', desc: femaleVoices.length > 0 ? `${femaleVoices.length} available` : 'May not be available' },
                      { key: 'male',    label: 'Male',    emoji: '👨', desc: maleVoices.length > 0 ? `${maleVoices.length} available` : 'May not be available' },
                      { key: 'neutral', label: 'Neutral', emoji: '🧑', desc: neutralVoices.length > 0 ? `${neutralVoices.length} available` : 'May not be available' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        className={`voice-cat-btn ${form.voicePreference === opt.key ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, voicePreference: opt.key })}
                      >
                        <span className="voice-cat-emoji">{opt.emoji}</span>
                        <span className="voice-cat-label">{opt.label}</span>
                        <span className="voice-cat-desc">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific voice picker — only show if voices loaded */}
                {voicesLoaded && availableVoices.length > 0 && (
                  <div>
                    <label className="label" style={{ marginBottom: 8 }}>
                      Specific Voice
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                    </label>
                    <select
                      className="input voice-select"
                      value={['auto','female','male','neutral'].includes(form.voicePreference) ? '' : form.voicePreference}
                      onChange={e => setForm({ ...form, voicePreference: e.target.value || 'auto' })}
                    >
                      <option value="">— Use category selection above —</option>
                      {availableVoices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({categorizeVoice(v)}) {v.localService ? '📱' : '☁️'}
                        </option>
                      ))}
                    </select>
                    <p className="voice-select-hint">
                      📱 = device voice (works offline) · ☁️ = cloud voice (needs internet)
                    </p>
                  </div>
                )}

                {!voicesLoaded && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Loading available voices...
                  </p>
                )}

                {voicesLoaded && availableVoices.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    No English voices found on this device. Voice replies will use the system default.
                  </p>
                )}

                {/* Test voice button */}
                <div className="voice-test-row">
                  {testVoiceStatus === 'speaking' ? (
                    <button className="btn btn-secondary" onClick={stopTestVoice}>
                      ⏹ Stop
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={handleTestVoice}>
                      ▶ Test Voice
                    </button>
                  )}
                  {testVoiceStatus === 'unsupported' && (
                    <span className="companion-test-status companion-test-err">
                      ⚠️ Voice not supported in this browser
                    </span>
                  )}
                  {testVoiceStatus === 'error' && (
                    <span className="companion-test-status companion-test-err">
                      ⚠️ Voice playback failed
                    </span>
                  )}
                  <p className="companion-test-hint">
                    Plays a sample using your selected voice
                  </p>
                </div>
              </>
            )}
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
          {saved && (
            <div className="profile-save-toast">
              ✓ Preferences saved — bot name "{form.botName || 'Moo'}" and {form.botPersonality} personality active
            </div>
          )}
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
