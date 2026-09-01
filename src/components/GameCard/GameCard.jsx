import Button from '../Button/Button'
import './GameCard.css'

/**
 * GameCard — displays a game with icon, name, description, and a Play button.
 *
 * Props:
 *  - title        — game name
 *  - description  — short one-line description
 *  - icon         — emoji or string used as the visual icon
 *  - to           — route to navigate to on Play
 *  - accentColor  — optional CSS color string for per-card accent (defaults to var(--color-accent))
 */
function GameCard({ title, description, icon, to, accentColor }) {
  const style = accentColor
    ? { '--card-accent': accentColor }
    : undefined

  return (
    <article className="game-card" style={style}>
      <div className="game-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title">{title}</h3>
        <p className="game-card__desc">{description}</p>
      </div>
      <div className="game-card__footer">
        <Button to={to} variant="outline" size="sm">
          Play
        </Button>
      </div>
    </article>
  )
}

export default GameCard
