import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Read the Atlas design tokens straight from the stylesheet.
 *
 * The tests parse `tokens.css` rather than duplicating values in TypeScript,
 * so the stylesheet stays the single source of truth and cannot drift away from
 * what the tests assert.
 */

export const TOKENS_PATH = resolve(process.cwd(), 'src/styles/tokens.css');

export function readTokens(): Map<string, string> {
  const css = readFileSync(TOKENS_PATH, 'utf8');
  const tokens = new Map<string, string>();

  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)) {
    const name = match[1];
    const value = match[2];
    if (name && value) tokens.set(name, value.trim());
  }

  return tokens;
}

export function hexToken(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(name);
  if (!value) throw new Error(`Missing token ${name} in tokens.css`);
  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Token ${name} is not a plain hex colour: ${value}`);
  }
  return value;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 0xff);
  const g = channel((n >> 8) & 0xff);
  const b = channel(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1–21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Hue angle in degrees (0–360).
 *
 * Contrast ratio is a luminance measure and cannot express "these two colours
 * look like different things" — two hues can be indistinguishable by contrast
 * yet obviously different to the eye, and vice versa. Atlas needs hue distance
 * to keep warning from reading as gold.
 */
export function hue(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;

  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  return (h * 60 + 360) % 360;
}

/** Shortest angular distance between two hues, 0–180. */
export function hueDistance(a: string, b: string): number {
  const diff = Math.abs(hue(a) - hue(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}
