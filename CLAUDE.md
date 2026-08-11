@AGENTS.md

# Atlas — working agreement for AI coding agents

Read this before making any change. Then read
[`docs/architecture/overview.md`](docs/architecture/overview.md) and the
[decision records](docs/decisions/README.md).

## What this project is

Atlas is a persistent personal and business AI operating system for one user
(Neil Stutes). It is built incrementally across numbered milestones. The
governing principle is **small in current scope, enormous in architectural
potential**.

## Current milestone

**M0 — Foundation.** Complete. Do not start the next milestone unless explicitly
asked. Milestones are implemented one at a time, verified, and deployed before
the next begins.

## Non-negotiable rules

1. **Cloud-first.** Nothing may depend on a long-running local process or local
   filesystem persistence. Every milestone stays deployable to Vercel.
2. **Boundaries are enforced, not suggested.** `src/app` and `src/components`
   reach infrastructure only through `src/lib/services`. `src/lib` is React-free.
   ESLint fails the build on violation — do not weaken the rules to make code
   pass. Fix the code.
3. **Configuration goes through `src/lib/config/env.schema.ts`.** Never read
   `process.env` elsewhere. Never hardcode a secret. Never echo an environment
   value into an error or log.
4. **No silent failures.** No empty catch blocks, no swallowed errors, no
   `ignoreBuildErrors`, no `any` in `src/lib`.
5. **Mark scaffolding explicitly.** If something is a placeholder, say so in a
   comment naming the milestone that replaces it. Never present a stub as
   working behaviour.
6. **Protect the architecture.** If a request conflicts with an architectural
   decision, say so: name the conflict, explain the consequence, recommend the
   better approach, then deliver the user's intended outcome. Do not silently
   comply with something that damages the system.

## Before you claim work is done

```bash
npm run verify
```

That runs format, lint (including boundary rules), typecheck, tests, and a
production build. All five must pass. A passing `npm run dev` is not verification.

## Things that will surprise you

- **Next.js 16 does not run ESLint during `next build`.** A green build does not
  mean lint passed. CI and `npm run verify` are the only enforcement.
- **Route handlers are uncached and run on Node by default** in Next 16, so
  `export const dynamic` / `export const runtime` are unnecessary. The Edge
  runtime is banned by an ESLint rule.
- **`server-only` is stubbed in Vitest** (see `vitest.config.mts`) because it
  throws outside React's `react-server` condition. The production guard is
  unaffected.
