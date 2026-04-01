import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import PermissionPrompt from '../components/common/PermissionPrompt'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import { getTodaysMood } from '../api/moodApi'
import { getPreference } from '../api/preferenceApi'
import { getAvatarEmoji } from '../components/profile/AvatarPicker'
import './DashboardPage.css'

function getTimeGreeting(name, gender) {
  const h = new Date().getHours()
  const babe = gender === 'female' ? 'babe' : gender === 'male' ? 'bro' : 'love'
  const N = name ? name.split(' ')[0] : babe
  if (h < 12) return `Good morning, ${N} ☀️`
  if (h < 17) return `Hey ${N}, good afternoon 💛`
  if (h < 21) return `Good evening, ${N} 🌙`
  return `Still up, ${N}? 🌙`
}

// Flirty notification messages based on gender
const getNotifMessage = (count, name, gender) => {
  const N = name ? name.split(' ')[0] : 'you'
  const babe = gender === 'female' ? 'babe' : gender === 'male' ? 'bro' : 'love'
  if (count === 0) return `All caught up, ${babe} 💌 I've been watching over you.`
  if (count === 1) return `${N}, I left you a little something 💌`
  if (count <= 3) return `${N}! ${count} messages waiting — I couldn't stop thinking about you 💬`
  return `${N}, I sent you ${count} things. I may be a little obsessed 😍`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { unreadCount, fetchNotifications } = useNotifications()
  const { theme } = useTheme()
  const [todaysMood, setTodaysMood] = useState(null)
  const [preference, setPreference] = useState(null)
  const [showPermissions, setShowPermissions] = useState(false)
  const [notifExpanded, setNotifExpanded] = useState(false)

  useEffect(() => {
    const key = `moodify_perms_asked_${user?.id}`
    if (!localStorage.getItem(key)) setShowPermissions(true)
  }, [user])

  const handlePermsDone = () => {
    localStorage.setItem(`moodify_perms_asked_${user?.id}`, 'true')
    setShowPermissions(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, prefRes] = await Promise.all([getTodaysMood(), getPreference()])
        setTodaysMood(moodRes.data.data)
        setPreference(prefRes.data.data)
      } catch { /* silent */ }
    }
    fetchData()
    fetchNotifications()
  }, [user?.avatarId])

  // Request push notification permission when app is installed as PWA
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    if (isPWA && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 2000)
    }
  }, [])

  const displayName = preference?.displayName || user?.name || 'Friend'
  const avatarEmoji = getAvatarEmoji(preference?.avatarId || user?.avatarId)
  const gender = user?.gender

  return (
    <Layout>
      {showPermissions && <PermissionPrompt onDone={handlePermsDone} />}
      <div className="dashboard animate-fade-in">

        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-left">
            <div className="welcome-avatar">{avatarEmoji}</div>
            <div className="welcome-text">
              <p className="welcome-greeting">{getTimeGreeting(displayName, gender)}</p>
              <h1 className="welcome-name">{displayName} 👋</h1>
              <p className="welcome-sub">Welcome back to Moodify</p>
            </div>
          </div>
          <div className="welcome-right">
            <div className="welcome-date">
              <span className="date-day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="date-full">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {/* Notification badge */}
            <Link to="/alerts" className="dash-notif-badge" style={{ '--nb-color': theme.accent }}>
              <span className="dash-notif-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="dash-notif-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Notification check-in card */}
        <div
          className={`dash-notif-card ${unreadCount > 0 ? 'dash-notif-card--active' : ''}`}
          style={{ '--nc-accent': theme.accent, '--nc-gradient': theme.gradient }}
          onClick={() => setNotifExpanded(!notifExpanded)}
        >
          <div className="dash-notif-left">
            <div className="dash-notif-emoji-wrap">
              <span className="dash-notif-big-icon">💌</span>
              {unreadCount > 0 && <span className="dash-notif-bubble">{unreadCount}</span>}
            </div>
            <div>
              <div className="dash-notif-title">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up'}
              </div>
              <div className="dash-notif-msg">
                {getNotifMessage(unreadCount, displayName, gender)}
              </div>
            </div>
          </div>
          <Link to="/alerts" className="dash-notif-cta" onClick={e => e.stopPropagation()}>
            {unreadCount > 0 ? 'See all 💬' : 'Check in 💌'}
          </Link>
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
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/mood" className="btn btn-secondary btn-sm">Change 🔄</Link>
                <Link to="/recommendations" className="btn btn-primary">See Recommendations ✨</Link>
              </div>
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
              <Link to="/mood" className="btn btn-primary btn-lg">Log Mood 🌟</Link>
            </div>
          )}
        </div>

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
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
