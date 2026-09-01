import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const shuffledPuzzles = useMemo(() => [...PUZZLES], [])
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('Pick the correct word for the clue.')

  const currentPuzzle = shuffledPuzzles[step]

  const handleAnswer = (choice) => {
    if (choice === currentPuzzle.answer) {
      const newScore = score + 1
      setScore(newScore)
      setMessage('Correct! Nice one.')
    } else {
      setMessage(`Not quite. The correct answer is ${currentPuzzle.answer}.`)
    }

    const nextIndex = (step + 1) % shuffledPuzzles.length
    setTimeout(() => {
      setStep(nextIndex)
      setMessage('Pick the correct word for the clue.')
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
          <div className="word-puzzle__box">
            <div className="word-puzzle__clue">{currentPuzzle.clue}</div>
            <div className="word-puzzle__options">
              {currentPuzzle.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="word-puzzle__option"
                  onClick={() => handleAnswer(option)}
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
