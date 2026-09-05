import { useEffect } from 'react'
import { usePerformanceMode } from '../hooks/usePerformanceMode.jsx'

export default function ProjectRevealObserver() {
  const { reducedMotion } = usePerformanceMode()
  useEffect(() => {
    const previews = [...document.querySelectorAll('.project-art .art-window')]
    if (!previews.length) return undefined
    if (reducedMotion) {
      previews.forEach((preview) => preview.classList.add('is-revealed'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.classList.contains('is-revealed')) return
        window.requestAnimationFrame(() => entry.target.classList.add('is-revealed'))
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' })

    previews.forEach((preview) => observer.observe(preview))
    return () => observer.disconnect()
  }, [reducedMotion])

  return null
}
