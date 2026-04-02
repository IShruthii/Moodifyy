import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for push notifications and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[SW] Registered:', reg.scope)

        // Send current personality to SW so scheduled notifications use the right tone
        const personality = localStorage.getItem('moodify_bot_personality')
        if (personality && reg.active) {
          reg.active.postMessage({ type: 'SET_PERSONALITY', personality })
        }

        // Request notification permission after SW is ready (5s delay)
        if ('Notification' in window && Notification.permission === 'default') {
          setTimeout(() => {
            Notification.requestPermission().then(perm => {
              console.log('[Notifications] Permission:', perm)
            })
          }, 5000)
        }
      })
      .catch(err => console.warn('[SW] Registration failed:', err))
  })
}
