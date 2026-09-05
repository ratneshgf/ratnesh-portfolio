import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, Code2, FileText, Mail, Network, X } from 'lucide-react'

const Github = Code2
const Linkedin = Network

export default function RecruiterQuickView({ portfolio }) {
  const [isOpen, setIsOpen] = useState(false)
  const { personal, social } = portfolio
  const close = () => setIsOpen(false)
  const navigate = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); close() }

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape' && isOpen) close() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return <>
    <button className="quick-view-trigger" type="button" onClick={() => setIsOpen(true)}><BriefcaseBusiness size={13} /> Quick view</button>
    <AnimatePresence>{isOpen && <motion.div className="quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <motion.aside className="quick-view-panel" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" initial={{ opacity: 0, y: -12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }}>
        <div className="quick-view-top"><span>RECRUITER / QUICK PROFILE</span><button type="button" onClick={close} aria-label="Close quick profile"><X size={16} /></button></div>
        <div className="quick-view-identity"><div className="quick-view-mark">R</div><div><h2 id="quick-view-title">{personal.name}</h2><p>{personal.role}</p></div></div>
        <div className="quick-view-block"><span className="quick-label">Core stack</span><div className="quick-tags">{['MERN', 'Python', 'React', 'Node.js', 'MongoDB', 'PostgreSQL'].map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="quick-view-block"><span className="quick-label">Focus</span><ul>{['Full Stack Development', 'Backend Systems', 'APIs', 'Problem Solving'].map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className="quick-view-actions"><button type="button" onClick={() => navigate('projects')}><Code2 size={14} /> View projects</button><button type="button" onClick={() => navigate('contact')}><Mail size={14} /> Contact</button><a href={social.github} target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ArrowUpRight size={12} /></a><a href={social.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14} /> LinkedIn <ArrowUpRight size={12} /></a><a className="quick-resume" href={personal.resume} target="_blank" rel="noreferrer"><FileText size={14} /> View resume <small>PDF</small></a></div>
        <div className="quick-view-footer"><span>available for opportunities</span><span>{personal.location}</span></div>
      </motion.aside>
    </motion.div>}</AnimatePresence>
  </>
}
