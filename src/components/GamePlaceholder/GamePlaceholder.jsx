import { Link } from 'react-router-dom'
import './GamePlaceholder.css'

/**
 * GamePlaceholder — shown for every game that hasn't been implemented yet.
 *
 * Props:
 *  - title       — game name
 *  - icon        — emoji icon
 *  - description — short description
 *  - accentColor — optional accent colour
 *
 * When a team member implements their game, they replace this component
 * with their actual game UI inside their game folder.
 */
function GamePlaceholder({ title, icon, description, accentColor }) {
  const style = accentColor ? { '--placeholder-accent': accentColor } : undefined

  return (
    <div className="game-placeholder" style={style}>
      <div className="game-placeholder__card">
        <div className="game-placeholder__icon" aria-hidden="true">{icon}</div>
        <h1 className="game-placeholder__title">{title}</h1>
        <p className="game-placeholder__desc">{description}</p>
        <div className="game-placeholder__badge">
          <span className="game-placeholder__dot" aria-hidden="true" />
          Coming Soon — In Development
        </div>
        <p className="game-placeholder__hint">
          This game page is a placeholder. A team member will implement the game logic here.
        </p>
        <Link to="/games" className="game-placeholder__back">
          ← Back to Games
        </Link>
      </div>
    </div>
  )
}

export default GamePlaceholder
