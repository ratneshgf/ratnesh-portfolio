import { motion } from 'framer-motion'
import { useState } from 'react'
import { Award, Code2 } from 'lucide-react'
import { portfolioData } from '../data/portfolioData'
import { usePerformanceMode } from '../hooks/usePerformanceMode.jsx'

export default function Achievements() {
  const { reducedMotion } = usePerformanceMode()
  const [expandedCards, setExpandedCards] = useState({})

  return (
    <section id="achievements" className="section-wrap achievements-section" aria-labelledby="achievements-heading">
      <div className="section-heading">
        <span className="eyebrow">06 / milestones</span>
        <h2 id="achievements-heading">Achievements<br /><em>&amp; activities.</em></h2>
      </div>
      <div className="achievements-grid">
        {portfolioData.achievements.map((item) => (
          <motion.article
            key={item.id}
            className="achievement-card"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .2 }}
            transition={{ duration: reducedMotion ? 0 : .5 }}
          >
            {item.events && <button className="achievement-toggle" type="button"
              aria-label={`${expandedCards[item.id] ? 'Hide' : 'Show'} ${item.title.toLowerCase()}`}
              aria-expanded={!!expandedCards[item.id]} aria-controls={`${item.id}-events`}
              onClick={() => setExpandedCards((cards) => ({ ...cards, [item.id]: !cards[item.id] }))} />}
            <div className="achievement-topline">
              <span className="eyebrow">{item.label}</span>
              {item.id === 'hackathons' ? <Code2 size={22} aria-hidden="true" /> : <Award size={22} aria-hidden="true" />}
            </div>
            <h3><span className="achievement-count">{item.count}</span>{item.title}</h3>
            <p>{item.detail}</p>
            {item.events && <ul id={`${item.id}-events`} className="achievement-events" hidden={!expandedCards[item.id]}>{item.events.map((event) => <li key={event}>{event}</li>)}</ul>}
          </motion.article>
        ))}
      </div>
    </section>
  )
}
