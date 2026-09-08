import { useState } from 'react'
import { ArrowUpRight, Terminal, Star, Users, UserPlus, Sigma, Hash, Award, Code2 } from 'lucide-react'
import { portfolioData } from '../../data/portfolioData'
import useCodingStats from './useCodingStats'
import ContributionTable from './ContributionTable'
import './LiveCodingStats.css'

function Metric({ label, value, icon: Icon }) {
  return <div className="coding-metric"><Icon size={18} aria-hidden="true" /><dd>{Number.isFinite(value) ? value.toLocaleString() : '\u2014'}</dd><dt>{label}</dt></div>
}
function Platform({ platform, state, children }) {
  const profile = portfolioData.codingProfiles[platform.toLowerCase()]
  return <article className={`coding-stat-card platform-${platform.toLowerCase()}`} aria-label={`${platform} statistics`}>
    <header className="platform-heading"><h4><i />{platform === 'GitHub' ? 'Live GitHub stats' : 'LeetCode profile'} / {state.status === 'connected' ? 'Synced' : state.status === 'loading' ? 'Syncing' : 'Unavailable'}</h4><a href={profile.url} target="_blank" rel="noreferrer">View full profile <ArrowUpRight size={14} /></a></header>
    <div aria-busy={state.status === 'loading'}>{children}</div>
    {state.status === 'unavailable' && <p className="coding-unavailable" role="status">Profile sync temporarily unavailable.{state.data && ' Showing last successful sync.'}</p>}
    {state.data && <small className="coding-sync-time">Profile updated {new Date(state.data.syncedAt).toLocaleString()} / refreshes every 10 minutes</small>}
  </article>
}
export default function LiveCodingStats() {
  const [activePlatform, setActivePlatform] = useState('github')
  const github = useCodingStats('/api/github-stats')
  const leetcode = useCodingStats('/api/leetcode-stats')
  const languages = github.data?.languages
  return <section className="live-coding-stats" id="live-stats" aria-label="Live GitHub and LeetCode statistics">
    <div className="coding-platform-tabs" role="tablist" aria-label="Coding platform">
      {['github', 'leetcode'].map((platform, index) => <button
        key={platform} type="button" role="tab" id={`coding-tab-${platform}`}
        aria-selected={activePlatform === platform} aria-controls={`coding-panel-${platform}`}
        tabIndex={activePlatform === platform ? 0 : -1}
        onClick={() => setActivePlatform(platform)}
        onKeyDown={(event) => {
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - index : null
          if (next === null) return
          event.preventDefault()
          setActivePlatform(['github', 'leetcode'][next])
          event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus()
        }}><Code2 size={15} aria-hidden="true" />{platform === 'github' ? 'GitHub' : 'LeetCode'}</button>)}
    </div>
    <div className="coding-platform-panel" id="coding-panel-github" role="tabpanel" aria-labelledby="coding-tab-github" hidden={activePlatform !== 'github'} tabIndex={0}>
    <Platform platform="GitHub" state={github}>
      <dl className="coding-metrics"><Metric icon={Terminal} label="Public repos" value={github.data?.repositories} /><Metric icon={Star} label="Total stars" value={github.data?.stars} /><Metric icon={Users} label="Followers" value={github.data?.followers} /><Metric icon={UserPlus} label="Following" value={github.data?.following} /></dl>
      <div className="github-details"><ContributionTable platform="GitHub" endpoint="/api/github-activity" /><aside className="coding-languages"><h5>Top languages</h5><p className="language-note">By primary language / original repos</p><div className="language-list">{languages?.length ? languages.map((language) => <div key={language.name}><div className="language-label"><span>{language.name}</span><span>{language.repositories} {language.repositories === 1 ? 'repo' : 'repos'}</span></div><div className="language-track"><span style={{ width: `${language.repositories / languages[0].repositories * 100}%` }} /></div></div>) : <p className="coding-unavailable">{github.status === 'loading' ? 'Loading languages...' : languages ? 'No repository languages to display.' : 'Language data unavailable.'}</p>}</div><a className="coding-profile" href={portfolioData.codingProfiles.github.url} target="_blank" rel="noreferrer"><Code2 size={25} /><span><strong>{portfolioData.codingProfiles.github.username}</strong><small>Public developer profile</small></span><ArrowUpRight size={14} /></a></aside></div>
    </Platform>
    </div>
    <div className="coding-platform-panel" id="coding-panel-leetcode" role="tabpanel" aria-labelledby="coding-tab-leetcode" hidden={activePlatform !== 'leetcode'} tabIndex={0}>
    <Platform platform="LeetCode" state={leetcode}>
      <dl className="coding-metrics"><Metric icon={Sigma} label="Problems solved" value={leetcode.data?.all} /><Metric icon={Hash} label="Global rank" value={leetcode.data?.ranking} /><Metric icon={Award} label="Badges" value={leetcode.data?.badges} /><Metric icon={Code2} label="Hard problems solved" value={leetcode.data?.hard} /></dl>
      <ContributionTable platform="LeetCode" endpoint="/api/leetcode-activity" />
      <dl className="coding-difficulties">{['easy', 'medium', 'hard'].map((level) => <div key={level} className={level}><dt>{level}</dt><dd>{leetcode.data?.[level]?.toLocaleString() ?? '\u2014'}<small> solved</small></dd><div className="difficulty-track"><span style={{ width: `${leetcode.data?.all ? leetcode.data[level] / leetcode.data.all * 100 : 0}%` }} /></div></div>)}</dl>
    </Platform>
    </div>
  </section>
}
