import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activitySummary } from '../src/components/coding/activity.js'

test('yearly activity fills missing dates and excludes older and future activity', () => {
  const result = activitySummary([{ date: '2025-01-01', count: 50 }, { date: '2026-09-07', count: 3 }, { date: '2026-09-09', count: 20 }], new Date('2026-09-08T12:00:00Z'))
  assert.equal(result.days.length, 365)
  assert.equal(result.total, 3)
  assert.equal(result.active, 1)
  assert.equal(result.current, 1)
})
test('streak includes yesterday before today has activity and resets after a gap', () => {
  const days = [{ date: '2026-09-05', count: 1 }, { date: '2026-09-06', count: 2 }, { date: '2026-09-07', count: 1 }]
  assert.equal(activitySummary(days, new Date('2026-09-08')).current, 3)
  const later = activitySummary(days, new Date('2026-09-09'))
  assert.equal(later.current, 0)
  assert.equal(later.longest, 3)
  assert.equal(activitySummary([], new Date('2026-09-08')).total, 0)
})
