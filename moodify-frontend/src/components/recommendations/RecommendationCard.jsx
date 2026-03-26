import React from 'react'
import { logRecommendationClick } from '../../api/recommendationApi'
import './RecommendationCard.css'

const PLATFORM_COLORS = {
  spotify: '#1db954',
  youtube: '#ff0000',
  jiosaavn: '#2bc5b4',
  gaana: '#e72c30',
  netflix: '#e50914',
  prime: '#00a8e0',
  hotstar: '#1f80e0',
  imdb: '#f5c518',
  swiggy: '#fc8019',
  zomato: '#e23744',
  maps: '#4285f4',
  game: '#7c3aed',
}

export default function RecommendationCard({ item, mood, type }) {
  const handleLinkClick = async (link) => {
    try {
      await logRecommendationClick(mood, type, item.title)
    } catch {
      // silent
    }
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="rec-card">
      <div className="rec-card-header">
        <span className="rec-emoji">{item.imageEmoji}</span>
        <div className="rec-info">
          <h4 className="rec-title">{item.title}</h4>
          <p className="rec-desc">{item.description}</p>
        </div>
      </div>
      <div className="rec-links">
        {item.links?.map((link, i) => (
          <button
            key={i}
            className="rec-link-btn"
            style={{ '--platform-color': PLATFORM_COLORS[link.icon] || '#7c3aed' }}
            onClick={() => handleLinkClick(link)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
