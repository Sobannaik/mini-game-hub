import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import AudioPlayer from './components/AudioPlayer/AudioPlayer'
import DisclaimerPopup from './components/DisclaimerPopup/DisclaimerPopup'

// Pages
import Home   from './pages/Home/Home'
import Games  from './pages/Games/Games'
import About  from './pages/About/About'
import History from './pages/History/History'

// Game pages
import TicTacToe          from './games/TicTacToe/TicTacToe'
import RockPaperScissors  from './games/RockPaperScissors/RockPaperScissors'
import ReactionTime       from './games/ReactionTime/ReactionTime'
import WordPuzzle         from './games/WordPuzzle/WordPuzzle'
import ImagePuzzle        from './games/ImagePuzzle/ImagePuzzle'
import MemoryMatch        from './games/MemoryMatch/MemoryMatch'
import SnakeGame          from './games/Snake/Snake'
import MazeRunner         from './games/MazeRunner/MazeRunner'
import Runner3D          from './games/Runner3D/Runner3D'
import Maze3D            from './games/Maze3D/Maze3D'
import EndlessRunner     from './games/EndlessRunner/EndlessRunner'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AudioPlayer />
      <DisclaimerPopup />
      <Routes>
        {/* Main pages */}
        <Route path="/"           element={<Home />}       />
        <Route path="/games"      element={<Games />}      />
        <Route path="/about"      element={<About />}      />
        <Route path="/history"    element={<History />}    />

        {/* Game routes */}
        <Route path="/games/tic-tac-toe"         element={<TicTacToe />}         />
        <Route path="/games/rock-paper-scissors" element={<RockPaperScissors />} />
        <Route path="/games/reaction-time"       element={<ReactionTime />}       />
        <Route path="/games/word-puzzle"         element={<WordPuzzle />}         />
        <Route path="/games/image-puzzle"        element={<ImagePuzzle />}        />
        <Route path="/games/memory-match"        element={<MemoryMatch />}        />
        <Route path="/games/snake"               element={<SnakeGame />}          />
        <Route path="/games/maze-runner"          element={<MazeRunner />}          />
        <Route path="/games/runner-3d"            element={<Runner3D />}            />
        <Route path="/games/maze-3d"              element={<Maze3D />}              />
        <Route path="/games/endless-runner"       element={<EndlessRunner />}       />

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
