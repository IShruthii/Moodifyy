import React, { useState } from 'react'
import { logMood } from '../../api/moodApi'
import { useMood } from '../../context/MoodContext'
import { useAuth } from '../../context/AuthContext'
import './MoodTransition.css'

const MOODS = [
  { key: 'HAPPY',       emoji: '😊', label: 'Happy',       color: '#f59e0b' },
  { key: 'EXCITED',     emoji: '🤩', label: 'Excited',     color: '#f97316' },
  { key: 'MOTIVATED',   emoji: '💪', label: 'Motivated',   color: '#10b981' },
  { key: 'CONFIDENT',   emoji: '😎', label: 'Confident',   color: '#3b82f6' },
  { key: 'HOPEFUL',     emoji: '🌟', label: 'Hopeful',     color: '#8b5cf6' },
  { key: 'PEACEFUL',    emoji: '🕊️', label: 'Peaceful',    color: '#14b8a6' },
  { key: 'RELAXED',     emoji: '😌', label: 'Relaxed',     color: '#6366f1' },
  { key: 'CALM',        emoji: '🧘', label: 'Calm',        color: '#0ea5e9' },
  { key: 'NEUTRAL',     emoji: '😐', label: 'Neutral',     color: '#6b7280' },
  { key: 'TIRED',       emoji: '😴', label: 'Tired',       color: '#78716c' },
  { key: 'BORED',       emoji: '😑', label: 'Bored',       color: '#9ca3af' },
  { key: 'LONELY',      emoji: '🥺', label: 'Lonely',      color: '#a78bfa' },
  { key: 'INSECURE',    emoji: '😔', label: 'Insecure',    color: '#c084fc' },
  { key: 'SAD',         emoji: '😢', label: 'Sad',         color: '#60a5fa' },
  { key: 'ANXIOUS',     emoji: '😟', label: 'Anxious',     color: '#fb923c' },
  { key: 'STRESSED',    emoji: '😰', label: 'Stressed',    color: '#f87171' },
  { key: 'OVERWHELMED', emoji: '🤯', label: 'Overwhelmed', color: '#ef4444' },
  { key: 'FRUSTRATED',  emoji: '😤', label: 'Frustrated',  color: '#f43f5e' },
  { key: 'ANGRY',       emoji: '😠', label: 'Angry',       color: '#dc2626' },
  { key: 'DISAPPOINTED',emoji: '😞', label: 'Disappointed',color: '#818cf8' },
]

export default function MoodTransition({ onDone }) {
  const { user } = useAuth()
  const { setCurrentMood } = useMood()
  const [selected, setSelected]   = useState(null)
  const [note, setNote]           = useState('')
  const [phase, setPhase]         = useState('select') // select | saving | feedback
  const [savedMood, setSavedMood] = useState(null)
  const [error, setError]         = useState('')

  const selectedData = MOODS.find(m => m.key === selected)

  const handleSubmit = async () => {
    if (!selected) return
    setPhase('saving')
    setError('')
    try {
      await logMood({ mood: selected, note })
      setCurrentMood(selected)
      setSavedMood(selectedData)
      setPhase('feedback')
    } catch {
      setError('Could not save your mood. Please try again.')
      setPhase('select')
    }
  }

  const handleSkip = () => onDone(null)

  // ── Feedback screen ──────────────────────────────────────────────
  if (phase === 'feedback' && savedMood) {
    const isPositive = ['HAPPY','EXCITED','MOTIVATED','CONFIDENT','HOPEFUL',
                        'PEACEFUL','RELAXED','CALM'].includes(savedMood.key)
    const isNegative = ['SAD','ANGRY','STRESSED','ANXIOUS','OVERWHELMED',
                        'FRUSTRATED','LONELY','INSECURE','DISAPPOINTED'].includes(savedMood.key)

    const feedbackMsg = isPositive
      ? `Love that energy! Let's make the most of your ${savedMood.label.toLowerCase()} mood today. 🌟`
      : isNegative
      ? `It's okay to feel ${savedMood.label.toLowerCase()}. I've got something to help you through it. 💙`
      : `Thanks for checking in. Here's what I've picked for you today. ✨`

    return (
      <div className="mt-overlay">
        <div className="mt-card mt-feedback animate-fade-in">
          <div
            className="mt-feedback-ring"
            style={{ '--mood-color': savedMood.color }}
          >
            <span className="mt-feedback-emoji">{savedMood.emoji}</span>
          </div>

          <div className="mt-feedback-text">
            <h2 className="mt-feedback-title">
              You're feeling <span style={{ color: savedMood.color }}>{savedMood.label}</span>
            </h2>
            <p className="mt-feedback-msg">{feedbackMsg}</p>
          </div>

          {note && (
            <div className="mt-feedback-note">
              <span className="mt-note-icon">📝</span>
              <p>"{note}"</p>
            </div>
          )}

          <div className="mt-feedback-actions">
            <button
              className="btn btn-primary btn-lg mt-cta"
              onClick={() => onDone(savedMood.key)}
            >
              See my recommendations ✨
            </button>
            <button
              className="btn btn-secondary mt-cta-sec"
              onClick={() => onDone(null)}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Saving spinner ───────────────────────────────────────────────
  if (phase === 'saving') {
    return (
      <div className="mt-overlay">
        <div className="mt-card mt-saving animate-fade-in">
          <div className="mt-saving-ring">
            <div /><div /><div /><div />
          </div>
          <p className="mt-saving-text">Saving your mood...</p>
        </div>
      </div>
    )
  }

  // ── Mood select screen ───────────────────────────────────────────
  return (
    <div className="mt-overlay">
      <div className="mt-card animate-fade-in">

        <div className="mt-header">
          <span className="mt-wave">👋</span>
          <h2 className="mt-title">
            Hey {user?.name?.split(' ')[0] || 'there'},<br />
            how are you feeling right now?
          </h2>
          <p className="mt-sub">Be honest — this is your safe space.</p>
        </div>

        <div className="mt-mood-grid">
          {MOODS.map(mood => (
            <button
              key={mood.key}
              className={`mt-mood-btn ${selected === mood.key ? 'selected' : ''}`}
              style={{ '--mood-color': mood.color }}
              onClick={() => setSelected(mood.key)}
            >
              <span className="mt-mood-emoji">{mood.emoji}</span>
              <span className="mt-mood-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-note-section animate-fade-in">
            <textarea
              className="input mt-note-input"
              placeholder={`Anything on your mind? (optional)`}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {error && <p className="mt-error">⚠️ {error}</p>}

        <div className="mt-actions">
          <button
            className="btn btn-primary btn-lg mt-submit"
            onClick={handleSubmit}
            disabled={!selected}
          >
            {selected
              ? `I'm feeling ${selectedData?.label} ${selectedData?.emoji}`
              : 'Select a mood to continue'}
          </button>
          <button className="mt-skip" onClick={handleSkip}>
            Skip for now
          </button>
        </div>

      </div>
    </div>
  )
}
