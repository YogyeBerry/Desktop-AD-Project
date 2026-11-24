import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  History,
} from 'lucide-react';
import { useLearning } from '../context/useLearning';
import { formatDuration } from '../data/sampleData';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StudyTimer from '../components/StudyTimer';
import NotFound from './NotFound';

const resourceIcons = { PDF: FileText, DOCUMENT: FileText, Document: FileText, VIDEO: Play, Video: Play, WEBSITE: ExternalLink, Website: ExternalLink };

export default function TopicStudy() {
  const { topicId } = useParams();
  const {
    learningPaths,
    resources,
    studySessions,
    toggleTopicComplete,
    addResource,
    deleteResource,
    recordStudySession,
  } = useLearning();

  const [addResourceModal, setAddResourceModal] = useState(false);
  const [resourceSubmitting, setResourceSubmitting] = useState(false);

  const path = learningPaths.find((item) => item.topics.some((topic) => topic.id === topicId));
  const topicIndex = path?.topics.findIndex((topic) => topic.id === topicId) ?? -1;
  const topic = path?.topics[topicIndex];

  if (!path || !topic) return <NotFound compact />;

  const topicResources = resources.filter((resource) => resource.topicId === topic.id);
  const topicSessions = studySessions.filter((session) => session.topicId === topic.id);
  const totalActualMinutes = topicSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const previousTopic = path.topics[topicIndex - 1];
  const nextTopic = path.topics[topicIndex + 1];

  async function handleAddResource(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const type = formData.get('type') || 'WEBSITE';
    const url = formData.get('url');

    setResourceSubmitting(true);
    try {
      await addResource(topic.id, {
        title,
        type,
        url: url ? String(url).trim() : null,
      });
      setAddResourceModal(false);
    } catch (err) {
      alert(`Failed to add resource: ${err.message}`);
    } finally {
      setResourceSubmitting(false);
    }
  }

  async function handleDeleteResource(resourceId, resourceTitle) {
    if (window.confirm(`Remove resource "${resourceTitle}"?`)) {
      try {
        await deleteResource(resourceId);
      } catch (err) {
        alert(`Failed to remove resource: ${err.message}`);
      }
    }
  }

  function handleOpenLink(e, url) {
    if (!url) return;
    if (window.electronAPI?.openExternal) {
      e.preventDefault();
      window.electronAPI.openExternal(url);
    }
  }

  return (
    <>
      <Link className="back-link" to={`/learning-paths/${path.id}`}>
        <ArrowLeft size={16} /> {path.title}
      </Link>

      <div className="study-layout">
        <div className="study-main">
          <div className="study-eyebrow">
            <BookOpen size={15} /> {path.title} <span>/</span> Topic {topicIndex + 1} of {path.topics.length}
          </div>
          <h1 className="study-title">{topic.title}</h1>
          <p className="study-description">{topic.description}</p>

          {/* Active Persistent Timestamp-based Study Timer */}
          <StudyTimer
            topicId={topic.id}
            estimatedMinutes={topic.estimatedMinutes}
            onSessionSaved={(sessionData) => recordStudySession(topic.id, sessionData)}
          />

          <Card className="study-content-card">
            <span className="content-label">TODAY'S FOCUS</span>
            <h2>Make this time yours.</h2>
            <p>
              Work through this topic at a pace that feels right. Take notes, explore the resources, and track your
              focused minutes.
            </p>
            <div className="topic-meta-stats">
              <div className="topic-meta-item">
                <Clock3 size={15} />
                <span>Estimated: <strong>{formatDuration(topic.estimatedMinutes)}</strong></span>
              </div>
              <div className="topic-meta-item">
                <History size={15} />
                <span>Actual study time: <strong>{formatDuration(totalActualMinutes)}</strong></span>
              </div>
            </div>
          </Card>

          {/* Past study sessions for this topic */}
          {topicSessions.length > 0 && (
            <Card className="study-history-card">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Recorded Study Sessions</h2>
                  <p>{topicSessions.length} sessions logged for this topic</p>
                </div>
              </div>
              <div className="study-sessions-list">
                {topicSessions.map((session, idx) => (
                  <div className="study-session-item" key={session.id || idx}>
                    <div className="session-left">
                      <Calendar size={14} />
                      <span>{session.date || (session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Recent')}</span>
                    </div>
                    <div className="session-right">
                      <strong>{formatDuration(session.durationMinutes)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="topic-navigation">
            {previousTopic ? (
              <Link className="button button-secondary" to={`/topics/${previousTopic.id}`}>
                <ArrowLeft size={15} /> Previous topic
              </Link>
            ) : (
              <span />
            )}
            {nextTopic && (
              <Link className="button button-secondary" to={`/topics/${nextTopic.id}`}>
                Next topic <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>

        <aside className="study-aside">
          <Card className="completion-card">
            <div className={`completion-symbol${topic.completed ? ' complete' : ''}`}>
              {topic.completed ? <Check size={19} /> : <BookOpen size={19} />}
            </div>
            <h2>{topic.completed ? 'Topic completed' : 'Ready when you are'}</h2>
            <p>
              {topic.completed
                ? 'You can revisit this topic or mark it incomplete to study again.'
                : 'Mark this topic complete when you feel good about what you learned.'}
            </p>
            <Button
              className="full-width"
              variant={topic.completed ? 'secondary' : 'primary'}
              onClick={() => toggleTopicComplete(topic.id)}
            >
              {topic.completed ? (
                <>
                  <RotateCcw size={16} /> Mark incomplete
                </>
              ) : (
                <>
                  <Check size={16} /> Mark complete
                </>
              )}
            </Button>
            <div className="completion-time">
              <Clock3 size={15} /> Estimated time <strong>{formatDuration(topic.estimatedMinutes)}</strong>
            </div>
          </Card>

          <Card className="resources-card">
            <div className="section-heading compact-heading">
              <div>
                <h2>Resources</h2>
                <p>Helpful material for this topic</p>
              </div>
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => setAddResourceModal(true)}
                title="Add resource to this topic"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {topicResources.length ? (
              topicResources.map((resource) => {
                const Icon = resourceIcons[resource.type] ?? FileText;
                return (
                  <div className="study-resource" key={resource.id}>
                    <span className="resource-icon">
                      <Icon size={16} />
                    </span>
                    <span className="resource-info">
                      <strong>{resource.title}</strong>
                      <small>{resource.type}</small>
                    </span>
                    <div className="resource-actions">
                      {resource.url ? (
                        <a
                          className="icon-button"
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleOpenLink(e, resource.url)}
                          aria-label={`Open ${resource.title}`}
                        >
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        <span className="resource-coming">Saved</span>
                      )}
                      <button
                        type="button"
                        className="icon-button delete-res-btn"
                        onClick={() => handleDeleteResource(resource.id, resource.title)}
                        title="Delete resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No resources yet"
                description="Attach learning materials or links to this topic."
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    className="button-sm"
                    onClick={() => setAddResourceModal(true)}
                  >
                    <Plus size={14} /> Add resource
                  </Button>
                }
              />
            )}
          </Card>
        </aside>
      </div>

      {/* Add Resource Modal */}
      {addResourceModal && (
        <Modal
          title="Add Learning Resource"
          description={`Attach an educational resource to "${topic.title}"`}
          onClose={() => setAddResourceModal(false)}
        >
          <form onSubmit={handleAddResource} className="modal-form">
            <label className="form-field">
              <span>Resource Title</span>
              <input name="title" required placeholder="e.g. Official Documentation" />
            </label>
            <label className="form-field">
              <span>Resource Type</span>
              <select name="type" defaultValue="WEBSITE">
                <option value="WEBSITE">Website / Article</option>
                <option value="VIDEO">Video Tutorial</option>
                <option value="PDF">PDF Reference</option>
                <option value="DOCUMENT">Document / Notes</option>
              </select>
            </label>
            <label className="form-field">
              <span>URL or Reference</span>
              <input name="url" placeholder="https://... or document reference" />
            </label>
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setAddResourceModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={resourceSubmitting}>
                {resourceSubmitting ? 'Adding...' : 'Attach Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
