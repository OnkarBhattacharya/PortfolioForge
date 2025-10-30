import { defineConfig, devices } from '@playwright/test';

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 9002;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the PORT variable.
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: './tests/e2e',
  // If a test fails, retry it additional 2 times
  retries: 2,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-page#page-goto
    baseURL,

    // All failed tests generate traces.
    trace: 'on-first-retry',
  },
  // https://playwright.dev/docs/test-projects
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
