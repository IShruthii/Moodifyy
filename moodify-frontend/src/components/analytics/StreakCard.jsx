import React from 'react'
import './StreakCard.css'

export default function StreakCard({ currentStreak, longestStreak }) {
  return (
    <div className="streak-card">
      <div className="streak-main">
        <div className="streak-fire">🔥</div>
        <div className="streak-count">{currentStreak}</div>
        <div className="streak-label">Day Streak</div>
      </div>
      <div className="streak-divider" />
      <div className="streak-best">
        <div className="streak-best-value">👑 {longestStreak}</div>
        <div className="streak-best-label">Best Streak</div>
      </div>
    </div>
  )
}
