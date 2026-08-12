import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Atlas runs against a production build, not `next dev`.
 *
 * M1 is a visual and responsive milestone, and dev-mode layout shifts, dev
 * overlays, and unminified CSS would make the assertions lie.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,

  /*
   * Capped deliberately. Four browser projects at full parallelism saturate the
   * CPU, and a starved WebKit can take tens of seconds to hydrate — which
   * surfaced as a "flaky" composer test that was really just a machine with
   * nothing left to give. A gate that is slow and honest beats one that is fast
   * and intermittent.
   */
  workers: 2,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  /*
   * Four viewports, chosen for what they actually prove:
   *   phone-min  — 320px, the narrowest width Atlas must survive
   *   iphone     — the real primary target
   *   tablet     — where the side rail takes over from the tab bar
   *   desktop    — where the contextual right region appears
   */
  projects: [
    {
      name: 'phone-min',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 640 }, isMobile: false },
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    /*
     * Build AND serve as a preview deployment.
     *
     * The Presence harness is gated on `env.isProduction`, and because the page
     * is statically prerendered that gate resolves at build time. Simulating a
     * preview here is also the honest thing to test: a preview is exactly what
     * gets reviewed before anything reaches production.
     */
    env: { VERCEL_ENV: 'preview' },
  },
});
