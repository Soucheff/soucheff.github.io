import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './scripts/tests',
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4431',
    browserName: 'chromium',
    viewport: { width: 1440, height: 960 },
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4431',
    url: 'http://127.0.0.1:4431',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
