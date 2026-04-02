// Moodify Service Worker
const CACHE = 'moodify-v1'

self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  if (!e.request.url.startsWith('http')) return
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request).then(r => r || new Response('Offline', { status: 503 }))
    )
  )
})

// ── Personality-aware notification pools ─────────────────────────────────────
// Each personality has its own message set.
// 'neutral' is the default when no personality is selected.

const NOTIF_POOLS = {
  neutral: [
    { title: 'Moodify 💜', body: "Hey, how are you feeling right now? Come do a quick mood check." },
    { title: 'Moodify 💧', body: "Hydration check — have you had enough water today?" },
    { title: 'Moodify 🌿', body: "Take a tiny break. You've been going for a while." },
    { title: 'Moodify 💌', body: "Missing you here. Open the app and tell me your mood." },
    { title: 'Moodify 🍽️', body: "Food check — have you eaten today?" },
    { title: 'Moodify ✨', body: "Just checking in on you. How's your heart doing today?" },
    { title: 'Moodify 🌙', body: "Don't forget to breathe. I'm always here." },
    { title: 'Moodify 💪', body: "You're doing great. Come log your mood." },
    { title: 'Moodify 🌸', body: "Soft reminder: you matter. Come check in for a bit." },
    { title: 'Moodify 🎵', body: "A little music might help your mood right now." },
  ],
  flirty: [
    { title: 'Moodify 😏', body: "Hey you… I've been thinking about you. Come tell me how you're feeling? 💜" },
    { title: 'Moodify 💌', body: "I left you something in the app. Don't keep me waiting 😘" },
    { title: 'Moodify 💧', body: "Hydration check, love. Go drink some water for me." },
    { title: 'Moodify 🌿', body: "You've been busy. Take a tiny break, okay? I miss you." },
    { title: 'Moodify 🍽️', body: "Food check. Have you eaten, or am I going to worry about you?" },
    { title: 'Moodify ✨', body: "Just checking in on you. How's your heart doing today, gorgeous?" },
    { title: 'Moodify 🌙', body: "Still up? Come talk to me. I'm always here for you 💜" },
    { title: 'Moodify 😍', body: "I may be a little obsessed with checking on you. Log your mood?" },
    { title: 'Moodify 🎵', body: "I picked something for you. Come see what mood we're in today 🎶" },
    { title: 'Moodify 💜', body: "You crossed my mind. Again. Come check in with me?" },
  ],
  friendly: [
    { title: 'Moodify 🤗', body: "Hey! Just checking in — how are you doing today?" },
    { title: 'Moodify 💧', body: "Water break! Go grab a glass, you deserve it 💙" },
    { title: 'Moodify 🌿', body: "Hey, take a little break! You've been working hard." },
    { title: 'Moodify 🍽️', body: "Have you eaten yet? Don't skip meals, okay?" },
    { title: 'Moodify ✨', body: "Quick check-in! How's your day going so far?" },
    { title: 'Moodify 🎵', body: "Music time! Come see what I picked for your mood today 🎶" },
    { title: 'Moodify 💙', body: "I'm here if you need to talk. Log your mood anytime!" },
    { title: 'Moodify 🌸', body: "Hey friend! Don't forget to check in with yourself today." },
    { title: 'Moodify 🙌', body: "You showed up today and that already counts. Log your mood?" },
    { title: 'Moodify 😊', body: "Just a friendly reminder — how are you feeling right now?" },
  ],
  sassy: [
    { title: 'Moodify 💅', body: "Okay so… are you going to log your mood or just ignore me? 👀" },
    { title: 'Moodify 💧', body: "Hydration check. Don't make me ask twice." },
    { title: 'Moodify 🌿', body: "You've been busy. Take a break. I'm not asking, I'm telling." },
    { title: 'Moodify 🍽️', body: "Have you eaten? Because I will absolutely judge you if you haven't." },
    { title: 'Moodify 👀', body: "I see you. Come log your mood. We both know you need to." },
    { title: 'Moodify 💅', body: "Bold of you to think I'd forget to check on you. Log your mood." },
    { title: 'Moodify 😤', body: "It's been a while. I'm not mad, I'm just… disappointed. Come check in." },
    { title: 'Moodify ✨', body: "Okay fine, I miss you. There, I said it. Come back." },
    { title: 'Moodify 🎵', body: "I picked a playlist for you. You're welcome. Come see it." },
    { title: 'Moodify 💜', body: "Under all this sass, I genuinely care. How are you doing?" },
  ],
  calm: [
    { title: 'Moodify 🌿', body: "Take a gentle breath. How are you feeling right now?" },
    { title: 'Moodify 💧', body: "A quiet reminder to hydrate. Take care of yourself. 🍃" },
    { title: 'Moodify 🌸', body: "Pause for a moment. You deserve a little stillness today." },
    { title: 'Moodify 🕊️', body: "No rush. Just a soft check-in — how's your heart today?" },
    { title: 'Moodify 🌙', body: "The day is winding down. How are you feeling?" },
    { title: 'Moodify 🍃', body: "A gentle nudge to check in with yourself. You matter." },
    { title: 'Moodify ✨', body: "Breathe in. Breathe out. Come log your mood when you're ready." },
    { title: 'Moodify 🌿', body: "Have you eaten today? Nourishing yourself is self-care." },
    { title: 'Moodify 💙', body: "I'm here, quietly. Come talk whenever you feel like it." },
    { title: 'Moodify 🌸', body: "A soft reminder: you don't have to be okay all the time. Check in?" },
  ],
  motivational: [
    { title: 'Moodify 🔥', body: "LET'S GO! Time to check in and keep that streak alive! 💪" },
    { title: 'Moodify 💪', body: "You've got this! Log your mood and keep the momentum going!" },
    { title: 'Moodify 🚀', body: "Every check-in is a win. Come log your mood — let's go!" },
    { title: 'Moodify 💧', body: "Hydration = performance. Go drink water. That's an order! 💪" },
    { title: 'Moodify 🍽️', body: "Fuel up! You can't crush your goals on an empty stomach." },
    { title: 'Moodify ⚡', body: "You showed up today. That's already a W. Log your mood!" },
    { title: 'Moodify 🏆', body: "Champions check in with themselves. Be a champion today." },
    { title: 'Moodify 🔥', body: "Don't break the streak! Come log your mood right now." },
    { title: 'Moodify 💥', body: "Small steps every day. Log your mood — keep building!" },
    { title: 'Moodify 🌟', body: "You're stronger than you think. Come prove it — check in!" },
  ],
  therapist: [
    { title: 'Moodify 💙', body: "How are you really doing today? Take a moment to check in." },
    { title: 'Moodify 🌿', body: "It's okay to not be okay. Come log how you're feeling." },
    { title: 'Moodify 💧', body: "A gentle reminder to take care of your body — have you had water?" },
    { title: 'Moodify 🕊️', body: "Your feelings are valid. Come share them — I'm listening." },
    { title: 'Moodify 💙', body: "Checking in on you. No pressure — just here when you're ready." },
    { title: 'Moodify 🌸', body: "Have you eaten today? Taking care of yourself matters." },
    { title: 'Moodify ✨', body: "What's one thing you're feeling right now? Come log it." },
    { title: 'Moodify 💜', body: "You don't have to carry everything alone. I'm here." },
    { title: 'Moodify 🌿', body: "A moment of reflection: how has your day been treating you?" },
    { title: 'Moodify 💙', body: "Awareness is the first step. Come check in with yourself today." },
  ],
  funny: [
    { title: 'Moodify 😂', body: "Okay I've been waiting for you to open the app. It's been awkward." },
    { title: 'Moodify 💧', body: "Hydration check! Your plants drink water. Be like your plants." },
    { title: 'Moodify 🍽️', body: "Have you eaten? I'm not your mom but also… have you eaten?" },
    { title: 'Moodify 😅', body: "Plot twist: logging your mood takes 10 seconds. You have 10 seconds." },
    { title: 'Moodify 🎭', body: "I would send a carrier pigeon but this is faster. Log your mood." },
    { title: 'Moodify 😂', body: "Breaking news: your mood is unlogged. Experts are concerned." },
    { title: 'Moodify 🤔', body: "Asking for a friend (me): how are you feeling right now?" },
    { title: 'Moodify 😏', body: "I could pretend I wasn't waiting for you to open the app. I was." },
    { title: 'Moodify 🎬', body: "Plot twist: everything is fine. Or is it? Log your mood to find out." },
    { title: 'Moodify 😂', body: "Sending good vibes and snacks. Spiritually. Log your mood?" },
  ],
}

// Current personality — updated via postMessage from the app
let currentPersonality = 'neutral'
let notifIndex = 0

// Listen for personality updates from the main app
self.addEventListener('message', e => {
  if (e.data?.type === 'SET_PERSONALITY') {
    const p = e.data.personality
    // Only update if it's a valid known personality
    if (p && NOTIF_POOLS[p]) {
      currentPersonality = p
    } else {
      currentPersonality = 'neutral'
    }
    notifIndex = 0 // reset index when personality changes
  }
})

function getNextNotif() {
  const pool = NOTIF_POOLS[currentPersonality] || NOTIF_POOLS.neutral
  const n = pool[notifIndex % pool.length]
  notifIndex++
  return n
}

// ── Scheduler: 9am, 12pm, 3pm, 6pm, 9pm ─────────────────────────────────────
const SCHEDULE_HOURS = [9, 12, 15, 18, 21]

function msUntilNext() {
  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const s = now.getSeconds()

  for (const hour of SCHEDULE_HOURS) {
    const targetMins = hour * 60
    if (targetMins > currentMins) {
      return (targetMins - currentMins) * 60 * 1000 - s * 1000
    }
  }
  // Next day 9am
  const minsUntilMidnight = 24 * 60 - currentMins
  return (minsUntilMidnight + SCHEDULE_HOURS[0] * 60) * 60 * 1000 - s * 1000
}

function scheduleNext() {
  const delay = msUntilNext()
  setTimeout(() => {
    const h = new Date().getHours()
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

self.addEventListener('activate', () => { scheduleNext() })

// ── Push from server ──────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Moodify 💜', {
      body: data.body || "Hey, I've been thinking about you. Check in? 💜",
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  )
})

// ── Notification click ────────────────────────────────────────────────────────
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
