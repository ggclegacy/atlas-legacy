# ADR-0003: Better Auth, with authentication separated from authorization

- **Status:** Accepted — implementation due M3
- **Date:** 2026-08-11
- **Milestone:** M0 (decision), M3 (implementation)

## Context

Atlas is initially for one user, but the auth must be real — not a placeholder
that gets thrown away. It must also anticipate organizations, and eventually
machine credentials for an Atlas Node.

The trap here is subtle and matters more than the vendor choice. Atlas's
**organizations are domain objects**: they own projects, memories, decisions,
and eventually agent permissions. Most auth vendors also ship an "organizations"
concept. Modeling Atlas's organizations inside an auth vendor creates two
sources of truth and permanent synchronization.

## Decision

**The auth system provides authentication (identity) only. Atlas owns
authorization, organizations, membership, and roles in its own schema.**

The seam between them is a single column: `users.auth_subject_id`.

Within that constraint, the vendor is **Better Auth**, storing its tables in
Atlas's own Postgres, with **passkey as the primary method and email OTP as
fallback**. No passwords.

Rationale for Better Auth specifically:

- Identity data stays in Atlas's database, satisfying the data-ownership
  principle rather than renting it from a vendor.
- Provides a path to machine credentials for a future Atlas Node.
- Passkeys are phishing-resistant and, on Neil's phone, faster than any
  alternative.

## Consequences

### What this makes easy

- Atlas's organization model stays domain-shaped and un-duplicated.
- Swapping the auth vendor touches roughly three files, because the domain
  depends on one column, not on vendor table shapes.
- Sign-in on a phone is Face ID.

### What this makes harder

- Better Auth is the youngest dependency in the stack, on the most
  security-sensitive path. This is the decision most worth external scrutiny.

### What this rules out

- Using vendor-managed organizations. Deliberate.

## Alternatives considered

| Alternative        | Why not                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Clerk              | Excellent and lower-risk; the acceptable substitute. Rejected only because identity data lives with the vendor.  |
| Auth.js (NextAuth) | Free and flexible, but organization modeling and session ergonomics are DIY on the most security-sensitive path. |
| Supabase Auth      | Would couple identity to a database vendor Atlas did not choose (ADR-0002).                                      |
| Hand-rolled auth   | Not defensible for a system holding financial and business context.                                              |

## Revisit when

Better Auth proves unreliable during M3, or a second human user creates
requirements it does not serve. **Clerk is the pre-approved substitute** —
authentication only, Clerk Organizations left unused. The `auth_subject_id` seam
is what keeps that swap contained.
