# ADR-0002: Neon serverless Postgres

- **Status:** Accepted — implementation due M2
- **Date:** 2026-08-11
- **Milestone:** M0 (decision), M2 (implementation)

## Context

Atlas's long-term value lives in structured, relational data: users,
organizations, projects, conversations, memories, decisions, events. The vision
explicitly rejects treating the database as a JSON dumping ground. So: Postgres.

The question is which hosted Postgres, given that Atlas is Vercel-native and
that the deployment discipline requires **every pull request to prove its own
migration** before merge.

Candidates evaluated: Neon and Supabase.

## Decision

**Neon serverless Postgres**, with three environments: `dev`, a branch per
preview deployment, and `production`. Drizzle ORM with `drizzle-kit` for
migrations, generating plain reviewable SQL.

Two factors decided it.

**1. Database branching.** Neon creates a copy-on-write branch per preview
deployment in seconds, for cents. That converts "migrations are verified before
merge" from a discipline someone has to remember into an automated property of
the pipeline. Nothing else on the table offers this.

**2. A deliberate rejection.** Supabase's greatest strength is client-direct
data access secured by row-level security. **Atlas must not use that pattern** —
every read passes through server code that applies scoping, assembles context,
and writes events (ADR-0001). Choosing Supabase would mean paying for its main
differentiator and then forbidding its use.

## Consequences

### What this makes easy

- Migration safety is automated, not remembered.
- Portability: this is plain Postgres. Moving to RDS or self-hosted later is a
  connection-string change, not a migration project.
- `pgvector` is available when and if embeddings are adopted.

### What this makes harder

- Authentication and file storage must be sourced separately (see ADR-0003;
  storage is a V2 decision). This is accepted, and partly the point — it keeps
  Atlas's identity data in Atlas's own database.
- Row-level security is available but not automatic. Phase 1 enforces scoping in
  the repository layer instead, with RLS deferred to the first non-Neil user.
  Single-layer defence is proportionate only because of the ADR-0001 chokepoint.

### What this rules out

- Nothing structurally. The schema is portable.

## Alternatives considered

| Alternative     | Why not                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Supabase        | Bundles auth and storage, but its differentiating access pattern is one Atlas forbids. No preview branching. |
| Vercel Postgres | Now Neon underneath; using Neon directly avoids an indirection.                                              |
| PlanetScale     | MySQL heritage and no `pgvector`; Atlas's data model wants Postgres.                                         |
| SQLite / local  | Violates the cloud-first rule outright.                                                                      |

## Revisit when

Preview branching stops being cheap, cost becomes material at real volume, or a
second vendor consolidation argument (auth + storage + database) outweighs
portability. If Supabase is reconsidered, the schema ports; the access pattern
must not.
