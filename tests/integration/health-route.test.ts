import { describe, expect, it } from 'vitest';

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns 200 with a healthy report', async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const body: unknown = await response.json();
    expect(body).toMatchObject({ status: 'ok', service: 'atlas' });
  });

  it('is never cached', () => {
    expect(GET().headers.get('cache-control')).toContain('no-store');
  });

  it('exposes only the expected fields', async () => {
    // Pins the public shape of the probe so a later milestone cannot widen it
    // by accident. Adding a field here should be a deliberate edit.
    const body = (await GET().json()) as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual([
      'checks',
      'commit',
      'environment',
      'service',
      'status',
      'timestamp',
    ]);
  });
});
