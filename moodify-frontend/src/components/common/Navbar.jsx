import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import NotificationPanel from '../notifications/NotificationPanel'
import './Navbar.css'

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/mood',      icon: '💭', label: 'Mood' },
  { path: '/recommendations', icon: '✨', label: 'For You' },
  { path: '/calendar',  icon: '📅', label: 'Calendar' },
  { path: '/analytics', icon: '📊', label: 'Insights' },
  { path: '/report',    icon: '📥', label: 'Report' },
  { path: '/profile',   icon: '👤', label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🎭</span>
          <span className="logo-text">Moodify</span>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button
            className="nav-item notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Alerts</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {NAV_ITEMS.slice(0, 5).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
        <button
          className={`mobile-nav-item ${showNotifications ? 'active' : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span className="mobile-nav-icon">🔔</span>
          {unreadCount > 0 && <span className="mobile-notif-badge">{unreadCount}</span>}
          <span className="mobile-nav-label">Alerts</span>
        </button>
      </nav>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  )
}
