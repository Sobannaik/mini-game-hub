import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { createGameSession } from '../../utils/gameSession'
import './EndlessRunner.css'

const PLATFORM_W = 3.5
const PLATFORM_H = 0.3
const PLATFORM_D = 4.5
const POOL = 12
const INIT_SPEED = 7
const GRAVITY = -22
const JUMP_VEL = 9.5

export default function EndlessRunner() {
  const mountRef   = useRef(null)
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'endless-runner', title: 'Endless Runner', icon: '🚀' })
  }
  const overRef    = useRef(false)
  const scoreRef   = useRef(0)

  const [score,    setScore]    = useState(0)
  const [best,     setBest]     = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started,  setStarted]  = useState(false)
  const [sceneKey, setSceneKey] = useState(0)

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (gameOver) historySession.current.finish({ result: 'Game Over', score })
  }, [gameOver, score])

  const launch = useCallback(() => {
    historySession.current.start()
    overRef.current  = false
    scoreRef.current = 0
    setScore(0)
    setGameOver(false)
    setStarted(true)
    setSceneKey(k => k + 1)
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
    scene.background = new THREE.Color('#010008')
    scene.fog = new THREE.Fog('#010008', 22, 50)

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 70)
    camera.position.set(0, 4, 9)
    camera.lookAt(0, 1, -5)

    /* ── Lights — minimal ── */
    scene.add(new THREE.AmbientLight('#080020', 2))
    const keyL = new THREE.DirectionalLight('#9988ff', 1.5)
    keyL.position.set(0, 8, 4)
    scene.add(keyL)

    /* ── Stars ── */
    const sp = new Float32Array(500 * 3)
    for (let i=0;i<500;i++){ sp[i*3]=(Math.random()-.5)*100; sp[i*3+1]=Math.random()*30+2; sp[i*3+2]=-(Math.random()*100) }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:'#ffffff', size:0.14 }))
    scene.add(stars)

    /* ── Platform pool — InstancedMesh ── */
    const platMat = new THREE.MeshLambertMaterial({ color: '#1a0550' })
    const platMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(PLATFORM_W, PLATFORM_H, PLATFORM_D),
      platMat,
      POOL
    )
    scene.add(platMesh)

    // Edge strips using separate InstancedMesh
    const edgeMat = new THREE.MeshBasicMaterial({ color: '#bf5fff' })
    const edgeMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.1, PLATFORM_H+0.05, PLATFORM_D),
      edgeMat,
      POOL * 2
    )
    scene.add(edgeMesh)

    const dummy = new THREE.Object3D()
    // Platform positions (x, y, z)
    const platPos = []
    let nextZ = 0
    for (let i = 0; i < POOL; i++) {
      platPos.push({ x: (Math.random()-.5)*2.5, y: -1.5, z: nextZ })
      nextZ -= PLATFORM_D + 1.4 + Math.random()*2
    }

    const updatePlatInstances = () => {
      platPos.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z); dummy.updateMatrix()
        platMesh.setMatrixAt(i, dummy.matrix)
        dummy.position.set(p.x - PLATFORM_W/2 + 0.05, p.y, p.z); dummy.updateMatrix()
        edgeMesh.setMatrixAt(i*2, dummy.matrix)
        dummy.position.set(p.x + PLATFORM_W/2 - 0.05, p.y, p.z); dummy.updateMatrix()
        edgeMesh.setMatrixAt(i*2+1, dummy.matrix)
      })
      platMesh.instanceMatrix.needsUpdate = true
      edgeMesh.instanceMatrix.needsUpdate = true
    }
    updatePlatInstances()

    /* ── Coins ── */
    const coinMat = new THREE.MeshBasicMaterial({ color: '#ffee00' })
    const MAX_COINS = 30
    const coinMesh = new THREE.InstancedMesh(new THREE.TorusGeometry(0.2,0.06,6,12), coinMat, MAX_COINS)
    scene.add(coinMesh)
    const coinData = Array.from({ length: MAX_COINS }, () => ({ x:0, y:-99, z:0, hit:false }))
    let coinIdx = 0
    const spawnCoin = (px, py, z) => {
      const d = coinData[coinIdx % MAX_COINS]
      d.x = px + (Math.random()-.5)*1.2; d.y = py + 0.8; d.z = z; d.hit = false
      coinIdx = (coinIdx + 1) % MAX_COINS
    }
    const updateCoins = () => {
      coinData.forEach((d, i) => {
        dummy.position.set(d.x, d.y, d.z)
        dummy.rotation.y = overRef.current ? 0 : Date.now()/500
        dummy.updateMatrix()
        coinMesh.setMatrixAt(i, dummy.matrix)
      })
      coinMesh.instanceMatrix.needsUpdate = true
    }

    /* ── Obstacles ── */
    const obsMat  = new THREE.MeshBasicMaterial({ color: '#ff2d9b' })
    const obstacles = []

    const decoratePlat = (p) => {
      for (let i=0;i<3;i++) spawnCoin(p.x, p.y, p.z - 0.8 + i*0.8)
      if (Math.random() < 0.3) {
        const ob = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.0,0.6), obsMat)
        ob.position.set(p.x+(Math.random()-.5), p.y+PLATFORM_H/2+0.5, p.z+(Math.random()-.5))
        scene.add(ob)
        obstacles.push(ob)
      }
    }
    platPos.forEach(decoratePlat)

    /* ── Player ── */
    const playerGroup = new THREE.Group()
    const pBody  = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.9,0.5), new THREE.MeshBasicMaterial({color:'#00f5ff'}))
    pBody.position.y = 0.45
    const pVisor = new THREE.Mesh(new THREE.SphereGeometry(0.28,8,6), new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0.7}))
    pVisor.position.y = 1.1
    playerGroup.add(pBody, pVisor)
    playerGroup.position.set(0, 0, 4)
    scene.add(playerGroup)

    /* ── State ── */
    let velY=0, onGround=false, jumped=false
    let speed=INIT_SPEED, traveled=0, localScore=0

    const getGroundY = (px, pz) => {
      let highest = -99
      for (const p of platPos) {
        if (Math.abs(px-p.x) < PLATFORM_W/2+0.2 && Math.abs(pz-p.z) < PLATFORM_D/2+0.1) {
          const top = p.y + PLATFORM_H/2
          if (top > highest) highest = top
        }
      }
      return highest
    }

    /* ── Input ── */
    const jump = () => { if (onGround && !jumped) { velY=JUMP_VEL; onGround=false; jumped=true } }
    const handleKey = (e) => { if (!overRef.current && (e.code==='Space'||e.key==='ArrowUp'||e.key==='w')) { e.preventDefault(); jump() } }
    const onTap = () => { if (!overRef.current) jump() }
    window.addEventListener('keydown', handleKey)
    container.addEventListener('click', onTap)

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── UI at 10 Hz ── */
    const uiInterval = setInterval(() => { setScore(Math.floor(localScore)) }, 100)

    /* ── Game loop ── */
    const clock = new THREE.Clock()
    let raf

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      if (overRef.current) { renderer.render(scene, camera); return }

      speed = INIT_SPEED + traveled * 0.003
      const dz = speed * delta
      traveled += dz; localScore = traveled + Math.floor(coinIdx * 10)

      /* Move world */
      platPos.forEach(p => {
        p.z += dz
        if (p.z > 16) {
          p.z -= PLATFORM_D * POOL + 14
          p.x = (Math.random()-.5)*2.5
          decoratePlat(p)
        }
      })
      updatePlatInstances()
      obstacles.forEach(ob => ob.position.z += dz)
      coinData.forEach(d => { d.z += dz })
      stars.position.z += dz * 0.08
      updateCoins()
      while (obstacles.length && obstacles[0].position.z > 10) scene.remove(obstacles.shift())

      /* Gravity */
      velY += GRAVITY * delta
      playerGroup.position.y += velY * delta
      const groundY = getGroundY(playerGroup.position.x, playerGroup.position.z)
      if (playerGroup.position.y <= groundY) { playerGroup.position.y = groundY; velY=0; onGround=true; jumped=false }
      else onGround = false

      /* Fall death */
      if (playerGroup.position.y < -10) {
        overRef.current = true
        setBest(prev => Math.max(prev, Math.floor(localScore)))
        setScore(Math.floor(localScore))
        setGameOver(true)
        return
      }

      /* Obstacles */
      for (const ob of obstacles) {
        if (Math.abs(playerGroup.position.x-ob.position.x)<0.65 && Math.abs(playerGroup.position.z-ob.position.z)<0.65 && Math.abs(playerGroup.position.y-ob.position.y)<1.1) {
          overRef.current = true
          setBest(prev => Math.max(prev, Math.floor(localScore)))
          setScore(Math.floor(localScore))
          setGameOver(true)
          return
        }
      }

      /* Coins */
      coinData.forEach(d => {
        if (!d.hit && Math.hypot(playerGroup.position.x-d.x, playerGroup.position.y-d.y, playerGroup.position.z-d.z) < 0.6) {
          d.hit = true; d.y = -99; localScore += 10
        }
      })

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerGroup.position.x*0.35, 0.08)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerGroup.position.y+4, 0.1)
      camera.lookAt(playerGroup.position.x, playerGroup.position.y+1, -5)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(uiInterval)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('click', onTap)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [sceneKey])

  return (
    <main className="endless-runner">
      <div className="enr-header">
        <div>
          <p className="enr-eyebrow">3D GAMES / 06</p>
          <h1>Endless Runner</h1>
          <p>Jump across platforms in space. Don&apos;t fall.</p>
        </div>
        <div className="enr-stats">
          <span>🚀 Score <strong>{score}</strong></span>
          <span>🏆 Best  <strong>{best}</strong></span>
        </div>
      </div>

      <div className="enr-scene" ref={mountRef} aria-label="Space endless runner">
        {!started && (
          <div className="enr-overlay">
            <span>🚀</span>
            <strong>ENDLESS RUNNER</strong>
            <p>Space / W / ↑ to jump · Dodge pink blocks · Collect coins</p>
            <button type="button" onClick={launch}>Launch!</button>
          </div>
        )}
        {gameOver && (
          <div className="enr-overlay enr-dead">
            <span>💀</span>
            <strong>GAME OVER</strong>
            <p>Score: {score} · Best: {best}</p>
            <button type="button" onClick={launch}>Try Again</button>
          </div>
        )}
      </div>

      <div className="enr-footer">
        <span>Space / W / ↑ to jump · Click to jump · Collect yellow coins (+10)</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}
