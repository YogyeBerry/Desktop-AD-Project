import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { formatDuration } from '../data/sampleData';
import Button from './Button';
import Card from './Card';
import activityService from '../services/activityService';
import { useLearning } from '../context/useLearning';

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

export default function StudyTimer({
  topicId,
  topicTitle = 'Focus Session',
  estimatedMinutes = 30,
  onSessionSaved,
}) {
  const storageKey = `skillpath_timer_${topicId}`;
  const { recordTimerStart } = useLearning();

  const [timerState, setTimerState] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recoveredSession, setRecoveredSession] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const timerRef = useRef(null);
  const sessionDataRef = useRef({
    startedAt: null,
    accumulatedMs: 0,
    lastTick: null,
  });

  // Listen to native fullscreen/focus-mode exit events and Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isFocusMode) {
        exitFocusMode();
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    let cleanupIpc = null;
    if (window.electronAPI?.onFocusModeStatusChanged) {
      cleanupIpc = window.electronAPI.onFocusModeStatusChanged((data) => {
        if (!data.isFocusMode) {
          setIsFocusMode(false);
        }
      });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupIpc) cleanupIpc();
    };
  }, [isFocusMode]);

  async function enterFocusMode() {
    setIsFocusMode(true);
    if (window.electronAPI?.enterFocusMode) {
      try {
        await window.electronAPI.enterFocusMode({ useKiosk: true });
      } catch (e) {
        console.warn('Native focus mode trigger failed:', e);
      }
    }
  }

  async function exitFocusMode() {
    setIsFocusMode(false);
    if (window.electronAPI?.exitFocusMode) {
      try {
        await window.electronAPI.exitFocusMode();
      } catch (e) {
        console.warn('Native exit focus mode failed:', e);
      }
    }
  }

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
            if (timeSinceLastTick > 0 && timeSinceLastTick < 24 * 3600 * 1000) {
              calculatedElapsed += timeSinceLastTick;
            }
          }
          setRecoveredSession({
            ...parsed,
            calculatedElapsed,
          });
          setElapsedMs(calculatedElapsed);
          setTimerState('paused');
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
      const interval = 250;
      sessionDataRef.current.lastTick = Date.now();

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - sessionDataRef.current.lastTick;
        sessionDataRef.current.lastTick = now;
        sessionDataRef.current.accumulatedMs += delta;

        setElapsedMs(sessionDataRef.current.accumulatedMs);

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
        } catch (e) {}
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
      if (recordTimerStart) {
        recordTimerStart();
      } else {
        activityService.recordStart().catch((err) => {
          console.warn('Could not record activity start:', err);
        });
      }
    } catch (e) {}

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
      if (isFocusMode) {
        await exitFocusMode();
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert(`Failed to save study session: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (window.confirm('Discard this study session? This duration will not be saved.')) {
      setTimerState('idle');
      setElapsedMs(0);
      setRecoveredSession(null);
      localStorage.removeItem(storageKey);
    }
  }

  return (
    <Card className="study-timer-card">
      {recoveredSession && (
        <div className="timer-recovery-bar" role="alert">
          <AlertCircle size={14} />
          <span>Interrupted session recovered ({formatTimer(recoveredSession.calculatedElapsed)})</span>
          <div className="recovery-actions">
            <button type="button" className="recovery-btn" onClick={handleResume}>Resume</button>
            <button type="button" className="recovery-btn" onClick={handleStopAndSave}>Save</button>
            <button type="button" className="recovery-btn discard" onClick={handleDiscard}>Discard</button>
          </div>
        </div>
      )}

      {/* Timer Meta Row */}
      <div className="timer-meta-bar">
        <div className="timer-badge">
          <Clock size={13} />
          <span>STUDY TIMER</span>
        </div>
        <div className="timer-actions-right">
          <button
            type="button"
            className="focus-trigger-btn"
            onClick={enterFocusMode}
            title="Enter Distraction-Free Focus Mode (Kiosk)"
          >
            <Maximize2 size={13} />
            <span>Focus Mode</span>
          </button>
          <span className="timer-estimate">
            Target: <strong>{formatDuration(estimatedMinutes)}</strong>
          </span>
        </div>
      </div>

      {/* Monospace Digits */}
      <div className="timer-face">
        <span className={`timer-clock-digits ${timerState === 'running' ? 'active-ticking' : ''}`}>
          {formatTimer(elapsedMs)}
        </span>
      </div>

      {saveSuccess && (
        <div className="timer-success-pill">
          <CheckCircle2 size={14} />
          <span>Session saved to your study log</span>
        </div>
      )}

      {/* Timer Action Buttons */}
      <div className="timer-button-row">
        {timerState === 'idle' ? (
          <Button variant="primary" className="timer-main-btn" onClick={handleStart}>
            <Play size={15} fill="currentColor" /> Start Focus Session
          </Button>
        ) : timerState === 'running' ? (
          <div className="timer-active-group">
            <Button variant="secondary" onClick={handlePause}>
              <Pause size={14} /> Pause
            </Button>
            <Button variant="primary" onClick={handleStopAndSave} disabled={isSaving}>
              <Square size={14} fill="currentColor" /> {isSaving ? 'Saving...' : 'Finish & Save'}
            </Button>
          </div>
        ) : (
          <div className="timer-active-group">
            <Button variant="primary" onClick={handleResume}>
              <Play size={14} fill="currentColor" /> Resume
            </Button>
            <Button variant="secondary" onClick={handleStopAndSave} disabled={isSaving}>
              <Square size={14} fill="currentColor" /> {isSaving ? 'Saving...' : 'Save & Exit'}
            </Button>
            <button type="button" className="btn-discard" onClick={handleDiscard}>
              <RotateCcw size={13} /> Discard
            </button>
          </div>
        )}
      </div>

      {/* FULLSCREEN FOCUS OVERLAY */}
      {isFocusMode && (
        <div className="fullscreen-focus-overlay">
          <div className="focus-mode-backdrop" />
          <div className="focus-mode-container">
            <div className="focus-top-bar">
              <div className="focus-badge">
                <span>DISTRACTION-FREE FOCUS MODE</span>
              </div>
              <button
                type="button"
                className="focus-exit-btn"
                onClick={exitFocusMode}
                title="Exit Focus Mode (Esc)"
              >
                <Minimize2 size={15} />
                <span>Exit (Esc)</span>
              </button>
            </div>

            <div className="focus-center-content">
              <h1 className="focus-topic-title">{topicTitle}</h1>
              <p className="focus-topic-target">
                Target: {formatDuration(estimatedMinutes)} • Quiet focus
              </p>

              <div className="focus-timer-display">
                <span className={`focus-timer-digits ${timerState === 'running' ? 'focus-timer-pulsing' : ''}`}>
                  {formatTimer(elapsedMs)}
                </span>
              </div>

              <div className="focus-controls">
                {timerState === 'idle' ? (
                  <Button variant="primary" className="focus-btn-action" onClick={handleStart}>
                    <Play size={18} fill="currentColor" /> Start Session
                  </Button>
                ) : timerState === 'running' ? (
                  <div className="focus-btn-group">
                    <Button variant="secondary" className="focus-btn-action" onClick={handlePause}>
                      <Pause size={16} /> Pause
                    </Button>
                    <Button variant="primary" className="focus-btn-action" onClick={handleStopAndSave} disabled={isSaving}>
                      <Square size={16} fill="currentColor" /> {isSaving ? 'Saving...' : 'Finish & Save'}
                    </Button>
                  </div>
                ) : (
                  <div className="focus-btn-group">
                    <Button variant="primary" className="focus-btn-action" onClick={handleResume}>
                      <Play size={16} fill="currentColor" /> Resume
                    </Button>
                    <Button variant="secondary" className="focus-btn-action" onClick={handleStopAndSave} disabled={isSaving}>
                      <Square size={16} fill="currentColor" /> {isSaving ? 'Saving...' : 'Save & Exit'}
                    </Button>
                    <button type="button" className="focus-discard-btn" onClick={handleDiscard}>
                      <RotateCcw size={14} /> Discard
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="focus-bottom-hint">
              <span>Press <kbd>Esc</kbd> anytime or click the top-right button to exit Focus Mode</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
