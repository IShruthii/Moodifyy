import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import NotificationPanel from '../notifications/NotificationPanel'
import './Navbar.css'

const THEME_ICONS = {
  soft_purple: {
    home: '🏠', mood: '💭', foryou: '✨', calendar: '📅',
    insights: '📊', report: '📥', profile: '👤', alerts: '🔔', logout: '🚪', logo: '🎭',
  },
  ocean_blue: {
    home: '🏖️', mood: '🌊', foryou: '🐠', calendar: '⚓',
    insights: '🔭', report: '📋', profile: '🧜', alerts: '🔔', logout: '⛵', logo: '🌊',
  },
  rose_gold: {
    home: '🏡', mood: '💖', foryou: '🌹', calendar: '💍',
    insights: '💎', report: '📜', profile: '👑', alerts: '🔔', logout: '🚪', logo: '🌹',
  },
  forest_green: {
    home: '🌲', mood: '🍃', foryou: '🦋', calendar: '🌿',
    insights: '🌱', report: '📋', profile: '🦌', alerts: '🔔', logout: '🚶', logo: '🌿',
  },
  barbie: {
    home: '🏠', mood: '💗', foryou: '👛', calendar: '🎀',
    insights: '💅', report: '📋', profile: '👸', alerts: '🔔', logout: '🚪', logo: '💖',
  },
  anime: {
    home: '⛩️', mood: '🌸', foryou: '⚡', calendar: '🎋',
    insights: '🗡️', report: '📜', profile: '🦊', alerts: '🔔', logout: '🚪', logo: '🌸',
  },
  pokemon: {
    home: '🏠', mood: '⚡', foryou: '🎯', calendar: '📅',
    insights: '🏆', report: '📋', profile: '🎮', alerts: '🔔', logout: '🚪', logo: '⚡',
  },
  sun_moon: {
    home: '🌙', mood: '✨', foryou: '🌟', calendar: '🌠',
    insights: '🔮', report: '📜', profile: '🌛', alerts: '🔔', logout: '🚪', logo: '🌙',
  },
  stars: {
    home: '🪐', mood: '💫', foryou: '🌟', calendar: '🌌',
    insights: '🔭', report: '📋', profile: '👨‍🚀', alerts: '🔔', logout: '🚀', logo: '✨',
  },
  game_of_thrones: {
    home: '🏰', mood: '⚔️', foryou: '🐉', calendar: '🗡️',
    insights: '👑', report: '📜', profile: '🛡️', alerts: '🔔', logout: '🚪', logo: '⚔️',
  },
  retro: {
    home: '📺', mood: '🎵', foryou: '📼', calendar: '📅',
    insights: '📊', report: '📋', profile: '🎙️', alerts: '📻', logout: '🚪', logo: '📼',
  },
  sports: {
    home: '🏟️', mood: '⚽', foryou: '🏆', calendar: '📅',
    insights: '📈', report: '📋', profile: '🥇', alerts: '📣', logout: '🚪', logo: '🏟️',
  },
  gym: {
    home: '🏋️', mood: '💪', foryou: '🔥', calendar: '📅',
    insights: '📊', report: '📋', profile: '🥊', alerts: '🔔', logout: '🚪', logo: '💪',
  },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { themeName } = useTheme()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const icons = THEME_ICONS[themeName] || THEME_ICONS.soft_purple

  const NAV_ITEMS = [
    { path: '/dashboard',       icon: icons.home,     label: 'Home' },
    { path: '/mood',            icon: icons.mood,     label: 'Mood' },
    { path: '/recommendations', icon: icons.foryou,   label: 'For You' },
    { path: '/calendar',        icon: icons.calendar, label: 'Calendar' },
    { path: '/analytics',       icon: icons.insights, label: 'Insights' },
    { path: '/profile',         icon: icons.profile,  label: 'Profile' },
  ]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">{icons.logo}</span>
          <span className="logo-text">Moodify</span>
        </div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <span className="nav-icon">{icons.alerts}</span>
            <span className="nav-label">Alerts</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">{icons.logout}</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>

      <nav className="mobile-nav">
        {NAV_ITEMS.slice(0, 4).map(item => (
          <Link key={item.path} to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
        {/* Profile */}
        <Link to="/profile"
          className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <span className="mobile-nav-icon">{icons.profile}</span>
          <span className="mobile-nav-label">Profile</span>
        </Link>
        {/* More drawer trigger */}
        <button className={`mobile-nav-item ${showNotifications ? 'active' : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}>
          <span className="mobile-nav-icon">⋯</span>
          <span className="mobile-nav-label">More</span>
          {unreadCount > 0 && <span className="mobile-notif-badge">{unreadCount}</span>}
        </button>
      </nav>

      {/* Mobile More Drawer */}
      {showNotifications && (
        <div className="mobile-more-overlay" onClick={() => setShowNotifications(false)}>
          <div className="mobile-more-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-more-handle" />
            <div className="mobile-more-grid">
              <Link to="/analytics" className="mobile-more-item" onClick={() => setShowNotifications(false)}>
                <span>{icons.insights}</span><span>Insights</span>
              </Link>
              <button className="mobile-more-item" onClick={() => { setShowNotifications(false); navigate('/alerts') }}>
                <span style={{position:'relative'}}>
                  {icons.alerts}
                  {unreadCount > 0 && <span className="mobile-notif-badge" style={{top:-6,right:-8}}>{unreadCount}</span>}
                </span>
                <span>Alerts</span>
              </button>
              <button className="mobile-more-item mobile-more-logout" onClick={() => { setShowNotifications(false); handleLogout() }}>
                <span>{icons.logout}</span><span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
