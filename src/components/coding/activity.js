export function activitySummary(rawDays, now = new Date()) {
  const end = new Date(now)
  end.setUTCHours(0, 0, 0, 0)
  const counts = new Map(rawDays.map((day) => [day.date, day.count]))
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(end)
    date.setUTCDate(date.getUTCDate() - 364 + index)
    const key = date.toISOString().slice(0, 10)
    return { date: key, count: counts.get(key) || 0 }
  })
  let longest = 0, run = 0
  for (const day of days) { run = day.count > 0 ? run + 1 : 0; longest = Math.max(longest, run) }
  let current = 0
  for (let index = days.length - (days.at(-1).count ? 1 : 2); index >= 0 && days[index].count > 0; index--) current++
  return { days, current, longest, active: days.filter((day) => day.count > 0).length, total: days.reduce((sum, day) => sum + day.count, 0) }
}
