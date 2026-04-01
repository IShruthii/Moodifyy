import React from 'react'
import Navbar from './Navbar'
import ThemeBackground from './ThemeBackground'
import { useTheme } from '../../context/ThemeContext'
import './Layout.css'

function MobilePCBanner() {
  const [show, setShow] = React.useState(() => !sessionStorage.getItem('pc_banner_dismissed'))
  if (!show) return null
  return (
    <div className="mobile-pc-banner">
      <span>🖥️ For the best experience with animations & themes, open on a PC!</span>
      <button onClick={() => { setShow(false); sessionStorage.setItem('pc_banner_dismissed', '1') }}>✕</button>
    </div>
  )
}

export default function Layout({ children }) {
  const { themeName } = useTheme()
  return (
    <div className="layout" data-theme={themeName}>
      <ThemeBackground />
      <MobilePCBanner />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
