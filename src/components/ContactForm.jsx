import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactForm({ email }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    if (!payload.name.trim() || !payload.message.trim()) {
      setStatus('error')
      setError('Please enter your name and message.')
      return
    }
    submitting.current = true
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      })
      const result = await response.json()
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Unable to send your message. Please try again or email me directly.')
      form.reset()
      setStatus('sent')
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof SyntaxError || cause instanceof TypeError || cause.name === 'TimeoutError'
        ? 'Could not confirm sending. Your message is saved here; please try again or email me directly.'
        : cause.message)
    } finally {
      submitting.current = false
    }
  }

  return <form className="contact-form" onSubmit={handleSubmit} aria-busy={status === 'sending'}>
    <div className="form-terminal">secure terminal · open channel</div>
    <label>Name<input required name="name" autoComplete="name" maxLength={100} placeholder="your name" disabled={status === 'sending'} /></label>
    <label>Email<input required type="email" name="email" autoComplete="email" maxLength={254} placeholder="you@company.com" disabled={status === 'sending'} /></label>
    <label>Message<textarea required name="message" maxLength={5000} rows="4" placeholder="tell me about your idea..." disabled={status === 'sending'} /></label>
    <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <button className="button button-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send transmission'} <Send size={15} /></button>
    <small data-status={status} role="status" aria-live="polite">{status === 'sent' ? 'Thanks! Your message has been submitted.' : status === 'error' ? error : 'Have an idea? Send me a message.'} <a href={`mailto:${email}`}>Email me directly</a></small>
  </form>
}
