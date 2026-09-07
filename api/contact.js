import { portfolioData } from '../src/data/portfolioData.js'

const maxBytes = 24000

export function createContactHandler({ env = process.env, fetchImpl = fetch } = {}) {
  return async function contact(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method not allowed.' })
    }
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return res.status(415).json({ error: 'Expected JSON.' })
    let body
    try {
      if (req.body !== undefined) {
        const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
        if (Buffer.byteLength(raw) > maxBytes) return res.status(413).json({ error: 'Message is too large.' })
        body = JSON.parse(raw)
      } else {
        const chunks = []
        let size = 0
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk)
          if (size > maxBytes) return res.status(413).json({ error: 'Message is too large.' })
          chunks.push(Buffer.from(chunk))
        }
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      }
    } catch {
      return res.status(400).json({ error: 'Invalid request body.' })
    }
    const { name, email, message, website } = body || {}
    if (website) return res.status(400).json({ error: 'Unable to submit this form.' })
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || /[\r\n]/.test(name)
      || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || typeof message !== 'string' || !message.trim() || message.length > 5000) {
      return res.status(400).json({ error: 'Please provide a valid name, email, and message (up to 5,000 characters).' })
    }
    if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) return res.status(503).json({ error: 'Message delivery is not configured yet. Please email me directly.' })
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [env.CONTACT_TO_EMAIL || portfolioData.personal.email],
          reply_to: email.trim(),
          subject: `Portfolio message from ${name.trim()}`,
          text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
        }),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json()
      if (!response.ok || !result.id) throw new Error('Email provider rejected the message')
      return res.status(200).json({ success: true })
    } catch {
      return res.status(502).json({ error: 'Unable to confirm sending. Please try again or email me directly.' })
    }
  }
}

export default createContactHandler()
