import Layout from '../../components/Layout/Layout'
import Button from '../../components/Button/Button'
import GameCard from '../../components/GameCard/GameCard'
import GAMES_DATA from '../../data/gamesData'
import './Home.css'

// Show the first 3 games as "featured" on the home page
const FEATURED_GAMES = GAMES_DATA.slice(0, 3)

function Home() {
  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="home__hero">
        <Layout>
          <div className="home__hero-content">
            <div className="home__badge">🎮 Mini Game Hub</div>
            <h1 className="home__title">
              Game<span className="home__title-accent"> Break</span>
            </h1>
            <p className="home__tagline">
              Level up your downtime.
            </p>
            <p className="home__sub">
              Quick-fire browser games, zero install, zero hassle. Pick a challenge,
              jump in, and get your next win in under a minute.
            </p>
            <div className="home__hero-actions">
              {/* Quick Play is non-functional in Stage 1 */}
              <Button size="lg" disabled>
                ⚡ Quick Play
              </Button>
              <Button to="/games" variant="outline" size="lg">
                Browse Games
              </Button>
            </div>

            <div className="home__stats" aria-label="Game statistics">
              <div className="home__stat-item">
                <strong>5</strong>
                <span>Games</span>
              </div>
              <div className="home__stat-item">
                <strong>Instant</strong>
                <span>Play</span>
              </div>
              <div className="home__stat-item">
                <strong>0</strong>
                <span>Downloads</span>
              </div>
            </div>
          </div>
        </Layout>

        {/* Decorative background orbs */}
        <div className="home__hero-orb home__hero-orb--1" aria-hidden="true" />
        <div className="home__hero-orb home__hero-orb--2" aria-hidden="true" />
      </section>

      <section className="home__highlights">
        <Layout>
          <div className="home__highlights-grid">
            <article className="home__highlight-card">
              <span className="home__highlight-icon">🎯</span>
              <div>
                <h3>Instant play</h3>
                <p>Jump straight in with no setup and no waiting.</p>
              </div>
            </article>

            <article className="home__highlight-card">
              <span className="home__highlight-icon">🧠</span>
              <div>
                <h3>Quick challenges</h3>
                <p>Fast rounds designed for short breaks and sharp focus.</p>
              </div>
            </article>

            <article className="home__highlight-card">
              <span className="home__highlight-icon">🏆</span>
              <div>
                <h3>Beat your best</h3>
                <p>Replay and improve your score every time you come back.</p>
              </div>
            </article>
          </div>
        </Layout>
      </section>

      {/* ── Featured Games ── */}
      <section className="home__featured">
        <Layout>
          <div className="home__section-header">
            <h2 className="home__section-title">Featured Games</h2>
            <Button to="/games" variant="ghost" size="sm">
              View all →
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
    </main>
  )
}

export default Home
