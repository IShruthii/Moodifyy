import React from 'react'
import './BadgeCard.css'

export default function BadgeCard({ badge }) {
  return (
    <div className="badge-card">
      <div className="badge-emoji">{badge.emoji}</div>
      <div className="badge-info">
        <div className="badge-name">{badge.name}</div>
        <div className="badge-desc">{badge.description}</div>
        {badge.earnedAt && (
          <div className="badge-date">Earned {new Date(badge.earnedAt).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  )
}
