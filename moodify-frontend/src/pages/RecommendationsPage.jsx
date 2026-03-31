import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import LoadingSpinner from '../components/common/LoadingSpinner'
import MoodCheckIn from '../components/common/MoodCheckIn'
import FeedbackModal from '../components/common/FeedbackModal'
import { getRecommendations } from '../api/recommendationApi'
import { getMovieRecommendations } from '../api/movieApi'
import { useMood } from '../context/MoodContext'
import { useAuth } from '../context/AuthContext'
import './RecommendationsPage.css'

const TABS = [
  { key: 'music',  label: '🎵 Music' },
  { key: 'movies', label: '🎬 Movies' },
  { key: 'places', label: '📍 Places' },
  { key: 'food',   label: '🍽️ Food' },
  { key: 'games',  label: '🎮 Games' },
]

// Auto-prompt after 3 minutes on the page
const AUTO_CHECKIN_MS = 3 * 60 * 1000

export default function RecommendationsPage() {
  const { currentMood, setCurrentMood } = useMood()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState(null)
  const [activeTab,  setActiveTab]  = useState('music')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showCheckIn,  setShowCheckIn]  = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [moodAfter,    setMoodAfter]    = useState(null)
  const timerRef = useRef(null)

  // Movie recommendations (new engine)
  const [movieRecs, setMovieRecs] = useState([])
  const [moviesLoading, setMoviesLoading] = useState(false)

  // My Playlist
  const playlistKey = `moodify_playlist_${user?.id}`
  const [playlist, setPlaylist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`moodify_playlist_${user?.id}`) || '[]') } catch { return [] }
  })
  const [songInput, setSongInput] = useState('')

  const addSong = () => {
    const trimmed = songInput.trim()
    if (!trimmed) return
    const updated = [...playlist, { name: trimmed, addedAt: Date.now() }]
    setPlaylist(updated)
    localStorage.setItem(playlistKey, JSON.stringify(updated))
    setSongInput('')
  }

  const removeSong = (idx) => {
    const updated = playlist.filter((_, i) => i !== idx)
    setPlaylist(updated)
    localStorage.setItem(playlistKey, JSON.stringify(updated))
  }

  const searchSong = (name, platform) => {
    const q = encodeURIComponent(name)
    const urls = {
      spotify: `https://open.spotify.com/search/${q}`,
      youtube: `https://music.youtube.com/search?q=${q}`,
      jiosaavn: `https://www.jiosaavn.com/search/${q}`,
      gaana: `https://gaana.com/search/${q}`,
    }
    window.open(urls[platform], '_blank')
  }

  useEffect(() => {
    if (!currentMood) { navigate('/mood'); return }
    getRecommendations(currentMood)
      .then(res => setRecommendations(res.data.data))
      .catch(() => setError('Failed to load recommendations'))
      .finally(() => setLoading(false))

    // Fetch movie recommendations in parallel
    setMoviesLoading(true)
    getMovieRecommendations(currentMood.toLowerCase())
      .then(res => setMovieRecs(res.data.data || []))
      .catch(() => setMovieRecs([]))
      .finally(() => setMoviesLoading(false))
  }, [currentMood, navigate])

  // Auto check-in timer
  useEffect(() => {
    if (!currentMood || loading) return
    timerRef.current = setTimeout(() => setShowCheckIn(true), AUTO_CHECKIN_MS)
    return () => clearTimeout(timerRef.current)
  }, [currentMood, loading])

  const handleCheckInDone = (newMood) => {
    setShowCheckIn(false)
    navigate('/dashboard')
  }

  const handleCheckInSkip = () => {
    setShowCheckIn(false)
    // Offer standalone feedback if check-in was skipped
    setTimeout(() => setShowFeedback(true), 300)
  }

  const handleFeedbackDone = () => {
    setShowFeedback(false)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <Layout>
        <div className="recs-loading">
          <LoadingSpinner size="lg" text="Curating just for you..." />
        </div>
      </Layout>
    )
  }

  if (error || !recommendations) {
    return (
      <Layout>
        <div className="recs-error">
          <p>{error || 'No recommendations found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/mood')}>
            Log Mood First
          </button>
        </div>
      </Layout>
    )
  }

  const tabContent = {
    music:  recommendations.music,
    movies: recommendations.movies,
    places: recommendations.places,
    food:   recommendations.food,
    games:  recommendations.games,
  }

  return (
    <Layout>
      {showCheckIn && (
        <MoodCheckIn
          initialMood={currentMood}
          onDone={handleCheckInDone}
          onSkip={handleCheckInSkip}
        />
      )}

      {showFeedback && (
        <FeedbackModal
          moodBefore={currentMood}
          moodAfter={null}
          sessionType="RECOMMENDATION"
          onDone={handleFeedbackDone}
          onSkip={handleFeedbackDone}
        />
      )}

      <div className="recs-page animate-fade-in">
        {/* Header */}
        <div className="recs-header">
          <div className="recs-mood-badge">
            <span className="recs-mood-emoji">{recommendations.moodEmoji}</span>
            <span className="recs-mood-name">{recommendations.mood}</span>
          </div>
          <h1 className="recs-title">Curated for you</h1>
          <p className="recs-message">{recommendations.message}</p>
        </div>

        {/* Mood check-in nudge banner */}
        <div className="recs-checkin-banner">
          <span className="recs-checkin-icon">💭</span>
          <div className="recs-checkin-text">
            <span>Tried something? Check in on how you feel now.</span>
          </div>
          <button
            className="btn btn-secondary btn-sm recs-checkin-btn"
            onClick={() => setShowCheckIn(true)}
          >
            How do I feel now?
          </button>
        </div>

        {/* Journal Prompt */}
        {recommendations.journalPrompt && (
          <div className="recs-journal-card">
            <div className="journal-icon">📝</div>
            <div className="journal-content">
              <h3 className="journal-title">Journal Prompt</h3>
              <p className="journal-text">{recommendations.journalPrompt}</p>
            </div>
          </div>
        )}

        {/* Challenge */}
        {recommendations.challenge && (
          <div className="recs-challenge-card">
            <div className="challenge-icon">⚡</div>
            <div className="challenge-content">
              <h3 className="challenge-title">Today's Challenge</h3>
              <p className="challenge-text">{recommendations.challenge}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="recs-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`recs-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'movies' ? (
          <div className="movies-tab-content">
            {moviesLoading ? (
              <div className="movies-skeleton-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="movie-skeleton-card">
                    <div className="skeleton movie-skel-poster" />
                    <div className="skeleton movie-skel-title" />
                    <div className="skeleton movie-skel-sub" />
                  </div>
                ))}
              </div>
            ) : movieRecs.length > 0 ? (
              movieRecs.map((section, si) => (
                <div key={si} className="movie-section-block animate-fade-in">
                  <div className="movie-section-label">
                    <span>{section.strategyLabel}</span>
                    <span className="movie-count-badge">{section.movies?.length} films</span>
                  </div>
                  <div className="movie-poster-grid">
                    {(section.movies || []).map((movie, mi) => (
                      <div key={mi} className="movie-poster-card">
                        <div className="movie-poster-wrap">
                          {movie.poster ? (
                            <img src={movie.poster} alt={movie.title} className="movie-poster-img" loading="lazy" />
                          ) : (
                            <div className="movie-poster-fallback">🎬</div>
                          )}
                          <div className="movie-rating-pill">⭐ {movie.rating}</div>
                          {movie.year > 0 && <div className="movie-year-pill">{movie.year}</div>}
                        </div>
                        <div className="movie-poster-info">
                          <h4 className="movie-poster-title">{movie.title}</h4>
                          <div className="movie-genre-row">
                            {(movie.genres || []).slice(0, 2).map((g, i) => (
                              <span key={i} className="movie-genre-chip">{g}</span>
                            ))}
                          </div>
                          {movie.overview && (
                            <p className="movie-poster-overview">
                              {movie.overview.slice(0, 80)}{movie.overview.length > 80 ? '...' : ''}
                            </p>
                          )}
                          <div className="movie-ott-buttons">
                            {(movie.ottPlatforms || []).map((ott, i) => (
                              <a key={i} href={ott.url} target="_blank" rel="noopener noreferrer"
                                className={`movie-ott-btn ott-${ott.logo}`}>
                                {ott.name}
                              </a>
                            ))}
                          </div>
                          {movie.trailerUrl && (
                            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
                              className="movie-trailer-btn">
                              ▶ Trailer
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="recs-grid">
                {(tabContent['movies'] || []).map((item, i) => (
                  <RecommendationCard key={i} item={item} mood={recommendations.mood} type="movie" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="recs-grid">
            {(tabContent[activeTab] || []).map((item, i) => (
              <RecommendationCard key={i} item={item} mood={recommendations.mood} type={activeTab} />
            ))}
          </div>
        )}

        {/* My Playlist — only on Music tab */}
        {activeTab === 'music' && (
          <div className="my-playlist-section">
            <h2 className="my-playlist-title">🎧 My Playlist</h2>
            <p className="my-playlist-sub">Add your favourite songs — search them instantly on any platform</p>

            <div className="my-playlist-input-row">
              <input
                className="input my-playlist-input"
                placeholder="Song name or artist... e.g. Nuvvu Nuvvu, Arijit Singh"
                value={songInput}
                onChange={e => setSongInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSong()}
              />
              <button className="btn btn-primary my-playlist-add-btn" onClick={addSong}>
                + Add
              </button>
            </div>

            {playlist.length === 0 ? (
              <div className="my-playlist-empty">
                <span>🎵</span>
                <p>No songs yet. Add your favourites above!</p>
              </div>
            ) : (
              <div className="my-playlist-list">
                {playlist.map((song, i) => (
                  <div key={i} className="my-playlist-item">
                    <span className="my-playlist-song-name">🎵 {song.name}</span>
                    <div className="my-playlist-actions">
                      <button className="playlist-platform-btn spotify" onClick={() => searchSong(song.name, 'spotify')}>Spotify</button>
                      <button className="playlist-platform-btn youtube" onClick={() => searchSong(song.name, 'youtube')}>YT Music</button>
                      <button className="playlist-platform-btn jiosaavn" onClick={() => searchSong(song.name, 'jiosaavn')}>JioSaavn</button>
                      <button className="playlist-platform-btn gaana" onClick={() => searchSong(song.name, 'gaana')}>Gaana</button>
                      <button className="playlist-remove-btn" onClick={() => removeSong(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
