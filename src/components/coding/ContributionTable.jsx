import useCodingStats from './useCodingStats'

export default function ContributionTable({ platform, endpoint }) {
  const { data, status } = useCodingStats(endpoint)
  const activeDays = data?.days.filter((day) => day.count > 0) || []
  const recent = activeDays.slice(-10).reverse()
  return <div className="coding-contributions">
    <h5>{platform} contribution activity</h5>
    {status === 'loading' && <div className="coding-skeleton" role="status" aria-label="Loading contribution activity"><i /><i /></div>}
    {status === 'unavailable' && <p className="coding-unavailable">Activity temporarily unavailable.{data && ' Showing last successful sync.'}</p>}
    {data && <>
      <p>{data.period} ? {data.days.reduce((sum, day) => sum + day.count, 0).toLocaleString()} {data.unit.toLowerCase()} ? {activeDays.length} active days</p>
      <div className="coding-table-scroll"><table><caption>Latest 10 active days ? dates in UTC</caption><thead><tr><th scope="col">Date</th><th scope="col">{data.unit}</th></tr></thead><tbody>{recent.length ? recent.map((day) => <tr key={day.date}><th scope="row"><time dateTime={day.date}>{day.date}</time></th><td><span className="coding-activity-bar" style={{ width: `${Math.max(3, day.count / Math.max(...recent.map((item) => item.count)) * 60)}%` }} aria-hidden="true" />{day.count.toLocaleString()}</td></tr>) : <tr><td colSpan="2">No activity recorded in this period.</td></tr>}</tbody></table></div>
      <small className="coding-sync-time">LAST SYNC: <time dateTime={data.syncedAt}>{new Date(data.syncedAt).toLocaleString()}</time></small>
    </>}
  </div>
}
