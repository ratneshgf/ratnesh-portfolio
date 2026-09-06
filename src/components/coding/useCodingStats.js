import { useEffect, useState } from 'react'

const cache = new Map()
const pending = new Map()
const refreshMs = 10 * 60 * 1000
async function request(url) {
  const saved = cache.get(url)
  if (saved && Date.now() - saved.receivedAt < refreshMs) return saved.data
  if (!pending.has(url)) {
    pending.set(url, fetch(url, { signal: AbortSignal.timeout(15000) }).then(async (response) => {
      if (!response.ok) throw new Error(`Stats request failed: ${response.status}`)
      const data = await response.json()
      if (!Number.isFinite(Date.parse(data.syncedAt))) throw new Error('Invalid sync timestamp')
      cache.set(url, { data, receivedAt: Date.now() })
      return data
    }).finally(() => pending.delete(url)))
  }
  return pending.get(url)
}
export default function useCodingStats(url) {
  const [state, setState] = useState({ data: null, status: 'loading' })
  useEffect(() => {
    let active = true
    async function update() {
      try {
        const data = await request(url)
        if (active) setState({ data, status: 'connected' })
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Live coding stats:', error.message)
        if (active) setState((previous) => ({ data: previous.data, status: 'unavailable' }))
      }
    }
    update()
    const timer = setInterval(update, refreshMs)
    return () => { active = false; clearInterval(timer) }
  }, [url])
  return state
}
