import {
  createInitialSessionState,
  advanceMode,
  buildBoardRows,
  formatCountdown
} from './sessionState.js';

export class PomodoroController {
  constructor({ board, soundEngine, settings, now = () => new Date(), onCycleComplete = null }) {
    this.board = board;
    this.soundEngine = soundEngine;
    this.settings = settings;
    this.now = now;
    this.onCycleComplete = onCycleComplete;
    this.state = createInitialSessionState(settings);
    this._interval = null;
    this.hud = null;
  }

  attachHud(hud) {
    this.hud = hud;
    this.board.configureGrid(30, 5, 2);
    this._setHudLabels();
    this.updateBoard();
  }

  applySettings(settings) {
    this.settings = settings;
    this.state = createInitialSessionState(settings);
    this.board.configureGrid(30, 5, 2);
    this.updateBoard();
  }

  startPrelaunch() {
    this.stop();
    this.state = createInitialSessionState(this.settings);
    this.updateBoard();

    this._interval = window.setInterval(() => {
      this._handleTick();
    }, 1000);
  }

  pauseToggle() {
    if (this.state.prestartSeconds != null) {
      return;
    }

    this.state.isPaused = !this.state.isPaused;
    this.updateBoard();
  }

  reset() {
    this.startPrelaunch();
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  _handleTick() {
    if (this.state.prestartSeconds != null) {
      if (this.state.prestartSeconds <= 1) {
        this.state.prestartSeconds = null;
      } else {
        this.state.prestartSeconds -= 1;
      }

      this.updateBoard();
      return;
    }

    if (this.state.isPaused) {
      this.updateBoard();
      return;
    }

    if (this.state.remainingSeconds <= 1) {
      if (this.state.mode === 'longBreak') {
        this.stop();
        this.onCycleComplete?.();
        return;
      }

      this.state = advanceMode(this.state, this.settings);
    } else {
      this.state.remainingSeconds -= 1;
    }

    this.updateBoard();
  }

  updateBoard() {
    const currentTimeLabel = this.now().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const countdownLabel = formatCountdown(this.state.remainingSeconds);
    const modeLabel = this.state.isPaused ? 'PAUSED' : this._getModeLabel();
    const completedLabel = String(this.state.completedFocusSessions).padStart(2, '0');

    if (this.hud) {
      this._setHudLabels();
      this.hud.time.textContent = currentTimeLabel;
      this.hud.goal.textContent = this.state.goal.toUpperCase();
      this.hud.mode.textContent = modeLabel;
      this.hud.today.textContent = completedLabel;
    }

    this.board.displayRows(
      buildBoardRows({
        countdownLabel,
        prestartSeconds: this.state.prestartSeconds,
        modeLabel,
        goalLabel: this.state.goal.toUpperCase(),
        isPaused: this.state.isPaused
      }),
      this._getAccentState(),
      { playSound: true }
    );
  }

  _getModeLabel() {
    if (this.state.prestartSeconds != null) {
      return 'READY';
    }

    if (this.state.mode === 'shortBreak') {
      return 'SHORT BREAK';
    }

    if (this.state.mode === 'longBreak') {
      return 'LONG BREAK';
    }

    return 'FOCUS';
  }

  _getAccentState() {
    if (this.state.prestartSeconds != null) {
      return 'ready';
    }

    if (this.state.isPaused) {
      return 'paused';
    }

    return this.state.mode;
  }

  _setHudLabels() {
    if (!this.hud?.labels) {
      return;
    }

    this.hud.labels.time.textContent = 'Time';
    this.hud.labels.goal.textContent = 'Goal';
    this.hud.labels.mode.textContent = 'Mode';
    this.hud.labels.today.textContent = 'Today';
  }
}
