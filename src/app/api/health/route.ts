/**
 * GET /api/health
 *
 * Deployment health probe. Used by the M0 acceptance check, by CI smoke tests,
 * and (from M13) by production monitoring.
 *
 * Runtime notes:
 *   - Next.js 16 runs route handlers on the Node.js runtime by default and does
 *     not cache them, so neither `export const runtime` nor `dynamic` is needed.
 *     The Edge runtime is banned by an ESLint rule (see eslint.config.mjs).
 *   - This handler intentionally reports `environment` and `commit`. Both are
 *     low-sensitivity and necessary to verify which build is live. Whether to
 *     put this route behind auth is revisited at M13.
 */

import { NextResponse } from 'next/server';

import { getHealthReport, healthHttpStatus } from '@/lib/services/health';

export function GET(): NextResponse {
  const report = getHealthReport();

  return NextResponse.json(report, {
    status: healthHttpStatus(report.status),
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
