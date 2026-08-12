import { describe, expect, it } from 'vitest';

import { contrast, hexToken, hueDistance, readTokens } from './tokens';

/**
 * Automated contrast checks for the Atlas Precision Core palette.
 *
 * Atlas is a dark, restrained interface — exactly the kind that drifts into
 * unreadable. These thresholds are the floor. If a token changes and a test
 * here fails, the token is wrong, not the test.
 *
 * WCAG 2.1: 4.5 = AA normal text · 3.0 = AA large / non-text UI · 7.0 = AAA.
 */

const tokens = readTokens();
const VOID = hexToken(tokens, '--env-void');
const WELL = hexToken(tokens, '--env-well');
const STRUCTURE = hexToken(tokens, '--env-structure');
const SURFACE = hexToken(tokens, '--env-surface');

function ratio(token: string, background = VOID): number {
  return contrast(hexToken(tokens, token), background);
}

const SURFACES: ReadonlyArray<readonly [string, string]> = [
  ['void', VOID],
  ['well', WELL],
  ['structure', STRUCTURE],
  ['surface', SURFACE],
];

describe('text on every Atlas surface', () => {
  for (const [name, background] of SURFACES) {
    it(`primary text is AAA on ${name}`, () => {
      expect(ratio('--text-primary', background)).toBeGreaterThanOrEqual(7);
    });

    it(`secondary text is AA on ${name}`, () => {
      expect(ratio('--text-secondary', background)).toBeGreaterThanOrEqual(4.5);
    });

    it(`machine text is AA on ${name}`, () => {
      expect(ratio('--text-machine', background)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('tertiary text is large-text only', () => {
  it('meets AA for large text', () => {
    expect(ratio('--text-tertiary')).toBeGreaterThanOrEqual(3);
  });

  it('does NOT meet AA for normal text — intentional and documented', () => {
    // Guards against "fixing" the test by lightening the token without also
    // revisiting where tertiary text is allowed to be used.
    expect(ratio('--text-tertiary')).toBeLessThan(4.5);
  });
});

describe('GOLD ON EDGES', () => {
  it.each(['--gold-illuminated', '--gold-authority', '--gold-specular'])(
    '%s is readable as text on void',
    (token) => {
      expect(ratio(token)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('gold-structural is non-text only', () => {
    expect(ratio('--gold-structural')).toBeLessThan(4.5);
  });

  it('canonical Atlas gold is comfortably readable', () => {
    expect(ratio('--gold-illuminated')).toBeGreaterThanOrEqual(6.5);
  });
});

describe('VIOLET IN VOLUMES', () => {
  /**
   * Energy violet is volumetric and non-informational, so it carries no
   * contrast requirement — but it must never become readable enough to tempt
   * anyone into using it as text. Signal violet is the informational role.
   */
  it('signal violet clears 3:1 on every surface', () => {
    for (const [name, background] of SURFACES) {
      expect(
        contrast(hexToken(tokens, '--signal-violet'), background),
        `signal violet on ${name}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('signal violet stays saturated rather than drifting to pastel', () => {
    expect(contrast(hexToken(tokens, '--signal-violet'), WELL)).toBeLessThan(7);
  });

  it('resting energy is genuinely low — present, not neon', () => {
    expect(ratio('--energy-rest')).toBeLessThan(2);
  });

  it('the energy ladder rises monotonically', () => {
    const steps = ['--energy-rest', '--energy-engaged', '--energy-reason', '--energy-output'].map(
      (t) => ratio(t),
    );
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!).toBeGreaterThan(steps[i - 1]!);
    }
  });
});

describe('semantic colours', () => {
  it.each(['--state-success', '--state-warning', '--state-danger'])(
    '%s is readable as text on void',
    (token) => {
      expect(ratio(token)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('warning is separated from Atlas gold by hue, not luminance', () => {
    // Contrast ratio cannot express this: an amber warning and Atlas gold have
    // near-identical luminance yet must never be confused.
    expect(
      hueDistance(hexToken(tokens, '--state-warning'), hexToken(tokens, '--gold-illuminated')),
    ).toBeGreaterThanOrEqual(20);
  });

  it('semantic colours are mutually distinguishable by hue', () => {
    const success = hexToken(tokens, '--state-success');
    const warning = hexToken(tokens, '--state-warning');
    const danger = hexToken(tokens, '--state-danger');

    expect(hueDistance(success, warning)).toBeGreaterThanOrEqual(40);
    expect(hueDistance(success, danger)).toBeGreaterThanOrEqual(40);
    expect(hueDistance(warning, danger)).toBeGreaterThanOrEqual(12);
  });
});

describe('interactive boundaries', () => {
  it('form-control borders meet 3:1 (WCAG 1.4.11)', () => {
    expect(contrast(hexToken(tokens, '--line-interactive'), SURFACE)).toBeGreaterThanOrEqual(3);
  });

  it('the decorative hairline is deliberately quieter than the interactive one', () => {
    expect(contrast(hexToken(tokens, '--line-structural'), SURFACE)).toBeLessThan(
      contrast(hexToken(tokens, '--line-interactive'), SURFACE),
    );
  });
});

describe('recession', () => {
  it('the well is true black — content is cut in, not raised on', () => {
    expect(hexToken(tokens, '--env-well')).toBe('#000000');
  });

  it('the lit inner edge is brighter than the dark one', () => {
    expect(ratio('--line-raised')).toBeGreaterThan(ratio('--line-recessed'));
  });
});
