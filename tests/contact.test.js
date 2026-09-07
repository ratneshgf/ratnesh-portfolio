import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createContactHandler } from '../api/contact.js'

const valid = { name: 'Test Visitor', email: 'visitor@example.com', message: 'Hello from the portfolio.' }
const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'Portfolio <contact@example.com>', CONTACT_TO_EMAIL: 'owner@example.com' }
async function request(handler, body = valid, method = 'POST', stream = false) {
  const req = stream ? Readable.from([JSON.stringify(body)]) : { body }
  Object.assign(req, { method, headers: { 'content-type': 'application/json' } })
  const res = { setHeader() {}, status(code) { this.code = code; return this }, json(data) { this.data = data; return this } }
  await handler(req, res)
  return res
}

test('sends to the configured owner, with the visitor as reply-to, for parsed and streamed bodies', async () => {
  for (const stream of [false, true]) {
    const handler = createContactHandler({ env, fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails')
      const payload = JSON.parse(options.body)
      assert.deepEqual(payload.to, ['owner@example.com'])
      assert.equal(payload.reply_to, valid.email)
      assert.ok(payload.text.includes(valid.message))
      return { ok: true, json: async () => ({ id: 'test-id' }) }
    } })
    const res = await request(handler, { ...valid, to: 'attacker@example.com' }, 'POST', stream)
    assert.equal(res.code, 200)
    assert.equal(res.data.success, true)
  }
})

test('rejects invalid inputs without calling the provider', async () => {
  const handler = createContactHandler({ env, fetchImpl: () => assert.fail('Provider must not be called') })
  for (const body of [null, { ...valid, name: ' ' }, { ...valid, name: 'Hi\r\nInjected' }, { ...valid, email: 'invalid' }, { ...valid, message: ' ' }, { ...valid, message: 'a'.repeat(5001) }, { ...valid, website: 'spam' }]) {
    assert.equal((await request(handler, body)).code, 400)
  }
  assert.equal((await request(handler, '{bad')).code, 400)
  assert.equal((await request(handler, valid, 'GET')).code, 405)
  assert.equal((await request(handler, { ...valid, message: 'a'.repeat(25000) })).code, 413)
})

test('missing configuration and provider failures never report success or leak secrets', async () => {
  assert.equal((await request(createContactHandler({ env: {} }))).code, 503)
  for (const fetchImpl of [async () => ({ ok: false, json: async () => ({ error: 'secret provider details' }) }), async () => ({ ok: true, json: async () => ({}) }), async () => { throw new Error('secret-key') }]) {
    const res = await request(createContactHandler({ env, fetchImpl }))
    assert.equal(res.code, 502)
    assert.equal(res.data.success, undefined)
    assert.ok(!JSON.stringify(res.data).includes('secret'))
  }
})
