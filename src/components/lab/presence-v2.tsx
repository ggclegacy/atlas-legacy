/**
 * ATLAS PRESENCE V2 — VP1 evaluation prototype.
 *
 * Not a spinner, not an orb. The design intent is *evidence that cognition is
 * happening inside the machine*, which imposes three rules:
 *
 *   1. A FIXED DATUM. A tick that never moves, so any rotation is measurable.
 *      Rotation you can measure reads as a mechanism; rotation you cannot reads
 *      as a loading state. This is the single most important choice here.
 *   2. INDEXED MOVEMENT. The index arrives at discrete stops (steps() timing),
 *      never glides continuously.
 *   3. NON-CIRCULAR GEOMETRY. Unequal housing segments at unequal radii, and a
 *      nucleus that is deliberately not a dot.
 *
 * Deliberately free of SVG `id`s (no gradients, no masks — the intelligence
 * field is an HTML layer beneath the SVG). That keeps it server-renderable and
 * safe to repeat many times on one page.
 */

export const PV2_STATES = [
  'idle',
  'attentive',
  'listening',
  'understanding',
  'retrieving',
  'thinking',
  'synthesizing',
  'streaming',
  'speaking',
  'working',
  'waiting',
  'awaiting_approval',
  'warning',
  'error',
  'offline',
] as const;

export type Pv2State = (typeof PV2_STATES)[number];
export type Pv2Geometry = 'a' | 'b' | 'c';
export type Pv2Size = 'sm' | 'md' | 'lg';

/** Accessible label and the plain-language meaning shown in the lab. */
export const PV2_LABELS: Record<Pv2State, string> = {
  idle: 'Atlas is ready',
  attentive: 'Atlas noticed you',
  listening: 'Atlas is listening',
  understanding: 'Atlas is taking it in',
  retrieving: 'Atlas is gathering context',
  thinking: 'Atlas is reasoning',
  synthesizing: 'Atlas is drawing it together',
  streaming: 'Atlas is responding',
  speaking: 'Atlas is speaking',
  working: 'Atlas is working in the background',
  waiting: 'Atlas is waiting on something',
  awaiting_approval: 'Atlas needs your decision',
  warning: 'Atlas has a concern',
  error: 'Atlas failed',
  offline: 'Atlas is offline',
};

/** What each state is meant to TELL Neil. If a state has no answer here, cut it. */
export const PV2_MEANING: Record<Pv2State, string> = {
  idle: 'present, not working',
  attentive: 'input received',
  listening: 'receiving, amplitude tracks input',
  understanding: 'concentrating on what arrived',
  retrieving: 'energy inward — context being gathered',
  thinking: 'internal complexity — cognition',
  synthesizing: 'multiple streams converging',
  streaming: 'energy outward — result being emitted',
  speaking: 'output with cadence',
  working: 'background process advancing',
  waiting: 'blocked on something external',
  awaiting_approval: 'gold + stillness = human authority required',
  warning: 'a segment opens',
  error: 'broken geometry — never a flashing colour',
  offline: 'absent interior',
};

interface Segment {
  from: number;
  to: number;
  r: number;
}

/**
 * Three controlled asymmetry levels for side-by-side judgement.
 * Every variant leaves a gap spanning the top so the datum sits in open space.
 */
export const PV2_GEOMETRY: Record<Pv2Geometry, Segment[]> = {
  // A — subtle: near-equal thirds, small gaps, single radius.
  a: [
    { from: 6, to: 114, r: 24 },
    { from: 126, to: 234, r: 24 },
    { from: 246, to: 354, r: 24 },
  ],
  // B — moderate: unequal spans, one segment inset. The recommended target.
  b: [
    { from: 8, to: 152, r: 24 },
    { from: 166, to: 264, r: 24 },
    { from: 280, to: 352, r: 20 },
  ],
  // C — strong: four segments, three radii, wider gaps. Comparison only.
  c: [
    { from: 12, to: 128, r: 24 },
    { from: 142, to: 206, r: 19 },
    { from: 222, to: 300, r: 24 },
    { from: 316, to: 356, r: 15 },
  ],
};

const CX = 32;
const CY = 32;

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arc(r: number, from: number, to: number): string {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * Radial propagation traces. Direction is carried by where the dash SITS on the
 * line, not only by its travel — otherwise the static (reduced-motion) form
 * loses the one thing the state is there to communicate.
 *
 * Six long strokes rather than eight short ones: short dashes read as scattered
 * confetti, long half-drawn strokes read as direction.
 */
const TRACES = Array.from({ length: 6 }, (_, i) => {
  const angle = 30 + i * 60;
  const [x1, y1] = polar(13, angle);
  const [x2, y2] = polar(22, angle);
  return { x1, y1, x2, y2 };
});

/**
 * The nucleus. Deliberately not a circle — a slightly irregular machined form,
 * so even at rest the core does not read as a dot.
 */
const NUCLEUS =
  'M 32 26.4 C 35.3 26.4 37.5 28.8 37.5 31.9 C 37.5 35.4 35 37.7 31.7 37.7 C 28.5 37.7 26.5 35.5 26.5 32.3 C 26.5 28.8 28.9 26.4 32 26.4 Z';

export interface PresenceV2Props {
  state?: Pv2State;
  geometry?: Pv2Geometry;
  size?: Pv2Size;
  decorative?: boolean;
  className?: string;
}

export function PresenceV2({
  state = 'idle',
  geometry = 'b',
  size = 'md',
  decorative = false,
  className,
}: PresenceV2Props) {
  const segments = PV2_GEOMETRY[geometry];

  return (
    <span
      className={['pv2', `pv2--${size}`, className].filter(Boolean).join(' ')}
      data-state={state}
      data-geometry={geometry}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': PV2_LABELS[state] })}
    >
      {/* Intelligence field — an HTML layer, so no SVG gradient/mask ids. */}
      <span className="pv2__field" aria-hidden />

      <svg className="pv2__svg" viewBox="0 0 64 64" fill="none">
        {/* Propagation: dash travel encodes direction (inward vs outward). */}
        <g className="pv2__prop">
          {TRACES.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              pathLength={10}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </g>

        {/* Housing — the engineered structure. Gold, segmented, unequal. */}
        <g className="pv2__housing">
          {segments.map((s, i) => (
            <path key={i} className={`pv2__seg pv2__seg--${i}`} d={arc(s.r, s.from, s.to)} />
          ))}
        </g>

        {/* Index — arrives at discrete stops, measured against the datum. */}
        <g className="pv2__index">
          <path d={arc(27, -5, 5)} />
        </g>

        {/* Datum — fixed reference. NEVER moves. */}
        <line className="pv2__datum" x1={32} y1={6} x2={32} y2={2} />

        {/* Nucleus and its internal detail (cognition). */}
        <path className="pv2__nucleus" d={NUCLEUS} />
        {/*
          Internal detail — deliberately asymmetric strokes at unrelated angles.
          Two parallel horizontal lines read as a text glyph ("="), which is
          exactly the wrong signal; this reads as machinery.
        */}
        <g className="pv2__core">
          <line x1={29.8} y1={30.6} x2={33.4} y2={31.8} />
          <line x1={30.4} y1={33.8} x2={32.6} y2={32.6} />
        </g>
      </svg>
    </span>
  );
}
