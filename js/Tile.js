import { CHARSET, FLIP_DURATION } from './constants.js';

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

    // Cancel any in-progress animation
    if (this._scrambleTimer) {
      clearInterval(this._scrambleTimer);
      this._scrambleTimer = null;
    }
    this.isAnimating = true;

    setTimeout(() => {
      this.el.classList.add('scrambling');
      let scrambleCount = 0;
      const maxScrambles = 3 + Math.floor(Math.random() * 2);
      const scrambleInterval = 55;

      this._scrambleTimer = setInterval(() => {
        const randChar = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        this.frontSpan.textContent = randChar === ' ' ? '' : randChar;
        this.frontSpan.style.opacity = scrambleCount % 2 === 0 ? '0.85' : '1';

        scrambleCount++;

        if (scrambleCount >= maxScrambles) {
          clearInterval(this._scrambleTimer);
          this._scrambleTimer = null;
          this.frontSpan.style.opacity = '';
          this.backSpan.textContent = targetChar === ' ' ? '' : targetChar;
          this.innerEl.style.setProperty('--flip-duration', `${FLIP_DURATION}ms`);
          this.innerEl.classList.add('flipping');

          setTimeout(() => {
            this.frontSpan.textContent = targetChar === ' ' ? '' : targetChar;
            this.backSpan.textContent = '';
            this.innerEl.classList.remove('flipping');
            this.el.classList.remove('scrambling');
            this.currentChar = targetChar;
            this.isAnimating = false;
          }, FLIP_DURATION);
        }
      }, scrambleInterval);
    }, delay);
  }
}
