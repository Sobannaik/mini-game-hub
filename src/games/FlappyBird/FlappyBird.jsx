import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FlappyBird.css'

const GAME_WIDTH = 420
const GAME_HEIGHT = 560
const GROUND_HEIGHT = 72
const PLAYER_X = 110
const PLAYER_SIZE = 28
const PIPE_WIDTH = 72
const PIPE_GAP = 150
const GRAVITY = 0.52
const FLAP_POWER = -7.6

const createPipe = (x = GAME_WIDTH + 20) => ({
  id: `${Date.now()}-${Math.random()}`,
  x,
  gapY: 120 + Math.random() * 170,
  scored: false,
})

export default function FlappyBird() {
  const navigate = useNavigate()
  const [birdY, setBirdY] = useState(240)
  const [pipes, setPipes] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(Number(localStorage.getItem('flappy-best-score') || 0))

  const birdVelocityRef = useRef(0)
  const pipeTimerRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimestampRef = useRef(0)

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (pipeTimerRef.current) clearInterval(pipeTimerRef.current)
    }
  }, [])

  const stopGame = () => {
    setIsPlaying(false)
    setStarted(false)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (pipeTimerRef.current) clearInterval(pipeTimerRef.current)
  }

  const startGame = () => {
    setBirdY(240)
    setPipes([])
    setScore(0)
    birdVelocityRef.current = 0
    setStarted(true)
    setIsPlaying(true)

    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (pipeTimerRef.current) clearInterval(pipeTimerRef.current)

    pipeTimerRef.current = setInterval(() => {
      setPipes((currentPipes) => [...currentPipes, createPipe()])
    }, 1350)

    lastTimestampRef.current = 0
    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const flap = () => {
    if (!started || !isPlaying) {
      startGame()
      return
    }

    birdVelocityRef.current = FLAP_POWER
  }

  const gameLoop = (timestamp) => {
    if (!isPlaying) return

    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp
    }

    const delta = (timestamp - lastTimestampRef.current) / 16.67
    lastTimestampRef.current = timestamp

    setBirdY((currentBirdY) => {
      const nextVelocity = birdVelocityRef.current + GRAVITY * delta
      birdVelocityRef.current = nextVelocity
      return currentBirdY + nextVelocity * delta
    })

    setPipes((currentPipes) => {
      const movedPipes = currentPipes
        .map((pipe) => ({ ...pipe, x: pipe.x - 3.2 * delta }))
        .filter((pipe) => pipe.x + PIPE_WIDTH > -10)

      let gainedPoints = 0
      for (const pipe of movedPipes) {
        if (!pipe.scored && pipe.x + PIPE_WIDTH < PLAYER_X) {
          pipe.scored = true
          gainedPoints += 1
        }
      }

      if (gainedPoints > 0) {
        setScore((currentScore) => currentScore + gainedPoints)
      }

      return movedPipes
    })

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    if (!isPlaying) return

    const birdTop = birdY
    const birdBottom = birdY + PLAYER_SIZE
    const hitGround = birdBottom >= GAME_HEIGHT - GROUND_HEIGHT
    const hitCeiling = birdTop <= 0
    const hitPipe = pipes.some((pipe) => {
      const xRangeCollision = PLAYER_X + PLAYER_SIZE > pipe.x && PLAYER_X < pipe.x + PIPE_WIDTH
      const gapTop = pipe.gapY - PIPE_GAP / 2
      const gapBottom = pipe.gapY + PIPE_GAP / 2
      const isInsideGap = birdBottom > gapTop && birdTop < gapBottom
      return xRangeCollision && !isInsideGap
    })

    if (hitGround || hitCeiling || hitPipe) {
      setBestScore((previousBest) => {
        const finalBest = Math.max(previousBest, score)
        localStorage.setItem('flappy-best-score', String(finalBest))
        return finalBest
      })
      stopGame()
    }
  }, [birdY, isPlaying, pipes, score])

  const handlePointerDown = () => {
    flap()
  }

  useEffect(() => {
    const handleKey = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        flap()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, isPlaying])

  return (
    <main className="flappy-bird">
      <div className="flappy-bird__panel">
        <div className="flappy-bird__header">
          <h1>Flappy Bird</h1>
          <div className="flappy-bird__stats">
            <div className="flappy-bird__stat">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="flappy-bird__stat">
              <span>Best</span>
              <strong>{bestScore}</strong>
            </div>
          </div>
        </div>

        <div className="flappy-bird__arena" onPointerDown={handlePointerDown} role="button" tabIndex={0}>
          <div className="flappy-bird__sky" />
          {pipes.map((pipe) => (
            <div key={pipe.id}>
              <div
                className="flappy-bird__pipe flappy-bird__pipe--top"
                style={{
                  left: `${pipe.x}px`,
                  height: `${pipe.gapY - PIPE_GAP / 2}px`,
                }}
              />
              <div
                className="flappy-bird__pipe flappy-bird__pipe--bottom"
                style={{
                  left: `${pipe.x}px`,
                  top: `${pipe.gapY + PIPE_GAP / 2}px`,
                  height: `${GAME_HEIGHT - GROUND_HEIGHT - (pipe.gapY + PIPE_GAP / 2)}px`,
                }}
              />
            </div>
          ))}

          <div
            className="flappy-bird__player"
            style={{
              left: `${PLAYER_X}px`,
              top: `${birdY}px`,
              transform: `rotate(${Math.max(-40, Math.min(60, birdVelocityRef.current * 12))}deg)`,
            }}
          >
            🐤
          </div>

          <div className="flappy-bird__ground" />

          {!isPlaying && (
            <div className="flappy-bird__overlay">
              <h2>{started ? 'Game Over' : 'Tap to Start'}</h2>
              <p>{started ? 'Press space or tap to jump back in.' : 'Tap anywhere or press space to flap.'}</p>
            </div>
          )}
        </div>

        <div className="flappy-bird__controls">
          <button type="button" className="flappy-bird__button" onClick={startGame}>
            {isPlaying ? 'Restart' : 'Start'}
          </button>
          <button type="button" className="flappy-bird__back" onClick={() => navigate('/games')}>
            ← Back
          </button>
        </div>
      </div>
    </main>
  )
}
