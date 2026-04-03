import React, { useState } from 'react'
import './MoodSelector.css'

const MOODS = [
  { key: 'HAPPY',        emoji: '😊', label: 'Happy',        color: '#f59e0b',  cat: 'Positive' },
  { key: 'EXCITED',      emoji: '🤩', label: 'Excited',      color: '#f97316',  cat: 'Positive' },
  { key: 'MOTIVATED',    emoji: '💪', label: 'Motivated',    color: '#10b981',  cat: 'Positive' },
  { key: 'CONFIDENT',    emoji: '😎', label: 'Confident',    color: '#3b82f6',  cat: 'Positive' },
  { key: 'HOPEFUL',      emoji: '🌟', label: 'Hopeful',      color: '#8b5cf6',  cat: 'Positive' },
  { key: 'PEACEFUL',     emoji: '🕊️', label: 'Peaceful',     color: '#14b8a6',  cat: 'Calm' },
  { key: 'RELAXED',      emoji: '😌', label: 'Relaxed',      color: '#6366f1',  cat: 'Calm' },
  { key: 'CALM',         emoji: '🧘', label: 'Calm',         color: '#0ea5e9',  cat: 'Calm' },
  { key: 'NEUTRAL',      emoji: '😐', label: 'Neutral',      color: '#6b7280',  cat: 'Calm' },
  { key: 'TIRED',        emoji: '😴', label: 'Tired',        color: '#78716c',  cat: 'Low' },
  { key: 'BORED',        emoji: '😑', label: 'Bored',        color: '#9ca3af',  cat: 'Low' },
  { key: 'LONELY',       emoji: '🥺', label: 'Lonely',       color: '#a78bfa',  cat: 'Low' },
  { key: 'INSECURE',     emoji: '😔', label: 'Insecure',     color: '#c084fc',  cat: 'Low' },
  { key: 'SAD',          emoji: '😢', label: 'Sad',          color: '#60a5fa',  cat: 'Low' },
  { key: 'DISAPPOINTED', emoji: '😞', label: 'Disappointed', color: '#818cf8',  cat: 'Low' },
  { key: 'ANXIOUS',      emoji: '😟', label: 'Anxious',      color: '#fb923c',  cat: 'Stressed' },
  { key: 'STRESSED',     emoji: '😰', label: 'Stressed',     color: '#f87171',  cat: 'Stressed' },
  { key: 'OVERWHELMED',  emoji: '🤯', label: 'Overwhelmed',  color: '#ef4444',  cat: 'Stressed' },
  { key: 'FRUSTRATED',   emoji: '😤', label: 'Frustrated',   color: '#f43f5e',  cat: 'Stressed' },
  { key: 'ANGRY',        emoji: '😠', label: 'Angry',        color: '#dc2626',  cat: 'Stressed' },
]

const CATEGORIES = [
  { key: 'All',      emoji: '✨', color: '#7c3aed' },
  { key: 'Positive', emoji: '😊', color: '#f59e0b' },
  { key: 'Calm',     emoji: '🌿', color: '#14b8a6' },
  { key: 'Low',      emoji: '🥺', color: '#a78bfa' },
  { key: 'Stressed', emoji: '😰', color: '#f87171' },
]

// Desktop: full grid, no categories
function DesktopMoodGrid({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null)
  return (
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
  )
}

// Mobile: category tabs + scrollable row
function MobileMoodPicker({ selected, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? MOODS
    : MOODS.filter(m => m.cat === activeCategory)

  return (
    <div className="mobile-mood-picker">
      {/* Category tabs */}
      <div className="mobile-mood-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`mobile-mood-cat ${activeCategory === cat.key ? 'active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.key}</span>
          </button>
        ))}
      </div>

      {/* Mood grid — 4 columns, all visible, scrollable */}
      <div className="mobile-mood-grid">
        {filtered.map(mood => (
          <button
            key={mood.key}
            className={`mobile-mood-btn ${selected === mood.key ? 'selected' : ''}`}
            style={{ '--mood-color': mood.color }}
            onClick={() => onSelect(mood.key)}
          >
            <span className="mobile-mood-emoji">{mood.emoji}</span>
            <span className="mobile-mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Selected mood indicator */}
      {selected && (
        <div className="mobile-mood-selected">
          <span>{MOODS.find(m => m.key === selected)?.emoji}</span>
          <span>Feeling <strong>{MOODS.find(m => m.key === selected)?.label}</strong></span>
        </div>
      )}
    </div>
  )
}

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="mood-selector">
      {/* Desktop grid — hidden on mobile */}
      <div className="mood-selector-desktop">
        <DesktopMoodGrid selected={selected} onSelect={onSelect} />
      </div>
      {/* Mobile picker — hidden on desktop */}
      <div className="mood-selector-mobile">
        <MobileMoodPicker selected={selected} onSelect={onSelect} />
      </div>
    </div>
  )
}

export { MOODS }
