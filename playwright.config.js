// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  // ✅ RESET DB BEFORE ALL TESTS
  globalSetup: require.resolve('./global-setup'),

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,

    env: {
      JWT_SECRET: 'testsecret123',
      NODE_ENV: 'test',
    },
  },
});