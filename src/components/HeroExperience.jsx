import { sceneColors } from '../theme.js'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ChevronDown, Command, Mail } from 'lucide-react'
import * as THREE from 'three'
import { usePerformanceMode } from '../hooks/usePerformanceMode.jsx'
import { portfolioData } from '../data/portfolioData'
import RotatingRole from './ui/RotatingRole'

const objects = [
  { type: 'torus', position: [-3.4, 2.2, -1.2], color: sceneColors['red-deep'], scale: 1.3, speed: .18, phase: .2 },
  { type: 'sphere', position: [-1.4, .35, -2.6], color: sceneColors['red-dark'], scale: 1.45, speed: .1, phase: 1.1 },
  { type: 'icosa', position: [1.2, 2.3, -.5], color: sceneColors['text-muted'], scale: .9, speed: .22, phase: 2.2 },
  { type: 'octa', position: [4.5, 2.55, -2.2], color: sceneColors['red-deep'], scale: .72, speed: .14, phase: .8 },
  { type: 'dodeca', position: [3.6, -.8, -1.2], color: sceneColors['red-dark'], scale: .78, speed: .2, phase: 1.7 },
  { type: 'icosa', position: [1.1, -2.4, -3.1], color: sceneColors['text-secondary'], scale: .55, speed: .12, phase: 2.8 },
]

function WireObject({ object, motion, reduced }) {
  const ref = useRef(null)
  const base = useMemo(() => new THREE.Vector3(...object.position), [object.position])
  useFrame(({ clock }) => {
    if (!ref.current || reduced || document.hidden) return
    const time = clock.elapsedTime * object.speed + object.phase
    ref.current.rotation.x += .0008 + object.speed * .002
    ref.current.rotation.y += .001 + object.speed * .003
    ref.current.rotation.z += .0005
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, base.x + motion.current.x * (object.position[2] < -2 ? .05 : .11), .025)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, base.y + Math.sin(time) * .12 + motion.current.y * (object.position[2] < -2 ? .04 : .08), .025)
  })
  const geometry = object.type === 'torus' ? <torusGeometry args={[1.05, .26, 8, 28]} /> : object.type === 'sphere' ? <sphereGeometry args={[1, 14, 10]} /> : object.type === 'octa' ? <octahedronGeometry args={[1, 1]} /> : object.type === 'dodeca' ? <dodecahedronGeometry args={[1, 1]} /> : <icosahedronGeometry args={[1, 1]} />
  return <mesh ref={ref} position={object.position} scale={object.scale} rotation={[.2, .1, .2]}>{geometry}<meshBasicMaterial color={object.color} wireframe transparent opacity={reduced ? .18 : .34} /></mesh>
}

function HeroParticles({ reduced, mobile }) {
  const count = mobile ? 34 : 76
  const positions = useMemo(() => { const values = new Float32Array(count * 3); for (let index = 0; index < count; index += 1) { values[index * 3] = ((index * 37) % 150) / 10 - 7.5; values[index * 3 + 1] = ((index * 61) % 80) / 10 - 4; values[index * 3 + 2] = -1 - ((index * 23) % 55) / 10 } return values }, [count])
  const ref = useRef(null)
  useFrame(({ clock }) => { if (!ref.current || reduced || document.hidden) return; ref.current.rotation.y = clock.elapsedTime * .004; ref.current.rotation.x = Math.sin(clock.elapsedTime * .08) * .015 })
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry><pointsMaterial color={sceneColors['text-secondary']} size={mobile ? .025 : .035} transparent opacity={.42} sizeAttenuation /></points>
}

function HeroScene() {
  const { reducedMotion, isMobile, continuousMotion } = usePerformanceMode()
  const motion = useRef({ x: 0, y: 0 })
  useEffect(() => { if (reducedMotion) return undefined; const onMove = (event) => { motion.current.x = (event.clientX / window.innerWidth - .5) * 2; motion.current.y = (event.clientY / window.innerHeight - .5) * -2 }; window.addEventListener('pointermove', onMove, { passive: true }); return () => window.removeEventListener('pointermove', onMove) }, [reducedMotion])
  const visibleObjects = isMobile ? objects.slice(0, 3) : objects
  return <Canvas className="hero-wireframe-canvas" camera={{ position: [0, 0, 7], fov: 48 }} dpr={isMobile ? [1, 1] : [1, 1.3]} frameloop={reducedMotion || !continuousMotion ? 'demand' : 'always'} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}><ambientLight intensity={.08} /><HeroParticles reduced={reducedMotion || !continuousMotion} mobile={isMobile} />{visibleObjects.map((object, index) => <WireObject key={index} object={object} motion={motion} reduced={reducedMotion || !continuousMotion} />)}</Canvas>
}

export default function HeroExperience({ onProjects, onContact }) {
  return <section className="hero-experience" aria-label="Ratnesh Singh Chauhan introduction">
    <div className="hero-engineering-grid" />
    <div className="hero-atmosphere" />
    <HeroScene />
    <div className="hero-experience-content">
      <div className="hero-welcome"><Command size={14} /> WELCOME TO MY WORLD</div>
      <h1><span>RATNESH</span><strong>SINGH CHAUHAN</strong></h1>
      <RotatingRole roles={portfolioData.personal.roles} />
      <p className="hero-statement">Engineering scalable full-stack applications and modern digital experiences with clean, reliable code.</p>
      <div className="hero-experience-actions"><button type="button" className="hero-enter" onClick={onProjects}>&gt;_ ENTER THE LAB <ChevronDown size={16} /></button><button type="button" className="hero-contact" onClick={onContact}><Mail size={15} /> INITIATE CONTACT</button></div>
    </div>
    <div className="hero-coordinate hero-coordinate-top">SYS_01 / 2026</div><div className="hero-coordinate hero-coordinate-bottom">BUILD_01 / MERN + PYTHON</div>
  </section>
}
