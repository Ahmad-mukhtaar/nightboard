import { Tile } from './Tile.js';
import {
  GRID_COLS, GRID_ROWS, STAGGER_DELAY, TOTAL_TRANSITION, ACCENT_COLORS
} from './constants.js';

export class Board {
  constructor(containerEl, soundEngine) {
    this.cols = GRID_COLS;
    this.rows = GRID_ROWS;
    this.soundEngine = soundEngine;
    this.isTransitioning = false;
    this.tiles = [];
    this.currentGrid = [];
    this.boardEl = document.createElement('div');
    this.boardEl.className = 'board';
    this.boardEl.style.setProperty('--grid-cols', this.cols);
    this.boardEl.style.setProperty('--grid-rows', this.rows);

    this.leftBar = this._createAccentBar('accent-bar-left');
    this.boardEl.appendChild(this.leftBar);

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'tile-grid';

    for (let r = 0; r < this.rows; r++) {
      const row = [];
      const charRow = [];
      for (let c = 0; c < this.cols; c++) {
        const tile = new Tile(r, c);
        tile.el.dataset.row = String(r);
        tile.setChar(' ');
        this.gridEl.appendChild(tile.el);
        row.push(tile);
        charRow.push(' ');
      }
      this.tiles.push(row);
      this.currentGrid.push(charRow);
    }

    this.boardEl.appendChild(this.gridEl);

    this.rightBar = this._createAccentBar('accent-bar-right');
    this.boardEl.appendChild(this.rightBar);

    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = '?';
    hint.title = 'Keyboard shortcuts';
    hint.addEventListener('click', (e) => {
      e.stopPropagation();
      const overlay = this.boardEl.querySelector('.shortcuts-overlay');
      if (overlay) overlay.classList.toggle('visible');
    });
    this.boardEl.appendChild(hint);

    // Shortcuts overlay
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    overlay.innerHTML = `
      <div><span>Pause / Resume</span><kbd>Space</kbd></div>
      <div><span>Fullscreen</span><kbd>F</kbd></div>
      <div><span>Reset</span><kbd>R</kbd></div>
      <div><span>Sound</span><kbd>M</kbd></div>
    `;
    this.boardEl.appendChild(overlay);

    containerEl.appendChild(this.boardEl);
    this._updateAccentColors('ready');
  }

  _createAccentBar(extraClass) {
    const bar = document.createElement('div');
    bar.className = `accent-bar ${extraClass}`;
    // Just 2 small stacked squares like the original
    for (let i = 0; i < 2; i++) {
      const seg = document.createElement('div');
      seg.className = 'accent-segment';
      bar.appendChild(seg);
    }
    return bar;
  }

  _updateAccentColors() {
    const accentState = arguments[0] || 'ready';
    const color = ACCENT_COLORS[accentState] || ACCENT_COLORS.ready;
    const segments = this.boardEl.querySelectorAll('.accent-segment');
    segments.forEach(seg => {
      seg.style.backgroundColor = color;
      seg.style.boxShadow = `0 0 18px ${color}44`;
    });
  }

  displayRows(lines, accentState = 'ready', options = {}) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const newGrid = this._formatToGrid(lines);
    const { playSound = true } = options;
    let hasChanges = false;
    let changeIndex = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const newChar = newGrid[r][c];
        const oldChar = this.currentGrid[r][c];

        if (newChar !== oldChar) {
          const delay = changeIndex * STAGGER_DELAY;
          this.tiles[r][c].scrambleTo(newChar, delay);
          hasChanges = true;
          changeIndex += 1;
        }
      }
    }

    if (hasChanges && playSound && this.soundEngine) {
      this.soundEngine.playFlapSequence(changeIndex, STAGGER_DELAY);
    }

    this._updateAccentColors(accentState);
    this.currentGrid = newGrid;

    setTimeout(() => {
      this.isTransitioning = false;
    }, Math.max(260, (changeIndex * STAGGER_DELAY) + TOTAL_TRANSITION));
  }

  displayMessage(lines) {
    this.displayRows(lines, 'ready');
  }

  _formatToGrid(lines) {
    const grid = [];
    for (let r = 0; r < this.rows; r++) {
      const line = (lines[r] || '').toUpperCase().slice(0, this.cols);
      const padTotal = this.cols - line.length;
      const padLeft = Math.max(0, Math.floor(padTotal / 2));
      const padded = ' '.repeat(padLeft) + line + ' '.repeat(Math.max(0, this.cols - padLeft - line.length));
      grid.push(padded.split(''));
    }
    return grid;
  }
}
