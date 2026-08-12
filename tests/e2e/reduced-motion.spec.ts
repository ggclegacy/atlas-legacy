import { expect, test } from '@playwright/test';

/**
 * Reduced motion lives in its own file on purpose.
 *
 * Applying it via a `beforeEach` inside a describe leaked into unrelated tests
 * in the same file and produced a genuinely confusing failure. File-scoped
 * `test.use` is the correct mechanism, and it also means the whole file is
 * honestly labelled with the condition it runs under.
 *
 * The requirement is not "turn animation off". It is that Atlas stays legible
 * and fully operable without motion.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('Atlas under reduced motion', () => {
  test('Presence states stay distinguishable without animation', async ({ page }) => {
    await page.goto('/dev/presence');

    const coreOf = (state: string) =>
      page.locator(`.presence[data-state="${state}"] .presence__core`).first();

    // Animation is off …
    await expect(coreOf('idle')).toHaveCSS('animation-name', 'none');

    // … but the states still differ visually.
    const idleOpacity = await coreOf('idle').evaluate((el) => getComputedStyle(el).opacity);
    const approvalTransform = await coreOf('awaiting_approval').evaluate(
      (el) => getComputedStyle(el).transform,
    );

    expect(Number.parseFloat(idleOpacity)).toBeLessThan(1);
    expect(approvalTransform).not.toBe('none');
  });

  test('the working arc remains visible so "thinking" still reads', async ({ page }) => {
    await page.goto('/dev/presence');
    const arc = page.locator('.presence[data-state="thinking"] .presence__arc').first();

    await expect(arc).toHaveCSS('opacity', '1');
    expect(await arc.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  });

  test('the interface renders and navigates', async ({ page }) => {
    await page.goto('/command');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });
    await nav.getByRole('link', { name: /Projects/ }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  /**
   * Regression test for a real defect found during M1.
   *
   * Without motion, nothing delays the first keystroke, so text can land in the
   * composer before React hydrates. A controlled component would discard it and
   * the user's first sentence would silently fail to send. The composer now
   * recovers the pre-hydration value on mount.
   */
  test('the composer never loses input typed before hydration', async ({ page }) => {
    await page.goto('/command');

    const textarea = page.getByRole('textbox', { name: 'Message Atlas' });
    const send = page.getByRole('button', { name: 'Send to Atlas' });

    await textarea.fill('Typed before Atlas woke up');

    await expect(textarea).toHaveValue('Typed before Atlas woke up');
    await expect(send).toBeEnabled({ timeout: 15_000 });
  });
});
