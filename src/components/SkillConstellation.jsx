import { useEffect } from 'react'

const relationships = [
  ['React.js', 'Node.js'],
  ['Node.js', 'Express.js'],
  ['Express.js', 'MongoDB'],
  ['Express.js', 'PostgreSQL'],
  ['Python', 'Flask'],
  ['Node.js', 'Socket.io'],
]

const svgNamespace = 'http://www.w3.org/2000/svg'

function createSvgElement(type, attributes = {}) {
  const element = document.createElementNS(svgNamespace, type)
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  return element
}

export default function SkillConstellation() {
  useEffect(() => {
    const section = document.querySelector('.skills-section')
    const cards = [...document.querySelectorAll('.skill-card')]
    if (!section || !cards.length) return undefined

    const cardMap = new Map(cards.map((card) => [card.querySelector('strong')?.textContent?.trim(), card]))
    const svg = createSvgElement('svg', { class: 'skill-constellation', 'aria-hidden': 'true' })
    section.appendChild(svg)

    const draw = () => {
      const sectionRect = section.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${sectionRect.width} ${sectionRect.height}`)
      svg.replaceChildren()
      relationships.forEach(([fromName, toName], index) => {
        const from = cardMap.get(fromName)
        const to = cardMap.get(toName)
        if (!from || !to) return
        const fromRect = from.getBoundingClientRect()
        const toRect = to.getBoundingClientRect()
        const start = { x: fromRect.left + fromRect.width / 2 - sectionRect.left, y: fromRect.top + fromRect.height / 2 - sectionRect.top }
        const end = { x: toRect.left + toRect.width / 2 - sectionRect.left, y: toRect.top + toRect.height / 2 - sectionRect.top }
        const group = createSvgElement('g', { class: 'constellation-link', 'data-from': fromName, 'data-to': toName })
        const line = createSvgElement('line', { x1: start.x, y1: start.y, x2: end.x, y2: end.y })
        group.appendChild(line)
        if (index % 2 === 0) {
          const pulse = createSvgElement('circle', { r: '2', class: 'constellation-pulse' })
          const motion = createSvgElement('animateMotion', { dur: `${5.5 + index * .45}s`, begin: `${index * 1.2}s`, repeatCount: 'indefinite', path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`, keyPoints: '0;1;0', keyTimes: '0;.5;1', calcMode: 'linear' })
          pulse.appendChild(motion)
          group.appendChild(pulse)
        }
        svg.appendChild(group)
      })
    }

    const relatedByCard = new Map()
    relationships.forEach(([fromName, toName]) => {
      const from = cardMap.get(fromName)
      const to = cardMap.get(toName)
      if (!from || !to) return
      relatedByCard.set(from, [...(relatedByCard.get(from) || []), to])
      relatedByCard.set(to, [...(relatedByCard.get(to) || []), from])
    })

    const cleanups = cards.map((card) => {
      const enter = () => {
        const related = new Set(relatedByCard.get(card) || [])
        card.classList.add('constellation-active')
        related.forEach((relatedCard) => relatedCard.classList.add('constellation-related'))
        svg.querySelectorAll('.constellation-link').forEach((link) => { if (link.dataset.from === cardMapKey(card) || link.dataset.to === cardMapKey(card)) link.classList.add('is-lit') })
      }
      const leave = () => {
        card.classList.remove('constellation-active')
        cards.forEach((relatedCard) => relatedCard.classList.remove('constellation-related'))
        svg.querySelectorAll('.constellation-link').forEach((link) => link.classList.remove('is-lit'))
      }
      card.addEventListener('pointerenter', enter)
      card.addEventListener('pointerleave', leave)
      return () => { card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave) }
    })

    const cardMapKey = (card) => card.querySelector('strong')?.textContent?.trim()
    const observer = new ResizeObserver(draw)
    observer.observe(section)
    window.addEventListener('resize', draw, { passive: true })
    draw()
    return () => { cleanups.forEach((cleanup) => cleanup()); observer.disconnect(); window.removeEventListener('resize', draw); svg.remove() }
  }, [])

  return null
}
