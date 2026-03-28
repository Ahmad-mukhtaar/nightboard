import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const layoutCss = fs.readFileSync(new URL('../css/layout.css', import.meta.url), 'utf8');

test('form controls force a dark native color scheme for selects', () => {
  assert.match(
    layoutCss,
    /\.field select,\s*\.field input\s*\{[\s\S]*color-scheme:\s*dark;/,
  );
});

test('select options define explicit readable colors', () => {
  assert.match(
    layoutCss,
    /\.field select option\s*\{[\s\S]*background:\s*#17130f;[\s\S]*color:\s*#f9f2e4;/,
  );
});
