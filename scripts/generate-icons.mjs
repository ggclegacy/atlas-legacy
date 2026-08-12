/**
 * Generate Atlas application icons.
 *
 * The mark is the Atlas Presence at rest: a gold ring around a gold core on
 * void. It is the same object the app shows on screen, so the home-screen icon
 * and the running application read as one system.
 *
 * Outputs are committed. Re-run with `npm run icons` only when the mark changes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Kept in sync with src/styles/tokens.css by the token drift test.
const VOID = '#050506';
const RING = '#9C7326';
const CORE = '#C4912F';

/**
 * @param {number} ringRadius fraction of half-size (0–1)
 * @param {number} coreRadius fraction of half-size (0–1)
 */
function mark(ringRadius, coreRadius) {
  const size = 512;
  const c = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${VOID}"/>
      <circle cx="${c}" cy="${c}" r="${c * ringRadius}" fill="none" stroke="${RING}" stroke-width="16"/>
      <circle cx="${c}" cy="${c}" r="${c * coreRadius}" fill="${CORE}"/>
    </svg>`,
  );
}

/** Standard mark. */
const standard = mark(0.62, 0.15);

/**
 * Maskable mark. Android may crop to a circle, so the content is pulled inside
 * the 80% safe zone.
 */
const maskable = mark(0.46, 0.11);

const targets = [
  { svg: standard, size: 192, out: 'public/icons/icon-192.png' },
  { svg: standard, size: 512, out: 'public/icons/icon-512.png' },
  { svg: maskable, size: 512, out: 'public/icons/icon-maskable-512.png' },
  // Next.js file conventions — these emit the correct <link> tags automatically.
  { svg: standard, size: 192, out: 'src/app/icon.png' },
  // iOS ignores transparency and does not round for you; ship it opaque at 180.
  { svg: standard, size: 180, out: 'src/app/apple-icon.png' },
];

for (const target of targets) {
  const path = resolve(root, target.out);
  await mkdir(dirname(path), { recursive: true });
  const png = await sharp(target.svg).resize(target.size, target.size).png().toBuffer();
  await writeFile(path, png);
  console.log(`wrote ${target.out} (${target.size}px, ${png.length} bytes)`);
}
