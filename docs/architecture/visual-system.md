# The Atlas visual system

Established in M1. Every later milestone inherits this. If a new screen needs a
colour, a weight, or a motion that is not here, the answer is almost always to
use what is here differently — not to add.

---

## 1. The one rule

**Black is command. Gold is authority. Blue is intelligence.**

|          | Gold                                                                                | Intelligence blue                                                    |
| -------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Means    | Structure, hierarchy, authority, confirmation                                       | Live intelligence: thinking, streaming, retrieval, presence          |
| Behaves  | **Static.** Present at rest.                                                        | **Temporal.** Present only while Atlas is working.                   |
| Used for | Active navigation, section markers, primary actions, approval, project/org identity | Streaming indicators, Presence activity, focus, retrieval highlights |

### Gold and blue never compete in the same region

This is the rule that makes Atlas look like Atlas rather than a dark dashboard
with two accent colours. At rest the interface is black and gold and completely
still. When Atlas works, blue moves through it. If both are lit in the same
place at the same time, neither means anything.

Practical consequences:

- A button at rest is never blue. A button is structure.
- The Presence is gold when idle or awaiting approval, blue only while working.
- A toast reports a result, so it is never blue.
- Focus rings **are** blue: focus is a live, transient state, which makes it
  consistent with the rule rather than an exception to it.

### Restraint

Most of Atlas is `--atlas-void` with hairline borders and two weights of text.
Colour is the exception, not the surface. When in doubt, remove it.

---

## 2. Tokens

`src/styles/tokens.css` is the single source of truth, mapped into Tailwind v4
through `@theme inline` in `globals.css`.

**No component may contain a raw colour.** Enforced by
`tests/unit/design/token-discipline.test.ts`, which scans `src/app`,
`src/components`, and `src/styles` for hex/rgb/hsl literals. Three files are
allowlisted because they are consumed by the OS rather than the CSS engine
(`manifest.ts`, the `themeColor` meta, and `tokens.css` itself); a second test
asserts those literals still match the tokens they duplicate.

### Contrast is a test, not an intention

`tests/unit/design/contrast.test.ts` parses the stylesheet and asserts WCAG
ratios. Two findings from M1 that are now locked in:

- **`--text-tertiary` does not meet AA for normal text (3.6:1).** This is
  deliberate and asserted in both directions — it is for large or non-essential
  text only. The test fails if someone "fixes" it without revisiting usage.
- **`--line-strong` exists because hairlines fail WCAG 1.4.11.** The decorative
  border is ~1.2:1, nowhere near the 3:1 required for the boundary of a form
  control. Inputs use `--line-strong` (3.2:1); decorative edges keep the
  hairline, which is what keeps Atlas quiet.

### Warning is orange, not amber

Contrast ratio is a luminance measure and cannot express "these look like
different things". An amber warning sits ~10° in hue from Atlas gold and reads
as authority — the one thing a warning must never do. `--state-warning` is
pushed to ~15° and the test asserts **hue distance**, not contrast. Warnings
still always carry a text label; colour is never the only signal.

---

## 3. Typography

Two families. See [ADR-0006](../decisions/0006-typography.md).

- **Geist Sans** (`--font-atlas-ui`) — information. Technical, neutral, precise.
- **Instrument Serif** (`--font-atlas-display`) — Atlas's own voice. The
  greeting, Presence moments, major headings.

The split mirrors the colour rule: the serif carries authority and pairs with
gold; the grotesk carries information and pairs with blue.

Both are self-hosted at build time by `next/font`. There is no runtime request
to Google — faster, CSP-clean, and private.

Numerics that update must not jitter: put `data-numeric` on the element to get
tabular figures.

---

## 4. Motion

- **120–240ms.** `--motion-fast` / `--motion-base` / `--motion-slow`.
- One easing family: `--ease-atlas`.
- **Transform and opacity only.** Nothing that triggers layout.
- Motion never delays interaction.

### Reduced motion must stay legible

The requirement is not "turn animation off" — it is that Atlas remains
understandable and fully operable without motion. Presence holds each state in a
distinct static pose: a travelling arc becomes a fixed arc, a breathing core
becomes a steady one. `tests/e2e/reduced-motion.spec.ts` asserts the states stay
tellable apart.

> **Hard-won:** with animation disabled, nothing delays the first keystroke, so
> text can reach the composer before React hydrates. A controlled component
> discards it and the user's first sentence silently fails to send. The composer
> recovers the pre-hydration value on mount, and there is a regression test.
> Any future input that is server-rendered and immediately reachable needs the
> same treatment.

---

## 5. Atlas Presence

CSS and SVG only — no WebGL, no canvas loop, no particles. It runs on a phone
battery all day.

Eight states exist from M1 so nothing needs redesigning later:

| State               | Colour | Motion                     |
| ------------------- | ------ | -------------------------- |
| `idle`              | gold   | slow breath                |
| `awaiting_approval` | gold   | steady pulse               |
| `thinking`          | blue   | arc travelling the ring    |
| `streaming`         | blue   | faster arc, lit core       |
| `listening`         | blue   | expanding halo             |
| `speaking`          | blue   | core swelling with cadence |
| `error`             | danger | **still**                  |
| `offline`           | line   | still, dimmed, dashed      |

`error` is deliberately motionless. A system that flails when it fails is not
trustworthy.

Inspect every state at `/dev/presence` (development and preview only).

---

## 6. Information architecture

**Command · Projects · Memory · System.**

"Today" is deliberately **not** a fifth tab. It is the home state of Command.
A separate Today screen with no calendar and no email would display its own
emptiness, and splitting it out would demote the composer. One screen, two
states: the briefing sits above the composer, and recedes when a conversation is
open.

- **Phone** — single column, fixed bottom tab bar, composer pinned above it.
- **Tablet** — the side rail replaces the tab bar.
- **Desktop** — rail + workspace + contextual right region (functional at M5).

Scope (organization · project) is always visible in the header. Knowing which
context Atlas is operating in is the difference between an answer and a leak, so
it is never hidden behind a menu.

---

## 7. Prohibitions

Not stylistic preferences — these are the specific ways this design fails.

Glassmorphism as a default surface · neon glow on static elements · RGB
gradients · sci-fi HUD chrome, corner brackets, scan lines, fake telemetry ·
animated backgrounds · skeuomorphic metal · excessive pills · gratuitous
gradients · oversized dashboard cards · large border radii · animation that
delays interaction · default shadcn styling · **decorative blue when Atlas is
idle**.

`--gold-metal` exists but is a rare premium treatment — at most one moment per
surface, never a component background.

---

## 8. Accessibility floor

- Minimum touch target **44px**. There is deliberately no "small" button size:
  encoding a violation as a convenient option guarantees it gets used.
- Visible focus on everything, via one global `:focus-visible` treatment.
- A skip link is the first focusable element on every page.
- Inputs are 16px minimum so iOS Safari does not zoom on focus.
- User scaling is never disabled.
- Safe-area insets respected top and bottom.
- Colour is never the only signal.
- No horizontal scrolling at any width down to 320px — asserted for every route
  at four viewports.
