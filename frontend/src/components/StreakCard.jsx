import React from 'react';
import { Flame, Trophy, Clock, CheckCircle } from 'lucide-react';
import Card from './Card';
import ProgressBar from './ProgressBar';

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
      <div className="streak-card-content">
        <div className="streak-icon-wrapper">
          <div className={`streak-flame-circle ${currentStreak > 0 ? 'active' : ''}`}>
            <Flame className="streak-flame-icon" size={26} />
          </div>
          <div className="streak-main-info">
            <div className="streak-number-row">
              <span className="streak-count">{currentStreak}</span>
              <span className="streak-unit">{currentStreak === 1 ? 'day streak' : 'days streak'}</span>
            </div>
            <p className="streak-subtitle">
              {todayQualified ? (
                <span className="streak-status-met">
                  <CheckCircle size={13} /> Target reached today (+1 streak locked!)
                </span>
              ) : (
                <span>2 hrs daily target to advance streak</span>
              )}
            </p>
          </div>
        </div>

        <div className="streak-stats-row">
          <div className="streak-best-badge">
            <Trophy size={14} className="trophy-icon" />
            <span>Best: <strong>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</strong></span>
          </div>

          <div className="streak-today-progress">
            <div className="streak-progress-labels">
              <span className="streak-progress-title">
                <Clock size={12} /> Today: {todayMinutes}m / {targetMinutes}m
              </span>
              <span className="streak-progress-percent">{percentComplete}%</span>
            </div>
            <ProgressBar value={percentComplete} />
          </div>
        </div>
      </div>
    </Card>
  );
}
