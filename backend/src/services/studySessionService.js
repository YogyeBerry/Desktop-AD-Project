const prisma = require('../db/prisma');
const activityService = require('./activityService');

/**
 * Split a duration across calendar days if a session spans midnight
 * Returns array of { date: 'YYYY-MM-DD', seconds: number }
 */
function splitSessionDurationByDays(startDate, endDate, totalSeconds) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalMs = Math.max(1000, end.getTime() - start.getTime());

  // If start and end are on the same local calendar day
  const startDayStr = activityService.toLocalDateString(start);
  const endDayStr = activityService.toLocalDateString(end);

  if (startDayStr === endDayStr) {
    return [{ date: startDayStr, seconds: totalSeconds }];
  }

  // Iterate day by day from start to end
  const splits = [];
  let currentStart = new Date(start);
  let remainingSeconds = totalSeconds;

  while (currentStart < end) {
    const currentDateStr = activityService.toLocalDateString(currentStart);
    // End of current local day: next day at 00:00:00.000
    const nextDay = new Date(currentStart);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const sliceEnd = nextDay < end ? nextDay : end;
    const sliceMs = sliceEnd.getTime() - currentStart.getTime();

    // Proportional seconds
    let sliceSeconds = Math.round((sliceMs / totalMs) * totalSeconds);
    if (sliceSeconds > remainingSeconds) {
      sliceSeconds = remainingSeconds;
    }

    if (sliceSeconds > 0) {
      splits.push({ date: currentDateStr, seconds: sliceSeconds });
      remainingSeconds -= sliceSeconds;
    }

    currentStart = sliceEnd;
  }

  // If any rounding remainder, give to the last split
  if (remainingSeconds > 0 && splits.length > 0) {
    splits[splits.length - 1].seconds += remainingSeconds;
  }

  return splits;
}

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

    // 1. Save study session
    const session = await prisma.studySession.create({
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

    // 2. Allocate duration across calendar days for heatmap and streak tracking
    try {
      const splits = splitSessionDurationByDays(start, end, duration);
      for (const split of splits) {
        await activityService.addStudyDuration(split.date, split.seconds);
      }
    } catch (actErr) {
      console.error('Failed to update daily activity duration:', actErr);
    }

    return session;
  }
}

module.exports = new StudySessionService();
module.exports.splitSessionDurationByDays = splitSessionDurationByDays;
