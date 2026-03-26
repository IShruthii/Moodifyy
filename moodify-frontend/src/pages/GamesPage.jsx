import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import FeedbackModal from '../components/common/FeedbackModal'
import { useMood } from '../context/MoodContext'
import './GamesPage.css'

// Breathing Game
function BreathingGame() {
  const [phase, setPhase] = useState('idle')
  const [count, setCount] = useState(0)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const PHASES = [
    { name: 'Breathe In', duration: 4, color: '#14b8a6' },
    { name: 'Hold', duration: 4, color: '#8b5cf6' },
    { name: 'Breathe Out', duration: 6, color: '#3b82f6' },
    { name: 'Rest', duration: 2, color: '#6b7280' },
  ]

  const [phaseIdx, setPhaseIdx] = useState(0)

  const start = () => {
    setPhase('running')
    setPhaseIdx(0)
    setCount(PHASES[0].duration)
  }

  useEffect(() => {
    if (phase !== 'running') return
    if (count <= 0) {
      const next = (phaseIdx + 1) % PHASES.length
      if (next === 0) setCycles(c => c + 1)
      setPhaseIdx(next)
      setCount(PHASES[next].duration)
      return
    }
    intervalRef.current = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(intervalRef.current)
  }, [phase, count, phaseIdx])

  const currentPhase = PHASES[phaseIdx]
  const progress = phase === 'running' ? ((currentPhase.duration - count) / currentPhase.duration) * 100 : 0

  return (
    <div className="game-container">
      <h2 className="game-title">🫁 Breathing Exercise</h2>
      <p className="game-desc">Follow the rhythm to calm your nervous system</p>

      <div className="breathing-circle-wrap">
        <div
          className={`breathing-circle ${phase === 'running' ? 'active' : ''}`}
          style={{
            '--phase-color': phase === 'running' ? currentPhase.color : '#7c3aed',
            transform: phase === 'running' && phaseIdx === 0 ? `scale(${1 + progress * 0.003})` :
                       phase === 'running' && phaseIdx === 2 ? `scale(${1.3 - progress * 0.003})` : 'scale(1)',
          }}
        >
          <div className="breathing-inner">
            {phase === 'idle' ? (
              <>
                <span className="breathing-icon">🌿</span>
                <span className="breathing-text">Ready</span>
              </>
            ) : (
              <>
                <span className="breathing-phase-name">{currentPhase.name}</span>
                <span className="breathing-count">{count}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {cycles > 0 && (
        <div className="breathing-cycles">
          Completed {cycles} cycle{cycles > 1 ? 's' : ''} 🌟
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={phase === 'idle' ? start : () => { setPhase('idle'); clearTimeout(intervalRef.current) }}
      >
        {phase === 'idle' ? 'Start Breathing' : 'Stop'}
      </button>
    </div>
  )
}

// Word Scramble Game
const WORDS = ['HAPPY', 'CALM', 'PEACE', 'JOY', 'HOPE', 'LOVE', 'SMILE', 'BRIGHT', 'WARM', 'LIGHT']

function scramble(word) {
  return word.split('').sort(() => Math.random() - 0.5).join('')
}

function WordScrambleGame() {
  const [wordIdx, setWordIdx] = useState(0)
  const [scrambled, setScrambled] = useState(() => scramble(WORDS[0]))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')

  const check = () => {
    if (input.toUpperCase() === WORDS[wordIdx]) {
      setScore(s => s + 1)
      setFeedback('Correct! 🎉')
      setTimeout(() => {
        const next = (wordIdx + 1) % WORDS.length
        setWordIdx(next)
        setScrambled(scramble(WORDS[next]))
        setInput('')
        setFeedback('')
      }, 1000)
    } else {
      setFeedback('Try again! 💪')
      setTimeout(() => setFeedback(''), 1000)
    }
  }

  return (
    <div className="game-container">
      <h2 className="game-title">📝 Word Scramble</h2>
      <p className="game-desc">Unscramble the positive words</p>

      <div className="score-badge">Score: {score}</div>

      <div className="scramble-word">{scrambled}</div>

      <div className="scramble-input-row">
        <input
          type="text"
          className="input"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Your answer..."
          maxLength={10}
        />
        <button className="btn btn-primary" onClick={check}>Check</button>
      </div>

      {feedback && (
        <div className={`scramble-feedback ${feedback.includes('Correct') ? 'correct' : 'wrong'}`}>
          {feedback}
        </div>
      )}

      <button className="btn btn-secondary btn-sm" onClick={() => setScrambled(scramble(WORDS[wordIdx]))}>
        Reshuffle
      </button>
    </div>
  )
}

// Reflex Tap Game
function ReflexTapGame() {
  const [active, setActive] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [target, setTarget] = useState({ x: 50, y: 50, visible: false })
  const timerRef = useRef(null)
  const targetRef = useRef(null)

  const start = () => {
    setActive(true)
    setScore(0)
    setTimeLeft(30)
    showTarget()
  }

  const showTarget = () => {
    setTarget({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      visible: true,
    })
    targetRef.current = setTimeout(() => {
      setTarget(t => ({ ...t, visible: false }))
      setTimeout(showTarget, 500)
    }, 1200)
  }

  useEffect(() => {
    if (!active) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setActive(false)
          clearInterval(timerRef.current)
          clearTimeout(targetRef.current)
          setTarget(t => ({ ...t, visible: false }))
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [active])

  const handleTap = () => {
    if (!target.visible) return
    setScore(s => s + 1)
    setTarget(t => ({ ...t, visible: false }))
    clearTimeout(targetRef.current)
    setTimeout(showTarget, 300)
  }

  return (
    <div className="game-container">
      <h2 className="game-title">⚡ Reflex Tap</h2>
      <p className="game-desc">Tap the circles as fast as you can!</p>

      <div className="reflex-stats">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className="reflex-arena" onClick={active && !target.visible ? undefined : undefined}>
        {active && target.visible && (
          <button
            className="reflex-target"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            onClick={handleTap}
          />
        )}
        {!active && timeLeft === 0 && (
          <div className="reflex-result">
            <span>Final Score: {score} 🎯</span>
          </div>
        )}
      </div>

      {!active && (
        <button className="btn btn-primary btn-lg" onClick={start}>
          {timeLeft === 0 ? 'Play Again' : 'Start Game'}
        </button>
      )}
    </div>
  )
}

// Emoji Match Game
const EMOJI_PAIRS = ['😊', '🌟', '💙', '🌸', '🎵', '🌈', '🦋', '🌙']

function EmojiMatchGame() {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    const deck = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false }))
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
  }, [])

  const handleFlip = (id) => {
    if (flipped.length === 2) return
    if (flipped.includes(id) || matched.includes(id)) return

    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newFlipped
      if (cards[a].emoji === cards[b].emoji) {
        setMatched(prev => [...prev, a, b])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const reset = () => {
    const deck = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false }))
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  const won = matched.length === cards.length && cards.length > 0

  return (
    <div className="game-container">
      <h2 className="game-title">😊 Emoji Match</h2>
      <p className="game-desc">Find all matching pairs</p>

      <div className="emoji-stats">
        <span>Moves: {moves}</span>
        <span>Matched: {matched.length / 2}/{EMOJI_PAIRS.length}</span>
      </div>

      {won ? (
        <div className="emoji-won">
          <span>🎉 You won in {moves} moves!</span>
          <button className="btn btn-primary" onClick={reset}>Play Again</button>
        </div>
      ) : (
        <div className="emoji-grid">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id)
            return (
              <button
                key={card.id}
                className={`emoji-card ${isFlipped ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                onClick={() => handleFlip(card.id)}
              >
                {isFlipped ? card.emoji : '?'}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Color Word Mismatch Game (Stroop Effect)
const COLOR_LIST = [
  { name: 'RED',    hex: '#ef4444' },
  { name: 'BLUE',   hex: '#3b82f6' },
  { name: 'GREEN',  hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
]

function pickRandom(arr, exclude) {
  const pool = arr.filter(c => c.name !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateRound() {
  const word  = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]
  const ink   = pickRandom(COLOR_LIST, word.name)   // ink is always different from word
  // build 4 answer options: correct ink + 3 distractors
  const distractors = COLOR_LIST
    .filter(c => c.name !== ink.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const options = [...distractors, ink].sort(() => Math.random() - 0.5)
  return { word, ink, options }
}

function ColorWordGame() {
  const [round,     setRound]     = useState(() => generateRound())
  const [score,     setScore]     = useState(0)
  const [lives,     setLives]     = useState(3)
  const [feedback,  setFeedback]  = useState(null)   // 'correct' | 'wrong'
  const [gameOver,  setGameOver]  = useState(false)
  const [best,      setBest]      = useState(0)
  const [streak,    setStreak]    = useState(0)
  const timerRef = useRef(null)

  const next = () => setRound(generateRound())

  const handleAnswer = (chosen) => {
    if (feedback) return   // debounce during flash
    clearTimeout(timerRef.current)

    if (chosen.name === round.ink.name) {
      const newScore  = score + 1
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      setBest(b => Math.max(b, newScore))
      setFeedback('correct')
    } else {
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)
      setFeedback('wrong')
      if (newLives <= 0) {
        setGameOver(true)
        return
      }
    }

    timerRef.current = setTimeout(() => {
      setFeedback(null)
      next()
    }, 600)
  }

  const restart = () => {
    setScore(0)
    setLives(3)
    setStreak(0)
    setFeedback(null)
    setGameOver(false)
    setRound(generateRound())
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="game-container">
      <h2 className="game-title">🎨 Color Word Challenge</h2>
      <p className="game-desc">
        Pick the <strong style={{ color: 'var(--accent-purple-light)' }}>ink color</strong> — ignore what the word says!
      </p>

      {/* HUD */}
      <div className="cw-hud">
        <div className="cw-hud-item">
          <span className="cw-hud-label">Score</span>
          <span className="cw-hud-value">{score}</span>
        </div>
        <div className="cw-hud-item">
          <span className="cw-hud-label">Best</span>
          <span className="cw-hud-value">{best}</span>
        </div>
        <div className="cw-hud-item">
          <span className="cw-hud-label">Streak</span>
          <span className="cw-hud-value">{streak > 0 ? `${streak} 🔥` : streak}</span>
        </div>
        <div className="cw-hud-item">
          <span className="cw-hud-label">Lives</span>
          <span className="cw-hud-value">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
        </div>
      </div>

      {gameOver ? (
        <div className="cw-gameover">
          <span className="cw-gameover-icon">😵</span>
          <p className="cw-gameover-title">Game Over!</p>
          <p className="cw-gameover-score">You scored <strong>{score}</strong></p>
          <p className="cw-gameover-best">Best: {best}</p>
          <button className="btn btn-primary btn-lg" onClick={restart}>Play Again</button>
        </div>
      ) : (
        <>
          {/* The mismatched word */}
          <div
            className={`cw-word ${feedback ? `cw-flash-${feedback}` : ''}`}
            style={{ color: round.ink.hex }}
          >
            {round.word.name}
          </div>

          <p className="cw-instruction">What color is the text written in?</p>

          {/* Answer buttons */}
          <div className="cw-options">
            {round.options.map(opt => (
              <button
                key={opt.name}
                className={`cw-option-btn ${feedback && opt.name === round.ink.name ? 'cw-correct-reveal' : ''}`}
                style={{ '--opt-color': opt.hex }}
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
              >
                <span className="cw-option-dot" style={{ background: opt.hex }} />
                {opt.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const GAMES = {
  'breathing': { component: BreathingGame, title: 'Breathing Exercise', emoji: '🫁' },
  'bubble-pop': { component: BreathingGame, title: 'Bubble Pop Calm', emoji: '🫧' },
  'word-scramble': { component: WordScrambleGame, title: 'Word Scramble', emoji: '📝' },
  'reflex-tap': { component: ReflexTapGame, title: 'Reflex Tap', emoji: '⚡' },
  'emoji-match': { component: EmojiMatchGame, title: 'Emoji Match', emoji: '😊' },
  'tap-release': { component: ReflexTapGame, title: 'Tap Release', emoji: '👊' },
  'trivia': { component: WordScrambleGame, title: 'Mood Trivia', emoji: '🎯' },
  'coloring': { component: EmojiMatchGame, title: 'Mindful Coloring', emoji: '🎨' },
  'emoji-story': { component: EmojiMatchGame, title: 'Emoji Story', emoji: '📖' },
  'gratitude-jar': { component: BreathingGame, title: 'Gratitude Jar', emoji: '🫙' },
  'color-splash': { component: EmojiMatchGame, title: 'Color Splash', emoji: '🎨' },
  'color-word': { component: ColorWordGame, title: 'Color Word Challenge', emoji: '🎨' },
}

export default function GamesPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { currentMood } = useMood()
  const game = GAMES[gameId]
  const [showFeedback, setShowFeedback] = useState(false)

  if (!game) {
    return (
      <Layout>
        <div className="game-not-found">
          <span>🎮</span>
          <p>Game not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/recommendations')}>
            Back to Recommendations
          </button>
        </div>
      </Layout>
    )
  }

  const GameComponent = game.component

  return (
    <Layout>
      {showFeedback && (
        <FeedbackModal
          moodBefore={currentMood}
          moodAfter={null}
          sessionType="GAME"
          onDone={() => { setShowFeedback(false); navigate(-1) }}
          onSkip={() => { setShowFeedback(false); navigate(-1) }}
        />
      )}
      <div className="games-page animate-fade-in">
        <div className="games-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="games-title">{game.emoji} {game.title}</h1>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFeedback(true)}
          >
            Rate this game ⭐
          </button>
        </div>
        <GameComponent />
      </div>
    </Layout>
  )
}
