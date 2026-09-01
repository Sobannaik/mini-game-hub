import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReactionTime.css'

export default function ReactionTime() {
  const navigate = useNavigate()
  
  // Storage state
  const [records, setRecords] = useState({ totalPopped: 0, bestTime: null, bestAverage: null })
  
  // Game state
  const [gameState, setGameState] = useState('start') // start, countdown, playing, end
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(0)
  
  // Result state
  const [finalScore, setFinalScore] = useState(0)
  const [finalAverage, setFinalAverage] = useState(0)
  const [finalBest, setFinalBest] = useState(0)
  
  // Celebration state
  const [celebration, setCelebration] = useState(null) // null or { symbol, title, type, value }
  
  // UI state
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  // Bubble state
  const [bubble, setBubble] = useState(null)
  
  // Refs for timers and tracking
  const gameAreaRef = useRef(null)
  const reactionTimesRef = useRef([])
  const bubbleStartTimeRef = useRef(0)
  const lifetimeRef = useRef(2500)
  
  const disappearTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const countdownDelayTimerRef = useRef(null)
  const celebrationTimerRef = useRef(null)
  const celebrationSequenceRef = useRef(null)

  // Load records on mount
  useEffect(() => {
    const saved = localStorage.getItem("reactionRushRecords")
    if (saved) {
      try {
        setRecords(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse records")
      }
    }
    
    // Cleanup timers on unmount
    return () => {
      clearAllTimers()
    }
  }, [])

  const clearAllTimers = () => {
    if (disappearTimerRef.current) clearTimeout(disappearTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    if (countdownDelayTimerRef.current) clearTimeout(countdownDelayTimerRef.current)
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
    if (celebrationSequenceRef.current) clearTimeout(celebrationSequenceRef.current)
  }

  const startGame = () => {
    if (gameState === 'countdown' || gameState === 'playing') return
    
    clearAllTimers()
    setBubble(null)
    setScore(0)
    reactionTimesRef.current = []
    lifetimeRef.current = 2500
    setCelebration(null)
    
    setGameState('countdown')
    setCountdown(3)
    
    let count = 3
    countdownTimerRef.current = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(countdownTimerRef.current)
        setCountdown('GO!')
        
        countdownDelayTimerRef.current = setTimeout(() => {
          setGameState('playing')
          createBubble()
        }, 400)
      }
    }, 700)
  }

  const createBubble = () => {
    if (disappearTimerRef.current) clearTimeout(disappearTimerRef.current)
    
    if (!gameAreaRef.current) return
    
    const size = Math.floor(Math.random() * 45) + 45
    const maxX = Math.max(0, gameAreaRef.current.clientWidth - size)
    const maxY = Math.max(0, gameAreaRef.current.clientHeight - size)
    const x = Math.random() * maxX
    const y = Math.random() * maxY
    
    const colors = ["#ff4d6d", "#5865f2", "#00c2ff", "#9b5de5", "#00d68f", "#ff9f1c"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    setBubble({ size, x, y, color })
    bubbleStartTimeRef.current = performance.now()
    
    disappearTimerRef.current = setTimeout(() => {
      endGame()
    }, lifetimeRef.current)
  }

  const popBubble = (e) => {
    // Prevent default to avoid selection/double fire issues
    e.preventDefault()
    e.stopPropagation()
    
    if (gameState !== 'playing' || !bubble) return
    
    const reactionTime = performance.now() - bubbleStartTimeRef.current
    reactionTimesRef.current.push(reactionTime)
    
    setScore(s => s + 1)
    
    // Update lifetime (gets faster)
    lifetimeRef.current = Math.max(500, lifetimeRef.current - 150)
    
    // Update total popped record immediately
    const newRecords = { ...records, totalPopped: records.totalPopped + 1 }
    setRecords(newRecords)
    localStorage.setItem("reactionRushRecords", JSON.stringify(newRecords))
    
    setBubble(null)
    if (disappearTimerRef.current) clearTimeout(disappearTimerRef.current)
    
    createBubble()
  }

  const endGame = () => {
    setGameState('end')
    setBubble(null)
    if (disappearTimerRef.current) clearTimeout(disappearTimerRef.current)
    
    const times = reactionTimesRef.current
    const average = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    const best = times.length > 0 ? Math.min(...times) : 0
    
    let newBestTime = false
    let newBestAvg = false
    let updatedRecords = { ...records }
    
    if (times.length > 0 && (records.bestTime === null || best < records.bestTime)) {
      updatedRecords.bestTime = best
      newBestTime = true
    }
    
    if (times.length > 0 && (records.bestAverage === null || average < records.bestAverage)) {
      updatedRecords.bestAverage = average
      newBestAvg = true
    }
    
    if (newBestTime || newBestAvg) {
      setRecords(updatedRecords)
      localStorage.setItem("reactionRushRecords", JSON.stringify(updatedRecords))
    }
    
    setFinalScore(score)
    setFinalAverage(Math.round(average))
    setFinalBest(Math.round(best))
    
    // Celebrations
    if (newBestTime && newBestAvg) {
      showCelebration("ϟ", "NEW RECORD", "FASTEST REACTION", `${Math.round(best)} ms`)
      celebrationSequenceRef.current = setTimeout(() => {
        showCelebration("✦", "NEW RECORD", "BEST AVERAGE", `${Math.round(average)} ms`)
      }, 3600)
    } else if (newBestTime) {
      showCelebration("ϟ", "NEW RECORD", "FASTEST REACTION", `${Math.round(best)} ms`)
    } else if (newBestAvg) {
      showCelebration("✦", "NEW RECORD", "BEST AVERAGE", `${Math.round(average)} ms`)
    }
  }

  const showCelebration = (symbol, title, type, value) => {
    setCelebration({ symbol, title, type, value })
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
    celebrationTimerRef.current = setTimeout(() => {
      setCelebration(null)
    }, 3300)
  }

  const resetAllData = () => {
    clearAllTimers()
    setBubble(null)
    setGameState('start')
    setCelebration(null)
    
    const blank = { totalPopped: 0, bestTime: null, bestAverage: null }
    setRecords(blank)
    localStorage.setItem("reactionRushRecords", JSON.stringify(blank))
    setShowResetConfirm(false)
  }

  return (
    <div className="game-container">
      
      {gameState === 'start' && (
        <button className="reset-data-btn" onClick={() => setShowResetConfirm(true)}>
          RESET DATA
        </button>
      )}

      <header className="header">
        <div className="title-line">
          <span></span>
          <h1>REACTION RUSH</h1>
          <span></span>
        </div>
        <p>POP THE BUBBLES BEFORE THEY DISAPPEAR</p>
      </header>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">◈</div>
          <div>
            <span>TOTAL POPPED</span>
            <strong>{records.totalPopped}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">ϟ</div>
          <div>
            <span>BEST TIME</span>
            <strong>{records.bestTime !== null ? `${Math.round(records.bestTime)} ms` : '--'}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✦</div>
          <div>
            <span>BEST AVERAGE</span>
            <strong>{records.bestAverage !== null ? `${Math.round(records.bestAverage)} ms` : '--'}</strong>
          </div>
        </div>
      </section>

      <section className="game-area-box" ref={gameAreaRef}>
        <div className="game-grid"></div>

        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="screen start-screen">
            <div className="start-orb"><div className="orb-core"></div></div>
            <h2>READY?</h2>
            <p>Test your reflexes.<br/>The universe won't wait.</p>
            <button className="main-btn" onClick={startGame}>
              <span>START GAME</span><i></i>
            </button>
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div className="countdown">{countdown}</div>
        )}

        {/* Playing (Bubble) */}
        {gameState === 'playing' && bubble && (
          <div 
            className="bubble"
            onPointerDown={popBubble}
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              top: bubble.y,
              background: bubble.color
            }}
          />
        )}

        {/* Game Over Screen */}
        {gameState === 'end' && (
          <div className="screen game-over">
            <div className="defeat-line">
              <span></span> MISSION COMPLETE <span></span>
            </div>
            <h2>REACTION REPORT</h2>
            <div className="results">
              <div className="result-card">
                <span>BUBBLES POPPED</span>
                <strong>{finalScore}</strong>
              </div>
              <div className="result-card">
                <span>AVERAGE REACTION</span>
                <strong>{finalAverage} ms</strong>
              </div>
              <div className="result-card">
                <span>BEST REACTION</span>
                <strong>{finalBest} ms</strong>
              </div>
            </div>
            <button className="main-btn" onClick={startGame}>
              <span>PLAY AGAIN</span><i></i>
            </button>
          </div>
        )}

        {/* Record Celebration */}
        <div className={`record-celebration ${celebration ? 'active' : ''}`}>
          {celebration && (
            <>
              <div className="record-flash"></div>
              <div className="record-content">
                <div className="record-symbol">{celebration.symbol}</div>
                <div className="record-title">{celebration.title}</div>
                <div className="record-type">{celebration.type}</div>
                <div className="record-value">{celebration.value}</div>
                <div className="record-subtitle">PERSONAL RECORD ESTABLISHED</div>
              </div>
            </>
          )}
        </div>

        {/* Reset Confirmation */}
        <div className={`reset-confirmation ${showResetConfirm ? 'active' : ''}`}>
          <div className="confirmation-box">
            <div className="warning-icon">!</div>
            <div className="confirmation-line">
              <span></span> SYSTEM WARNING <span></span>
            </div>
            <h2>RESET DATA?</h2>
            <p>All lifetime statistics and personal records will be permanently erased.</p>
            <div className="confirmation-buttons">
              <button className="confirm-reset" onClick={resetAllData}>YES, RESET</button>
              <button className="cancel-reset" onClick={() => setShowResetConfirm(false)}>CANCEL</button>
            </div>
          </div>
        </div>

      </section>

      <div style={{ textAlign: 'center' }}>
        <button className="back-btn" onClick={() => navigate('/games')}>
          ← BACK TO GAMES
        </button>
      </div>

      <div className="bottom-info">
        <span>REFLEX TRAINING SYSTEM</span>
        <span>•</span>
        <span>PERSONAL PERFORMANCE TRACKING</span>
      </div>

    </div>
  )
}
