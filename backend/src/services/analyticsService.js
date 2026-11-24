const prisma = require('../db/prisma');

class AnalyticsService {
  async getSummary() {
    const [totalPaths, totalTopics, completedTopics, sessions] = await Promise.all([
      prisma.learningPath.count(),
      prisma.topic.count(),
      prisma.topic.count({ where: { isCompleted: true } }),
      prisma.studySession.findMany({
        select: { durationSeconds: true },
      }),
    ]);

    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const averageSessionMinutes = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;
    const completionPercentage = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      totalPaths,
      totalTopics,
      completedTopics,
      completionPercentage,
      totalStudyMinutes: totalMinutes,
      averageSessionMinutes,
      totalSessionsCount: sessions.length,
    };
  }

  async getWeekly() {
    const sessions = await prisma.studySession.findMany({
      orderBy: { startTime: 'asc' },
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Map last 7 days ending today
    const now = new Date();
    const dailyMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = days[(d.getDay() + 6) % 7]; // Convert Sunday=0 to Mon=0
      dailyMap[dateKey] = {
        date: dateKey,
        day: dayName,
        minutes: 0,
      };
    }

    sessions.forEach((s) => {
      const dateKey = new Date(s.startTime).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].minutes += Math.round(s.durationSeconds / 60);
      }
    });

    return Object.values(dailyMap);
  }

  async getPathsAnalytics() {
    const paths = await prisma.learningPath.findMany({
      include: {
        topics: {
          include: {
            studySessions: {
              select: { durationSeconds: true },
            },
          },
        },
      },
    });

    return paths.map((path) => {
      const totalTopics = path.topics.length;
      const completedTopics = path.topics.filter((t) => t.isCompleted).length;
      const progress = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const totalDurationSeconds = path.topics.reduce((acc, topic) => {
        return acc + topic.studySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      }, 0);

      const estimatedMinutes = path.topics.reduce((acc, topic) => acc + (topic.estimatedDuration || 0), 0);

      return {
        id: path.id,
        title: path.title,
        totalTopics,
        completedTopics,
        progress,
        studyMinutes: Math.round(totalDurationSeconds / 60),
        estimatedMinutes,
      };
    });
  }

  async getTopicsAnalytics() {
    const topics = await prisma.topic.findMany({
      include: {
        learningPath: {
          select: { id: true, title: true },
        },
        studySessions: {
          select: { durationSeconds: true },
        },
      },
    });

    return topics.map((topic) => {
      const totalActualSeconds = topic.studySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      const actualMinutes = Math.round(totalActualSeconds / 60);

      return {
        id: topic.id,
        title: topic.title,
        pathId: topic.learningPathId,
        pathTitle: topic.learningPath.title,
        estimatedMinutes: topic.estimatedDuration,
        actualMinutes,
        isCompleted: topic.isCompleted,
        sessionCount: topic.studySessions.length,
      };
    });
  }
}

module.exports = new AnalyticsService();
