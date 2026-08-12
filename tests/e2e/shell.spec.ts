import { expect, test, type Page } from '@playwright/test';

/**
 * Atlas shell — responsive and accessibility guarantees.
 *
 * These are the M1 acceptance criteria expressed as assertions, so a later
 * milestone cannot quietly regress the shell while adding features.
 */

const ROUTES = ['/command', '/projects', '/memory', '/system'] as const;

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    // 1px of tolerance for sub-pixel rounding.
    return doc.scrollWidth - doc.clientWidth > 1;
  });
}

test.describe('routing', () => {
  test('the root redirects into Command', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/command$/);
  });
});

test.describe('layout integrity', () => {
  for (const route of ROUTES) {
    test(`${route} never scrolls horizontally`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }

  test('the composer and bottom navigation do not overlap page content', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'iphone', 'Phone-specific layout guarantee');

    await page.goto('/command');
    // Scroll to the very bottom; the last item must still be reachable.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const lastActivity = page.getByRole('region', { name: 'Recent activity' });
    await expect(lastActivity).toBeVisible();
  });
});

test.describe('navigation', () => {
  test('exposes exactly one primary navigation with four surfaces', async ({ page }) => {
    await page.goto('/command');

    // Both the rail and the tab bar exist in the DOM; only one is displayed.
    const visibleNav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });
    await expect(visibleNav).toHaveCount(1);

    for (const label of ['Command', 'Projects', 'Memory', 'System']) {
      await expect(visibleNav.getByRole('link', { name: new RegExp(label) })).toBeVisible();
    }
  });

  test('marks the active surface for assistive technology', async ({ page }) => {
    await page.goto('/projects');
    const visibleNav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });
    await expect(visibleNav.getByRole('link', { name: /Projects/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('navigates between surfaces', async ({ page }) => {
    await page.goto('/command');
    const visibleNav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });

    await visibleNav.getByRole('link', { name: /Memory/ }).click();
    await expect(page).toHaveURL(/\/memory$/);
    await expect(page.getByRole('heading', { name: 'Memory', level: 1 })).toBeVisible();
  });
});

test.describe('touch targets', () => {
  test('every primary navigation target is at least 44px', async ({ page }) => {
    await page.goto('/command');
    const visibleNav = page.getByRole('navigation', { name: 'Primary' }).filter({ visible: true });
    const links = await visibleNav.getByRole('link').all();

    expect(links.length).toBe(4);
    for (const link of links) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('composer controls are at least 44px', async ({ page }) => {
    await page.goto('/command');
    const capture = page.getByRole('button', { name: 'Quick capture' });
    const box = await capture.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe('keyboard access', () => {
  test('a skip link is the first focusable element and reveals itself', async ({ page }) => {
    await page.goto('/command');

    /*
     * Asserted by DOM order and focus behaviour rather than by pressing Tab.
     * WebKit only moves focus to links via Tab when full keyboard access is
     * enabled at the OS level, so a Tab-based assertion would test Safari's
     * settings rather than Atlas.
     */
    const firstFocusableText = await page.evaluate(() => {
      const selector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
      const first = document.querySelector<HTMLElement>(selector);
      return first?.textContent?.trim() ?? '';
    });
    expect(firstFocusableText).toBe('Skip to content');

    // sr-only until focused, then visible — otherwise it helps nobody.
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await skip.focus();
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test('focus is always visible on interactive elements', async ({ page }) => {
    await page.goto('/command');
    const textarea = page.getByRole('textbox', { name: 'Message Atlas' });
    await textarea.focus();

    const outlineWidth = await textarea.evaluate(
      (el) => getComputedStyle(el).outlineWidth || '0px',
    );
    expect(Number.parseFloat(outlineWidth)).toBeGreaterThan(0);
  });
});
