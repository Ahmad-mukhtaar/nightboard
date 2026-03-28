import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const layoutCss = fs.readFileSync(new URL('../css/layout.css', import.meta.url), 'utf8');
const responsiveCss = fs.readFileSync(new URL('../css/responsive.css', import.meta.url), 'utf8');

test('active board layout locks the app frame to the viewport without page scrolling', () => {
  assert.match(
    layoutCss,
    /body\.board-active\s+\.page-frame\s*\{[\s\S]*height:\s*100dvh;[\s\S]*overflow:\s*hidden;/,
  );
  assert.match(
    layoutCss,
    /body\.board-active\s+\.board-shell\s*\{[\s\S]*flex:\s*1;[\s\S]*min-height:\s*0;[\s\S]*overflow:\s*hidden;/,
  );
});

test('fullscreen rules use the fullscreen box instead of stacking extra 100vh containers', () => {
  assert.match(
    responsiveCss,
    /:fullscreen\s*,\s*:fullscreen body\s*,\s*:fullscreen \.page-frame\s*\{[\s\S]*height:\s*100%;[\s\S]*overflow:\s*hidden;/,
  );
  assert.match(
    responsiveCss,
    /:fullscreen \.board-shell\s*\{[\s\S]*height:\s*100%;[\s\S]*min-height:\s*0;/,
  );
  assert.match(
    responsiveCss,
    /:fullscreen \.board-section\s*\{[\s\S]*height:\s*100%;[\s\S]*min-height:\s*0;/,
  );
});
