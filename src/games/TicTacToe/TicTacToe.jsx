import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TicTacToe.css'

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

export default function TicTacToe() {
  const navigate = useNavigate()
  
  // Game Modes: 'setup' -> 'playing'
  const [gameMode, setGameMode] = useState('setup')
  const [humanPlayer, setHumanPlayer] = useState(null)
  const [aiPlayer, setAiPlayer] = useState(null)

  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [gameActive, setGameActive] = useState(false)
  const [winningCells, setWinningCells] = useState([])
  const [statusMessage, setStatusMessage] = useState("Choose your side")

  const [xScore, setXScore] = useState(0)
  const [oScore, setOScore] = useState(0)
  const [drawScore, setDrawScore] = useState(0)

  // ----------------------------------------------------
  // GAME SETUP
  // ----------------------------------------------------
  const startGame = (chosenSide) => {
    setHumanPlayer(chosenSide)
    const ai = chosenSide === 'X' ? 'O' : 'X'
    setAiPlayer(ai)
    
    setBoard(Array(9).fill(''))
    setCurrentPlayer('X')
    setGameActive(true)
    setWinningCells([])
    setGameMode('playing')
    setStatusMessage("Player X's Turn")
  }

  // ----------------------------------------------------
  // AI LOGIC
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode === 'playing' && gameActive && currentPlayer === aiPlayer) {
      const timer = setTimeout(() => {
        makeAiMove()
      }, 600) // slight delay to feel like it's "thinking"
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameActive])

  const makeAiMove = () => {
    const available = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null)
    if (available.length === 0) return

    let move = -1

    // 1. Can AI win?
    move = findWinningMove(board, aiPlayer)
    
    // 2. Can Human win? (Block)
    if (move === -1) {
      move = findWinningMove(board, humanPlayer)
    }

    // 3. Take center if available
    if (move === -1 && board[4] === '') {
      move = 4
    }

    // 4. Take random available corner
    if (move === -1) {
      const corners = [0, 2, 6, 8].filter(c => board[c] === '')
      if (corners.length > 0) {
        move = corners[Math.floor(Math.random() * corners.length)]
      }
    }

    // 5. Take random available edge
    if (move === -1) {
      move = available[Math.floor(Math.random() * available.length)]
    }

    if (move !== -1) {
      executeMove(move, aiPlayer)
    }
  }

  const findWinningMove = (currentBoard, playerSymbol) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      const values = [currentBoard[a], currentBoard[b], currentBoard[c]]
      
      const pCount = values.filter(v => v === playerSymbol).length
      const eCount = values.filter(v => v === '').length
      
      if (pCount === 2 && eCount === 1) {
        if (currentBoard[a] === '') return a
        if (currentBoard[b] === '') return b
        if (currentBoard[c] === '') return c
      }
    }
    return -1
  }

  // ----------------------------------------------------
  // MOVE EXECUTION
  // ----------------------------------------------------
  const handleCellClick = (index) => {
    // Only allow click if playing and it's human's turn
    if (gameMode !== 'playing' || !gameActive || currentPlayer !== humanPlayer || board[index] !== '') {
      return
    }
    executeMove(index, humanPlayer)
  }

  const executeMove = (index, playerSymbol) => {
    const newBoard = [...board]
    newBoard[index] = playerSymbol
    setBoard(newBoard)

    const winResult = checkWinner(newBoard)

    if (winResult) {
      setStatusMessage(`Player ${playerSymbol} Wins!`)
      setWinningCells(winResult.combo)
      if (playerSymbol === 'X') setXScore(s => s + 1)
      else setOScore(s => s + 1)
      setGameActive(false)
      return
    }

    if (newBoard.every(cell => cell !== '')) {
      setStatusMessage("It's a Draw!")
      setDrawScore(s => s + 1)
      setGameActive(false)
      return
    }

    const nextPlayer = playerSymbol === 'X' ? 'O' : 'X'
    setCurrentPlayer(nextPlayer)
    setStatusMessage(`Player ${nextPlayer}'s Turn`)
  }

  const checkWinner = (currentBoard) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      if (
        currentBoard[a] !== '' &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], combo }
      }
    }
    return null
  }

  const restartGame = () => {
    setGameMode('setup')
    setHumanPlayer(null)
    setAiPlayer(null)
    setBoard(Array(9).fill(''))
    setGameActive(false)
    setWinningCells([])
    setStatusMessage("Choose your side")
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>OX GAME</h1>
        <p>{statusMessage}</p>
      </header>

      <section className="game-area">
        <div className="board-card" style={{ position: 'relative' }}>
          
          {/* Setup Overlay */}
          {gameMode === 'setup' && (
            <div className="setup-overlay">
              <div className="setup-box">
                <h3>Select Your Weapon</h3>
                <div className="setup-buttons">
                  <button className="choose-btn x-btn" onClick={() => startGame('X')}>
                    <span>X</span>
                    <small>Goes First</small>
                  </button>
                  <button className="choose-btn o-btn" onClick={() => startGame('O')}>
                    <span>O</span>
                    <small>Goes Second</small>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="board">
            {board.map((cell, index) => {
              const isWinner = winningCells.includes(index)
              const cellClass = `cell ${cell ? cell.toLowerCase() : ''} ${isWinner ? 'winner' : ''}`
              const disabled = gameMode !== 'playing' || !gameActive || !!cell || currentPlayer !== humanPlayer
              
              return (
                <button 
                  key={index} 
                  className={cellClass}
                  onClick={() => handleCellClick(index)}
                  disabled={disabled}
                  aria-label={`Cell ${index}`}
                >
                  {cell}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="side-panel">
          <div className="info-card">
            <div className="card-title">
              <span className="card-icon">🏆</span>
              <h2>Game Score</h2>
            </div>
            <div className="score">
              <div className="score-item x-score">
                <span>X</span>
                <strong>{xScore}</strong>
                <small>{humanPlayer === 'X' ? 'YOU' : 'AI'}</small>
              </div>
              <div className="score-item o-score">
                <span>O</span>
                <strong>{oScore}</strong>
                <small>{humanPlayer === 'O' ? 'YOU' : 'AI'}</small>
              </div>
              <div className="score-item draw-score">
                <span>—</span>
                <strong>{drawScore}</strong>
                <small>DRAWS</small>
              </div>
            </div>
          </div>

          <div className="info-card how-card">
            <div className="card-title">
              <span className="card-icon">💡</span>
              <h2>How to Play</h2>
            </div>
            <ul>
              <li>
                <span>01</span>
                <p>Choose X or O to start.</p>
              </li>
              <li>
                <span>02</span>
                <p>Play against the AI system.</p>
              </li>
              <li>
                <span>03</span>
                <p>Get three symbols in a row to win.</p>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <div className="buttons-container">
        {gameMode === 'playing' && (
          <button onClick={restartGame} className="action-btn restart-btn">
            <span>↻</span> End Game
          </button>
        )}
        <button onClick={() => navigate('/games')} className="action-btn back-btn">
          ← Back to Games
        </button>
      </div>

      <p className="footer-text">Good luck & have fun! ✨</p>
    </div>
  )
}
