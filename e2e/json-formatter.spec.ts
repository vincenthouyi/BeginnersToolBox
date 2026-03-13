import { test, expect } from '@playwright/test';

test('json formatter: prettify formats valid JSON', async ({ page }) => {
  await page.goto('/#/tools/json-formatter');
  await expect(page.locator('.tool-layout')).toBeVisible();

  await page.locator('.cm-content').click();
  await page.keyboard.type('{"b":2,"a":1}');

  await page.getByRole('button', { name: 'Prettify' }).click();
  await expect(page.locator('.tool-output')).toContainText('"b"');
});

test('json formatter: invalid JSON shows error on prettify', async ({ page }) => {
  await page.goto('/#/tools/json-formatter');
  await expect(page.locator('.tool-layout')).toBeVisible();

  await page.locator('.cm-content').click();
  await page.keyboard.type('{ bad json }');

  await page.getByRole('button', { name: 'Prettify' }).click();
  await expect(page.locator('.tool-message--error')).toBeVisible();
});

test('json formatter: validate shows success for valid JSON', async ({ page }) => {
  await page.goto('/#/tools/json-formatter');
  await expect(page.locator('.tool-layout')).toBeVisible();

  await page.locator('.cm-content').click();
  await page.keyboard.type('{"key":"value"}');

  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.locator('.tool-message--success')).toBeVisible();
  await expect(page.locator('.tool-message--success')).toContainText('Valid JSON');
});

test('json formatter: invalid JSON shows validate error and cm-diagnostic', async ({ page }) => {
  await page.goto('/#/tools/json-formatter');
  await expect(page.locator('.tool-layout')).toBeVisible();

  await page.locator('.cm-content').click();
  await page.keyboard.type('{ "key": "value"  bad }');

  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.locator('.tool-message--error')).toBeVisible();

  // CodeMirror linter adds an error-range decoration (debounced at 750ms)
  await page.waitForSelector('.cm-lintRange-error', { timeout: 3000 });
  await expect(page.locator('.cm-lintRange-error').first()).toBeVisible();
});
