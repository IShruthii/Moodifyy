import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const THEMES = {
  soft_purple: {
    name: 'Soft Purple',
    emoji: '💜',
    accent: '#7c3aed',
    accentLight: '#9d5cf5',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    bg: '#0f0a1e',
    bgSecondary: '#1a1035',
  },
  ocean_blue: {
    name: 'Ocean Blue',
    emoji: '🌊',
    accent: '#3b82f6',
    accentLight: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
    bg: '#0a1628',
    bgSecondary: '#0f2040',
  },
  rose_gold: {
    name: 'Rose Gold',
    emoji: '🌹',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
    bg: '#1a0a10',
    bgSecondary: '#2d1018',
  },
  forest_green: {
    name: 'Forest Green',
    emoji: '🌿',
    accent: '#10b981',
    accentLight: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    bg: '#0a1a12',
    bgSecondary: '#0f2a1c',
  },
  barbie: {
    name: 'Barbie',
    emoji: '👛',
    accent: '#ff1f8e',
    accentLight: '#ff6eb4',
    gradient: 'linear-gradient(135deg, #ff1f8e 0%, #ff9de2 100%)',
    bg: '#1a0010',
    bgSecondary: '#2d0020',
  },
  anime: {
    name: 'Anime',
    emoji: '🌸',
    accent: '#e879f9',
    accentLight: '#f0abfc',
    gradient: 'linear-gradient(135deg, #e879f9 0%, #38bdf8 100%)',
    bg: '#0d0a1a',
    bgSecondary: '#1a1030',
  },
  pokemon: {
    name: 'Pokémon',
    emoji: '⚡',
    accent: '#facc15',
    accentLight: '#fde047',
    gradient: 'linear-gradient(135deg, #facc15 0%, #ef4444 100%)',
    bg: '#0f0a00',
    bgSecondary: '#1a1200',
  },
  sun_moon: {
    name: 'Sun & Moon',
    emoji: '🌙',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #f59e0b 50%, #7c3aed 100%)',
    bg: '#07050f',
    bgSecondary: '#0f0a1e',
  },
  stars: {
    name: 'Stars',
    emoji: '✨',
    accent: '#a5b4fc',
    accentLight: '#c7d2fe',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #a5b4fc 100%)',
    bg: '#030712',
    bgSecondary: '#0f0a1e',
  },
  game_of_thrones: {
    name: 'Game of Thrones',
    emoji: '⚔️',
    accent: '#b45309',
    accentLight: '#d97706',
    gradient: 'linear-gradient(135deg, #1c1917 0%, #b45309 50%, #78350f 100%)',
    bg: '#0c0a09',
    bgSecondary: '#1c1917',
  },
  retro: {
    name: 'Retro',
    emoji: '📼',
    accent: '#f97316',
    accentLight: '#fb923c',
    gradient: 'linear-gradient(135deg, #78350f 0%, #f97316 50%, #fbbf24 100%)',
    bg: '#1c1008',
    bgSecondary: '#2d1a08',
  },
  sports: {
    name: 'Sports',
    emoji: '🏟️',
    accent: '#22c55e',
    accentLight: '#4ade80',
    gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
    bg: '#021a0a',
    bgSecondary: '#042d12',
  },
  gym: {
    name: 'Gym',
    emoji: '💪',
    accent: '#ef4444',
    accentLight: '#f87171',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 50%, #f97316 100%)',
    bg: '#0a0a0a',
    bgSecondary: '#1a1a1a',
  },
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('moodify_theme') || 'soft_purple'
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('moodify_dark_mode')
    return saved === null ? true : saved === 'true'
  })
  const theme = THEMES[themeName] || THEMES.soft_purple

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent-purple', theme.accent)
    root.style.setProperty('--accent-purple-light', theme.accentLight)
    root.style.setProperty('--gradient-main', theme.gradient)
    root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgSecondary} 100%)`)
    root.style.setProperty('--gradient-card', `linear-gradient(135deg, ${theme.accent}26 0%, ${theme.accentLight}1a 100%)`)
    root.style.setProperty('--border-glow', `${theme.accent}66`)
    root.style.setProperty('--shadow-glow', `0 0 30px ${theme.accent}4d`)
    root.style.setProperty('--bg-primary', darkMode ? theme.bg : '#f8f5ff')
    root.style.setProperty('--bg-secondary', darkMode ? theme.bgSecondary : '#ffffff')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.accent)
    document.body.setAttribute('data-theme', themeName)
    document.body.setAttribute('data-mode', darkMode ? 'dark' : 'light')
  }, [theme, themeName, darkMode])

  const changeTheme = (name) => {
    if (THEMES[name]) { setThemeName(name); localStorage.setItem('moodify_theme', name) }
  }
  const toggleDarkMode = (val) => {
    const next = val !== undefined ? val : !darkMode
    setDarkMode(next)
    localStorage.setItem('moodify_dark_mode', String(next))
  }

  return (
    <ThemeContext.Provider value={{ themeName, theme, themes: THEMES, changeTheme, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
