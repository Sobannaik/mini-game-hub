import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import './EscapeRoom.css'

const STEPS = [
  { id: 'note', label: 'Find the note on the desk',          hint: 'Click on the glowing desk' },
  { id: 'code', label: 'Read the code (1-9-3-7)',            hint: 'The note reveals the code' },
  { id: 'safe', label: 'Open the wall safe with the code',   hint: 'Click the safe on the right wall' },
  { id: 'key',  label: 'Take the key from the safe',         hint: 'Click inside the safe' },
  { id: 'door', label: 'Unlock the door and escape!',        hint: 'Click the door to escape' },
]

export default function EscapeRoom() {
  const mountRef   = useRef(null)
  const stepRef    = useRef(0)
  const [step,     setStep]    = useState(0)
  const [message,  setMessage] = useState('Click the glowing object to start.')
  const [escaped,  setEscaped] = useState(false)

  const restart = useCallback(() => {
    stepRef.current = 0
    setStep(0)
    setMessage('Click the glowing object to start.')
    setEscaped(false)
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    /* ── Renderer — performance settings ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = false
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color('#0e0a05')
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 30)
    camera.position.set(0, 1.7, 5)
    camera.lookAt(0, 1.2, 0)

    /* ── Lights — just 2 ── */
    scene.add(new THREE.AmbientLight('#3d2200', 1.4))
    const ceiling = new THREE.PointLight('#ffcc88', 1.5, 16)
    ceiling.position.set(0, 3.8, 0)
    scene.add(ceiling)
    const candle = new THREE.PointLight('#ff7700', 2.5, 5)
    candle.position.set(-1.6, 0.8, 1.2)
    scene.add(candle)

    /* ── Room ── */
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(9, 5, 8),
      new THREE.MeshLambertMaterial({ color: '#2a1e10', side: THREE.BackSide })
    )
    room.position.y = 2
    scene.add(room)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 8),
      new THREE.MeshLambertMaterial({ color: '#1a1008' })
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    /* ── Helper ── */
    const box = (w, h, d, color, x, y, z, name = '', emissive = null) => {
      const mat = new THREE.MeshLambertMaterial({ color })
      if (emissive) { mat.emissive = new THREE.Color(emissive); mat.emissiveIntensity = 0.5 }
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      mesh.position.set(x, y, z)
      if (name) mesh.name = name
      scene.add(mesh)
      return mesh
    }

    /* ── Furniture ── */
    box(2.5, 0.08, 1.2, '#3d2510', 0, 0.9, 2)
    ;[[-1.1,2.5],[ 1.1,2.5],[-1.1,1.5],[ 1.1,1.5]].forEach(([x,pz]) => box(0.12,0.9,0.12,'#3d2510',x,0.45,pz))
    const note    = box(0.45,0.02,0.35,'#f5e8c0', 0.3, 0.96, 2, 'note', '#332200')
    box(0.1,0.3,0.1,'#faebd7',-1.6,0.3,1.2)

    const safeBody   = box(0.7,0.7,0.12,'#3a3a3a', 3.8,1.6, 0, 'safe')
    const safeDoor   = box(0.65,0.65,0.06,'#555',  3.78,1.6,0.07,'safe')
    const safeHandle = box(0.08,0.08,0.08,'#ccaa00',3.65,1.6,0.14,'safe')
    const keyMesh    = box(0.18,0.06,0.06,'#ffcc00',3.78,1.6,0.08,'key')
    keyMesh.visible  = false

    const door     = box(1.1,2.2,0.1,'#5c3d1e',-4.45,1.1,0,'door')
    const doorKnob = box(0.1,0.1,0.15,'#ccaa00',-3.98,1.1,0,'door')

    /* ── Bookshelf ── */
    box(1.8,2.2,0.35,'#2b1c0a',2.2,1.1,-3.75)
    for (let i=0;i<6;i++) box(0.22,0.34,0.22,`hsl(${20+i*15},60%,${20+i*4}%)`,1.55+i*0.26,0.5+(i%2)*0.4,-3.64)

    /* ── Glow helpers ── */
    const glowNote = new THREE.PointLight('#ffee88', 1.8, 1.2)
    glowNote.position.set(0.3, 1.2, 2)
    scene.add(glowNote)
    const glowSafe = new THREE.PointLight('#00aaff', 0, 2)
    glowSafe.position.set(3.4, 1.6, 0)
    scene.add(glowSafe)
    const glowDoor = new THREE.PointLight('#00ff88', 0, 2.5)
    glowDoor.position.set(-3.8, 1.5, 0)
    scene.add(glowDoor)

    /* ── Raycaster ── */
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const interactable = [note, safeBody, safeDoor, safeHandle, keyMesh, door, doorKnob]

    const onClick = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactable, false)
      if (!hits.length) return
      const name = hits[0].object.name
      const s = stepRef.current

      if (name === 'note' && s === 0) {
        stepRef.current = 2; setStep(2)
        setMessage('📄 Note says: "The code is 1-9-3-7"')
        glowNote.intensity = 0; glowSafe.intensity = 2
      } else if (name === 'safe' && s === 2) {
        stepRef.current = 3; setStep(3)
        keyMesh.visible = true
        safeDoor.position.x = 3.4
        setMessage('✅ Safe opened! A key is inside.')
        glowSafe.intensity = 0
      } else if (name === 'key' && s === 3) {
        stepRef.current = 4; setStep(4)
        keyMesh.visible = false
        setMessage('🗝️ Key obtained! Click the door.')
        glowDoor.intensity = 2.5
      } else if (name === 'door' && s === 4) {
        setMessage('🚪 You escaped!')
        setEscaped(true)
      } else {
        const hints = ['Click the glowing desk.','Read the note.','Click the wall safe.','Take the key.','Click the door.']
        setMessage('💡 ' + (hints[s] || 'Already done!'))
      }
    }
    container.addEventListener('click', onClick)

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
      const t = clock.getElapsedTime()
      candle.intensity  = 2.2 + Math.sin(t * 9) * 0.35
      ceiling.intensity = 1.1 + Math.sin(t * 0.6) * 0.1
      // Pulse note glow when step=0
      if (stepRef.current === 0) glowNote.intensity = 1.5 + Math.sin(t * 3) * 0.4
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [escaped]) // only re-mount on restart (escaped→false)

  const currentHint = STEPS[Math.min(step, STEPS.length - 1)]

  return (
    <main className="escape-room">
      <div className="er-header">
        <div>
          <p className="er-eyebrow">3D GAMES / 03</p>
          <h1>Escape Room</h1>
          <p>Solve the puzzle and escape.</p>
        </div>
        <div className="er-steps">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`er-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <span>{i < step ? '✓' : i + 1}</span> {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="er-scene" ref={mountRef} aria-label="3D escape room">
        <div className="er-message">{message}</div>
        {escaped && (
          <div className="er-overlay">
            <span>🚪</span>
            <strong>YOU ESCAPED!</strong>
            <p>Brilliant detective work!</p>
            <button type="button" onClick={restart}>Play Again</button>
          </div>
        )}
      </div>

      <div className="er-footer">
        <span>Click glowing objects · {currentHint?.hint}</span>
        <Link to="/games">← Back to Games</Link>
      </div>
    </main>
  )
}
