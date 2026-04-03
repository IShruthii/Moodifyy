import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import MoodSelector from '../components/mood/MoodSelector'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { logMood } from '../api/moodApi'
import { useMood } from '../context/MoodContext'
import './MoodPage.css'

const INTENSITY_LABELS = ['Barely', 'A little', 'Somewhat', 'Quite', 'Very', 'Extremely']

export default function MoodPage() {
  const navigate = useNavigate()
  const { setCurrentMood } = useMood()
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [intensity, setIntensity] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedMood) { setError('Please select how you are feeling'); return }
    setError('')
    setLoading(true)
    try {
      await logMood({ mood: selectedMood, note })
      setCurrentMood(selectedMood)
      navigate('/recommendations')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log mood. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mood-page animate-fade-in">
        <div className="mood-page-header">
          <h1 className="mood-page-title">How are you feeling?</h1>
          <p className="mood-page-sub">
            Take a moment to check in with yourself. There's no right or wrong answer.
          </p>
        </div>

        <div className="mood-page-card glass">
          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />

          {selectedMood && (
            <div className="mood-intensity-section animate-fade-in">
              <label className="label">
                How {selectedMood.toLowerCase()} are you feeling?
                <span className="intensity-value-label"> — {INTENSITY_LABELS[intensity - 1]}</span>
              </label>
              <div className="intensity-slider-wrap">
                <span className="intensity-emoji-min">😐</span>
                <input
                  type="range"
                  className="intensity-slider"
                  min={1}
                  max={6}
                  value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                />
                <span className="intensity-emoji-max">🔥</span>
              </div>
              <div className="intensity-dots">
                {INTENSITY_LABELS.map((l, i) => (
                  <span
                    key={i}
                    className={`intensity-dot ${i + 1 <= intensity ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedMood && (
            <div className="mood-note-section animate-fade-in">
              <label className="label">
                Add a note
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>
              </label>
              <textarea
                className="input mood-note-input"
                placeholder="What's on your mind? Share as much or as little as you'd like..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                maxLength={500}
              />
              {note.length > 0 && (
                <span className="note-char-count">{note.length}/500</span>
              )}
            </div>
          )}

          {error && <div className="mood-error" role="alert">⚠️ {error}</div>}

          <button
            className="btn btn-primary btn-lg mood-submit"
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className="auth-spinner" /> Saving...
              </span>
            ) : selectedMood ? `Continue with ${selectedMood} ✨` : 'Select a mood to continue'}
          </button>
        </div>
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
