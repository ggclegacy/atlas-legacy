import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { hexToken, readTokens } from './tokens';

/**
 * "No arbitrary colours in components" enforced mechanically.
 *
 * ESLint cannot see a hex buried in a Tailwind arbitrary value or a style prop,
 * so this is a file scan instead. It is deliberately simple: a small explicit
 * allowlist beats a clever rule nobody can debug.
 */

const ROOT = resolve(process.cwd());
const SCANNED = ['src/app', 'src/components', 'src/styles'];

/**
 * Files permitted to contain literal colours, each for a reason that cannot be
 * solved with a CSS custom property.
 */
const ALLOWLIST = new Map<string, string>([
  ['src/styles/tokens.css', 'the token definitions themselves'],
  ['src/app/manifest.ts', 'consumed by the OS, which cannot read CSS variables'],
  ['src/app/layout.tsx', 'themeColor meta tag, which cannot read CSS variables'],

  ['src/styles/lab.css', 'lab-only review overrides for grain and well depth'],
]);

const COLOUR_PATTERN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(resolve(ROOT, dir), { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(full);
      return ['.ts', '.tsx', '.css'].includes(extname(entry.name)) ? [full] : [];
    }),
  );
  return files.flat();
}

describe('token discipline', () => {
  it('no component contains a raw colour', async () => {
    const files = (await Promise.all(SCANNED.map(collectFiles))).flat();
    expect(files.length).toBeGreaterThan(10);

    const offenders: string[] = [];

    for (const file of files) {
      const key = relative(ROOT, resolve(ROOT, file)).split('\\').join('/');
      if (ALLOWLIST.has(key)) continue;

      const source = readFileSync(resolve(ROOT, file), 'utf8');
      for (const match of source.matchAll(COLOUR_PATTERN)) {
        offenders.push(`${key}: ${match[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('allowlisted literals still match the tokens they duplicate', () => {
    const tokens = readTokens();
    const voidHex = hexToken(tokens, '--env-void').toLowerCase();

    const manifest = readFileSync(resolve(ROOT, 'src/app/manifest.ts'), 'utf8');
    const layout = readFileSync(resolve(ROOT, 'src/app/layout.tsx'), 'utf8');

    // Both must equal --atlas-void, or the installed app flashes the wrong
    // colour on launch.
    expect(manifest.toLowerCase()).toContain(`background_color: '${voidHex}'`);
    expect(manifest.toLowerCase()).toContain(`theme_color: '${voidHex}'`);
    expect(layout.toLowerCase()).toContain(`themecolor: '${voidHex}'`);
  });

  it('the icon generator uses the real gold tokens', () => {
    const tokens = readTokens();
    const script = readFileSync(resolve(ROOT, 'scripts/generate-icons.mjs'), 'utf8').toUpperCase();

    expect(script).toContain(hexToken(tokens, '--env-void').toUpperCase());
    expect(script).toContain(hexToken(tokens, '--gold-structural').toUpperCase());
    expect(script).toContain(hexToken(tokens, '--gold-illuminated').toUpperCase());
  });
});
