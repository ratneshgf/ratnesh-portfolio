import { profiles, count, json, endpoint } from '../server/coding-stats.js'

export default endpoint(async () => {
  const user = await json(`https://api.github.com/users/${encodeURIComponent(profiles.github.username)}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-coding-stats' },
  })
  const stats = { repositories: count(user.public_repos), followers: count(user.followers), following: count(user.following) }
  if (Object.values(stats).some((value) => value === null)) throw new Error('Invalid GitHub response')
  let stars = null
  let languages = null
  try {
    const repositories = []
    for (let page = 1; ; page++) {
      const rows = await json(`https://api.github.com/users/${encodeURIComponent(profiles.github.username)}/repos?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-coding-stats' },
      })
      if (!Array.isArray(rows)) throw new Error('Invalid repository response')
      repositories.push(...rows)
      if (rows.length < 100) break
    }
    if (repositories.some((repo) => count(repo.stargazers_count) === null)) throw new Error('Invalid star count')
    stars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totals = new Map()
    repositories.filter((repo) => !repo.fork && repo.language).forEach((repo) => totals.set(repo.language, (totals.get(repo.language) || 0) + 1))
    languages = [...totals].map(([name, repositories]) => ({ name, repositories })).sort((a, b) => b.repositories - a.repositories).slice(0, 5)
  } catch { /* Basic profile counts remain useful when repository data is unavailable. */ }
  return { ...stats, stars, languages }
})
