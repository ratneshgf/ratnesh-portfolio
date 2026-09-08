import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProjectScreenshot from './ProjectScreenshot'
import ProjectDossier from './ProjectDossier'
import './ProjectWallet.css'

export default function ProjectWallet({ projects }) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [selectedProject, setSelectedProject] = useState(null)
  const [hovered, setHovered] = useState(null)
  const cards = useRef([])
  const gesture = useRef(null)
  const suppressClick = useRef(false)
  const reduced = useReducedMotion()
  const cycle = (step) => setActiveProjectIndex((index) => (index + step + projects.length) % projects.length)
  const close = useCallback(() => setSelectedProject(null), [])
  const restoreFocus = () => requestAnimationFrame(() => cards.current[activeProjectIndex]?.focus({ preventScroll: true }))

  return <LayoutGroup id="project-wallet">
    <div className="project-wallet" inert={selectedProject ? true : undefined} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        cycle(event.key === 'ArrowLeft' ? -1 : 1)
      }
    }}>
      <div className="wallet-stack" aria-label="Project wallet">
        {projects.map((project, index) => {
          const depth = (index - activeProjectIndex + projects.length) % projects.length
          const active = depth === 0
          return <motion.div key={project.number} className={`wallet-layer ${active ? 'is-front' : 'is-rear'}`}
            style={{ zIndex: projects.length - depth, '--depth': depth }}
            initial={false} animate={{ y: -depth * 70 - (hovered === index && !active && !reduced ? 10 : 0), x: depth * 7, scale: 1 - depth * .025, rotate: reduced ? 0 : depth * .6 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 28 }}>
            <motion.button type="button" ref={(node) => { cards.current[index] = node }}
              layoutId={`project-${project.number}`} className="wallet-card" style={{ borderRadius: 14 }}
              aria-label={`${active ? 'Open details for' : 'Select'} ${project.title}`} aria-haspopup={active ? 'dialog' : undefined}
              onPointerEnter={() => setHovered(index)} onPointerLeave={() => setHovered(null)}
              onPointerMove={(event) => {
                if (event.pointerType === 'touch') return
                const card = event.currentTarget
                const rect = card.getBoundingClientRect()
                card.style.setProperty('--wallet-light-x', `${Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))}%`)
                card.style.setProperty('--wallet-light-y', `${Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))}%`)
              }}
              onPointerDown={(event) => { suppressClick.current = false; gesture.current = active ? { x: event.clientX, y: event.clientY } : null }}
              onPointerUp={(event) => {
                const start = gesture.current
                gesture.current = null
                if (!start) return
                const dx = event.clientX - start.x
                if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(event.clientY - start.y) * 1.5) {
                  suppressClick.current = true
                  cycle(dx < 0 ? 1 : -1)
                }
              }} onPointerCancel={() => { gesture.current = null }}
              onClick={() => {
                if (suppressClick.current) { suppressClick.current = false; return }
                if (active) setSelectedProject(project)
                else setActiveProjectIndex(index)
              }}>
              <span className="wallet-card-label"><span>{project.number}</span><strong>{project.title}</strong><small>{project.type}</small></span>
              <span className={`project-art ${project.color}`}><ProjectScreenshot project={project} />{project.featured && <span className="featured-label">Featured work</span>}</span>
              <span className="wallet-content" aria-hidden={!active}>
                <span className="eyebrow">{project.type}</span><strong className="wallet-title">{project.title}</strong>
                <span className="wallet-description">{project.description}</span>
                <span className="tech-tags">{project.tech.map((tag) => <span key={tag}># {tag}</span>)}</span>
                <span className="wallet-open">Open project dossier <ArrowRight size={15} /></span>
              </span>
            </motion.button>
          </motion.div>
        })}
      </div>
      <div className="wallet-controls"><span aria-live="polite" aria-atomic="true">{String(activeProjectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}<span className="wallet-current"> — {projects[activeProjectIndex].title}</span></span><div><button type="button" onClick={() => cycle(-1)} aria-label="Previous project"><ArrowLeft size={14} /> PREV</button><button type="button" onClick={() => cycle(1)} aria-label="Next project">NEXT <ArrowRight size={14} /></button></div></div>
      <p className="wallet-hint">Select a card to bring it forward. Open the front card to explore.</p>
    </div>
    {createPortal(<AnimatePresence onExitComplete={restoreFocus}>{selectedProject && <ProjectDossier project={selectedProject} onClose={close} reduced={reduced} />}</AnimatePresence>, document.body)}
  </LayoutGroup>
}
