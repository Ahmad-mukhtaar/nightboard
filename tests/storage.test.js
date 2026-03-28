import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeSettings, loadStoredSettings } from '../js/storage.js';

test('normalizeSettings falls back to defaults for invalid persisted values', () => {
  const settings = normalizeSettings({
    focusMinutes: 'bad',
    shortBreakMinutes: -1,
    longBreakMinutes: 0,
    soundEnabled: false,
    goal: '  Finish draft  '
  });

  assert.equal(settings.focusMinutes, 25);
  assert.equal(settings.shortBreakMinutes, 5);
  assert.equal(settings.longBreakMinutes, 15);
  assert.equal(settings.soundEnabled, false);
  assert.equal(settings.goal, 'Finish draft');
});

test('loadStoredSettings returns defaults when storage is unavailable', () => {
  assert.doesNotThrow(() => loadStoredSettings(null));
});
