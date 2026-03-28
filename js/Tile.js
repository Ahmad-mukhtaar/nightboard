import { FLIP_DURATION } from './constants.js';

export class Tile {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.currentChar = ' ';
    this.isAnimating = false;
    this._scrambleTimer = null;

    // Build DOM
    this.el = document.createElement('div');
    this.el.className = 'tile';

    this.innerEl = document.createElement('div');
    this.innerEl.className = 'tile-inner';

    this.frontEl = document.createElement('div');
    this.frontEl.className = 'tile-front';
    this.frontSpan = document.createElement('span');
    this.frontEl.appendChild(this.frontSpan);

    this.backEl = document.createElement('div');
    this.backEl.className = 'tile-back';
    this.backSpan = document.createElement('span');
    this.backEl.appendChild(this.backSpan);

    this.innerEl.appendChild(this.frontEl);
    this.innerEl.appendChild(this.backEl);
    this.el.appendChild(this.innerEl);
  }

  setChar(char) {
    this.currentChar = char;
    this.frontSpan.textContent = char === ' ' ? '' : char;
    this.backSpan.textContent = '';
  }

  scrambleTo(targetChar, delay) {
    if (targetChar === this.currentChar) return;

    if (this._scrambleTimer) {
      clearTimeout(this._scrambleTimer);
      this._scrambleTimer = null;
    }
    this.isAnimating = true;

    this._scrambleTimer = setTimeout(() => {
      this._scrambleTimer = null;
      this.backSpan.textContent = targetChar === ' ' ? '' : targetChar;
      this.innerEl.style.setProperty('--flip-duration', `${FLIP_DURATION}ms`);
      this.innerEl.classList.add('flipping');

      setTimeout(() => {
        this.frontSpan.textContent = targetChar === ' ' ? '' : targetChar;
        this.backSpan.textContent = '';
        this.innerEl.classList.remove('flipping');
        this.currentChar = targetChar;
        this.isAnimating = false;
      }, FLIP_DURATION);
    }, delay);
  }
}
