import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  getProgressSegments,
  createInitialSessionState,
  advanceMode,
  formatCountdown,
  buildBoardRows
} from '../js/sessionState.js';

test('progress segments round down until time has actually elapsed', () => {
  assert.equal(getProgressSegments(25 * 60, 25 * 60, 20), 0);
  assert.equal(getProgressSegments(25 * 60, 12 * 60, 20), 10);
  assert.equal(getProgressSegments(25 * 60, 0, 20), 20);
});

test('session defaults expose the required focus board presets', () => {
  assert.equal(DEFAULTS.focusMinutes, 25);
  assert.equal(DEFAULTS.shortBreakMinutes, 5);
  assert.equal(DEFAULTS.longBreakMinutes, 15);
  assert.equal(PRESTART_SECONDS, 5);
  assert.deepEqual(MODE_SEQUENCE, ['focus', 'shortBreak', 'focus', 'shortBreak', 'focus', 'shortBreak', 'focus', 'longBreak']);
});

test('advanceMode moves from focus into short break until the fourth cycle', () => {
  const state = createInitialSessionState({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    goal: 'Ship landing page'
  });

  const afterFirstFocus = advanceMode({
    ...state,
    cycleIndex: 0,
    mode: 'focus',
    completedFocusSessions: 0
  }, {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15
  });
  assert.equal(afterFirstFocus.mode, 'shortBreak');

  const afterFourthFocus = advanceMode({
    ...state,
    cycleIndex: 6,
    mode: 'focus',
    completedFocusSessions: 3
  }, {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15
  });
  assert.equal(afterFourthFocus.mode, 'longBreak');
});

test('formatCountdown renders MM:SS and pads correctly', () => {
  assert.equal(formatCountdown(5), '00:05');
  assert.equal(formatCountdown(65), '01:05');
  assert.equal(formatCountdown((24 * 60) + 17), '24:17');
});

test('buildBoardRows returns a sparse five-row board layout', () => {
  const rows = buildBoardRows({
    countdownLabel: '24:17',
    prestartSeconds: null,
    modeLabel: 'FOCUS',
    goalLabel: 'CODING SESSION',
    isPaused: false
  });

  assert.equal(rows.length, 5);
  assert.equal(rows[0], '');
  assert.equal(rows[1], '');
  assert.match(rows[2], /24:17/);
  assert.equal(rows[3], '');
  assert.equal(rows[4], '');
});

test('buildBoardRows swaps in event messages for prestart and paused states', () => {
  const prestartRows = buildBoardRows({
    countdownLabel: '25:00',
    prestartSeconds: 5,
    modeLabel: 'FOCUS',
    goalLabel: 'CODING SESSION',
    isPaused: false
  });

  assert.equal(prestartRows[0], '');
  assert.equal(prestartRows[1], '');
  assert.equal(prestartRows[2], 'START IN 5');
  assert.equal(prestartRows[3], '');
  assert.equal(prestartRows[4], 'GO FULLSCREEN');

  const pausedRows = buildBoardRows({
    countdownLabel: '18:21',
    prestartSeconds: null,
    modeLabel: 'FOCUS',
    goalLabel: 'CODING SESSION',
    isPaused: true
  });

  assert.equal(pausedRows[0], '');
  assert.equal(pausedRows[1], '');
  assert.equal(pausedRows[2], '18:21');
  assert.equal(pausedRows[3], '');
  assert.equal(pausedRows[4], 'SPACE RESUME');
});
