import { defineConfig } from '@playwright/test'

const isCI = Boolean(process.env.CI)

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  forbidOnly: isCI,
  fullyParallel: false,
  reporter: isCI ? 'github' : 'list',
  retries: isCI ? 2 : 0,
  testDir: './e2e',
  testMatch: /.*\.e2e\.ts$/u,
  timeout: 30_000,
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  workers: 1,
})
