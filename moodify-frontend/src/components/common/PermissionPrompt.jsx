import React, { useState } from 'react'
import './PermissionPrompt.css'

// Personality-aware test notification messages
// Only used when user has explicitly chosen a personality
const PERSONALITY_TEST_NOTIFS = {
  flirty: {
    title: 'Moodify 😏',
    body: "Hey you… I've been waiting. Come tell me how you're feeling? 💜",
  },
  friendly: {
    title: 'Moodify 🤗',
    body: "Yay, notifications are on! I'll check in on you throughout the day 🙌",
  },
  sassy: {
    title: 'Moodify 💅',
    body: "Okay so notifications are on. Don't ignore me. I will notice. 👀",
  },
  calm: {
    title: 'Moodify 🌿',
    body: "Notifications are on. I'll reach out gently when you need a moment. 🍃",
  },
  motivational: {
    title: 'Moodify 🔥',
    body: "LET'S GO! Notifications are live. I'll keep you accountable. You've got this! 💪",
  },
  therapist: {
    title: 'Moodify 💙',
    body: "Notifications are on. I'll check in on you — no pressure, just care. 💙",
  },
  funny: {
    title: 'Moodify 😂',
    body: "Notifications: activated. You can't escape me now. (Just kidding… mostly.) 😂",
  },
}

// Default neutral tone — used when no personality is selected
const DEFAULT_TEST_NOTIF = {
  title: 'Moodify 💜',
  body: "Notifications are on! I'll remind you to check in throughout the day.",
}

function getTestNotif(personality) {
  if (!personality) return DEFAULT_TEST_NOTIF
  return PERSONALITY_TEST_NOTIFS[personality] || DEFAULT_TEST_NOTIF
}

export default function PermissionPrompt({ onDone }) {
  const [step, setStep] = useState('idle')
  const [notifStatus, setNotifStatus] = useState(null)
  const [locationStatus, setLocationStatus] = useState(null)

  // Read personality from localStorage — only if user explicitly set it
  const personality = localStorage.getItem('moodify_bot_personality') || null

  const fireTestNotification = () => {
    if (Notification.permission !== 'granted') return
    const notif = getTestNotif(personality)
    try {
      new Notification(notif.title, {
        body: notif.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
      })
    } catch {
      // Some browsers block Notification constructor — SW will handle it
      navigator.serviceWorker?.ready.then(reg => {
        reg.showNotification(notif.title, {
          body: notif.body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [200, 100, 200],
          data: { url: '/' },
        })
      })
    }
  }

  const requestNotification = async () => {
    setStep('notif')
    if (!('Notification' in window)) {
      setNotifStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') {
      setNotifStatus('granted')
      fireTestNotification()
      return
    }
    const result = await Notification.requestPermission()
    setNotifStatus(result)
    if (result === 'granted') {
      // Small delay so the permission dialog closes first
      setTimeout(fireTestNotification, 800)
    }
  }

  const requestLocation = () => {
    setStep('location')
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('granted'),
      () => setLocationStatus('denied')
    )
  }

  const handleNotifAction = async () => {
    await requestNotification()
    setStep('location')
  }

  const handleLocationAction = () => {
    requestLocation()
    setTimeout(() => setStep('done'), 1200)
  }

  const handleSkipNotif = () => {
    setNotifStatus('denied')
    setStep('location')
  }

  const handleSkipLocation = () => {
    setLocationStatus('denied')
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="perm-overlay">
        <div className="perm-card perm-done animate-fade-in">
          <span className="perm-done-icon">🎉</span>
          <h2 className="perm-done-title">You're all set!</h2>
          <p className="perm-done-sub">Moodify is ready to be your companion.</p>
          <button className="btn btn-primary btn-lg perm-cta" onClick={onDone}>
            Let's go 🌟
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="perm-overlay">
      <div className="perm-card animate-fade-in">

        <div className="perm-dots">
          <div className={`perm-dot ${step !== 'idle' ? 'active' : ''}`} />
          <div className={`perm-dot ${step === 'location' || step === 'done' ? 'active' : ''}`} />
        </div>

        {(step === 'idle' || step === 'notif') && (
          <div className="perm-step animate-fade-in">
            <div className="perm-icon-wrap notif-icon">
              <span className="perm-big-icon">🔔</span>
            </div>
            <h2 className="perm-title">Stay in the loop</h2>
            <p className="perm-desc">
              Moodify would love to send you gentle daily check-in reminders and
              little nudges when you need them most. We promise — no spam, ever.
            </p>
            <div className="perm-benefits">
              <span className="perm-benefit">✨ Daily mood reminders</span>
              <span className="perm-benefit">🔥 Streak alerts</span>
              <span className="perm-benefit">💙 Supportive messages</span>
            </div>
            <button className="btn btn-primary btn-lg perm-cta" onClick={handleNotifAction}>
              Yes, turn on notifications
            </button>
            <button className="perm-skip" onClick={handleSkipNotif}>
              Maybe later
            </button>
          </div>
        )}

        {step === 'location' && (
          <div className="perm-step animate-fade-in">
            <div className="perm-icon-wrap location-icon">
              <span className="perm-big-icon">📍</span>
            </div>
            <h2 className="perm-title">Find places near you</h2>
            <p className="perm-desc">
              When you're feeling low, Moodify can suggest cozy cafés, peaceful
              parks, and great restaurants nearby — just for you. Your location
              is never stored or shared.
            </p>
            <div className="perm-benefits">
              <span className="perm-benefit">☕ Nearby cafés & parks</span>
              <span className="perm-benefit">🍽️ Food recommendations</span>
              <span className="perm-benefit">🔒 Never stored or shared</span>
            </div>
            <button className="btn btn-primary btn-lg perm-cta" onClick={handleLocationAction}>
              Yes, use my location
            </button>
            <button className="perm-skip" onClick={handleSkipLocation}>
              Skip for now
            </button>
          </div>
        )}

      </div>
    </div>
  )
}