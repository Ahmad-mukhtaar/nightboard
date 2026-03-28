import {
  createInitialSessionState,
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

  startPrelaunch() {}

  pauseToggle() {}

  reset() {}

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
        modeLabel: this.state.mode.toUpperCase(),
        countdownLabel,
        goalLabel: this.state.goal.toUpperCase(),
        completedLabel: `TODAY ${String(this.state.completedFocusSessions).padStart(2, '0')}`,
        progressFilled,
        progressSegments: PROGRESS_SEGMENTS,
        prestartSeconds: this.state.prestartSeconds
      }),
      this.state.mode
    );
  }
}
