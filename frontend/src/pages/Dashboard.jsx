import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useLearning } from '../context/useLearning';
import { formatDuration, getPathProgress, getPathStatus } from '../data/sampleData';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import StudyHeatmap from '../components/StudyHeatmap';
import StreakCard from '../components/StreakCard';

function StatCard({ label, value, detail, icon }) {
  return (
    <Card className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon-wrapper">{icon}</span>
      </div>
      <div className="stat-card-bottom">
        <span className="stat-value">{value}</span>
        <span className="stat-detail">{detail}</span>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { learningPaths, studySessions, activities, streakData, loading } = useLearning();

  const topics = learningPaths.flatMap((path) => path.topics || []);
  const completedTopics = topics.filter((topic) => topic.completed || topic.isCompleted).length;
  const studyMinutes = studySessions.reduce((total, session) => total + (session.durationMinutes || 0), 0);
  const inProgressPaths = learningPaths.filter((path) => getPathStatus(path) === 'In Progress').slice(0, 3);
  const recentSessions = [...studySessions]
    .sort((a, b) => (b.startTime || b.date || '').localeCompare(a.startTime || a.date || ''))
    .slice(0, 5);
  const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));

  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title="Personal Study Dashboard"
        description="A quiet, focused space for your daily intellectual growth."
      />

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        <StatCard
          label="Learning Paths"
          value={learningPaths.length}
          detail="active programs"
          icon={<BookOpen size={16} />}
        />
        <StatCard
          label="Total Topics"
          value={topics.length}
          detail="curriculum units"
          icon={<BookOpen size={16} />}
        />
        <StatCard
          label="Completed Topics"
          value={completedTopics}
          detail={`${topics.length ? Math.round((completedTopics / topics.length) * 100) : 0}% mastered`}
          icon={<CheckCircle size={16} />}
        />
        <StatCard
          label="Focused Study Time"
          value={formatDuration(studyMinutes)}
          detail="tracked duration"
          icon={<Clock size={16} />}
        />
      </div>

      {/* Streak Banner */}
      <StreakCard streakData={streakData} />

      {/* Activity Heatmap */}
      <StudyHeatmap activities={activities} title="Daily Study Activity" />

      {/* 2-Column Split: Continue Learning & Recent Log */}
      <div className="dashboard-grid">
        <section className="dashboard-col">
          <div className="section-header">
            <div>
              <h2 className="section-title">Continue Learning</h2>
              <p className="section-desc">Pick up where you left off</p>
            </div>
            <Link className="section-link" to="/learning-paths">
              View all paths <ArrowRight size={13} />
            </Link>
          </div>

          {inProgressPaths.length === 0 ? (
            <EmptyState
              title="No paths currently in progress"
              description="Start a topic from your library to track your momentum."
              action={
                <Link className="button button-primary" to="/learning-paths">
                  Browse Paths
                </Link>
              }
            />
          ) : (
            <div className="paths-stack">
              {inProgressPaths.map((path) => {
                const progress = getPathProgress(path);
                const nextTopic = path.topics.find((topic) => !topic.completed && !topic.isCompleted);
                return (
                  <Card key={path.id} className="active-path-card">
                    <div className="active-path-main">
                      <div className="active-path-header">
                        <h3 className="active-path-title">{path.title}</h3>
                        <StatusBadge status="In Progress" />
                      </div>
                      <p className="active-path-desc">{path.description}</p>
                    </div>

                    <div className="active-path-progress-row">
                      <div className="progress-label-row">
                        <span>{path.topics.filter((t) => t.completed || t.isCompleted).length} of {path.topics.length} topics completed</span>
                        <strong>{progress}%</strong>
                      </div>
                      <ProgressBar value={progress} />
                    </div>

                    {nextTopic && (
                      <div className="active-path-footer">
                        <span className="next-up-label">NEXT TOPIC</span>
                        <Link className="next-up-link" to={`/topics/${nextTopic.id}`}>
                          <span>{nextTopic.title}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-col">
          <div className="section-header">
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <p className="section-desc">Latest logged focus sessions</p>
            </div>
            <Link className="section-link" to="/analytics">
              Full analytics <ArrowRight size={13} />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <EmptyState
              title="No sessions recorded yet"
              description="Start a study timer on any topic to build your timeline."
            />
          ) : (
            <Card className="sessions-list-card">
              <div className="sessions-list">
                {recentSessions.map((session, idx) => {
                  const topic = topicById[session.topicId];
                  const sessionDate = session.date || (session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Today');
                  return (
                    <div key={session.id || idx} className="session-row">
                      <div className="session-info">
                        <span className="session-topic-title">
                          {topic?.title || session.topic?.title || 'Study Session'}
                        </span>
                        <span className="session-date-sub">{sessionDate}</span>
                      </div>
                      <div className="session-duration-tag">
                        {formatDuration(session.durationMinutes)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
