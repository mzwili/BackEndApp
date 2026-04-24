// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    headless: true
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // THIS IS THE IMPORTANT PART
  webServer: {
    command: 'npm run dev', // starts your Express app
    url: 'http://localhost:4000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,

    // ensures JWT_SECRET exists during tests
    env: {
      JWT_SECRET: 'testsecret123',
      NODE_ENV: 'test'
    }
  },
});