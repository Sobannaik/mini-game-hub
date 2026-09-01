/**
 * GAMES_DATA — single source of truth for all game metadata.
 *
 * When a new game is added, update this file ONLY.
 * The Home and Games pages will automatically reflect the change.
 *
 * Fields:
 *  id          — unique kebab-case identifier (used in the URL)
 *  title       — display name
 *  description — short one-liner shown on game cards
 *  icon        — emoji used as placeholder icon
 *  to          — route path (must match App.jsx)
 *  accentColor — unique colour per game for card hover effect
 */
const GAMES_DATA = [
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description: 'Classic X vs O. First to three in a row wins.',
    icon: '⭕',
    to: '/games/tic-tac-toe',
    accentColor: '#3b82f6',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    description: 'Beat the computer in the timeless hand game.',
    icon: '✊',
    to: '/games/rock-paper-scissors',
    accentColor: '#22c55e',
  },
  {
    id: 'reaction-time',
    title: 'Reaction Time',
    description: 'How fast can you click? Test your reflexes.',
    icon: '⚡',
    to: '/games/reaction-time',
    accentColor: '#f59e0b',
  },
  {
    id: 'word-puzzle',
    title: 'Word Puzzle',
    description: 'Unscramble letters and find hidden words.',
    icon: '🔤',
    to: '/games/word-puzzle',
    accentColor: '#ec4899',
  },
  {
    id: 'image-puzzle',
    title: 'Image Puzzle',
    description: 'Slide the tiles back into place to reveal the image.',
    icon: '🧩',
    to: '/games/image-puzzle',
    accentColor: '#14b8a6',
  },
]

export default GAMES_DATA
