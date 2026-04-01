// Moodify Service Worker
const CACHE = 'moodify-v1'

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})

// Handle push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  const title = data.title || 'Moodify 💌'
  const options = {
    body: data.body || "Hey, I've been thinking about you. Check in? 💜",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App 💜' },
      { action: 'dismiss', title: 'Later' },
    ],
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'dismiss') return
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else clients.openWindow(url)
    })
  )
})
