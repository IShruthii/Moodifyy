import { useState, useRef, useCallback, useEffect } from 'react'

// ── Speech Recognition (voice input) ────────────────────────────────────────
export function useSpeechRecognition({ onResult, onEnd }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        onResult(transcript)
      }

      rec.onend = () => {
        setListening(false)
        if (onEnd) onEnd()
      }

      rec.onerror = () => {
        setListening(false)
      }

      recognitionRef.current = rec
    }
  }, [onResult, onEnd])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      // already started
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}

// ── Speech Synthesis (voice output) ─────────────────────────────────────────
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text) => {
    if (!supported) return
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Strip emojis for cleaner speech
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()
    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.volume = 1

    // Pick a warm female voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Moira') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      (v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en'))

    if (preferred) utterance.voice = preferred

    utterance.onstart  = () => setSpeaking(true)
    utterance.onend    = () => setSpeaking(false)
    utterance.onerror  = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [supported])

  const stopSpeaking = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { speaking, supported, speak, stopSpeaking }
}
