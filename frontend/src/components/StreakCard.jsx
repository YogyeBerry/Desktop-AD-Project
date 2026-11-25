import React from 'react';
import { Flame, Trophy, Clock3 } from 'lucide-react';
import Card from './Card';

export default function StreakCard({ streakData }) {
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const todayStudySeconds = streakData?.todayStudySeconds || 0;
  const targetSeconds = streakData?.targetSeconds || 7200; // 2 hours
  const todayQualified = streakData?.todayQualified || false;

  const todayMinutes = Math.round(todayStudySeconds / 60);
  const targetMinutes = Math.round(targetSeconds / 60);
  const percentComplete = Math.min(100, Math.round((todayStudySeconds / targetSeconds) * 100));

  return (
    <Card className="streak-card">
      <div className="streak-card-inner">
        {/* Left: Flame and Count */}
        <div className="streak-primary">
          <div className={`streak-icon-pill ${currentStreak > 0 ? 'active' : ''}`}>
            <Flame size={18} className="flame-svg" />
          </div>
          <div className="streak-titles">
            <div className="streak-count-row">
              <span className="streak-number">{currentStreak}</span>
              <span className="streak-label">{currentStreak === 1 ? 'day streak' : 'days streak'}</span>
            </div>
            <p className="streak-status">
              {todayQualified ? (
                <span className="status-achieved">Daily goal achieved (+1 streak locked)</span>
              ) : (
                <span>2 hrs daily focus target to advance streak</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Progress bar & Best record */}
        <div className="streak-metrics">
          <div className="streak-progress-box">
            <div className="streak-progress-header">
              <span className="progress-title">
                <Clock3 size={12} /> Today: {todayMinutes}m / {targetMinutes}m
              </span>
              <span className="progress-pct">{percentComplete}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="streak-record-badge">
            <Trophy size={13} className="trophy-svg" />
            <span>Best: <strong>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</strong></span>
          </div>
        </div>
      </div>
    </Card>
  );
}
