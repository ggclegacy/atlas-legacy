# ADR-0001: Single Next.js application with enforced internal boundaries

- **Status:** Accepted
- **Date:** 2026-08-11
- **Milestone:** M0

## Context

Atlas will eventually have several consumers: the web application, a future
Atlas Node running on Neil's workstation, possibly background workers, and
possibly a native shell. That future makes a monorepo tempting on day one.

But a monorepo solves _sharing between multiple deployables_, and Phase 1 has
exactly one deployable. Turborepo configuration, workspace resolution, and
multi-package builds would be overhead paid on every milestone in exchange for a
benefit that arrives, at the earliest, at V4.

The opposite failure is equally real: a single application with no internal
structure becomes impossible to extract from later, and every future consumer
starts by rewriting.

## Decision

Atlas is **one Next.js App Router application** with **hard, lint-enforced
internal boundaries**.

Two rules define the architecture:

1. **`src/lib` contains no React.** No `react`, `react-dom`, `next/navigation`,
   and no imports from `@/components` or `@/app`. Dependencies point inward.
2. **UI code enters the domain through `src/lib/services`.** `src/app` and
   `src/components` may not import `lib/db`, `lib/ai`, `lib/atlas`, or
   `lib/events`.

Both are enforced by `no-restricted-imports` in `eslint.config.mjs`, verified to
fire, and run in CI.

## Consequences

### What this makes easy

- Every milestone ships without build-system tax.
- Organization scoping, event recording, and future capability checks have
  exactly **one** chokepoint (`lib/services`) to instrument. This is what makes
  the V3 permission system implementable below the prompt rather than inside it.
- Extraction later is a directory move plus an import rewrite, because the
  domain layer already has no framework or UI dependencies.

### What this makes harder

- A second deployable cannot share code until the extraction is done — roughly a
  day of work, incurred once.

### What this rules out

- Nothing permanently. The structure was chosen so the monorepo remains
  available rather than foreclosed.

## Alternatives considered

| Alternative                     | Why not                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Turborepo monorepo from day one | Real cost every milestone; benefit arrives at V4 at the earliest. Premature complexity is also debt. |
| Single app, no boundaries       | Cheapest now, unextractable later, and leaves scoping/audit enforceable only by discipline.          |
| Separate API service            | Microservice split with one user and one team. Adds deployment and latency cost for no benefit.      |

## Revisit when

A second deployable actually exists and needs to share domain code — most likely
the Atlas Node at V4. At that point, extract `src/lib` into `packages/core` and
adopt a workspace. The boundary rules are what make that a mechanical change.
