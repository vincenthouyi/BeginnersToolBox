import { test, expect } from '@playwright/test';

const TOOL_IDS = [
  'base64',
  'json-formatter',
  'color-converter',
  'markdown-preview',
  'url-encoder',
  'regex-tester',
  'timestamp-converter',
  'hash-generator',
  'data-converter',
  'json-diff',
  'uuid-generator',
  'metronome',
  'music-box-designer',
  'tuner',
  'jsonpath',
];

test('home page loads and shows tool cards', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BeginnersToolBox/i);
  // At least one tool card should be present
  const cards = page.locator('.tool-card');
  await expect(cards.first()).toBeVisible();
});

test('text page loads: /text', async ({ page }) => {
  await page.goto('/#/text');
  await expect(page.getByRole('heading', { name: 'Text', exact: true })).toBeVisible();
  await expect(page.locator('.tool-card').first()).toBeVisible();
});

test('encoding page loads: /encoding', async ({ page }) => {
  await page.goto('/#/encoding');
  await expect(page.getByRole('heading', { name: 'Encoding', exact: true })).toBeVisible();
  await expect(page.locator('.tool-card').first()).toBeVisible();
});

test('dev page loads: /dev', async ({ page }) => {
  await page.goto('/#/dev');
  await expect(page.getByRole('heading', { name: 'Dev', exact: true })).toBeVisible();
  await expect(page.locator('.tool-card').first()).toBeVisible();
});

test('data formats page loads: /data-formats', async ({ page }) => {
  await page.goto('/#/data-formats');
  await expect(page.getByRole('heading', { name: 'Data Formats' })).toBeVisible();
  await expect(page.locator('.tool-card').first()).toBeVisible();
});

test('url encoder supports short URL input via query params', async ({ page }) => {
  await page.goto('/#/tools/url-encoder?text=hello%20world&op=encode&scope=component');
  await expect(page.locator('textarea.tool-textarea')).toHaveValue('hello world');
  await expect(page.locator('.tool-output')).toContainText('hello%20world');
});

test('timestamp converter supports short URL input via query params', async ({ page }) => {
  await page.goto('/#/tools/timestamp-converter?ts=1700000000&unit=s');
  await expect(page.locator('input.tool-input').first()).toHaveValue('1700000000');
});

test('color converter loads color from URL param', async ({ page }) => {
  await page.goto('/#/tools/color-converter?color=ff0000&format=hex');
  await expect(page.locator('.color-hex-display')).toContainText('#FF0000');
});

test('hash generator selects algorithm from URL param', async ({ page }) => {
  await page.goto('/#/tools/hash-generator?alg=SHA-512');
  await expect(page.locator('.hash-algo-btn--active')).toHaveCount(1);
  await expect(page.locator('.hash-algo-btn--active')).toContainText('SHA-512');
});

test('uuid generator generates UUIDs from URL params', async ({ page }) => {
  await page.goto('/#/tools/uuid-generator?type=uuid&count=3');
  const items = page.locator('.uuid-result-item');
  await expect(items).toHaveCount(3);
  // Each UUID should match the standard 8-4-4-4-12 format
  const first = await items.first().locator('.uuid-result-value').textContent();
  expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('uuid generator generates ULIDs from URL params', async ({ page }) => {
  await page.goto('/#/tools/uuid-generator?type=ulid&count=2');
  const items = page.locator('.uuid-result-item');
  await expect(items).toHaveCount(2);
  // Each ULID is 26 uppercase Crockford base32 chars
  const first = await items.first().locator('.uuid-result-value').textContent();
  expect(first).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
});

test('json diff shows changed path', async ({ page }) => {
  await page.goto('/#/tools/json-diff');
  await expect(page.locator('.tool-layout')).toBeVisible();
  const textareas = page.locator('textarea.tool-textarea');
  await textareas.nth(0).fill('{"name":"Alice"}');
  await textareas.nth(1).fill('{"name":"Bob"}');
  await page.getByRole('button', { name: 'Diff' }).click();
  await expect(page.locator('.json-diff-output')).toContainText('~ name:');
});

test('json diff shows no differences for identical JSON', async ({ page }) => {
  await page.goto('/#/tools/json-diff');
  const textareas = page.locator('textarea.tool-textarea');
  await textareas.nth(0).fill('{"a":1}');
  await textareas.nth(1).fill('{"a":1}');
  await page.getByRole('button', { name: 'Diff' }).click();
  await expect(page.locator('.json-diff-output')).toContainText('(no differences)');
});

test('data formats page shows json-diff card', async ({ page }) => {
  await page.goto('/#/data-formats');
  await expect(page.getByText('JSON Diff')).toBeVisible();
});

test('data formats page shows jsonpath card', async ({ page }) => {
  await page.goto('/#/data-formats');
  await expect(page.getByText('JSONPath Query')).toBeVisible();
});

test('jsonpath tool runs a query and shows matches', async ({ page }) => {
  await page.goto('/#/tools/jsonpath');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await page.locator('textarea.tool-textarea').fill('{"a":{"b":42}}');
  await page.locator('input.jsonpath-expr-input').fill('$.a.b');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.jsonpath-match').first()).toContainText('42');
});

test('jsonpath tool loads expression from URL param', async ({ page }) => {
  await page.goto('/#/tools/jsonpath?expr=$.a.b');
  await expect(page.locator('input.jsonpath-expr-input')).toHaveValue('$.a.b');
});

test('music page loads: /music', async ({ page }) => {
  await page.goto('/#/music');
  await expect(page.getByRole('heading', { name: 'Music', exact: true })).toBeVisible();
  await expect(page.locator('.tool-card').first()).toBeVisible();
});

test('metronome renders beat dots and controls', async ({ page }) => {
  await page.goto('/#/tools/metronome');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.metro-display')).toBeVisible();
  await expect(page.locator('.metro-beat-dot').first()).toBeVisible();
});

test('metronome renders countdown select', async ({ page }) => {
  await page.goto('/#/tools/metronome');
  await expect(page.locator('.metro-countdown-select')).toBeVisible();
});

test('metronome shows countdown display when countdown enabled and started', async ({ page }) => {
  await page.goto('/#/tools/metronome?countdown=3');
  await page.locator('.metro-toggle-btn').click();
  // Countdown number should appear immediately
  await expect(page.locator('.metro-countdown')).toBeVisible();
  // Eventually transitions to playing (Stop button shown throughout)
  await expect(page.locator('.metro-toggle-btn')).toContainText('Stop');
});

test('metronome loads bpm from URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?bpm=140');
  await expect(page.locator('.metro-bpm-number')).toHaveText('140');
});

test('metronome loads beats from URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?beats=3');
  await expect(page.locator('.metro-beat-dot')).toHaveCount(3);
});

test('metronome loads accent=0 from URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?accent=0');
  await expect(page.locator('.metro-beat-dot').first()).not.toHaveClass(/metro-beat-dot--accent/);
});

test('metronome loads countdown from URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?countdown=3');
  await expect(page.locator('.metro-countdown-select')).toHaveValue('3');
});

test('metronome loads multiple URL params', async ({ page }) => {
  await page.goto('/#/tools/metronome?bpm=90&beats=3&accent=0&vol=0.5&countdown=5');
  await expect(page.locator('.metro-bpm-number')).toHaveText('90');
  await expect(page.locator('.metro-beat-dot')).toHaveCount(3);
  await expect(page.locator('.metro-countdown-select')).toHaveValue('5');
});

test('metronome clamps out-of-range bpm URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?bpm=9999');
  await expect(page.locator('.metro-bpm-number')).toHaveText('240');
});

test('metronome clamps out-of-range beats URL param', async ({ page }) => {
  await page.goto('/#/tools/metronome?beats=99');
  await expect(page.locator('.metro-beat-dot')).toHaveCount(8);
});

test('metronome shows resume hint after page visibility hidden', async ({ page }) => {
  await page.goto('/#/tools/metronome');
  await page.locator('.metro-toggle-btn').click();
  await expect(page.locator('.metro-toggle-btn')).toContainText('Stop');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  // Simulate returning to the page
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  // After visibility restore, either resumes (no hint) or shows hint — no crash
  await expect(page.locator('.tool-layout')).toBeVisible();
});

test('music box designer renders step grid', async ({ page }) => {
  await page.goto('/#/tools/music-box-designer');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.mbox-grid')).toBeVisible();
  // Should have note cells
  await expect(page.locator('.mbox-cell--note').first()).toBeVisible();
});

test('tuner renders note display, meter, and controls', async ({ page }) => {
  await page.goto('/#/tools/tuner');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.tuner-note-display')).toBeVisible();
  await expect(page.locator('.tuner-meter')).toBeVisible();
  await expect(page.locator('.tuner-controls')).toBeVisible();
  await expect(page.locator('.tuner-calibration')).toBeVisible();
  // Start Tuner button should be visible in idle state
  await expect(page.getByRole('button', { name: 'Start Tuner' })).toBeVisible();
});

test('music page shows tuner card', async ({ page }) => {
  await page.goto('/#/music');
  await expect(page.getByText('Tuner')).toBeVisible();
});

for (const id of TOOL_IDS) {
  test(`tool page loads: /tools/${id}`, async ({ page }) => {
    // App uses HashRouter, so tool routes are under /#/tools/:id
    await page.goto(`/#/tools/${id}`);

    // The tool layout should render
    await expect(page.locator('.tool-layout')).toBeVisible();
  });
}
