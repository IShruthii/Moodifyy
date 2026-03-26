import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import PermissionPrompt from '../components/common/PermissionPrompt'
import { useAuth } from '../context/AuthContext'
import { getTodaysMood } from '../api/moodApi'
import { getAnalytics } from '../api/analyticsApi'
import { getPreference } from '../api/preferenceApi'
import { getAvatarEmoji } from '../components/profile/AvatarPicker'
import './DashboardPage.css'

const GREETINGS = [
  "Welcome back to Moodify",
  "Good to see you again",
  "Your companion is here",
  "Ready to check in?",
]

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [todaysMood, setTodaysMood] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [preference, setPreference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)

  useEffect(() => {
    // Show permission prompt once per user account
    const key = `moodify_perms_asked_${user?.id}`
    if (!localStorage.getItem(key)) {
      setShowPermissions(true)
    }
  }, [user])

  const handlePermsDone = () => {
    localStorage.setItem(`moodify_perms_asked_${user?.id}`, 'true')
    setShowPermissions(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, analyticsRes, prefRes] = await Promise.all([
          getTodaysMood(),
          getAnalytics(),
          getPreference(),
        ])
        setTodaysMood(moodRes.data.data)
        setAnalytics(analyticsRes.data.data)
        setPreference(prefRes.data.data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const displayName = preference?.displayName || user?.name || 'Friend'
  const avatarEmoji = getAvatarEmoji(preference?.avatarId)

  return (
    <Layout>
      {showPermissions && <PermissionPrompt onDone={handlePermsDone} />}
      <div className="dashboard animate-fade-in">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-left">
            <div className="welcome-avatar">{avatarEmoji}</div>
            <div className="welcome-text">
              <p className="welcome-greeting">{getTimeGreeting()},</p>
              <h1 className="welcome-name">{displayName} 👋</h1>
              <p className="welcome-sub">Welcome back to Moodify</p>
            </div>
          </div>
          <div className="welcome-date">
            <span className="date-day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="date-full">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Today's Mood Card */}
        <div className="dashboard-mood-card">
          {todaysMood ? (
            <div className="mood-logged">
              <div className="mood-logged-left">
                <span className="mood-logged-emoji">{todaysMood.moodEmoji}</span>
                <div>
                  <p className="mood-logged-label">Today you're feeling</p>
                  <h3 className="mood-logged-name">{todaysMood.mood}</h3>
                  {todaysMood.note && <p className="mood-logged-note">"{todaysMood.note}"</p>}
                </div>
              </div>
              <Link to="/recommendations" className="btn btn-primary">
                See Recommendations ✨
              </Link>
            </div>
          ) : (
            <div className="mood-prompt">
              <div className="mood-prompt-left">
                <span className="mood-prompt-icon">💭</span>
                <div>
                  <h3 className="mood-prompt-title">How are you feeling today?</h3>
                  <p className="mood-prompt-sub">Take a moment to check in with yourself</p>
                </div>
              </div>
              <Link to="/mood" className="btn btn-primary btn-lg">
                Log Mood 🌟
              </Link>
            </div>
          )}
        </div>

        {/* Stats Row */}
        {!loading && analytics && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-icon">🔥</span>
              <div className="stat-info">
                <span className="stat-value">{analytics.currentStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div className="stat-info">
                <span className="stat-value">{analytics.totalEntries}</span>
                <span className="stat-label">Total Entries</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✨</span>
              <div className="stat-info">
                <span className="stat-value">{analytics.positiveRatio}%</span>
                <span className="stat-label">Positive Days</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏆</span>
              <div className="stat-info">
                <span className="stat-value">{analytics.badges?.length || 0}</span>
                <span className="stat-label">Badges</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/mood" className="quick-action-card">
              <span className="qa-icon">💭</span>
              <span className="qa-label">Log Mood</span>
            </Link>
            <Link to="/recommendations" className="quick-action-card">
              <span className="qa-icon">✨</span>
              <span className="qa-label">For You</span>
            </Link>
            <Link to="/calendar" className="quick-action-card">
              <span className="qa-icon">📅</span>
              <span className="qa-label">Calendar</span>
            </Link>
            <Link to="/analytics" className="quick-action-card">
              <span className="qa-icon">📊</span>
              <span className="qa-label">Insights</span>
            </Link>
          </div>
        </div>

        {/* Most Frequent Mood */}
        {analytics?.mostFrequentMood && (
          <div className="dashboard-section">
            <h2 className="section-title">Your Mood Pattern</h2>
            <div className="mood-pattern-card glass">
              <div className="mood-pattern-left">
                <span className="mood-pattern-emoji">{analytics.mostFrequentMoodEmoji}</span>
                <div>
                  <p className="mood-pattern-label">Most frequent mood</p>
                  <h3 className="mood-pattern-mood">{analytics.mostFrequentMood}</h3>
                </div>
              </div>
              <Link to="/analytics" className="btn btn-secondary btn-sm">
                View Insights →
              </Link>
            </div>
          </div>
        )}
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
