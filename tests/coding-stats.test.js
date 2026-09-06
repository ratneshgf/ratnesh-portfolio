import { test } from 'node:test'
import assert from 'node:assert/strict'
import github from '../api/github-stats.js'
import leetcode from '../api/leetcode-stats.js'

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value }, status(code) { this.code = code; return this }, json(body) { this.body = body } }
}
test('coding API contracts', async (t) => {
  const original = globalThis.fetch
  t.after(() => { globalThis.fetch = original })
  await t.test('public GitHub counts and cache header', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ public_repos: 2, followers: 0, following: 1 }) })
    const res = response(); await github({ method: 'GET' }, res)
    assert.equal(res.code, 200); assert.equal(res.body.followers, 0)
    assert.match(res.headers['Cache-Control'], /s-maxage=600/)
    assert.ok(Number.isFinite(Date.parse(res.body.syncedAt)))
  })
  await t.test('missing fields do not become fabricated zeroes', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({}) })
    const res = response(); await github({ method: 'GET' }, res)
    assert.equal(res.code, 503); assert.equal(res.body.repositories, undefined)
    assert.equal(res.headers['Cache-Control'], 'no-store')
  })
  await t.test('LeetCode solved counts and optional ranking', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: { matchedUser: { profile: {}, submitStatsGlobal: { acSubmissionNum: ['All', 'Easy', 'Medium', 'Hard'].map((difficulty, i) => ({ difficulty, count: [6, 1, 2, 3][i] })) } } } }) })
    const res = response(); await leetcode({ method: 'GET' }, res)
    assert.equal(res.code, 200); assert.equal(res.body.all, 6); assert.equal(res.body.ranking, null)
  })
  await t.test('GraphQL errors return a safe unavailable response', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ errors: [{ message: 'upstream detail' }] }) })
    const res = response(); await leetcode({ method: 'GET' }, res)
    assert.equal(res.code, 503); assert.deepEqual(res.body, { error: 'Live data temporarily unavailable' })
  })
  await t.test('network errors and rate limits are handled', async () => {
    for (const handler of [github, leetcode]) {
      globalThis.fetch = async () => { throw new Error('network failure') }
      const res = response(); await handler({ method: 'GET' }, res); assert.equal(res.code, 503)
      globalThis.fetch = async () => ({ ok: false, status: 429 })
      const limited = response(); await handler({ method: 'GET' }, limited); assert.equal(limited.code, 503)
    }
  })
  await t.test('only GET requests reach upstream', async () => {
    globalThis.fetch = () => { throw new Error('must not fetch') }
    const res = response(); await github({ method: 'POST' }, res)
    assert.equal(res.code, 405); assert.equal(res.headers.Allow, 'GET')
  })
})
