import { profiles, endpoint, json } from '../server/coding-stats.js'
import { leetcodeDays } from '../server/contributions.js'
export default endpoint(async () => {
  const response = await json('https://leetcode.com/graphql/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'query Calendar($username: String!) { matchedUser(username: $username) { userCalendar { submissionCalendar } } }', variables: { username: profiles.leetcode.username } }),
  })
  if (response.errors) throw new Error('Submission calendar unavailable')
  return { days: leetcodeDays(response.data?.matchedUser?.userCalendar?.submissionCalendar), unit: 'Submissions', period: 'Current calendar year' }
})
