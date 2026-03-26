import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendChatMessage } from '../../api/companionApi'
import { useMood } from '../../context/MoodContext'
import { useSpeechRecognition, useSpeechSynthesis } from '../../hooks/useVoice'
import './ChatbotPanel.css'

const QUICK_ACTIONS = [
  { key: 'CALM_ME',    label: '🌿 Calm Me',    color: '#14b8a6' },
  { key: 'MUSIC',      label: '🎵 Music',       color: '#8b5cf6' },
  { key: 'JOURNAL',    label: '📝 Journal',     color: '#f59e0b' },
  { key: 'PLAY_GAME',  label: '🎮 Play Game',   color: '#3b82f6' },
  { key: 'NEED_HELP',  label: '💙 Need Help',   color: '#ec4899' },
]

export default function ChatbotPanel({ isOpen, onClose, onMessageSent }) {
  const { currentMood } = useMood()
  const [messages,   setMessages]   = useState([
    { sender: 'BOT', text: "Hey there! I'm Moo, your companion. 🎭 How are you feeling right now? I'm here to listen.", time: new Date() }
  ])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [sessionId,  setSessionId]  = useState(null)
  const [autoSpeak,  setAutoSpeak]  = useState(true)  // always on by default
  const messagesEndRef = useRef(null)
  const turnRef = useRef(0)

  // Voice output
  const { speaking, supported: ttsSupported, speak, stopSpeaking } = useSpeechSynthesis()

  // Voice input — fires when recognition returns a result
  const handleVoiceResult = useCallback((transcript) => {
    setInput(transcript)
    setTimeout(() => sendMessage(transcript), 400)
  }, []) // eslint-disable-line

  const { listening, supported: sttSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleVoiceResult })

  const voiceSupported = sttSupported && ttsSupported

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-speak every new bot message when autoSpeak is on
  useEffect(() => {
    if (!autoSpeak || !ttsSupported) return
    const last = messages[messages.length - 1]
    if (last?.sender === 'BOT') speak(last.text)
  }, [messages]) // eslint-disable-line

  const sendMessage = async (text, quickAction = null) => {
    const msg = text || quickAction
    if (!msg?.trim()) return
    turnRef.current += 1

    setMessages(prev => [...prev, { sender: 'USER', text: msg, time: new Date() }])
    setInput('')
    setLoading(true)
    stopSpeaking()
    if (onMessageSent) onMessageSent()

    try {
      const res = await sendChatMessage({ message: msg, sessionId, currentMood, quickAction })
      const data = res.data.data
      if (!sessionId) setSessionId(data.sessionId)
      const botMsg = { sender: 'BOT', text: data.message, suggestions: data.suggestions, time: new Date() }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [...prev, {
        sender: 'BOT',
        text: "I'm having a little trouble connecting right now. But I'm still here with you. 💙",
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const toggleVoice = () => {
    if (autoSpeak) stopSpeaking()
    setAutoSpeak(v => !v)
  }

  const handleMicClick = () => {
    if (listening) { stopListening(); return }
    stopSpeaking() // stop Moo speaking before user talks
    startListening()
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar">
            <div className="chatbot-avatar-emoji">🎭</div>
            <div className="chatbot-status-dot" />
          </div>
          <div className="chatbot-header-info">
            <h3 className="chatbot-name">Moo</h3>
            <span className="chatbot-status">
              {listening ? '🎙️ Listening...' : speaking ? '🔊 Speaking...' : 'Your companion · Always here'}
            </span>
          </div>
          <div className="chatbot-header-actions">
            {ttsSupported && (
              <button
                className={`chatbot-voice-toggle ${autoSpeak ? 'active' : ''}`}
                onClick={toggleVoice}
                title={autoSpeak ? 'Mute Moo' : 'Unmute Moo'}
              >
                {autoSpeak ? '🔊' : '🔇'}
              </button>
            )}
            <button className="chatbot-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Voice mode banner */}
        {autoSpeak && ttsSupported && (
          <div className="voice-mode-banner">
            <span>🔊 Moo will speak her replies — tap 🔇 to mute</span>
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
              {msg.sender === 'BOT' && <div className="bot-avatar">🎭</div>}
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
              <div className="bot-avatar">🎭</div>
              <div className="message-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chatbot-input-area">
          {/* Mic button */}
          {sttSupported && (
            <button
              className={`chatbot-mic-btn ${listening ? 'listening' : ''}`}
              onClick={handleMicClick}
              title={listening ? 'Stop listening' : 'Speak to Moo'}
            >
              {listening ? '⏹' : '🎙️'}
            </button>
          )}

          <textarea
            className="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening...' : 'Share what\'s on your mind...'}
            rows={1}
            disabled={listening}
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
