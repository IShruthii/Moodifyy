import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendChatMessage } from '../../api/companionApi'
import { useMood } from '../../context/MoodContext'
import { useSpeechRecognition, useSpeechSynthesis } from '../../hooks/useVoice'
import './ChatbotPanel.css'

const QUICK_ACTIONS = [
  { key: 'CALM_ME',   label: '🌿 Calm Me',   color: '#14b8a6' },
  { key: 'MUSIC',     label: '🎵 Music',      color: '#8b5cf6' },
  { key: 'JOURNAL',   label: '📝 Journal',    color: '#f59e0b' },
  { key: 'PLAY_GAME', label: '🎮 Play Game',  color: '#3b82f6' },
  { key: 'NEED_HELP', label: '💙 Need Help',  color: '#ec4899' },
]

// Personality → avatar emoji mapping
const PERSONALITY_AVATARS = {
  flirty:       '😏',
  friendly:     '🤗',
  sassy:        '💅',
  calm:         '🌿',
  motivational: '🔥',
  therapist:    '💙',
  funny:        '😂',
}

function getBotSettings() {
  return {
    name:        localStorage.getItem('moodify_bot_name')        || 'Moo',
    personality: localStorage.getItem('moodify_bot_personality') || 'flirty',
  }
}

export default function ChatbotPanel({ isOpen, onClose, onMessageSent }) {
  const { currentMood } = useMood()

  // Read bot settings fresh each time panel opens
  const [botSettings, setBotSettings] = useState(getBotSettings)

  const botAvatar = PERSONALITY_AVATARS[botSettings.personality] || '🎭'

  const [messages, setMessages] = useState(() => {
    const s = getBotSettings()
    return [{
      sender: 'BOT',
      text: `Hey! I'm ${s.name} 💜 How are you feeling right now? I'm here to listen.`,
      time: new Date(),
    }]
  })
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [sessionId,   setSessionId]   = useState(null)
  const [slowWarning, setSlowWarning] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  const userHasSentMessage = useRef(false)
  const messagesEndRef = useRef(null)

  const { speaking, supported: ttsSupported, speak, stopSpeaking } = useSpeechSynthesis()

  const handleVoiceResult = useCallback((transcript) => {
    setInput(transcript)
    setTimeout(() => sendMessage(transcript), 400)
  }, []) // eslint-disable-line

  const { listening, supported: sttSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleVoiceResult })

  // Refresh bot settings each time panel opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getBotSettings()
      setBotSettings(fresh)
    }
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speak bot replies when voice is on
  useEffect(() => {
    if (!voiceEnabled || !ttsSupported || !userHasSentMessage.current) return
    const last = messages[messages.length - 1]
    if (last?.sender === 'BOT') { stopSpeaking(); speak(last.text) }
  }, [messages]) // eslint-disable-line

  // Stop voice when panel closes
  useEffect(() => {
    if (!isOpen) { stopSpeaking(); stopListening() }
  }, [isOpen]) // eslint-disable-line

  useEffect(() => {
    return () => { stopSpeaking(); stopListening() }
  }, []) // eslint-disable-line

  const sendMessage = async (text, quickAction = null) => {
    const msg = (text || quickAction || '').trim()
    if (!msg) return

    userHasSentMessage.current = true
    setMessages(prev => [...prev, { sender: 'USER', text: msg, time: new Date() }])
    setInput('')
    setLoading(true)
    setSlowWarning(false)
    stopSpeaking()
    if (onMessageSent) onMessageSent()

    const slowTimer = setTimeout(() => setSlowWarning(true), 6000)

    // Always read fresh settings so changes in Profile take effect immediately
    const { name: botName, personality: botPersonality } = getBotSettings()

    try {
      const res = await sendChatMessage({
        message: msg,
        sessionId,
        currentMood,
        quickAction,
        botName,
        botPersonality,
      })
      const data = res.data.data
      if (!sessionId) setSessionId(data.sessionId)
      setMessages(prev => [...prev, {
        sender: 'BOT',
        text: data.message,
        suggestions: data.suggestions,
        time: new Date(),
      }])
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED'
        || err.message?.includes('timeout')
        || err.message?.includes('Network')
      const fallbacks = isTimeout ? [
        `I'm waking up from a little nap 😴 The server takes ~50 seconds to start. Try again in a moment! 💜`,
        `Oops, I dozed off! Give me 30-60 seconds and try again — I'm warming up just for you 💜`,
      ] : [
        `I'm having a little trouble connecting right now. Try again in a moment? 💙`,
        `My thoughts are loading slowly. Take a breath and try again. 💜`,
      ]
      setMessages(prev => [...prev, {
        sender: 'BOT',
        text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        time: new Date(),
      }])
    } finally {
      setLoading(false)
      setSlowWarning(false)
      clearTimeout(slowTimer)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking()
    setVoiceEnabled(v => !v)
  }

  const handleMicClick = () => {
    if (listening) { stopListening(); return }
    stopSpeaking()
    startListening()
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar">
            <div className="chatbot-avatar-emoji">{botAvatar}</div>
            <div className="chatbot-status-dot" />
          </div>
          <div className="chatbot-header-info">
            <h3 className="chatbot-name">{botSettings.name}</h3>
            <span className="chatbot-status">
              {listening ? '🎙️ Listening...'
                : speaking ? '🔊 Speaking...'
                : `${botSettings.personality} · always here`}
            </span>
          </div>
          <div className="chatbot-header-actions">
            {speaking && (
              <button className="chatbot-stop-btn" onClick={stopSpeaking} title="Stop speaking">⏹</button>
            )}
            {ttsSupported && (
              <button
                className={`chatbot-voice-toggle ${voiceEnabled ? 'active' : ''}`}
                onClick={toggleVoice}
                title={voiceEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>
            )}
            <button className="chatbot-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {voiceEnabled && ttsSupported && (
          <div className="voice-mode-banner">
            <span>🔊 Voice replies on — tap 🔇 to mute</span>
          </div>
        )}

        {/* Quick actions */}
        <div className="chatbot-quick-actions">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.key}
              className="quick-action-btn"
              style={{ '--action-color': action.color }}
              onClick={() => sendMessage(action.label, action.key)}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender === 'USER' ? 'user' : 'bot'}`}>
              {msg.sender === 'BOT' && (
                <div className="bot-avatar">{botAvatar}</div>
              )}
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message bot">
              <div className="bot-avatar">{botAvatar}</div>
              <div className="message-bubble typing">
                <span /><span /><span />
                {slowWarning && <span className="slow-hint">Waking up... ~50s ☕</span>}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chatbot-input-area">
          {/* Mic — always show on mobile, conditionally on desktop */}
          {(sttSupported || /Android|iPhone|iPad/i.test(navigator.userAgent)) && (
            <button
              className={`chatbot-mic-btn ${listening ? 'listening' : ''}`}
              onClick={handleMicClick}
              title={listening ? 'Stop listening' : `Speak to ${botSettings.name}`}
            >
              {listening ? '⏹' : '🎙️'}
            </button>
          )}
          <textarea
            className="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening...' : `Talk to ${botSettings.name}...`}
            rows={1}
            disabled={listening}
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  )
}
