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
  await expect(page.locator('.tool-card')).toBeVisible();
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

for (const id of TOOL_IDS) {
  test(`tool page loads: /tools/${id}`, async ({ page }) => {
    // App uses HashRouter, so tool routes are under /#/tools/:id
    await page.goto(`/#/tools/${id}`);

    // The tool layout should render
    await expect(page.locator('.tool-layout')).toBeVisible();
  });
}
