import { defineConfig, devices } from '@playwright/test';

// Happy-path e2e. Requires the dev server (and backend) running:
//   bun run dev   # in one shell
//   bun run test:e2e
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
