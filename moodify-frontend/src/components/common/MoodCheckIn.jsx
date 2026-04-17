import React, { useState } from 'react'
import { logMood } from '../../api/moodApi'
import { useMood } from '../../context/MoodContext'
import FeedbackModal from './FeedbackModal'
import { getPersonality, getTransitionMessage } from '../../utils/personality'
import './MoodCheckIn.css'

const MOODS = [
  { key: 'HAPPY',        emoji: '😊', label: 'Happy',        color: '#f59e0b' },
  { key: 'EXCITED',      emoji: '🤩', label: 'Excited',      color: '#f97316' },
  { key: 'MOTIVATED',    emoji: '💪', label: 'Motivated',    color: '#10b981' },
  { key: 'CONFIDENT',    emoji: '😎', label: 'Confident',    color: '#3b82f6' },
  { key: 'HOPEFUL',      emoji: '🌟', label: 'Hopeful',      color: '#8b5cf6' },
  { key: 'PEACEFUL',     emoji: '🕊️', label: 'Peaceful',     color: '#14b8a6' },
  { key: 'RELAXED',      emoji: '😌', label: 'Relaxed',      color: '#6366f1' },
  { key: 'CALM',         emoji: '🧘', label: 'Calm',         color: '#0ea5e9' },
  { key: 'NEUTRAL',      emoji: '😐', label: 'Neutral',      color: '#6b7280' },
  { key: 'TIRED',        emoji: '😴', label: 'Tired',        color: '#78716c' },
  { key: 'BORED',        emoji: '😑', label: 'Bored',        color: '#9ca3af' },
  { key: 'LONELY',       emoji: '🥺', label: 'Lonely',       color: '#a78bfa' },
  { key: 'INSECURE',     emoji: '😔', label: 'Insecure',     color: '#c084fc' },
  { key: 'SAD',          emoji: '😢', label: 'Sad',          color: '#60a5fa' },
  { key: 'ANXIOUS',      emoji: '😟', label: 'Anxious',      color: '#fb923c' },
  { key: 'STRESSED',     emoji: '😰', label: 'Stressed',     color: '#f87171' },
  { key: 'OVERWHELMED',  emoji: '🤯', label: 'Overwhelmed',  color: '#ef4444' },
  { key: 'FRUSTRATED',   emoji: '😤', label: 'Frustrated',   color: '#f43f5e' },
  { key: 'ANGRY',        emoji: '😠', label: 'Angry',        color: '#dc2626' },
  { key: 'DISAPPOINTED', emoji: '😞', label: 'Disappointed', color: '#818cf8' },
]

const POSITIVE_MOODS = new Set([
  'HAPPY','EXCITED','MOTIVATED','CONFIDENT','HOPEFUL','PEACEFUL','RELAXED','CALM'
])
const NEGATIVE_MOODS = new Set([
  'SAD','ANGRY','STRESSED','ANXIOUS','OVERWHELMED','FRUSTRATED',
  'LONELY','INSECURE','DISAPPOINTED'
])

function getPositivityScore(key) {
  if (POSITIVE_MOODS.has(key)) return 2
  if (NEGATIVE_MOODS.has(key)) return 0
  return 1
}

function getTransitionType(from, to) {
  const before = getPositivityScore(from)
  const after  = getPositivityScore(to)
  if (after > before) return 'improved'
  if (after < before) return 'declined'
  return 'same'
}

const TRANSITION_MESSAGES = {
  improved: [
    "That's a beautiful shift. You moved through it. 🌟",
    "Look at that — you went from {from} to {to}. That's real progress. 💙",
    "You did something good for yourself today. It shows. ✨",
    "From {from} to {to} — that's not small. That's growth. 🌿",
  ],
  same: [
    "That's okay. Some feelings take time. You're still here, and that matters. 💙",
    "Still feeling {to}? That's valid. Keep going gently. 🌿",
    "Not every session fixes everything — and that's okay. You showed up. ✨",
  ],
  declined: [
    "It's okay to feel {to} right now. Feelings shift — this won't last forever. 💙",
    "Some days are harder than others. You're allowed to feel {to}. I'm here. 🌿",
    "Thank you for being honest. Feeling {to} is valid. Want to try something to help? 💜",
  ],
}

function pickMessage(type, from, to) {
  const pool = TRANSITION_MESSAGES[type]
  const msg  = pool[Math.floor(Math.random() * pool.length)]
  return msg
    .replace('{from}', from.toLowerCase())
    .replace('{to}',   to.toLowerCase())
}

export default function MoodCheckIn({ initialMood, onDone, onSkip }) {
  const { setCurrentMood } = useMood()
  const [selected,  setSelected]  = useState(null)
  const [phase,     setPhase]     = useState('select') // select | result | feedback
  const [saving,    setSaving]    = useState(false)
  const [transition, setTransition] = useState(null)

  const fromData = MOODS.find(m => m.key === initialMood)
  const toData   = MOODS.find(m => m.key === selected)

  const handleSubmit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await logMood({ mood: selected, note: `Mood check-in after session (was ${initialMood})` })
      setCurrentMood(selected)
      const type = getTransitionType(initialMood, selected)
      const personality = getPersonality()
      setTransition({
        type,
        message: getTransitionMessage(type, fromData?.label || initialMood, toData?.label || selected, personality),
      })
      setPhase('result')
    } finally {
      setSaving(false)
    }
  }

  // ── Result screen ────────────────────────────────────────────────────────
  if (phase === 'feedback') {
    return (
      <FeedbackModal
        moodBefore={fromData?.label}
        moodAfter={toData?.label}
        sessionType="RECOMMENDATION"
        onDone={() => onDone(selected)}
        onSkip={() => onDone(selected)}
      />
    )
  }

  if (phase === 'result' && transition) {
    const improved = transition.type === 'improved'
    const declined = transition.type === 'declined'

    return (
      <div className="checkin-overlay">
        <div className="checkin-card animate-fade-in">
          <div className="checkin-result">

            {/* Transition arrow */}
            <div className="checkin-transition">
              <div className="checkin-mood-pill" style={{ '--mc': fromData?.color || '#6b7280' }}>
                <span>{fromData?.emoji}</span>
                <span>{fromData?.label}</span>
              </div>
              <div className={`checkin-arrow ${improved ? 'arrow-up' : declined ? 'arrow-down' : 'arrow-same'}`}>
                {improved ? '→' : declined ? '→' : '→'}
              </div>
              <div className="checkin-mood-pill" style={{ '--mc': toData?.color || '#6b7280' }}>
                <span>{toData?.emoji}</span>
                <span>{toData?.label}</span>
              </div>
            </div>

            {/* Badge */}
            {improved && (
              <div className="checkin-badge improved">
                <span className="checkin-badge-icon">🌟</span>
                <span>Mood improved!</span>
              </div>
            )}
            {transition.type === 'same' && (
              <div className="checkin-badge same">
                <span className="checkin-badge-icon">💙</span>
                <span>You showed up</span>
              </div>
            )}
            {declined && (
              <div className="checkin-badge declined">
                <span className="checkin-badge-icon">🌿</span>
                <span>It's okay</span>
              </div>
            )}

            <p className="checkin-message">{transition.message}</p>

            <div className="checkin-result-actions">
              <button className="btn btn-primary btn-lg checkin-cta" onClick={() => setPhase('feedback')}>
                {improved ? 'Keep the momentum ✨' : 'Continue 💙'}
              </button>
              <button className="checkin-skip" onClick={onDone}>Skip feedback</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Select screen ────────────────────────────────────────────────────────
  return (
    <div className="checkin-overlay">
      <div className="checkin-card animate-fade-in">

        <div className="checkin-header">
          <div className="checkin-from-pill" style={{ '--mc': fromData?.color || '#6b7280' }}>
            <span>{fromData?.emoji}</span>
            <span>Started as {fromData?.label}</span>
          </div>
          <h2 className="checkin-title">How are you feeling now?</h2>
          <p className="checkin-sub">Be honest — every shift matters, big or small.</p>
        </div>

        <div className="checkin-grid">
          {MOODS.map(mood => (
            <button
              key={mood.key}
              className={`checkin-mood-btn ${selected === mood.key ? 'selected' : ''}`}
              style={{ '--mood-color': mood.color }}
              onClick={() => setSelected(mood.key)}
            >
              <span className="checkin-emoji">{mood.emoji}</span>
              <span className="checkin-label">{mood.label}</span>
            </button>
          ))}
        </div>

        <div className="checkin-actions">
          <button
            className="btn btn-primary btn-lg checkin-cta"
            onClick={handleSubmit}
            disabled={!selected || saving}
          >
            {saving ? 'Saving...' : selected ? `I'm feeling ${toData?.label} now ${toData?.emoji}` : 'Select your current mood'}
          </button>
          <button className="checkin-skip" onClick={onSkip}>
            Skip check-in
          </button>
        </div>

      </div>
    </div>
  )
}
