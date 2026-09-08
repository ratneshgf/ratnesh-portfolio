import { profiles, endpoint, json } from '../server/coding-stats.js'
import { leetcodeDays } from '../server/contributions.js'
export default endpoint(async () => {
  const year = new Date().getUTCFullYear()
  const calendars = await Promise.all([year - 1, year].map(async (year) => {
    const response = await json('https://leetcode.com/graphql/', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'portfolio-coding-stats' },
      body: JSON.stringify({ query: 'query Calendar($username: String!, $year: Int!) { matchedUser(username: $username) { userCalendar(year: $year) { submissionCalendar } } }', variables: { username: profiles.leetcode.username, year } }),
    })
    if (response.errors) throw new Error('Submission calendar unavailable')
    return leetcodeDays(response.data?.matchedUser?.userCalendar?.submissionCalendar)
  }))
  const days = [...new Map(calendars.flat().map((day) => [day.date, day])).values()].sort((a, b) => a.date.localeCompare(b.date))
  return { days, unit: 'Submissions', period: 'Past 365 days' }
})
