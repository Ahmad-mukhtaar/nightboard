import {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  PROGRESS_SEGMENTS
} from './sessionDefaults.js';

export {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  PROGRESS_SEGMENTS
};

export function getProgressSegments(totalSeconds, remainingSeconds, segmentCount = PROGRESS_SEGMENTS) {
  if (totalSeconds <= 0) {
    return 0;
  }

  const elapsed = Math.max(0, totalSeconds - remainingSeconds);
  return Math.min(segmentCount, Math.floor((elapsed / totalSeconds) * segmentCount));
}

export function createInitialSessionState(settings = DEFAULTS) {
  const focusMinutes = settings.focusMinutes ?? DEFAULTS.focusMinutes;

  return {
    mode: 'focus',
    cycleIndex: 0,
    completedFocusSessions: 0,
    goal: settings.goal?.trim() || 'FOCUS SESSION',
    totalSeconds: focusMinutes * 60,
    remainingSeconds: focusMinutes * 60,
    prestartSeconds: PRESTART_SECONDS,
    isPaused: false
  };
}

export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function advanceMode(state, settings = DEFAULTS) {
  const nextCycleIndex = (state.cycleIndex + 1) % MODE_SEQUENCE.length;
  const nextMode = MODE_SEQUENCE[nextCycleIndex];
  const completedFocusSessions = state.mode === 'focus'
    ? state.completedFocusSessions + 1
    : state.completedFocusSessions;

  const minutes = nextMode === 'focus'
    ? settings.focusMinutes
    : nextMode === 'longBreak'
      ? settings.longBreakMinutes
      : settings.shortBreakMinutes;

  return {
    ...state,
    mode: nextMode,
    cycleIndex: nextCycleIndex,
    completedFocusSessions,
    totalSeconds: minutes * 60,
    remainingSeconds: minutes * 60,
    prestartSeconds: null,
    isPaused: false
  };
}

export function buildBoardRows({
  countdownLabel,
  prestartSeconds,
  isPaused
}) {
  const timerLine = prestartSeconds == null ? countdownLabel : `START IN ${prestartSeconds}`;
  const footerLine = isPaused
    ? 'SPACE RESUME'
    : prestartSeconds != null
      ? 'GO FULLSCREEN'
      : '';

  return [
    '',
    '',
    timerLine,
    '',
    footerLine
  ];
}
