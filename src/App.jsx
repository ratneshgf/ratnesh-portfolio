import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight, Check, ChevronDown, Code2, Database, ExternalLink, Globe2, Layers3, Mail, Menu, MousePointer2, Network, Send, Terminal, X } from 'lucide-react'
import { portfolioData } from './data/portfolioData'
import BootIntro from './components/BootIntro'
import CommandPalette from './components/CommandPalette'
import SkillConstellation from './components/SkillConstellation'
import ScrollDepth from './components/ScrollDepth'
import InteractiveTerminal from './components/InteractiveTerminal'
import RecruiterQuickView from './components/RecruiterQuickView'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import ProjectRevealObserver from './components/ProjectRevealObserver'
import { usePerformanceMode } from './hooks/usePerformanceMode.jsx'
import './App.css'

const Github = Code2
const Linkedin = Network
const TechUniverse = lazy(() => import('./components/background/TechUniverse'))
const HeroExperience = lazy(() => import('./components/HeroExperience'))
const navItems = ['home', 'about', 'skills', 'projects', 'experience', 'contact']

const reveal = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }
const skillAccents = { 'React.js': '#61dafb', JavaScript: '#d6c66a', TypeScript: '#6f9ff2', HTML: '#d98568', CSS: '#6ba8df', 'Tailwind CSS': '#63cbd6', 'Node.js': '#7dbb78', 'Express.js': '#a9b5ba', Python: '#8aa9d8', Flask: '#b9d3d0', 'REST APIs': '#68c7c2', 'Socket.io': '#a78be6', MongoDB: '#7ebf88', PostgreSQL: '#7197ca', MySQL: '#7399c7', Redis: '#c17d7d', Git: '#c58b6c', GitHub: '#aa9bc7', Postman: '#d59467', 'VS Code': '#72a8e4' }

function SectionHeading({ eyebrow, title, intro }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{intro && <p>{intro}</p>}</div>
}

function Magnetic({ children, as: Element = 'span', className = '', ...props }) {
  const { enableCursor } = usePerformanceMode()
  const ref = useRef(null)
  const frameRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const enabledRef = useRef(false)
  const update = () => {
    frameRef.current = 0
    if (!ref.current) return
    const { x, y } = pointerRef.current
    ref.current.style.setProperty('--mx', `${x}px`)
    ref.current.style.setProperty('--my', `${y}px`)
    ref.current.style.setProperty('--ix', `${x * 0.55}px`)
    ref.current.style.setProperty('--iy', `${y * 0.55}px`)
  }
  const move = (event) => {
    if (!enabledRef.current || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerRef.current = { x: Math.max(-7, Math.min(7, (event.clientX - (rect.left + rect.width / 2)) / 8)), y: Math.max(-7, Math.min(7, (event.clientY - (rect.top + rect.height / 2)) / 8)) }
    if (!frameRef.current) frameRef.current = requestAnimationFrame(update)
  }
  const reset = () => { pointerRef.current = { x: 0, y: 0 }; if (!frameRef.current) frameRef.current = requestAnimationFrame(update) }
  useEffect(() => {
    enabledRef.current = enableCursor
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [enableCursor])
  return <Element ref={ref} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={reset} {...props}><span className="magnetic-content">{children}</span></Element>
}

function bindMagneticTarget(element, enabled) {
  if (!enabled) return () => {}
  let frame = 0
  const update = (x, y) => { frame = 0; element.style.setProperty('--mx', `${x}px`); element.style.setProperty('--my', `${y}px`) }
  const move = (event) => { const rect = element.getBoundingClientRect(); const x = Math.max(-7, Math.min(7, (event.clientX - (rect.left + rect.width / 2)) / 8)); const y = Math.max(-7, Math.min(7, (event.clientY - (rect.top + rect.height / 2)) / 8)); if (!frame) frame = requestAnimationFrame(() => update(x, y)) }
  const leave = () => { if (!frame) frame = requestAnimationFrame(() => update(0, 0)) }
  element.classList.add('magnetic-target')
  element.addEventListener('pointermove', move)
  element.addEventListener('pointerleave', leave)
  return () => { if (frame) cancelAnimationFrame(frame); element.classList.remove('magnetic-target'); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave) }
}

function bindProjectLighting(card, enabled) {
  if (!enabled) return () => {}
  let frame = 0
  const update = (values) => { frame = 0; Object.entries(values).forEach(([key, value]) => card.style.setProperty(key, value)) }
  const move = (event) => {
    const rect = card.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const values = { '--project-x': `${x}%`, '--project-y': `${y}%`, '--project-rx': `${(50 - y) * .045}deg`, '--project-ry': `${(x - 50) * .045}deg`, '--project-sx': `${(x - 50) * .035}px`, '--project-sy': `${(y - 50) * .035}px` }
    if (!frame) frame = requestAnimationFrame(() => update(values))
  }
  const leave = () => { if (!frame) frame = requestAnimationFrame(() => update({ '--project-x': '50%', '--project-y': '50%', '--project-rx': '0deg', '--project-ry': '0deg', '--project-sx': '0px', '--project-sy': '0px' })) }
  card.addEventListener('pointermove', move)
  card.addEventListener('pointerleave', leave)
  return () => { if (frame) cancelAnimationFrame(frame); card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave) }
}

function TiltCard({ children, className = '', accent = '#38e8e0' }) {
  const { enableTilt } = usePerformanceMode()
  const cardRef = useRef(null)
  const frameRef = useRef(0)
  const pointerRef = useRef({ x: 50, y: 50 })
  const updateCard = () => {
    frameRef.current = 0
    const card = cardRef.current
    if (!card) return
    const { x, y, top, right, bottom, left, pixelX, pixelY } = pointerRef.current
    card.style.setProperty('--x', `${x}%`)
    card.style.setProperty('--y', `${y}%`)
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
    card.style.setProperty('--mouse-x-px', `${pixelX}px`)
    card.style.setProperty('--mouse-y-px', `${pixelY}px`)
    card.style.setProperty('--edge-top', top)
    card.style.setProperty('--edge-right', right)
    card.style.setProperty('--edge-bottom', bottom)
    card.style.setProperty('--edge-left', left)
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
    card.style.setProperty('--skill-accent', accent)
    card.style.setProperty('--rx', `${(50 - y) * 0.06}deg`)
    card.style.setProperty('--ry', `${(x - 50) * 0.06}deg`)
  }
  const move = (event) => {
    if (!enableTilt) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top))
    const distances = { top: y, right: rect.width - x, bottom: rect.height - y, left: x }
    const weights = Object.fromEntries(Object.entries(distances).map(([edge, distance]) => [edge, Math.exp(-distance / Math.max(18, Math.min(rect.width, rect.height) * .12))]))
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    pointerRef.current = { x: (x / rect.width) * 100, y: (y / rect.height) * 100, pixelX: x, pixelY: y, top: weights.top / total, right: weights.right / total, bottom: weights.bottom / total, left: weights.left / total }
    if (!frameRef.current) frameRef.current = requestAnimationFrame(updateCard)
  }
  const leave = () => {
    pointerRef.current = { x: 50, y: 50, pixelX: 0, pixelY: 0, top: 0, right: 0, bottom: 0, left: 0 }
    if (!frameRef.current) frameRef.current = requestAnimationFrame(updateCard)
  }
  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }, [])
  return <div ref={cardRef} className={`tilt-card ${className} ${enableTilt ? '' : 'performance-static'}`} style={{ '--skill-accent': accent }} onMouseMove={move} onMouseLeave={leave}>{children}</div>
}

function ProjectCaseStudy({ project, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  const study = project.caseStudy
  return <motion.div className="case-study-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <motion.section className="case-study" role="dialog" aria-modal="true" aria-labelledby="case-study-title" initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}>
      <div className="case-study-topline"><span>PROJECT / {project.number}</span><button type="button" onClick={onClose} aria-label="Close project case study"><X size={17} /></button></div>
      <div className="case-study-heading"><div><span className="eyebrow">{project.type}</span><h2 id="case-study-title">{project.title}</h2></div><span className="case-study-route">{project.preview.route}</span></div>
      <p className="case-study-description">{project.description}</p>
      <div className="case-study-grid"><div className="case-study-column"><div className="case-block"><span className="case-label">Problem</span><p>{study.problem}</p></div><div className="case-block"><span className="case-label">Solution</span><p>{study.solution}</p></div><div className="case-block"><span className="case-label">Challenges</span><ul>{study.challenges.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="case-study-column"><div className="case-block"><span className="case-label">Architecture</span><dl>{Object.entries(study.architecture).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><ArchitectureDiagram nodes={study.diagram} /></div><div className="case-block"><span className="case-label">Key features</span><ul>{study.features.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="case-block"><span className="case-label">What I learned</span><p>{study.learned}</p></div></div></div>
      <div className="case-study-footer"><span className="case-label">Links</span><div><a className="case-link" href={study.links.github || undefined} target={study.links.github ? '_blank' : undefined} rel={study.links.github ? 'noreferrer' : undefined} aria-disabled={!study.links.github}>GitHub <ExternalLink size={13} /></a><a className="case-link" href={study.links.liveDemo || undefined} target={study.links.liveDemo ? '_blank' : undefined} rel={study.links.liveDemo ? 'noreferrer' : undefined} aria-disabled={!study.links.liveDemo}>Live Demo <ExternalLink size={13} /></a></div></div>
    </motion.section>
  </motion.div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [sent, setSent] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [localTime, setLocalTime] = useState(() => new Date())
  const { enableCursor, enableTilt, simplified } = usePerformanceMode()
  const cursorX = useMotionValue(-100); const cursorY = useMotionValue(-100)
  const smoothX = useSpring(cursorX, { stiffness: 450, damping: 32 }); const smoothY = useSpring(cursorY, { stiffness: 450, damping: 32 })

  useEffect(() => { const onScroll = () => { setScrolled(window.scrollY > 24); const current = navItems.find((id) => { const section = document.getElementById(id); return section && window.scrollY >= section.offsetTop - 180 }); if (current) setActiveSection(current) }; const onMove = (event) => { cursorX.set(event.clientX); cursorY.set(event.clientY) }; window.addEventListener('scroll', onScroll, { passive: true }); if (enableCursor) window.addEventListener('mousemove', onMove); onScroll(); return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove) } }, [cursorX, cursorY, enableCursor])
  useEffect(() => { const targets = document.querySelectorAll('.project-foot > a, .coding-links a, .contact-details a, .footer-links a'); const cleanups = [...targets].map((target) => bindMagneticTarget(target, enableCursor)); return () => cleanups.forEach((cleanup) => cleanup()) }, [enableCursor])
  useEffect(() => { const cards = document.querySelectorAll('.project-card'); const cleanups = [...cards].map((card) => bindProjectLighting(card, enableTilt)); return () => cleanups.forEach((cleanup) => cleanup()) }, [enableTilt])
  useEffect(() => { const clock = window.setInterval(() => setLocalTime(new Date()), 60000); return () => window.clearInterval(clock) }, [])
  useEffect(() => { const cards = document.querySelectorAll('.project-card'); const cleanups = [...cards].map((card, index) => { card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', `Open case study for ${portfolioData.projects[index].title}`); const open = (event) => { if (event.target.closest('a, button')) return; setSelectedProject(portfolioData.projects[index]) }; const keydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedProject(portfolioData.projects[index]) } }; card.addEventListener('click', open); card.addEventListener('keydown', keydown); return () => { card.removeEventListener('click', open); card.removeEventListener('keydown', keydown) } }); return () => cleanups.forEach((cleanup) => cleanup()) }, [])
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  const handleSubmit = (event) => { event.preventDefault(); setSent(true); event.currentTarget.reset() }

  return <div className={`site-shell ${simplified ? 'performance-simplified' : ''}`}>
    <BootIntro />
    <CommandPalette social={portfolioData.social} resume={portfolioData.personal.resume} />
    <SkillConstellation />
    <ScrollDepth />
    <ProjectRevealObserver />
    <InteractiveTerminal social={portfolioData.social} resume={portfolioData.personal.resume} />
    <RecruiterQuickView portfolio={portfolioData} />
    <Suspense fallback={null}><TechUniverse /></Suspense>
    <Suspense fallback={null}><HeroExperience onProjects={() => scrollTo('about')} onContact={() => scrollTo('contact')} /></Suspense>
    {enableCursor && <motion.div className="custom-cursor" style={{ x: smoothX, y: smoothY }} aria-hidden="true"><span /></motion.div>}<div className="noise" aria-hidden="true" />
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}><button className="brand" onClick={() => scrollTo('home')} aria-label="Go to home"><span>R</span> ratnesh<span className="brand-dot">.</span>dev</button><nav className={menuOpen ? 'mobile-open' : ''}>{navItems.map((item) => <button key={item} className={activeSection === item ? 'active' : ''} onClick={() => scrollTo(item)}>{item}</button>)}<Magnetic as="a" className="resume-link" href={portfolioData.personal.resume} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={14} /></Magnetic></nav><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button></header>
    <main>
      <section id="home" className="hero section-wrap"><div className="hero-copy"><motion.div initial="hidden" animate="visible" variants={reveal} className="availability"><span /> {portfolioData.personal.availability}</motion.div><motion.p initial="hidden" animate="visible" variants={reveal} className="hero-kicker">Hello, I'm <span>Ratnesh Singh Chauhan</span></motion.p><motion.h1 initial="hidden" animate="visible" variants={reveal}>I build digital<br /><em>experiences</em> that matter.</motion.h1><motion.p initial="hidden" animate="visible" variants={reveal} className="hero-description">{portfolioData.personal.bio}</motion.p><motion.div initial="hidden" animate="visible" variants={reveal} className="hero-actions"><Magnetic as="button" className="button button-primary" onClick={() => scrollTo('projects')}>View projects <ArrowUpRight size={16} /></Magnetic><Magnetic as="a" className="text-link" href={`mailto:${portfolioData.personal.email}`}>Let's talk <span>↗</span></Magnetic></motion.div><motion.div initial="hidden" animate="visible" variants={reveal} className="hero-socials"><Magnetic as="a" href={portfolioData.social.github} target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub</Magnetic><Magnetic as="a" href={portfolioData.social.linkedin} target="_blank" rel="noreferrer"><Network size={17} /> LinkedIn</Magnetic><Magnetic as="a" href={portfolioData.social.leetcode} target="_blank" rel="noreferrer"><Code2 size={17} /> LeetCode</Magnetic></motion.div></div><motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="hero-visual"><div className="visual-grid" /><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-core"><span>01</span><strong>BUILD</strong><small>with intention</small></div><div className="code-fragment fragment-one">const idea = <b>"worth building"</b></div><div className="code-fragment fragment-two">ship<span>()</span>;</div><div className="visual-caption"><span>01 — 04</span><span>selected<br />signal</span></div><div className="hero-hud"><span>SYS / ONLINE</span><b>REACT + NODE</b><small>build loop active</small></div></motion.div><button className="scroll-cue" onClick={() => scrollTo('about')}><MousePointer2 size={14} /> Scroll to explore <ChevronDown size={14} /></button></section>
      <div className="lab-strip section-wrap" aria-label="Portfolio system status"><span><i /> portfolio system online</span><span>stack / MERN + Python</span><span>mode / learn → ship</span><span>location / {portfolioData.personal.location}</span></div>
      <section id="about" className="section-wrap about-section"><SectionHeading eyebrow="01 / academic core" title={<>The person<br /><em>behind the build.</em></>} intro="A Computer Science Engineering student turning curiosity into complete, useful software experiences." /><div className="about-grid"><div className="about-copy"><p>I am a Computer Science Engineering student passionate about developing full-stack applications and solving real-world problems through technology.</p><p>My work focuses on responsive frontend experiences, scalable backend systems, APIs, databases, and complete web applications that feel as good as they function.</p><a className="text-link" href="#contact">Open developer dossier <ArrowUpRight size={15} /></a></div><div className="principles">{['Full Stack Development', 'Problem Solving', 'Backend Development', 'Responsive UI', 'API Development', 'Database Design'].map((item, index) => <div className="principle" key={item}><span>0{index + 1}</span><strong>{item}</strong><ArrowUpRight size={15} /></div>)}</div></div></section>
      <section id="skills" className="section-wrap skills-section"><SectionHeading eyebrow="02 / skills under construction" title={<>The stack I'm<br /><em>growing with.</em></>} intro="Not an expert list. A build log of the tools I use, practise, and keep pushing further." /><div className="skills-grid">{Object.entries(portfolioData.skills).map(([category, items], index) => <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true, amount: .2 }} className="skill-group" key={category}><div className="skill-head">{index === 0 ? <Globe2 /> : index === 1 ? <Network /> : index === 2 ? <Database /> : <Terminal />}<span>0{index + 1}</span><h3>{category}</h3></div><div className="skill-list">{items.map((item) => <TiltCard key={item} className="skill-card" accent={skillAccents[item]}><span className="skill-icon">{item.slice(0, 2).toUpperCase()}</span><strong>{item}</strong><small>status: active</small><ArrowUpRight size={14} /></TiltCard>)}</div></motion.div>)}</div></section>
      <section id="projects" className="section-wrap projects-section"><div className="section-topline"><SectionHeading eyebrow="03 / selected work" title={<>The project<br /><em>vault.</em></>} /><a className="text-link desktop-only" href={portfolioData.social.github} target="_blank" rel="noreferrer">View GitHub <ArrowUpRight size={15} /></a></div><div className="projects-grid">{portfolioData.projects.map((project) => <motion.article key={project.title} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true, amount: .14 }} className={`project-card ${project.featured ? 'featured' : ''}`}><div className={`project-art ${project.color}`}><span className="project-number">{project.number}</span><span className="vault-path">~/vault/{project.title.toLowerCase().replaceAll(' ', '-')}</span><span className="boot-label">hover to boot</span><div className="art-window"><div className="window-bar"><i /><i /><i /></div><div className="window-lines"><b /><b /><b /><b /></div><div className="art-shape"><Layers3 size={48} /></div></div>{project.featured && <span className="featured-label">Featured work</span>}</div><div className="project-info"><div><span className="eyebrow">{project.type}</span><h3>{project.title}</h3></div><p>{project.description}</p><div className="project-foot"><div className="tech-tags">{project.tech.map((tag) => <span key={tag}># {tag}</span>)}</div><a href={portfolioData.social.github} target="_blank" rel="noreferrer" aria-label={`View ${project.title} on GitHub`}><Github size={17} /></a></div></div></motion.article>)}</div></section>
      <section id="experience" className="section-wrap experience-section"><SectionHeading eyebrow="04 / build history" title={<>Learning by<br /><em>shipping.</em></>} /><div className="experience-grid"><div className="timeline">{portfolioData.experience.map((item, index) => <motion.article initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }} key={item.title} className="timeline-item"><div className="timeline-marker">0{index + 1}</div><div className="timeline-body"><span className="eyebrow">{item.date}</span><h3>{item.title}</h3><p className="timeline-company">{item.company}</p><ul>{item.details.map((detail) => <li key={detail}><Check size={14} />{detail}</li>)}</ul></div></motion.article>)}</div><div className="education-card"><span className="eyebrow">Education module</span><div className="education-icon"><Code2 size={22} /></div><h3>{portfolioData.education.degree}</h3><p>{portfolioData.education.school}</p><small>{portfolioData.education.detail}</small><div className="card-index">ED / ACTIVE</div></div></div></section>
      <section className="section-wrap coding-section"><div className="coding-intro"><SectionHeading eyebrow="05 / personality module" title={<>Beyond<br /><em>the code.</em></>} intro="The patterns I practise away from the editor still shape the way I design, debug, and build." /><div className="coding-links"><a href={portfolioData.social.leetcode} target="_blank" rel="noreferrer">LeetCode <ExternalLink size={14} /></a><a href={portfolioData.social.github} target="_blank" rel="noreferrer">GitHub <ExternalLink size={14} /></a></div></div><div className="topic-cloud">{portfolioData.coding.map((topic, index) => <span key={topic} className={index % 3 === 0 ? 'topic-accent' : ''}>{topic}</span>)}</div></section>
      <section id="contact" className="section-wrap contact-section"><div className="contact-copy"><SectionHeading eyebrow="06 / initiate contact" title={<>Let's build something<br /><em>meaningful.</em></>} intro="I'm open to full-stack development opportunities, internships, collaborations, and interesting software projects." /><div className="contact-details"><a href={`mailto:${portfolioData.personal.email}`}><Mail size={17} />{portfolioData.personal.email}</a><a href={portfolioData.social.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a><a href={portfolioData.social.github} target="_blank" rel="noreferrer"><Github size={17} />GitHub</a></div></div><form className="contact-form" onSubmit={handleSubmit}><div className="form-terminal">secure terminal · open channel</div><label>Name<input required name="name" placeholder="your name" /></label><label>Email<input required type="email" name="email" placeholder="you@company.com" /></label><label>Message<textarea required name="message" rows="4" placeholder="tell me about your idea..." /></label><button className="button button-primary" type="submit">{sent ? 'Transmission ready' : 'Send transmission'} <Send size={15} /></button><small>{sent ? 'Thanks. This frontend-only form is ready to connect to an email service.' : 'Frontend-only contact form. No message is sent yet.'}</small></form></section>
    </main>
    <footer className="footer section-wrap"><div className="footer-brand"><span>R</span><div><strong>RATNESH.LAB</strong><small>FULL STACK DEVELOPER</small></div></div><div className="footer-status"><span><i /> SYSTEM ONLINE</span><small>LOCAL / {localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div><div className="footer-links"><a href={portfolioData.social.github}>GitHub</a><a href={portfolioData.social.linkedin}>LinkedIn</a><a href={portfolioData.social.leetcode}>LeetCode</a><a href={`mailto:${portfolioData.personal.email}`}>Email</a><a className="back-top" href="#home">Back to top <ArrowUpRight size={12} /></a></div><span className="built-with">© {new Date().getFullYear()}</span></footer>
    <AnimatePresence>{selectedProject && <ProjectCaseStudy project={selectedProject} onClose={() => setSelectedProject(null)} />}</AnimatePresence>
  </div>
}

export default App
