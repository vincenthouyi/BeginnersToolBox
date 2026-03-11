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

for (const id of TOOL_IDS) {
  test(`tool page loads: /tools/${id}`, async ({ page }) => {
    // App uses HashRouter, so tool routes are under /#/tools/:id
    await page.goto(`/#/tools/${id}`);

    // The tool layout should render
    await expect(page.locator('.tool-layout')).toBeVisible();
  });
}
