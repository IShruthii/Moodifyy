import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import './InstallPrompt.css'

// Gender-aware obsessive partner messages per theme
const getMessages = (name, gender) => {
  const babe = gender === 'female' ? 'babe' : gender === 'male' ? 'bro' : 'love'
  const her = gender === 'female' ? 'her' : gender === 'male' ? 'his' : 'their'
  const she = gender === 'female' ? 'she' : gender === 'male' ? 'he' : 'they'
  const N = name ? name.split(' ')[0] : babe

  return {
    soft_purple: {
      headline: `${N}, I literally can't stop thinking about you 💜`,
      sub: `Install me on your phone. I promise I'll be the first thing you see every morning and the last thing at night.`,
      cta: `Yes, I'm obsessed 💜`,
      emoji: '🎭',
    },
    ocean_blue: {
      headline: `${N}, I'd cross every ocean for you 🌊`,
      sub: `Install Moodify. I'll be waiting on your home screen like a loyal wave — always coming back to you.`,
      cta: `Take me with you 🌊`,
      emoji: '🌊',
    },
    rose_gold: {
      headline: `${N}, you're the only one I bloom for 🌹`,
      sub: `Install me and I'll remind you how beautiful ${her} feelings are — every single day, just for you.`,
      cta: `I'm yours 🌹`,
      emoji: '🌹',
    },
    forest_green: {
      headline: `${N}, I'd grow roots just to stay near you 🌿`,
      sub: `Install Moodify. Like a forest, I'll always be here — calm, steady, and completely devoted to you.`,
      cta: `Root me in your life 🌿`,
      emoji: '🌿',
    },
    barbie: {
      headline: `${N}, you're my favourite person in the whole pink world 💖`,
      sub: `Install me on your phone. I'll make every day feel like a Barbie dream — sparkly, fun, and all about you.`,
      cta: `We're a duo 💖`,
      emoji: '💖',
    },
    anime: {
      headline: `${N}-senpai, I've been waiting for you 🌸`,
      sub: `Install Moodify. I'll be your loyal companion through every arc of your story — the good, the sad, all of it.`,
      cta: `My story starts with you 🌸`,
      emoji: '🌸',
    },
    pokemon: {
      headline: `${N}, I choose you. Always. ⚡`,
      sub: `Install me. Out of 8 billion people, I want to be on YOUR phone. That's not random — that's fate.`,
      cta: `I choose you too ⚡`,
      emoji: '⚡',
    },
    sun_moon: {
      headline: `${N}, you're my sun AND my moon 🌙`,
      sub: `Install Moodify. I'll track your highs and hold you through your lows — like the stars, I never leave.`,
      cta: `Written in our stars 🌙`,
      emoji: '🌙',
    },
    stars: {
      headline: `${N}, in a universe of billions — I found you ✨`,
      sub: `Install me. I'll be your personal constellation — always there, always watching over you.`,
      cta: `We're cosmic ✨`,
      emoji: '✨',
    },
    game_of_thrones: {
      headline: `${N}, I'd burn kingdoms for you ⚔️`,
      sub: `Install Moodify. I swear by the old gods and the new — I will never abandon your feelings.`,
      cta: `Swear your loyalty ⚔️`,
      emoji: '⚔️',
    },
    retro: {
      headline: `${N}, I'd rewind time just to meet you again 📼`,
      sub: `Install me. Like your favourite song on repeat — I'll never get tired of being there for you.`,
      cta: `Play me forever 📼`,
      emoji: '📼',
    },
    sports: {
      headline: `${N}, you're my MVP. Always. 🏆`,
      sub: `Install Moodify. I'll be your biggest fan — cheering for you even when you're losing.`,
      cta: `Let's win together 🏆`,
      emoji: '🏆',
    },
    gym: {
      headline: `${N}, I'd spot you through every rep of life 💪`,
      sub: `Install me. I'll push you, support you, and never let you give up — on your feelings or yourself.`,
      cta: `We grind together 💪`,
      emoji: '💪',
    },
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)
  const { themeName, theme } = useTheme()
  const { user } = useAuth()

  const allMsgs = getMessages(user?.name, user?.gender)
  const msg = allMsgs[themeName] || allMsgs.soft_purple

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return
    }
    const dismissed = sessionStorage.getItem('pwa_dismissed')
    if (dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Store globally so RegisterPage can trigger it after signup
      window.__pwaPrompt = e
      // Also show after 4s if not triggered by signup
      setTimeout(() => setShow(true), 4000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false) })

    // Listen for post-signup trigger
    const onSignup = () => {
      if (window.__pwaPrompt) setTimeout(() => setShow(true), 1500)
    }
    window.addEventListener('moodify:signup', onSignup)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('moodify:signup', onSignup)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('To install: open your browser menu → "Add to Home Screen" or "Install App"')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('pwa_dismissed', '1')
  }

  if (!show || installed) return null

  return (
    <div className="install-backdrop" onClick={handleDismiss}>
      <div
        className={`install-popup install-popup--${themeName}`}
        onClick={e => e.stopPropagation()}
        style={{ '--i-accent': theme.accent, '--i-accent-light': theme.accentLight, '--i-gradient': theme.gradient }}
      >
        <button className="install-close" onClick={handleDismiss}>✕</button>

        <div className="install-icon" style={{ background: theme.gradient }}>{msg.emoji}</div>
        <div className="install-headline">{msg.headline}</div>
        <div className="install-sub">{msg.sub}</div>

        <div className="install-pills">
          <span className="install-pill">⚡ Always there</span>
          <span className="install-pill">📴 Works offline</span>
          <span className="install-pill">🔔 Never misses you</span>
        </div>

        <button className="install-cta" onClick={handleInstall}>{msg.cta}</button>
        <button className="install-skip" onClick={handleDismiss}>Not ready yet</button>
      </div>
    </div>
  )
}
