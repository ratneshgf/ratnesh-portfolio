import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePerformanceMode } from '../../hooks/usePerformanceMode.jsx'

const accentClasses = ['role-violet', 'role-cyan', 'role-blue', 'role-magenta', 'role-indigo']

export default function RotatingRole({ roles }) {
  const { reducedMotion } = usePerformanceMode()
  const [activeIndex, setActiveIndex] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const activeRole = reducedMotion ? roles[1] : roles[activeIndex]

  useEffect(() => {
    if (reducedMotion || isPaused) return undefined
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % roles.length), 3000)
    return () => window.clearInterval(timer)
  }, [isPaused, reducedMotion, roles.length])

  return <div className={`rotating-role ${accentClasses[activeIndex % accentClasses.length]}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} aria-label={`${activeRole}. Full Stack Developer and Software Developer`} role="status">
    <span className="rotating-role-prefix">ROLE //</span>
    <span className="rotating-role-visual" aria-hidden="true"><AnimatePresence mode="wait" initial={false}><motion.span key={activeRole} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}>{activeRole}</motion.span></AnimatePresence><i>_</i></span>
  </div>
}
