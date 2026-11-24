import { useEffect, useState, useCallback } from 'react';
import { LearningContext } from './LearningContext';
import { pathService } from '../services/pathService';
import { topicService } from '../services/topicService';
import { resourceService } from '../services/resourceService';
import { studySessionService } from '../services/studySessionService';
import { analyticsService } from '../services/analyticsService';

function normalizeTopic(topic) {
  const completed = Boolean(topic.isCompleted || topic.completed);
  return {
    ...topic,
    completed,
    isCompleted: completed,
    estimatedMinutes: topic.estimatedDuration || topic.estimatedMinutes || 30,
    estimatedDuration: topic.estimatedDuration || topic.estimatedMinutes || 30,
    resources: topic.resources || [],
  };
}

function normalizePath(path) {
  const topics = (path.topics || []).map(normalizeTopic);
  const totalMinutes = topics.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  return {
    ...path,
    estimatedMinutes: totalMinutes || path.estimatedMinutes || 0,
    topics,
  };
}

export function LearningProvider({ children }) {
  const [learningPaths, setLearningPaths] = useState([]);
  const [resources, setResources] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pathsData, resData, sessData, analyticsData] = await Promise.all([
        pathService.getAllPaths().catch(() => []),
        resourceService.getAllResources().catch(() => []),
        studySessionService.getAllSessions().catch(() => []),
        analyticsService.getSummary().catch(() => null),
      ]);

      setLearningPaths((pathsData || []).map(normalizePath));
      setResources(
        (resData || []).map((r) => ({
          ...r,
          pathId: r.topic?.learningPathId,
          topicTitle: r.topic?.title,
          pathTitle: r.topic?.learningPath?.title,
        }))
      );
      setStudySessions(
        (sessData || []).map((s) => ({
          ...s,
          date: s.startTime ? new Date(s.startTime).toISOString().split('T')[0] : '',
          durationMinutes: Math.round((s.durationSeconds || 0) / 60),
        }))
      );
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load learning data:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Learning Path CRUD
  async function createLearningPath({ title, description, estimatedMinutes }) {
    try {
      const created = await pathService.createPath({ title, description });
      const normalized = normalizePath(created);
      setLearningPaths((prev) => [normalized, ...prev]);
      return normalized.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateLearningPath(id, updates) {
    try {
      const updated = await pathService.updatePath(id, updates);
      const normalized = normalizePath(updated);
      setLearningPaths((prev) => prev.map((p) => (p.id === id ? { ...p, ...normalized } : p)));
      return normalized;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteLearningPath(id) {
    try {
      await pathService.deletePath(id);
      setLearningPaths((prev) => prev.filter((p) => p.id !== id));
      setResources((prev) => prev.filter((r) => r.pathId !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Topic Operations
  async function addTopic(pathId, topicData) {
    try {
      const created = await topicService.addTopic(pathId, topicData);
      const normalized = normalizeTopic(created);
      setLearningPaths((prev) =>
        prev.map((path) => {
          if (path.id !== pathId) return path;
          const updatedTopics = [...path.topics, normalized];
          return normalizePath({ ...path, topics: updatedTopics });
        })
      );
      return normalized;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateTopic(topicId, topicData) {
    try {
      const updated = await topicService.updateTopic(topicId, topicData);
      const normalized = normalizeTopic(updated);
      setLearningPaths((prev) =>
        prev.map((path) => {
          const hasTopic = path.topics.some((t) => t.id === topicId);
          if (!hasTopic) return path;
          const updatedTopics = path.topics.map((t) => (t.id === topicId ? { ...t, ...normalized } : t));
          return normalizePath({ ...path, topics: updatedTopics });
        })
      );
      return normalized;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteTopic(topicId) {
    try {
      await topicService.deleteTopic(topicId);
      setLearningPaths((prev) =>
        prev.map((path) => {
          const updatedTopics = path.topics.filter((t) => t.id !== topicId);
          return normalizePath({ ...path, topics: updatedTopics });
        })
      );
      setResources((prev) => prev.filter((r) => r.topicId !== topicId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function toggleTopicComplete(topicId) {
    try {
      let currentStatus = false;
      for (const path of learningPaths) {
        const found = path.topics.find((t) => t.id === topicId);
        if (found) {
          currentStatus = Boolean(found.completed || found.isCompleted);
          break;
        }
      }

      const updated = await topicService.updateProgress(topicId, !currentStatus);
      const normalized = normalizeTopic(updated);

      setLearningPaths((prev) =>
        prev.map((path) => {
          const hasTopic = path.topics.some((t) => t.id === topicId);
          if (!hasTopic) return path;
          const updatedTopics = path.topics.map((t) => (t.id === topicId ? { ...t, ...normalized } : t));
          return normalizePath({ ...path, topics: updatedTopics });
        })
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Resource Operations
  async function addResource(topicId, resourceData) {
    try {
      const created = await resourceService.addResource(topicId, resourceData);
      setResources((prev) => [created, ...prev]);
      // Also update local topic's resources array
      setLearningPaths((prev) =>
        prev.map((path) => {
          const hasTopic = path.topics.some((t) => t.id === topicId);
          if (!hasTopic) return path;
          return {
            ...path,
            topics: path.topics.map((t) => {
              if (t.id !== topicId) return t;
              return { ...t, resources: [...(t.resources || []), created] };
            }),
          };
        })
      );
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateResource(resourceId, resourceData) {
    try {
      const updated = await resourceService.updateResource(resourceId, resourceData);
      setResources((prev) => prev.map((r) => (r.id === resourceId ? { ...r, ...updated } : r)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteResource(resourceId) {
    try {
      await resourceService.deleteResource(resourceId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setLearningPaths((prev) =>
        prev.map((path) => ({
          ...path,
          topics: path.topics.map((t) => ({
            ...t,
            resources: (t.resources || []).filter((r) => r.id !== resourceId),
          })),
        }))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Study Session Operation
  async function recordStudySession(topicId, sessionData) {
    try {
      const created = await studySessionService.createSession(topicId, sessionData);
      const normalizedSession = {
        ...created,
        date: created.startTime ? new Date(created.startTime).toISOString().split('T')[0] : '',
        durationMinutes: Math.round((created.durationSeconds || 0) / 60),
      };
      setStudySessions((prev) => [normalizedSession, ...prev]);
      return normalizedSession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = {
    learningPaths,
    resources,
    studySessions,
    analytics,
    loading,
    error,
    refreshData,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicComplete,
    addResource,
    updateResource,
    deleteResource,
    recordStudySession,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}
