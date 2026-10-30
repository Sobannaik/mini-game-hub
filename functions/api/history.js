/**
 * Cloudflare Pages Function: /api/history
 * Connects directly to Cloudflare D1 Serverless SQL Database.
 */

export async function onRequestGet(context) {
  const { env, request } = context
  const url = new URL(request.url)
  const gameId = url.searchParams.get('gameId')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 200)

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database binding DB not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    let query
    let params = []

    if (gameId && gameId !== 'all') {
      query = 'SELECT * FROM game_sessions WHERE game_id = ? ORDER BY played_at DESC LIMIT ?'
      params = [gameId, limit]
    } else {
      query = 'SELECT * FROM game_sessions ORDER BY played_at DESC LIMIT ?'
      params = [limit]
    }

    const { results } = await env.DB.prepare(query).bind(...params).all()

    // Map database snake_case to frontend camelCase
    const formatted = results.map(row => ({
      id: row.id,
      playerName: row.player_name,
      gameId: row.game_id,
      gameName: row.game_name,
      gameIcon: row.game_icon,
      result: row.result,
      score: row.score,
      duration: row.duration,
      details: row.details,
      playedAt: row.played_at,
    }))

    return new Response(JSON.stringify({ success: true, data: formatted }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestPost(context) {
  const { env, request } = context

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database binding DB not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    const body = await request.json()
    const id = body.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const playerName = (body.playerName || 'Player').slice(0, 40)
    const gameId = body.gameId || 'game'
    const gameName = body.gameName || 'Game'
    const gameIcon = body.gameIcon || '🎮'
    const result = body.result || null
    const score = typeof body.score === 'number' ? body.score : null
    const duration = typeof body.duration === 'number' ? body.duration : null
    const details = body.details ? String(body.details).slice(0, 200) : null
    const playedAt = body.playedAt || new Date().toISOString()

    // Insert session into D1 SQL database
    await env.DB.prepare(
      `INSERT INTO game_sessions (id, player_name, game_id, game_name, game_icon, result, score, duration, details, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, playerName, gameId, gameName, gameIcon, result, score, duration, details, playedAt).run()

    // If game has a score, record to high_scores table as well
    if (score !== null && score > 0) {
      await env.DB.prepare(
        `INSERT INTO high_scores (id, player_name, game_id, game_name, score, details, achieved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(`${id}-score`, playerName, gameId, gameName, score, details, playedAt).run()
    }

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const clearAll = url.searchParams.get('clear') === 'all'

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database binding DB not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    if (clearAll) {
      await env.DB.prepare('DELETE FROM game_sessions').run()
      return new Response(JSON.stringify({ success: true, message: 'All sessions cleared' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    if (id) {
      await env.DB.prepare('DELETE FROM game_sessions WHERE id = ?').bind(id).run()
      return new Response(JSON.stringify({ success: true, message: 'Session deleted' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    return new Response(JSON.stringify({ success: false, error: 'id or clear=all parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
