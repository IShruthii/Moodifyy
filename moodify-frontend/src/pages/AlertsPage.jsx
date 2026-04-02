import React, { useEffect } from 'react'
import Layout from '../components/common/Layout'
import { useNotifications } from '../context/NotificationContext'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'

const TYPE_ICONS = {
  DAILY_REMINDER: '🌅',
  STREAK_REMINDER: '🔥',
  BADGE_EARNED: '🏆',
  SUPPORT: '💙',
}

export default function AlertsPage() {
  const { notifications, fetchNotifications, markRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
    markRead()
  }, [])

  return (
    <Layout>
      <div className="analytics-page animate-fade-in">
        <div className="analytics-header">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Your reminders and updates from Moo 💌</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
          {notifications.length === 0 ? (
            <div className="badges-empty">
              <span>🔔</span>
              <p>You're all caught up!</p>
              <p className="badges-hint">Notifications will appear here when Moo has something to tell you 💜</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="card" style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                opacity: n.read ? 0.7 : 1,
                borderLeft: n.read ? undefined : '3px solid var(--accent-purple)',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '💬'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5 }}>{n.message}</p>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {new Date(n.sentAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
