import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const bootLines = [
  'INITIALIZING SYSTEM...',
  'LOADING INTERFACE...',
  'CONNECTING PROJECT VAULT...',
  'SYNCING TECHNOLOGY MATRIX...',
  'SYSTEM READY',
]

function canPlayBoot() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return window.sessionStorage.getItem('ratnesh-boot-seen') !== 'true'
}

export default function BootIntro() {
  const [isVisible, setIsVisible] = useState(canPlayBoot)
  const [lineCount, setLineCount] = useState(0)

  const finish = () => {
    window.sessionStorage.setItem('ratnesh-boot-seen', 'true')
    setIsVisible(false)
  }

  useEffect(() => {
    if (!isVisible) return undefined
    const timers = [
      window.setTimeout(() => setLineCount(1), 230),
      window.setTimeout(() => setLineCount(2), 540),
      window.setTimeout(() => setLineCount(3), 850),
      window.setTimeout(() => setLineCount(4), 1160),
      window.setTimeout(() => setLineCount(5), 1470),
      window.setTimeout(() => finish(), 1940),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [isVisible])

  return <AnimatePresence>
    {isVisible && <motion.div className="boot-intro" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .45, ease: 'easeInOut' } }} role="status" aria-live="polite">
      <div className="boot-shell">
        <div className="boot-topline"><span>RATNESH.LAB</span><span>SYS / 01</span></div>
        <div className="boot-center">
          <div className="boot-mark" aria-hidden="true"><i /><i /><i /></div>
          <p className="boot-kicker">PERSONAL SOFTWARE STUDIO</p>
          <h1>RATNESH<span>.LAB</span></h1>
          <div className="boot-log">{bootLines.map((line, index) => <motion.div key={line} initial={{ opacity: 0, x: -8 }} animate={index < lineCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }} transition={{ duration: .24 }}><span>{index < lineCount ? 'OK' : '--'}</span>{line}</motion.div>)}</div>
          <div className="boot-progress" aria-hidden="true"><motion.span animate={{ width: `${Math.min(lineCount / bootLines.length, 1) * 100}%` }} transition={{ duration: .3, ease: 'easeOut' }} /></div>
        </div>
        <div className="boot-bottomline"><span>BUILD / 2026</span><button type="button" onClick={finish}>Skip intro</button></div>
      </div>
    </motion.div>}
  </AnimatePresence>
}
