import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import './InstallPrompt.css'

// Flirty Zomato-style messages per theme
const THEME_MESSAGES = {
  soft_purple: {
    headline: "Hey, we miss you already 💜",
    sub: "Install Moodify and we'll slide into your home screen. No ghosting, promise.",
    cta: "Install & Vibe",
    emoji: "🎭",
    notifMsg: "Psst... your mood is calling. Pick up? 💜",
  },
  ocean_blue: {
    headline: "Don't let your mood drown 🌊",
    sub: "Install Moodify on your device. We'll keep you afloat even on the worst days.",
    cta: "Dive In",
    emoji: "🌊",
    notifMsg: "The ocean called. It said check your mood. 🌊",
  },
  rose_gold: {
    headline: "Your feelings deserve a glow-up 🌹",
    sub: "Install Moodify and carry your emotional garden everywhere you go.",
    cta: "Install & Bloom",
    emoji: "🌹",
    notifMsg: "Hey gorgeous, your mood diary misses you 🌹",
  },
  forest_green: {
    headline: "Touch grass. Then touch this button 🌿",
    sub: "Install Moodify and let nature heal your vibes — one mood log at a time.",
    cta: "Root Down",
    emoji: "🌿",
    notifMsg: "The forest whispered: log your mood today 🌿",
  },
  barbie: {
    headline: "Life in plastic? Not your feelings 💖",
    sub: "Install Moodify on your phone. It's pink, it's cute, and it actually gets you.",
    cta: "Come On Barbie!",
    emoji: "💖",
    notifMsg: "Hi Barbie! You haven't checked in today 💅",
  },
  anime: {
    headline: "Your main character arc starts here 🌸",
    sub: "Install Moodify. Every protagonist needs a mood journal. This is your origin story.",
    cta: "Begin Arc",
    emoji: "🌸",
    notifMsg: "Senpai noticed you haven't logged your mood 🌸",
  },
  pokemon: {
    headline: "Gotta catch all your feelings ⚡",
    sub: "Install Moodify and become the very best mood tracker — like no one ever was.",
    cta: "I Choose You!",
    emoji: "⚡",
    notifMsg: "A wild mood appeared! You haven't logged today ⚡",
  },
  sun_moon: {
    headline: "The stars aligned for this moment 🌙",
    sub: "Install Moodify. The universe literally wants you to track your feelings.",
    cta: "Written in Stars",
    emoji: "🌙",
    notifMsg: "The moon says: log your mood before midnight 🌙",
  },
  stars: {
    headline: "You're a star. Act like it ✨",
    sub: "Install Moodify and let your emotional galaxy expand. No telescope needed.",
    cta: "Launch App",
    emoji: "✨",
    notifMsg: "Houston, we have a problem — no mood logged today ✨",
  },
  game_of_thrones: {
    headline: "Winter is coming. So is your mood check ⚔️",
    sub: "Install Moodify. A Lannister always pays their emotional debts.",
    cta: "Claim the Throne",
    emoji: "⚔️",
    notifMsg: "The night is dark and full of unlogged moods ⚔️",
  },
  retro: {
    headline: "Rewind. Play. Feel. 📼",
    sub: "Install Moodify — like your favourite cassette, we never skip your feelings.",
    cta: "Press Play",
    emoji: "📼",
    notifMsg: "Your mood tape is blank today. Hit record 📼",
  },
  sports: {
    headline: "Champions track everything 🏆",
    sub: "Install Moodify. Your mental game is just as important as your physical one.",
    cta: "Get in the Game",
    emoji: "🏆",
    notifMsg: "Half-time check: how's your mood score today? 🏆",
  },
  gym: {
    headline: "No days off. Especially for feelings 💪",
    sub: "Install Moodify. Your emotional gains need tracking too, bro.",
    cta: "Let's Grind",
    emoji: "💪",
    notifMsg: "Skipping mood day? That's not the grind 💪",
  },
}

const DEFAULT_MSG = THEME_MESSAGES.soft_purple

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)
  const { themeName, theme } = useTheme()

  const msg = THEME_MESSAGES[themeName] || DEFAULT_MSG

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed as PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const dismissed = sessionStorage.getItem('pwa_dismissed')
    if (dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 4000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: show browser instructions
      alert('To install: open your browser menu → "Add to Home Screen" or "Install App"')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
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
        style={{
          '--i-accent': theme.accent,
          '--i-accent-light': theme.accentLight,
          '--i-gradient': theme.gradient,
        }}
      >
        <button className="install-close" onClick={handleDismiss} aria-label="Close">✕</button>

        {/* Animated icon */}
        <div className="install-icon" style={{ background: theme.gradient }}>
          {msg.emoji}
        </div>

        {/* Headline */}
        <div className="install-headline">{msg.headline}</div>
        <div className="install-sub">{msg.sub}</div>

        {/* Feature pills */}
        <div className="install-pills">
          <span className="install-pill">⚡ Instant access</span>
          <span className="install-pill">📴 Works offline</span>
          <span className="install-pill">🔔 Smart reminders</span>
        </div>

        {/* CTA */}
        <button className="install-cta" onClick={handleInstall}>
          {msg.cta}
        </button>
        <button className="install-skip" onClick={handleDismiss}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
