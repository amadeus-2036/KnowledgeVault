import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Brain, Coffee, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../api/repositories.api';

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [selectedRepo, setSelectedRepo] = useState('');
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem('pomodoroSessions') || '0', 10);
  });
  
  const timerRef = useRef(null);

  const { data: repositories = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => getRepositories().then((r) => r.data.data),
  });

  const MODES = {
    focus: { minutes: 25, label: 'Focus', color: 'var(--color-primary)' },
    shortBreak: { minutes: 5, label: 'Short Break', color: 'var(--color-accent)' },
    longBreak: { minutes: 15, label: 'Long Break', color: 'var(--color-text-secondary)' },
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      if (mode === 'focus') {
        const newCount = sessionsCompleted + 1;
        setSessionsCompleted(newCount);
        localStorage.setItem('pomodoroSessions', newCount.toString());
        // Auto switch to break?
        setMode('shortBreak');
        setTimeLeft(MODES.shortBreak.minutes * 60);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / (MODES[mode].minutes * 60);

  return (
    <div style={{ padding: 'var(--page-padding)', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
          Focus Space
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)', fontSize: 15 }}>
          Deep work sessions for your research.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        
        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--color-surface-2)', padding: 6, borderRadius: 99 }}>
          {Object.entries(MODES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => changeMode(key)}
              style={{
                padding: '8px 20px',
                borderRadius: 99,
                border: 'none',
                background: mode === key ? 'var(--color-surface-1)' : 'transparent',
                color: mode === key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: mode === key ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: mode === key ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Progress Ring */}
          <svg width="280" height="280" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle
              cx="140" cy="140" r="130"
              fill="none" stroke="var(--color-surface-2)" strokeWidth="6"
            />
            <circle
              cx="140" cy="140" r="130"
              fill="none" stroke={MODES[mode].color} strokeWidth="6"
              strokeDasharray={130 * 2 * Math.PI}
              strokeDashoffset={130 * 2 * Math.PI * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Time Display */}
          <div style={{ fontSize: 72, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={toggleTimer}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: isActive ? 'var(--color-surface-2)' : MODES[mode].color,
              color: isActive ? 'var(--color-text-primary)' : '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: isActive ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
          >
            {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
          </button>
          <button
            onClick={resetTimer}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Focus Space Selection */}
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <Brain size={20} color="var(--color-text-secondary)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Focusing on</div>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--color-text-secondary)', fontSize: 14, width: '100%', padding: '4px 0',
                cursor: 'pointer'
              }}
            >
              <option value="">General Work</option>
              {repositories.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 'auto', paddingTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Sessions Today
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {sessionsCompleted}
            </div>
          </div>
          <div style={{ width: 1, height: 30, background: 'var(--color-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <Timer size={16} /> Total Focus Time
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {(sessionsCompleted * 25 / 60).toFixed(1)}h
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
