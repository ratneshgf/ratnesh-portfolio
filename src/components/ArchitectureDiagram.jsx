import { useState } from 'react'

export default function ArchitectureDiagram({ nodes }) {
  const [activeIndex, setActiveIndex] = useState(null)
  if (!nodes?.length) return null
  const step = nodes.length === 1 ? 50 : 76 / (nodes.length - 1)
  const points = nodes.map((_, index) => 12 + index * step)

  return <div className="architecture-diagram" aria-label="Project architecture flow">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{points.slice(0, -1).map((point, index) => <path key={index} className={activeIndex === index || activeIndex === index + 1 ? 'is-active' : ''} d={`M 50 ${point + 5} L 50 ${points[index + 1] - 5}`} />)}</svg>
    <div className="architecture-nodes">{nodes.map((node, index) => <button type="button" className={activeIndex === index ? 'is-active' : ''} key={node.label} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)}><span className="architecture-index">0{index + 1}</span><strong>{node.label}</strong><small>{node.description}</small></button>)}</div>
  </div>
}
