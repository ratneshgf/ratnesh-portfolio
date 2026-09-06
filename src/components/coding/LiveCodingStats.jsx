import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { portfolioData } from '../../data/portfolioData'
import { usePerformanceMode } from '../../hooks/usePerformanceMode.jsx'
import useCodingStats from './useCodingStats'
import './LiveCodingStats.css'
import ContributionTable from './ContributionTable'

const number = (value) => Number.isFinite(value) ? value.toLocaleString() : 'Unavailable'
function Metric({ label, value }) {
  return <div className="coding-metric"><dt>{label}</dt><dd>{number(value)}</dd></div>
}
function StatsCard({ name, profile, state, children }) {
  const { enableTilt } = usePerformanceMode()
  const move = (event) => {
    if (!enableTilt) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const style = event.currentTarget.style
    style.setProperty('--cx', `${x * 100}%`)
    style.setProperty('--cy', `${y * 100}%`)
    style.setProperty('--rx', `${(0.5 - y) * 3}deg`)
    style.setProperty('--ry', `${(x - 0.5) * 3}deg`)
  }
  return <article className="coding-stat-card" onPointerMove={move} onPointerLeave={(event) => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg') }}>
    <header><h4>{name}</h4><span>@{profile.username || 'not configured'}</span></header>
    <div className="coding-stat-body" aria-busy={state.status === 'loading'}>
      {state.status === 'loading' ? <div className="coding-skeleton" role="status" aria-label={`Loading ${name} statistics`}><i /><i /><i /></div> : <>
        {state.data && children}
        {state.status === 'unavailable' && <p className="coding-unavailable" role="status">LIVE DATA TEMPORARILY UNAVAILABLE{state.data && <small>Showing last successful sync</small>}</p>}
      </>}
    </div>
    <ContributionTable platform={name} endpoint={name === 'GitHub' ? '/api/github-activity' : '/api/leetcode-activity'} />
    <footer><span>SOURCE: {name.toUpperCase()}{name === 'GitHub' && ' API'}<br />STATUS: {state.status.toUpperCase()}</span>{profile.url && <a href={profile.url} target="_blank" rel="noreferrer">View profile <ArrowUpRight size={14} /></a>}</footer>
    {state.data && <small className="coding-sync-time">LAST SYNC: <time dateTime={state.data.syncedAt}>{new Date(state.data.syncedAt).toLocaleString()}</time></small>}
  </article>
}
export default function LiveCodingStats() {
  const github = useCodingStats('/api/github-stats')
  const leetcode = useCodingStats('/api/leetcode-stats')
  const { reducedMotion } = usePerformanceMode()
  const status = [github, leetcode].every((item) => item.status === 'connected') ? 'ONLINE' : [github, leetcode].some((item) => item.status === 'loading') ? 'SYNCING' : 'PARTIAL / UNAVAILABLE'
  const entrance = (delay) => ({ initial: { opacity: 0, y: reducedMotion ? 0 : 15 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .15 }, transition: { duration: reducedMotion ? 0 : .45, delay: reducedMotion ? 0 : delay } })
  return <section className="live-coding-stats" aria-labelledby="live-coding-title">
    <motion.header className="live-coding-header" {...entrance(0)}><div><span className="eyebrow">LIVE CODING STATS</span><h3 id="live-coding-title">GitHub &amp; LeetCode</h3><p>Real-time contributions, problem-solving stats, and coding activity from both platforms.</p></div><span className={`coding-status ${status === 'ONLINE' ? 'is-online' : ''}`} role="status"><i />SYNC_STATUS: {status}</span></motion.header>
    <div className="live-coding-grid">
      <motion.div {...entrance(.08)}><StatsCard name="GitHub" profile={portfolioData.codingProfiles.github} state={github}><dl className="coding-metrics"><Metric label="Public repositories" value={github.data?.repositories} /><Metric label="Followers" value={github.data?.followers} /><Metric label="Following" value={github.data?.following} /></dl></StatsCard></motion.div>
      <motion.div {...entrance(.16)}><StatsCard name="LeetCode" profile={portfolioData.codingProfiles.leetcode} state={leetcode}><dl className="coding-metrics"><Metric label="Total solved" value={leetcode.data?.all} />{leetcode.data?.ranking !== null && <Metric label="Ranking" value={leetcode.data?.ranking} />}</dl><div className="coding-distribution" aria-hidden="true">{['easy', 'medium', 'hard'].map((level) => <span key={level} className={level} style={{ width: `${leetcode.data?.all ? leetcode.data[level] / leetcode.data.all * 100 : 0}%` }} />)}</div><dl className="coding-metrics coding-difficulties">{['easy', 'medium', 'hard'].map((level) => <Metric key={level} label={level} value={leetcode.data?.[level]} />)}</dl></StatsCard></motion.div>
    </div>
  </section>
}
