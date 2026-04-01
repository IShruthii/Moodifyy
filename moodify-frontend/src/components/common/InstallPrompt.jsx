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
      setTimeout(() => setShow(true), 4000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
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
