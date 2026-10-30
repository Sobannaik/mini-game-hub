import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  removeHistoryEntry,
} from '../src/utils/historyStore.js'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
}

test('invalid localStorage data safely loads as empty history', () => {
  storage.set('gamebreak-history', '{broken json')
  assert.deepEqual(loadHistory(), [])
  storage.set('gamebreak-history', JSON.stringify({ unexpected: true }))
  assert.deepEqual(loadHistory(), [])
})

test('records optional session details and prevents duplicate session events', () => {
  clearHistory()
  const playedAt = '2025-01-02T03:04:05.000Z'
  const entry = addHistoryEntry({
    sessionId: 'session-one',
    gameId: 'snake',
    gameName: 'Snake',
    gameIcon: '🐍',
    playedAt,
    score: 40,
    duration: 12.9,
    result: 'Game Over',
  })

  assert.equal(entry.score, 40)
  assert.equal(entry.duration, 12)
  assert.equal(entry.playedAt, playedAt)
  assert.equal(addHistoryEntry({ ...entry }), null)
  assert.equal(loadHistory().length, 1)
})

test('separate plays of the same game are retained and removable', () => {
  clearHistory()
  const first = addHistoryEntry({ sessionId: 'play-a', gameId: 'snake', gameName: 'Snake' })
  const second = addHistoryEntry({ sessionId: 'play-b', gameId: 'snake', gameName: 'Snake' })

  assert.equal(loadHistory().length, 2)
  removeHistoryEntry(first.id)
  assert.deepEqual(loadHistory().map((entry) => entry.id), [second.id])
  clearHistory()
  assert.deepEqual(loadHistory(), [])
})