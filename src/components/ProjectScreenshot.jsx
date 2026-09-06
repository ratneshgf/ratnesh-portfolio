import { useState } from 'react'

export default function ProjectScreenshot({ project }) {
  const [status, setStatus] = useState('loading')

  if (!project.image || status === 'error') return null

  return (
    <div className={`project-screenshot ${project.imageFit === 'contain' ? 'show-full-image' : ''} ${status === 'loaded' ? 'is-loaded' : ''}`}>
      <img
        src={project.image}
        alt={`${project.title} dashboard preview`}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      <div className="project-screenshot-overlay" aria-hidden="true" />
    </div>
  )
}
