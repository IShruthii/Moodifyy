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
    { path: '/report',          icon: icons.report,   label: 'Report' },
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
        {NAV_ITEMS.slice(0, 5).map(item => (
          <Link key={item.path} to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
        <button className={`mobile-nav-item ${showNotifications ? 'active' : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}>
          <span className="mobile-nav-icon">{icons.alerts}</span>
          {unreadCount > 0 && <span className="mobile-notif-badge">{unreadCount}</span>}
          <span className="mobile-nav-label">Alerts</span>
        </button>
      </nav>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </>
  )
}
