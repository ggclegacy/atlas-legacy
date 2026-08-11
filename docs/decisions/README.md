# Architecture Decision Records

An ADR captures a decision that would be expensive to reverse, together with the
reasoning that produced it. The point is that a future developer — human or AI —
can tell the difference between a deliberate choice and an accident.

## Format

Copy [`0000-template.md`](0000-template.md). Number sequentially. Never rewrite
history: a decision that changes gets a **new** ADR that supersedes the old one,
and the old one is marked `Superseded by ADR-XXXX`.

## Accepted

| ADR                                                   | Decision                                                 | Status                           |
| ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| [0001](0001-single-nextjs-application.md)             | Single Next.js application, not a monorepo               | Accepted — implemented M0        |
| [0002](0002-neon-postgres.md)                         | Neon serverless Postgres                                 | Accepted — implementation due M2 |
| [0003](0003-authentication-provides-identity-only.md) | Better Auth, authentication separated from authorization | Accepted — implementation due M3 |
| [0004](0004-vercel-ai-sdk-model-layer.md)             | Vercel AI SDK as the model layer                         | Accepted — implementation due M4 |
| [0005](0005-constitution-and-calibration-split.md)    | Personality splits into Constitution and Calibration     | Accepted — implementation due M5 |

ADRs 0002–0005 record decisions that are **locked but not yet built**. They were
written at M0 deliberately: the reasoning was fresh, and locking them prevents a
later milestone from quietly re-deciding under time pressure.

## Decided, ADR pending

These were settled in the Phase 1 master plan and are recorded here so they are
not rediscovered by accident. Each gets a full ADR at the milestone that
implements it or when its trigger fires.

| Decision                      | Summary                                                                | ADR due                             |
| ----------------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| Embeddings deferred           | Structured + full-text retrieval first. pgvector columns exist unused. | On trigger (eval-driven)            |
| `after()` for background work | Post-response work runs in-invocation. No durable queue in Phase 1.    | M4                                  |
| Server-authoritative access   | UI reaches infrastructure only through `lib/services`.                 | Covered by ADR-0001 (§ enforcement) |
| Row-level security deferred   | Scoping enforced in repositories. RLS on first non-Neil user.          | On trigger                          |
| No voice in Phase 1           | OS keyboard dictation already covers phone input.                      | V5                                  |
