import { expect, test } from '@playwright/test';

/**
 * Atlas under reduced motion.
 *
 * The requirement is not "turn animation off" — it is that Atlas stays legible
 * and fully operable without motion. File-scoped `test.use`, because applying
 * this via a beforeEach inside a describe leaked into unrelated tests in M1.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' } });

const PRESENCE_STATES = [
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

test.describe('Atlas under reduced motion', () => {
  test('all fifteen Presence states remain distinguishable', async ({ page }) => {
    await page.goto('/dev/lab');

    // A signature built only from STATIC properties. If two states collapse to
    // the same signature, one of them is carrying no information.
    const signatures = await page.evaluate((states: string[]) => {
      return states.map((state) => {
        const el = document.querySelector(`.presence[data-state="${state}"]`);
        if (!el) return `${state}:missing`;

        const style = (sel: string) => {
          const n = el.querySelector(sel);
          return n ? getComputedStyle(n) : null;
        };

        const field = style('.presence__field');
        const nucleus = style('.presence__nucleus');
        const index = style('.presence__index');
        const trace = style('.presence__prop line');
        const housing = style('.presence__housing path');

        return [
          field?.opacity,
          nucleus?.opacity,
          nucleus?.transform,
          nucleus?.fill,
          index?.transform,
          trace?.opacity,
          trace?.strokeDashoffset,
          housing?.stroke,
          getComputedStyle(el).getPropertyValue('--p-housing-op'),
        ].join('|');
      });
    }, PRESENCE_STATES);

    const unique = new Set(signatures);
    expect(
      unique.size,
      `${signatures.length - unique.size} state(s) collapsed under reduced motion`,
    ).toBe(PRESENCE_STATES.length);
  });

  test('nothing animates at all', async ({ page }) => {
    await page.goto('/command');
    const animating = await page.evaluate(
      () =>
        [...document.querySelectorAll('body *')].filter(
          (n) => getComputedStyle(n).animationName !== 'none',
        ).length,
    );
    expect(animating).toBe(0);
  });

  test('the interface renders and navigates', async ({ page }) => {
    await page.goto('/command');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });
    await nav.getByRole('link', { name: /Projects/ }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  /**
   * Regression test for a real M1 defect. Without motion nothing delays the
   * first keystroke, so text can reach the Aperture before React hydrates. A
   * controlled component would discard it and the user's opening sentence would
   * silently fail to send.
   */
  test('the Aperture never loses input typed before hydration', async ({ page }) => {
    await page.goto('/command');
    const intake = page.getByLabel('Message Atlas');
    await intake.fill('Typed before Atlas woke up');
    await expect(intake).toHaveValue('Typed before Atlas woke up');
    await expect(page.getByRole('button', { name: 'Send to Atlas' })).toBeEnabled({
      timeout: 15_000,
    });
  });
});
