import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup:    './tests/e2e/globalSetup.ts',
  globalTeardown: './tests/e2e/globalTeardown.ts',
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    // ─── Setup: login e salvar cookies ───────────────────────────────
    { name: 'setup-admin', testMatch: '**/setup/admin.setup.ts' },
    { name: 'setup-user',  testMatch: '**/setup/user.setup.ts' },

    // ─── Admin (artigos, posts, logs) ────────────────────────────────
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      testMatch: '**/admin-*.spec.ts',
      dependencies: ['setup-admin'],
    },

    // ─── Usuário comum (criar post, denunciar) ────────────────────────
    {
      name: 'user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      testMatch: '**/{create-post,report-post}.spec.ts',
      dependencies: ['setup-user'],
    },

    // ─── Sem autenticação (auth, feed) ───────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/auth.spec.ts',
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/feed.spec.ts',
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
