import { useEffect } from 'react'
import { usePerformanceMode } from '../hooks/usePerformanceMode.jsx'

const depthTargets = [
  ['.hero-visual', 0.018, 12],
  ['.lab-strip', -0.012, 7],
  ['.section-heading', 0.008, 6],
  ['.principle', -0.006, 5],
  ['.education-card', 0.01, 7],
  ['.topic-cloud', -0.008, 6],
]

export default function ScrollDepth() {
  const { continuousMotion } = usePerformanceMode()
  useEffect(() => {
    if (!continuousMotion) return undefined
    const targets = depthTargets.flatMap(([selector, speed, limit]) => [...document.querySelectorAll(selector)].map((element) => ({ element, speed, limit, current: 0, target: 0 })))
    let frame = 0
    let running = false

    const measure = () => {
      const viewportCenter = window.innerHeight / 2
      targets.forEach((item) => {
        const rect = item.element.getBoundingClientRect()
        item.target = Math.max(-item.limit, Math.min(item.limit, (viewportCenter - (rect.top + rect.height / 2)) * item.speed))
      })
    }
    const tick = () => {
      frame = 0
      targets.forEach((item) => {
        item.current += (item.target - item.current) * 0.08
        item.element.style.setProperty('--scroll-depth-y', `${item.current.toFixed(2)}px`)
      })
      if (running) frame = requestAnimationFrame(tick)
    }
    const onScroll = () => { measure(); if (!running) { running = true; frame = requestAnimationFrame(tick) } }
    const onResize = () => { measure(); onScroll() }
    measure()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => { running = false; if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [continuousMotion])

  return null
}
