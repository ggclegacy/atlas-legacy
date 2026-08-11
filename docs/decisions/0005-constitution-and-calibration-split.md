# ADR-0005: Atlas personality splits into Constitution (code) and Calibration (data)

- **Status:** Accepted — implementation due M5
- **Date:** 2026-08-11
- **Milestone:** M0 (decision), M5 (implementation)

## Context

Atlas must have a distinct advisory character, and it must become **calibrated
to Neil over time**. It must simultaneously **never autonomously rewrite its own
personality**.

Those two requirements pull against each other, and the usual resolution —
instructing the model not to change its own instructions — is not a control. It
is a request. A system that adjusts its own operating instructions based on its
own inference of your preferences will drift somewhere you did not choose, and
you will not be able to reconstruct how it got there.

The requirement is therefore structural: make the safe thing the only thing the
system is _capable_ of.

## Decision

Personality is split into two stores with different write paths.

|                    | **Constitution**                                                                                           | **Calibration**                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Contains           | Invariant character: advisory posture, anti-sycophancy, response discipline, honesty, refusal to fabricate | Learned preferences: "challenge earlier", "fewer options, stronger recommendation", verbosity |
| Lives in           | `src/lib/atlas/persona/constitution.ts`, git-versioned                                                     | The `preferences` table                                                                       |
| Changed by         | A pull request                                                                                             | Neil approving a proposal                                                                     |
| Model may write it | **Never — there is no write path**                                                                         | **Only as a proposal**                                                                        |

Atlas may _propose_ a calibration change, with cited evidence. Neil approves,
edits, rejects, or ignores it. Approved calibration is rendered deterministically
into the prompt and is retirable at any time.

The Constitution carries a **hard token budget enforced by test**, so it cannot
sprawl into thousands of tokens of contradictory instructions.

## Consequences

### What this makes easy

- Atlas genuinely improves with use.
- Every learned change has a proposal record, an approval timestamp, and a
  rollback.
- Character changes are code review, with a diff and history.

### What this makes harder

- Calibration cannot be applied instantly by the model noticing something. That
  latency is the feature.

### What this rules out

Explicitly, for Phase 1:

- Automatic modification of the Constitution — ever.
- Auto-approval of calibration at any confidence level.
- Model-authored prompt text entering the system prompt unreviewed.
- Autonomous memory deletion or supersession (Atlas proposes; Neil confirms).
- Continuous background self-analysis.
- Fine-tuning or embedding "Neil's style" into weights.

## Alternatives considered

| Alternative                               | Why not                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| One system prompt containing everything   | Unversionable, untestable, unauditable — and the vision rejects it outright.            |
| All personality in the database           | Character becomes silently mutable; no code review on the most behaviour-defining text. |
| Model self-edits with a "be careful" rule | Not a control. Drift becomes unreconstructable.                                         |

## Revisit when

The proposal loop proves too slow to be useful in practice — measured by Neil
approving nearly everything Atlas proposes over a sustained period, which would
justify a narrow, category-scoped auto-approval with an audit trail. Not before.
