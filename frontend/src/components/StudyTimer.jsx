import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { formatDuration } from '../data/sampleData';
import Button from './Button';
import Card from './Card';

function formatTimer(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function StudyTimer({ topicId, estimatedMinutes = 30, onSessionSaved }) {
  const storageKey = `skillpath_timer_${topicId}`;

  const [timerState, setTimerState] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recoveredSession, setRecoveredSession] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);
  const sessionDataRef = useRef({
    startedAt: null,
    accumulatedMs: 0,
    lastTick: null,
  });

  // Check for saved / interrupted timer session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timerState === 'running' || parsed.timerState === 'paused') {
          let calculatedElapsed = parsed.accumulatedMs || 0;
          if (parsed.timerState === 'running' && parsed.lastTick) {
            const timeSinceLastTick = Date.now() - parsed.lastTick;
            // If reasonable time (< 24 hours), accumulate it
            if (timeSinceLastTick > 0 && timeSinceLastTick < 24 * 3600 * 1000) {
              calculatedElapsed += timeSinceLastTick;
            }
          }
          setRecoveredSession({
            ...parsed,
            calculatedElapsed,
          });
          setElapsedMs(calculatedElapsed);
          setTimerState('paused'); // Pause by default so user can choose to resume or save
          sessionDataRef.current = {
            startedAt: parsed.startedAt || new Date().toISOString(),
            accumulatedMs: calculatedElapsed,
            lastTick: Date.now(),
          };
        }
      }
    } catch (err) {
      console.warn('Could not read timer state from storage:', err);
    }
  }, [storageKey]);

  // Timer tick loop based on timestamps
  useEffect(() => {
    if (timerState === 'running') {
      const interval = 250; // smooth 250ms interval
      sessionDataRef.current.lastTick = Date.now();

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - sessionDataRef.current.lastTick;
        sessionDataRef.current.lastTick = now;
        sessionDataRef.current.accumulatedMs += delta;

        setElapsedMs(sessionDataRef.current.accumulatedMs);

        // Persist to storage
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              timerState: 'running',
              startedAt: sessionDataRef.current.startedAt,
              accumulatedMs: sessionDataRef.current.accumulatedMs,
              lastTick: now,
            })
          );
        } catch (e) {
          // ignore storage quota errors
        }
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, storageKey]);

  function handleStart() {
    setRecoveredSession(null);
    const now = Date.now();
    sessionDataRef.current = {
      startedAt: new Date(now).toISOString(),
      accumulatedMs: 0,
      lastTick: now,
    };
    setElapsedMs(0);
    setTimerState('running');
    setSaveSuccess(false);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          timerState: 'running',
          startedAt: sessionDataRef.current.startedAt,
          accumulatedMs: 0,
          lastTick: now,
        })
      );
    } catch (e) {}
  }

  function handlePause() {
    setTimerState('paused');
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          timerState: 'paused',
          startedAt: sessionDataRef.current.startedAt,
          accumulatedMs: sessionDataRef.current.accumulatedMs,
          lastTick: Date.now(),
        })
      );
    } catch (e) {}
  }

  function handleResume() {
    setRecoveredSession(null);
    sessionDataRef.current.lastTick = Date.now();
    setTimerState('running');
  }

  async function handleStopAndSave() {
    const totalMs = sessionDataRef.current.accumulatedMs;
    const durationSeconds = Math.max(1, Math.round(totalMs / 1000));
    const startTime = sessionDataRef.current.startedAt || new Date(Date.now() - totalMs).toISOString();
    const endTime = new Date().toISOString();

    setIsSaving(true);
    try {
      if (onSessionSaved) {
        await onSessionSaved({
          startTime,
          endTime,
          durationSeconds,
        });
      }

      setTimerState('idle');
      setElapsedMs(0);
      setRecoveredSession(null);
      setSaveSuccess(true);
      localStorage.removeItem(storageKey);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert(`Failed to save study session: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (window.confirm('Discard this study session? This time will not be recorded.')) {
      setTimerState('idle');
      setElapsedMs(0);
      setRecoveredSession(null);
      localStorage.removeItem(storageKey);
    }
  }

  return (
    <Card className="study-timer-container">
      {recoveredSession && (
        <div className="timer-recovery-banner" role="alert">
          <AlertCircle size={16} />
          <span>Interrupted session recovered ({formatTimer(recoveredSession.calculatedElapsed)})</span>
          <div className="recovery-actions">
            <button type="button" className="text-btn resume-btn" onClick={handleResume}>Resume</button>
            <button type="button" className="text-btn save-btn" onClick={handleStopAndSave}>Save</button>
            <button type="button" className="text-btn discard-btn" onClick={handleDiscard}>Discard</button>
          </div>
        </div>
      )}

      <div className="timer-header">
        <div className="timer-label">
          <Clock size={16} />
          <span>STUDY TIMER</span>
        </div>
        <div className="timer-target">
          Estimated: <strong>{formatDuration(estimatedMinutes)}</strong>
        </div>
      </div>

      <div className="timer-display">
        <span className={`timer-digits ${timerState === 'running' ? 'timer-active' : ''}`}>
          {formatTimer(elapsedMs)}
        </span>
      </div>

      {saveSuccess && (
        <div className="timer-save-success">
          <CheckCircle2 size={16} />
          <span>Study session recorded and saved to database!</span>
        </div>
      )}

      <div className="timer-controls">
        {timerState === 'idle' ? (
          <Button variant="primary" className="timer-btn-lg" onClick={handleStart}>
            <Play size={18} fill="currentColor" /> Start Focus Session
          </Button>
        ) : timerState === 'running' ? (
          <div className="timer-btn-group">
            <Button variant="secondary" onClick={handlePause}>
              <Pause size={17} /> Pause
            </Button>
            <Button variant="primary" onClick={handleStopAndSave} disabled={isSaving}>
              <Square size={17} fill="currentColor" /> {isSaving ? 'Saving...' : 'Finish & Save'}
            </Button>
          </div>
        ) : (
          <div className="timer-btn-group">
            <Button variant="primary" onClick={handleResume}>
              <Play size={17} fill="currentColor" /> Resume
            </Button>
            <Button variant="secondary" onClick={handleStopAndSave} disabled={isSaving}>
              <Square size={17} fill="currentColor" /> {isSaving ? 'Saving...' : 'Save & Exit'}
            </Button>
            <button type="button" className="button button-text" onClick={handleDiscard}>
              <RotateCcw size={15} /> Discard
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
