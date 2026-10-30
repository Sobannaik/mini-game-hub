import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { createGameSession } from '../../utils/gameSession'
import './Maze3D.css'

const CELL = 3.0

function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1))
  const visit = (x, y) => {
    grid[y][x] = 0
    const dirs = [[0,-2],[0,2],[-2,0],[2,0]].sort(() => Math.random() - 0.5)
    for (const [dx, dy] of dirs) {
      const nx = x+dx, ny = y+dy
      if (ny<0||ny>=rows||nx<0||nx>=cols||grid[ny][nx]===0) continue
      grid[y+dy/2][x+dx/2] = 0
      visit(nx, ny)
    }
  }
  visit(1, 1)
  grid[1][1] = 0
  grid[rows-2][cols-2] = 0
  return grid
}

export default function Maze3D() {
  const mountRef = useRef(null)
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'maze-3d', title: 'Maze 3D', icon: '🔦' })
  }
  /* All hot values in refs — not useEffect deps */
  const elapsedRef = useRef(0)
  const [elapsed,  setElapsed]  = useState(0)
  const [won,      setWon]      = useState(false)
  const [sceneKey, setSceneKey] = useState(0)

  const restart = useCallback(() => {
    elapsedRef.current = 0
    setElapsed(0)
    setWon(false)
    setSceneKey(k => k + 1)
  }, [])

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const COLS = 15, ROWS = 11
    const grid = generateMaze(COLS, ROWS)
    const W = COLS * CELL, D = ROWS * CELL

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = false
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000508')
    scene.fog = new THREE.FogExp2('#000508', 0.06)

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 40)
    camera.position.set(1*CELL - W/2 + CELL/2, 1.6, 1*CELL - D/2 + CELL/2)
    camera.rotation.order = 'YXZ'
    let yaw = 0

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight('#001015', 0.7))
    const torch = new THREE.PointLight('#ff9900', 4, 8)
    scene.add(torch)

    /* ── Floor & ceiling ── */
    const floorMat = new THREE.MeshLambertMaterial({ color: '#050d10' })
    scene.add(Object.assign(new THREE.Mesh(new THREE.PlaneGeometry(W,D), floorMat), { rotation: { x: -Math.PI/2, y:0, z:0 } }))
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W,D), new THREE.MeshLambertMaterial({ color:'#040c0f' }))
    ceil.rotation.x = Math.PI/2; ceil.position.y = CELL; scene.add(ceil)

    /* ── Walls — InstancedMesh ── */
    const wallCount = grid.reduce((n,row) => n + row.filter(c=>c===1).length, 0)
    const wallMesh  = new THREE.InstancedMesh(
      new THREE.BoxGeometry(CELL, CELL, CELL),
      new THREE.MeshLambertMaterial({ color: '#0e1e28' }),
      wallCount
    )
    const dummy = new THREE.Object3D()
    let idx = 0
    grid.forEach((row, z) => {
      row.forEach((cell, x) => {
        if (cell === 0) return
        dummy.position.set(x*CELL - W/2 + CELL/2, CELL/2, z*CELL - D/2 + CELL/2)
        dummy.updateMatrix()
        wallMesh.setMatrixAt(idx++, dummy.matrix)
      })
    })
    wallMesh.instanceMatrix.needsUpdate = true
    scene.add(wallMesh)

    /* ── Exit ── */
    const exitGX = (COLS-2)*CELL - W/2 + CELL/2
    const exitGZ = (ROWS-2)*CELL - D/2 + CELL/2
    const exitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, CELL, 10),
      new THREE.MeshBasicMaterial({ color: '#00ffaa' })
    )
    exitMesh.position.set(exitGX, CELL/2, exitGZ)
    scene.add(exitMesh)
    const exitLight = new THREE.PointLight('#00ffaa', 6, 8)
    exitLight.position.set(exitGX, 1.5, exitGZ)
    scene.add(exitLight)

    /* ── Minimap canvas ── */
    const mm = document.createElement('canvas')
    mm.width = COLS*6; mm.height = ROWS*6
    mm.style.cssText = 'position:absolute;bottom:12px;right:12px;width:90px;height:66px;border:1px solid #00f5ff33;opacity:0.8;pointer-events:none;image-rendering:pixelated'
    container.appendChild(mm)
    const mmCtx = mm.getContext('2d')
    const drawMM = (px, pz) => {
      mmCtx.fillStyle='#000'; mmCtx.fillRect(0,0,mm.width,mm.height)
      grid.forEach((row,z) => row.forEach((c,x) => {
        mmCtx.fillStyle = c===1?'#1a3040':'#060d12'
        mmCtx.fillRect(x*6,z*6,6,6)
      }))
      mmCtx.fillStyle='#00ffaa'; mmCtx.fillRect((COLS-2)*6+1,(ROWS-2)*6+1,4,4)
      const mx=Math.round((px+W/2)/CELL), mz=Math.round((pz+D/2)/CELL)
      mmCtx.fillStyle='#00f5ff'
      mmCtx.beginPath(); mmCtx.arc(mx*6+3,mz*6+3,3,0,Math.PI*2); mmCtx.fill()
    }

    /* ── Input ── */
    const keys = {}
    const onKey = (e) => { keys[e.code] = e.type==='keydown' }
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey)

    const onCanvasClick = () => renderer.domElement.requestPointerLock()
    renderer.domElement.addEventListener('click', onCanvasClick)
    const onMouseMove = (e) => { if (document.pointerLockElement!==renderer.domElement) return; yaw -= e.movementX*0.002 }
    document.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Wall collision ── */
    const isWall = (x, z) => {
      const gx = Math.round((x+W/2)/CELL), gz = Math.round((z+D/2)/CELL)
      return grid[gz]?.[gx] === 1
    }

    /* ── Timer UI at 1 Hz ── */
    const uiInterval = setInterval(() => { setElapsed(Math.floor(elapsedRef.current)) }, 1000)

    /* ── Game loop ── */
    const clock = new THREE.Clock()
    let raf, hasWon = false
    const SPEED = 5

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      if (!hasWon) elapsedRef.current += delta

      if (keys['KeyQ']) yaw += delta * 1.8
      if (keys['KeyE']) yaw -= delta * 1.8
      camera.rotation.y = yaw

      const fwd = new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw))
      const right = new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw))
      let dx=0, dz=0
      if (keys['KeyW']||keys['ArrowUp'])    { dx+=fwd.x;   dz+=fwd.z }
      if (keys['KeyS']||keys['ArrowDown'])  { dx-=fwd.x;   dz-=fwd.z }
      if (keys['KeyA']||keys['ArrowLeft'])  { dx-=right.x; dz-=right.z }
      if (keys['KeyD']||keys['ArrowRight']) { dx+=right.x; dz+=right.z }
      const len = Math.hypot(dx,dz)
      if (len > 0) {
        historySession.current.start()
        const nx = camera.position.x + (dx/len)*SPEED*delta
        const nz = camera.position.z + (dz/len)*SPEED*delta
        if (!isWall(nx, camera.position.z)) camera.position.x = nx
        if (!isWall(camera.position.x, nz)) camera.position.z = nz
      }
      camera.position.y = 1.6 + Math.sin(elapsedRef.current*6)*(len>0?0.04:0)
      torch.position.copy(camera.position)

      if (!hasWon && Math.hypot(camera.position.x-exitGX, camera.position.z-exitGZ) < 1.5) {
        hasWon = true; setWon(true); setElapsed(Math.floor(elapsedRef.current))
        historySession.current.finish({ result: 'Completed' })
        if (document.pointerLockElement) document.exitPointerLock()
      }

      drawMM(camera.position.x, camera.position.z)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(uiInterval)
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('click', onCanvasClick)
      if (document.pointerLockElement) document.exitPointerLock()
      renderer.dispose()
      if (container.contains(mm)) container.removeChild(mm)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [sceneKey])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <main className="maze3d">
      <div className="m3-header">
        <div>
          <p className="m3-eyebrow">3D GAMES / 05</p>
          <h1>Maze 3D</h1>
          <p>First-person maze. Find the <span style={{color:'#00ffaa'}}>green exit</span>.</p>
        </div>
        <div className="m3-stats">
          <span>⏱ Time <strong>{fmt(elapsed)}</strong></span>
          <span>{won ? '✅ ESCAPED!' : '🔦 Find the exit'}</span>
        </div>
      </div>

      <div className="m3-scene" ref={mountRef} aria-label="First-person 3D maze">
        {won && (
          <div className="m3-overlay">
            <span>🏁</span>
            <strong>MAZE ESCAPED!</strong>
            <p>Time: {fmt(elapsed)}</p>
            <button type="button" onClick={restart}>New Maze</button>
          </div>
        )}
        <div className="m3-hint">Click canvas → capture mouse · WASD/Arrows move · Q/E turn</div>
      </div>

      <div className="m3-footer">
        <span>WASD move · Q/E turn · Mouse look (click canvas) · Minimap bottom-right</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}
