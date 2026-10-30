import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import './HorrorMaze.css'

const MAZES = [
  {
    grid: [
      '111111111111111',
      '1S0000000010001',
      '1011110111010K1',
      '1000010000010K1',
      '1111010111110E1',
      '1000010000001E1',
      '1011110111101E1',
      '1000000000001E1',
      '1011110111101E1',
      '1000010000001E1',
      '1111111111111E1',
    ].map(r => r.replace(/E/g, '1')),
    keys: 2,
  },
]

function parseGrid(grid) {
  const items = { player: null, exit: null, keys: [] }
  const clean = grid.map((row, z) =>
    row.split('').map((ch, x) => {
      if (ch === 'S') { items.player = { x, z }; return '0' }
      if (ch === 'E') { items.exit  = { x, z }; return '0' }
      if (ch === 'K') { items.keys.push({ x, z }); return '0' }
      return ch
    }).join('')
  )
  if (!items.exit) items.exit = { x: 13, z: 4 }
  return { clean, ...items }
}

function bfs(grid, from, to) {
  const rows = grid.length, cols = grid[0].length
  const queue = [{ ...from, path: [] }]
  const visited = new Set([`${from.x},${from.z}`])
  const dirs = [[0,-1],[0,1],[-1,0],[1,0]]
  while (queue.length) {
    const { x, z, path } = queue.shift()
    if (x === to.x && z === to.z) return path
    for (const [dx, dz] of dirs) {
      const nx = x + dx, nz = z + dz
      const key = `${nx},${nz}`
      if (nx < 0 || nz < 0 || nx >= cols || nz >= rows) continue
      if (grid[nz]?.[nx] === '1') continue
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({ x: nx, z: nz, path: [...path, { x: nx, z: nz }] })
    }
  }
  return []
}

function worldPos(x, z, cols, rows) {
  const CELL = 2.2
  return new THREE.Vector3(
    x * CELL - (cols * CELL) / 2 + CELL / 2,
    0,
    z * CELL - (rows * CELL) / 2 + CELL / 2
  )
}

export default function HorrorMaze() {
  const sceneRef  = useRef(null)
  /* Use refs for frequently-updated values — avoids re-mounting the scene */
  const statusRef = useRef('playing')
  const [status,   setStatus]   = useState('playing')
  const [keysLeft, setKeysLeft] = useState(MAZES[0].keys)
  const resetKey  = useRef(0)  // bumping this triggers a fresh scene

  const restart = useCallback(() => {
    statusRef.current = 'playing'
    setStatus('playing')
    setKeysLeft(MAZES[0].keys)
    resetKey.current += 1
    // Force re-render with new reset key
    setStatus(s => s === 'playing' ? 'resetting' : 'playing')
    setTimeout(() => { statusRef.current = 'playing'; setStatus('playing') }, 0)
  }, [])

  useEffect(() => {
    const container = sceneRef.current
    if (!container) return

    const mazeData = MAZES[0]
    const { clean: grid, player: startCell, exit: exitCell, keys: keyPositions } = parseGrid(mazeData.grid)
    const CELL = 2.2
    const ROWS = grid.length, COLS = grid[0].length
    const W = COLS * CELL, D = ROWS * CELL

    /* ── Renderer — no antialias, pixelRatio=1 for perf ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = false   // shadows off = big perf win
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#020005')
    scene.fog = new THREE.FogExp2('#0a0010', 0.06)

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 40)

    /* ── Lights — minimal ── */
    scene.add(new THREE.AmbientLight('#2a000f', 1.2))
    const torch = new THREE.PointLight('#ff1020', 3, 12)
    scene.add(torch)

    /* ── Floor ── */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(W, D),
      new THREE.MeshLambertMaterial({ color: '#0b0010' })
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    /* ── Walls — InstancedMesh for performance ── */
    const wallCount = grid.reduce((n, row) => n + row.split('').filter(c => c === '1').length, 0)
    const wallMesh  = new THREE.InstancedMesh(
      new THREE.BoxGeometry(CELL * 0.95, 2.2, CELL * 0.95),
      new THREE.MeshLambertMaterial({ color: '#1a0520' }),
      wallCount
    )
    let idx = 0
    const dummy = new THREE.Object3D()
    grid.forEach((row, z) => {
      row.split('').forEach((ch, x) => {
        if (ch !== '1') return
        const wp = worldPos(x, z, COLS, ROWS)
        dummy.position.set(wp.x, 1.1, wp.z)
        dummy.updateMatrix()
        wallMesh.setMatrixAt(idx++, dummy.matrix)
      })
    })
    wallMesh.instanceMatrix.needsUpdate = true
    scene.add(wallMesh)

    /* ── Exit ── */
    const ep = worldPos(exitCell.x, exitCell.z, COLS, ROWS)
    const exitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16),
      new THREE.MeshBasicMaterial({ color: '#ff2020' })
    )
    exitMesh.position.set(ep.x, 0.06, ep.z)
    scene.add(exitMesh)
    const exitLight = new THREE.PointLight('#ff3030', 4, 4)
    exitLight.position.set(ep.x, 1, ep.z)
    scene.add(exitLight)

    /* ── Keys ── */
    const keyMeshes = keyPositions.map(({ x, z }) => {
      const kp = worldPos(x, z, COLS, ROWS)
      const key = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.33),
        new THREE.MeshBasicMaterial({ color: '#ffcc00' })
      )
      key.position.set(kp.x, 0.8, kp.z)
      scene.add(key)
      return { mesh: key, x, z, collected: false }
    })

    /* ── Player ── */
    const player = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.75),
      new THREE.MeshBasicMaterial({ color: '#00cfff' })
    )
    scene.add(player)
    const playerCell = { ...startCell }

    /* ── Enemy ── */
    const enemy = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 6),
      new THREE.MeshBasicMaterial({ color: '#cc0010' })
    )
    scene.add(enemy)
    const enemyCell = { x: COLS - 2, z: ROWS - 2 }
    const enemyLight = new THREE.PointLight('#ff0000', 3, 5)
    scene.add(enemyLight)

    /* ── State — refs only, no setState in loop ── */
    let keysCollected = 0
    let isDead = false, hasEscaped = false
    let enemyMoveTimer = 0
    const ENEMY_INTERVAL = 0.7

    const updatePos = (mesh, cell) => {
      const wp = worldPos(cell.x, cell.z, COLS, ROWS)
      mesh.position.set(wp.x, 0.5, wp.z)
    }
    updatePos(player, playerCell)
    updatePos(enemy, enemyCell)

    const updateCamera = () => {
      const wp = worldPos(playerCell.x, playerCell.z, COLS, ROWS)
      camera.position.set(wp.x + 5, 10, wp.z + 7)
      camera.lookAt(wp.x, 0, wp.z)
      torch.position.set(wp.x, 4, wp.z)
    }
    updateCamera()

    const canMoveTo = (x, z) => grid[z]?.[x] === '0'
    const keyState = {}
    const getDirectionFromEvent = (e) => {
      const key = e.key ? e.key.toLowerCase() : ''
      const code = e.code ? e.code.toLowerCase() : ''
      const normalized = key === 'arrowup' ? 'arrowup' : key === 'arrowdown' ? 'arrowdown' : key === 'arrowleft' ? 'arrowleft' : key === 'arrowright' ? 'arrowright' : key
      const dirs = {
        arrowup: [0, -1],
        w: [0, -1],
        arrowdown: [0, 1],
        s: [0, 1],
        arrowleft: [-1, 0],
        a: [-1, 0],
        arrowright: [1, 0],
        d: [1, 0],
      }
      return dirs[normalized] || dirs[code] || null
    }

    const handleMovement = (e) => {
      if (isDead || hasEscaped) return
      const dir = getDirectionFromEvent(e)
      if (!dir) return
      e.preventDefault()
      const nx = playerCell.x + dir[0], nz = playerCell.z + dir[1]
      if (!canMoveTo(nx, nz)) return
      playerCell.x = nx; playerCell.z = nz
      updatePos(player, playerCell)
      updateCamera()
      keyMeshes.forEach(k => {
        if (!k.collected && k.x === nx && k.z === nz) {
          k.collected = true; k.mesh.visible = false
          keysCollected++
          setKeysLeft(p => p - 1)
        }
      })
      if (nx === exitCell.x && nz === exitCell.z && keysCollected >= mazeData.keys) {
        hasEscaped = true; statusRef.current = 'escaped'; setStatus('escaped')
      }
      if (nx === enemyCell.x && nz === enemyCell.z) {
        isDead = true; statusRef.current = 'dead'; setStatus('dead')
      }
    }

    const handleKeyDown = (e) => {
      const dir = getDirectionFromEvent(e)
      if (!dir) return
      keyState[e.key ? e.key.toLowerCase() : e.code.toLowerCase()] = true
      handleMovement(e)
    }
    const handleKeyUp = (e) => {
      if (e.key) keyState[e.key.toLowerCase()] = false
      if (e.code) keyState[e.code.toLowerCase()] = false
    }

    const handleSceneKey = (e) => {
      const dir = getDirectionFromEvent(e)
      if (!dir) return
      e.preventDefault()
      handleMovement(e)
    }

    container.tabIndex = 0
    const focusScene = () => container.focus()
    container.addEventListener('click', focusScene)
    container.addEventListener('keydown', handleSceneKey)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const moveEnemy = () => {
      const path = bfs(grid, enemyCell, playerCell)
      if (path.length > 0) {
        const next = path[0]
        enemyCell.x = next.x; enemyCell.z = next.z
        updatePos(enemy, enemyCell)
        enemyLight.position.copy(enemy.position).y += 1
        if (enemyCell.x === playerCell.x && enemyCell.z === playerCell.z) {
          isDead = true; statusRef.current = 'dead'; setStatus('dead')
        }
      }
    }

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      keyMeshes.forEach(k => { if (!k.collected) { k.mesh.position.y = 0.8 + Math.sin(t * 2 + k.x) * 0.15; k.mesh.rotation.y += 0.03 } })
      exitMesh.rotation.y += 0.02
      exitLight.intensity = 2.5 + Math.sin(t * 4) * 1.2
      if (!isDead && !hasEscaped) {
        enemyMoveTimer += delta
        if (enemyMoveTimer >= ENEMY_INTERVAL) { enemyMoveTimer = 0; moveEnemy() }
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      container.removeEventListener('click', focusScene)
      container.removeEventListener('keydown', handleSceneKey)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [resetKey.current]) // only re-mount on restart, NOT on status/keys change

  return (
    <main className="horror-maze">
      <div className="hm-header">
        <div>
          <p className="hm-eyebrow">3D GAMES / 02</p>
          <h1>Horror Maze</h1>
          <p>Collect all keys — then reach the red exit. Don&apos;t let it catch you.</p>
        </div>
        <div className="hm-stats">
          <span>🗝️ Keys <strong>{keysLeft} left</strong></span>
          <span>{status === 'dead' ? '💀 YOU DIED' : status === 'escaped' ? '🚪 ESCAPED!' : '👁️ It hunts you…'}</span>
        </div>
      </div>

      <div className="hm-scene" ref={sceneRef} aria-label="3D horror maze">
        {status === 'dead' && (
          <div className="hm-overlay hm-dead">
            <span>💀</span>
            <strong>YOU WERE CAUGHT</strong>
            <button type="button" onClick={restart}>Try Again</button>
          </div>
        )}
        {status === 'escaped' && (
          <div className="hm-overlay hm-win">
            <span>🚪</span>
            <strong>YOU ESCAPED!</strong>
            <button type="button" onClick={restart}>Play Again</button>
          </div>
        )}
      </div>

      <div className="hm-footer">
        <span>WASD / Arrow keys to move · Collect gold keys · Reach red exit</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}
