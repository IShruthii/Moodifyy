import React, { useState } from 'react'
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
  trailer: '#ff6b35',
}

// Mood-based vibe tags for movies
const MOVIE_VIBE = {
  HAPPY: { tag: '✨ Feel-Good Pick', color: '#f59e0b' },
  EXCITED: { tag: '🎉 Hype Watch', color: '#f97316' },
  SAD: { tag: '💙 Healing Watch', color: '#60a5fa' },
  DISAPPOINTED: { tag: '💙 Healing Watch', color: '#60a5fa' },
  LONELY: { tag: '🤗 Comfort Watch', color: '#a78bfa' },
  STRESSED: { tag: '🌿 Calm Watch', color: '#10b981' },
  ANXIOUS: { tag: '🌿 Calm Watch', color: '#10b981' },
  OVERWHELMED: { tag: '🌿 Calm Watch', color: '#10b981' },
  ANGRY: { tag: '🔥 Release Watch', color: '#ef4444' },
  FRUSTRATED: { tag: '🔥 Release Watch', color: '#ef4444' },
  MOTIVATED: { tag: '💪 Power Watch', color: '#8b5cf6' },
  CONFIDENT: { tag: '😎 Boss Watch', color: '#8b5cf6' },
  HOPEFUL: { tag: '🌟 Inspiring Watch', color: '#fbbf24' },
  TIRED: { tag: '😴 Easy Watch', color: '#6366f1' },
  BORED: { tag: '🎯 Gripping Watch', color: '#ec4899' },
  RELAXED: { tag: '☕ Cozy Watch', color: '#14b8a6' },
  CALM: { tag: '☕ Cozy Watch', color: '#14b8a6' },
  PEACEFUL: { tag: '🕊️ Peaceful Watch', color: '#14b8a6' },
  INSECURE: { tag: '💜 Empowering Watch', color: '#c084fc' },
}

// Mood-based place activity tags
const PLACE_ACTIVITY = {
  HAPPY: '🎉 Celebrate here',
  EXCITED: '🚀 Adventure awaits',
  SAD: '🤗 Find comfort here',
  DISAPPOINTED: '🌿 Reset here',
  LONELY: '👥 Connect here',
  STRESSED: '🧘 Unwind here',
  ANXIOUS: '🌸 Find calm here',
  OVERWHELMED: '🌿 Breathe here',
  ANGRY: '💥 Release here',
  FRUSTRATED: '🏃 Move it out here',
  MOTIVATED: '💡 Create here',
  CONFIDENT: '🌆 Own the space',
  HOPEFUL: '📚 Grow here',
  TIRED: '😴 Rest & recharge',
  BORED: '🎯 Try something new',
  RELAXED: '🌅 Soak it in',
  CALM: '☕ Stay a while',
  PEACEFUL: '🕊️ Find your peace',
  INSECURE: '🌸 Safe space',
}

export default function RecommendationCard({ item, mood, type }) {
  const [expanded, setExpanded] = useState(false)

  const handleLinkClick = async (link) => {
    try { await logRecommendationClick(mood, type, item.title) } catch {}
    // Mobile-friendly link opening — use anchor click to avoid popup blockers
    const a = document.createElement('a')
    a.href = link.url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    // For Spotify on mobile: try deep link first
    if (link.icon === 'spotify' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Convert web URL to Spotify deep link
      const spotifyDeep = link.url.replace('https://open.spotify.com/', 'spotify://')
      a.href = spotifyDeep
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Fallback to web after 1.5s if app didn't open
      setTimeout(() => {
        window.location.href = link.url
      }, 1500)
      return
    }
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Movie card — special layout
  if (type === 'movie') {
    const vibe = MOVIE_VIBE[mood?.toUpperCase()] || { tag: '🎬 Watch Now', color: '#7c3aed' }
    const streamLinks = item.links?.filter(l => ['netflix', 'prime', 'hotstar'].includes(l.icon)) || []
    const infoLinks = item.links?.filter(l => ['imdb', 'youtube'].includes(l.icon)) || []

    return (
      <div className="rec-card rec-card-movie">
        <div className="movie-vibe-tag" style={{ '--vibe-color': vibe.color }}>
          {vibe.tag}
        </div>
        <div className="rec-card-header">
          <span className="rec-emoji">{item.imageEmoji}</span>
          <div className="rec-info">
            <h4 className="rec-title">{item.title}</h4>
            <p className="rec-desc">{item.description}</p>
          </div>
        </div>
        <div className="movie-links-section">
          {streamLinks.length > 0 && (
            <div className="movie-stream-row">
              <span className="movie-links-label">▶ Stream on</span>
              <div className="rec-links">
                {streamLinks.map((link, i) => (
                  <button key={i} className="rec-link-btn"
                    style={{ '--platform-color': PLATFORM_COLORS[link.icon] || '#7c3aed' }}
                    onClick={() => handleLinkClick(link)}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {infoLinks.length > 0 && (
            <div className="movie-info-row">
              {infoLinks.map((link, i) => (
                <button key={i} className="rec-link-btn rec-link-sm"
                  style={{ '--platform-color': PLATFORM_COLORS[link.icon] || '#7c3aed' }}
                  onClick={() => handleLinkClick(link)}>
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Place card — with activity tag
  if (type === 'place') {
    const activity = PLACE_ACTIVITY[mood?.toUpperCase()] || '📍 Visit nearby'
    return (
      <div className="rec-card rec-card-place">
        <div className="rec-card-header">
          <span className="rec-emoji">{item.imageEmoji}</span>
          <div className="rec-info">
            <h4 className="rec-title">{item.title}</h4>
            <p className="rec-desc">{item.description}</p>
            <span className="place-activity-tag">{activity}</span>
          </div>
        </div>
        <div className="rec-links">
          {item.links?.map((link, i) => (
            <button key={i} className="rec-link-btn"
              style={{ '--platform-color': PLATFORM_COLORS[link.icon] || '#4285f4' }}
              onClick={() => handleLinkClick(link)}>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default card (music, food, games)
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
          <button key={i} className="rec-link-btn"
            style={{ '--platform-color': PLATFORM_COLORS[link.icon] || '#7c3aed' }}
            onClick={() => handleLinkClick(link)}>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
