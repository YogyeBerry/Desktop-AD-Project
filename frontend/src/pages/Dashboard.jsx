import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Plus, Sparkles, Database } from 'lucide-react';
import { useLearning } from '../context/useLearning';
import { formatDuration, getPathProgress, getPathStatus } from '../data/sampleData';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { learningPaths, studySessions, loading } = useLearning();

  const topics = learningPaths.flatMap((path) => path.topics || []);
  const completedTopics = topics.filter((topic) => topic.completed || topic.isCompleted).length;
  const studyMinutes = studySessions.reduce((total, session) => total + (session.durationMinutes || 0), 0);
  const inProgressPaths = learningPaths.filter((path) => getPathStatus(path) === 'In Progress').slice(0, 3);
  const recentSessions = [...studySessions].sort((a, b) => (b.startTime || b.date || '').localeCompare(a.startTime || a.date || '')).slice(0, 5);
  const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));

  return (
    <>
      <PageHeader
        eyebrow="YOUR LEARNING OVERVIEW"
        title="Personal Study Dashboard"
        description="Keep your momentum going. Every focused session brings you closer to your goals."
        action={
          <span className="date-pill">
            <Sparkles size={15} /> Your learning, your pace
          </span>
        }
      />

      <div className="stats-grid">
        <StatCard
          label="Learning paths"
          value={learningPaths.length}
          detail="in your workspace"
          icon={<BookOpen />}
          color="blue"
        />
        <StatCard
          label="Total topics"
          value={topics.length}
          detail="across all paths"
          icon={<BookOpen />}
          color="purple"
        />
        <StatCard
          label="Completed topics"
          value={completedTopics}
          detail={`${topics.length ? Math.round((completedTopics / topics.length) * 100) : 0}% of your topics`}
          icon={<Check />}
          color="green"
        />
        <StatCard
          label="Total study time"
          value={formatDuration(studyMinutes)}
          detail="persisted in database"
          icon={<Clock3 />}
          color="orange"
        />
      </div>

      <div className="dashboard-grid">
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Continue learning</h2>
              <p>Pick up where you left off</p>
            </div>
            <Link className="text-link" to="/learning-paths">
              All learning paths <ArrowRight size={15} />
            </Link>
          </div>

          {inProgressPaths.length ? (
            <div className="continue-list">
              {inProgressPaths.map((path) => {
                const nextTopic = path.topics.find((topic) => !topic.completed && !topic.isCompleted);
                const progress = getPathProgress(path);
                const completedCount = path.topics.filter((topic) => topic.completed || topic.isCompleted).length;

                return (
                  <Card className="continue-card" key={path.id}>
                    <div className={`path-symbol symbol-${path.id.length % 4}`}>
                      <BookOpen size={19} />
                    </div>
                    <div className="continue-content">
                      <div className="continue-title-row">
                        <Link to={`/learning-paths/${path.id}`} className="card-title-link">
                          {path.title}
                        </Link>
                        <StatusBadge status={getPathStatus(path)} />
                      </div>
                      <p className="muted">
                        {nextTopic ? `Next up: ${nextTopic.title}` : 'All topics complete'}
                      </p>
                      <div className="progress-meta">
                        <span>{progress}% complete</span>
                        <span>
                          {completedCount}/{path.topics.length} topics
                        </span>
                      </div>
                      <ProgressBar value={progress} label={`${path.title} progress`} />
                    </div>
                    <Link
                      className="round-arrow"
                      to={nextTopic ? `/topics/${nextTopic.id}` : `/learning-paths/${path.id}`}
                      aria-label={`Continue ${path.title}`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <EmptyState
                title={learningPaths.length ? "All caught up or ready to start!" : "Ready for a new learning path?"}
                description={learningPaths.length ? "Choose any learning path to begin your next focus session." : "Create a path to organize the topics you want to explore."}
                action={
                  <Link to="/learning-paths" className="button button-primary">
                    Explore learning paths
                  </Link>
                }
              />
            </Card>
          )}

          <Card className="activity-card">
            <div className="section-heading compact-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Your latest study sessions recorded from the timer</p>
              </div>
              <Link to="/analytics" className="text-link">
                View analytics <ArrowRight size={15} />
              </Link>
            </div>

            {recentSessions.length ? (
              <div className="activity-list">
                {recentSessions.map((session, idx) => {
                  const topic = topicById[session.topicId];
                  const parentPath = learningPaths.find((path) =>
                    path.topics.some((item) => item.id === session.topicId)
                  );
                  const displayDate = session.date || (session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Recent');

                  return (
                    <div className="activity-row" key={session.id || idx}>
                      <span className="activity-check">
                        <Check size={14} />
                      </span>
                      <div className="activity-info">
                        <strong>{topic?.title ?? session.topic?.title ?? 'Study session'}</strong>
                        <span>{parentPath?.title ?? session.topic?.learningPath?.title ?? 'Focus session'}</span>
                      </div>
                      <time dateTime={session.date || ''}>{displayDate}</time>
                      <span className="activity-duration">
                        <Clock3 size={14} />
                        {session.durationMinutes} min
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No study activity yet"
                description="Use the study timer on any topic to track and log your focused sessions."
              />
            )}
          </Card>
        </section>

        <aside className="dashboard-aside">
          <Card className="quick-actions-card">
            <div className="section-heading compact-heading">
              <div>
                <h2>Quick actions</h2>
                <p>Make your next move</p>
              </div>
            </div>
            <Link className="quick-action" to="/learning-paths?create=1">
              <span className="quick-action-icon">
                <Plus size={18} />
              </span>
              <span>
                <strong>Create a learning path</strong>
                <small>Organize a new goal</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link className="quick-action" to="/learning-paths">
              <span className="quick-action-icon green-quick">
                <BookOpen size={18} />
              </span>
              <span>
                <strong>Browse your paths</strong>
                <small>Find your next topic</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link className="quick-action" to="/resources">
              <span className="quick-action-icon">
                <Plus size={18} />
              </span>
              <span>
                <strong>Resource Library</strong>
                <small>Import CSV or view guides</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card className="focus-card">
            <span className="focus-badge">
              <Sparkles size={15} /> A gentle reminder
            </span>
            <h3>Progress over perfection.</h3>
            <p>
              Even 15 minutes of focused learning can make a difference. Show up for the next small step.
            </p>
            <div className="focus-decoration">
              <span /><span /><span /><span /><span /><span /><span />
            </div>
          </Card>

          <div className="dashboard-note">
            <span className="note-dot active" /> Connected to SQLite <span>·</span> Data persists locally.
          </div>
        </aside>
      </div>
    </>
  );
}

function StatCard({ label, value, detail, icon, color }) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-detail">{detail}</span>
      </div>
    </Card>
  );
}
