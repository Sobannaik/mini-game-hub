import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './RockPaperScissors.css'

export default function RockPaperScissors() {
  const navigate = useNavigate()
  
  // Game assets
  const choices = ['R', 'P', 'S']
  const emojis = {
    R: '✊',
    P: '✋',
    S: '✌️'
  }
  
  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [round, setRound] = useState(0)
  const [userChoice, setUserChoice] = useState('R')
  const [computerChoice, setComputerChoice] = useState('R')
  const [resultMsg, setResultMsg] = useState('')
  const [resultClass, setResultClass] = useState('')
  
  // Session Stats
  const [sessionStats, setSessionStats] = useState({ wins: 0, draws: 0, losses: 0 })
  
  // All-time Stats
  const [allTimeStats, setAllTimeStats] = useState({ wins: 0, draws: 0, losses: 0 })
  
  // Modals
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem('tronRPSRecords')
    if (saved) {
      try {
        setAllTimeStats(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse RPS records")
      }
    }
  }, [])

  // Save all-time stats when they change (but skip initial mount)
  useEffect(() => {
    if (allTimeStats.wins > 0 || allTimeStats.draws > 0 || allTimeStats.losses > 0) {
      localStorage.setItem('tronRPSRecords', JSON.stringify(allTimeStats))
    }
  }, [allTimeStats])

  const playGame = (choice) => {
    if (isPlaying) return
    setIsPlaying(true)
    setResultMsg('')
    setResultClass('')
    
    const finalCompChoice = choices[Math.floor(Math.random() * choices.length)]
    
    let animationCount = 0
    const animation = setInterval(() => {
      const randomUser = choices[Math.floor(Math.random() * choices.length)]
      const randomComputer = choices[Math.floor(Math.random() * choices.length)]
      
      setUserChoice(randomUser)
      setComputerChoice(randomComputer)
      
      animationCount++
      if (animationCount >= 15) {
        clearInterval(animation)
        setUserChoice(choice)
        setComputerChoice(finalCompChoice)
        showResult(choice, finalCompChoice)
        setIsPlaying(false)
      }
    }, 100)
  }

  const showResult = (userC, compC) => {
    setRound(r => r + 1)
    
    if (userC === compC) {
      setSessionStats(s => ({ ...s, draws: s.draws + 1 }))
      setAllTimeStats(s => ({ ...s, draws: s.draws + 1 }))
      setResultMsg("◇ DRAW // SYSTEMS MATCHED")
      setResultClass("draw")
    } else if (
      (userC === "R" && compC === "S") ||
      (userC === "P" && compC === "R") ||
      (userC === "S" && compC === "P")
    ) {
      setSessionStats(s => ({ ...s, wins: s.wins + 1 }))
      setAllTimeStats(s => ({ ...s, wins: s.wins + 1 }))
      setResultMsg("◆ VICTORY // YOU WIN")
      setResultClass("win")
    } else {
      setSessionStats(s => ({ ...s, losses: s.losses + 1 }))
      setAllTimeStats(s => ({ ...s, losses: s.losses + 1 }))
      setResultMsg("◆ DEFEAT // SYSTEM WINS")
      setResultClass("lose")
    }
  }

  const resetAllData = () => {
    localStorage.removeItem('tronRPSRecords')
    setAllTimeStats({ wins: 0, draws: 0, losses: 0 })
    setSessionStats({ wins: 0, draws: 0, losses: 0 })
    setRound(0)
    setResultMsg('')
    setResultClass('')
    setShowResetConfirm(false)
  }

  return (
    <div className="rps-container">
      
      <div className="top-actions">
        <button className="back-btn" onClick={() => navigate('/games')}>
          ← Back to Games
        </button>
        <button className="reset-data-btn" onClick={() => setShowResetConfirm(true)}>
          ⟳ RESET DATA
        </button>
      </div>

      <main className="game-wrapper">
        
        {/* Main Game Section */}
        <section className="game-card">
          <div className="round-display">
            CURRENT ROUND
            <span>{String(round + 1).padStart(3, '0')}</span>
          </div>

          <div className="title-section">
            <h1>
              <span>ROCK</span>
              <span>PAPER</span>
              <span>SCISSORS</span>
            </h1>
            <p>MAKE YOUR MOVE // DEFEAT THE SYSTEM</p>
          </div>

          <div className="battle">
            <div className="player-area">
              <div className="player-label computer-label">SYSTEM</div>
              <div className="image-box computer-box">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
                <div className="choice-emoji">{emojis[computerChoice]}</div>
              </div>
              <div className="choice-label">COMPUTER MOVE</div>
            </div>

            <div className="vs-area">
              <div className="vs">VS</div>
            </div>

            <div className="player-area">
              <div className="player-label user-label">USER</div>
              <div className="image-box user-box">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
                <div className="choice-emoji">{emojis[userChoice]}</div>
              </div>
              <div className="choice-label">YOUR MOVE</div>
            </div>
          </div>

          <div className={`result ${resultClass}`}>
            {resultMsg}
          </div>

          <div className="choose-section">
            <div className="section-heading">SELECT WEAPON</div>
            <div className="buttons">
              <button onClick={() => playGame('R')} disabled={isPlaying}>
                <span className="button-icon">✊</span>
                <span>ROCK</span>
                <small>R</small>
              </button>
              <button onClick={() => playGame('P')} disabled={isPlaying}>
                <span className="button-icon">✋</span>
                <span>PAPER</span>
                <small>P</small>
              </button>
              <button onClick={() => playGame('S')} disabled={isPlaying}>
                <span className="button-icon">✌️</span>
                <span>SCISSORS</span>
                <small>S</small>
              </button>
            </div>
          </div>

          <div className="score-panel">
            <div className="score-title">CURRENT SESSION</div>
            <div className="score-item wins">
              <span>WINS</span>
              <strong>{sessionStats.wins}</strong>
            </div>
            <div className="score-divider"></div>
            <div className="score-item draws">
              <span>DRAWS</span>
              <strong>{sessionStats.draws}</strong>
            </div>
            <div className="score-divider"></div>
            <div className="score-item losses">
              <span>LOSSES</span>
              <strong>{sessionStats.losses}</strong>
            </div>
          </div>
        </section>

        {/* Sidebar Info Panel */}
        <aside className="info-panel">
          <div className="info-card all-time-card">
            <div className="info-title">
              <span>◈</span> ALL-TIME RECORD
            </div>
            <div className="all-time-stat win-stat">
              <div>
                <span>WINS</span>
                <small>VICTORIES</small>
              </div>
              <strong>{allTimeStats.wins}</strong>
            </div>
            <div className="all-time-stat draw-stat">
              <div>
                <span>DRAWS</span>
                <small>NEUTRAL</small>
              </div>
              <strong>{allTimeStats.draws}</strong>
            </div>
            <div className="all-time-stat loss-stat">
              <div>
                <span>LOSSES</span>
                <small>DEFEATS</small>
              </div>
              <strong>{allTimeStats.losses}</strong>
            </div>
          </div>

          <div className="info-card">
            <div className="info-title">
              <span>◇</span> COMBAT PROTOCOL
            </div>
            <div className="rule">
              <span className="rule-number">01</span>
              <p>Rock defeats Scissors</p>
            </div>
            <div className="rule">
              <span className="rule-number">02</span>
              <p>Paper defeats Rock</p>
            </div>
            <div className="rule">
              <span className="rule-number">03</span>
              <p>Scissors defeats Paper</p>
            </div>
          </div>
        </aside>

      </main>

      {/* Reset Confirmation Modal */}
      <div className={`reset-confirmation ${showResetConfirm ? 'active' : ''}`}>
        <div className="reset-box">
          <div className="reset-icon">!</div>
          <h2>RESET SYSTEM?</h2>
          <p>All current and all-time W/L/D records will be permanently deleted.</p>
          <div className="reset-actions">
            <button id="confirm-reset" onClick={resetAllData}>CONFIRM RESET</button>
            <button id="cancel-reset" onClick={() => setShowResetConfirm(false)}>CANCEL</button>
          </div>
        </div>
      </div>

    </div>
  )
}
