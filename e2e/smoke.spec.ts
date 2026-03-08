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

for (const id of TOOL_IDS) {
  test(`tool page loads: /tools/${id}`, async ({ page }) => {
    // App uses HashRouter, so tool routes are under /#/tools/:id
    await page.goto(`/#/tools/${id}`);

    // The tool layout should render
    await expect(page.locator('.tool-layout')).toBeVisible();
  });
}
