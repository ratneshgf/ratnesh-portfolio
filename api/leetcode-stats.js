import { profiles, count, json, endpoint } from '../server/coding-stats.js'

// LeetCode's public profile GraphQL endpoint may change or throttle requests.
// Fail closed when it cannot return a complete solved-count breakdown.
export default endpoint(async () => {
  if (!profiles.leetcode.username) throw new Error('Profile not configured')
  const result = await json('https://leetcode.com/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'portfolio-coding-stats' },
    body: JSON.stringify({
      query: 'query Stats($username: String!) { matchedUser(username: $username) { profile { ranking } submitStatsGlobal { acSubmissionNum { difficulty count } } } }',
      variables: { username: profiles.leetcode.username },
    }),
  })
  const user = result.data?.matchedUser
  if (result.errors || !user) throw new Error('LeetCode profile unavailable')
  const rows = user.submitStatsGlobal?.acSubmissionNum
  if (!Array.isArray(rows)) throw new Error('Invalid LeetCode response')
  const solved = Object.fromEntries(['All', 'Easy', 'Medium', 'Hard'].map((difficulty) => [difficulty.toLowerCase(), count(rows.find((row) => row.difficulty === difficulty)?.count)]))
  if (Object.values(solved).some((value) => value === null) || solved.all !== solved.easy + solved.medium + solved.hard) throw new Error('Incomplete LeetCode counts')
  return { ...solved, ranking: count(user.profile?.ranking) }
})
