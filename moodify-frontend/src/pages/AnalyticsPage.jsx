import React, { useEffect, useState } from 'react'
import Layout from '../components/common/Layout'
import StreakCard from '../components/analytics/StreakCard'
import BadgeCard from '../components/analytics/BadgeCard'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getAnalytics } from '../api/analyticsApi'
import { getFeedbackSummary } from '../api/feedbackApi'
import './AnalyticsPage.css'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [feedback,  setFeedback]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getAnalytics(), getFeedbackSummary()])
      .then(([aRes, fRes]) => {
        setAnalytics(aRes.data.data)
        setFeedback(fRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="lg" text="Analyzing your mood patterns..." />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="analytics-page animate-fade-in">
        <div className="analytics-header">
          <h1 className="page-title">Your Insights</h1>
          <p className="page-subtitle">Understanding your emotional patterns</p>
        </div>

        {/* Streak */}
        <StreakCard
          currentStreak={analytics?.currentStreak || 0}
          longestStreak={analytics?.longestStreak || 0}
        />

        {/* Summary Cards */}
        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-value">{analytics?.totalEntries || 0}</div>
            <div className="summary-label">Total Check-ins</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✨</div>
            <div className="summary-value">{analytics?.positiveRatio || 0}%</div>
            <div className="summary-label">Positive Days</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">{analytics?.mostFrequentMoodEmoji || '😐'}</div>
            <div className="summary-value summary-mood">{analytics?.mostFrequentMood || 'N/A'}</div>
            <div className="summary-label">Most Frequent</div>
          </div>
        </div>

        {/* Mood Frequency */}
        {analytics?.moodFrequencies?.length > 0 && (
          <div className="analytics-section">
            <h2 className="section-title">Mood Breakdown</h2>
            <div className="mood-freq-list">
              {analytics.moodFrequencies.slice(0, 8).map((mf, i) => {
                const maxCount = analytics.moodFrequencies[0].count
                const pct = Math.round((mf.count / maxCount) * 100)
                return (
                  <div key={i} className="mood-freq-item">
                    <span className="mf-emoji">{mf.emoji}</span>
                    <span className="mf-mood">{mf.mood}</span>
                    <div className="mf-bar-wrap">
                      <div className="mf-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="mf-count">{mf.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Feedback Summary */}
        {feedback && Number(feedback.totalFeedback) > 0 && (
          <div className="analytics-section">
            <h2 className="section-title">Your Feedback History</h2>
            <div className="feedback-summary-card">
              <div className="fb-avg-wrap">
                <span className="fb-avg-score">{feedback.averageRating}</span>
                <div className="fb-avg-stars">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`fb-avg-star ${s <= Math.round(feedback.averageRating) ? 'lit' : ''}`}>★</span>
                  ))}
                </div>
                <span className="fb-avg-label">avg from {feedback.totalFeedback} session{feedback.totalFeedback !== 1 ? 's' : ''}</span>
              </div>
              <div className="fb-bar-breakdown">
                {[5,4,3,2,1].map(s => {
                  const count = feedback.starBreakdown?.[String(s)] || 0
                  const pct = feedback.totalFeedback > 0 ? Math.round((count / feedback.totalFeedback) * 100) : 0
                  return (
                    <div key={s} className="fb-bar-row">
                      <span className="fb-bar-label">{s}★</span>
                      <div className="fb-bar-track">
                        <div className="fb-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="fb-bar-count">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {feedback.recentFeedback?.length > 0 && (
              <div className="fb-recent-list">
                {feedback.recentFeedback.filter(f => f.comment).slice(0, 3).map((f, i) => (
                  <div key={i} className="fb-recent-item">
                    <div className="fb-recent-stars">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                    <p className="fb-recent-comment">"{f.comment}"</p>
                    {f.moodBefore && f.moodAfter && (
                      <span className="fb-recent-transition">{f.moodBefore} → {f.moodAfter}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="analytics-section">
          <h2 className="section-title">Badges Earned</h2>          {analytics?.badges?.length > 0 ? (
            <div className="badges-grid">
              {analytics.badges.map((badge, i) => (
                <BadgeCard key={i} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="badges-empty">
              <span>🏆</span>
              <p>Keep logging your mood to earn badges!</p>
              <p className="badges-hint">Log your first mood to earn the "First Check-In" badge 🌱</p>
            </div>
          )}
        </div>
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
