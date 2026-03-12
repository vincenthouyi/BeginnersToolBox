import { test, expect } from '@playwright/test';

test('settings page loads via nav link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/#\/settings/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('settings page shows "Clear all saved data" button', async ({ page }) => {
  await page.goto('/#/settings');
  await expect(page.getByRole('button', { name: 'Clear all saved data' })).toBeVisible();
});

test('settings page lists per-tool clear buttons', async ({ page }) => {
  await page.goto('/#/settings');
  // There should be multiple per-tool "Clear saved data" buttons
  const clearBtns = page.getByRole('button', { name: 'Clear saved data' });
  await expect(clearBtns.first()).toBeVisible();
  const count = await clearBtns.count();
  expect(count).toBeGreaterThan(1);
});

test('clear all: confirm dialog appears and clears keys', async ({ page }) => {
  // Pre-set a known localStorage key
  await page.goto('/#/settings');
  await page.evaluate(() => {
    localStorage.setItem('base64:input', 'test-value');
  });

  // Stub window.confirm to auto-accept
  await page.evaluate(() => {
    window.confirm = () => true;
  });

  await page.getByRole('button', { name: 'Clear all saved data' }).click();

  // After reload triggered by clearAll, key should be gone
  const value = await page.evaluate(() => localStorage.getItem('base64:input'));
  expect(value).toBeNull();
});

test('clear tool: confirm dialog appears and clears only that tool key', async ({ page }) => {
  await page.goto('/#/settings');
  await page.evaluate(() => {
    localStorage.setItem('base64:input', 'hello');
    localStorage.setItem('json:input', '{"a":1}');
  });

  // Stub confirm to auto-accept
  await page.evaluate(() => {
    window.confirm = () => true;
  });

  // Click the clear button for the Base64 tool row
  const base64Row = page.locator('.settings-tool-item', { hasText: 'Base64' });
  await base64Row.getByRole('button', { name: 'Clear saved data' }).click();

  // After reload, base64 key gone but json key intact
  const base64Val = await page.evaluate(() => localStorage.getItem('base64:input'));
  expect(base64Val).toBeNull();

  const jsonVal = await page.evaluate(() => localStorage.getItem('json:input'));
  expect(jsonVal).toBe('{"a":1}');
});

test('confirm cancelled: key is NOT removed', async ({ page }) => {
  await page.goto('/#/settings');
  await page.evaluate(() => {
    localStorage.setItem('base64:input', 'keep-me');
    // Stub confirm to reject
    window.confirm = () => false;
  });

  await page.getByRole('button', { name: 'Clear all saved data' }).click();

  const value = await page.evaluate(() => localStorage.getItem('base64:input'));
  expect(value).toBe('keep-me');
});

test('tool page shows "Reset this tool" button for tool with storage', async ({ page }) => {
  await page.goto('/#/tools/base64');
  await expect(page.getByRole('button', { name: 'Reset this tool' })).toBeVisible();
});

test('tool page "Reset this tool" clears key and reloads', async ({ page }) => {
  await page.goto('/#/tools/base64');
  await page.evaluate(() => {
    localStorage.setItem('base64:input', 'to-be-cleared');
    window.confirm = () => true;
  });

  await page.getByRole('button', { name: 'Reset this tool' }).click();

  // After reload the key should be gone
  const value = await page.evaluate(() => localStorage.getItem('base64:input'));
  expect(value).toBeNull();
});
