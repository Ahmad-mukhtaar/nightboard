import test from 'node:test';
import assert from 'node:assert/strict';

import { PomodoroController } from '../js/PomodoroController.js';

function createFakeBoard() {
  return {
    configureGrid() {},
    displayRows() {}
  };
}

test('PomodoroController returns to setup after the long break completes', () => {
  let cycleCompleted = false;
  const controller = new PomodoroController({
    board: createFakeBoard(),
    soundEngine: null,
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      goal: 'Finish draft'
    },
    onCycleComplete: () => {
      cycleCompleted = true;
    }
  });

  controller.state = {
    ...controller.state,
    mode: 'longBreak',
    prestartSeconds: null,
    isPaused: false,
    remainingSeconds: 1
  };

  controller._handleTick();

  assert.equal(cycleCompleted, true);
});
