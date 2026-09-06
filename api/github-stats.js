import { profiles, count, json, endpoint } from '../server/coding-stats.js'

export default endpoint(async () => {
  const user = await json(`https://api.github.com/users/${encodeURIComponent(profiles.github.username)}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-coding-stats' },
  })
  const stats = { repositories: count(user.public_repos), followers: count(user.followers), following: count(user.following) }
  if (Object.values(stats).some((value) => value === null)) throw new Error('Invalid GitHub response')
  return stats
})
