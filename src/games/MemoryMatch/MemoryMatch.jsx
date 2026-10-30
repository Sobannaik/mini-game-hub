import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGameSession } from '../../utils/gameSession'
import './MemoryMatch.css'

const SYMBOLS = ['🚀', '🛸', '🎮', '👾', '⚡', '🎯', '🪐', '✨']

const makeDeck = () =>
  [...SYMBOLS, ...SYMBOLS]
    .map((symbol, index) => ({
      id: `${symbol}-${index}-${Math.random().toString(16).slice(2)}`,
      symbol,
      matched: false,
      flipped: false,
    }))
    .sort(() => Math.random() - 0.5)

export default function MemoryMatch() {
  const navigate = useNavigate()
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'memory-match', title: 'Memory Match', icon: '🧠' })
  }
  const [cards, setCards] = useState(() => makeDeck())
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [bestMoves, setBestMoves] = useState(() => Number(localStorage.getItem('retro-memory-best') || 0))
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (selected.length !== 2) return

    const [firstIndex, secondIndex] = selected
    const firstCard = cards[firstIndex]
    const secondCard = cards[secondIndex]

    if (firstCard.symbol === secondCard.symbol) {
      setCards((previous) =>
        previous.map((card, index) =>
          index === firstIndex || index === secondIndex ? { ...card, matched: true, flipped: true } : card,
        ),
      )
      setSelected([])
      return
    }

    setIsLocked(true)
    const timeout = setTimeout(() => {
      setCards((previous) =>
        previous.map((card, index) =>
          index === firstIndex || index === secondIndex ? { ...card, flipped: false } : card,
        ),
      )
      setSelected([])
      setIsLocked(false)
    }, 650)

    return () => clearTimeout(timeout)
  }, [cards, selected])

  useEffect(() => {
    const matchedCount = cards.filter((card) => card.matched).length
    if (matchedCount === cards.length && cards.length > 0) {
      historySession.current.finish({ result: 'Completed', details: `${moves} moves` })
      setBestMoves((previous) => {
        const nextBest = previous === 0 || moves < previous ? moves : previous
        localStorage.setItem('retro-memory-best', String(nextBest))
        return nextBest
      })
    }
  }, [cards, moves])

  const handleCardClick = (index) => {
    if (isLocked || selected.includes(index) || cards[index].matched || cards[index].flipped) {
      return
    }

    historySession.current.start()
    setCards((previous) =>
      previous.map((card, cardIndex) =>
        cardIndex === index ? { ...card, flipped: true } : card,
      ),
    )
    setSelected((previous) => [...previous, index])

    if (selected.length === 1) {
      setMoves((previous) => previous + 1)
    }
  }

  const resetGame = () => {
    setCards(makeDeck())
    setSelected([])
    setMoves(0)
    setIsLocked(false)
  }

  const completed = cards.every((card) => card.matched)

  return (
    <main className="memory-match">
      <div className="memory-match__panel">
        <div className="memory-match__header">
          <h1 className="memory-match__title">Memory Match</h1>
          <div className="memory-match__stats">
            <div className="memory-match__stat">
              <span className="memory-match__stat-label">Moves</span>
              <span className="memory-match__stat-value">{moves}</span>
            </div>
            <div className="memory-match__stat">
              <span className="memory-match__stat-label">Best</span>
              <span className="memory-match__stat-value">{bestMoves || '--'}</span>
            </div>
          </div>
        </div>

        <div className="memory-match__board">
          {cards.map((card, index) => {
            const isVisible = card.flipped || card.matched
            return (
              <button
                key={card.id}
                type="button"
                className={[
                  'memory-match__card',
                  isVisible ? 'memory-match__card--flipped' : '',
                  card.matched ? 'memory-match__card--matched' : '',
                ].join(' ').trim()}
                onClick={() => handleCardClick(index)}
                disabled={card.matched || isLocked || isVisible}
              >
                {isVisible ? card.symbol : '?'}
              </button>
            )
          })}
        </div>

        <div className="memory-match__controls">
          <div className="memory-match__status">
            {completed ? 'Board cleared! Nice memory.' : 'Match every tile to win.'}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="memory-match__button" onClick={resetGame}>Restart</button>
            <button type="button" className="memory-match__back" onClick={() => navigate('/games')}>← Back</button>
          </div>
        </div>
      </div>
    </main>
  )
}
