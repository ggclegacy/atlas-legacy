# ADR-0004: Vercel AI SDK as the model layer, with a thin Atlas layer above it

- **Status:** Accepted — implementation due M4
- **Date:** 2026-08-11
- **Milestone:** M0 (decision), M4 (implementation)

## Context

Atlas must not become tightly coupled to a single model provider — the operating
system has to outlive whichever model is currently best. The obvious response is
"build a provider abstraction," and the obvious failure mode is building a second
abstraction on top of one that already exists.

The Vercel AI SDK already **is** the provider abstraction: swappable providers,
streaming primitives designed for Vercel, Zod-typed structured output, and tool
calling for V3.

## Decision

Use the **Vercel AI SDK** for provider abstraction, streaming, and structured
output. Wrap it in `src/lib/ai/` exposing three Atlas-level functions:

| Function           | Purpose                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `atlasStream()`    | Conversation generation + `ai_runs` logging + spend cap + errors |
| `atlasExtract()`   | Cheap structured extraction, Zod schema in, typed object out     |
| `atlasSummarize()` | Rolling conversation summaries                                   |

What the Atlas layer adds is explicitly **not** provider abstraction — it is
observability, cost control, and context assembly, which the SDK does not do.

**Provider-specific imports (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `openai`,
`@anthropic-ai/*`) may appear in exactly one file: `src/lib/ai/providers.ts`.**
An ESLint rule enforces this repository-wide, and it is active now, before the
file exists.

**Two model tiers**, both pinned by ID in configuration, never at call sites:

- **Reasoning tier** — a frontier model. Conversation only.
- **Utility tier** — a small, fast model. Titles, extraction, classification,
  summarization.

Anthropic is configured as a secondary provider at M5 **purely to prove the
abstraction**: switching the reasoning tier must be one config change. If it is
not, the abstraction has already leaked.

## Consequences

### What this makes easy

- Switching providers, or running different tiers on different providers.
- Streaming that works correctly on Vercel without hand-rolled plumbing.
- Tool calling at V3 with no re-architecture.

### What this makes harder

- Atlas inherits the SDK's release cadence and its opinions about message shape.

### What this rules out

- A custom model router, fallback chains, and provider health checks. At one
  user these are cost without benefit, and they can be added later inside
  `lib/ai/` without touching callers.

## Alternatives considered

| Alternative                        | Why not                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Provider SDKs directly             | Couples Atlas to one vendor's message format across the whole codebase.               |
| A hand-built abstraction over SDKs | Rebuilds what the AI SDK already does, and must be maintained against every provider. |
| LangChain / similar                | Large surface area, heavy abstractions, opinions Atlas does not share.                |

## Revisit when

The abstraction demonstrably leaks — the M5 provider-swap test failing is the
signal — or Atlas needs routing behaviour (cost-based selection, fallback) that
belongs below `lib/ai` rather than inside it.
