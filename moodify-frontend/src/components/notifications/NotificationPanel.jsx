import React, { useEffect } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import './NotificationPanel.css'

const TYPE_ICONS = {
  DAILY_REMINDER: '🌅',
  STREAK_REMINDER: '🔥',
  BADGE_EARNED: '🏆',
  SUPPORT: '💙',
}

export default function NotificationPanel({ onClose }) {
  const { notifications, fetchNotifications, markRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
    markRead()
  }, [])

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-header">
          <h3>Notifications</h3>
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>

        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                <span className="notif-icon">{TYPE_ICONS[n.type] || '💬'}</span>
                <div className="notif-content">
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">
                    {new Date(n.sentAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                {!n.read && <div className="notif-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
