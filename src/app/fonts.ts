import { Geist, Instrument_Serif } from 'next/font/google';

/**
 * Atlas typography. Two families, no more. See ADR-0006.
 *
 * Both are self-hosted at build time by `next/font` — there is no runtime
 * request to Google, which keeps Atlas fast, CSP-clean, and private.
 */

/**
 * UI family — Geist Sans.
 *
 * A neutral technical grotesk drawn specifically for interface use: tight
 * spacing, unambiguous letterforms, and a real variable weight axis. Chosen
 * over Inter, which has become the default SaaS voice and would make Atlas
 * sound like everything else.
 */
export const atlasUI = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atlas-ui',
  // Variable axis — no weight list needed.
});

/**
 * Display family — Instrument Serif.
 *
 * High-contrast editorial serif reserved for Atlas's own voice: the greeting,
 * Presence moments, and major section headings. It carries authority and pairs
 * with gold, while the grotesk carries information and pairs with blue.
 *
 * Regular only, by design. A display face used at one weight stays disciplined.
 */
export const atlasDisplay = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-atlas-display',
});

export const fontVariables = `${atlasUI.variable} ${atlasDisplay.variable}`;
