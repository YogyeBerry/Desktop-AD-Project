import { useState, useEffect } from 'react';
import { Activity, Clock3, Target, Calendar, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useLearning } from '../context/useLearning';
import { formatDuration, getPathProgress } from '../data/sampleData';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';

export default function Analytics() {
  const { learningPaths, studySessions } = useLearning();

  const [summary, setSummary] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [pathsData, setPathsData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [sum, week, paths, topics] = await Promise.all([
          analyticsService.getSummary().catch(() => null),
          analyticsService.getWeekly().catch(() => []),
          analyticsService.getPathsAnalytics().catch(() => []),
          analyticsService.getTopicsAnalytics().catch(() => []),
        ]);
        setSummary(sum);
        setWeeklyData(week || []);
        setPathsData(paths || []);
        setTopicsData(topics || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [studySessions, learningPaths]);

  // Fallbacks if backend analytics hasn't responded yet
  const totalTopics = summary?.totalTopics ?? learningPaths.flatMap((p) => p.topics).length;
  const completedTopics = summary?.completedTopics ?? learningPaths.flatMap((p) => p.topics).filter((t) => t.completed || t.isCompleted).length;
  const totalMinutes = summary?.totalStudyMinutes ?? studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const averageMinutes = summary?.averageSessionMinutes ?? (studySessions.length ? Math.round(totalMinutes / studySessions.length) : 0);

  // Topics comparison dataset for Recharts
  const comparisons = (topicsData.length ? topicsData : learningPaths.flatMap((path) =>
    path.topics.map((topic) => ({
      topicTitle: topic.title,
      estimatedMinutes: topic.estimatedDuration || topic.estimatedMinutes || 30,
      actualMinutes: studySessions.filter((s) => s.topicId === topic.id).reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
    }))
  ))
    .filter((t) => t.actualMinutes > 0 || t.estimatedMinutes > 0)
    .slice(0, 6)
    .map((item) => ({
      topicTitle: item.title || item.topicTitle,
      estimatedMinutes: item.estimatedMinutes || 0,
      actualMinutes: item.actualMinutes || 0,
    }));

  const maxPathMinutes = Math.max(...pathsData.map((p) => p.studyMinutes || 0), 1);

  return (
    <>
      <PageHeader
        eyebrow="YOUR PROGRESS"
        title="Study Analytics & Insights"
        description="A real-time overview of your learning velocity, time allocation, and completion metrics."
        action={
          <span className="sample-tag db-tag">
            <span /> PERSISTED DATABASE DATA
          </span>
        }
      />

      <div className="analytics-stats">
        <MetricCard
          label="Total study time"
          value={formatDuration(totalMinutes)}
          helper="Recorded across all study sessions"
          icon={<Clock3 />}
        />
        <MetricCard
          label="Topics completed"
          value={`${completedTopics} / ${totalTopics}`}
          helper={totalTopics ? `${Math.round((completedTopics / totalTopics) * 100)}% of all topics completed` : 'No topics yet'}
          icon={<Target />}
        />
        <MetricCard
          label="Average session"
          value={formatDuration(averageMinutes)}
          helper={`${studySessions.length} total sessions logged`}
          icon={<Activity />}
        />
      </div>

      <div className="analytics-grid">
        {/* Weekly Study Minutes Recharts Chart */}
        <Card className="chart-card weekly-chart">
          <div className="section-heading">
            <div>
              <h2>Weekly Study Time</h2>
              <p>Minutes spent learning each day over the past 7 days</p>
            </div>
            <span className="chart-legend">
              <i /> Study time (min)
            </span>
          </div>

          {weeklyData.some((d) => d.minutes > 0) || studySessions.length > 0 ? (
            <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={13} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={13} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(val) => [`${val} minutes`, 'Study Time']}
                  />
                  <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No study sessions recorded this week"
              description="Start a study timer session on any topic to visualize your weekly learning rhythm."
            />
          )}
        </Card>

        {/* Estimated vs Actual Duration Recharts Chart */}
        <Card className="chart-card estimate-chart">
          <div className="section-heading">
            <div>
              <h2>Estimated vs. Actual Duration</h2>
              <p>Compare planned topic estimates with actual study time</p>
            </div>
          </div>

          {comparisons.length > 0 ? (
            <div className="recharts-wrapper-container" style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisons} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="topicTitle"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(v) => (v.length > 12 ? `${v.substring(0, 10)}...` : v)}
                  />
                  <YAxis stroke="#94a3b8" fontSize={13} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(val, name) => [`${val} min`, name === 'estimatedMinutes' ? 'Estimated' : 'Actual']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(val) => (val === 'estimatedMinutes' ? 'Estimated' : 'Actual Studied')}
                  />
                  <Bar dataKey="estimatedMinutes" fill="#64748b" radius={[4, 4, 0, 0]} name="estimatedMinutes" />
                  <Bar dataKey="actualMinutes" fill="#10b981" radius={[4, 4, 0, 0]} name="actualMinutes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No topic session comparisons yet"
              description="Estimated and actual comparisons appear as you log focus sessions."
            />
          )}
        </Card>

        {/* Study Time by Path */}
        <Card className="chart-card path-time-chart">
          <div className="section-heading">
            <div>
              <h2>Study Time by Learning Path</h2>
              <p>Where your study attention is focused</p>
            </div>
          </div>
          {pathsData.length ? (
            <div className="path-time-list">
              {pathsData.map((path) => (
                <div className="path-time-row" key={path.id}>
                  <div className="path-time-label">
                    <strong>{path.title}</strong>
                    <span>{formatDuration(path.studyMinutes || 0)}</span>
                  </div>
                  <ProgressBar
                    value={maxPathMinutes ? ((path.studyMinutes || 0) / maxPathMinutes) * 100 : 0}
                    label={`${path.title} study time`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No paths to compare"
              description="Create a learning path to see your study time distributed by subject."
            />
          )}
        </Card>

        {/* Learning Path Completion Summary */}
        <Card className="chart-card completion-summary">
          <div className="section-heading">
            <div>
              <h2>Learning Path Completion</h2>
              <p>Goal completion progress calculated from SQLite database</p>
            </div>
          </div>
          {learningPaths.length ? (
            <div className="completion-list">
              {learningPaths.map((path) => {
                const progress = getPathProgress(path);
                const completedCount = path.topics.filter((t) => t.completed || t.isCompleted).length;
                return (
                  <div className="completion-row" key={path.id}>
                    <div>
                      <strong>{path.title}</strong>
                      <span>
                        {completedCount} of {path.topics.length} topics complete
                      </span>
                    </div>
                    <strong className="completion-percent">{progress}%</strong>
                    <ProgressBar value={progress} label={`${path.title} completion`} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No learning paths yet"
              description="Your learning path progress will be summarized here."
            />
          )}
        </Card>
      </div>

      <p className="analytics-footnote">
        All analytics and metrics are computed in real time from persistent SQLite database records.
      </p>
    </>
  );
}

function MetricCard({ label, value, helper, icon }) {
  return (
    <Card className="metric-card">
      <span className="metric-icon">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{helper}</small>
    </Card>
  );
}
