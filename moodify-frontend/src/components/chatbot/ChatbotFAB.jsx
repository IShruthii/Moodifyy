import React, { useState } from 'react'
import ChatbotPanel from './ChatbotPanel'
import FeedbackModal from '../common/FeedbackModal'
import { useMood } from '../../context/MoodContext'
import './ChatbotFAB.css'

export default function ChatbotFAB() {
  const { currentMood } = useMood()
  const [open,           setOpen]           = useState(false)
  const [showFeedback,   setShowFeedback]   = useState(false)
  const [messageCount,   setMessageCount]   = useState(0)

  const handleClose = () => {
    setOpen(false)
    // Only ask for feedback if user actually had a conversation (3+ messages)
    if (messageCount >= 3) {
      setTimeout(() => setShowFeedback(true), 400)
    }
  }

  return (
    <>
      <button
        className={`chatbot-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open companion chat"
      >
        <span className="fab-icon">{open ? '✕' : '🎭'}</span>
        {!open && <span className="fab-label">Moo</span>}
      </button>

      <ChatbotPanel
        isOpen={open}
        onClose={handleClose}
        onMessageSent={() => setMessageCount(c => c + 1)}
      />

      {showFeedback && (
        <FeedbackModal
          moodBefore={currentMood}
          moodAfter={null}
          sessionType="CHAT"
          onDone={() => setShowFeedback(false)}
          onSkip={() => setShowFeedback(false)}
        />
      )}
    </>
  )
}
