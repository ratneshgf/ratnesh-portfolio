import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import githubActivity from './api/github-activity.js'
import leetcodeActivity from './api/leetcode-activity.js'
import githubStats from './api/github-stats.js'
import leetcodeStats from './api/leetcode-stats.js'

// Use the same handlers locally as Vercel uses in production.
function codingStatsApi() {
  const install = (server) => {
    server.middlewares.use((req, res, next) => {
      const handler = { '/api/github-activity': githubActivity, '/api/leetcode-activity': leetcodeActivity, '/api/github-stats': githubStats, '/api/leetcode-stats': leetcodeStats }[req.url?.split('?')[0]]
      if (!handler) return next()
      res.status = (code) => { res.statusCode = code; return res }
      res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
      return handler(req, res)
    })
  }
  return { name: 'coding-stats-api', configureServer: install, configurePreviewServer: install }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), codingStatsApi()],
})
