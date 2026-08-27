import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/artifacts',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on .only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Workers: undefined = auto (optimal for local), 1 on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './tests/e2e/results/report', open: 'never' }],
    ['line'],
    ['list'],
  ],
  
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
  },
  
  // Shared settings for all tests
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Force French locale so i18n auto-detects French
    locale: 'fr-FR',
    // Accept downloads for download tests
    acceptDownloads: true,
    // Headless by default
    headless: true,
  },
  
  // Test projects — chromium only (guaranteed installed)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Start local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
