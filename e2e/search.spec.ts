import { test, expect } from '@playwright/test';

const SEARCH = 'input[aria-label="Search tools"]';

test('search: typing from /music navigates to home and filters tools', async ({ page }) => {
  await page.goto('/#/music');
  await expect(page.getByRole('heading', { name: 'Music', exact: true })).toBeVisible();

  // Type a query that matches exactly one tool: "JSON Formatter"
  await page.locator(SEARCH).fill('json format');

  // Should land on home with filtered results
  await expect(page.getByRole('heading', { name: 'All Tools' })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByText('JSON Formatter')).toBeVisible();
});

test('search: Enter with one result navigates to that tool', async ({ page }) => {
  await page.goto('/');

  await page.locator(SEARCH).fill('json format');
  await expect(page.locator('.tool-card')).toHaveCount(1);

  await page.locator(SEARCH).press('Enter');

  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page).toHaveURL(/json-formatter/);
});

test('search: Escape clears query and shows all tools', async ({ page }) => {
  await page.goto('/');

  await page.locator(SEARCH).fill('base64');
  // base64 matches only one tool
  await expect(page.locator('.tool-card')).toHaveCount(1);

  await page.locator(SEARCH).press('Escape');

  await expect(page.locator(SEARCH)).toHaveValue('');
  await expect(page.locator('.tool-card')).toHaveCount(15);
});

test('search: result count shown while filtering', async ({ page }) => {
  await page.goto('/');

  await page.locator(SEARCH).fill('json');

  await expect(page.locator('.tools-section__sub')).toContainText('found');
});

test('search: shareable URL /?q= filters on load', async ({ page }) => {
  await page.goto('/#/?q=tuner');

  await expect(page.getByRole('heading', { name: 'All Tools' })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByText('Tuner')).toBeVisible();
  await expect(page.locator(SEARCH)).toHaveValue('tuner');
});
