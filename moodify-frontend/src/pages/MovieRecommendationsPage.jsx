import { useState } from 'react'
import Layout from '../components/common/Layout'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { getMovieRecommendations } from '../api/movieApi'
import './MovieRecommendationsPage.css'

const MOODS = [
  { key: 'happy',       emoji: '😊', label: 'Happy' },
  { key: 'sad',         emoji: '😢', label: 'Sad' },
  { key: 'angry',       emoji: '😠', label: 'Angry' },
  { key: 'anxious',     emoji: '😰', label: 'Anxious' },
  { key: 'stressed',    emoji: '😤', label: 'Stressed' },
  { key: 'bored',       emoji: '😑', label: 'Bored' },
  { key: 'lonely',      emoji: '🥺', label: 'Lonely' },
  { key: 'excited',     emoji: '🤩', label: 'Excited' },
  { key: 'calm',        emoji: '🧘', label: 'Calm' },
  { key: 'motivated',   emoji: '💪', label: 'Motivated' },
  { key: 'nostalgic',   emoji: '🎞️', label: 'Nostalgic' },
  { key: 'tired',       emoji: '😴', label: 'Tired' },
  { key: 'overwhelmed', emoji: '🤯', label: 'Overwhelmed' },
  { key: 'hopeful',     emoji: '🌟', label: 'Hopeful' },
  { key: 'romantic',    emoji: '💕', label: 'Romantic' },
  { key: 'heartbroken', emoji: '💔', label: 'Heartbroken' },
  { key: 'depressed',   emoji: '😔', label: 'Depressed' },
  { key: 'confused',    emoji: '😕', label: 'Confused' },
]

const OTT_COLORS = {
  netflix: '#e50914',
  prime:   '#00a8e0',
  hotstar: '#1f80e0',
}

export default function MovieRecommendationsPage() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [results, setResults]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood)
    setLoading(true)
    setError('')
    setResults([])
    try {
      const res = await getMovieRecommendations(mood)
      setResults(res.data.data || [])
    } catch {
      setError('Could not load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="movie-recs-page animate-fade-in">
        <div className="movie-recs-header">
          <h1 className="movie-recs-title">🎬 Movie Recommendations</h1>
          <p className="movie-recs-sub">Pick your mood — get movies curated just for you</p>
        </div>

        {/* Mood Selector */}
        <div className="mood-selector-grid">
          {MOODS.map(m => (
            <button
              key={m.key}
              className={`mood-chip ${selectedMood === m.key ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(m.key)}
            >
              <span className="mood-chip-emoji">{m.emoji}</span>
              <span className="mood-chip-label">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="movie-loading">
            <div className="movie-skeleton-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="movie-skeleton">
                  <div className="skeleton skeleton-poster" />
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-sub" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="movie-error">{error}</p>}

        {/* Results */}
        {!loading && results.map((section, si) => (
          <div key={si} className="movie-section animate-fade-in">
            <div className="movie-section-header">
              <h2 className="movie-section-title">{section.strategyLabel}</h2>
              <span className="movie-section-count">{section.movies?.length} films</span>
            </div>
            <div className="movie-cards-grid">
              {(section.movies || []).map((movie, mi) => (
                <div key={mi} className="movie-card">
                  {/* Poster */}
                  <div className="movie-poster-wrap">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="movie-poster" loading="lazy" />
                    ) : (
                      <div className="movie-poster-placeholder">🎬</div>
                    )}
                    <div className="movie-rating-badge">⭐ {movie.rating}</div>
                  </div>

                  {/* Info */}
                  <div className="movie-card-body">
                    <h3 className="movie-card-title">{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="movie-year">{movie.year}</span>
                      {movie.genres?.slice(0, 2).map((g, i) => (
                        <span key={i} className="movie-genre-tag">{g}</span>
                      ))}
                    </div>
                    {movie.overview && (
                      <p className="movie-overview">{movie.overview.slice(0, 100)}{movie.overview.length > 100 ? '...' : ''}</p>
                    )}

                    {/* OTT Platforms */}
                    <div className="movie-ott-row">
                      {(movie.ottPlatforms || []).map((ott, i) => (
                        <a key={i} href={ott.url} target="_blank" rel="noopener noreferrer"
                          className="ott-btn"
                          style={{ '--ott-color': OTT_COLORS[ott.logo] || '#7c3aed' }}>
                          {ott.name}
                        </a>
                      ))}
                    </div>

                    {/* Trailer */}
                    {movie.trailerUrl && (
                      <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
                        className="trailer-btn">
                        ▶ Watch Trailer
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
