import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeSettings, loadStoredSettings } from '../js/storage.js';

test('normalizeSettings falls back to defaults for invalid persisted values', () => {
  const settings = normalizeSettings({
    mode: 'weird',
    focusMinutes: 'bad',
    shortBreakMinutes: -1,
    longBreakMinutes: 0,
    soundEnabled: false,
    goal: '  Finish draft  ',
    city: '  Helsinki  '
  });

  assert.equal(settings.mode, 'pomodoro');
  assert.equal(settings.focusMinutes, 25);
  assert.equal(settings.shortBreakMinutes, 5);
  assert.equal(settings.longBreakMinutes, 15);
  assert.equal(settings.soundEnabled, false);
  assert.equal(settings.goal, 'Finish draft');
  assert.equal(settings.city, 'Helsinki');
});

test('loadStoredSettings returns defaults when storage is unavailable', () => {
  assert.doesNotThrow(() => loadStoredSettings(null));
});

test('normalizeSettings preserves valid custom minute values', () => {
  const settings = normalizeSettings({
    mode: 'clock',
    focusMinutes: '37',
    shortBreakMinutes: '8',
    longBreakMinutes: '22',
    soundEnabled: true,
    goal: 'Custom block',
    city: 'Tokyo'
  });

  assert.equal(settings.mode, 'clock');
  assert.equal(settings.focusMinutes, 37);
  assert.equal(settings.shortBreakMinutes, 8);
  assert.equal(settings.longBreakMinutes, 22);
  assert.equal(settings.city, 'Tokyo');
});
