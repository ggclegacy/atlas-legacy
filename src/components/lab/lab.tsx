'use client';

import { useRef, useState, type ReactNode } from 'react';

import {
  PRESENCE_LABELS,
  PRESENCE_STATES,
  Presence,
  type PresenceState,
} from '@/components/atlas/presence';

/**
 * ATLAS V2 DESIGN LAB
 *
 * Now a harness rather than an exploration: it renders the PRODUCTION Presence
 * and the production tokens. Geometry B, violet A, true-black wells and low
 * grain were selected in VP1 and live in tokens.css.
 *
 * What survives here is what stays useful after selection — the full state
 * matrix, the motion grammar with measured durations, and the review switches
 * (grain, well depth, reduced motion, plain mode).
 *
 * Nothing is persisted, fetched, or backed by a service.
 */

/** What each state is meant to TELL Neil. If a state has no answer, cut it. */
const MEANING: Record<PresenceState, string> = {
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

const MOTION = [
  { id: 'acknowledge', purpose: 'Input received', token: '--t-acknowledge' },
  { id: 'focus', purpose: 'Attention concentrates', token: '--t-focus' },
  { id: 'shift', purpose: 'Operational mode changes', token: '--t-shift' },
  { id: 'transfer', purpose: 'Context moves between regions', token: '--t-transfer' },
  { id: 'expand', purpose: 'Detail becomes available', token: '--t-expand' },
  { id: 'resolve', purpose: 'Operation completes', token: '--t-resolve' },
  { id: 'disturb', purpose: 'Something needs attention', token: '--t-disturb' },
] as const;

function Options<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="lab__group">
      <span className="lab__group-label">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className="lab__opt"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="lab__section">
      <div className="rule">
        <span className="rule__label">{title}</span>
      </div>
      <p className="lab__note">{note}</p>
      {children}
    </section>
  );
}

export function Lab() {
  const [grain, setGrain] = useState<'off' | 'low' | 'max'>('low');
  const [well, setWell] = useState<'true' | 'near'>('true');
  const [motion, setMotion] = useState<'full' | 'reduced'>('full');
  const [plain, setPlain] = useState<'false' | 'true'>('false');

  return (
    <div
      className="lab"
      data-lab=""
      data-grain={grain}
      data-well={well}
      data-plain={plain}
      data-motion={motion === 'reduced' ? 'reduced' : undefined}
    >
      <div className="lab__bar">
        <div className="lab__bar-row">
          <Options
            label="Grain"
            options={['off', 'low', 'max'] as const}
            value={grain}
            onChange={setGrain}
          />
          <Options
            label="Well"
            options={['true', 'near'] as const}
            value={well}
            onChange={setWell}
          />
          <Options
            label="Motion"
            options={['full', 'reduced'] as const}
            value={motion}
            onChange={setMotion}
          />
          <Options
            label="Plain"
            options={['false', 'true'] as const}
            value={plain}
            onChange={setPlain}
          />
        </div>
      </div>

      <PresenceStates />
      <PresenceSizes />
      <MaterialSpecimens />
      <ShapeRules />
      <MotionLab />
    </div>
  );
}

function PresenceStates() {
  return (
    <Section
      title="Presence — all fifteen states"
      note="Each state must be distinguishable by geometry alone. Switch Motion to 'reduced' and confirm all fifteen remain tellable apart — if any two collapse into the same pose, that state is carrying no information."
    >
      <div className="lab__grid">
        {PRESENCE_STATES.map((s) => (
          <div key={s} className="lab__cell">
            <Presence state={s} size="md" />
            <span className="lab__cell-name">{s}</span>
            <span className="lab__cell-meaning">{MEANING[s]}</span>
            <span className="machine text-[10px]">{PRESENCE_LABELS[s]}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PresenceSizes() {
  return (
    <Section
      title="Presence — scale"
      note="24px is the chassis header size, 56px the Command size, 96px desktop. The housing must survive at 24px without turning into a smudge."
    >
      <div className="lab__row">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <div key={s} className="lab__cell">
            <Presence state="retrieving" size={s} decorative />
            <span className="lab__cell-name">{s}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MaterialSpecimens() {
  const layers = [
    ['void', 'environment', 'var(--env-void)'],
    ['well', 'recessed content', 'var(--env-well)'],
    ['structure', 'chassis planes', 'var(--env-structure)'],
    ['surface', 'raised operational', 'var(--env-surface)'],
    ['active', 'focused surface', 'var(--env-active)'],
  ] as const;

  return (
    <Section
      title="Material"
      note="Depth is 1px luminance differentials and true-black recession. No backdrop-filter, no large shadows, no glassmorphism, no embossing."
    >
      <div className="lab__grid">
        {layers.map(([name, meaning, bg]) => (
          <div key={name}>
            <div className="lab__swatch" style={{ background: bg }} />
            <p className="lab__cell-name mt-1.5">{name}</p>
            <p className="lab__cell-meaning">{meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="well p-5">
          <p className="text-sm">Recessed well — cut into the plane</p>
          <p className="machine mt-1">dark lip above · lit floor below</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm">Raised surface — inverse bevel</p>
          <p className="machine mt-1">lit above · shadowed below</p>
        </div>
      </div>

      <div className="gold-edge gold-specular surface relative mt-4 p-5">
        <p className="text-sm">Illuminated gold edge + specular</p>
        <p className="machine mt-1">brightest where the implied light strikes</p>
      </div>
    </Section>
  );
}

function ShapeRules() {
  return (
    <Section
      title="Shape DNA — and its failure mode"
      note="4px module, 2px fillets, one interruption per hairline caused by its label. The right panel deliberately overuses every rule at once, so the gimmick version is recognisable before it happens by accident."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="well p-4">
          <div className="rule">
            <span className="rule__label">Correct</span>
          </div>
          <p className="mt-3 text-sm">One interruption. One radius. One datum.</p>
          <p className="machine mt-1">rhythm carries hierarchy, not boxes</p>
        </div>

        <div className="lab__bad">
          <p className="mb-2 text-xs text-danger">Overused — do not ship this</p>
          <div className="lab__bad-row">mixed radii and stray datums</div>
          <div className="lab__bad-row">every edge interrupted for no reason</div>
        </div>
      </div>
    </Section>
  );
}

function MotionLab() {
  const [running, setRunning] = useState<string | null>(null);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const started = useRef(0);

  function run(id: string) {
    setRunning(null);
    window.requestAnimationFrame(() => {
      started.current = performance.now();
      setRunning(id);
    });
  }

  return (
    <Section
      title="Motion grammar"
      note="Each category answers 'what changed, and why did it move that way'. Durations are measured from animation start to end, so these numbers are observed rather than declared."
    >
      <div className="lab__grid">
        {MOTION.map((c) => (
          <div key={c.id}>
            <div
              className="motion-demo"
              data-cat={c.id}
              data-run={running === c.id}
              onAnimationEnd={() =>
                setMeasured((m) => ({
                  ...m,
                  [c.id]: Math.round(performance.now() - started.current),
                }))
              }
            >
              <span className="motion-token" />
            </div>
            <button type="button" className="lab__opt mt-2 w-full" onClick={() => run(c.id)}>
              {c.id}
            </button>
            <p className="lab__cell-meaning mt-1">{c.purpose}</p>
            <p className="machine">
              {c.token} · {measured[c.id] ? `${measured[c.id]}ms` : 'not run'}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
