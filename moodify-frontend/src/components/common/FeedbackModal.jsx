import React, { useState } from 'react'
import { submitFeedback } from '../../api/feedbackApi'
import './FeedbackModal.css'

const PROMPTS = {
  1: "We're sorry it wasn't helpful. What could we do better?",
  2: "Thanks for sharing. What felt off?",
  3: "Good to know! What would make it better?",
  4: "Great! What did you enjoy most?",
  5: "Amazing! We're so glad it helped. Tell us more!",
}

export default function FeedbackModal({ moodBefore, moodAfter, sessionType = 'RECOMMENDATION', onDone, onSkip }) {
  const [rating,   setRating]   = useState(0)
  const [hovered,  setHovered]  = useState(0)
  const [comment,  setComment]  = useState('')
  const [phase,    setPhase]    = useState('rate')  // rate | thanks
  const [saving,   setSaving]   = useState(false)

  const activeRating = hovered || rating

  const handleSubmit = async () => {
    if (!rating) return
    setSaving(true)
    try {
      await submitFeedback({ rating, comment, moodBefore, moodAfter, sessionType })
    } catch {
      // silent — still show thanks
    } finally {
      setSaving(false)
      setPhase('thanks')
    }
  }

  if (phase === 'thanks') {
    return (
      <div className="fb-overlay">
        <div className="fb-card animate-fade-in">
          <span className="fb-thanks-icon">🙏</span>
          <h2 className="fb-thanks-title">Thank you!</h2>
          <p className="fb-thanks-sub">
            Your feedback helps Moodify get better every day. We really appreciate it.
          </p>
          <button className="btn btn-primary btn-lg fb-cta" onClick={onDone}>
            Continue ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fb-overlay">
      <div className="fb-card animate-fade-in">

        <div className="fb-header">
          <span className="fb-header-icon">💬</span>
          <h2 className="fb-title">How was your experience?</h2>
          <p className="fb-sub">Your honest feedback makes Moodify better for everyone.</p>
        </div>

        {/* Mood transition if available */}
        {moodBefore && moodAfter && (
          <div className="fb-transition">
            <span className="fb-mood-chip">{moodBefore}</span>
            <span className="fb-arrow">→</span>
            <span className="fb-mood-chip after">{moodAfter}</span>
          </div>
        )}

        {/* Star rating */}
        <div className="fb-stars-wrap">
          <div className="fb-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`fb-star ${star <= activeRating ? 'active' : ''}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                aria-label={`${star} star`}
              >
                ★
              </button>
            ))}
          </div>
          {activeRating > 0 && (
            <p className="fb-star-prompt animate-fade-in">{PROMPTS[activeRating]}</p>
          )}
        </div>

        {/* Comment */}
        {rating > 0 && (
          <div className="fb-comment-wrap animate-fade-in">
            <textarea
              className="input fb-textarea"
              placeholder="Share more (optional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="fb-actions">
          <button
            className="btn btn-primary btn-lg fb-cta"
            onClick={handleSubmit}
            disabled={!rating || saving}
          >
            {saving ? 'Submitting...' : rating ? 'Submit Feedback' : 'Select a rating first'}
          </button>
          <button className="fb-skip" onClick={onSkip}>Skip</button>
        </div>

      </div>
    </div>
  )
}
