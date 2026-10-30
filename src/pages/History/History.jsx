import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import Button from '../../components/Button/Button'
import GAMES_DATA from '../../data/gamesData'
import {
  loadHistory,
  removeHistoryEntry,
  clearHistory,
} from '../../utils/historyStore'
import './History.css'

/* Build a quick lookup: gameId → accentColor */
const ACCENT_MAP = Object.fromEntries(GAMES_DATA.map((g) => [g.id, g.accentColor]))

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return null
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function HistoryEntry({ entry, onDelete }) {
  const accent = ACCENT_MAP[entry.gameId] || 'var(--color-accent)'

  return (
    <article
      className="history-entry"
      style={{ '--entry-accent': accent }}
    >
      <div className="history-entry__icon" aria-hidden="true">
        {entry.gameIcon || '🎮'}
      </div>

      <div className="history-entry__main">
        <div className="history-entry__top">
          <span className="history-entry__game">{entry.gameName}</span>
          {entry.result && (
            <span
              className={`history-entry__result history-entry__result--${(entry.result || '').toLowerCase().replace(/\s+/g, '-')}`}
            >
              {entry.result}
            </span>
          )}
        </div>

        <div className="history-entry__meta">
          <span className="history-entry__date">
            {formatDate(entry.playedAt)} at {formatTime(entry.playedAt)}
          </span>
          {entry.score != null && (
            <span className="history-entry__detail">Score: {entry.score}</span>
          )}
          {entry.duration != null && formatDuration(entry.duration) && (
            <span className="history-entry__detail">
              Time: {formatDuration(entry.duration)}
            </span>
          )}
          {entry.level != null && (
            <span className="history-entry__detail">Level: {entry.level}</span>
          )}
          {entry.details && (
            <span className="history-entry__detail">{entry.details}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="history-entry__delete"
        onClick={() => onDelete(entry.id)}
        aria-label={`Remove ${entry.gameName} entry from ${formatDate(entry.playedAt)}`}
        title="Remove entry"
      >
        ✕
      </button>
    </article>
  )
}

function History() {
  const [entries, setEntries] = useState(() => loadHistory())
  const [filter, setFilter] = useState('All Games')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const gameFilters = useMemo(() => (
    [...new Map(entries.map((entry) => [entry.gameId, {
      id: entry.gameId,
      title: entry.gameName,
      icon: entry.gameIcon || '🎮',
    }])).values()]
  ), [entries])

  useEffect(() => {
    const refreshEntries = () => setEntries(loadHistory())
    window.addEventListener('gamebreak-history-updated', refreshEntries)
    window.addEventListener('storage', refreshEntries)
    return () => {
      window.removeEventListener('gamebreak-history-updated', refreshEntries)
      window.removeEventListener('storage', refreshEntries)
    }
  }, [])

  useEffect(() => {
    if (!showClearConfirm) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowClearConfirm(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showClearConfirm])

  useEffect(() => {
    if (filter !== 'All Games' && !gameFilters.some((game) => game.title === filter)) {
      setFilter('All Games')
    }
  }, [filter, gameFilters])

  const filtered = useMemo(() => {
    if (filter === 'All Games') return entries
    return entries.filter((e) => e.gameName === filter)
  }, [entries, filter])

  const handleDelete = (id) => {
    removeHistoryEntry(id)
    setEntries(loadHistory())
  }

  const handleClearAll = () => {
    clearHistory()
    setEntries([])
    setShowClearConfirm(false)
  }

  return (
    <main className="history-page">
      <Layout>
        {/* Header */}
        <div className="history-page__header">
          <div className="history-page__header-left">
            <h1 className="history-page__title">Your Game History</h1>
            <p className="history-page__desc">
              Your recent gameplay sessions are saved on this device.
              {entries.length > 0 && ` ${entries.length} session${entries.length !== 1 ? 's' : ''} recorded.`}
            </p>
          </div>
          {entries.length > 0 && (
            <button
              type="button"
              className="history-page__clear-btn"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear History
            </button>
          )}
        </div>

        {/* Game filter */}
        {entries.length > 0 && (
          <div className="history-page__filters">
            <label htmlFor="history-game-filter">Filter by game</label>
            <select
              id="history-game-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All Games</option>
              {gameFilters.map((game) => (
                <option key={game.id} value={game.title}>{game.icon} {game.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="history-page__empty">
            <div className="history-page__empty-icon" aria-hidden="true">🎮</div>
            <h2 className="history-page__empty-title">
              {entries.length === 0
                ? 'No games played yet'
                : `No ${filter} sessions yet`}
            </h2>
            <p className="history-page__empty-desc">
              {entries.length === 0
                ? 'Pick a game and have some fun. Your sessions will appear here.'
                : 'Try a different filter, or play this game to add an entry.'}
            </p>
            <Button to="/games" variant="primary" size="md">
              Browse Games
            </Button>
          </div>
        ) : (
          <div className="history-page__list">
            {filtered.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Back CTA (when list shown) */}
        {filtered.length > 0 && (
          <div className="history-page__footer">
            <Link to="/games" className="history-page__back-link">
              ← Back to Games
            </Link>
          </div>
        )}
      </Layout>

      {/* Clear all confirmation dialog */}
      {showClearConfirm && (
        <div
          className="history-confirm-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClearConfirm(false) }}
        >
          <div
            className="history-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title" className="history-confirm-dialog__title">
              Clear all history?
            </h2>
            <p className="history-confirm-dialog__desc">
              This will permanently remove all {entries.length} session{entries.length !== 1 ? 's' : ''} from this device. This cannot be undone.
            </p>
            <div className="history-confirm-dialog__actions">
              <button
                type="button"
                className="history-confirm-dialog__confirm"
                onClick={handleClearAll}
              >
                Yes, clear all
              </button>
              <button
                type="button"
                className="history-confirm-dialog__cancel"
                onClick={() => setShowClearConfirm(false)}
                autoFocus
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default History
