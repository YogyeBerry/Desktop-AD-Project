import { Activity, Clock3, Target } from 'lucide-react'
import { useLearning } from '../context/useLearning'
import { formatDuration, getPathProgress } from '../data/sampleData'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Analytics() {
  const { learningPaths, studySessions } = useLearning()
  const topics = learningPaths.flatMap((path) => path.topics)
  const completedTopics = topics.filter((topic) => topic.completed).length
  const totalMinutes = studySessions.reduce((total, session) => total + session.durationMinutes, 0)
  const averageMinutes = studySessions.length ? Math.round(totalMinutes / studySessions.length) : 0
  const weekDates = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']
  const weeklyData = weekDays.map((day, index) => {
    const date = weekDates[index]
    const minutes = studySessions.filter((session) => session.date === date).reduce((total, session) => total + session.durationMinutes, 0)
    return { day, minutes }
  })
  const maxMinutes = Math.max(...weeklyData.map((item) => item.minutes), 1)
  const pathMinutes = learningPaths.map((path) => ({
    ...path,
    minutes: studySessions.filter((session) => path.topics.some((topic) => topic.id === session.topicId)).reduce((total, session) => total + session.durationMinutes, 0),
  }))
  const maxPathMinutes = Math.max(...pathMinutes.map((item) => item.minutes), 1)
  const comparisons = learningPaths.flatMap((path) => path.topics.map((topic) => ({
    topic,
    path,
    actual: studySessions.filter((session) => session.topicId === topic.id).reduce((total, session) => total + session.durationMinutes, 0),
  }))).filter((item) => item.actual > 0).slice(0, 4)

  return (
    <>
      <PageHeader eyebrow="YOUR PROGRESS" title="Study analytics" description="A thoughtful look at your learning habits. These insights use sample data for now." action={<span className="sample-tag"><span /> SAMPLE DATA</span>} />
      <div className="analytics-stats">
        <MetricCard label="Total study time" value={formatDuration(totalMinutes)} helper="Across your sample sessions" icon={<Clock3 />} />
        <MetricCard label="Topics completed" value={`${completedTopics} / ${topics.length}`} helper={topics.length ? `${Math.round(completedTopics / topics.length * 100)}% of all topics` : 'No topics yet'} icon={<Target />} />
        <MetricCard label="Average session" value={formatDuration(averageMinutes)} helper="Per study session" icon={<Activity />} />
      </div>
      <div className="analytics-grid">
        <Card className="chart-card weekly-chart">
          <div className="section-heading"><div><h2>Weekly study time</h2><p>Your focused minutes over the last sample week</p></div><span className="chart-legend"><i /> Study time</span></div>
          {studySessions.length ? <div className="bar-chart" role="img" aria-label="Bar chart of study minutes by weekday">
            {weeklyData.map(({ day, minutes }) => <div className="bar-column" key={day}><span className="bar-value">{minutes || ''}</span><div className="bar-track"><div className={`bar-fill${day === 'Fri' ? ' bar-highlight' : ''}`} style={{ height: `${Math.max(minutes ? (minutes / maxMinutes) * 100 : 0, 3)}%` }} title={`${day}: ${minutes} minutes`} /></div><span className="bar-day">{day}</span></div>)}
          </div> : <EmptyState title="No study sessions yet" description="Study time will appear here when you start a session." />}
        </Card>
        <Card className="chart-card path-time-chart">
          <div className="section-heading"><div><h2>Study time by path</h2><p>Where your attention is going</p></div></div>
          {pathMinutes.length ? <div className="path-time-list">{pathMinutes.map((path) => <div className="path-time-row" key={path.id}><div className="path-time-label"><strong>{path.title}</strong><span>{formatDuration(path.minutes)}</span></div><ProgressBar value={(path.minutes / maxPathMinutes) * 100} label={`${path.title} study time`} /></div>)}</div> : <EmptyState title="No paths to compare" description="Create a learning path to see your time by subject." />}
        </Card>
        <Card className="chart-card completion-summary">
          <div className="section-heading"><div><h2>Learning path completion</h2><p>Progress across your learning goals</p></div></div>
          {learningPaths.length ? <div className="completion-list">{learningPaths.map((path) => <div className="completion-row" key={path.id}><div><strong>{path.title}</strong><span>{path.topics.filter((topic) => topic.completed).length} of {path.topics.length} topics complete</span></div><strong className="completion-percent">{getPathProgress(path)}%</strong><ProgressBar value={getPathProgress(path)} label={`${path.title} completion`} /></div>)}</div> : <EmptyState title="No learning paths yet" description="Your learning path progress will be summarized here." />}
        </Card>
        <Card className="chart-card estimate-chart">
          <div className="section-heading"><div><h2>Estimated vs. actual</h2><p>Completed study sessions with a recorded estimate</p></div></div>
          {comparisons.length ? <>
            <div className="comparison-legend"><span><i className="legend-estimate" /> Estimated</span><span><i className="legend-actual" /> Actual</span></div>
            <div className="comparison-list">{comparisons.map(({ topic, path, actual }) => {
              const max = Math.max(topic.estimatedMinutes, actual, 1)
              return <div className="comparison-row" key={topic.id}><div className="comparison-label"><strong>{topic.title}</strong><small>{path.title}</small></div><div className="comparison-bars"><span className="comparison-track"><i className="estimate-fill" style={{ width: `${topic.estimatedMinutes / max * 100}%` }} /></span><span className="comparison-track"><i className="actual-fill" style={{ width: `${actual / max * 100}%` }} /></span></div><div className="comparison-values"><span>{topic.estimatedMinutes}m</span><span>{actual}m</span></div></div>
            })}</div>
          </> : <EmptyState title="No session comparisons" description="Estimated and actual study time will appear when sample sessions are available." />}
        </Card>
      </div>
      <p className="analytics-footnote">Analytics are illustrative sample data and are not a record of your actual study activity.</p>
    </>
  )
}

function MetricCard({ label, value, helper, icon }) {
  return <Card className="metric-card"><span className="metric-icon">{icon}</span><p>{label}</p><strong>{value}</strong><small>{helper}</small></Card>
}
