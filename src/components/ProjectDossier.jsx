import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import ProjectScreenshot from './ProjectScreenshot'
import ArchitectureDiagram from './ArchitectureDiagram'

export default function ProjectCaseStudy({ project, onClose, reduced }) {
  const panel = useRef(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const siblings = [...document.body.children].filter((node) => node.id === 'root')
    const previousInert = siblings.map((node) => node.inert)
    siblings.forEach((node) => { node.inert = true })
    panel.current?.querySelector('button')?.focus({ preventScroll: true })
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = [...panel.current.querySelectorAll('button, a[href], [tabindex="0"]')]
        const first = focusable[0], last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; siblings.forEach((node, index) => { node.inert = previousInert[index] }); window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  const study = project.caseStudy
  return <motion.div className="case-study-backdrop" transition={{ duration: reduced ? 0 : .25 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <motion.section ref={panel} layoutId={`project-${project.number}`} transition={{ duration: reduced ? 0 : .5 }} style={{ borderRadius: 14 }} className="case-study wallet-dossier" role="dialog" aria-modal="true" aria-labelledby="case-study-title">
      <div className="case-study-topline"><span>PROJECT / {project.number}</span><button type="button" onClick={onClose} aria-label="Close project case study"><X size={17} /></button></div>
      <div className="case-study-heading"><div><span className="eyebrow">{project.type}</span><h2 id="case-study-title">{project.title}</h2></div><span className="case-study-route">{project.preview.route}</span></div>
      <div className={`project-art ${project.color}`}><ProjectScreenshot project={project} /></div><div className="tech-tags">{project.tech.map((tag) => <span key={tag}># {tag}</span>)}</div><p className="case-study-description">{project.description}</p>
      <div className="case-study-grid"><div className="case-study-column"><div className="case-block"><span className="case-label">Problem</span><p>{study.problem}</p></div><div className="case-block"><span className="case-label">Solution</span><p>{study.solution}</p></div><div className="case-block"><span className="case-label">Challenges</span><ul>{study.challenges.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="case-study-column"><div className="case-block"><span className="case-label">Architecture</span><dl>{Object.entries(study.architecture).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><ArchitectureDiagram nodes={study.diagram} /></div><div className="case-block"><span className="case-label">Key features</span><ul>{study.features.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="case-block"><span className="case-label">What I learned</span><p>{study.learned}</p></div></div></div>
      <div className="case-study-footer"><span className="case-label">Links</span><div>{study.links.github && <a className="case-link" href={study.links.github} target="_blank" rel="noopener noreferrer">SOURCE CODE <ExternalLink size={13} /></a>}{study.links.liveDemo && <a className="case-link" href={study.links.liveDemo} target="_blank" rel="noopener noreferrer">LIVE DEMO <ExternalLink size={13} /></a>}</div></div>
    </motion.section>
  </motion.div>
}

