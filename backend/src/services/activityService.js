const prisma = require('../db/prisma');

/**
 * Format Date to YYYY-MM-DD local string
 */
function toLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Record a timer start event for a given calendar day (YYYY-MM-DD)
 */
async function recordTimerStart(dateStr) {
  const targetDate = dateStr || toLocalDateString();

  return await prisma.dailyActivity.upsert({
    where: { date: targetDate },
    update: {
      timerStarts: {
        increment: 1,
      },
    },
    create: {
      date: targetDate,
      timerStarts: 1,
      studySeconds: 0,
    },
  });
}

/**
 * Record or allocate study duration to a specific date
 */
async function addStudyDuration(dateStr, seconds) {
  const targetDate = dateStr || toLocalDateString();
  const sec = Math.max(0, parseInt(seconds, 10) || 0);

  return await prisma.dailyActivity.upsert({
    where: { date: targetDate },
    update: {
      studySeconds: {
        increment: sec,
      },
    },
    create: {
      date: targetDate,
      timerStarts: 0,
      studySeconds: sec,
    },
  });
}

/**
 * Get daily activity records within a date range (inclusive)
 */
async function getActivityRange(startDate, endDate) {
  const where = {};
  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  } else if (startDate) {
    where.date = { gte: startDate };
  } else if (endDate) {
    where.date = { lte: endDate };
  }

  return await prisma.dailyActivity.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

/**
 * Get rolling activity for the past 365 days (or full year)
 */
async function getRollingActivity(days = 365) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  const startDateStr = toLocalDateString(start);
  const endDateStr = toLocalDateString(now);

  const activities = await prisma.dailyActivity.findMany({
    where: {
      date: {
        gte: startDateStr,
        lte: endDateStr,
      },
    },
    orderBy: { date: 'asc' },
  });

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    activities,
  };
}

module.exports = {
  toLocalDateString,
  recordTimerStart,
  addStudyDuration,
  getActivityRange,
  getRollingActivity,
};
