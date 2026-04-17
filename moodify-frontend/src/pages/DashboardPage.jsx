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
import { getAnalytics } from '../api/analyticsApi'
import { getAvatarEmoji } from '../components/profile/AvatarPicker'
import {
  getPersonality,
  getWelcomeSub,
  getNotifCardMessage,
  getMoodPromptText,
  getMoodLoggedLabel,
} from '../utils/personality'
import './DashboardPage.css'

function getTimeGreeting(name, personality) {
  const h = new Date().getHours()
  const N = name ? name.split(' ')[0] : 'there'
  const greetings = {
    flirty: [
      `Good morning, ${N} ☀️`,
      `Hey ${N}, good afternoon 💛`,
      `Good evening, ${N} 🌙`,
      `Still up, ${N}? 🌙`,
    ],
    friendly: [
      `Good morning, ${N}! ☀️`,
      `Hey ${N}! Good afternoon 😊`,
      `Good evening, ${N} 🌙`,
      `Hey ${N}, still up? 🌙`,
    ],
    sassy: [
      `Morning, ${N}. Let's see what today brings 💅`,
      `Afternoon, ${N}. Hope it's going better than yesterday 👀`,
      `Evening, ${N}. You made it through the day 💅`,
      `${N}, it's late. Go to sleep 😂`,
    ],
    calm: [
      `Good morning, ${N} 🌸`,
      `Good afternoon, ${N} 🌿`,
      `Good evening, ${N} 🌙`,
      `Still awake, ${N}? Rest when you can 🌿`,
    ],
    motivational: [
      `Rise and shine, ${N}! 🔥`,
      `Keep going, ${N}! 💪`,
      `Evening grind, ${N}! 🔥`,
      `Late night hustle, ${N}? 💪`,
    ],
    therapist: [
      `Good morning, ${N} 💙`,
      `Good afternoon, ${N} 💙`,
      `Good evening, ${N} 💙`,
      `Still up, ${N}? How are you feeling? 💙`,
    ],
    funny: [
      `Good morning, ${N}! (Or is it? 😂)`,
      `Afternoon, ${N}! Half the day's gone 😂`,
      `Evening, ${N}! You survived another day 😂`,
      `${N}, it's late. Your future self will judge you 😂`,
    ],
  }
  const idx = h < 12 ? 0 : h < 17 ? 1 : h < 21 ? 2 : 3
  return (greetings[personality] || greetings.friendly)[idx]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { unreadCount, fetchNotifications } = useNotifications()
  const { theme } = useTheme()
  const [todaysMood, setTodaysMood] = useState(null)
  const [preference, setPreference] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)

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
        const [moodRes, prefRes, analyticsRes] = await Promise.all([
          getTodaysMood(),
          getPreference(),
          getAnalytics(),
        ])
        setTodaysMood(moodRes.data.data)
        const pref = prefRes.data.data
        setPreference(pref)
        setAnalytics(analyticsRes.data.data)
        // Sync personality to localStorage from DB
        if (pref?.botPersonality) localStorage.setItem('moodify_bot_personality', pref.botPersonality)
        if (pref?.botName) localStorage.setItem('moodify_bot_name', pref.botName)
      } catch {
        // 401 handled by axios interceptor
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
    fetchNotifications().catch(() => {})
  }, [user?.id])

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    if (isPWA && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 3000)
    }
  }, [])

  const displayName = preference?.displayName || user?.name || 'Friend'
  const avatarEmoji = getAvatarEmoji(preference?.avatarId || user?.avatarId, user?.gender)
  const streak = analytics?.currentStreak || 0
  const totalEntries = analytics?.totalEntries || 0
  const positiveRatio = analytics?.positiveRatio || 0

  // Personality-aware copy
  const personality = preference?.botPersonality || getPersonality()
  const welcomeSub = getWelcomeSub(personality)
  const notifMsg = getNotifCardMessage(unreadCount, displayName, personality)
  const moodPrompt = getMoodPromptText(personality)
  const moodLoggedLabel = getMoodLoggedLabel(personality)

  return (
    <Layout>
      {showPermissions && <PermissionPrompt onDone={handlePermsDone} />}
      <div className="dashboard animate-fade-in">

        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-left">
            <div className="welcome-avatar">{avatarEmoji}</div>
            <div className="welcome-text">
              <p className="welcome-greeting">{getTimeGreeting(displayName, personality)}</p>
              <h1 className="welcome-name">{displayName} 👋</h1>
              <p className="welcome-sub">{welcomeSub}</p>
            </div>
          </div>
          <div className="welcome-right">
            <div className="welcome-date">
              <span className="date-day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="date-full">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <Link to="/alerts" className="dash-notif-badge" style={{ '--nb-color': theme.accent }}>
              <span className="dash-notif-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="dash-notif-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="dash-stats-row">
          {dataLoading ? (
            <>
              <div className="skeleton" style={{ height: 72, borderRadius: 16, flex: 1 }} />
              <div className="skeleton" style={{ height: 72, borderRadius: 16, flex: 1 }} />
              <div className="skeleton" style={{ height: 72, borderRadius: 16, flex: 1 }} />
            </>
          ) : (
            <>
              <div className="dash-stat-pill">
                <span className="dash-stat-icon">🔥</span>
                <div>
                  <span className="dash-stat-value">{streak}</span>
                  <span className="dash-stat-label">day streak</span>
                </div>
              </div>
              <div className="dash-stat-pill">
                <span className="dash-stat-icon">📊</span>
                <div>
                  <span className="dash-stat-value">{totalEntries}</span>
                  <span className="dash-stat-label">check-ins</span>
                </div>
              </div>
              <div className="dash-stat-pill">
                <span className="dash-stat-icon">✨</span>
                <div>
                  <span className="dash-stat-value">{positiveRatio}%</span>
                  <span className="dash-stat-label">positive days</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notification check-in card */}
        <div
          className={`dash-notif-card ${unreadCount > 0 ? 'dash-notif-card--active' : ''}`}
          style={{ '--nc-accent': theme.accent, '--nc-gradient': theme.gradient }}
        >
          <div className="dash-notif-left">
            <div className="dash-notif-emoji-wrap">
              <span className="dash-notif-big-icon">💌</span>
              {unreadCount > 0 && <span className="dash-notif-bubble">{unreadCount}</span>}
            </div>
            <div>
              <div className="dash-notif-title">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up"}
              </div>
              <div className="dash-notif-msg">{notifMsg}</div>
            </div>
          </div>
          <Link to="/alerts" className="dash-notif-cta">
            {unreadCount > 0 ? 'See all 💬' : 'Check in 💌'}
          </Link>
        </div>

        {/* Today's Mood Card */}
        {dataLoading ? (
          <div className="skeleton" style={{ height: 100, borderRadius: 20 }} />
        ) : (
          <div className="dashboard-mood-card">
            {todaysMood ? (
              <div className="mood-logged">
                <div className="mood-logged-left">
                  <span className="mood-logged-emoji">{todaysMood.moodEmoji}</span>
                  <div>
                    <p className="mood-logged-label">{moodLoggedLabel}</p>
                    <h3 className="mood-logged-name">{todaysMood.mood}</h3>
                    {todaysMood.note && <p className="mood-logged-note">"{todaysMood.note}"</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to="/mood" className="btn btn-secondary btn-sm">Change 🔄</Link>
                  <Link to="/recommendations" className="btn btn-primary">For You ✨</Link>
                </div>
              </div>
            ) : (
              <div className="mood-prompt">
                <div className="mood-prompt-left">
                  <span className="mood-prompt-icon">💭</span>
                  <div>
                    <h3 className="mood-prompt-title">{moodPrompt.title}</h3>
                    <p className="mood-prompt-sub">{moodPrompt.sub}</p>
                  </div>
                </div>
                <Link to="/mood" className="btn btn-primary btn-lg">Log Mood 🌟</Link>
              </div>
            )}
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

      </div>
      <ChatbotFAB />
    </Layout>
  )
}
