import React, { useState, useMemo } from 'react';
import Card from './Card';
import { formatDuration } from '../data/sampleData';

function toLocalDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function getIntensityLevel(timerStarts) {
  if (!timerStarts || timerStarts <= 0) return 0;
  if (timerStarts === 1) return 1;
  if (timerStarts <= 3) return 2;
  if (timerStarts <= 6) return 3;
  return 4;
}

export default function StudyHeatmap({ activities = [], title = 'Activity' }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activityMap = useMemo(() => {
    const map = new Map();
    activities.forEach((act) => {
      map.set(act.date, act);
    });
    return map;
  }, [activities]);

  const { weeks, monthLabels, totalStarts, totalStudySeconds } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

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
      y: rect.top - 6,
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <Card className="heatmap-card">
      <div className="heatmap-header">
        <div className="heatmap-meta">
          <span className="heatmap-title">{title}</span>
          <span className="heatmap-summary">
            {totalStarts} sessions • {formatDuration(Math.round(totalStudySeconds / 60))} past year
          </span>
        </div>
        <div className="heatmap-legend">
          <span className="legend-text">Less</span>
          <span className="hm-cell lvl-0" />
          <span className="hm-cell lvl-1" />
          <span className="hm-cell lvl-2" />
          <span className="hm-cell lvl-3" />
          <span className="hm-cell lvl-4" />
          <span className="legend-text">More</span>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-scroll">
          <div className="heatmap-month-bar">
            <div className="hm-spacer" />
            <div className="hm-months">
              {monthLabels.map((m, idx) => (
                <span
                  key={`${m.name}-${idx}`}
                  className="hm-month"
                  style={{ left: `${m.weekIndex * 14.5}px` }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="heatmap-matrix">
            <div className="hm-weekdays">
              <span>M</span>
              <span>W</span>
              <span>F</span>
            </div>

            <div className="hm-columns">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="hm-col">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`hm-cell lvl-${day.level} ${day.isFuture ? 'future' : ''}`}
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

      {hoveredDay && (
        <div
          className="hm-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="tt-date">{formatReadableDate(hoveredDay.date)}</div>
          <div className="tt-stat">
            {hoveredDay.timerStarts} {hoveredDay.timerStarts === 1 ? 'session' : 'sessions'} started
          </div>
          {hoveredDay.studySeconds > 0 && (
            <div className="tt-time">
              {formatDuration(Math.round(hoveredDay.studySeconds / 60))} studied
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
