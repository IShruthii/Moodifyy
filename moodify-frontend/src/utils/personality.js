/**
 * Centralized personality copy utility.
 * Single source of truth for all personality-aware text across the app.
 * 
 * Usage:
 *   import { getPersonality, p } from '../utils/personality'
 *   const personality = getPersonality()
 *   const greeting = p.greeting(personality, name)
 */

export function getPersonality() {
  return localStorage.getItem('moodify_bot_personality') || 'friendly'
}

export function getBotName() {
  return localStorage.getItem('moodify_bot_name') || 'Moo'
}

// ── Greeting (Dashboard welcome sub-text) ────────────────────────────────────
export function getWelcomeSub(personality) {
  const map = {
    flirty:       "I missed you. Let's see how you're doing today 💜",
    friendly:     "Great to see you! Ready to check in? 😊",
    sassy:        "You showed up. Respect. Let's do this 💅",
    calm:         "Take a breath. You're here, and that's enough 🌿",
    motivational: "Another day, another chance to crush it! 🔥",
    therapist:    "I'm here whenever you're ready to check in 💙",
    funny:        "You opened the app. I'm legally required to be impressed 😂",
  }
  return map[personality] || "Welcome back to Moodify"
}

// ── Notification card message (Dashboard) ────────────────────────────────────
export function getNotifCardMessage(count, name, personality) {
  const N = name ? name.split(' ')[0] : 'you'
  if (count === 0) {
    const map = {
      flirty:       `All caught up, ${N} 💌 I've been watching over you.`,
      friendly:     `You're all caught up! Nothing missed 🙌`,
      sassy:        `Zero notifications. You're either very on top of things or I'm being ignored 👀`,
      calm:         `All clear. Take a moment to breathe 🌿`,
      motivational: `Inbox zero! That's a W. Keep going 🔥`,
      therapist:    `Nothing pending. How are you feeling right now? 💙`,
      funny:        `No notifications. Either you're perfect or I forgot to send them 😂`,
    }
    return map[personality] || `All caught up 💌`
  }
  if (count === 1) {
    const map = {
      flirty:       `${N}, I left you a little something 💌`,
      friendly:     `Hey ${N}, you have 1 new notification!`,
      sassy:        `1 notification. Don't leave me on read 👀`,
      calm:         `One gentle message waiting for you 🌿`,
      motivational: `1 notification — check it, it might be important! 🔥`,
      therapist:    `There's one message waiting when you're ready 💙`,
      funny:        `1 notification. It's probably important. Probably. 😂`,
    }
    return map[personality] || `${N}, I left you a little something 💌`
  }
  const map = {
    flirty:       `${N}! ${count} messages waiting — I couldn't stop thinking about you 💬`,
    friendly:     `${N}, you have ${count} new notifications! 🙌`,
    sassy:        `${count} notifications. I've been busy. You're welcome 💅`,
    calm:         `${count} messages waiting, whenever you're ready 🌿`,
    motivational: `${count} notifications! Stay on top of it — you've got this! 🔥`,
    therapist:    `${count} messages are here when you're ready to read them 💙`,
    funny:        `${count} notifications. I may have gotten carried away 😂`,
  }
  return map[personality] || `${N}! ${count} messages waiting 💬`
}

// ── Mood prompt (Dashboard — no mood logged yet) ──────────────────────────────
export function getMoodPromptText(personality) {
  const map = {
    flirty:       { title: "How are you feeling, love?", sub: "Tell me everything — I'm all yours 💜" },
    friendly:     { title: "How are you feeling today?", sub: "Take a moment to check in with yourself 😊" },
    sassy:        { title: "Okay but how are you actually feeling?", sub: "No filter needed here 💅" },
    calm:         { title: "How are you feeling right now?", sub: "There's no rush. Just a gentle check-in 🌿" },
    motivational: { title: "Time to check in!", sub: "Log your mood and keep that streak alive 🔥" },
    therapist:    { title: "How are you feeling today?", sub: "Be honest — every feeling is valid 💙" },
    funny:        { title: "How are you feeling?", sub: "Scientifically speaking, logging your mood is good for you 😂" },
  }
  return map[personality] || { title: "How are you feeling today?", sub: "Take a moment to check in with yourself" }
}

// ── Mood already logged (Dashboard) ──────────────────────────────────────────
export function getMoodLoggedLabel(personality) {
  const map = {
    flirty:       "Today you're feeling",
    friendly:     "You're feeling",
    sassy:        "Current vibe:",
    calm:         "Right now you feel",
    motivational: "Today's energy:",
    therapist:    "You've identified feeling",
    funny:        "Mood status:",
  }
  return map[personality] || "Today you're feeling"
}

// ── Mood check-in transition messages ────────────────────────────────────────
export function getTransitionMessage(type, from, to, personality) {
  const improved = {
    flirty:       `Look at you — from ${from} to ${to}. I knew you had it in you 💜`,
    friendly:     `That's a beautiful shift! From ${from} to ${to} — you did that 🌟`,
    sassy:        `From ${from} to ${to}? Okay, I'm impressed. Don't let it go to your head 😏`,
    calm:         `A gentle shift from ${from} to ${to}. You moved through it 🌿`,
    motivational: `${from} → ${to}! That's GROWTH. Keep going! 🔥`,
    therapist:    `Moving from ${from} to ${to} is meaningful. You did something good for yourself 💙`,
    funny:        `${from} to ${to}? Character development! 😂`,
  }
  const same = {
    flirty:       `Still feeling ${to}? That's okay. I'm still here for you 💜`,
    friendly:     `Still ${to}? That's valid. Some feelings take time 💙`,
    sassy:        `Still ${to}. Feelings don't always cooperate. Fair enough 👀`,
    calm:         `Still ${to}. That's okay. You showed up, and that matters 🌿`,
    motivational: `Still ${to}? That's fine — you showed up and that counts! 💪`,
    therapist:    `Still feeling ${to}. That's completely valid. You're still here 💙`,
    funny:        `Still ${to}. Feelings: 1, us: 0. We'll get 'em next time 😂`,
  }
  const declined = {
    flirty:       `Feeling ${to} now? That's okay. I'm right here with you 💜`,
    friendly:     `It's okay to feel ${to}. Some days are harder. I'm here 💙`,
    sassy:        `Feeling ${to}? That's valid. Even I have off days 💅`,
    calm:         `Feeling ${to} is okay. This won't last forever. Breathe 🌿`,
    motivational: `Feeling ${to}? That's just a setback. You'll bounce back 💪`,
    therapist:    `Feeling ${to} is completely valid. Thank you for being honest 💙`,
    funny:        `Feeling ${to}? Mood said "nope" today. That's allowed 😂`,
  }
  const pool = type === 'improved' ? improved : type === 'declined' ? declined : same
  return pool[personality] || pool.friendly || `You showed up. That matters. 💜`
}

// ── MoodPage submit button text ───────────────────────────────────────────────
export function getMoodSubmitText(personality, moodLabel) {
  if (!moodLabel) return 'Select a mood to continue'
  const map = {
    flirty:       `Continue feeling ${moodLabel} 💜`,
    friendly:     `I'm feeling ${moodLabel} ✨`,
    sassy:        `Yep, ${moodLabel}. Let's go 💅`,
    calm:         `Feeling ${moodLabel} — continue 🌿`,
    motivational: `${moodLabel}? Let's work with it! 🔥`,
    therapist:    `I'm feeling ${moodLabel} right now 💙`,
    funny:        `${moodLabel} it is. Onward! 😂`,
  }
  return map[personality] || `Continue with ${moodLabel} ✨`
}

// ── Empty states ──────────────────────────────────────────────────────────────
export function getEmptyStateText(section, personality) {
  const map = {
    notifications: {
      flirty:       { title: "All caught up 💌", sub: "I'll reach out when I have something for you." },
      friendly:     { title: "You're all caught up!", sub: "Notifications will appear here 🙌" },
      sassy:        { title: "Nothing here yet 💅", sub: "I'll let you know when something's worth your time." },
      calm:         { title: "All clear 🌿", sub: "Enjoy the quiet. I'll reach out gently when needed." },
      motivational: { title: "Inbox zero! 🔥", sub: "Stay sharp — notifications will come when you need them." },
      therapist:    { title: "Nothing pending 💙", sub: "I'll check in on you throughout the day." },
      funny:        { title: "No notifications 😂", sub: "Either everything's fine or I forgot. Probably fine." },
    },
  }
  const section_map = map[section]
  if (!section_map) return { title: "Nothing here yet", sub: "Check back soon" }
  return section_map[personality] || section_map.friendly || { title: "Nothing here yet", sub: "Check back soon" }
}
