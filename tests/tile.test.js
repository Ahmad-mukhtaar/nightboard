import test from 'node:test';
import assert from 'node:assert/strict';

import { Tile } from '../js/Tile.js';
import { buildFlapTimings } from '../js/SoundEngine.js';

class FakeClassList {
  constructor() {
    this.classes = new Set();
  }

  add(value) {
    this.classes.add(value);
  }

  remove(value) {
    this.classes.delete(value);
  }

  contains(value) {
    return this.classes.has(value);
  }
}

class FakeElement {
  constructor() {
    this.children = [];
    this.style = {
      setProperty(name, value) {
        this[name] = value;
      }
    };
    this.className = '';
    this.classList = new FakeClassList();
    this.textContent = '';
  }

  appendChild(child) {
    this.children.push(child);
  }

  addEventListener() {}
}

test('tile primes the back face with the target character before the flip settles', async () => {
  global.document = {
    createElement() {
      return new FakeElement();
    }
  };

  const tile = new Tile(0, 0);
  tile.setChar(' ');
  tile.scrambleTo('A', 0);

  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(tile.backSpan.textContent, 'A');
});

test('tile does not show random scramble characters before the flap settles', async () => {
  global.document = {
    createElement() {
      return new FakeElement();
    }
  };

  const tile = new Tile(0, 0);
  tile.setChar(' ');
  tile.scrambleTo('9', 0);

  await new Promise((resolve) => setTimeout(resolve, 90));

  assert.equal(tile.frontSpan.textContent, '');
});

test('buildFlapTimings follows the tile stagger cadence', () => {
  assert.deepEqual(buildFlapTimings(4, 14, 6), [0, 14, 28, 42]);
  assert.deepEqual(buildFlapTimings(10, 14, 3), [0, 14, 28]);
});
