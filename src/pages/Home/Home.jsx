import { useEffect, useRef, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Button from '../../components/Button/Button'
import GameCard from '../../components/GameCard/GameCard'
import GAMES_DATA from '../../data/gamesData'
import THREE_D_GAMES_DATA from '../../data/threeDGamesData'
import { attachEmbeddedGameSession } from '../../utils/gameSession'
import './Home.css'

// Show the first 3 2D games as "featured"
const FEATURED_GAMES = GAMES_DATA.slice(0, 3)
// Show top 3 3D games as "spotlight"
const SPOTLIGHT_3D_GAMES = THREE_D_GAMES_DATA.slice(0, 3)

function Home() {
  const [selected3DGame, setSelected3DGame] = useState(null)
  const iframeSessionRef = useRef(null)

  useEffect(() => {
    return () => {
      iframeSessionRef.current?.finish()
      iframeSessionRef.current = null
    }
  }, [])

  useEffect(() => {
    const section = selected3DGame
      ? /adventure|exploration/i.test(selected3DGame.genre) ? 'adventure' : 'arcade'
      : 'home'
    window.dispatchEvent(new CustomEvent('gamebreak-audio-section', { detail: { section } }))

    if (!selected3DGame) {
      iframeSessionRef.current?.finish()
      iframeSessionRef.current = null
    }
  }, [selected3DGame])

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="home__hero">
        <Layout>
          <div className="home__hero-content">
            <div className="home__badge">🎮 Mini Game Hub • Next-Gen</div>
            <div className="home__welcome">Ready for a quick break?</div>
            <h1 className="home__title">
              Game<span className="home__title-accent"> Break</span>
            </h1>
            <p className="home__tagline">
              Level up your downtime in 2D & 3D.
            </p>
            <p className="home__sub">
              Quick-fire retro arcade classics and immersive 3D WebGL / Three.js games. Zero install, zero hassle. Jump straight into the action.
            </p>
            <div className="home__hero-actions">
              <Button to="/games" size="lg">
                🕶️ Explore 3D Games
              </Button>
              <Button to="/games" variant="outline" size="lg">
                🕹️ Browse All Games
              </Button>
              <Button to="/history" variant="ghost" size="lg">
                📜 Game History
              </Button>
            </div>

            <div className="home__stats" aria-label="Game statistics">
              <div className="home__stat-item">
                <strong>{GAMES_DATA.length + THREE_D_GAMES_DATA.length}</strong>
                <span>Total Games</span>
              </div>
              <div className="home__stat-item">
                <strong>{THREE_D_GAMES_DATA.length}</strong>
                <span>3D Experiences</span>
              </div>
              <div className="home__stat-item">
                <strong>0</strong>
                <span>Downloads</span>
              </div>
              <div className="home__stat-item">
                <strong>Instant</strong>
                <span>WebGL Play</span>
              </div>
            </div>
          </div>
        </Layout>

        {/* Decorative background orbs */}
        <div className="home__hero-orb home__hero-orb--1" aria-hidden="true" />
        <div className="home__hero-orb home__hero-orb--2" aria-hidden="true" />
      </section>

      {/* ── Highlights ── */}
      <section className="home__highlights">
        <Layout>
          <div className="home__highlights-grid">
            <article className="home__highlight-card">
              <span className="home__highlight-icon">⚡</span>
              <div>
                <h3>Instant 3D & 2D</h3>
                <p>Hardware-accelerated 3D graphics and snappy arcade gameplay in your browser.</p>
              </div>
            </article>

            <article className="home__highlight-card">
              <span className="home__highlight-icon">🏎️</span>
              <div>
                <h3>Diverse Genres</h3>
                <p>From high-speed racing and FPS arenas to puzzle solvers and stealth thrillers.</p>
              </div>
            </article>

            <article className="home__highlight-card">
              <span className="home__highlight-icon">📜</span>
              <div>
                <h3>Your recent games</h3>
                <p>Find your previous sessions anytime in your game history.</p>
              </div>
            </article>
          </div>
        </Layout>
      </section>

      {/* ── 3D Games Spotlight Section ── */}
      <section className="home__3d-spotlight">
        <Layout>
          <div className="home__section-header">
            <div>
              <span className="home__section-tag">NEW ARRIVALS</span>
              <h2 className="home__section-title home__section-title--3d">3D Games Spotlight</h2>
            </div>
            <Button to="/games" variant="ghost" size="sm">
              All 3D Games ({THREE_D_GAMES_DATA.length}) →
            </Button>
          </div>
          <div className="home__3d-cards-grid">
            {SPOTLIGHT_3D_GAMES.map((game) => (
              <article
                key={game.id}
                className="home__3d-card"
                style={{
                  '--accent': game.accentColor,
                }}
              >
                <div className="home__3d-card-header">
                  <span className="home__3d-card-icon">{game.icon}</span>
                  <div>
                    <span className="home__3d-card-badge">{game.badge}</span>
                    <h3 className="home__3d-card-title">{game.title}</h3>
                  </div>
                </div>
                <p className="home__3d-card-desc">{game.description}</p>
                <div className="home__3d-card-actions">
                  <button
                    type="button"
                    className="home__3d-play-btn"
                    onClick={() => setSelected3DGame(game)}
                  >
                    ▶ Quick Play
                  </button>
                  <a
                    href={game.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home__3d-tab-link"
                  >
                    ↗ Pop Out
                  </a>
                </div>
              </article>
            ))}
          </div>
        </Layout>
      </section>

      {/* ── Featured 2D Games ── */}
      <section className="home__featured">
        <Layout>
          <div className="home__section-header">
            <div>
              <span className="home__section-tag">RETRO CLASSICS</span>
              <h2 className="home__section-title">Featured Arcade</h2>
            </div>
            <Button to="/games" variant="ghost" size="sm">
              View all arcade →
            </Button>
          </div>
          <div className="home__cards-grid">
            {FEATURED_GAMES.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                description={game.description}
                icon={game.icon}
                to={game.to}
                accentColor={game.accentColor}
              />
            ))}
          </div>
        </Layout>
      </section>

      {/* ── Quick Play Modal on Home ── */}
      {selected3DGame && (
        <div
          className="home__modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected3DGame(null)
          }}
        >
          <div className="home__modal-panel">
            <div className="home__modal-header">
              <div className="home__modal-title-group">
                <span>{selected3DGame.icon}</span>
                <h3>{selected3DGame.title}</h3>
                <span className="home__3d-card-badge">{selected3DGame.badge}</span>
              </div>
              <div className="home__modal-actions">
                <a
                  href={selected3DGame.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home__3d-tab-link"
                >
                  ↗ New Tab
                </a>
                <button
                  type="button"
                  className="home__modal-close"
                  onClick={() => setSelected3DGame(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              title={selected3DGame.title}
              src={selected3DGame.to}
              className="home__game-frame"
              onLoad={(event) => {
                iframeSessionRef.current?.finish()
                iframeSessionRef.current = attachEmbeddedGameSession(event.currentTarget, selected3DGame)
              }}
              allow="autoplay; fullscreen; pointer-lock"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default Home
