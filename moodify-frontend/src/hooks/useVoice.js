import { useState, useRef, useCallback, useEffect } from 'react'

// ── Speech Recognition (voice input) ────────────────────────────────────────
export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    setSupported(true)
    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      if (onResult) onResult(transcript)
    }

    rec.onend = () => {
      setListening(false)
      if (onEnd) onEnd()
    }

    rec.onerror = () => setListening(false)

    recognitionRef.current = rec
  }, [onResult, onEnd])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    try { recognitionRef.current.start(); setListening(true) } catch { /* already started */ }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}

// ── Voice selection helpers ──────────────────────────────────────────────────

/**
 * Returns all available English voices grouped by gender hint.
 * Call after voices are loaded (voiceschanged event).
 */
export function getAvailableVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
  return window.speechSynthesis.getVoices().filter(v =>
    v.lang.startsWith('en') || v.lang.startsWith('EN')
  )
}

/**
 * Categorize a voice as 'female', 'male', or 'neutral' based on name heuristics.
 * This is best-effort — browsers don't expose gender metadata.
 */
export function categorizeVoice(voice) {
  const name = voice.name.toLowerCase()
  const femaleHints = ['female', 'woman', 'girl', 'samantha', 'karen', 'moira', 'victoria',
    'zira', 'hazel', 'susan', 'kate', 'fiona', 'tessa', 'veena', 'nicky',
    'ava', 'allison', 'joanna', 'salli', 'kendra', 'kimberly', 'ivy',
    'aria', 'jenny', 'emma', 'libby', 'mia', 'natasha', 'nicole']
  const maleHints = ['male', 'man', 'guy', 'daniel', 'alex', 'fred', 'tom', 'oliver',
    'george', 'rishi', 'aaron', 'arthur', 'ryan', 'matthew', 'james',
    'brian', 'justin', 'joey', 'kevin', 'eric', 'liam']
  if (femaleHints.some(h => name.includes(h))) return 'female'
  if (maleHints.some(h => name.includes(h))) return 'male'
  return 'neutral'
}

/**
 * Pick the best voice for a given preference.
 * preference: 'auto' | 'female' | 'male' | 'neutral' | specific voice URI
 */
export function pickVoice(preference, voices) {
  if (!voices || voices.length === 0) return null

  // Specific voice URI selected
  if (preference && preference !== 'auto' && preference !== 'female'
      && preference !== 'male' && preference !== 'neutral') {
    const exact = voices.find(v => v.voiceURI === preference || v.name === preference)
    if (exact) return exact
  }

  // Category-based selection
  if (preference === 'female') {
    return voices.find(v => categorizeVoice(v) === 'female')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0]
  }

  if (preference === 'male') {
    return voices.find(v => categorizeVoice(v) === 'male')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0]
  }

  if (preference === 'neutral') {
    return voices.find(v => categorizeVoice(v) === 'neutral')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0]
  }

  // 'auto' — pick first available English voice, no gender bias
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

// ── Speech Synthesis (voice output) ─────────────────────────────────────────
/**
 * voicePreference: 'auto' | 'female' | 'male' | 'neutral' | specific voice URI
 * Defaults to 'auto' if not provided.
 */
export function useSpeechSynthesis(voicePreference = 'auto') {
  const [speaking, setSpeaking] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Load voices — browsers load them async
  useEffect(() => {
    if (!supported) return
    const load = () => setVoicesLoaded(true)
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true)
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', load)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [supported])

  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()

    // Strip emojis for cleaner speech
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1

    // Apply user's voice preference
    const voices = getAvailableVoices()
    const chosen = pickVoice(voicePreference, voices)
    if (chosen) utterance.voice = chosen

    utterance.onstart = () => setSpeaking(true)
    utterance.onend   = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [supported, voicePreference, voicesLoaded]) // eslint-disable-line

  const stopSpeaking = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { speaking, supported, speak, stopSpeaking }
}

/**
 * Hook to get available voices with loading state.
 * Use in ProfilePage to show voice picker.
 */
export function useAvailableVoices() {
  const [voices, setVoices] = useState([])
  const [loaded, setLoaded] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    const load = () => {
      const v = getAvailableVoices()
      setVoices(v)
      setLoaded(true)
    }
    const existing = window.speechSynthesis.getVoices()
    if (existing.length > 0) {
      load()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', load)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [supported])

  return { voices, loaded, supported }
}
