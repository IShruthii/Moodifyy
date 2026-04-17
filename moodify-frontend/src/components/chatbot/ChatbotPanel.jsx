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
    personality: localStorage.getItem('moodify_bot_personality') || 'friendly',
  }
}

const CHAT_STORAGE_KEY   = 'moodify_chat_messages'
const SESSION_STORAGE_KEY = 'moodify_chat_session_id'

function loadStoredMessages(botName) {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => ({ ...m, time: new Date(m.time) }))
      }
    }
  } catch { /* ignore */ }
  return [{
    sender: 'BOT',
    text: `Hey! I'm ${botName} 💜 How are you feeling right now? I'm here to listen.`,
    time: new Date(),
  }]
}

function saveMessages(messages) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)))
  } catch { /* ignore */ }
}

// Personality-aware retry messages — never show raw errors
function getRetryMessage(personality, isTimeout) {
  const timeout = {
    flirty:       `I dozed off for a sec 😴 Give me ~50 seconds and I'll be right back for you 💜`,
    friendly:     `Oops, server's waking up! Give it ~50 seconds and try again 🙌`,
    sassy:        `Okay so the server decided to nap. Rude. Try again in ~50 seconds 💅`,
    calm:         `The server is resting. Take a breath and try again in ~50 seconds 🌿`,
    motivational: `Server cold start! 50 seconds and we're BACK. Don't give up! 🔥`,
    therapist:    `The server needs a moment. Take a breath — try again in ~50 seconds 💙`,
    funny:        `The server is doing its morning routine. ~50 seconds. We wait. 😂`,
  }
  const error = {
    flirty:       `Something went wrong on my end 😔 Try again in a moment? I'm still here 💜`,
    friendly:     `Hmm, something went wrong! Try sending that again? 💙`,
    sassy:        `Well that didn't work. Try again — I'll pretend it didn't happen 👀`,
    calm:         `A small hiccup. Take a breath and try again when you're ready 🌿`,
    motivational: `Minor setback! Try again — we don't quit! 💪`,
    therapist:    `Something went wrong, but I'm still here. Try again when you're ready 💙`,
    funny:        `My brain buffered. Try again? 😂`,
  }
  const pool = isTimeout ? timeout : error
  return pool[personality] || pool.friendly
}

export default function ChatbotPanel({ isOpen, onClose, onMessageSent }) {
  const { currentMood } = useMood()

  const [botSettings, setBotSettings] = useState(getBotSettings)
  const botAvatar = PERSONALITY_AVATARS[botSettings.personality] || '🎭'

  const [messages,     setMessages]     = useState(() => loadStoredMessages(getBotSettings().name))
  const [input,        setInput]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [sessionId,    setSessionId]    = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) || null)
  const [slowWarning,  setSlowWarning]  = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [needsRelogin, setNeedsRelogin] = useState(false)

  const userHasSentMessage = useRef(false)
  const messagesEndRef     = useRef(null)
  const retryPayload       = useRef(null)

  const { speaking, supported: ttsSupported, speak, stopSpeaking } = useSpeechSynthesis()

  const handleVoiceResult = useCallback((transcript) => {
    setInput(transcript)
    setTimeout(() => sendMessage(transcript), 400)
  }, []) // eslint-disable-line

  const { listening, supported: sttSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleVoiceResult })

  // Refresh bot settings + welcome message when panel opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getBotSettings()
      setBotSettings(fresh)
      setNeedsRelogin(false)
      const stored = localStorage.getItem(CHAT_STORAGE_KEY)
      if (!stored) {
        setMessages([{
          sender: 'BOT',
          text: `Hey! I'm ${fresh.name} 💜 How are you feeling right now? I'm here to listen.`,
          time: new Date(),
        }])
      }
    }
  }, [isOpen])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist messages
  useEffect(() => {
    if (messages.length > 1) saveMessages(messages)
  }, [messages])

  // Persist sessionId
  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }, [sessionId])

  // Voice reply
  useEffect(() => {
    if (!voiceEnabled || !ttsSupported || !userHasSentMessage.current) return
    const last = messages[messages.length - 1]
    if (last?.sender === 'BOT') { stopSpeaking(); speak(last.text) }
  }, [messages]) // eslint-disable-line

  // Stop voice on close
  useEffect(() => {
    if (!isOpen) { stopSpeaking(); stopListening() }
  }, [isOpen]) // eslint-disable-line

  useEffect(() => () => { stopSpeaking(); stopListening() }, []) // eslint-disable-line

  const sendMessage = async (text, quickAction = null) => {
    const msg = (text || quickAction || '').trim()
    if (!msg || loading) return

    userHasSentMessage.current = true
    setMessages(prev => [...prev, { sender: 'USER', text: msg, time: new Date() }])
    setInput('')
    setLoading(true)
    setSlowWarning(false)
    setNeedsRelogin(false)
    stopSpeaking()
    if (onMessageSent) onMessageSent()

    const slowTimer = setTimeout(() => setSlowWarning(true), 7000)
    const { name: botName, personality: botPersonality } = getBotSettings()

    // Store payload for retry
    retryPayload.current = { msg, quickAction, botName, botPersonality }

    try {
      const res = await sendChatMessage({
        message: msg,
        sessionId,
        currentMood,
        quickAction,
        botName,
        botPersonality,
      })
      const data = res.data?.data
      if (!data) throw new Error('Empty response')

      if (!sessionId && data.sessionId) setSessionId(data.sessionId)

      setMessages(prev => [...prev, {
        sender: 'BOT',
        text: data.message || "I'm here for you 💜",
        suggestions: data.suggestions,
        time: new Date(),
      }])
    } catch (err) {
      const status = err.response?.status
      const isTimeout = err.code === 'ECONNABORTED'
        || err.message?.includes('timeout')
        || err.message?.includes('Network Error')

      if (status === 401 || status === 403) {
        // Session expired — show re-login prompt, don't redirect
        setNeedsRelogin(true)
      } else {
        setMessages(prev => [...prev, {
          sender: 'BOT',
          text: getRetryMessage(botPersonality, isTimeout),
          isRetryable: true,
          time: new Date(),
        }])
      }
    } finally {
      setLoading(false)
      setSlowWarning(false)
      clearTimeout(slowTimer)
    }
  }

  const handleRetry = () => {
    if (!retryPayload.current) return
    const { msg, quickAction } = retryPayload.current
    sendMessage(msg, quickAction)
  }

  const clearChat = () => {
    const fresh = getBotSettings()
    localStorage.removeItem(CHAT_STORAGE_KEY)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSessionId(null)
    setNeedsRelogin(false)
    retryPayload.current = null
    setMessages([{
      sender: 'BOT',
      text: `Hey! I'm ${fresh.name} 💜 How are you feeling right now? I'm here to listen.`,
      time: new Date(),
    }])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
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
                onClick={() => { if (voiceEnabled) stopSpeaking(); setVoiceEnabled(v => !v) }}
                title={voiceEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>
            )}
            <button className="chatbot-clear-btn" onClick={clearChat} title="Clear chat">🗑️</button>
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

        {/* Session expired banner */}
        {needsRelogin && (
          <div className="chatbot-relogin-banner">
            <span>Your session expired.</span>
            <a href="/login" className="chatbot-relogin-link">Sign in again →</a>
          </div>
        )}

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender === 'USER' ? 'user' : 'bot'}`}>
              {msg.sender === 'BOT' && <div className="bot-avatar">{botAvatar}</div>}
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                {msg.isRetryable && (
                  <button className="chatbot-retry-btn" onClick={handleRetry}>
                    ↺ Try again
                  </button>
                )}
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
                {slowWarning && (
                  <span className="slow-hint">
                    {botSettings.personality === 'sassy'        ? 'Server napping... 💅 ~50s'  :
                     botSettings.personality === 'funny'        ? 'Loading brain... ~50s 😂'   :
                     botSettings.personality === 'motivational' ? 'Warming up! ~50s 🔥'        :
                     botSettings.personality === 'calm'         ? 'Almost ready... 🌿'          :
                     'Waking up... ~50s ☕'}
                  </span>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chatbot-input-area">
          {(sttSupported || /Android|iPhone|iPad/i.test(navigator.userAgent)) && (
            <button
              className={`chatbot-mic-btn ${listening ? 'listening' : ''}`}
              onClick={() => { if (listening) { stopListening(); return } stopSpeaking(); startListening() }}
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
            disabled={listening || loading}
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
