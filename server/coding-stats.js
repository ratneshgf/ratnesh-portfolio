import { portfolioData } from '../src/data/portfolioData.js'

export const profiles = portfolioData.codingProfiles
export const count = (value) => Number.isInteger(value) && value >= 0 ? value : null
export async function json(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`Upstream status ${response.status}`)
  return response.json()
}
export function endpoint(fetchStats) {
  return async (req, res) => {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
      const stats = await fetchStats()
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800')
      return res.status(200).json({ ...stats, syncedAt: new Date().toISOString() })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Coding stats unavailable:', error.message)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(503).json({ error: 'Live data temporarily unavailable' })
    }
  }
}
