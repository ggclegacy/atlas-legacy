# ADR-0006: Geist Sans and Instrument Serif

- **Status:** Accepted
- **Date:** 2026-08-12
- **Milestone:** M1

## Context

Atlas needs two typefaces: one to carry information, one to carry its own voice.
The constraints were explicit — a precise, slightly technical grotesk for the
interface; something with more character for the greeting, Presence moments, and
major headings; two families maximum; variable where sensible; loaded through
`next/font` with no runtime external request; excellent on an iPhone; tabular
figures available.

The stated failure mode was choosing fonts because they are fashionable in SaaS.

There is also a real risk specific to Atlas: dark plus gold is not by itself
distinctive. Almost every "premium dark" product is set entirely in one neutral
grotesk. If Atlas does the same, it will look like the category it is trying not
to belong to, no matter how good the palette is.

## Decision

**UI: Geist Sans.** A neutral technical grotesk drawn specifically for interface
use — tight spacing, unambiguous letterforms, a genuine variable weight axis, and
excellent rendering at the small sizes a phone forces. Rejected Inter, which is
competent and completely characterless through overuse; it has become the default
voice of SaaS and would make Atlas sound like everything else.

**Display: Instrument Serif.** A high-contrast editorial serif, used at one
weight, reserved for Atlas speaking in its own voice.

**The pairing is the point.** It maps onto the colour rule rather than sitting
beside it:

- serif → authority → pairs with **gold**
- grotesk → information → pairs with **intelligence blue**

An all-sans interface cannot express that distinction typographically, so the
colour rule ends up carrying it alone. The serif also does the thing dark-and-gold
cannot do by itself: it makes Atlas read as _expensive_ rather than merely dark.

Both are loaded via `next/font/google`, which self-hosts them at build time.

## Consequences

### What this makes easy

- Atlas's voice is typographically distinct from its data, without a third family.
- No runtime font request: faster first paint, CSP-clean, and nothing about
  Neil's usage leaks to a font CDN.
- Restraint is enforced by the display face having one weight. It cannot sprawl.

### What this makes harder

- Instrument Serif has no weight axis, so display text cannot be emphasised by
  weight. Size and colour must do that work. This is a constraint, and it keeps
  the display face disciplined.
- A serif in a command interface is an unusual choice and will read as wrong to
  anyone expecting the standard dark-SaaS look.

### What this rules out

- A third family. Two is the ceiling.
- Using the display face for UI chrome, labels, or data.

## Alternatives considered

| Alternative                             | Why not                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Inter for UI                            | The default SaaS voice. Technically fine, aesthetically anonymous.                   |
| IBM Plex Sans for UI                    | Genuine character, but carries an unmistakable IBM association.                      |
| Geist Sans + Geist Mono                 | Mono as a display face reads as "developer tool", not chief of staff.                |
| All-sans, differentiated by weight/size | Cheapest option, and the one that lands Atlas squarely in generic dark SaaS.         |
| A commercial grotesk (Söhne, Suisse)    | Licensing cost and complexity for a single-user system, before the design is proven. |

## Revisit when

Neil finds the serif greeting precious rather than premium on the phone — this is
the single most subjective decision in M1 and the one most worth challenging
after real daily use. Swapping the display face is a one-line change in
`src/app/fonts.ts`, because nothing references the family directly; everything
goes through `--font-atlas-display`.
