import Layout from '../../components/Layout/Layout'
import GameCard from '../../components/GameCard/GameCard'
import GAMES_DATA from '../../data/gamesData'
import './Games.css'

function Games() {
  return (
    <main className="games-page">
      <Layout>
        {/* Header */}
        <div className="games-page__header">
          <h1 className="games-page__title">All Games</h1>
          <p className="games-page__subtitle">
            {GAMES_DATA.length} games available — pick one and start playing.
          </p>
        </div>

        {/* Grid */}
        <div className="games-page__grid">
          {GAMES_DATA.map((game) => (
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
    </main>
  )
}

export default Games
