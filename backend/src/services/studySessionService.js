const prisma = require('../db/prisma');

class StudySessionService {
  async getSessionsByTopic(topicId) {
    return prisma.studySession.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: { id: true, title: true, learningPathId: true },
        },
      },
    });
  }

  async getAllSessions() {
    return prisma.studySession.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            learningPathId: true,
            learningPath: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  }

  async createSession(topicId, { startTime, endTime, durationSeconds }) {
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      const error = new Error(`Topic with id ${topicId} not found`);
      error.status = 404;
      throw error;
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : new Date();
    const duration = durationSeconds !== undefined ? Number(durationSeconds) : Math.round((end - start) / 1000);

    if (duration <= 0) {
      const error = new Error('Duration must be greater than 0 seconds');
      error.status = 400;
      throw error;
    }

    return prisma.studySession.create({
      data: {
        topicId,
        startTime: start,
        endTime: end,
        durationSeconds: duration,
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            learningPathId: true,
            learningPath: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  }
}

module.exports = new StudySessionService();
