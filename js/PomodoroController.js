import {
  createInitialSessionState,
  advanceMode,
  buildBoardRows,
  formatCountdown,
  getProgressSegments,
  PROGRESS_SEGMENTS
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

  applySettings(settings) {
    this.settings = settings;
    this.state = createInitialSessionState(settings);
    this.updateBoard();
  }

  startPrelaunch() {
    this.stop();
    this.state = createInitialSessionState(this.settings);
    this.updateBoard();

    this._interval = window.setInterval(() => {
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
        this.state = advanceMode(this.state, this.settings);
      } else {
        this.state.remainingSeconds -= 1;
      }

      this.updateBoard();
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

  updateBoard() {
    const currentTimeLabel = this.now().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const countdownLabel = formatCountdown(this.state.remainingSeconds);
    const progressFilled = getProgressSegments(
      this.state.totalSeconds,
      this.state.remainingSeconds,
      PROGRESS_SEGMENTS
    );

    this.board.displayRows(
      buildBoardRows({
        currentTimeLabel,
        modeLabel: this.state.isPaused ? 'PAUSED' : this._getModeLabel(),
        countdownLabel,
        goalLabel: this.state.goal.toUpperCase(),
        completedLabel: `TODAY ${String(this.state.completedFocusSessions).padStart(2, '0')}`,
        progressFilled,
        progressSegments: PROGRESS_SEGMENTS,
        prestartSeconds: this.state.prestartSeconds
      }),
      this._getAccentState()
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
}
