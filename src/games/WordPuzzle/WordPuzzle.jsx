import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGameSession } from '../../utils/gameSession'
import './WordPuzzle.css'

const PUZZLES = [
  {
    clue: 'A small fruit that is red or blue',
    answer: 'BERRY',
    options: ['BERRY', 'BREAD', 'BOLT', 'BRAIN'],
  },
  {
    clue: 'Something used to open a door',
    answer: 'LOCK',
    options: ['LOCK', 'LOOK', 'LUCK', 'LIFT'],
  },
  {
    clue: 'A large object that moves around the sun',
    answer: 'PLANET',
    options: ['PLANT', 'PLANET', 'PLATE', 'PRANK'],
  },
  {
    clue: 'A machine that tells time',
    answer: 'CLOCK',
    options: ['CLOTH', 'CLOCK', 'CLICK', 'CLONE'],
  },
  {
    clue: 'A person who plays video games',
    answer: 'GAMER',
    options: ['GLOVE', 'GAMER', 'GARDEN', 'GAP'],
  },
  {
    clue: 'A bright object in the sky at night',
    answer: 'STAR',
    options: ['STAR', 'STONE', 'STOP', 'SHELL'],
  },
]

function WordPuzzle() {
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'word-puzzle', title: 'Word Puzzle', icon: '🔤' })
  }
  const shuffledPuzzles = useMemo(() => [...PUZZLES], [])
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(score)
  const [message, setMessage] = useState('Pick the correct word for the clue.')
  const [popupText, setPopupText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const popupIntervalRef = useRef(null)
  const advanceTimerRef = useRef(null)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    return () => {
      if (popupIntervalRef.current) clearInterval(popupIntervalRef.current)
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
      historySession.current.finish({ score: scoreRef.current })
    }
  }, [])

  const currentPuzzle = shuffledPuzzles[step]

  const typePopup = (text) => {
    if (popupIntervalRef.current) clearInterval(popupIntervalRef.current)
    setPopupText('')
    setShowPopup(true)

    let index = 0
    popupIntervalRef.current = setInterval(() => {
      index += 1
      setPopupText(text.slice(0, index))
      if (index >= text.length) {
        clearInterval(popupIntervalRef.current)
        popupIntervalRef.current = null
        setTimeout(() => {
          setShowPopup(false)
          setPopupText('')
        }, 1200)
      }
    }, 24)
  }

  const handleAnswer = (choice) => {
    if (isLocked) return

    historySession.current.start()
    setIsLocked(true)
    const isCorrect = choice === currentPuzzle.answer

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setMessage('Correct! Nice one.')
      typePopup('RESULT // CORRECT')
    } else {
      setMessage(`Not quite. The correct answer is ${currentPuzzle.answer}.`)
      typePopup(`RESULT // WRONG // ${currentPuzzle.answer}`)
    }

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(() => {
      setStep((prev) => (prev + 1) % shuffledPuzzles.length)
      setMessage('Pick the correct word for the clue.')
      setIsLocked(false)
    }, 800)
  }

  return (
    <main className="word-puzzle">
      <div className="word-puzzle__panel">
        <div className="word-puzzle__topbar">
          <h1 className="word-puzzle__title">Word Puzzle</h1>
          <span className="word-puzzle__score">Score: {score}</span>
        </div>

        <div className="word-puzzle__content">
          <div className={`retro-log ${showPopup ? 'visible' : ''}`}>
            <span>SYSTEM LOG</span>
            <strong>{popupText}</strong>
          </div>

          <div className="word-puzzle__box">
            <div className="word-puzzle__clue">{currentPuzzle.clue}</div>
            <div className="word-puzzle__options">
              {currentPuzzle.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="word-puzzle__option"
                  onClick={() => handleAnswer(option)}
                  disabled={isLocked}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <aside className="word-puzzle__aside">
            <div className="word-puzzle__message">
              <strong>Clue challenge</strong>
              <p>{message}</p>
            </div>

            <div className="word-puzzle__list">
              {['BERRY', 'LOCK', 'PLANET', 'CLOCK'].map((word) => (
                <span key={word} className="word-puzzle__chip">{word}</span>
              ))}
            </div>

            <Link to="/games" className="word-puzzle__back">
              ← Back to Games
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default WordPuzzle
