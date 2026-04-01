import React from 'react'
import Navbar from './Navbar'
import ThemeBackground from './ThemeBackground'
import { useTheme } from '../../context/ThemeContext'
import './Layout.css'

export default function Layout({ children }) {
  const { themeName } = useTheme()
  return (
    <div className="layout" data-theme={themeName}>
      <ThemeBackground />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
