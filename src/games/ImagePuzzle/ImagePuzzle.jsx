import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGameSession } from '../../utils/gameSession'
import './ImagePuzzle.css'

const IMAGE_URL =
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80'

const createSolvedBoard = () => {
  const tiles = Array.from({ length: 9 }, (_, index) => index)
  tiles[8] = null
  return tiles
}

const shuffleBoard = (board) => {
  const shuffled = [...board]

  // Make shuffle easier by doing a few valid moves from the solved state.
  const steps = 10
  let emptyIndex = shuffled.indexOf(null)

  for (let i = 0; i < steps; i += 1) {
    const options = []
    const row = Math.floor(emptyIndex / 3)
    const col = emptyIndex % 3

    if (row > 0) options.push(emptyIndex - 3)
    if (row < 2) options.push(emptyIndex + 3)
    if (col > 0) options.push(emptyIndex - 1)
    if (col < 2) options.push(emptyIndex + 1)

    const swapIndex = options[Math.floor(Math.random() * options.length)]
    ;[shuffled[emptyIndex], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[emptyIndex]]
    emptyIndex = swapIndex
  }

  return shuffled
}

function ImagePuzzle() {
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'image-puzzle', title: 'Image Puzzle', icon: '🧩' })
  }
  const solvedBoard = useMemo(() => createSolvedBoard(), [])
  const [board, setBoard] = useState(() => shuffleBoard(solvedBoard))
  const [moves, setMoves] = useState(0)
  const [best, setBest] = useState(() => {
    const saved = Number(localStorage.getItem('imagePuzzleBest') || 0)
    return Number.isFinite(saved) ? saved : 0
  })

  const isSolved = board.every((value, index) => value === solvedBoard[index])

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (isSolved && moves > 0) historySession.current.finish({ result: 'Completed', details: `${moves} moves` })
  }, [isSolved, moves])

  useEffect(() => {
    if (!isSolved || moves === 0) return

    if (!best || moves < best) {
      const newBest = moves
      setBest(newBest)
      localStorage.setItem('imagePuzzleBest', String(newBest))
    }
  }, [isSolved, moves, best])

  const moveTile = (index) => {
    if (board[index] === null || isSolved) return

    const emptyIndex = board.indexOf(null)
    const row = Math.floor(index / 3)
    const emptyRow = Math.floor(emptyIndex / 3)
    const col = index % 3
    const emptyCol = emptyIndex % 3

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1
    if (!isAdjacent) return

    historySession.current.start()
    const nextBoard = [...board]
    ;[nextBoard[index], nextBoard[emptyIndex]] = [nextBoard[emptyIndex], nextBoard[index]]
    setBoard(nextBoard)
    setMoves((prev) => prev + 1)
  }

  const resetBoard = () => {
    setBoard(shuffleBoard(solvedBoard))
    setMoves(0)
  }

  const showSolved = () => {
    historySession.current.start()
    setBoard(solvedBoard)
    historySession.current.finish({ result: 'Completed', details: 'Solution revealed' })
  }

  return (
    <main className="image-puzzle">
      <div className="image-puzzle__panel">
        <div className="image-puzzle__topbar">
          <h1 className="image-puzzle__title">Image Puzzle</h1>

          <div className="image-puzzle__meta">
            <span className="image-puzzle__badge">{isSolved ? 'Solved!' : '3x3'}</span>
            <span className="image-puzzle__score">Moves: {moves}</span>
            <span className="image-puzzle__best">Best: {best || '--'}</span>
          </div>
        </div>

        <div className="image-puzzle__content">
          <div className="image-puzzle__board-wrap">
            <div className="image-puzzle__board" aria-label="Image puzzle board">
              {board.map((value, index) => {
                const isEmpty = value === null

                const tileStyle = !isEmpty
                  ? {
                      backgroundImage: `url(${IMAGE_URL})`,
                      backgroundPosition: `${(value % 3) * 50}% ${Math.floor(value / 3) * 50}%`,
                      backgroundSize: '300% 300%',
                    }
                  : undefined

                return (
                  <button
                    key={isEmpty ? `empty-${index}` : `tile-${value}`}
                    className={`image-puzzle__tile${isEmpty ? ' is-empty' : ''}`}
                    type="button"
                    onClick={() => moveTile(index)}
                    disabled={isEmpty || isSolved}
                    aria-label={isEmpty ? 'Empty tile' : `Move tile ${value + 1}`}
                    style={tileStyle}
                  >
                    {!isEmpty && (
                      <span className="image-puzzle__image" style={tileStyle} aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="image-puzzle__aside">
            <div className="image-puzzle__message">
              <strong>{isSolved ? 'You solved it!' : 'Arrange the picture'}</strong>
              <p>
                {isSolved
                  ? `Nice! You finished in ${moves} moves.`
                  : 'Slide the tiles into place until the full image is restored.'}
              </p>
            </div>

            <div className="image-puzzle__controls">
              <button type="button" className="image-puzzle__button image-puzzle__button--primary" onClick={resetBoard}>
                Shuffle
              </button>
              <button type="button" className="image-puzzle__button" onClick={showSolved}>
                Solve
              </button>
            </div>

            <Link to="/games" className="image-puzzle__back">
              ← Back to Games
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default ImagePuzzle
