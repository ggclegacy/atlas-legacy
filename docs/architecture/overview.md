# Atlas architecture overview

**Status as of M0.** This document grows with each milestone. Anything described
as landing in a later milestone does not exist yet.

---

## 1. What Atlas is building toward

Atlas is a persistent personal and business AI operating system. Phase 1
establishes four load-bearing systems; everything after V1 is additive on top of
them:

1. **Scoped domain core** — users, organizations, projects, conversations.
   Everything is scoped from the first query so business contexts never merge.
2. **Context assembly** — one deterministic component that composes Atlas's
   prompt under a token budget and emits an auditable manifest of what it used.
3. **Structured memory with provenance** — typed memories, first-class
   decisions, human-gated writes, full edit/delete/supersede.
4. **Auditable operation** — an events trail plus an `ai_runs` record of every
   model call's cost, latency, and context manifest.

M0 builds none of those four. It builds the ground they stand on.

## 2. Layers

```
  src/app            Routes, layouts, route handlers.  Knows about HTTP and React.
        │
        │  may import: lib/services, lib/validation, lib/config, lib/auth
        ▼
  src/lib/services   Domain services.  The only entry point for UI code.
        │            Combines data access + model calls + event recording.
        ▼
  src/lib/db  ·  src/lib/ai  ·  src/lib/atlas  ·  src/lib/events
                     Infrastructure and domain internals.  Never reached directly
                     from the UI layer.
```

Dependencies point **inward only**. `src/lib` never imports from `src/app` or
`src/components`.

### Why the chokepoint matters

Routing every read and write through `lib/services` is what makes three future
properties possible without a rewrite:

- **Organization scoping** cannot be bypassed, because there is one place that
  applies it.
- **Event recording** cannot be skipped, because mutations happen in one layer.
- **Capability checks** (V3, `email.send` and friends) have exactly one place to
  be enforced — below the prompt, not inside it.

### Enforcement

`eslint.config.mjs` implements four boundaries. They are verified to fire; a
violation is an error, not a warning:

| Boundary                       | Rule                                                   |
| ------------------------------ | ------------------------------------------------------ |
| UI cannot reach infrastructure | `no-restricted-imports` on `src/app`, `src/components` |
| `src/lib` is React-free        | `no-restricted-imports` on `src/lib`                   |
| Provider SDKs live in one file | restricted everywhere except `src/lib/ai/providers.ts` |
| Edge runtime is banned         | `no-restricted-syntax`                                 |

> **Flat-config caveat.** The last matching config object wins per rule. Each
> block owns `no-restricted-imports` for a _disjoint_ set of files. Adding an
> overlapping block silently replaces rather than merges. If you add a boundary,
> re-run the probe described in §7.

## 3. Configuration

`src/lib/config/env.schema.ts` is the configuration contract, and the only place
`process.env` may be read.

- **Pure by design** — no `server-only`, no side effects — so it can be imported
  by `next.config.ts` at build time, by the server at runtime, and by tests.
- `next.config.ts` calls `assertServerEnv(process.env)`, so **invalid
  configuration fails the build, not the first request**.
- `src/lib/config/env.ts` is the `server-only` singleton the application uses.
- **Environment values are never echoed** into errors or logs. Only keys and
  validation messages. This is tested.

Adding configuration = adding a field to the schema. Nothing else.

## 4. Runtime

- **Node.js runtime only.** Next.js 16 defaults to it; the Edge runtime is
  deprecated upstream and banned here. Atlas needs execution duration, database
  drivers, and `after()` for post-response work (memory extraction,
  summarization) from M4 onward.
- **Route handlers are uncached by default** in Next 16, so `export const
dynamic` is unnecessary. `/api/health` additionally sets `Cache-Control:
no-store`.
- **Stateless.** Nothing may rely on process memory surviving between requests
  or on the local filesystem. This is a permanent constraint, not a Vercel
  detail.

## 5. Security posture at M0

Implemented now:

- Baseline security headers (`next.config.ts`): `nosniff`, `DENY` framing,
  `strict-origin-when-cross-origin`, HSTS, a closed `Permissions-Policy`.
- `poweredByHeader` disabled.
- `robots: noindex, nofollow` — Atlas is private and must never be indexed.
- `server-only` on the environment singleton, so a client import is a build
  error rather than a runtime secret leak.
- No secret is echoed into build output.

Deliberately deferred, with triggers:

| Control                 | Lands | Trigger                                           |
| ----------------------- | ----- | ------------------------------------------------- |
| Content-Security-Policy | M13   | Needs per-request nonces from the auth middleware |
| Authentication          | M3    | Scheduled                                         |
| Row-level security      | V2    | First non-Neil user or service credential         |
| Capability permissions  | V3    | First real-world action                           |

`/api/health` currently exposes environment name and commit SHA without
authentication. Both are low-sensitivity and needed to verify which build is
live. Revisit at M13.

## 6. Testing

| Layer       | Location             | Runs                              |
| ----------- | -------------------- | --------------------------------- |
| Unit        | `tests/unit/`        | Every PR                          |
| Integration | `tests/integration/` | Every PR                          |
| E2E / evals | —                    | Playwright from M1, evals from M5 |

`server-only` is aliased to a stub in `vitest.config.mts` because it throws
outside React's `react-server` condition. The production guard is unaffected.

## 7. Verifying the boundaries still work

Lint passing proves nothing on its own — a misconfigured rule also passes. To
confirm the boundaries actually fire, create a temporary file that violates each
one, run `npx eslint` on it, confirm the expected errors, and delete it. Do this
whenever `eslint.config.mjs` changes.

## 8. Milestone gate

No milestone is complete until `npm run verify` passes and the change has been
smoke-tested on a Vercel preview deployment. `npm run dev` working is not
verification.

Note that **Next.js 16 removed ESLint from `next build`**. A green Vercel build
does not mean lint or the boundary rules passed. CI is the only enforcement.
