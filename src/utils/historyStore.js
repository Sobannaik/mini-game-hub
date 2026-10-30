const STORAGE_KEY = 'gamebreak-history'
const MAX_ENTRIES = 200

function notifyHistoryChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('gamebreak-history-updated'))
  }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((entry) => (
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.gameId === 'string' &&
        typeof entry.gameName === 'string' &&
        Number.isFinite(Date.parse(entry.playedAt))
      ))
      .sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt))
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    notifyHistoryChanged()
  } catch {
    return false
  }
  return true
}

export function addHistoryEntry(entry) {
  if (!entry || typeof entry.gameId !== 'string' || typeof entry.gameName !== 'string') {
    return null
  }

  const existing = loadHistory()
  const now = Date.now()

  if (entry.sessionId && existing.some((saved) => saved.sessionId === entry.sessionId)) {
    return null
  }

  const newEntry = {
    id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
    playedAt: Number.isFinite(Date.parse(entry.playedAt))
      ? new Date(entry.playedAt).toISOString()
      : new Date(now).toISOString(),
    gameId: entry.gameId,
    gameName: entry.gameName,
    gameIcon: entry.gameIcon || '🎮',
  }

  if (typeof entry.sessionId === 'string') newEntry.sessionId = entry.sessionId
  if (typeof entry.result === 'string' && entry.result.trim()) newEntry.result = entry.result.trim()
  if (Number.isFinite(entry.score)) newEntry.score = entry.score
  if (Number.isFinite(entry.duration) && entry.duration >= 0) newEntry.duration = Math.floor(entry.duration)
  if (Number.isFinite(entry.level) && entry.level > 0) newEntry.level = Math.floor(entry.level)
  if (typeof entry.details === 'string' && entry.details.trim()) newEntry.details = entry.details.trim()

  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES)
  return saveHistory(updated) ? newEntry : null
}

export function removeHistoryEntry(id) {
  const existing = loadHistory()
  saveHistory(existing.filter((e) => e.id !== id))
}

export function clearHistory() {
  saveHistory([])
}
