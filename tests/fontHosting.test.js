import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const resetCss = fs.readFileSync(new URL('../css/reset.css', import.meta.url), 'utf8');

test('index does not depend on remote Google Fonts stylesheets', () => {
  assert.doesNotMatch(indexHtml, /fonts\.googleapis\.com/);
  assert.doesNotMatch(indexHtml, /fonts\.gstatic\.com/);
});

test('app loads a local Doto font-face definition', () => {
  assert.match(resetCss, /@font-face\s*\{[\s\S]*font-family:\s*'Doto';/);
  assert.match(resetCss, /src:\s*url\('\.\.\/assets\/fonts\/doto-400\.ttf'\)\s*format\('truetype'\)/);
});
