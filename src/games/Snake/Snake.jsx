import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGameSession } from '../../utils/gameSession'
import './Snake.css'

const BOARD_SIZE = 10
const INITIAL_SNAKE = [
  { x: 4, y: 5 },
  { x: 3, y: 5 },
  { x: 2, y: 5 },
]
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

const randomFood = (snake) => {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`))
  const available = []

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)] || { x: 0, y: 0 }
}

export default function SnakeGame() {
  const navigate = useNavigate()
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'snake', title: 'Snake', icon: '🐍' })
  }
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState({ x: 7, y: 5 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [status, setStatus] = useState('idle')
  const [score, setScore] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (status === 'gameover') historySession.current.finish({ result: 'Game Over', score })
  }, [status, score])

  useEffect(() => {
    const onKeyDown = (event) => {
      const pressed = DIRECTIONS[event.key]
      if (!pressed) return

      setDirection((current) => {
        const next = { x: pressed.x, y: pressed.y }
        const isOpposite =
          current.x + next.x === 0 && current.y + next.y === 0

        return isOpposite ? current : next
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (status !== 'playing') return undefined

    intervalRef.current = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0]
        const nextHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        }

        const hitWall =
          nextHead.x < 0 ||
          nextHead.x >= BOARD_SIZE ||
          nextHead.y < 0 ||
          nextHead.y >= BOARD_SIZE

        const hitBody = currentSnake.some((segment, index) => {
          if (index === 0) return false
          return segment.x === nextHead.x && segment.y === nextHead.y
        })

        if (hitWall || hitBody) {
          setStatus('gameover')
          return currentSnake
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y
        const nextSnake = [nextHead, ...currentSnake]

        if (!ateFood) {
          nextSnake.pop()
        } else {
          setFood(randomFood(nextSnake))
          setScore((currentScore) => currentScore + 10)
        }

        return nextSnake
      })
    }, 170)

    return () => clearInterval(intervalRef.current)
  }, [direction, food, status])

  const startGame = () => {
    historySession.current.start()
    setSnake(INITIAL_SNAKE)
    setFood({ x: 7, y: 5 })
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setStatus('playing')
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 7, y: 5 })
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setStatus('idle')
  }

  const boardCells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
    const x = index % BOARD_SIZE
    const y = Math.floor(index / BOARD_SIZE)
    const isHead = snake[0] && snake[0].x === x && snake[0].y === y
    const isBody = snake.some((segment, segmentIndex) => segmentIndex > 0 && segment.x === x && segment.y === y)
    const isFoodCell = food.x === x && food.y === y

    return {
      x,
      y,
      className: [
        'snake-game__cell',
        isHead ? 'snake-game__cell--head' : '',
        isBody ? 'snake-game__cell--snake' : '',
        isFoodCell ? 'snake-game__cell--food' : '',
      ].join(' ').trim(),
    }
  })

  return (
    <main className="snake-game">
      <div className="snake-game__panel">
        <div className="snake-game__header">
          <h1 className="snake-game__title">Snake</h1>
          <div className="snake-game__stats">
            <div className="snake-game__stat">
              <span className="snake-game__stat-label">Score</span>
              <span className="snake-game__stat-value">{score}</span>
            </div>
            <div className="snake-game__stat">
              <span className="snake-game__stat-label">State</span>
              <span className="snake-game__stat-value">{status === 'playing' ? 'LIVE' : status === 'gameover' ? 'OVER' : 'READY'}</span>
            </div>
          </div>
        </div>

        <div className="snake-game__board-wrap">
          <div className="snake-game__board">
            {boardCells.map((cell) => (
              <div key={`${cell.x}-${cell.y}`} className={cell.className} />
            ))}
          </div>
        </div>

        <div className="snake-game__controls">
          <div className="snake-game__message">
            {status === 'gameover' && 'Game over — press Start to try again.'}
            {status === 'idle' && 'Use arrow keys to guide the snake.'}
            {status === 'playing' && 'Collect the glowing pellets.'}
          </div>

          <div className="snake-game__actions">
            <button type="button" className="snake-game__button" onClick={startGame}>
              {status === 'playing' ? 'Restart' : 'Start Game'}
            </button>
            <button type="button" className="snake-game__back" onClick={() => navigate('/games')}>← Back</button>
          </div>
        </div>
      </div>
    </main>
  )
}
