import React, { useState, useRef } from 'react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getMonthlyReport } from '../api/analyticsApi'
import { useAuth } from '../context/AuthContext'
import './ReportPage.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const MOOD_EMOJIS = {
  HAPPY:'😊', EXCITED:'🤩', MOTIVATED:'💪', CONFIDENT:'😎', HOPEFUL:'🌟',
  PEACEFUL:'🕊️', RELAXED:'😌', CALM:'🧘', NEUTRAL:'😐', TIRED:'😴',
  BORED:'😑', LONELY:'🥺', INSECURE:'😔', SAD:'😢', ANXIOUS:'😟',
  STRESSED:'😰', OVERWHELMED:'🤯', FRUSTRATED:'😤', ANGRY:'😠', DISAPPOINTED:'😞',
}

const MOOD_COLORS = {
  HAPPY:'#f59e0b', EXCITED:'#f97316', MOTIVATED:'#10b981', CONFIDENT:'#3b82f6',
  HOPEFUL:'#8b5cf6', PEACEFUL:'#14b8a6', RELAXED:'#6366f1', CALM:'#0ea5e9',
  NEUTRAL:'#6b7280', TIRED:'#78716c', BORED:'#9ca3af', LONELY:'#a78bfa',
  INSECURE:'#c084fc', SAD:'#60a5fa', ANXIOUS:'#fb923c', STRESSED:'#f87171',
  OVERWHELMED:'#ef4444', FRUSTRATED:'#f43f5e', ANGRY:'#dc2626', DISAPPOINTED:'#818cf8',
}

export default function ReportPage() {
  const { user } = useAuth()
  const today = new Date()
  const [year,    setYear]    = useState(today.getFullYear())
  const [month,   setMonth]   = useState(today.getMonth() + 1)
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const printRef = useRef(null)

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMonthlyReport(year, month)
      setReport(res.data.data)
    } catch {
      setError('Could not load report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const printContent = printRef.current
    if (!printContent) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Moodify Report — ${report.monthName} ${report.year}</title>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 32px; }
          .report-header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
          .report-logo { font-size: 36px; }
          .report-title { font-size: 28px; font-weight: 800; color: #7c3aed; margin: 8px 0 4px; }
          .report-sub { font-size: 14px; color: #666; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 16px; font-weight: 700; color: #7c3aed; border-left: 4px solid #7c3aed; padding-left: 10px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .stat-box { background: #f8f4ff; border: 1px solid #e0d4ff; border-radius: 12px; padding: 16px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: 800; color: #7c3aed; }
          .stat-label { font-size: 12px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .mood-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
          .mood-bar-wrap { flex: 1; height: 10px; background: #f0e8ff; border-radius: 5px; overflow: hidden; }
          .mood-bar { height: 100%; border-radius: 5px; }
          .mood-label { width: 120px; font-size: 13px; font-weight: 600; }
          .mood-count { width: 30px; text-align: right; font-size: 13px; color: #666; }
          .feedback-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
          .stars { color: #f59e0b; font-size: 14px; }
          .comment-box { background: #f8f4ff; border-left: 3px solid #7c3aed; padding: 10px 14px; border-radius: 0 8px 8px 0; margin-bottom: 8px; }
          .comment-text { font-size: 13px; color: #333; font-style: italic; }
          .comment-meta { font-size: 11px; color: #888; margin-top: 4px; }
          .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
          .cal-day-name { text-align: center; font-size: 10px; font-weight: 700; color: #888; padding: 4px 0; text-transform: uppercase; }
          .cal-cell { aspect-ratio: 1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; border: 1px solid #f0e8ff; }
          .cal-cell.has-mood { border-color: #c4b5fd; }
          .cal-num { font-weight: 600; color: #333; }
          .cal-emoji { font-size: 12px; }
          .cal-fb { font-size: 8px; color: #f59e0b; }
          .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0d4ff; font-size: 12px; color: #888; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <div class="footer">Generated by Moodify · ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
      </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const maxMoodCount = report
    ? Math.max(...Object.values(report.moodFrequency || {}).map(Number), 1)
    : 1

  const calDays = () => {
    if (!report) return []
    const firstDay = new Date(report.year, report.month - 1, 1).getDay()
    const daysInMonth = new Date(report.year, report.month, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }

  const fmt = (d) => {
    if (!report) return ''
    const mm = String(report.month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${report.year}-${mm}-${dd}`
  }

  return (
    <Layout>
      <div className="report-page animate-fade-in">
        <div className="report-page-header">
          <h1 className="page-title">Monthly Report</h1>
          <p className="page-subtitle">Download your emotional wellness summary</p>
        </div>

        {/* Controls */}
        <div className="report-controls glass">
          <div className="report-control-group">
            <label className="label">Month</label>
            <select className="input report-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="report-control-group">
            <label className="label">Year</label>
            <select className="input report-select" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn btn-primary report-generate-btn" onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>

        {error && <div className="report-error">⚠️ {error}</div>}

        {loading && (
          <div className="report-loading">
            <LoadingSpinner size="lg" text="Building your report..." />
          </div>
        )}

        {report && !loading && (
          <>
            <div className="report-actions">
              <button className="btn btn-primary btn-lg" onClick={handleDownload}>
                ⬇️ Download PDF
              </button>
            </div>

            {/* Printable report */}
            <div ref={printRef} className="report-preview">

              {/* Header */}
              <div className="report-header">
                <div className="report-logo">🎭</div>
                <h1 className="report-title">Moodify Wellness Report</h1>
                <p className="report-sub">{report.monthName} {report.year} · {report.userName}</p>
              </div>

              {/* Summary stats */}
              <div className="section">
                <h2 className="section-title">Monthly Summary</h2>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-value">{report.totalMoodEntries}</div>
                    <div className="stat-label">Mood Check-ins</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{report.positiveRatio}%</div>
                    <div className="stat-label">Positive Days</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{report.currentStreak}🔥</div>
                    <div className="stat-label">Current Streak</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{report.mostFrequentMoodEmoji}</div>
                    <div className="stat-label">Top Mood: {report.mostFrequentMood}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{report.totalFeedback}</div>
                    <div className="stat-label">Sessions Rated</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{report.averageFeedbackRating}★</div>
                    <div className="stat-label">Avg Rating</div>
                  </div>
                </div>
              </div>

              {/* Mood frequency */}
              {Object.keys(report.moodFrequency || {}).length > 0 && (
                <div className="section">
                  <h2 className="section-title">Mood Breakdown</h2>
                  <div className="mood-breakdown">
                    {Object.entries(report.moodFrequency)
                      .sort((a, b) => b[1] - a[1])
                      .map(([mood, count]) => (
                        <div key={mood} className="mood-row">
                          <span className="mood-label">
                            {MOOD_EMOJIS[mood] || '😐'} {mood}
                          </span>
                          <div className="mood-bar-wrap">
                            <div
                              className="mood-bar"
                              style={{
                                width: `${Math.round((Number(count) / maxMoodCount) * 100)}%`,
                                background: MOOD_COLORS[mood] || '#7c3aed',
                              }}
                            />
                          </div>
                          <span className="mood-count">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              {report.totalMoodEntries > 0 && (
                <div className="section">
                  <h2 className="section-title">Mood Calendar — {report.monthName}</h2>
                  <div className="report-cal">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} className="cal-day-name">{d}</div>
                    ))}
                    {calDays().map((day, i) => {
                      if (!day) return <div key={`e-${i}`} className="cal-cell empty" />
                      const dateStr = fmt(day)
                      const mood = report.calendarData?.[dateStr]
                      const fb   = report.feedbackCalendar?.[dateStr]
                      return (
                        <div
                          key={dateStr}
                          className={`cal-cell ${mood ? 'has-mood' : ''}`}
                          style={mood ? { borderColor: MOOD_COLORS[mood] || '#7c3aed', background: `${MOOD_COLORS[mood]}18` } : {}}
                        >
                          <span className="cal-num">{day}</span>
                          {mood && <span className="cal-emoji">{MOOD_EMOJIS[mood] || ''}</span>}
                          {fb && <span className="cal-fb">{'★'.repeat(Math.min(fb, 3))}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Feedback comments */}
              {report.recentFeedbackComments?.length > 0 && (
                <div className="section">
                  <h2 className="section-title">Your Feedback</h2>
                  <div className="feedback-list">
                    {report.recentFeedbackComments.map((f, i) => (
                      <div key={i} className="comment-box">
                        <div className="feedback-row">
                          <span className="stars">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                          <span className="comment-meta">{f.date} · {f.sessionType}</span>
                        </div>
                        <p className="comment-text">"{f.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wellness note */}
              <div className="section report-note">
                <h2 className="section-title">Wellness Note</h2>
                <p className="report-note-text">
                  {report.positiveRatio >= 70
                    ? `${report.userName}, you had a wonderful month! ${report.positiveRatio}% of your days were positive. Keep nurturing this energy. 🌟`
                    : report.positiveRatio >= 40
                    ? `${report.userName}, you navigated a mixed month with resilience. ${report.totalMoodEntries} check-ins show real commitment to your wellbeing. Keep going. 💙`
                    : `${report.userName}, this was a challenging month. But you showed up ${report.totalMoodEntries} times — and that matters more than you know. 🌿`
                  }
                </p>
              </div>

            </div>
          </>
        )}

        {!report && !loading && (
          <div className="report-empty">
            <span>📊</span>
            <p>Select a month and generate your report</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
