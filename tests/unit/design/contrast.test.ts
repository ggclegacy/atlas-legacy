import { describe, expect, it } from 'vitest';

import { contrast, hexToken, hueDistance, readTokens } from './tokens';

/**
 * Automated contrast checks for the Atlas palette.
 *
 * Atlas is a dark, restrained interface, which is exactly the kind of design
 * that drifts into unreadable. These thresholds are the floor. If a token
 * changes and a test here fails, the token is wrong — not the test.
 *
 * WCAG 2.1: 4.5 = AA normal text, 3.0 = AA large text / non-text UI, 7.0 = AAA.
 */

const tokens = readTokens();
const VOID = hexToken(tokens, '--atlas-void');
const SURFACE = hexToken(tokens, '--atlas-surface');
const RAISED = hexToken(tokens, '--atlas-raised');

function ratio(tokenName: string, background = VOID): number {
  return contrast(hexToken(tokens, tokenName), background);
}

describe('text on the three Atlas surfaces', () => {
  const surfaces: ReadonlyArray<readonly [string, string]> = [
    ['void', VOID],
    ['surface', SURFACE],
    ['raised', RAISED],
  ];

  for (const [name, background] of surfaces) {
    it(`primary text is AAA on ${name}`, () => {
      expect(ratio('--text-primary', background)).toBeGreaterThanOrEqual(7);
    });

    it(`secondary text is AA on ${name}`, () => {
      expect(ratio('--text-secondary', background)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('tertiary text is large-text only', () => {
  it('meets AA for large text', () => {
    expect(ratio('--text-tertiary')).toBeGreaterThanOrEqual(3);
  });

  it('does NOT meet AA for normal text — this is intentional and documented', () => {
    // Guards against someone "fixing" the contrast test by lightening the token
    // without also revisiting where tertiary text is allowed to be used.
    expect(ratio('--text-tertiary')).toBeLessThan(4.5);
  });
});

describe('gold scale', () => {
  it.each(['--gold-300', '--gold-400', '--gold-500', '--gold-600'])(
    '%s is readable as text on void',
    (token) => {
      expect(ratio(token)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('gold-700 is non-text only', () => {
    // Reserved for borders and fills. Asserting the ceiling keeps it honest.
    expect(ratio('--gold-700')).toBeLessThan(4.5);
  });

  it('canonical Atlas gold is comfortably readable', () => {
    expect(ratio('--gold-500')).toBeGreaterThanOrEqual(6.5);
  });
});

describe('intelligence blue', () => {
  it.each(['--intel-300', '--intel-400', '--intel-500'])(
    '%s is readable as text on void',
    (token) => {
      expect(ratio(token)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('intel-600 is non-text only', () => {
    expect(ratio('--intel-600')).toBeLessThan(4.5);
  });

  it('the focus ring meets non-text contrast on every surface', () => {
    for (const background of [VOID, SURFACE, RAISED]) {
      expect(contrast(hexToken(tokens, '--intel-400'), background)).toBeGreaterThanOrEqual(3);
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
    // near-identical luminance yet must never be confused. Hue distance is the
    // metric that matches the design intent.
    expect(
      hueDistance(hexToken(tokens, '--state-warning'), hexToken(tokens, '--gold-500')),
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
  it('form-control borders meet the 3:1 non-text requirement (WCAG 1.4.11)', () => {
    // The decorative hairline is nowhere near 3:1, which is why inputs use a
    // dedicated stronger token. Asserting it here stops that regressing.
    expect(contrast(hexToken(tokens, '--line-strong'), RAISED)).toBeGreaterThanOrEqual(3);
  });

  it('the decorative hairline is deliberately quieter than the interactive one', () => {
    expect(contrast(hexToken(tokens, '--atlas-line'), SURFACE)).toBeLessThan(
      contrast(hexToken(tokens, '--line-strong'), SURFACE),
    );
  });
});
