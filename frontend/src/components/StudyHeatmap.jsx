import React, { useState, useMemo } from 'react';
import Card from './Card';
import { formatDuration } from '../data/sampleData';

/**
 * Format Date to local YYYY-MM-DD string
 */
function toLocalDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format readable date: e.g. "Nov 26, 2026"
 */
function formatReadableDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * GitHub-style intensity tier based on timer starts:
 * 0: default / empty
 * 1: light green
 * 2-3: medium-light green
 * 4-6: medium green
 * 7+: dark green
 */
function getIntensityLevel(timerStarts) {
  if (!timerStarts || timerStarts <= 0) return 0;
  if (timerStarts === 1) return 1;
  if (timerStarts <= 3) return 2;
  if (timerStarts <= 6) return 3;
  return 4;
}

export default function StudyHeatmap({ activities = [], title = 'Study Activity Heatmap' }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map activities by date string: { "2026-11-26": { timerStarts: 3, studySeconds: 4200 } }
  const activityMap = useMemo(() => {
    const map = new Map();
    activities.forEach((act) => {
      map.set(act.date, act);
    });
    return map;
  }, [activities]);

  // Generate 52 weeks (364 days + remainder to end on today)
  const { weeks, monthLabels, totalStarts, totalStudySeconds } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on the coming Saturday or today
    const dayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
    // We want the grid to end at the end of current week (Saturday)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

    // 52 weeks = 364 days total
    const numDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - numDays + 1);

    const generatedWeeks = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;

    let startsCount = 0;
    let secondsCount = 0;

    const curr = new Date(startDate);
    let dayIndex = 0;

    while (curr <= endDate) {
      const dateStr = toLocalDateStr(curr);
      const isFuture = curr > today;
      const act = activityMap.get(dateStr);

      const starts = act ? act.timerStarts : 0;
      const seconds = act ? act.studySeconds : 0;

      if (!isFuture) {
        startsCount += starts;
        secondsCount += seconds;
      }

      // Track month labels at top of week 0-51
      const month = curr.getMonth();
      const weekIndex = Math.floor(dayIndex / 7);
      if (curr.getDate() <= 7 && month !== lastMonth && weekIndex < 50) {
        months.push({
          weekIndex,
          name: curr.toLocaleDateString(undefined, { month: 'short' }),
        });
        lastMonth = month;
      }

      currentWeek.push({
        date: dateStr,
        dayOfWeek: curr.getDay(),
        timerStarts: starts,
        studySeconds: seconds,
        isFuture,
        level: isFuture ? 0 : getIntensityLevel(starts),
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
      dayIndex++;
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalStarts: startsCount,
      totalStudySeconds: secondsCount,
    };
  }, [activityMap]);

  const handleMouseEnter = (day, e) => {
    if (day.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <Card className="study-heatmap-card">
      <div className="heatmap-header">
        <div>
          <h3>{title}</h3>
          <p className="heatmap-subtitle">
            {totalStarts} sessions started • {formatDuration(Math.round(totalStudySeconds / 60))} total study time over past year
          </p>
        </div>
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <span className="heatmap-cell level-0" />
          <span className="heatmap-cell level-1" />
          <span className="heatmap-cell level-2" />
          <span className="heatmap-cell level-3" />
          <span className="heatmap-cell level-4" />
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-scroll-container">
        <div className="heatmap-inner">
          {/* Month labels along the top */}
          <div className="heatmap-month-row">
            <div className="heatmap-weekday-spacer" />
            <div className="heatmap-month-labels">
              {monthLabels.map((m, idx) => (
                <span
                  key={`${m.name}-${idx}`}
                  className="heatmap-month-label"
                  style={{ left: `${(m.weekIndex * 15.5)}px` }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="heatmap-body">
            {/* Weekday indicators (Mon, Wed, Fri) */}
            <div className="heatmap-weekdays">
              <span className="weekday-label">Mon</span>
              <span className="weekday-label">Wed</span>
              <span className="weekday-label">Fri</span>
            </div>

            {/* Weeks columns */}
            <div className="heatmap-grid">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="heatmap-week-col">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`heatmap-cell level-${day.level} ${day.isFuture ? 'future-day' : ''}`}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      role="gridcell"
                      aria-label={`${day.date}: ${day.timerStarts} sessions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {hoveredDay && (
        <div
          className="heatmap-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="tooltip-date">{formatReadableDate(hoveredDay.date)}</div>
          <div className="tooltip-stat">
            <strong>{hoveredDay.timerStarts}</strong> {hoveredDay.timerStarts === 1 ? 'session' : 'sessions'} started
          </div>
          {hoveredDay.studySeconds > 0 && (
            <div className="tooltip-duration">
              {formatDuration(Math.round(hoveredDay.studySeconds / 60))} studied
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
