import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight, Check, ChevronDown, Code2, Database, ExternalLink, Globe2, Mail, Menu, MousePointer2, Network, Terminal, X } from 'lucide-react'
import { portfolioData } from './data/portfolioData'
import { technologyIcons } from './data/technologyIcons'
import BootIntro from './components/BootIntro'
import CommandPalette from './components/CommandPalette'
import SkillConstellation from './components/SkillConstellation'
import ScrollDepth from './components/ScrollDepth'
import RecruiterQuickView from './components/RecruiterQuickView'
import ProjectWallet from './components/ProjectWallet'
import ProjectRevealObserver from './components/ProjectRevealObserver'
import Achievements from './components/Achievements'
import ContactForm from './components/ContactForm'
import LiveCodingStats from './components/coding/LiveCodingStats'
import { usePerformanceMode } from './hooks/usePerformanceMode.jsx'
import './App.css'

const Github = Code2
const Linkedin = Network
const TechUniverse = lazy(() => import('./components/background/TechUniverse'))
const HeroExperience = lazy(() => import('./components/HeroExperience'))
const navItems = ['home', 'about', 'skills', 'projects', 'experience', 'contact']

const reveal = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }
const skillAccents = Object.fromEntries(Object.values(portfolioData.skills).flat().map((skill) => [skill, 'var(--red-primary)']))

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

function TiltCard({ children, className = '', accent = 'var(--red-primary)' }) {
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


function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [localTime, setLocalTime] = useState(() => new Date())
  const { enableCursor, simplified } = usePerformanceMode()
  const cursorX = useMotionValue(-100); const cursorY = useMotionValue(-100)
  const smoothX = useSpring(cursorX, { stiffness: 450, damping: 32 }); const smoothY = useSpring(cursorY, { stiffness: 450, damping: 32 })

  useEffect(() => {
    let frame = 0
    const updateNavigation = () => {
      frame = 0
      setScrolled(window.scrollY > 24)
      const current = [...navItems].reverse().find((id) => {
        const section = document.getElementById(id)
        return section && section.getBoundingClientRect().top <= 180
      })
      setActiveSection(current || 'home')
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNavigation)
    }
    const onMove = (event) => { cursorX.set(event.clientX); cursorY.set(event.clientY) }
    window.addEventListener('scroll', onScroll, { passive: true })
    if (enableCursor) window.addEventListener('mousemove', onMove)
    updateNavigation()
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [cursorX, cursorY, enableCursor])
  useEffect(() => { const targets = document.querySelectorAll('.project-foot > a, .coding-links a, .contact-details a, .footer-links a'); const cleanups = [...targets].map((target) => bindMagneticTarget(target, enableCursor)); return () => cleanups.forEach((cleanup) => cleanup()) }, [enableCursor])
  useEffect(() => { const clock = window.setInterval(() => setLocalTime(new Date()), 60000); return () => window.clearInterval(clock) }, [])
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  return <div className={`site-shell ${simplified ? 'performance-simplified' : ''}`}>
    <BootIntro />
    <CommandPalette social={portfolioData.social} resume={portfolioData.personal.resume} />
    <SkillConstellation />
    <ScrollDepth />
    <ProjectRevealObserver />
    <RecruiterQuickView portfolio={portfolioData} />
    <Suspense fallback={null}><TechUniverse /></Suspense>
    {enableCursor && <motion.div className="custom-cursor" style={{ x: smoothX, y: smoothY }} aria-hidden="true"><span /></motion.div>}<div className="noise" aria-hidden="true" />
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}><button className="brand" onClick={() => scrollTo('home')} aria-label="Go to home"><span>R</span> ratnesh<span className="brand-dot">.</span>dev</button><nav id="main-navigation" aria-label="Main navigation" className={menuOpen ? 'mobile-open' : ''}>{navItems.map((item) => <button key={item} className={activeSection === item ? 'active' : ''} aria-current={activeSection === item ? 'location' : undefined} onClick={() => scrollTo(item)}>{item}</button>)}<Magnetic as="a" className="resume-link" href={portfolioData.personal.resume} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={14} /></Magnetic></nav><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-navigation">{menuOpen ? <X /> : <Menu />}</button></header>
    <main>
      <section id="home" className="hero section-wrap"><Suspense fallback={null}><HeroExperience onProjects={() => scrollTo('about')} onContact={() => scrollTo('contact')} /></Suspense><div className="hero-copy"><motion.div initial="hidden" animate="visible" variants={reveal} className="availability"><span /> {portfolioData.personal.availability}</motion.div><motion.p initial="hidden" animate="visible" variants={reveal} className="hero-kicker">Hello, I'm <span>Ratnesh Singh Chauhan</span></motion.p><motion.h1 initial="hidden" animate="visible" variants={reveal}>I build digital<br /><em>experiences</em> that matter.</motion.h1><motion.p initial="hidden" animate="visible" variants={reveal} className="hero-description">{portfolioData.personal.bio}</motion.p><motion.div initial="hidden" animate="visible" variants={reveal} className="hero-actions"><Magnetic as="button" className="button button-primary" onClick={() => scrollTo('projects')}>View projects <ArrowUpRight size={16} /></Magnetic><Magnetic as="a" className="text-link" href={`mailto:${portfolioData.personal.email}`}>Let's talk <span>↗</span></Magnetic></motion.div><motion.div initial="hidden" animate="visible" variants={reveal} className="hero-socials"><Magnetic as="a" href={portfolioData.social.github} target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub</Magnetic><Magnetic as="a" href={portfolioData.social.linkedin} target="_blank" rel="noreferrer"><Network size={17} /> LinkedIn</Magnetic><Magnetic as="a" href={portfolioData.social.leetcode} target="_blank" rel="noreferrer"><Code2 size={17} /> LeetCode</Magnetic></motion.div></div><motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="hero-visual"><div className="visual-grid" /><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-core"><span>01</span><strong>BUILD</strong><small>with intention</small></div><div className="code-fragment fragment-one">const idea = <b>"worth building"</b></div><div className="code-fragment fragment-two">ship<span>()</span>;</div><div className="visual-caption"><span>01 — 04</span><span>selected<br />signal</span></div><div className="hero-hud"><span>SYS / ONLINE</span><b>REACT + NODE</b><small>build loop active</small></div></motion.div><button className="scroll-cue" onClick={() => scrollTo('about')}><MousePointer2 size={14} /> Scroll to explore <ChevronDown size={14} /></button></section>
      <div className="lab-strip section-wrap" aria-label="Portfolio system status"><span><i /> portfolio system online</span><span>stack / MERN + Python</span><span>mode / learn / ship</span><span>location / {portfolioData.personal.location}</span></div>
      <section id="about" className="section-wrap about-section"><SectionHeading eyebrow="01 / academic core" title={<>The person<br /><em>behind the build.</em></>} intro="A Computer Science Engineering student turning curiosity into complete, useful software experiences." /><div className="about-grid"><div className="about-copy"><p>I am a Computer Science Engineering student passionate about developing full-stack applications and solving real-world problems through technology.</p><p>My work focuses on responsive frontend experiences, scalable backend systems, APIs, databases, and complete web applications that feel as good as they function.</p><a className="text-link" href="#contact">Open developer dossier <ArrowUpRight size={15} /></a></div><div className="principles">{['Full Stack Development', 'Problem Solving', 'Backend Development', 'Responsive UI', 'API Development', 'Database Design'].map((item, index) => <div className="principle" key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div></div></section>
      <section id="skills" className="section-wrap skills-section"><SectionHeading eyebrow="02 / skills under construction" title={<>The stack I'm<br /><em>growing with.</em></>} intro="Not an expert list. A build log of the tools I use, practise, and keep pushing further." /><div className="skills-grid">{Object.entries(portfolioData.skills).map(([category, items], index) => <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true, amount: .2 }} className="skill-group" key={category}><div className="skill-head">{index === 0 ? <Globe2 /> : index === 1 ? <Network /> : index === 2 ? <Database /> : <Terminal />}<span>0{index + 1}</span><h3>{category}</h3></div><div className="skill-list">{items.map((item) => <TiltCard key={item} className="skill-card" accent={skillAccents[item]}><span className="skill-icon"><img src={`/tech-icons/${technologyIcons[item]}.svg`} alt="" width="20" height="20" loading="lazy" decoding="async" /></span><strong>{item}</strong><small>status: active</small></TiltCard>)}</div></motion.div>)}</div></section>
      <section id="projects" className="section-wrap projects-section"><div className="section-topline"><SectionHeading eyebrow="03 / selected work" title={<>The project<br /><em>vault.</em></>} /><a className="text-link desktop-only" href={portfolioData.social.github} target="_blank" rel="noreferrer">View GitHub <ArrowUpRight size={15} /></a></div><ProjectWallet projects={portfolioData.projects} /></section>
      <section id="experience" className="section-wrap experience-section"><SectionHeading eyebrow="04 / build history" title={<>Learning by<br /><em>shipping.</em></>} /><div className="experience-grid"><div className="timeline">{portfolioData.experience.map((item, index) => <motion.article initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }} key={item.title} className="timeline-item"><div className="timeline-marker">0{index + 1}</div><div className="timeline-body"><span className="eyebrow">{item.date}</span><h3>{item.title}</h3><p className="timeline-company">{item.company}</p><ul>{item.details.map((detail) => <li key={detail}><Check size={14} />{detail}</li>)}</ul></div></motion.article>)}</div><div className="education-card"><span className="eyebrow">Education module</span><div className="education-icon"><Code2 size={22} /></div><h3>{portfolioData.education.degree}</h3><p>{portfolioData.education.school}</p><small>{portfolioData.education.detail}</small><div className="card-index">ED / ACTIVE</div></div></div></section>
      <section className="section-wrap coding-section"><div className="coding-intro"><SectionHeading eyebrow="05 / personality module" title={<>Beyond<br /><em>the code.</em></>} intro="The patterns I practise away from the editor still shape the way I design, debug, and build." /><div className="coding-links"><a href={portfolioData.social.leetcode} target="_blank" rel="noreferrer">LeetCode <ExternalLink size={14} /></a><a href={portfolioData.social.github} target="_blank" rel="noreferrer">GitHub <ExternalLink size={14} /></a></div></div><div className="topic-cloud">{portfolioData.coding.map((topic, index) => <span key={topic} className={index % 3 === 0 ? 'topic-accent' : ''}>{topic}</span>)}</div><LiveCodingStats /></section>
      <Achievements />
      <section id="contact" className="section-wrap contact-section"><div className="contact-copy"><SectionHeading eyebrow="07 / initiate contact" title={<>Let's build something<br /><em>meaningful.</em></>} intro="I'm open to full-stack development opportunities, internships, collaborations, and interesting software projects." /><div className="contact-details"><a href={`mailto:${portfolioData.personal.email}`}><Mail size={17} />{portfolioData.personal.email}</a><a href={portfolioData.social.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a><a href={portfolioData.social.github} target="_blank" rel="noreferrer"><Github size={17} />GitHub</a></div></div><ContactForm email={portfolioData.personal.email} /></section>
    </main>
    <footer className="footer section-wrap"><div className="footer-brand"><span>R</span><div><strong>RATNESH.LAB</strong><small>FULL STACK DEVELOPER</small></div></div><div className="footer-status"><span><i /> SYSTEM ONLINE</span><small>LOCAL / {localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div><div className="footer-links"><a href={portfolioData.social.github}>GitHub</a><a href={portfolioData.social.linkedin}>LinkedIn</a><a href={portfolioData.social.leetcode}>LeetCode</a><a href={`mailto:${portfolioData.personal.email}`}>Email</a><a className="back-top" href="#home">Back to top <ArrowUpRight size={12} /></a></div><span className="built-with">© {new Date().getFullYear()}</span></footer>
  </div>
}

export default App
