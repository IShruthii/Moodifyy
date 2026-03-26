import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import LoadingSpinner from '../components/common/LoadingSpinner'
import MoodCheckIn from '../components/common/MoodCheckIn'
import FeedbackModal from '../components/common/FeedbackModal'
import { getRecommendations } from '../api/recommendationApi'
import { useMood } from '../context/MoodContext'
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
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState(null)
  const [activeTab,  setActiveTab]  = useState('music')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showCheckIn,  setShowCheckIn]  = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [moodAfter,    setMoodAfter]    = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!currentMood) { navigate('/mood'); return }
    getRecommendations(currentMood)
      .then(res => setRecommendations(res.data.data))
      .catch(() => setError('Failed to load recommendations'))
      .finally(() => setLoading(false))
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
        <div className="recs-grid">
          {(tabContent[activeTab] || []).map((item, i) => (
            <RecommendationCard
              key={i}
              item={item}
              mood={recommendations.mood}
              type={activeTab}
            />
          ))}
        </div>
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
