import { describe, expect, it } from 'vitest';

import {
  assertServerEnv,
  formatEnvIssues,
  parseServerEnv,
  resolveAppUrl,
  resolveAtlasEnvironment,
  type ServerEnv,
} from '@/lib/config/env.schema';

/** Build a valid parsed env for the pure resolver tests. */
function parsed(raw: Record<string, unknown>): ServerEnv {
  return assertServerEnv(raw);
}

describe('parseServerEnv', () => {
  it('accepts an empty environment and applies defaults', () => {
    const result = parseServerEnv({});

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.env.NODE_ENV).toBe('development');
    expect(result.env.ATLAS_LOG_LEVEL).toBe('info');
  });

  it('rejects an unknown log level and reports the offending key', () => {
    const result = parseServerEnv({ ATLAS_LOG_LEVEL: 'verbose' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.key)).toContain('ATLAS_LOG_LEVEL');
  });

  it('rejects a malformed ATLAS_APP_URL', () => {
    const result = parseServerEnv({ ATLAS_APP_URL: 'atlas.example.com' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.key)).toContain('ATLAS_APP_URL');
  });

  it('rejects a Vercel production build that is not NODE_ENV=production', () => {
    const result = parseServerEnv({ VERCEL_ENV: 'production', NODE_ENV: 'development' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.key)).toContain('NODE_ENV');
  });

  it('accepts a correctly configured Vercel production build', () => {
    const result = parseServerEnv({
      VERCEL: '1',
      VERCEL_ENV: 'production',
      NODE_ENV: 'production',
      VERCEL_GIT_COMMIT_SHA: 'abc123',
      VERCEL_PROJECT_PRODUCTION_URL: 'atlas.example.com',
    });

    expect(result.ok).toBe(true);
  });

  it('never echoes environment values into error output', () => {
    // Master plan §11, T6: a malformed secret must not reach build logs.
    const canary = 'SUPER-SECRET-CANARY-VALUE';
    const result = parseServerEnv({
      ATLAS_LOG_LEVEL: canary,
      ATLAS_APP_URL: canary,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const message = formatEnvIssues(result.issues);
    expect(message).not.toContain(canary);
    expect(message).toContain('ATLAS_LOG_LEVEL');
    expect(message).toContain('ATLAS_APP_URL');
  });
});

describe('assertServerEnv', () => {
  it('returns the parsed environment when valid', () => {
    expect(assertServerEnv({ NODE_ENV: 'test' }).NODE_ENV).toBe('test');
  });

  it('throws when invalid, which is what fails the build', () => {
    expect(() => assertServerEnv({ ATLAS_LOG_LEVEL: 'nope' })).toThrow(
      /Invalid Atlas environment configuration/,
    );
  });
});

describe('resolveAtlasEnvironment', () => {
  it('prefers VERCEL_ENV, which is the only source that knows about previews', () => {
    expect(resolveAtlasEnvironment(parsed({ VERCEL_ENV: 'preview' }))).toBe('preview');
  });

  it('falls back to production when NODE_ENV is production off-Vercel', () => {
    expect(resolveAtlasEnvironment(parsed({ NODE_ENV: 'production' }))).toBe('production');
  });

  it('defaults to development', () => {
    expect(resolveAtlasEnvironment(parsed({}))).toBe('development');
  });
});

describe('resolveAppUrl', () => {
  it('prefers an explicit override and strips a trailing slash', () => {
    expect(resolveAppUrl(parsed({ ATLAS_APP_URL: 'https://atlas.example.com/' }))).toBe(
      'https://atlas.example.com',
    );
  });

  it('uses the stable production domain on production deployments', () => {
    const env = parsed({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      VERCEL_PROJECT_PRODUCTION_URL: 'atlas.example.com',
      VERCEL_URL: 'atlas-abc123.vercel.app',
    });

    expect(resolveAppUrl(env)).toBe('https://atlas.example.com');
  });

  it('uses the per-deployment URL on previews', () => {
    const env = parsed({ VERCEL_ENV: 'preview', VERCEL_URL: 'atlas-abc123.vercel.app' });
    expect(resolveAppUrl(env)).toBe('https://atlas-abc123.vercel.app');
  });

  it('falls back to localhost', () => {
    expect(resolveAppUrl(parsed({}))).toBe('http://localhost:3000');
  });
});
