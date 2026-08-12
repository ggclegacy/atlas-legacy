import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Atlas typography. Two families, no more. See ADR-0006.
 *
 * Instrument Serif was retired in Atlas V2: a high-contrast editorial serif
 * signals fashion magazine, not command authority. Authority now comes from
 * scale, tracking, and spacing; precision comes from the mono face.
 *
 * Both are self-hosted at build time by `next/font` — no runtime request, which
 * keeps Atlas fast, CSP-clean, and private.
 */

/** Information. Neutral technical grotesk drawn for interfaces. */
export const atlasUI = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atlas-ui',
});

/**
 * Machine values: costs, token counts, latencies, commit SHAs, identifiers,
 * timestamps, confidence. This is where "computational precision" actually
 * lives — not in a decorative typeface.
 */
export const atlasMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atlas-mono',
});

export const fontVariables = `${atlasUI.variable} ${atlasMono.variable}`;
