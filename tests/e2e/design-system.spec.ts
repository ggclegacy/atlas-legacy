import { expect, test } from '@playwright/test';

/**
 * Design-system guarantees that only hold in a real browser: the token layer
 * actually resolving, the PWA metadata being served, Presence rendering every
 * state, and reduced motion degrading legibly rather than silently.
 */

test.describe('design tokens', () => {
  test('resolve at runtime and are applied to the page', async ({ page }) => {
    await page.goto('/command');

    const { gold, voidBg, body } = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        gold: root.getPropertyValue('--gold-500').trim(),
        voidBg: root.getPropertyValue('--atlas-void').trim(),
        body: getComputedStyle(document.body).backgroundColor,
      };
    });

    expect(gold.toLowerCase()).toBe('#c4912f');
    expect(voidBg.toLowerCase()).toBe('#050506');
    // #050506
    expect(body).toBe('rgb(5, 5, 6)');
  });

  test('both font families load and are applied', async ({ page }) => {
    await page.goto('/command');

    const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(bodyFont).toMatch(/Geist/i);

    const headingFont = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).fontFamily : '';
    });
    expect(headingFont).toMatch(/Instrument/i);
  });
});

test.describe('progressive web app', () => {
  test('serves a manifest that installs to the home screen', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const manifest = (await response.json()) as Record<string, unknown>;
    expect(manifest.name).toBe('Atlas');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/command');
    expect(manifest.background_color).toBe('#050506');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect((manifest.icons as unknown[]).length).toBeGreaterThanOrEqual(3);
  });

  test('serves the iOS home-screen icon and standalone metadata', async ({ page, request }) => {
    await page.goto('/command');

    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveCount(1);

    const href = await appleIcon.getAttribute('href');
    expect(href).toBeTruthy();
    expect((await request.get(href!)).status()).toBe(200);

    // Both forms: the modern standard Next emits, and the apple-prefixed one
    // that iOS below 16.4 requires for standalone launch.
    await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    );
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#050506');
  });

  test('every manifest icon is actually served', async ({ request }) => {
    const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
      icons: { src: string }[];
    };

    for (const icon of manifest.icons) {
      const response = await request.get(icon.src);
      expect(response.status(), `${icon.src} should be served`).toBe(200);
      expect(response.headers()['content-type']).toContain('image/png');
    }
  });

  test('Atlas is never indexed', async ({ page }) => {
    await page.goto('/command');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('Atlas Presence', () => {
  test('renders all eight states in the harness', async ({ page }) => {
    await page.goto('/dev/presence');

    const states = [
      'idle',
      'thinking',
      'streaming',
      'listening',
      'speaking',
      'awaiting_approval',
      'error',
      'offline',
    ];

    for (const state of states) {
      await expect(page.locator(`.presence[data-state="${state}"]`).first()).toBeVisible();
    }
  });

  test('is gold at rest and blue while working', async ({ page }) => {
    await page.goto('/dev/presence');

    const strokeOf = (state: string) =>
      page
        .locator(`.presence[data-state="${state}"] .presence__ring`)
        .first()
        .evaluate((el) => {
          return getComputedStyle(el).stroke;
        });

    // Idle uses gold-700 (#6E501A); thinking leaves the ring neutral and lights
    // the arc instead. What matters is that idle is NOT blue.
    const idle = await strokeOf('idle');
    expect(idle).toBe('rgb(110, 80, 26)');

    const listeningRing = await strokeOf('listening');
    expect(listeningRing).toBe('rgb(31, 168, 240)'); // intel-500

    const thinkingArc = await page
      .locator('.presence[data-state="thinking"] .presence__arc')
      .first()
      .evaluate((el) => getComputedStyle(el).stroke);
    expect(thinkingArc).toBe('rgb(92, 198, 255)'); // intel-400
  });
});

test.describe('honesty about placeholder data', () => {
  test('every demo surface says so', async ({ page }) => {
    for (const route of ['/command', '/projects', '/memory']) {
      await page.goto(route);
      await expect(page.getByText('Demo content.').first()).toBeVisible();
    }
  });

  test('the composer does not pretend to answer', async ({ page }) => {
    await page.goto('/command');

    const send = page.getByRole('button', { name: 'Send to Atlas' });
    const textarea = page.getByRole('textbox', { name: 'Message Atlas' });

    await textarea.fill('Are you real yet?');
    // Generous, because the composer is server-rendered and only becomes
    // interactive once React hydrates — slowest on mobile WebKit.
    await expect(send).toBeEnabled({ timeout: 15_000 });
    await send.click();

    // `.first()`: Radix renders the title and a visually-hidden live-region
    // announcement of the same text, and both are legitimate matches.
    await expect(page.getByText('Not connected yet').first()).toBeVisible({ timeout: 10_000 });
  });
});
