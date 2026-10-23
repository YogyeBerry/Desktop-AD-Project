import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, ExternalLink, FileText, Play, RotateCcw } from 'lucide-react'
import { useLearning } from '../context/useLearning'
import { formatDuration } from '../data/sampleData'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import NotFound from './NotFound'

const resourceIcons = { PDF: FileText, Document: FileText, Video: Play, Website: ExternalLink }

export default function TopicStudy() {
  const { topicId } = useParams()
  const { learningPaths, resources, toggleTopicComplete } = useLearning()
  const path = learningPaths.find((item) => item.topics.some((topic) => topic.id === topicId))
  const topicIndex = path?.topics.findIndex((topic) => topic.id === topicId) ?? -1
  const topic = path?.topics[topicIndex]
  if (!path || !topic) return <NotFound compact />

  const topicResources = resources.filter((resource) => resource.topicId === topic.id)
  const previousTopic = path.topics[topicIndex - 1]
  const nextTopic = path.topics[topicIndex + 1]

  return (
    <>
      <Link className="back-link" to={`/learning-paths/${path.id}`}><ArrowLeft size={16} /> {path.title}</Link>
      <div className="study-layout">
        <div className="study-main">
          <div className="study-eyebrow"><BookOpen size={15} /> {path.title} <span>/</span> Topic {topicIndex + 1} of {path.topics.length}</div>
          <h1 className="study-title">{topic.title}</h1>
          <p className="study-description">{topic.description}</p>
          <Card className="study-content-card">
            <span className="content-label">TODAY'S FOCUS</span>
            <h2>Make this time yours.</h2>
            <p>Work through this topic at a pace that feels right. Take notes, explore the resources, and come back whenever you need a refresher.</p>
            <div className="study-session-placeholder"><span className="session-play"><Play size={18} fill="currentColor" /></span><span><strong>Study session</strong><small>Timer and session tracking coming in a future phase</small></span><span className="session-duration"><Clock3 size={14} /> {formatDuration(topic.estimatedMinutes)}</span></div>
          </Card>
          <div className="topic-navigation">
            {previousTopic ? <Link className="button button-secondary" to={`/topics/${previousTopic.id}`}><ArrowLeft size={15} /> Previous topic</Link> : <span />}
            {nextTopic && <Link className="button button-secondary" to={`/topics/${nextTopic.id}`}>Next topic <ArrowRight size={15} /></Link>}
          </div>
        </div>
        <aside className="study-aside">
          <Card className="completion-card">
            <div className={`completion-symbol${topic.completed ? ' complete' : ''}`}>{topic.completed ? <Check size={19} /> : <BookOpen size={19} />}</div>
            <h2>{topic.completed ? 'Topic completed' : 'Ready when you are'}</h2>
            <p>{topic.completed ? 'You can revisit this topic or mark it incomplete to study again.' : 'Mark this topic complete when you feel good about what you learned.'}</p>
            <Button className="full-width" variant={topic.completed ? 'secondary' : 'primary'} onClick={() => toggleTopicComplete(topic.id)}>{topic.completed ? <><RotateCcw size={16} /> Mark incomplete</> : <><Check size={16} /> Mark complete</>}</Button>
            <div className="completion-time"><Clock3 size={15} /> Estimated time <strong>{formatDuration(topic.estimatedMinutes)}</strong></div>
          </Card>
          <Card className="resources-card">
            <div className="section-heading compact-heading"><div><h2>Resources</h2><p>Helpful material for this topic</p></div></div>
            {topicResources.length ? topicResources.map((resource) => {
              const Icon = resourceIcons[resource.type] ?? FileText
              return <div className="study-resource" key={resource.id}><span className="resource-icon"><Icon size={16} /></span><span><strong>{resource.title}</strong><small>{resource.type}</small></span>{resource.url ? <a className="icon-button" href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${resource.title} in a new tab`}><ExternalLink size={15} /></a> : <span className="resource-coming">Saved</span>}</div>
            }) : <EmptyState title="No resources yet" description="Resources for this topic will appear here." />}
          </Card>
        </aside>
      </div>
    </>
  )
}
