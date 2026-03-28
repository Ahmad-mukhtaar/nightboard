# Retro Focus Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the quote-rotator demo with a desktop-first Pomodoro app that uses a compact setup landing page and a retro split-flap board for live focus sessions.

**Architecture:** Keep the project as a static HTML/CSS/JS app, but pivot the runtime from rotating hardcoded quotes to a small session state machine. Reuse the tile grid and audio engine where they still help, add pure timer/state modules that can be covered with `node --test`, and reorganize the UI into two modes: landing and board.

**Tech Stack:** Vanilla HTML, CSS, browser ES modules, Web Audio API, `localStorage`, Node built-in test runner

---

## File Structure

### Existing files to modify

- `index.html`
  - Replace the fake marketing hero with a compact session-setup landing page.
- `css/layout.css`
  - Restyle the landing page into a setup screen and handle the landing-to-board mode switch.
- `css/board.css`
  - Push the board toward the airport-board reference and add room for board-native status rows.
- `css/tile.css`
  - Refine tile motion and visual treatment toward more authentic monochrome split-flap behavior.
- `css/responsive.css`
  - Keep desktop-first sizing coherent and preserve fullscreen behavior after the layout pivot.
- `js/main.js`
  - Replace quote-rotator bootstrapping with app boot, form handling, persistence, and controller wiring.
- `js/Board.js`
  - Keep tile-grid creation, but change the public API from “display a quote” to “render board session rows and indicators”.
- `js/KeyboardController.js`
  - Swap navigation shortcuts for session controls.
- `js/SoundEngine.js`
  - Preserve current behavior, but make sure it can be toggled from landing-page preferences and board controls.
- `js/constants.js`
  - Remove quote data and replace it with board layout, timing defaults, and state-label constants.

### New files to create

- `package.json`
  - Minimal metadata plus test scripts so `node --test` can import the ES modules cleanly.
- `js/sessionDefaults.js`
  - Small shared constants and defaults for focus/break durations, prestart countdown, and storage keys.
- `js/storage.js`
  - Pure wrapper for loading and saving persisted preferences with safe fallbacks.
- `js/sessionState.js`
  - Pure session state machine and formatting helpers for countdowns, mode transitions, progress segments, and board rows.
- `js/PomodoroController.js`
  - Runtime orchestrator for countdown ticks, prestart countdown, mode transitions, and board updates.
- `tests/sessionState.test.js`
  - Coverage for timer transitions, progress math, and board-row formatting.
- `tests/storage.test.js`
  - Coverage for persistence fallbacks and data normalization.

## Task 1: Add a Minimal Test Harness and Session Defaults

**Files:**
- Create: `package.json`
- Create: `js/sessionDefaults.js`
- Test: `tests/sessionState.test.js`

- [ ] **Step 1: Write the failing test for session defaults and progress math**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sessionState.test.js`

Expected: FAIL with missing exports because `js/sessionState.js` does not exist yet.

- [ ] **Step 3: Create the minimal project test metadata**

```json
{
  "name": "flipoff",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

```js
// js/sessionDefaults.js
export const DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  goal: ''
};

export const PRESTART_SECONDS = 5;
export const PROGRESS_SEGMENTS = 20;
export const MODE_SEQUENCE = [
  'focus',
  'shortBreak',
  'focus',
  'shortBreak',
  'focus',
  'shortBreak',
  'focus',
  'longBreak'
];

export const STORAGE_KEYS = {
  settings: 'flipoff.settings',
  todayCount: 'flipoff.todayCount'
};
```

- [ ] **Step 4: Add the smallest `js/sessionState.js` export surface needed for the test**

```js
// js/sessionState.js
import { DEFAULTS, PRESTART_SECONDS, MODE_SEQUENCE, PROGRESS_SEGMENTS } from './sessionDefaults.js';

export { DEFAULTS, PRESTART_SECONDS, MODE_SEQUENCE, PROGRESS_SEGMENTS };

export function getProgressSegments(totalSeconds, remainingSeconds, segmentCount = PROGRESS_SEGMENTS) {
  if (totalSeconds <= 0) return 0;
  const elapsed = Math.max(0, totalSeconds - remainingSeconds);
  return Math.min(segmentCount, Math.floor((elapsed / totalSeconds) * segmentCount));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/sessionState.test.js`

Expected: PASS with 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add package.json js/sessionDefaults.js js/sessionState.js tests/sessionState.test.js
git commit -m "test: add pomodoro session defaults coverage"
```

## Task 2: Build and Test the Pure Session State Model

**Files:**
- Modify: `js/sessionState.js`
- Modify: `tests/sessionState.test.js`

- [ ] **Step 1: Write failing tests for mode transitions, countdown labels, and board row generation**

```js
test('advanceMode moves from focus into short break until the fourth cycle', () => {
  const state = createInitialSessionState({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    goal: 'Ship landing page'
  });

  const afterFirstFocus = advanceMode({ ...state, cycleIndex: 0, mode: 'focus', completedFocusSessions: 0 });
  assert.equal(afterFirstFocus.mode, 'shortBreak');

  const afterFourthFocus = advanceMode({ ...state, cycleIndex: 6, mode: 'focus', completedFocusSessions: 3 });
  assert.equal(afterFourthFocus.mode, 'longBreak');
});

test('formatCountdown renders MM:SS and pads correctly', () => {
  assert.equal(formatCountdown(5), '00:05');
  assert.equal(formatCountdown(65), '01:05');
  assert.equal(formatCountdown(24 * 60 + 17), '24:17');
});

test('buildBoardRows returns stable five-row board content', () => {
  const rows = buildBoardRows({
    currentTimeLabel: '17:47',
    modeLabel: 'FOCUS',
    countdownLabel: '24:17',
    goalLabel: 'SHIP LANDING PAGE',
    completedLabel: 'TODAY 03',
    progressFilled: 8,
    progressSegments: 20,
    prestartSeconds: null
  });

  assert.equal(rows.length, 5);
  assert.match(rows[0], /17:47/);
  assert.match(rows[2], /24:17/);
  assert.match(rows[3], /SHIP LANDING PAGE/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sessionState.test.js`

Expected: FAIL with missing `createInitialSessionState`, `advanceMode`, `formatCountdown`, or `buildBoardRows`.

- [ ] **Step 3: Implement the pure session helpers**

```js
export function createInitialSessionState(settings) {
  return {
    mode: 'focus',
    cycleIndex: 0,
    completedFocusSessions: 0,
    goal: settings.goal?.trim() || 'FOCUS SESSION',
    totalSeconds: settings.focusMinutes * 60,
    remainingSeconds: settings.focusMinutes * 60,
    prestartSeconds: PRESTART_SECONDS,
    isPaused: false
  };
}

export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
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
  currentTimeLabel,
  modeLabel,
  countdownLabel,
  goalLabel,
  completedLabel,
  progressFilled,
  progressSegments,
  prestartSeconds
}) {
  const progressRow = `${'■'.repeat(progressFilled)}${'□'.repeat(progressSegments - progressFilled)}`;
  const timerLine = prestartSeconds == null ? countdownLabel : `STARTING IN ${prestartSeconds}`;

  return [
    `${currentTimeLabel} ${modeLabel}`.trim(),
    '',
    timerLine,
    goalLabel,
    `${completedLabel} ${progressRow}`.trim()
  ];
}
```

- [ ] **Step 4: Run the full test file**

Run: `node --test tests/sessionState.test.js`

Expected: PASS with session-model coverage succeeding.

- [ ] **Step 5: Commit**

```bash
git add js/sessionState.js tests/sessionState.test.js
git commit -m "feat: add pure pomodoro session state model"
```

## Task 3: Add Safe Persistence and Controller Wiring

**Files:**
- Create: `js/storage.js`
- Create: `js/PomodoroController.js`
- Create: `tests/storage.test.js`
- Modify: `js/main.js`

- [ ] **Step 1: Write failing tests for storage fallback behavior**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/storage.test.js`

Expected: FAIL because `js/storage.js` does not exist yet.

- [ ] **Step 3: Implement storage helpers**

```js
// js/storage.js
import { DEFAULTS, STORAGE_KEYS } from './sessionDefaults.js';

export function normalizeSettings(raw = {}) {
  const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    focusMinutes: toPositiveInt(raw.focusMinutes, DEFAULTS.focusMinutes),
    shortBreakMinutes: toPositiveInt(raw.shortBreakMinutes, DEFAULTS.shortBreakMinutes),
    longBreakMinutes: toPositiveInt(raw.longBreakMinutes, DEFAULTS.longBreakMinutes),
    soundEnabled: raw.soundEnabled ?? DEFAULTS.soundEnabled,
    goal: typeof raw.goal === 'string' ? raw.goal.trim() : DEFAULTS.goal
  };
}

export function loadStoredSettings(storage = window?.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEYS.settings);
    return normalizeSettings(raw ? JSON.parse(raw) : DEFAULTS);
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveStoredSettings(settings, storage = window?.localStorage) {
  try {
    storage?.setItem(STORAGE_KEYS.settings, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // ignore storage failures and keep the session running
  }
}
```

- [ ] **Step 4: Build the runtime controller skeleton**

```js
// js/PomodoroController.js
import {
  createInitialSessionState,
  buildBoardRows,
  formatCountdown,
  getProgressSegments
} from './sessionState.js';

export class PomodoroController {
  constructor({ board, soundEngine, settings, now = () => new Date() }) {
    this.board = board;
    this.soundEngine = soundEngine;
    this.settings = settings;
    this.now = now;
    this.state = createInitialSessionState(settings);
    this._interval = null;
  }

  startPrelaunch() {}
  pauseToggle() {}
  reset() {}
  updateBoard() {
    const currentTimeLabel = this.now().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const countdownLabel = formatCountdown(this.state.remainingSeconds);
    const progressFilled = getProgressSegments(this.state.totalSeconds, this.state.remainingSeconds);

    this.board.displayRows(buildBoardRows({
      currentTimeLabel,
      modeLabel: this.state.mode.toUpperCase(),
      countdownLabel,
      goalLabel: this.state.goal.toUpperCase(),
      completedLabel: `TODAY ${String(this.state.completedFocusSessions).padStart(2, '0')}`,
      progressFilled,
      progressSegments: 20,
      prestartSeconds: this.state.prestartSeconds
    }));
  }
}
```

- [ ] **Step 5: Wire the new controller into the entry point**

```js
// js/main.js
import { loadStoredSettings, saveStoredSettings } from './storage.js';
import { PomodoroController } from './PomodoroController.js';

document.addEventListener('DOMContentLoaded', () => {
  const settings = loadStoredSettings();
  const board = new Board(document.getElementById('board-container'));
  const soundEngine = new SoundEngine();
  const controller = new PomodoroController({ board, soundEngine, settings });

  // next tasks:
  // 1. bind landing-page form values into settings
  // 2. save settings on submit
  // 3. call controller.startPrelaunch()
});
```

- [ ] **Step 6: Run tests**

Run: `node --test`

Expected: PASS with both `tests/sessionState.test.js` and `tests/storage.test.js`.

- [ ] **Step 7: Commit**

```bash
git add js/storage.js js/PomodoroController.js js/main.js tests/storage.test.js
git commit -m "feat: add persistence and pomodoro controller scaffolding"
```

## Task 4: Replace the Landing Page and App Boot Flow

**Files:**
- Modify: `index.html:16-48`
- Modify: `css/layout.css:1-147`
- Modify: `js/main.js:1-51`

- [ ] **Step 1: Write the failing behavior check**

Run: `python3 -m http.server 8080`

Then verify manually:
- the page still shows the old hero copy
- there is no duration selector
- there is no goal form
- the board starts immediately with rotating quotes

Expected: FAIL against the approved spec.

- [ ] **Step 2: Replace the landing markup with a real setup form**

```html
<header class="header">
  <div class="header-logo">FlipOff Focus</div>
  <button class="volume-icon" id="volume-btn" type="button" title="Toggle sound">...</button>
</header>

<section class="setup-panel">
  <p class="setup-kicker">Retro focus board</p>
  <h1>Set a goal, go fullscreen, let the board run.</h1>
  <form id="session-form" class="session-form">
    <label>
      <span>Focus minutes</span>
      <select id="focus-minutes" name="focusMinutes">
        <option value="25">25</option>
        <option value="45">45</option>
        <option value="60">60</option>
      </select>
    </label>
    <label>
      <span>Short break</span>
      <select id="short-break-minutes" name="shortBreakMinutes">
        <option value="5">5</option>
        <option value="10">10</option>
      </select>
    </label>
    <label>
      <span>Long break</span>
      <select id="long-break-minutes" name="longBreakMinutes">
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </label>
    <label class="goal-field">
      <span>Focus goal</span>
      <input id="goal-input" name="goal" maxlength="22" placeholder="Finish experiment writeup">
    </label>
    <label class="sound-toggle">
      <input id="sound-enabled" name="soundEnabled" type="checkbox" checked>
      <span>Split-flap sound</span>
    </label>
    <button id="start-session-btn" type="submit">Start session</button>
  </form>
</section>

<section class="board-shell" id="board-shell">
  <section class="board-section" id="board-container"></section>
</section>
```

- [ ] **Step 3: Restyle the landing page to stay small and secondary to the board**

```css
.setup-panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 24px;
  text-align: center;
}

.session-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.goal-field {
  grid-column: 1 / -1;
}

.board-shell {
  padding: 0 24px 32px;
}

body.board-active .setup-panel {
  display: none;
}
```

- [ ] **Step 4: Hook the form submit flow into saved settings and the controller**

```js
const form = document.getElementById('session-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const nextSettings = normalizeSettings({
    focusMinutes: formData.get('focusMinutes'),
    shortBreakMinutes: formData.get('shortBreakMinutes'),
    longBreakMinutes: formData.get('longBreakMinutes'),
    goal: formData.get('goal'),
    soundEnabled: formData.get('soundEnabled') === 'on'
  });

  saveStoredSettings(nextSettings);
  controller.applySettings(nextSettings);
  document.body.classList.add('board-active');
  controller.startPrelaunch();
});
```

- [ ] **Step 5: Run manual verification**

Run: `python3 -m http.server 8080`

Expected:
- landing page shows duration selectors and goal field
- the board does not auto-start on load
- submitting the form switches into board mode

- [ ] **Step 6: Commit**

```bash
git add index.html css/layout.css js/main.js
git commit -m "feat: add pomodoro setup landing page"
```

## Task 5: Rework the Board Rendering and Controls Around Sessions

**Files:**
- Modify: `js/Board.js:1-150`
- Modify: `js/KeyboardController.js:1-84`
- Modify: `js/constants.js:1-65`
- Modify: `css/board.css:1-119`
- Modify: `css/tile.css:1-108`

- [ ] **Step 1: Write the failing behavior check**

Run: `python3 -m http.server 8080`

Expected failures:
- board still calls `displayMessage()` with quote lines
- arrow keys still switch quote slides
- accent bars still cycle through bright multicolor states
- progress row does not exist

- [ ] **Step 2: Replace quote-oriented constants with board-oriented constants**

```js
export const GRID_COLS = 22;
export const GRID_ROWS = 5;
export const STAGGER_DELAY = 18;
export const TOTAL_TRANSITION = 1400;
export const ACCENT_COLORS = {
  focus: '#7af0bf',
  shortBreak: '#7cc7ff',
  longBreak: '#d9b26b',
  ready: '#cfd4da',
  paused: '#c58f8f'
};
```

- [ ] **Step 3: Rename the board API around rows and add state-aware accents**

```js
displayRows(rows, accentState = 'focus') {
  if (this.isTransitioning) return;
  const newGrid = this._formatToGrid(rows);
  // animate only changed tiles
  // set accent color from ACCENT_COLORS[accentState]
}
```

```js
_updateAccentColors(accentState) {
  const color = ACCENT_COLORS[accentState] || ACCENT_COLORS.focus;
  this.boardEl.querySelectorAll('.accent-segment').forEach((segment) => {
    segment.style.backgroundColor = color;
  });
}
```

- [ ] **Step 4: Tighten tile animation toward a more mechanical airport-board feel**

```js
scrambleTo(targetChar, delay) {
  // reduce scramble count
  // keep characters monochrome by default
  // reserve accent tint for active state changes
  // shorten the exaggerated flash so the settle reads as a flap, not a glitch
}
```

```css
.board {
  border-radius: 28px;
  background: #1c1c1b;
}

.tile-front,
.tile-back {
  background: #252525;
}

.tile-front span,
.tile-back span {
  font-family: 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 5: Swap keyboard controls to session behavior**

```js
switch (e.key) {
  case ' ':
    e.preventDefault();
    this.controller.pauseToggle();
    break;
  case 'r':
  case 'R':
    e.preventDefault();
    this.controller.reset();
    break;
  case 'f':
  case 'F':
    e.preventDefault();
    this._toggleFullscreen();
    break;
}
```

- [ ] **Step 6: Manual verification**

Run: `python3 -m http.server 8080`

Expected:
- the board uses monochrome rows, not quote slides
- only state changes get subtle accent color
- `Space` pauses and resumes
- `R` resets the session
- the progress row fills as time advances

- [ ] **Step 7: Commit**

```bash
git add js/Board.js js/KeyboardController.js js/constants.js css/board.css css/tile.css
git commit -m "feat: convert board rendering to airport-style pomodoro display"
```

## Task 6: Complete Prestart, Mode Transitions, and Responsive Verification

**Files:**
- Modify: `js/PomodoroController.js`
- Modify: `css/responsive.css`
- Modify: `js/main.js`

- [ ] **Step 1: Write the failing behavior check**

Run: `python3 -m http.server 8080`

Expected failures:
- no 5-second prestart exists
- no automatic focus-to-break transition exists
- refresh loses some session defaults

- [ ] **Step 2: Finish the controller timing loop**

```js
startPrelaunch() {
  this.stop();
  this.state = createInitialSessionState(this.settings);
  this.updateBoard();
  this._interval = window.setInterval(() => {
    if (this.state.prestartSeconds != null) {
      this.state.prestartSeconds -= 1;
      if (this.state.prestartSeconds < 0) {
        this.state.prestartSeconds = null;
      }
      this.updateBoard();
      return;
    }

    if (this.state.isPaused) return;

    this.state.remainingSeconds -= 1;
    if (this.state.remainingSeconds <= 0) {
      this.state = advanceMode(this.state, this.settings);
    }
    this.updateBoard();
  }, 1000);
}
```

- [ ] **Step 3: Finalize controller helpers**

```js
pauseToggle() {
  this.state.isPaused = !this.state.isPaused;
  this.updateBoard();
}

reset() {
  this.startPrelaunch();
}

applySettings(settings) {
  this.settings = settings;
}

stop() {
  if (this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
}
```

- [ ] **Step 4: Adjust responsive rules for desktop-first board readability**

```css
@media (max-width: 1200px) {
  .board {
    --tile-size: clamp(30px, 3.5vw, 48px);
  }
}

:fullscreen .board {
  --tile-size: clamp(46px, 4vw, 68px);
}
```

- [ ] **Step 5: Run the full verification pass**

Run: `node --test`

Expected: PASS.

Run: `python3 -m http.server 8080`

Expected:
- landing page remembers previous durations and goal
- board shows `STARTING IN 5`
- fullscreen can be entered during prestart
- timer starts automatically after countdown
- focus transitions into short break and long break at the right times
- refresh preserves preferences without crashing if storage is blocked

- [ ] **Step 6: Commit**

```bash
git add js/PomodoroController.js css/responsive.css js/main.js
git commit -m "feat: finish pomodoro timing flow and responsive board polish"
```

## Final Verification Checklist

- [ ] `node --test`
- [ ] `python3 -m http.server 8080`
- [ ] Landing page captures settings and goal
- [ ] Board launches with 5-second prestart
- [ ] `F` fullscreen works during prestart and session
- [ ] `Space` pauses and resumes
- [ ] `R` resets
- [ ] Live time stays visible
- [ ] Progress row fills correctly
- [ ] Focus, short break, and long break states all render correctly
