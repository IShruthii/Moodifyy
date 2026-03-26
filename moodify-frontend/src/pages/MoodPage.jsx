import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import MoodSelector from '../components/mood/MoodSelector'
import ChatbotFAB from '../components/chatbot/ChatbotFAB'
import { logMood } from '../api/moodApi'
import { useMood } from '../context/MoodContext'
import './MoodPage.css'

export default function MoodPage() {
  const navigate = useNavigate()
  const { setCurrentMood } = useMood()
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedMood) {
      setError('Please select how you are feeling')
      return
    }
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
            <div className="mood-note-section animate-fade-in">
              <label className="label">Add a note (optional)</label>
              <textarea
                className="input mood-note-input"
                placeholder="What's on your mind? Share as much or as little as you'd like..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && (
            <div className="mood-error">⚠️ {error}</div>
          )}

          <button
            className="btn btn-primary btn-lg mood-submit"
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
          >
            {loading ? 'Saving...' : selectedMood ? `Continue with ${selectedMood} ✨` : 'Select a mood to continue'}
          </button>
        </div>
      </div>
      <ChatbotFAB />
    </Layout>
  )
}
