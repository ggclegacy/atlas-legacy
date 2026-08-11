/**
 * The validated server environment singleton.
 *
 * Import this — never `process.env` — from server code.
 *
 * This module is `server-only`: importing it from a Client Component is a build
 * error rather than a runtime secret leak (master plan §11, T5/T7).
 */

import 'server-only';

import {
  assertServerEnv,
  resolveAppUrl,
  resolveAtlasEnvironment,
  type AtlasEnvironment,
  type ServerEnv,
} from './env.schema';

export interface AtlasEnv extends ServerEnv {
  /** Which of the three Atlas environments this process is serving. */
  readonly atlasEnvironment: AtlasEnvironment;
  /** Canonical absolute origin, no trailing slash. */
  readonly appUrl: string;
  /** Git commit this build was produced from, or `"local"` outside Vercel. */
  readonly commitSha: string;
  readonly isProduction: boolean;
  readonly isPreview: boolean;
  readonly isDevelopment: boolean;
}

function loadEnv(): AtlasEnv {
  // Throws at module load — i.e. at server start or build, never mid-request.
  const parsed = assertServerEnv(process.env);
  const atlasEnvironment = resolveAtlasEnvironment(parsed);

  return Object.freeze({
    ...parsed,
    atlasEnvironment,
    appUrl: resolveAppUrl(parsed),
    commitSha: parsed.VERCEL_GIT_COMMIT_SHA ?? 'local',
    isProduction: atlasEnvironment === 'production',
    isPreview: atlasEnvironment === 'preview',
    isDevelopment: atlasEnvironment === 'development',
  });
}

export const env: AtlasEnv = loadEnv();
