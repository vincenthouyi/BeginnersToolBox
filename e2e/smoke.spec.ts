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
];

test('home page loads and shows tool cards', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BeginnersToolBox/i);
  // At least one tool card should be present
  const cards = page.locator('.tool-card');
  await expect(cards.first()).toBeVisible();
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

test('music box designer renders step grid', async ({ page }) => {
  await page.goto('/#/tools/music-box-designer');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.mbox-grid')).toBeVisible();
  // Should have note cells
  await expect(page.locator('.mbox-cell--note').first()).toBeVisible();
});

for (const id of TOOL_IDS) {
  test(`tool page loads: /tools/${id}`, async ({ page }) => {
    // App uses HashRouter, so tool routes are under /#/tools/:id
    await page.goto(`/#/tools/${id}`);

    // The tool layout should render
    await expect(page.locator('.tool-layout')).toBeVisible();
  });
}
