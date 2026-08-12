import { expect, test } from '@playwright/test';

/**
 * Atlas V2 design-system invariants.
 *
 * These assert the LAWS, not pixels. Pixel-perfect snapshots are brittle across
 * WebKit versions and would block legitimate design iteration; phone review
 * remains the authority on appearance.
 */

const SURFACES = ['/command', '/projects', '/memory', '/system'] as const;

test.describe('the two laws', () => {
  test('tokens resolve and the environment is applied', async ({ page }) => {
    await page.goto('/command');

    const t = await page.evaluate(() => {
      const r = getComputedStyle(document.documentElement);
      return {
        gold: r.getPropertyValue('--gold-illuminated').trim(),
        well: r.getPropertyValue('--env-well').trim(),
        energy: r.getPropertyValue('--energy-rest').trim(),
        signal: r.getPropertyValue('--signal-violet').trim(),
        body: getComputedStyle(document.body).backgroundColor,
      };
    });

    expect(t.gold.toLowerCase()).toBe('#c4912f');
    // CSS engines normalise #000000 to #000.
    expect(['#000000', '#000']).toContain(t.well.toLowerCase());
    expect(t.energy.toLowerCase()).toBe('#1c1640');
    expect(t.signal.toLowerCase()).toBe('#6b5ad8');
    expect(t.body).toBe('rgb(5, 5, 6)');
  });

  test('no obsolete M1 colour roles survive anywhere', async ({ page }) => {
    await page.goto('/command');
    const stale = await page.evaluate(() => {
      const r = getComputedStyle(document.documentElement);
      return ['--intel-300', '--intel-400', '--intel-500', '--intel-600', '--gold-metal'].filter(
        (n) => r.getPropertyValue(n).trim() !== '',
      );
    });
    expect(stale).toEqual([]);
  });

  test('VIOLET IN VOLUMES — violet never carries text', async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      const offenders = await page.evaluate(() => {
        const violet = [
          'rgb(28, 22, 64)',
          'rgb(59, 46, 140)',
          'rgb(90, 70, 200)',
          'rgb(124, 104, 240)',
          'rgb(107, 90, 216)',
        ];
        return [...document.querySelectorAll('body *')]
          .filter((n) => (n.textContent ?? '').trim().length > 0 && n.children.length === 0)
          .filter((n) => violet.includes(getComputedStyle(n).color))
          .map((n) => n.tagName)
          .slice(0, 5);
      });
      expect(offenders, `violet used as text colour on ${route}`).toEqual([]);
    }
  });

  test('GOLD ON EDGES — no large gold fills', async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      const offenders = await page.evaluate(() => {
        const gold = ['rgb(196, 145, 47)', 'rgb(216, 172, 85)', 'rgb(110, 80, 26)'];
        return (
          [...document.querySelectorAll('body *')]
            .filter((n) => gold.includes(getComputedStyle(n).backgroundColor))
            .map((n) => n.getBoundingClientRect())
            // The datum and small marks are legitimate; a gold BUTTON is not.
            .filter((r) => r.width * r.height > 44 * 44)
            .map((r) => `${Math.round(r.width)}x${Math.round(r.height)}`)
        );
      });
      expect(offenders, `gold fill larger than 44px² on ${route}`).toEqual([]);
    }
  });
});

test.describe('material', () => {
  test('no backdrop-filter anywhere', async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      const used = await page.evaluate(() =>
        [...document.querySelectorAll('body *')].some((n) => {
          const v = getComputedStyle(n).backdropFilter;
          return Boolean(v) && v !== 'none';
        }),
      );
      expect(used, `backdrop-filter on ${route}`).toBe(false);
    }
  });

  test('grain stays below the perceptibility ceiling', async ({ page }) => {
    await page.goto('/command');
    const opacity = await page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.body, '::after').opacity),
    );
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThanOrEqual(0.015);
  });

  test('the card grammar is gone', async ({ page }) => {
    for (const route of SURFACES) {
      await page.goto(route);
      // Every screen is one recessed field, not a stack of boxes.
      await expect(page.locator('.well').first()).toBeVisible();
    }
  });
});

test.describe('typography', () => {
  test('Geist Sans carries information, Geist Mono carries machine values', async ({ page }) => {
    await page.goto('/system');

    const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(body).toMatch(/Geist/i);

    const mono = await page
      .locator('.machine')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(mono).toMatch(/Geist Mono/i);
  });

  test('Instrument Serif is fully retired', async ({ page }) => {
    await page.goto('/command');
    const heading = await page
      .getByRole('heading', { level: 1 })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(heading).not.toMatch(/Instrument/i);
  });
});

test.describe('Presence', () => {
  test('persists across every mode without unmounting', async ({ page }) => {
    await page.goto('/command');
    for (const route of SURFACES) {
      await page.goto(route);
      await expect(page.locator('.presence').filter({ visible: true }).first()).toBeVisible();
    }
  });

  test('is still at rest — idle animates nothing', async ({ page }) => {
    await page.goto('/command');
    const animated = await page
      .locator('.presence[data-state="idle"]')
      .filter({ visible: true })
      .first()
      .evaluate((el) =>
        [...el.querySelectorAll('*')].some((n) => getComputedStyle(n).animationName !== 'none'),
      );
    expect(animated).toBe(false);
  });

  test('the datum never moves', async ({ page }) => {
    await page.goto('/dev/lab');
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll('.presence .presence__datum')].map(
        (n) => getComputedStyle(n).transform,
      ),
    );
    expect(new Set(transforms).size).toBe(1);
  });

  test('renders all fifteen states in the harness', async ({ page }) => {
    await page.goto('/dev/lab');
    const states = [
      'idle',
      'attentive',
      'listening',
      'understanding',
      'retrieving',
      'thinking',
      'synthesizing',
      'streaming',
      'speaking',
      'working',
      'waiting',
      'awaiting_approval',
      'warning',
      'error',
      'offline',
    ];
    for (const s of states) {
      await expect(page.locator(`.presence[data-state="${s}"]`).first()).toBeVisible();
    }
  });

  test('carries an accessible label', async ({ page }) => {
    await page.goto('/command');
    const labelled = await page
      .locator('.presence[role="img"]')
      .filter({ visible: true })
      .first()
      .evaluate((e) => (e.getAttribute('aria-label') ?? '').length > 3);
    expect(labelled).toBe(true);
  });
});

test.describe('Command Aperture', () => {
  test('is real, immediate, and 16px', async ({ page }) => {
    await page.goto('/command');
    const intake = page.getByLabel('Message Atlas');

    await intake.fill('Remember this before I forget');
    await expect(intake).toHaveValue('Remember this before I forget');

    const size = await intake.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });

  test('Enter submits, Shift+Enter does not', async ({ page }) => {
    await page.goto('/command');
    const intake = page.getByLabel('Message Atlas');

    await intake.fill('line one');
    await intake.press('Shift+Enter');
    await expect(intake).toHaveValue(/line one/);

    await intake.fill('send me');
    await intake.press('Enter');
    await expect(intake).toHaveValue('', { timeout: 10_000 });
  });

  test('the actuator keeps a 44px target', async ({ page }) => {
    await page.goto('/command');
    const box = await page.locator('.ap__actuator').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('the future-capability seam surfaces nothing yet', async ({ page }) => {
    await page.goto('/command');
    await expect(page.locator('.ap__augment')).toBeHidden();
  });

  test('does not pretend to answer', async ({ page }) => {
    await page.goto('/command');
    await page.getByLabel('Message Atlas').fill('Are you real yet?');
    await page.getByRole('button', { name: 'Send to Atlas' }).click();
    await expect(page.getByText('Not connected yet').first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('progressive web app', () => {
  test('manifest still installs to the home screen', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const m = (await res.json()) as Record<string, unknown>;
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/command');
    expect(m.background_color).toBe('#050506');
  });

  test('Atlas is never indexed', async ({ page }) => {
    await page.goto('/command');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('honesty about placeholder data', () => {
  test('demo surfaces say so', async ({ page }) => {
    for (const route of ['/command', '/projects', '/memory']) {
      await page.goto(route);
      await expect(page.getByText('Demo content.').first()).toBeVisible();
    }
  });
});
