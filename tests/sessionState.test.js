import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  getProgressSegments
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
