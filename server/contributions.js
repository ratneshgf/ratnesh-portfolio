export function githubDays(html) {
  const tips = new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map((match) => [match[1].match(/for="([^"]+)"/)?.[1], match[2].trim()]))
  const days = [...html.matchAll(/<td\b[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)].map((match) => {
    const id = match[0].match(/id="([^"]+)"/)?.[1]
    const label = tips.get(id) || ''
    const value = label.startsWith('No contributions') ? 0 : Number(label.match(/^([\d,]+) contributions?/)?.[1]?.replaceAll(',', ''))
    if (!Number.isInteger(value) || value < 0) throw new Error('Unrecognized contribution data')
    return { date: match[1], count: value }
  }).sort((a, b) => a.date.localeCompare(b.date))
  if (!days.length) throw new Error('Contribution calendar unavailable')
  return days
}
export function leetcodeDays(raw) {
  const calendar = JSON.parse(raw)
  if (!calendar || Array.isArray(calendar) || typeof calendar !== 'object') throw new Error('Invalid submission calendar')
  return Object.entries(calendar).map(([timestamp, count]) => {
    const date = new Date(Number(timestamp) * 1000)
    if (!Number.isFinite(date.getTime()) || !Number.isInteger(count) || count < 0) throw new Error('Invalid activity day')
    return { date: date.toISOString().slice(0, 10), count }
  }).sort((a, b) => a.date.localeCompare(b.date))
}
