/**
 * ATLAS PRESENCE — the visual manifestation of Atlas intelligence.
 *
 * Not a spinner, not an orb. Three rules make the difference:
 *
 *   1. A FIXED DATUM. A tick that never moves, so rotation is measurable.
 *      Rotation you can measure reads as a mechanism; rotation you cannot reads
 *      as a loading state.
 *   2. INDEXED MOVEMENT. The index arrives at discrete stops, never glides.
 *   3. NON-CIRCULAR GEOMETRY. Unequal housing segments at unequal radii, and a
 *      nucleus that is deliberately not a dot.
 *
 * Free of SVG `id`s (no gradients, no masks — the intelligence field is an HTML
 * layer beneath the SVG), so it is server-renderable and safe to repeat.
 */

export const PRESENCE_STATES = [
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

export type PresenceState = (typeof PRESENCE_STATES)[number];
export type PresenceSize = 'sm' | 'md' | 'lg';

export const PRESENCE_LABELS: Record<PresenceState, string> = {
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

/**
 * Housing geometry — "Geometry B", selected in VP1.
 *
 * Unequal spans, one segment inset, and a gap spanning the top so the datum
 * sits in open space. Almost round, clearly not circular, and deliberately not
 * a polygon that would read as a brand mark.
 */
const SEGMENTS = [
  { from: 8, to: 152, r: 24 },
  { from: 166, to: 264, r: 24 },
  { from: 280, to: 352, r: 20 },
] as const;

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
 * Propagation traces. Direction is carried by where the dash SITS on the line,
 * not only by its travel — otherwise the static reduced-motion form loses the
 * one thing the state exists to communicate.
 */
const TRACES = Array.from({ length: 6 }, (_, i) => {
  const angle = 30 + i * 60;
  const [x1, y1] = polar(13, angle);
  const [x2, y2] = polar(22, angle);
  return { x1, y1, x2, y2 };
});

/** Deliberately irregular, so even at rest the core does not read as a dot. */
const NUCLEUS =
  'M 32 26.4 C 35.3 26.4 37.5 28.8 37.5 31.9 C 37.5 35.4 35 37.7 31.7 37.7 C 28.5 37.7 26.5 35.5 26.5 32.3 C 26.5 28.8 28.9 26.4 32 26.4 Z';

export interface PresenceProps {
  state?: PresenceState;
  size?: PresenceSize;
  className?: string;
  /** Hide from assistive tech when adjacent text says the same thing. */
  decorative?: boolean;
}

export function Presence({
  state = 'idle',
  size = 'md',
  className,
  decorative = false,
}: PresenceProps) {
  return (
    <span
      className={['presence', `presence--${size}`, className].filter(Boolean).join(' ')}
      data-state={state}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': PRESENCE_LABELS[state] })}
    >
      {/* Intelligence field — an HTML layer, so no SVG gradient/mask ids. */}
      <span className="presence__field" aria-hidden />

      <svg className="presence__svg" viewBox="0 0 64 64" fill="none">
        <g className="presence__prop">
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

        <g className="presence__housing">
          {SEGMENTS.map((s, i) => (
            <path
              key={i}
              className={`presence__seg presence__seg--${i}`}
              d={arc(s.r, s.from, s.to)}
            />
          ))}
        </g>

        <g className="presence__index">
          <path d={arc(27, -5, 5)} />
        </g>

        {/* Fixed reference. NEVER moves. */}
        <line className="presence__datum" x1={32} y1={6} x2={32} y2={2} />

        <path className="presence__nucleus" d={NUCLEUS} />
        {/* Asymmetric strokes: parallel ones read as a text glyph. */}
        <g className="presence__core">
          <line x1={29.8} y1={30.6} x2={33.4} y2={31.8} />
          <line x1={30.4} y1={33.8} x2={32.6} y2={32.6} />
        </g>
      </svg>
    </span>
  );
}
