import React, { useState } from 'react'
import './MoodSelector.css'

const MOODS = [
  { key: 'HAPPY', emoji: '😊', label: 'Happy', color: '#f59e0b' },
  { key: 'EXCITED', emoji: '🤩', label: 'Excited', color: '#f97316' },
  { key: 'MOTIVATED', emoji: '💪', label: 'Motivated', color: '#10b981' },
  { key: 'CONFIDENT', emoji: '😎', label: 'Confident', color: '#3b82f6' },
  { key: 'HOPEFUL', emoji: '🌟', label: 'Hopeful', color: '#8b5cf6' },
  { key: 'PEACEFUL', emoji: '🕊️', label: 'Peaceful', color: '#14b8a6' },
  { key: 'RELAXED', emoji: '😌', label: 'Relaxed', color: '#6366f1' },
  { key: 'CALM', emoji: '🧘', label: 'Calm', color: '#0ea5e9' },
  { key: 'NEUTRAL', emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { key: 'TIRED', emoji: '😴', label: 'Tired', color: '#78716c' },
  { key: 'BORED', emoji: '😑', label: 'Bored', color: '#9ca3af' },
  { key: 'LONELY', emoji: '🥺', label: 'Lonely', color: '#a78bfa' },
  { key: 'INSECURE', emoji: '😔', label: 'Insecure', color: '#c084fc' },
  { key: 'SAD', emoji: '😢', label: 'Sad', color: '#60a5fa' },
  { key: 'DISAPPOINTED', emoji: '😞', label: 'Disappointed', color: '#818cf8' },
  { key: 'ANXIOUS', emoji: '😟', label: 'Anxious', color: '#fb923c' },
  { key: 'STRESSED', emoji: '😰', label: 'Stressed', color: '#f87171' },
  { key: 'OVERWHELMED', emoji: '🤯', label: 'Overwhelmed', color: '#ef4444' },
  { key: 'FRUSTRATED', emoji: '😤', label: 'Frustrated', color: '#f43f5e' },
  { key: 'ANGRY', emoji: '😠', label: 'Angry', color: '#dc2626' },
]

export default function MoodSelector({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="mood-selector">
      <div className="mood-grid">
        {MOODS.map(mood => (
          <button
            key={mood.key}
            className={`mood-btn ${selected === mood.key ? 'selected' : ''}`}
            onClick={() => onSelect(mood.key)}
            onMouseEnter={() => setHovered(mood.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              '--mood-color': mood.color,
              transform: selected === mood.key || hovered === mood.key ? 'scale(1.15)' : 'scale(1)',
            }}
            title={mood.label}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { MOODS }
