import { sceneColors } from '../../theme.js'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePerformanceMode } from '../../hooks/usePerformanceMode.jsx'

const nodes = [
  [-6.2, 2.8, -2.5], [-4.8, 1.5, -1.2], [-5.8, -1.9, -1.8], [-3.9, -3.4, -2.8],
  [4.9, 3.1, -2.4], [6.2, 1.3, -1], [5.3, -2.5, -2.2], [3.8, -3.6, -3],
  [-7.1, .2, -4], [7.2, -.3, -4], [-2.8, 4.1, -4], [2.8, 4, -4],
]

const links = [[0, 1], [1, 2], [2, 3], [1, 8], [4, 5], [5, 6], [6, 7], [5, 9], [10, 11], [10, 1], [11, 4], [2, 6]]
const packets = [{ link: 0, phase: 0.1 }, { link: 4, phase: 0.55 }, { link: 8, phase: 0.25 }]

function CameraRig({ motion, scroll }) {
  const { camera } = useThree()
  useFrame(() => {
    const targetX = motion.current.x * 0.16
    const targetY = motion.current.y * 0.1 + scroll.current * 0.00008
    // R3F owns this camera object; mutate it in the frame loop instead of React state.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.025) // oxlint-disable-line react/immutability
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.025) // oxlint-disable-line react/immutability
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8 + scroll.current * 0.00025, 0.02) // oxlint-disable-line react/immutability
    camera.lookAt(0, 0, -2)
  })
  return null
}

function NetworkField({ reduced, mobile, networkNodes }) {
  const groupRef = useRef(null)
  const visibleNodes = nodes.slice(0, networkNodes)
  const activeLinks = useMemo(() => links.filter(([from, to]) => from < networkNodes && to < networkNodes), [networkNodes])
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(activeLinks.flatMap(([from, to]) => [...nodes[from], ...nodes[to]]))
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [activeLinks])
  const nodeGeometry = useMemo(() => new THREE.SphereGeometry(mobile ? 0.045 : 0.065, 8, 8), [mobile])
  const nodeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: sceneColors['text-secondary'], transparent: true, opacity: 0.78 }), [])
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: sceneColors['red-dark'], transparent: true, opacity: mobile ? 0.19 : 0.28 }), [mobile])

  useFrame((state) => {
    if (!groupRef.current || reduced) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.06) * 0.018
    groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.05) * 0.012
  })

  return <group ref={groupRef} position={[0, 0, -1]}>
    <lineSegments geometry={lineGeometry} material={lineMaterial} />
    {visibleNodes.map((position, index) => <mesh key={index} geometry={nodeGeometry} material={nodeMaterial} position={position} />)}
    {!reduced && !mobile && packets.map((packet, index) => <DataPacket key={index} link={links[packet.link]} phase={packet.phase} />)}
  </group>
}

function DataPacket({ link, phase }) {
  const ref = useRef(null)
  const from = nodes[link[0]]
  const to = nodes[link[1]]
  useFrame(({ clock }) => {
    if (!ref.current) return
    const progress = (clock.elapsedTime * 0.055 + phase) % 1
    ref.current.position.lerpVectors(new THREE.Vector3(...from), new THREE.Vector3(...to), progress)
  })
  return <mesh ref={ref} position={from}>
    <sphereGeometry args={[0.1, 6, 6]} />
    <meshBasicMaterial color={sceneColors['green-dark']} transparent opacity={0.82} />
  </mesh>
}

function WireframeObjects({ reduced, mobile }) {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  useFrame((_, delta) => {
    if (reduced) return
    if (leftRef.current) leftRef.current.rotation.y += delta * 0.035
    if (rightRef.current) rightRef.current.rotation.x += delta * 0.028
  })
  return <>
    <mesh ref={leftRef} position={[-6.8, 2.3, -4.8]} scale={mobile ? 0.7 : 1}>
      <icosahedronGeometry args={[1.2, 2]} />
      <meshBasicMaterial color={sceneColors['red-deep']} wireframe transparent opacity={0.18} />
    </mesh>
    {!mobile && <mesh ref={rightRef} position={[6.4, -2.3, -5.5]} scale={1.15}>
      <sphereGeometry args={[1.35, 16, 10]} />
      <meshBasicMaterial color={sceneColors['red-dark']} wireframe transparent opacity={0.14} />
    </mesh>}
  </>
}

function ParticleField({ reduced, particleCount, mobile }) {
  const ref = useRef(null)
  const count = particleCount
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1
      values[index * 3] = side * (3.8 + ((index * 37) % 45) / 10)
      values[index * 3 + 1] = (((index * 29) % 80) / 10) - 4
      values[index * 3 + 2] = -2 - ((index * 17) % 70) / 10
    }
    return values
  }, [count])
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = clock.elapsedTime * 0.006
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.04) * 0.015
  })
  return <points ref={ref}>
    <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /></bufferGeometry>
    <pointsMaterial color={sceneColors['text-secondary']} size={mobile ? 0.028 : 0.04} transparent opacity={0.32} sizeAttenuation />
  </points>
}

function Scene({ reduced, mobile, motion, scroll, particleCount, networkNodes }) {
  return <>
    <CameraRig motion={motion} scroll={scroll} />
    <ambientLight intensity={0.12} />
    <ParticleField reduced={reduced} mobile={mobile} particleCount={particleCount} />
    <NetworkField reduced={reduced} mobile={mobile} networkNodes={networkNodes} />
    <WireframeObjects reduced={reduced} mobile={mobile} />
  </>
}

const symbols = ['</>', '{}', 'API', 'DB', 'JSON', 'HTTP', '01', 'GET', '200']

function FloatingSymbols({ reduced, mobile }) {
  return <div className={`universe-symbols ${reduced ? 'is-static' : ''}`} aria-hidden="true">{symbols.slice(0, mobile ? 5 : symbols.length).map((symbol, index) => <span key={symbol} style={{ '--symbol-index': index }}>{symbol}</span>)}</div>
}

export default function TechUniverse() {
  const motion = useRef({ x: 0, y: 0 })
  const scroll = useRef(0)
  const { reducedMotion, isMobile, simplified, continuousMotion, particleCount, networkNodes } = usePerformanceMode()

  useEffect(() => {
    if (!continuousMotion) return undefined
    const onMove = (event) => {
      motion.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      motion.current.y = (event.clientY / window.innerHeight - 0.5) * -2
    }
    const onScroll = () => { scroll.current = window.scrollY }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll) }
  }, [continuousMotion])

  return <div className="tech-universe" aria-hidden="true">
    <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={simplified ? [1, 1] : [1, 1.35]} frameloop={reducedMotion || !continuousMotion ? 'demand' : 'always'} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
      <Scene reduced={reducedMotion || !continuousMotion} mobile={isMobile} motion={motion} scroll={scroll} particleCount={particleCount} networkNodes={networkNodes} />
    </Canvas>
    <FloatingSymbols reduced={reducedMotion || !continuousMotion} mobile={isMobile} />
  </div>
}

