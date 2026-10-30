import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { createGameSession } from '../../utils/gameSession'
import './MazeRunner.css'

const LEVELS = [
  {
    maze: [
      '11111111111', '10000000001', '10111111101', '10100000101',
      '10101110101', '10101000101', '10101111101', '10100000001',
      '10111111101', '10000000001', '11111111111',
    ],
    collectibles: [{ x: 3, z: 1, icon: '🌸' }, { x: 7, z: 5, icon: '⭐' }],
    exit: { x: 9, z: 9 },
  },
  {
    maze: [
      '11111111111', '10001000001', '10101011101', '10100010101',
      '10111010101', '10001010001', '11101011101', '10000000101',
      '10111110101', '10000000001', '11111111111',
    ],
    collectibles: [{ x: 3, z: 1, icon: '💫' }, { x: 5, z: 5, icon: '🌙' }, { x: 9, z: 7, icon: '🌸' }],
    exit: { x: 9, z: 9 },
  },
  {
    maze: [
      '11111111111', '10000010001', '10111010101', '10100010101',
      '10101110101', '10100000101', '10111111101', '10000000001',
      '10111111101', '10000000001', '11111111111',
    ],
    collectibles: [{ x: 5, z: 1, icon: '⭐' }, { x: 3, z: 5, icon: '💖' }, { x: 7, z: 7, icon: '💫' }],
    exit: { x: 9, z: 9 },
  },
]

const CELL_SIZE = 2
const PLAYER_START = { x: 1, z: 1 }

function MazeRunner() {
  const sceneRef = useRef(null)
  const historySession = useRef(null)
  if (!historySession.current) {
    historySession.current = createGameSession({ id: 'maze-runner', title: 'Maze Runner', icon: '🧭' })
  }
  const [level, setLevel] = useState(0)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [moves, setMoves] = useState(0)
  const [collected, setCollected] = useState(0)

  useEffect(() => () => historySession.current.finish(), [])

  useEffect(() => {
    if (gameComplete) {
      historySession.current.finish({ result: 'Completed', level: LEVELS.length, details: `${moves} moves` })
    }
  }, [gameComplete, moves])

  const currentLevel = LEVELS[level]

  useEffect(() => {
    const container = sceneRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#08111f')
    scene.fog = new THREE.Fog('#08111f', 16, 34)

    const camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 13, 12)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight('#bde7ff', '#07101c', 2.2))
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.5)
    keyLight.position.set(-6, 14, 8)
    keyLight.castShadow = true
    scene.add(keyLight)

    const { maze, exit: exitCell } = currentLevel
    const offset = (maze.length - 1) * CELL_SIZE / 2
    const toWorld = (x, z) => new THREE.Vector3(x * CELL_SIZE - offset, 0, z * CELL_SIZE - offset)
    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#20d6c7', roughness: 0.35, metalness: 0.2 })
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#101e31', roughness: 0.8 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(maze[0].length * CELL_SIZE, maze.length * CELL_SIZE), floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    maze.forEach((row, z) => {
      row.split('').forEach((cell, x) => {
        if (cell !== '1') return
        const position = toWorld(x, z)
        const wall = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.92, 1.8, CELL_SIZE * 0.92), wallMaterial)
        wall.position.set(position.x, 0.9, position.z)
        wall.castShadow = true
        wall.receiveShadow = true
        scene.add(wall)
      })
    })

    const iconSprites = currentLevel.collectibles.map(({ x, z, icon }) => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const context = canvas.getContext('2d')
      context.fillStyle = 'rgba(255, 79, 145, 0.22)'
      context.beginPath()
      context.arc(64, 64, 52, 0, Math.PI * 2)
      context.fill()
      context.font = '72px serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(icon, 64, 66)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }))
      const position = toWorld(x, z)
      sprite.position.set(position.x, 1.35, position.z)
      sprite.scale.set(1.15, 1.15, 1)
      scene.add(sprite)
      return { sprite, x, z, collected: false }
    })

    const exitPosition = toWorld(exitCell.x, exitCell.z)
    const exit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: '#ffcf4a', emissive: '#d67b00', emissiveIntensity: 2 }),
    )
    exit.position.set(exitPosition.x, 0.08, exitPosition.z)
    scene.add(exit)

    const player = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshStandardMaterial({ color: '#ff4f91', emissive: '#8d164d', emissiveIntensity: 0.7 }),
    )
    player.castShadow = true
    scene.add(player)

    const playerCell = { ...PLAYER_START }
    const canMoveTo = (x, z) => maze[z]?.[x] === '0'
    const updatePlayer = () => {
      const position = toWorld(playerCell.x, playerCell.z)
      player.position.set(position.x, 0.55, position.z)
      camera.position.set(position.x + 8, 11, position.z + 9)
      camera.lookAt(position.x, 0, position.z)
    }
    updatePlayer()

    const handleKeyDown = (event) => {
      const directions = {
        ArrowUp: [0, -1], w: [0, -1],
        ArrowDown: [0, 1], s: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0],
      }
      const direction = directions[event.key]
      if (!direction || levelComplete || gameComplete) return
      event.preventDefault()
      const nextX = playerCell.x + direction[0]
      const nextZ = playerCell.z + direction[1]
      if (!canMoveTo(nextX, nextZ)) return
      historySession.current.start()
      historySession.current.update({ level: level + 1 })
      playerCell.x = nextX
      playerCell.z = nextZ
      updatePlayer()
      setMoves((current) => current + 1)
      const foundIcon = iconSprites.find((item) => item.x === nextX && item.z === nextZ && !item.collected)
      if (foundIcon) {
        foundIcon.collected = true
        foundIcon.sprite.visible = false
        setCollected((current) => current + 1)
      }
      if (nextX === exitCell.x && nextZ === exitCell.z) {
        if (level === LEVELS.length - 1) setGameComplete(true)
        else setLevelComplete(true)
      }
    }

    const handleResize = () => {
      if (!container.clientWidth || !container.clientHeight) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    let animationFrame
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      player.rotation.y += 0.01
      exit.rotation.y += 0.02
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      iconSprites.forEach(({ sprite }) => sprite.material.map?.dispose())
      container.removeChild(renderer.domElement)
    }
  }, [currentLevel, gameComplete, level, levelComplete])

  const nextLevel = () => {
    setLevel((current) => current + 1)
    setLevelComplete(false)
    setCollected(0)
  }

  const restart = () => {
    setLevel(0)
    setMoves(0)
    setCollected(0)
    setLevelComplete(false)
    setGameComplete(false)
  }

  return (
    <main className="maze-runner">
      <div className="maze-runner__header">
        <div>
          <p className="maze-runner__eyebrow">3D GAMES / 01</p>
          <h1>Maze Runner</h1>
          <p>Collect the anime icons, then reach the gold exit.</p>
        </div>
        <div className="maze-runner__stats">
          <span>Level <strong>{level + 1} / {LEVELS.length}</strong></span>
          <span>Icons <strong>{collected} / {currentLevel.collectibles.length}</strong></span>
          <span>Moves <strong>{moves}</strong></span>
          <span>{gameComplete ? 'Complete' : levelComplete ? 'Next level' : 'Find the exit'}</span>
        </div>
      </div>

      <div className="maze-runner__scene" ref={sceneRef} aria-label="Playable 3D maze">
        {(levelComplete || gameComplete) && (
          <div className="maze-runner__win">
            <span>{gameComplete ? 'ALL LEVELS CLEARED' : `LEVEL ${level + 1} CLEARED`}</span>
            <strong>{collected} icons collected</strong>
            <button type="button" onClick={gameComplete ? restart : nextLevel}>
              {gameComplete ? 'Play again' : 'Next level'}
            </button>
          </div>
        )}
      </div>

      <div className="maze-runner__footer">
        <span>Move with WASD or arrow keys · Collect every icon</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}

export default MazeRunner
