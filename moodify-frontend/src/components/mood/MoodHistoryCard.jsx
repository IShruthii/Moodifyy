import React from 'react'
import './MoodHistoryCard.css'

export default function MoodHistoryCard({ entry }) {
  const categoryClass = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral',
  }[entry.moodCategory] || 'neutral'

  return (
    <div className={`mood-history-card ${categoryClass}`}>
      <div className="mhc-left">
        <span className="mhc-emoji">{entry.moodEmoji}</span>
        <div className="mhc-info">
          <span className="mhc-mood">{entry.mood}</span>
          <span className="mhc-date">{new Date(entry.entryDate).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
          })}</span>
        </div>
      </div>
      <div className="mhc-right">
        <div className="mhc-energy">
          <span className="mhc-energy-label">Energy</span>
          <div className="mhc-bar">
            <div className="mhc-bar-fill" style={{ width: `${entry.energyLevel * 10}%` }} />
          </div>
        </div>
        {entry.note && <p className="mhc-note">"{entry.note}"</p>}
      </div>
    </div>
  )
}
