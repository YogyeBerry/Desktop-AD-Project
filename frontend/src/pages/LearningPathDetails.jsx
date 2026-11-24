import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Play,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { useLearning } from '../context/useLearning';
import { formatDuration, getPathProgress, getPathStatus } from '../data/sampleData';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import NotFound from './NotFound';

export default function LearningPathDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    learningPaths,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicComplete,
    deleteLearningPath,
  } = useLearning();

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const path = learningPaths.find((item) => item.id === id);
  if (!path) return <NotFound compact />;

  const completed = path.topics.filter((topic) => topic.completed || topic.isCompleted).length;
  const progress = getPathProgress(path);
  const nextTopic = path.topics.find((topic) => !topic.completed && !topic.isCompleted);

  function openCreateTopic() {
    setEditingTopic(null);
    setTopicModalOpen(true);
  }

  function openEditTopic(topic) {
    setEditingTopic(topic);
    setTopicModalOpen(true);
  }

  function closeTopicModal() {
    setTopicModalOpen(false);
    setEditingTopic(null);
  }

  async function handleTopicSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title')).trim();
    const description = String(formData.get('description')).trim();
    const duration = Math.max(5, Number(formData.get('duration') || 30));

    setIsSubmitting(true);
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, {
          title,
          description,
          estimatedDuration: duration,
        });
      } else {
        await addTopic(path.id, {
          title,
          description,
          estimatedDuration: duration,
        });
      }
      closeTopicModal();
    } catch (err) {
      alert(`Failed to save topic: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTopic(topic) {
    if (window.confirm(`Delete topic "${topic.title}"? Associated resources and study time will also be removed.`)) {
      try {
        await deleteTopic(topic.id);
      } catch (err) {
        alert(`Failed to delete topic: ${err.message}`);
      }
    }
  }

  return (
    <>
      <button className="back-link" type="button" onClick={() => navigate('/learning-paths')}>
        <ArrowLeft size={16} /> Back to learning paths
      </button>

      <PageHeader
        eyebrow="LEARNING PATH"
        title={path.title}
        description={path.description || 'A learning path ready for your next goal.'}
        action={
          <div className="header-actions-row">
            <Button variant="secondary" onClick={openCreateTopic}>
              <Plus size={15} /> Add topic
            </Button>
            {nextTopic && (
              <Button variant="primary" onClick={() => navigate(`/topics/${nextTopic.id}`)}>
                <Play size={15} fill="currentColor" /> Continue learning
              </Button>
            )}
          </div>
        }
      />

      <Card className="path-overview-card">
        <div className="overview-progress-copy">
          <div>
            <span className="eyebrow">YOUR PROGRESS</span>
            <div className="overview-percent">
              {progress}
              <span>%</span>
            </div>
          </div>
          <StatusBadge status={getPathStatus(path)} />
        </div>
        <ProgressBar value={progress} label={`${path.title} progress`} />
        <div className="overview-stats">
          <div>
            <strong>
              {completed} <span>/ {path.topics.length}</span>
            </strong>
            <small>Topics completed</small>
          </div>
          <div>
            <strong>{path.topics.length}</strong>
            <small>Total topics</small>
          </div>
          <div>
            <strong>{formatDuration(path.estimatedMinutes)}</strong>
            <small>Estimated duration</small>
          </div>
        </div>
      </Card>

      <div className="section-heading topic-list-heading">
        <div>
          <h2>Topics in this path</h2>
          <p>Move through each topic at your own pace</p>
        </div>
        <div className="topic-list-actions">
          <span className="topic-count">{path.topics.length} topics</span>
          <button type="button" className="button button-secondary button-sm" onClick={openCreateTopic}>
            <Plus size={14} /> Add topic
          </button>
        </div>
      </div>

      {path.topics.length ? (
        <div className="topic-list">
          {path.topics.map((topic, index) => {
            const isDone = Boolean(topic.completed || topic.isCompleted);
            return (
              <Card className="topic-row" key={topic.id}>
                <button
                  type="button"
                  className={`topic-check-btn ${isDone ? 'checked' : ''}`}
                  onClick={() => toggleTopicComplete(topic.id)}
                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <span className={`topic-number${isDone ? ' topic-done' : ''}`}>
                    {isDone ? <Check size={16} /> : String(index + 1).padStart(2, '0')}
                  </span>
                </button>

                <div className="topic-row-content">
                  <div className="topic-title-flex">
                    <Link to={`/topics/${topic.id}`} className="card-title-link">
                      {topic.title}
                    </Link>
                  </div>
                  <p>{topic.description || 'No description provided.'}</p>
                  <div className="topic-row-meta">
                    <Clock3 size={14} /> {formatDuration(topic.estimatedMinutes || topic.estimatedDuration)}{' '}
                    <span>·</span> {isDone ? 'Completed' : 'Not completed'}
                  </div>
                </div>

                <div className="topic-row-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => openEditTopic(topic)}
                    title="Edit topic"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-button delete-btn"
                    onClick={() => handleDeleteTopic(topic)}
                    title="Delete topic"
                  >
                    <Trash2 size={15} />
                  </button>
                  <Link
                    className="round-arrow"
                    to={`/topics/${topic.id}`}
                    aria-label={`Study ${topic.title}`}
                  >
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No topics in this path yet"
            description="Add topics to structure what you will learn."
            action={
              <Button type="button" variant="primary" onClick={openCreateTopic}>
                <Plus size={15} /> Add first topic
              </Button>
            }
          />
        </Card>
      )}

      {/* Topic Create / Edit Modal */}
      {topicModalOpen && (
        <Modal
          title={editingTopic ? 'Edit Topic' : 'Add New Topic'}
          description={
            editingTopic
              ? `Update topic in "${path.title}"`
              : `Add a structured topic to "${path.title}"`
          }
          onClose={closeTopicModal}
        >
          <form onSubmit={handleTopicSubmit} className="modal-form">
            <label className="form-field">
              <span>Topic Title</span>
              <input
                name="title"
                defaultValue={editingTopic?.title || ''}
                required
                placeholder="e.g. Asynchronous JavaScript & Promises"
              />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={editingTopic?.description || ''}
                placeholder="What will you learn in this topic?"
              />
            </label>
            <label className="form-field">
              <span>Estimated Duration (Minutes)</span>
              <input
                name="duration"
                type="number"
                min="5"
                max="600"
                defaultValue={editingTopic?.estimatedDuration || editingTopic?.estimatedMinutes || 30}
                required
              />
            </label>
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={closeTopicModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
