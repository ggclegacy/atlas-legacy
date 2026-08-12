/**
 * Generate the Atlas grain tile.
 *
 * Purpose is technical, not aesthetic: micro-gradients across near-black band
 * visibly on 8-bit displays, and a low-amplitude noise floor breaks the banding
 * up. If the result is consciously visible as "grain", the CSS opacity is too
 * high — the asset itself is deliberately gentle.
 *
 * Monochrome, tileable, low amplitude. Strength is controlled in CSS.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// 64px, not 128px: noise is incompressible, so the tile size is the file size.
// At the opacities Atlas uses (<=1.5%) the repeat is imperceptible.
const SIZE = 64;

// Deterministic PRNG so the tile is reproducible across regenerations.
let seed = 0x41544c53; // "ATLS"
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 100000) / 100000;
}

const pixels = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < SIZE * SIZE; i += 1) {
  // Centre the noise around mid-grey with a narrow spread. Wide spread reads as
  // film grain; narrow spread reads as material.
  const value = Math.round(118 + (random() - 0.5) * 60);
  pixels[i * 4] = value;
  pixels[i * 4 + 1] = value;
  pixels[i * 4 + 2] = value;
  pixels[i * 4 + 3] = 255;
}

const png = await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9, palette: true, colours: 32 })
  .toBuffer();

const out = resolve(root, 'public/atlas/grain-64.png');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, png);

console.log(`wrote public/atlas/grain-64.png — ${SIZE}x${SIZE}, ${png.length} bytes`);
