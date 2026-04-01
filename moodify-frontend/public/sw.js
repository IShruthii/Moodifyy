// Moodify Service Worker
const CACHE = 'moodify-v1'

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  // Only handle http/https requests
  if (!e.request.url.startsWith('http')) return
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(r => r || new Response('Offline', { status: 503 }))
    })
  )
})

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || 'Moodify'
  const options = {
    body: data.body || "Hey, I've been thinking about you 💜",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

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
