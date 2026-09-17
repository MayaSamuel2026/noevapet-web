const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './qa/browser',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'qa/playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/de/index.html',
    reuseExistingServer: false,
    timeout: 30000
  }
});
