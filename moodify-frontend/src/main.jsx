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
        // Request notification permission after SW is ready
        if ('Notification' in window && Notification.permission === 'default') {
          // Small delay so it doesn't fire immediately on page load
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
