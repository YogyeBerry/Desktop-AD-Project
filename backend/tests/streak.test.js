const assert = require('assert');
const { calculateStreakFromActivities, QUALIFYING_SECONDS } = require('../src/services/streakService');

console.log('--- RUNNING STREAK SYSTEM UNIT TESTS ---');

// Test 1: Empty activities
{
  const res = calculateStreakFromActivities([], '2026-11-26');
  assert.strictEqual(res.currentStreak, 0, 'Empty activity should have 0 current streak');
  assert.strictEqual(res.longestStreak, 0, 'Empty activity should have 0 longest streak');
  assert.strictEqual(res.todayQualified, false, 'Today should not be qualified');
  console.log('✓ Test 1: Empty activities passed');
}

// Test 2: Less than 2 hours does NOT qualify (1 hr 59 min = 7140 sec)
{
  const acts = [{ date: '2026-11-26', studySeconds: 7140 }];
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 0, '7140 sec (1h59m) must not qualify');
  assert.strictEqual(res.todayQualified, false);
  console.log('✓ Test 2: 1h59m does not qualify passed');
}

// Test 3: Exactly 2 hours qualifies (+1 streak)
{
  const acts = [{ date: '2026-11-26', studySeconds: 7200 }];
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 1, '7200 sec (2h) must qualify with streak 1');
  assert.strictEqual(res.longestStreak, 1);
  assert.strictEqual(res.todayQualified, true);
  console.log('✓ Test 3: Exactly 2 hours qualifies passed');
}

// Test 4: 3 hours and 5 hours still only count as +1
{
  const acts = [{ date: '2026-11-26', studySeconds: 18000 }]; // 5 hours
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 1, '5 hours on 1 day is still only streak 1');
  console.log('✓ Test 4: Additional study time does not over-increment streak passed');
}

// Test 5: Consecutive qualifying days accumulate streak
{
  const acts = [
    { date: '2026-11-24', studySeconds: 7200 },
    { date: '2026-11-25', studySeconds: 8000 },
    { date: '2026-11-26', studySeconds: 7300 },
  ];
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 3, '3 consecutive days should yield streak 3');
  assert.strictEqual(res.longestStreak, 3);
  console.log('✓ Test 5: Consecutive qualifying days passed');
}

// Test 6: Missed day breaks current streak but preserves longest streak
{
  const acts = [
    { date: '2026-11-20', studySeconds: 7200 },
    { date: '2026-11-21', studySeconds: 7200 },
    { date: '2026-11-22', studySeconds: 7200 },
    // 2026-11-23 missed!
    // 2026-11-24 missed!
    { date: '2026-11-25', studySeconds: 7200 },
    { date: '2026-11-26', studySeconds: 7200 },
  ];
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 2, 'After missed day, streak restarts from recent qualifying period (2)');
  assert.strictEqual(res.longestStreak, 3, 'Longest streak of 3 must be preserved');
  console.log('✓ Test 6: Streak break and longest streak preservation passed');
}

// Test 7: Streak stays active today if yesterday qualified and today is in progress
{
  const acts = [
    { date: '2026-11-25', studySeconds: 7200 },
    { date: '2026-11-26', studySeconds: 1800 }, // 30 min today
  ];
  const res = calculateStreakFromActivities(acts, '2026-11-26');
  assert.strictEqual(res.currentStreak, 1, 'Current streak remains 1 since yesterday qualified');
  assert.strictEqual(res.todayQualified, false, 'Today is not yet qualified');
  assert.strictEqual(res.todayStudySeconds, 1800);
  console.log('✓ Test 7: Active streak buffer for current day passed');
}

console.log('ALL 7 STREAK ALGORITHM TESTS PASSED SUCCESSFULLY!');
