import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { createGameSession } from '../../utils/gameSession'
import './Runner3D.css'

const LANE_X    = [-2.6, 0, 2.6]
const TILE_LEN  = 6
const POOL_SIZE = 10
const INIT_SPEED = 9

export default function Runner3D() {
  const mountRef   = useRef(null)
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'runner-3d', title: 'Runner 3D', icon: '🏃' })
  }
  /* All game values in refs — NEVER in useEffect deps */
  const scoreRef   = useRef(0)
  const bestRef    = useRef(0)
  const overRef    = useRef(false)
  const startedRef = useRef(false)

  const [score,    setScore]    = useState(0)
  const [best,     setBest]     = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started,  setStarted]  = useState(false)
  /* sceneKey bumps destroy+recreate the canvas */
  const [sceneKey, setSceneKey] = useState(0)

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (gameOver) historySession.current.finish({ result: 'Game Over', score })
  }, [gameOver, score])

  const launch = useCallback(() => {
    historySession.current.start()
    scoreRef.current  = 0
    overRef.current   = false
    startedRef.current = true
    setScore(0)
    setGameOver(false)
    setStarted(true)
    setSceneKey(k => k + 1)   // remount canvas
  }, [])

  useEffect(() => {
    if (!started) return
    const container = mountRef.current
    if (!container) return

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = false
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color('#02010d')
    scene.fog = new THREE.Fog('#02010d', 20, 42)

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 60)
    camera.position.set(0, 3.5, 7)
    camera.lookAt(0, 1, -8)

    /* ── Lights — minimal ── */
    scene.add(new THREE.AmbientLight('#100030', 2.5))
    const keyL = new THREE.DirectionalLight('#cc88ff', 1.5)
    keyL.position.set(0, 8, 5)
    scene.add(keyL)

    /* ── Road tiles — InstancedMesh ── */
    const tileMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(9, TILE_LEN),
      new THREE.MeshLambertMaterial({ color: '#0d0020' }),
      POOL_SIZE
    )
    tileMesh.rotation.x = -Math.PI / 2
    const tileDummy = new THREE.Object3D()
    // tile positions stored separately
    const tilePositions = Array.from({ length: POOL_SIZE }, (_, i) => -i * TILE_LEN)
    const updateTiles = () => {
      tilePositions.forEach((z, i) => {
        tileDummy.position.set(0, 0, z)
        tileDummy.updateMatrix()
        tileMesh.setMatrixAt(i, tileDummy.matrix)
      })
      tileMesh.instanceMatrix.needsUpdate = true
    }
    updateTiles()
    scene.add(tileMesh)

    /* ── Neon edge rails ── */
    ;[[-4.6,'#00f5ff'],[4.6,'#00f5ff']].forEach(([x,color]) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.35, TILE_LEN * POOL_SIZE),
        new THREE.MeshBasicMaterial({ color })
      )
      rail.position.set(x, 0.18, -TILE_LEN * POOL_SIZE / 2)
      scene.add(rail)
    })
    ;[[-1.3,'#ff2d9b'],[1.3,'#ff2d9b']].forEach(([x,color]) => {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, TILE_LEN * POOL_SIZE),
        new THREE.MeshBasicMaterial({ color })
      )
      line.rotation.x = -Math.PI / 2
      line.position.set(x, 0.01, -TILE_LEN * POOL_SIZE / 2)
      scene.add(line)
    })

    /* ── Stars ── */
    const starGeo = new THREE.BufferGeometry()
    const sp = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      sp[i*3] = (Math.random()-0.5)*80; sp[i*3+1]=Math.random()*20+2; sp[i*3+2]=-(Math.random()*80)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:'#ffffff', size:0.14 })))

    /* ── Player ── */
    const playerGroup = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7,1.1,0.5), new THREE.MeshBasicMaterial({ color:'#00f5ff' }))
    body.position.y = 0.55
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55), new THREE.MeshBasicMaterial({ color:'#ffcf8b' }))
    head.position.y = 1.4
    playerGroup.add(body, head)
    playerGroup.position.set(0, 0, 4)
    scene.add(playerGroup)

    /* ── Obstacles ── */
    const BOOST_MAT = new THREE.MeshBasicMaterial({ color: '#ffdd00' })
    const OBS_MATS  = [new THREE.MeshBasicMaterial({ color:'#ff2d9b' }), new THREE.MeshBasicMaterial({ color:'#bf5fff' })]
    const obstacles  = []
    let nextSpawnZ   = -28

    const spawnObject = (z) => {
      const lane    = Math.floor(Math.random() * 3)
      const isBoost = Math.random() < 0.15
      const geo = isBoost ? new THREE.OctahedronGeometry(0.4) : new THREE.BoxGeometry(0.8,1.2,0.8)
      const mat = isBoost ? BOOST_MAT : OBS_MATS[Math.floor(Math.random()*2)]
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(LANE_X[lane], isBoost ? 0.8 : 0.6, z)
      mesh.userData = { lane, isBoost, hit: false }
      scene.add(mesh)
      obstacles.push(mesh)
    }
    for (let i = 0; i < 5; i++) { spawnObject(nextSpawnZ); nextSpawnZ -= 8 + Math.random() * 5 }

    /* ── State ── */
    let lane = 1, targetX = LANE_X[1], laneChanging = false
    let speed = INIT_SPEED, traveled = 0
    let localScore = 0, boosted = false, boostTimer = 0
    let tileZ = 0

    /* ── Input ── */
    const handleKey = (e) => {
      if (overRef.current) return
      if ((e.key==='ArrowLeft'||e.key==='a') && lane>0 && !laneChanging) { lane--; targetX=LANE_X[lane]; laneChanging=true }
      if ((e.key==='ArrowRight'||e.key==='d') && lane<2 && !laneChanging) { lane++; targetX=LANE_X[lane]; laneChanging=true }
    }
    let touchStartX = 0
    const onTouchStart = (e) => { touchStartX = e.touches[0].clientX }
    const onTouchEnd   = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      if (dx < -40 && lane>0 && !laneChanging) { lane--; targetX=LANE_X[lane]; laneChanging=true }
      if (dx >  40 && lane<2 && !laneChanging) { lane++; targetX=LANE_X[lane]; laneChanging=true }
    }
    window.addEventListener('keydown', handleKey)
    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchend', onTouchEnd)

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Update UI at 10 Hz — not every frame ── */
    const uiInterval = setInterval(() => {
      setScore(Math.floor(localScore))
    }, 100)

    /* ── Game loop ── */
    const clock = new THREE.Clock()
    let raf

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      if (overRef.current) { renderer.render(scene, camera); return }

      speed = INIT_SPEED + traveled * 0.003
      const curSpeed = boosted ? speed * 1.6 : speed
      const dz = curSpeed * delta
      traveled += dz
      localScore = traveled

      // Boost
      if (boosted) { boostTimer -= delta; if (boostTimer <= 0) boosted = false }

      // Scroll tiles
      tileZ += dz
      tilePositions.forEach((_, i) => { tilePositions[i] += dz })
      let dirty = false
      tilePositions.forEach((z, i) => { if (z > 12) { tilePositions[i] -= TILE_LEN * POOL_SIZE; dirty = true } })
      if (dirty) updateTiles()
      else {
        tilePositions.forEach((z, i) => {
          tileDummy.position.set(0, 0, z)
          tileDummy.updateMatrix()
          tileMesh.setMatrixAt(i, tileDummy.matrix)
        })
        tileMesh.instanceMatrix.needsUpdate = true
      }

      // Move obstacles
      for (const ob of obstacles) { ob.position.z += dz; ob.rotation.y += delta }

      // Spawn
      if (!obstacles.length || obstacles[obstacles.length-1].position.z > nextSpawnZ) {
        spawnObject(nextSpawnZ); nextSpawnZ = obstacles[obstacles.length-1].position.z - (8 + Math.random()*5)
      }
      while (obstacles.length && obstacles[0].position.z > 10) scene.remove(obstacles.shift())

      // Lane lerp
      playerGroup.position.x = THREE.MathUtils.lerp(playerGroup.position.x, targetX, 0.18)
      if (Math.abs(playerGroup.position.x - targetX) < 0.05) laneChanging = false
      playerGroup.position.y = Math.abs(Math.sin(t * 8)) * 0.1

      // Collision
      for (const ob of obstacles) {
        if (ob.userData.hit) continue
        if (Math.abs(playerGroup.position.x - ob.position.x) < 0.72 && Math.abs(4 - ob.position.z) < 0.85) {
          if (ob.userData.isBoost) { ob.userData.hit = true; ob.visible = false; boosted = true; boostTimer = 3 }
          else {
            overRef.current = true
            setBest(prev => Math.max(prev, Math.floor(localScore)))
            setScore(Math.floor(localScore))
            setGameOver(true)
            break
          }
        }
      }

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerGroup.position.x * 0.28, 0.06)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(uiInterval)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [sceneKey]) // only re-mount when sceneKey changes (on launch/restart)

  return (
    <main className="runner3d">
      <div className="r3-header">
        <div>
          <p className="r3-eyebrow">3D GAMES / 04</p>
          <h1>Runner 3D</h1>
          <p>Dodge obstacles · Collect gold boosts · Run forever</p>
        </div>
        <div className="r3-stats">
          <span>Score <strong>{score}</strong></span>
          <span>Best  <strong>{best}</strong></span>
        </div>
      </div>

      <div className="r3-scene" ref={mountRef} aria-label="3D endless runner">
        {!started && (
          <div className="r3-overlay">
            <span>🏃</span>
            <strong>RUNNER 3D</strong>
            <p>Dodge pink &amp; purple obstacles · Gold boosts give speed burst</p>
            <button type="button" onClick={launch}>Start Running</button>
          </div>
        )}
        {gameOver && (
          <div className="r3-overlay r3-dead">
            <span>💥</span>
            <strong>GAME OVER</strong>
            <p>Score: {score} · Best: {best}</p>
            <button type="button" onClick={launch}>Try Again</button>
          </div>
        )}
      </div>

      <div className="r3-footer">
        <span>← → or A/D to change lanes · Gold ⬡ = speed boost</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}
