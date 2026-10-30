import { addHistoryEntry } from './historyStore'

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createGameSession(game) {
  let activeSession = null

  return {
    start() {
      if (activeSession) return
      activeSession = {
        id: createSessionId(),
        startedAt: Date.now(),
        details: {},
      }
    },

    update(details) {
      if (activeSession && details && typeof details === 'object') {
        activeSession.details = { ...activeSession.details, ...details }
      }
    },

    finish(details = {}) {
      if (!activeSession) return null

      const session = activeSession
      activeSession = null
      const duration = Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000))

      return addHistoryEntry({
        ...session.details,
        ...details,
        gameId: game.id,
        gameName: game.title,
        gameIcon: game.icon,
        sessionId: session.id,
        playedAt: new Date(session.startedAt).toISOString(),
        duration,
      })
    },
  }
}

export function attachEmbeddedGameSession(iframe, game) {
  let frameDocument
  try {
    frameDocument = iframe.contentDocument
  } catch {
    return { finish: () => null }
  }
  if (!frameDocument) return { finish: () => null }

  const session = createGameSession(game)
  const start = () => session.start()
  const inputEvents = ['pointerdown', 'keydown', 'touchstart']
  inputEvents.forEach((eventName) => frameDocument.addEventListener(eventName, start, true))

  return {
    finish() {
      inputEvents.forEach((eventName) => frameDocument.removeEventListener(eventName, start, true))
      return session.finish()
    },
  }
}