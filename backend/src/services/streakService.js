const prisma = require('../db/prisma');
const activityService = require('./activityService');

const QUALIFYING_SECONDS = 7200; // 2 hours in seconds

/**
 * Calculate difference in calendar days between two YYYY-MM-DD strings
 */
function daysDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Pure function: calculates streak metrics given a list of DailyActivity objects
 * @param {Array<{ date: string, studySeconds: number }>} activities
 * @param {string} [todayStr] - Current local date YYYY-MM-DD
 */
function calculateStreakFromActivities(activities = [], todayStr = activityService.toLocalDateString()) {
  // Sort ascending by date
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  // Filter only qualifying days (>= 2 hours)
  const qualifyingDays = sorted.filter((a) => (a.studySeconds || 0) >= QUALIFYING_SECONDS);

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  for (const day of qualifyingDays) {
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diff = daysDifference(prevDate, day.date);
      if (diff === 1) {
        runningStreak += 1;
      } else if (diff > 1) {
        runningStreak = 1;
      }
      // If diff === 0 (duplicate), runningStreak stays unchanged
    }
    prevDate = day.date;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  // Calculate current streak relative to today
  // A streak is alive if the last qualifying day was today OR yesterday.
  // If the last qualifying day was 2+ days ago, current streak is 0.
  let currentStreak = 0;
  let lastQualifyingDate = qualifyingDays.length > 0 ? qualifyingDays[qualifyingDays.length - 1].date : null;

  if (lastQualifyingDate) {
    const diffFromToday = daysDifference(lastQualifyingDate, todayStr);
    if (diffFromToday === 0 || diffFromToday === 1) {
      // Trace backwards from last qualifying day to count consecutive days
      let streakCount = 1;
      for (let i = qualifyingDays.length - 1; i > 0; i--) {
        const diff = daysDifference(qualifyingDays[i - 1].date, qualifyingDays[i].date);
        if (diff === 1) {
          streakCount += 1;
        } else {
          break;
        }
      }
      currentStreak = streakCount;
    } else {
      currentStreak = 0; // Missed day, streak broken
    }
  }

  // Today's progress
  const todayActivity = activities.find((a) => a.date === todayStr);
  const todayStudySeconds = todayActivity ? todayActivity.studySeconds || 0 : 0;
  const todayQualified = todayStudySeconds >= QUALIFYING_SECONDS;

  return {
    currentStreak,
    longestStreak,
    lastQualifyingDate,
    todayStudySeconds,
    todayQualified,
    targetSeconds: QUALIFYING_SECONDS,
  };
}

class StreakService {
  /**
   * Get full streak summary from database
   */
  async getStreakSummary(clientTodayStr) {
    const todayStr = clientTodayStr || activityService.toLocalDateString();
    const activities = await prisma.dailyActivity.findMany({
      orderBy: { date: 'asc' },
    });

    return calculateStreakFromActivities(activities, todayStr);
  }
}

module.exports = new StreakService();
module.exports.calculateStreakFromActivities = calculateStreakFromActivities;
module.exports.QUALIFYING_SECONDS = QUALIFYING_SECONDS;
