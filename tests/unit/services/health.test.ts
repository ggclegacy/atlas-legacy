import { describe, expect, it } from 'vitest';

import {
  aggregateStatus,
  getHealthReport,
  healthHttpStatus,
  type HealthCheck,
} from '@/lib/services/health';

function check(status: HealthCheck['status']): HealthCheck {
  return { name: `check-${status}`, status, detail: 'test' };
}

describe('aggregateStatus', () => {
  it('is ok when every check is ok', () => {
    expect(aggregateStatus([check('ok'), check('ok')])).toBe('ok');
  });

  it('is degraded when any check is degraded', () => {
    expect(aggregateStatus([check('ok'), check('degraded')])).toBe('degraded');
  });

  it('lets down dominate degraded', () => {
    expect(aggregateStatus([check('degraded'), check('down')])).toBe('down');
  });

  it('is ok for an empty check list', () => {
    expect(aggregateStatus([])).toBe('ok');
  });
});

describe('healthHttpStatus', () => {
  it('returns 503 only when down', () => {
    expect(healthHttpStatus('ok')).toBe(200);
    expect(healthHttpStatus('degraded')).toBe(200);
    expect(healthHttpStatus('down')).toBe(503);
  });
});

describe('getHealthReport', () => {
  it('reports a healthy Atlas with at least the configuration check', () => {
    const report = getHealthReport();

    expect(report.status).toBe('ok');
    expect(report.service).toBe('atlas');
    expect(report.checks.map((c) => c.name)).toContain('configuration');
    expect(() => new Date(report.timestamp).toISOString()).not.toThrow();
  });
});
