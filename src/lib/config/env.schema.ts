/**
 * Atlas environment schema.
 *
 * This module is deliberately PURE:
 *   - no `server-only` guard
 *   - no reads of `process.env`
 *   - no side effects on import
 *
 * That is what allows it to be imported from three places that cannot share a
 * runtime: `next.config.ts` (build time), `src/lib/config/env.ts` (server
 * runtime), and the test suite.
 *
 * Architectural rule (master plan §13): a missing or malformed environment
 * variable must fail the BUILD, not the first request. `next.config.ts` calls
 * `assertServerEnv` at build time to enforce that.
 *
 * Security rule (master plan §11, T6): environment VALUES are never included in
 * error output. Only keys and validation messages are surfaced.
 */

import { z } from 'zod';

/** The three Atlas environments defined in the master plan (§13). */
export const ATLAS_ENVIRONMENTS = ['development', 'preview', 'production'] as const;
export type AtlasEnvironment = (typeof ATLAS_ENVIRONMENTS)[number];

/**
 * Server-side environment contract.
 *
 * Adding a variable here is the ONLY supported way to introduce configuration.
 * Reading `process.env` directly anywhere else in the codebase is a defect.
 *
 * Milestone note: M0 has no required secrets, so every Atlas-owned variable is
 * optional or defaulted. The enforcement mechanism (parse, refine, throw) is
 * live now so that M2 can make `DATABASE_URL` required by adding one line
 * rather than by introducing a new pattern.
 */
export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    /* ---- Provided automatically by Vercel. Never set these by hand. ---- */
    VERCEL: z.string().optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
    VERCEL_URL: z.string().min(1).optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
    VERCEL_GIT_COMMIT_REF: z.string().min(1).optional(),

    /* ---- Atlas-owned configuration. ---- */

    /**
     * Canonical absolute origin, e.g. `https://atlas.example.com`.
     * Optional: when unset it is derived from Vercel's own variables. Set it
     * explicitly once a custom domain exists (see docs/operations/environments.md)
     * because M3 binds passkey credentials to a fixed origin.
     */
    ATLAS_APP_URL: z.url().optional(),

    ATLAS_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  })
  .superRefine((value, ctx) => {
    // Guards a real and easily-missed misconfiguration: a Vercel production
    // deployment built with a non-production NODE_ENV silently enables dev-only
    // behaviour in a production environment.
    if (value.VERCEL_ENV === 'production' && value.NODE_ENV !== 'production') {
      ctx.addIssue({
        code: 'custom',
        path: ['NODE_ENV'],
        message: 'must be "production" when VERCEL_ENV is "production"',
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Raw input accepted by the parser. Values are unknown until validated. */
export type RawEnv = Record<string, unknown>;

export type ParseEnvResult =
  | { readonly ok: true; readonly env: ServerEnv }
  | { readonly ok: false; readonly issues: readonly EnvIssue[] };

export interface EnvIssue {
  readonly key: string;
  readonly message: string;
}

/**
 * Validate an environment object. Never throws.
 *
 * Returns issues as `{ key, message }` pairs. Values are intentionally omitted
 * so that a malformed secret can never be echoed into build logs.
 */
export function parseServerEnv(raw: RawEnv): ParseEnvResult {
  const result = serverEnvSchema.safeParse(raw);

  if (result.success) {
    return { ok: true, env: result.data };
  }

  const issues = result.error.issues.map((issue): EnvIssue => ({
    key: issue.path.length > 0 ? issue.path.join('.') : '(root)',
    message: issue.message,
  }));

  return { ok: false, issues };
}

/** Human-readable, value-free description of what is wrong with the environment. */
export function formatEnvIssues(issues: readonly EnvIssue[]): string {
  const lines = issues.map((issue) => `  - ${issue.key}: ${issue.message}`);
  return [
    'Invalid Atlas environment configuration.',
    '',
    ...lines,
    '',
    'See .env.example and docs/operations/environments.md.',
    '(Values are omitted from this message on purpose — see master plan §11, T6.)',
  ].join('\n');
}

/**
 * Validate or throw. Used at build time by `next.config.ts` and at server start
 * by `src/lib/config/env.ts`.
 */
export function assertServerEnv(raw: RawEnv): ServerEnv {
  const result = parseServerEnv(raw);
  if (!result.ok) {
    throw new Error(formatEnvIssues(result.issues));
  }
  return result.env;
}

/**
 * Resolve which of the three Atlas environments we are running in.
 *
 * `VERCEL_ENV` is authoritative when present because it distinguishes preview
 * from production, which `NODE_ENV` cannot.
 */
export function resolveAtlasEnvironment(env: ServerEnv): AtlasEnvironment {
  if (env.VERCEL_ENV) return env.VERCEL_ENV;
  return env.NODE_ENV === 'production' ? 'production' : 'development';
}

/**
 * Resolve the canonical absolute origin for this deployment.
 *
 * Order: explicit override → Vercel's stable production domain → the immutable
 * per-deployment URL → localhost. Vercel supplies hostnames without a scheme.
 */
export function resolveAppUrl(env: ServerEnv): string {
  if (env.ATLAS_APP_URL) return stripTrailingSlash(env.ATLAS_APP_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL && env.VERCEL_ENV === 'production') {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
