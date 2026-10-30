import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RetroRunner.css'

const RUNNER_WIDTH = 28
const RUNNER_HEIGHT = 38
const GROUND_Y = 180
const GRAVITY = 0.52
const JUMP_STRENGTH = -12.8

const randomObstacle = (id) => ({
  id,
  x: 520,
  width: 26 + Math.random() * 22,
  height: 30 + Math.random() * 48,
  scored: false,
})

export default function RetroRunner() {
  const navigate = useNavigate()
  const [playerY, setPlayerY] = useState(GROUND_Y - RUNNER_HEIGHT)
  const [velocity, setVelocity] = useState(0)
  const [obstacles, setObstacles] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(Number(localStorage.getItem('retro-runner-best') || 0))

  const rafRef = useRef(null)
  const obstacleTimerRef = useRef(null)
  const lastTimeRef = useRef(0)

  const stopGame = () => {
    setIsPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (obstacleTimerRef.current) clearInterval(obstacleTimerRef.current)
  }

  const startGame = () => {
    setPlayerY(GROUND_Y - RUNNER_HEIGHT)
    setVelocity(0)
    setObstacles([])
    setScore(0)
    setIsPlaying(true)
    lastTimeRef.current = 0

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (obstacleTimerRef.current) clearInterval(obstacleTimerRef.current)

    obstacleTimerRef.current = setInterval(() => {
      setObstacles((current) => [...current, randomObstacle(Date.now() + Math.random())])
    }, 1200)

    rafRef.current = requestAnimationFrame(gameLoop)
  }

  const jump = () => {
    if (!isPlaying) {
      startGame()
      return
    }

    if (playerY >= GROUND_Y - RUNNER_HEIGHT - 1) {
      setVelocity(JUMP_STRENGTH)
    }
  }

  const gameLoop = (timestamp) => {
    if (!isPlaying) return

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const delta = (timestamp - lastTimeRef.current) / 16.67
    lastTimeRef.current = timestamp

    setVelocity((currentVelocity) => {
      const nextVelocity = currentVelocity + GRAVITY * delta
      const nextPlayerY = Math.min(GROUND_Y - RUNNER_HEIGHT, Math.max(0, playerY + nextVelocity * delta))
      setPlayerY(nextPlayerY)
      return nextVelocity
    })

    setObstacles((currentObstacles) => {
      const moved = currentObstacles
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - 5.4 * delta }))
        .filter((obstacle) => obstacle.x + obstacle.width > -20)

      let gainedPoints = 0
      for (const obstacle of moved) {
        if (!obstacle.scored && obstacle.x + obstacle.width < 90) {
          obstacle.scored = true
          gainedPoints += 1
        }
      }

      if (gainedPoints > 0) {
        setScore((currentScore) => currentScore + gainedPoints)
      }

      const playerBox = {
        x: 90,
        y: playerY,
        width: RUNNER_WIDTH,
        height: RUNNER_HEIGHT,
      }

      const crashed = moved.some((obstacle) => {
        const obstacleBox = {
          x: obstacle.x,
          y: GROUND_Y - obstacle.height,
          width: obstacle.width,
          height: obstacle.height,
        }

        return (
          playerBox.x < obstacleBox.x + obstacleBox.width &&
          playerBox.x + playerBox.width > obstacleBox.x &&
          playerBox.y < obstacleBox.y + obstacleBox.height &&
          playerBox.y + playerBox.height > obstacleBox.y
        )
      })

      if (crashed) {
        setBestScore((previousBest) => {
          const finalBest = Math.max(previousBest, score)
          localStorage.setItem('retro-runner-best', String(finalBest))
          return finalBest
        })
        stopGame()
      }

      return moved
    })

    rafRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (obstacleTimerRef.current) clearInterval(obstacleTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying, playerY])

  useEffect(() => {
    if (playerY >= GROUND_Y - RUNNER_HEIGHT) {
      setVelocity(0)
    }
  }, [playerY])

  return (
    <main className="retro-runner">
      <div className="retro-runner__panel">
        <div className="retro-runner__header">
          <h1>Retro Runner</h1>
          <div className="retro-runner__stats">
            <div className="retro-runner__stat">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="retro-runner__stat">
              <span>Best</span>
              <strong>{bestScore}</strong>
            </div>
          </div>
        </div>

        <div className="retro-runner__arena" onPointerDown={jump} role="button" tabIndex={0}>
          <div className="retro-runner__sun" />
          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="retro-runner__obstacle"
              style={{
                left: `${obstacle.x}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
                bottom: '40px',
              }}
            />
          ))}

          <div
            className="retro-runner__runner"
            style={{
              left: '90px',
              bottom: `${GROUND_Y - playerY}px`,
            }}
          >
            🏃
          </div>

          <div className="retro-runner__ground" />

          {!isPlaying && (
            <div className="retro-runner__overlay">
              <h2>{score > 0 ? 'Run Over' : 'Tap to Start'}</h2>
              <p>Press space or tap to jump over each obstacle.</p>
            </div>
          )}
        </div>

        <div className="retro-runner__controls">
          <button type="button" className="retro-runner__button" onClick={startGame}>
            {isPlaying ? 'Restart' : 'Start'}
          </button>
          <button type="button" className="retro-runner__back" onClick={() => navigate('/games')}>
            ← Back
          </button>
        </div>
      </div>
    </main>
  )
}
