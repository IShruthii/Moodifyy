// Moodify Service Worker
const CACHE = 'moodify-v1'

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  if (!e.request.url.startsWith('http')) return
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(r => r || new Response('Offline', { status: 503 }))
    })
  )
})

// ── Scheduled notification pool ──────────────────────────────────────────────
const NOTIF_POOL = [
  { title: 'Moodify 💜', body: "Hey, how are you feeling right now? Come do a quick mood check." },
  { title: 'Moodify 💧', body: "Hydration check, love. Go drink some water for me." },
  { title: 'Moodify 🌿', body: "You've been busy. Take a tiny break, okay? I miss you." },
  { title: 'Moodify 💌', body: "Missing you here… open the app and tell me your mood." },
  { title: 'Moodify 🍽️', body: "Food check. Have you eaten, or am I going to complain?" },
  { title: 'Moodify 🎵', body: "A little music might help your mood right now. Come, I picked something for you." },
  { title: 'Moodify ✨', body: "Just checking in on you. How's your heart doing today?" },
  { title: 'Moodify 🌙', body: "Hey you. Don't forget to breathe. I'm always here." },
  { title: 'Moodify 💪', body: "You're doing amazing. Come log your mood and let me celebrate you." },
  { title: 'Moodify 🌸', body: "Soft reminder: you matter. Come talk to me for a bit." },
]

let notifIndex = 0
function getNextNotif() {
  const n = NOTIF_POOL[notifIndex % NOTIF_POOL.length]
  notifIndex++
  return n
}

// Schedule: 9am, 12pm, 3pm, 6pm, 9pm
const SCHEDULE_HOURS = [9, 12, 15, 18, 21]

function msUntilNext() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const currentMins = h * 60 + m

  for (const hour of SCHEDULE_HOURS) {
    const targetMins = hour * 60
    if (targetMins > currentMins) {
      return (targetMins - currentMins) * 60 * 1000 - s * 1000
    }
  }
  // Next day 9am
  const minsUntilMidnight = (24 * 60) - currentMins
  const minsFrom9am = SCHEDULE_HOURS[0] * 60
  return (minsUntilMidnight + minsFrom9am) * 60 * 1000 - s * 1000
}

function scheduleNext() {
  const delay = msUntilNext()
  setTimeout(() => {
    const now = new Date()
    const h = now.getHours()
    // Only show during daytime (9am - 9pm)
    if (h >= 9 && h <= 21) {
      const n = getNextNotif()
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data: { url: '/' },
        tag: 'moodify-scheduled',
        renotify: true,
      })
    }
    scheduleNext()
  }, delay)
}

// Start scheduling when SW activates
self.addEventListener('activate', () => {
  scheduleNext()
})

// Handle push notifications from server
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || 'Moodify 💜'
  const options = {
    body: data.body || "Hey, I've been thinking about you. Check in? 💜",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else clients.openWindow(url)
    })
  )
})
