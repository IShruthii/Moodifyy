import React, { useEffect } from 'react'
import Layout from '../components/common/Layout'
import { useNotifications } from '../context/NotificationContext'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import './AlertsPage.css'

const TYPE_ICONS = {
  DAILY_REMINDER: '🌅',
  STREAK_REMINDER: '🔥',
  BADGE_EARNED:   '🏆',
  SUPPORT:        '💙',
}

const TYPE_LABELS = {
  DAILY_REMINDER: 'Daily Reminder',
  STREAK_REMINDER: 'Streak',
  BADGE_EARNED:   'Badge',
  SUPPORT:        'Support',
}

function groupByDate(notifications) {
  const groups = {}
  notifications.forEach(n => {
    const d = new Date(n.sentAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

export default function AlertsPage() {
  const { notifications, fetchNotifications, markRead } = useNotifications()

  useEffect(() => {
    // Fetch fresh notifications every time this page is opened
    fetchNotifications().then(() => {
      // Mark as read after fetching so unread count updates
      setTimeout(() => markRead(), 500)
    })
  }, [fetchNotifications])

  const grouped = groupByDate(notifications)

  return (
    <Layout>
      <div className="alerts-page animate-fade-in">
        <div className="alerts-header">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Your reminders and updates 💌</p>
        </div>

        {notifications.length === 0 ? (
          <div className="alerts-empty">
            <span className="alerts-empty-icon">🔔</span>
            <h3>You're all caught up!</h3>
            <p>Notifications will appear here when your companion has something to tell you 💜</p>
          </div>
        ) : (
          <div className="alerts-groups">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} className="alerts-group">
                <div className="alerts-group-label">{dateLabel}</div>
                <div className="alerts-list">
                  {items.map(n => (
                    <div
                      key={n.id}
                      className={`alert-item ${n.read ? 'alert-item--read' : 'alert-item--unread'}`}
                    >
                      <div className="alert-icon-wrap">
                        <span className="alert-icon">{TYPE_ICONS[n.type] || '💬'}</span>
                      </div>
                      <div className="alert-content">
                        <div className="alert-type-label">{TYPE_LABELS[n.type] || 'Message'}</div>
                        <p className="alert-message">{n.message}</p>
                        <span className="alert-time">
                          {new Date(n.sentAt).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {!n.read && <div className="alert-unread-dot" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
