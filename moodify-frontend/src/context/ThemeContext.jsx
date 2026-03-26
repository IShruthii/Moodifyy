import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const THEMES = {
  soft_purple: {
    name: 'Soft Purple',
    accent: '#7c3aed',
    accentLight: '#9d5cf5',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    bg: '#0f0a1e',
    bgSecondary: '#1a1035',
  },
  ocean_blue: {
    name: 'Ocean Blue',
    accent: '#3b82f6',
    accentLight: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
    bg: '#0a1628',
    bgSecondary: '#0f2040',
  },
  rose_gold: {
    name: 'Rose Gold',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
    bg: '#1a0a10',
    bgSecondary: '#2d1018',
  },
  forest_green: {
    name: 'Forest Green',
    accent: '#10b981',
    accentLight: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    bg: '#0a1a12',
    bgSecondary: '#0f2a1c',
  },
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    // initialise synchronously so first paint already has correct theme
    return localStorage.getItem('moodify_theme') || 'soft_purple'
  })
  const theme = THEMES[themeName] || THEMES.soft_purple

  // Apply CSS vars every time theme changes
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent-purple', theme.accent)
    root.style.setProperty('--accent-purple-light', theme.accentLight)
    root.style.setProperty('--gradient-main', theme.gradient)
    root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgSecondary} 100%)`)
    root.style.setProperty('--gradient-card', `linear-gradient(135deg, ${theme.accent}26 0%, ${theme.accentLight}1a 100%)`)
    root.style.setProperty('--border-glow', `${theme.accent}66`)
    root.style.setProperty('--shadow-glow', `0 0 30px ${theme.accent}4d`)
    root.style.setProperty('--bg-primary', theme.bg)
    root.style.setProperty('--bg-secondary', theme.bgSecondary)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.accent)
  }, [theme])

  const changeTheme = (name) => {
    if (THEMES[name]) {
      setThemeName(name)
      localStorage.setItem('moodify_theme', name)
    }
  }

  return (
    <ThemeContext.Provider value={{ themeName, theme, themes: THEMES, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
