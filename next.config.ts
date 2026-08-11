import type { NextConfig } from 'next';

import { assertServerEnv } from './src/lib/config/env.schema';

/**
 * Fail the BUILD on invalid configuration, not the first request.
 *
 * Master plan §13: "Environment variables are parsed and validated by Zod at
 * boot. A missing or malformed variable fails the build, not the first request."
 */
assertServerEnv(process.env);

/**
 * Baseline security headers (master plan §11).
 *
 * Content-Security-Policy is deliberately NOT set here. A useful CSP for Next.js
 * requires per-request nonces, which belongs with the auth middleware. Tracked
 * for M13 — see docs/architecture/overview.md.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  {
    // Atlas has no camera/geolocation surface. `microphone` is re-opened at V5
    // when voice lands (master plan §21) — not before.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Surface type failures at build time. Never disable this to make a deploy go
  // through — fix the code (master plan §30).
  //
  // Note: Next.js 16 removed the `eslint` config option and no longer runs
  // ESLint as part of `next build`. Lint is therefore enforced ONLY by CI and
  // by `npm run verify`. Do not assume a green Vercel build means lint passed.
  typescript: { ignoreBuildErrors: false },

  // Vercel sets this itself; disabling it keeps the runtime surface minimal.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
