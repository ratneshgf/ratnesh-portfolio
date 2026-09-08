import useCodingStats from './useCodingStats'
import { activitySummary } from './activity'

export default function ContributionTable({ platform, endpoint }) {
  const { data, status } = useCodingStats(endpoint)
  const summary = data ? activitySummary(data.days, new Date(data.syncedAt)) : null
  const offset = summary ? new Date(`${summary.days[0].date}T00:00:00Z`).getUTCDay() : 0
  const cells = summary ? [...Array(offset).fill(null), ...summary.days] : []
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7))
  const max = Math.max(1, ...(summary?.days.map((day) => day.count) || []))
  const level = (count) => count === 0 ? 0 : Math.min(4, Math.ceil(count / max * 4))
  return <div className="coding-contributions" aria-busy={status === 'loading'}>
    <header className="activity-heading"><h5>{platform === 'GitHub' ? 'GitHub contributions' : 'LeetCode submissions'} (365 days)</h5><span className={`coding-status ${status === 'connected' ? 'is-online' : ''}`} role="status"><i />{status === 'connected' ? 'Live data / synced' : status === 'loading' ? 'Syncing activity' : data ? 'Sync unavailable / last saved data' : 'Live sync unavailable'}</span></header>
    <dl className="activity-metrics">{[['Current streak', summary?.current], ['Longest streak', summary?.longest], ['Active days', summary?.active], ['Yearly activity', summary?.total]].map(([label, value]) => <div key={label}><dd>{value?.toLocaleString() ?? '\u2014'}</dd><dt>{label}</dt></div>)}</dl>
    <div className="activity-calendar" tabIndex={0} aria-label={`${platform} daily activity, dates in UTC. Scroll horizontally for the full year.`}>
      {summary ? <div className="calendar-inner"><div className="calendar-day-labels"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="calendar-weeks">{weeks.map((week, index) => {
        const monthDay = week.find((day) => day && (day.date.endsWith('-01') || day === summary.days[0]))
        return <div className="calendar-week" key={index}><span className="calendar-month">{monthDay && new Date(`${monthDay.date}T00:00:00Z`).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' })}</span>{week.map((day, row) => day ? <span key={day.date} className="calendar-cell" data-level={level(day.count)} title={`${day.date}: ${day.count} ${data.unit.toLowerCase()}`} role="img" aria-label={`${day.date}: ${day.count} ${data.unit.toLowerCase()}`} /> : <span key={`blank-${row}`} />)}</div>
      })}</div></div> : <p className="calendar-empty">{status === 'loading' ? 'Loading your contribution calendar...' : 'Activity is temporarily unavailable. Please check the full profile.'}</p>}
    </div>
    <footer className="activity-footer"><span>{data ? <>Updated <time dateTime={data.syncedAt}>{new Date(data.syncedAt).toLocaleString()}</time> / UTC dates</> : 'Waiting for platform data'}</span><span className="calendar-legend">Less {[0, 1, 2, 3, 4].map((value) => <i key={value} className="calendar-cell" data-level={value} />)} More</span></footer>
  </div>
}
