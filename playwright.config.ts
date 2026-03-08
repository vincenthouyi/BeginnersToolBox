import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:5173/BeginnersToolBox/',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Ensure the dev server binds to loopback so Playwright can reach it consistently.
    // Also include trailing slash: Vite serves /BeginnersToolBox/ (302 from /).
    command: 'npm run dev -- --host 127.0.0.1 --strictPort --port 5173',
    url: 'http://127.0.0.1:5173/BeginnersToolBox/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
