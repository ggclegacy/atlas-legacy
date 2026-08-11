# `src/lib` — the Atlas domain layer

Everything below this directory is framework-adjacent but **UI-free**. It is the
seam described in ADR-0001: when a second consumer appears (an Atlas Node, a
worker, a native shell), this directory becomes a shared package by being moved,
not by being rewritten.

## The two rules that matter

1. **No React below this line.** No `react`, `react-dom`, `next/navigation`, and
   no imports from `@/components` or `@/app`. Dependencies point inward only.
2. **UI code enters through `services/`.** `src/app` and `src/components` may
   import `services/`, `validation/`, and `config/`. They may not import `db/`,
   `ai/`, `atlas/`, or `events/`.

Both are enforced by ESLint (`eslint.config.mjs`), not by convention. Violations
fail CI.

## Directories

| Directory     | Owns                                                                              | Lands |
| ------------- | --------------------------------------------------------------------------------- | ----- |
| `config/`     | Environment parsing and typed configuration. The only place `process.env` is read | M0 ✅ |
| `services/`   | Domain services. The single entry point for UI code                               | M0 ✅ |
| `db/`         | Drizzle schema, migrations, and scope-enforcing repositories                      | M2    |
| `auth/`       | Session resolution and route guards. Isolates the auth vendor                     | M3    |
| `ai/`         | Provider-agnostic model layer, `ai_runs` logging, spend caps                      | M4    |
| `events/`     | `recordEvent()` and the event-type registry                                       | M4    |
| `validation/` | Zod schemas shared by HTTP input, forms, and AI structured output                 | M4    |
| `atlas/`      | Constitution, context assembly, memory, learning                                  | M5    |

Directories marked with a later milestone do not exist yet. They are listed here
so the boundaries are legible before the code arrives — the ESLint rules that
protect them are already active and will fire the moment those paths are used
from the wrong layer.

## Adding a service

A service is the only place that may combine data access, model calls, and event
recording. Every mutating service records an event. See
`docs/architecture/overview.md`.
