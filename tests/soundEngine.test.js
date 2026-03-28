import test from 'node:test';
import assert from 'node:assert/strict';

import { findAttackOffsetSeconds } from '../js/SoundEngine.js';

test('findAttackOffsetSeconds locates the first audible transient', () => {
  const data = new Float32Array(1000);
  data[400] = 0.04;

  const offset = findAttackOffsetSeconds(data, 1000, 0.02);
  assert.equal(offset, 0.388);
});

test('findAttackOffsetSeconds falls back to zero for silent clips', () => {
  const data = new Float32Array(1000);
  const offset = findAttackOffsetSeconds(data, 1000, 0.02);
  assert.equal(offset, 0);
});
