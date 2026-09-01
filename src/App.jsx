import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'

// Pages
import Home   from './pages/Home/Home'
import Games  from './pages/Games/Games'
import About  from './pages/About/About'

// Game pages
// ─────────────────────────────────────────────────────────────────────────────
// TEAM RULE: When adding a new game, ONLY:
//   1. Import your game component here.
//   2. Add its <Route> inside the <Routes> block below.
//   3. Add an entry to src/data/gamesData.js.
// Do NOT modify any other shared files.
// ─────────────────────────────────────────────────────────────────────────────
import TicTacToe          from './games/TicTacToe/TicTacToe'
import RockPaperScissors  from './games/RockPaperScissors/RockPaperScissors'
import ReactionTime       from './games/ReactionTime/ReactionTime'
import WordPuzzle         from './games/WordPuzzle/WordPuzzle'
import ImagePuzzle        from './games/ImagePuzzle/ImagePuzzle'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Main pages */}
        <Route path="/"       element={<Home />}  />
        <Route path="/games"  element={<Games />} />
        <Route path="/about"  element={<About />} />

        {/* Game routes */}
        <Route path="/games/tic-tac-toe"         element={<TicTacToe />}         />
        <Route path="/games/rock-paper-scissors" element={<RockPaperScissors />} />
        <Route path="/games/reaction-time"       element={<ReactionTime />}       />
        <Route path="/games/word-puzzle"         element={<WordPuzzle />}         />
        <Route path="/games/image-puzzle"        element={<ImagePuzzle />}        />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

/* Inline 404 — keeps the dependency count low */
function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - var(--navbar-height))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <span style={{ fontSize: '4rem' }} aria-hidden="true">🕹️</span>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Looks like this level doesn't exist yet.
      </p>
      <a
        href="/"
        style={{
          marginTop: '0.5rem',
          color: 'var(--color-accent)',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        ← Back to Home
      </a>
    </div>
  )
}

export default App
