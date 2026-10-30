import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout/Layout'
import GameCard from '../../components/GameCard/GameCard'
import GAMES_DATA from '../../data/gamesData'
import THREE_D_GAMES_DATA from '../../data/threeDGamesData'
import { attachEmbeddedGameSession } from '../../utils/gameSession'
import './Games.css'

function Games() {
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | '3d' | 'arcade'
  const [selectedGame, setSelectedGame] = useState(null)
  const [expandedControls, setExpandedControls] = useState({})
  const [iframeKey, setIframeKey] = useState(0)
  const modalPanelRef = useRef(null)
  const iframeSessionRef = useRef(null)

  // Filter 2D arcade games from GAMES_DATA that are internal routes
  const arcadeGames = GAMES_DATA.filter((g) => !g.to.startsWith('http') && !g.to.includes('/mygame/'))

  const toggleControls = (gameId) => {
    setExpandedControls((prev) => ({
      ...prev,
      [gameId]: !prev[gameId],
    }))
  }

  const handleOpenGame = (game) => {
    iframeSessionRef.current?.finish()
    iframeSessionRef.current = null
    setSelectedGame(game)
    setIframeKey((prev) => prev + 1)
  }

  const handleCloseModal = () => {
    iframeSessionRef.current?.finish()
    iframeSessionRef.current = null
    setSelectedGame(null)
  }

  const handleReloadFrame = () => {
    iframeSessionRef.current?.finish()
    iframeSessionRef.current = null
    setIframeKey((prev) => prev + 1)
  }

  const handleToggleFullscreen = () => {
    if (!modalPanelRef.current) return
    if (!document.fullscreenElement) {
      modalPanelRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedGame) {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGame])

  useEffect(() => () => iframeSessionRef.current?.finish(), [])

  useEffect(() => {
    const section = selectedGame && /adventure|exploration/i.test(selectedGame.genre)
      ? 'adventure'
      : 'arcade'
    window.dispatchEvent(new CustomEvent('gamebreak-audio-section', { detail: { section } }))
  }, [selectedGame])

  return (
    <main className="games-page">
      <Layout>
        {/* Page Header */}
        <div className="games-page__header">
          <div className="games-page__title-wrap">
            <h1 className="games-page__title">Game Collection</h1>
            <span className="games-page__badge-count">
              {arcadeGames.length + THREE_D_GAMES_DATA.length} Total Titles
            </span>
          </div>
          <p className="games-page__subtitle">
            Play classic 2D retro arcade challenges or immerse yourself in next-generation 3D WebGL and Three.js experiences.
          </p>

          {/* Category Filter Pills */}
          <div className="games-page__filter-tabs" role="tablist" aria-label="Game categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={`games-page__tab-btn ${activeCategory === 'all' ? 'games-page__tab-btn--active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              🎮 All Games ({arcadeGames.length + THREE_D_GAMES_DATA.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === '3d'}
              className={`games-page__tab-btn ${activeCategory === '3d' ? 'games-page__tab-btn--active games-page__tab-btn--3d' : ''}`}
              onClick={() => setActiveCategory('3d')}
            >
              🕶️ 3D Experiences ({THREE_D_GAMES_DATA.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'arcade'}
              className={`games-page__tab-btn ${activeCategory === 'arcade' ? 'games-page__tab-btn--active' : ''}`}
              onClick={() => setActiveCategory('arcade')}
            >
              🕹️ Arcade & Classics ({arcadeGames.length})
            </button>
          </div>
        </div>

        {/* ── 3D Games Section ── */}
        {(activeCategory === 'all' || activeCategory === '3d') && (
          <section className="games-page__section games-page__section--three-d" aria-labelledby="three-d-section-title">
            <div className="games-page__section-header">
              <div>
                <div className="games-page__section-eyebrow">HIGH-PERFORMANCE 3D ENGINE</div>
                <h2 id="three-d-section-title" className="games-page__section-title games-page__section-title--neon">
                  3D Games Showcase
                </h2>
                <p className="games-page__section-description">
                  Real-time 3D physics, first-person arenas, stealth survival, and high-speed racing rendered right in your browser.
                </p>
              </div>
              <span className="games-page__engine-pill">
                ⚡ WebGL & Three.js Ready
              </span>
            </div>

            <div className="games-page__three-d-grid">
              {THREE_D_GAMES_DATA.map((game) => (
                <article
                  key={game.id}
                  className="games-page__3d-card"
                  style={{
                    '--card-accent': game.accentColor,
                    '--card-secondary': game.secondaryColor || game.accentColor,
                  }}
                >
                  {/* Card Header & Badges */}
                  <div className="games-page__3d-card-top">
                    <div className="games-page__3d-avatar-wrap">
                      <span className="games-page__3d-avatar-icon" aria-hidden="true">
                        {game.icon}
                      </span>
                    </div>
                    <div className="games-page__3d-card-meta">
                      <div className="games-page__3d-tags">
                        <span className="games-page__tag-engine">{game.badge}</span>
                        <span className="games-page__tag-genre">{game.genre}</span>
                      </div>
                      <h3 className="games-page__3d-card-title">{game.title}</h3>
                      <div className="games-page__3d-card-sub">{game.subtitle}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="games-page__3d-card-desc">{game.description}</p>

                  {/* Expandable Controls Guide */}
                  {expandedControls[game.id] && (
                    <div className="games-page__3d-controls-box">
                      <strong>🕹️ Controls:</strong> {game.controls}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="games-page__3d-actions">
                    <button
                      type="button"
                      className="games-page__3d-play-btn"
                      onClick={() => handleOpenGame(game)}
                    >
                      ▶ Play in Hub
                    </button>
                    <button
                      type="button"
                      className="games-page__3d-info-btn"
                      title="Toggle Controls Guide"
                      onClick={() => toggleControls(game.id)}
                    >
                      {expandedControls[game.id] ? 'Hide Controls' : '🎮 Controls'}
                    </button>
                    <a
                      className="games-page__3d-tab-btn"
                      href={game.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Full Window Tab"
                    >
                      ↗ Pop Out
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── 2D Arcade Games Section ── */}
        {(activeCategory === 'all' || activeCategory === 'arcade') && (
          <section className="games-page__section" aria-labelledby="arcade-games-title">
            <div className="games-page__section-header">
              <div>
                <div className="games-page__section-eyebrow">RETRO ARCADE CLASSICS</div>
                <h2 id="arcade-games-title" className="games-page__section-title">
                  Arcade & Mini Games
                </h2>
                <p className="games-page__section-description">
                  Fast-paced, instant-play retro classics to test your memory, strategy, and reaction times.
                </p>
              </div>
              <span className="games-page__section-count">{arcadeGames.length} Available</span>
            </div>

            <div className="games-page__grid">
              {arcadeGames.map((game) => (
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
          </section>
        )}
      </Layout>

      {/* ── Interactive 3D Game Player Modal ── */}
      {selectedGame && (
        <div
          className="games-page__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selectedGame.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
        >
          <div className="games-page__modal-panel" ref={modalPanelRef}>
            {/* Modal Top Bar */}
            <div className="games-page__modal-header">
              <div className="games-page__modal-title-group">
                <span className="games-page__modal-icon">{selectedGame.icon}</span>
                <div>
                  <h3 className="games-page__modal-title">{selectedGame.title}</h3>
                  <div className="games-page__modal-sub">
                    <span className="games-page__modal-badge">{selectedGame.badge}</span>
                    <span>{selectedGame.genre}</span>
                  </div>
                </div>
              </div>

              <div className="games-page__modal-actions">
                <button
                  type="button"
                  className="games-page__modal-tool-btn"
                  onClick={handleReloadFrame}
                  title="Reload Game"
                >
                  🔄 Restart
                </button>
                <button
                  type="button"
                  className="games-page__modal-tool-btn"
                  onClick={handleToggleFullscreen}
                  title="Toggle Fullscreen"
                >
                  ⛶ Fullscreen
                </button>
                <a
                  href={selectedGame.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="games-page__modal-tool-btn games-page__modal-tool-btn--tab"
                  title="Open in new tab"
                >
                  ↗ New Tab
                </a>
                <button
                  type="button"
                  className="games-page__modal-close-btn"
                  onClick={handleCloseModal}
                  aria-label="Close game modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Frame */}
            <div className="games-page__frame-container">
              <iframe
                key={iframeKey}
                title={selectedGame.title}
                src={selectedGame.to}
                className="games-page__game-frame"
                allow="autoplay; fullscreen; pointer-lock"
                allowFullScreen
                onLoad={(event) => {
                  iframeSessionRef.current?.finish()
                  iframeSessionRef.current = attachEmbeddedGameSession(event.currentTarget, selectedGame)
                }}
              />
            </div>

            {/* Modal Bottom Helper */}
            <div className="games-page__modal-footer">
              <div className="games-page__modal-controls-hint">
                <span className="games-page__modal-controls-label">🎮 CONTROLS:</span>
                <span>{selectedGame.controls}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Games
