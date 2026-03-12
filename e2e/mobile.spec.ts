import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 420, height: 812 };

test('home page renders on mobile viewport', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/');
  await expect(page).toHaveTitle(/BeginnersToolBox/i);
  // Tool cards should be visible and stacked (1-column grid below 640px)
  const cards = page.locator('.tool-card');
  await expect(cards.first()).toBeVisible();
});

test('tool page (json-formatter) renders on mobile viewport', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/#/tools/json-formatter');
  await expect(page.locator('.tool-layout')).toBeVisible();
  // Panels should be stacked (tool-row--split uses 1fr below 700px)
  await expect(page.locator('.tool-textarea').first()).toBeVisible();
});

test('data-converter renders on mobile viewport', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/#/tools/data-converter');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.tool-textarea').first()).toBeVisible();
  await expect(page.locator('.tool-output').first()).toBeVisible();
});
