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
  await expect(page.locator('.cm-editor').first()).toBeVisible();
});

test('data-converter renders on mobile viewport', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/#/tools/data-converter');
  await expect(page.locator('.tool-layout')).toBeVisible();
  await expect(page.locator('.tool-textarea').first()).toBeVisible();
  await expect(page.locator('.tool-output').first()).toBeVisible();
});

test('hamburger menu opens and navigates on mobile', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/');

  // Desktop nav should be hidden; hamburger should be visible
  await expect(page.locator('.app-nav')).toBeHidden();
  const hamburger = page.locator('.app-hamburger');
  await expect(hamburger).toBeVisible();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

  // Open the menu
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  const mobileMenu = page.locator('.app-mobile-menu');
  await expect(mobileMenu).toBeVisible();

  // Navigate to Music page via menu
  await mobileMenu.locator('a', { hasText: 'Music' }).click();
  await expect(page).toHaveURL(/#\/music/);
  await expect(page.locator('.tools-section__title')).toHaveText('Music');

  // Menu should be closed after navigation
  await expect(page.locator('.app-mobile-menu')).toBeHidden();
});
