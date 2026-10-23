import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock3, Play } from 'lucide-react'
import { useLearning } from '../context/useLearning'
import { formatDuration, getPathProgress, getPathStatus } from '../data/sampleData'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'
import NotFound from './NotFound'

export default function LearningPathDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { learningPaths } = useLearning()
  const path = learningPaths.find((item) => item.id === id)
  if (!path) return <NotFound compact />

  const completed = path.topics.filter((topic) => topic.completed).length
  const progress = getPathProgress(path)
  const nextTopic = path.topics.find((topic) => !topic.completed)

  return (
    <>
      <button className="back-link" type="button" onClick={() => navigate('/learning-paths')}><ArrowLeft size={16} /> Back to learning paths</button>
      <PageHeader eyebrow="LEARNING PATH" title={path.title} description={path.description || 'A learning path ready for your next goal.'} action={nextTopic && <Button onClick={() => navigate(`/topics/${nextTopic.id}`)}><Play size={15} /> Continue learning</Button>} />
      <Card className="path-overview-card">
        <div className="overview-progress-copy"><div><span className="eyebrow">YOUR PROGRESS</span><div className="overview-percent">{progress}<span>%</span></div></div><StatusBadge status={getPathStatus(path)} /></div>
        <ProgressBar value={progress} label={`${path.title} progress`} />
        <div className="overview-stats"><div><strong>{completed} <span>/ {path.topics.length}</span></strong><small>Topics completed</small></div><div><strong>{path.topics.length}</strong><small>Total topics</small></div><div><strong>{formatDuration(path.estimatedMinutes)}</strong><small>Estimated duration</small></div></div>
      </Card>
      <div className="section-heading topic-list-heading"><div><h2>Topics in this path</h2><p>Move through each topic at your own pace</p></div><span className="topic-count">{path.topics.length} topics</span></div>
      {path.topics.length ? (
        <div className="topic-list">
          {path.topics.map((topic, index) => (
            <Card className="topic-row" key={topic.id}>
              <span className={`topic-number${topic.completed ? ' topic-done' : ''}`}>{topic.completed ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</span>
              <div className="topic-row-content"><Link to={`/topics/${topic.id}`} className="card-title-link">{topic.title}</Link><p>{topic.description}</p><div className="topic-row-meta"><Clock3 size={14} /> {formatDuration(topic.estimatedMinutes)} <span>·</span> {topic.completed ? 'Completed' : 'Not completed'}</div></div>
              <Link className="round-arrow" to={`/topics/${topic.id}`} aria-label={`Open ${topic.title}`}><ArrowRight size={17} /></Link>
            </Card>
          ))}
        </div>
      ) : <Card><EmptyState title="No topics in this path yet" description="This path is ready for topics. You can add them in a future update." action={<Button type="button" variant="secondary" onClick={() => navigate('/learning-paths')}>Back to paths</Button>} /></Card>}
    </>
  )
}
