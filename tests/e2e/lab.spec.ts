import { expect, test, type Page } from '@playwright/test';

/**
 * VP1 Design Lab — invariants.
 *
 * Two jobs: prove the lab demonstrates what it claims, and prove it has not
 * leaked into the four production screens.
 */

const PV2_STATES = [
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

test.describe('lab isolation', () => {
  test('production screens are untouched by V2', async ({ page }) => {
    for (const route of ['/command', '/projects', '/memory', '/system']) {
      await page.goto(route);
      // No V2 scope anywhere.
      await expect(page.locator('[data-atlas="v2"]')).toHaveCount(0);
      // No V2 components leaked in.
      await expect(page.locator('.pv2')).toHaveCount(0);
      await expect(page.locator('.ap')).toHaveCount(0);
    }
    // The M1 Presence is still the one in production.
    await page.goto('/command');
    await expect(page.locator('.presence').first()).toBeVisible();
  });

  test('the lab is scoped and never indexed', async ({ page }) => {
    await page.goto('/dev/lab');
    await expect(page.locator('[data-atlas="v2"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('Presence V2', () => {
  test('renders all fifteen states', async ({ page }) => {
    await page.goto('/dev/lab');
    for (const state of PV2_STATES) {
      await expect(page.locator(`.pv2[data-state="${state}"]`).first()).toBeVisible();
    }
  });

  test('idle carries no animation — Atlas at rest is still', async ({ page }) => {
    await page.goto('/dev/lab');
    const animated = await page
      .locator('.pv2[data-state="idle"]')
      .first()
      .evaluate((el) =>
        [...el.querySelectorAll('*')].some((n) => getComputedStyle(n).animationName !== 'none'),
      );
    expect(animated).toBe(false);
  });

  test('the datum never moves, whatever the state', async ({ page }) => {
    await page.goto('/dev/lab');
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll('.pv2 .pv2__datum')].map((n) => getComputedStyle(n).transform),
    );
    expect(new Set(transforms).size).toBe(1);
  });

  test('every state stays distinguishable with motion disabled', async ({ page }) => {
    await page.goto('/dev/lab');
    await page.getByRole('button', { name: 'reduced', exact: true }).click();

    // A signature built only from STATIC properties. If two states collapse to
    // the same signature, one of them is carrying no information.
    const signatures = await page.evaluate((states) => {
      return states.map((state) => {
        const el = document.querySelector(`.pv2[data-state="${state}"]`);
        if (!el) return `${state}:missing`;
        const cs = getComputedStyle(el);
        const field = el.querySelector('.pv2__field');
        const nucleus = el.querySelector('.pv2__nucleus');
        const index = el.querySelector('.pv2__index');
        const trace = el.querySelector('.pv2__prop line');
        const housing = el.querySelector('.pv2__housing path');
        return [
          getComputedStyle(field!).opacity,
          getComputedStyle(nucleus!).opacity,
          getComputedStyle(nucleus!).transform,
          getComputedStyle(nucleus!).fill,
          getComputedStyle(index!).transform,
          getComputedStyle(trace!).opacity,
          getComputedStyle(trace!).strokeDashoffset,
          getComputedStyle(housing!).stroke,
          cs.getPropertyValue('--pv-housing-op'),
        ].join('|');
      });
    }, PV2_STATES);

    const unique = new Set(signatures);
    expect(
      unique.size,
      `states collapsed under reduced motion: ${signatures.length - unique.size} duplicate(s)`,
    ).toBe(PV2_STATES.length);
  });

  test('each state exposes an accessible label', async ({ page }) => {
    await page.goto('/dev/lab');
    const labelled = await page
      .locator('.pv2[role="img"]')
      .evaluateAll((els) => els.every((e) => (e.getAttribute('aria-label') ?? '').length > 3));
    expect(labelled).toBe(true);
  });
});

test.describe('Command Aperture', () => {
  async function firstAperture(page: Page) {
    return page.locator('.ap').first();
  }

  test('is a real, immediately usable input', async ({ page }) => {
    await page.goto('/dev/lab');
    const intake = page.getByLabel('Message Atlas').first();

    await intake.fill('Remember this before I forget');
    await expect(intake).toHaveValue('Remember this before I forget');

    // 16px minimum or iOS Safari zooms the viewport on focus.
    const size = await intake.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });

  test('Enter submits and Shift+Enter does not', async ({ page }) => {
    await page.goto('/dev/lab');
    const intake = page.getByLabel('Message Atlas').first();

    await intake.fill('line one');
    await intake.press('Shift+Enter');
    await expect(intake).toHaveValue(/line one/);

    await intake.fill('send me');
    await intake.press('Enter');
    await expect(intake).toHaveValue('');
  });

  test('the actuator keeps a 44px target though the Presence is 24px', async ({ page }) => {
    await page.goto('/dev/lab');
    const box = await (await firstAperture(page)).locator('.ap__actuator').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('the future-capability seam surfaces nothing yet', async ({ page }) => {
    await page.goto('/dev/lab');
    await expect((await firstAperture(page)).locator('.ap__augment')).toBeHidden();
  });
});

test.describe('material laws', () => {
  test('grain never exceeds the perceptibility ceiling', async ({ page }) => {
    await page.goto('/dev/lab');
    await page.getByRole('button', { name: 'max', exact: true }).click();

    const opacity = await page.evaluate(() => {
      const el = document.querySelector('[data-atlas="v2"]')!;
      return Number.parseFloat(getComputedStyle(el, '::after').opacity);
    });
    expect(opacity).toBeLessThanOrEqual(0.015);
  });

  test('no backdrop-filter anywhere in the lab', async ({ page }) => {
    await page.goto('/dev/lab');
    const used = await page.evaluate(() =>
      [...document.querySelectorAll('[data-atlas="v2"] *')].some((n) => {
        const v = getComputedStyle(n).backdropFilter;
        return Boolean(v) && v !== 'none';
      }),
    );
    expect(used).toBe(false);
  });

  test('plain mode leaves the hierarchy readable', async ({ page }) => {
    await page.goto('/dev/lab');
    await page.getByRole('button', { name: 'true', exact: true }).last().click();

    // Structure and language must survive with the effects switched off.
    await expect(page.getByText('Good morning, Neil.')).toBeVisible();
    await expect(page.getByText('Awaiting review').first()).toBeVisible();
    await expect(page.getByLabel('Message Atlas').first()).toBeVisible();
  });
});

test.describe('layout integrity', () => {
  test('the lab never scrolls horizontally', async ({ page }) => {
    await page.goto('/dev/lab');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth > 1,
    );
    expect(overflow).toBe(false);
  });
});
