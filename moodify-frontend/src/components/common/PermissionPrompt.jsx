import React, { useState } from 'react'
import './PermissionPrompt.css'

export default function PermissionPrompt({ onDone }) {
  const [step, setStep] = useState('idle') // idle | notif | location | done
  const [notifStatus, setNotifStatus] = useState(null)
  const [locationStatus, setLocationStatus] = useState(null)

  const requestNotification = async () => {
    setStep('notif')
    if (!('Notification' in window)) {
      setNotifStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') {
      setNotifStatus('granted')
      return
    }
    const result = await Notification.requestPermission()
    setNotifStatus(result)
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

        {/* Progress dots */}
        <div className="perm-dots">
          <div className={`perm-dot ${step !== 'idle' ? 'active' : ''}`} />
          <div className={`perm-dot ${step === 'location' || step === 'done' ? 'active' : ''}`} />
        </div>

        {/* Notification step */}
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

        {/* Location step */}
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
