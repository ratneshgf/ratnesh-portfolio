import { profiles, endpoint } from '../server/coding-stats.js'
import { githubDays } from '../server/contributions.js'
export default endpoint(async () => {
  const response = await fetch(`https://github.com/users/${encodeURIComponent(profiles.github.username)}/contributions`, { signal: AbortSignal.timeout(10000), headers: { 'Accept-Language': 'en-US' } })
  if (!response.ok) throw new Error('Contribution request failed')
  return { days: githubDays(await response.text()), unit: 'Contributions', period: 'Past year' }
})
