/**
 * Health service.
 *
 * Demonstrates the M0 access pattern that every later milestone follows:
 *   route handler  →  service  →  (repositories / providers)
 *
 * A route handler never reaches past `lib/services`. See ADR-0001.
 */

import { env } from '@/lib/config/env';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface HealthCheck {
  readonly name: string;
  readonly status: HealthStatus;
  /** Short, non-sensitive explanation. Never include configuration values. */
  readonly detail: string;
}

export interface HealthReport {
  readonly status: HealthStatus;
  readonly service: 'atlas';
  readonly environment: string;
  readonly commit: string;
  readonly timestamp: string;
  readonly checks: readonly HealthCheck[];
}

/**
 * Roll a set of individual checks up into one overall status.
 * `down` dominates `degraded`, which dominates `ok`.
 */
export function aggregateStatus(checks: readonly HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === 'down')) return 'down';
  if (checks.some((check) => check.status === 'degraded')) return 'degraded';
  return 'ok';
}

/**
 * Run every registered health check.
 *
 * M0 registers exactly one real check: configuration resolved successfully.
 * M2 adds `database` (connectivity + migration version) to this array — the
 * shape is already correct for that.
 */
export function runHealthChecks(): readonly HealthCheck[] {
  return [
    {
      name: 'configuration',
      status: 'ok',
      // Reaching this line means `lib/config/env` loaded and validated, since a
      // failed parse throws at module load.
      detail: `resolved for ${env.atlasEnvironment}`,
    },
  ];
}

export function getHealthReport(): HealthReport {
  const checks = runHealthChecks();

  return {
    status: aggregateStatus(checks),
    service: 'atlas',
    environment: env.atlasEnvironment,
    commit: env.commitSha,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/** HTTP status matching a health status. Used by the route handler. */
export function healthHttpStatus(status: HealthStatus): number {
  return status === 'down' ? 503 : 200;
}
