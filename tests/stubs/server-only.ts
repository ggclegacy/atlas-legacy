/**
 * Test stub for the `server-only` package.
 *
 * The real package throws unless it is resolved under the "react-server"
 * export condition. Vitest runs plain Node, so it is aliased to this no-op in
 * vitest.config.ts. The production guard is unaffected: Next.js still fails the
 * build if a Client Component imports a `server-only` module.
 */
export {};
