'use client';

import { useCallback, useRef, useState } from 'react';

import { APERTURE_NOTE, APERTURE_STATES, ApertureV2, type ApertureState } from './aperture-v2';
import {
  PV2_LABELS,
  PV2_MEANING,
  PV2_STATES,
  PresenceV2,
  type Pv2Geometry,
  type Pv2State,
} from './presence-v2';

/**
 * ATLAS V2 DESIGN LAB (VP1)
 *
 * Every experiment lives here and nowhere else. The four production screens are
 * untouched: all V2 styling is scoped under [data-atlas='v2'], which only this
 * route sets.
 *
 * Nothing here is persisted, fetched, or backed by a service. It is static
 * demonstration state for judging a visual language on a real device.
 */

const MODES = ['Command', 'Projects', 'Memory', 'System'] as const;

/** Module-scope so the causality run is stable across renders. */
const CAUSALITY_SEQUENCE: ApertureState[] = [
  'focused',
  'submitting',
  'reasoning',
  'streaming',
  'awaiting_approval',
  'dormant',
];

const MOTION_CATEGORIES = [
  { id: 'acknowledge', purpose: 'Input received', token: '--t-acknowledge' },
  { id: 'focus', purpose: 'Attention concentrates', token: '--t-focus' },
  { id: 'shift', purpose: 'Operational mode changes', token: '--t-shift' },
  { id: 'transfer', purpose: 'Context moves between regions', token: '--t-transfer' },
  { id: 'expand', purpose: 'Detail becomes available', token: '--t-expand' },
  { id: 'resolve', purpose: 'Operation completes', token: '--t-resolve' },
  { id: 'disturb', purpose: 'Something needs attention', token: '--t-disturb' },
] as const;

type Toggle<T extends string> = { value: T; set: (v: T) => void };

function OptionGroup<T extends string>({
  label,
  options,
  state,
}: {
  label: string;
  options: readonly T[];
  state: Toggle<T>;
}) {
  return (
    <div className="lab__group">
      <span className="lab__group-label">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className="lab__opt"
          aria-pressed={state.value === o}
          onClick={() => state.set(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Lab() {
  const [geometry, setGeometry] = useState<Pv2Geometry>('b');
  const [violet, setViolet] = useState<'a' | 'b'>('a');
  const [well, setWell] = useState<'true' | 'near'>('true');
  const [grain, setGrain] = useState<'off' | 'low' | 'max'>('low');
  const [motion, setMotion] = useState<'full' | 'reduced'>('full');
  const [plain, setPlain] = useState<'false' | 'true'>('false');

  return (
    <div
      className="lab"
      data-atlas="v2"
      data-violet={violet}
      data-well={well}
      data-grain={grain}
      data-motion={motion === 'reduced' ? 'reduced' : undefined}
      data-plain={plain}
    >
      <div className="lab__bar">
        <div className="lab__bar-row">
          <OptionGroup
            label="Geometry"
            options={['a', 'b', 'c'] as const}
            state={{ value: geometry, set: setGeometry }}
          />
          <OptionGroup
            label="Violet"
            options={['a', 'b'] as const}
            state={{ value: violet, set: setViolet }}
          />
          <OptionGroup
            label="Well"
            options={['true', 'near'] as const}
            state={{ value: well, set: setWell }}
          />
          <OptionGroup
            label="Grain"
            options={['off', 'low', 'max'] as const}
            state={{ value: grain, set: setGrain }}
          />
          <OptionGroup
            label="Motion"
            options={['full', 'reduced'] as const}
            state={{ value: motion, set: setMotion }}
          />
          <OptionGroup
            label="Plain"
            options={['false', 'true'] as const}
            state={{ value: plain, set: setPlain }}
          />
        </div>
      </div>

      <CompositionPreview geometry={geometry} />
      <PresenceGeometry geometry={geometry} />
      <PresenceStates geometry={geometry} />
      <PresenceSizes geometry={geometry} />
      <ApertureLab geometry={geometry} />
      <CausalityLab geometry={geometry} />
      <MaterialLab />
      <WellLab />
      <VioletLab />
      <GoldLab />
      <ShapeLab />
      <NavigationLab />
      <MotionLab />
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lab__section">
      <div className="v-rule">
        <span className="v-rule__label">{title}</span>
      </div>
      <p className="lab__note" style={{ marginBlockStart: 10 }}>
        {note}
      </p>
      {children}
    </section>
  );
}

/**
 * The only composition in the lab. Everything else is a specimen; this is the
 * thing to actually judge — does it read as Atlas, or as a dark app?
 */
function CompositionPreview({ geometry }: { geometry: Pv2Geometry }) {
  return (
    <Section
      title="Composition — Command, phone"
      note="Presence, then Atlas's language, then the Aperture, then one operating well. No cards. The well runs off the edge because it is a cut into something larger, not a box on a background."
    >
      <div style={{ maxInlineSize: 420 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '20px 0 24px' }}>
          <PresenceV2 state="idle" geometry={geometry} size="md" decorative />
          <div>
            <p style={{ fontSize: 30, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
              Good morning, Neil.
            </p>
            <p
              style={{
                marginBlockStart: 8,
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--v-text-secondary)',
              }}
            >
              Three things are waiting. Nothing is urgent.
            </p>
          </div>
        </div>

        <ApertureV2 geometry={geometry} />

        <div className="v-well v-well--bleed" style={{ marginBlockStart: 20, paddingBlock: 16 }}>
          <div className="v-rule">
            <span className="v-rule__label">Awaiting review</span>
          </div>
          <div className="lab__stack" style={{ padding: '12px 0 18px' }}>
            {[
              ['You prefer one recommendation over a list', 'identity'],
              ['Gent Dispatch targets pharmacies first', 'project'],
            ].map(([t, k]) => (
              <div key={t}>
                <p style={{ fontSize: 14, lineHeight: 1.35 }}>{t}</p>
                <p className="v-machine" style={{ marginBlockStart: 2 }}>
                  {k}
                </p>
              </div>
            ))}
          </div>

          <div className="v-rule">
            <span className="v-rule__label">Active projects</span>
          </div>
          <div className="lab__stack" style={{ padding: '12px 0 0' }}>
            {[
              ['Atlas', '4 open'],
              ['Gent Dispatch', '7 open'],
            ].map(([n, c]) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 14 }}>{n}</span>
                <span className="v-machine">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PresenceGeometry({ geometry }: { geometry: Pv2Geometry }) {
  return (
    <Section
      title="Presence — housing asymmetry"
      note="Same state, same colour, three asymmetry levels. A is near-symmetric; B is the recommended target; C is comparison only. Judge which stops reading as a circle without starting to read as a logo."
    >
      <div className="lab__row">
        {(['a', 'b', 'c'] as const).map((g) => (
          <div key={g} className="lab__cell">
            <PresenceV2 state="thinking" geometry={g} size="lg" decorative />
            <span className="lab__cell-name">
              {g.toUpperCase()} {g === geometry ? '· selected' : ''}
            </span>
            <span className="lab__cell-meaning">
              {g === 'a' ? 'subtle' : g === 'b' ? 'moderate' : 'strong'}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PresenceStates({ geometry }: { geometry: Pv2Geometry }) {
  return (
    <Section
      title="Presence — all fifteen states"
      note="Each state must be distinguishable by geometry alone. Switch Motion to 'reduced' and check that all fifteen remain tellable apart — if any two collapse into the same pose, that state is not carrying information."
    >
      <div className="lab__grid">
        {PV2_STATES.map((s: Pv2State) => (
          <div key={s} className="lab__cell">
            <PresenceV2 state={s} geometry={geometry} size="md" />
            <span className="lab__cell-name">{s}</span>
            <span className="lab__cell-meaning">{PV2_MEANING[s]}</span>
            <span className="v-machine" style={{ fontSize: 10 }}>
              {PV2_LABELS[s]}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PresenceSizes({ geometry }: { geometry: Pv2Geometry }) {
  return (
    <Section
      title="Presence — scale"
      note="24px is the scrolled-header size, 56px the Command size, 96px desktop. The question is whether the housing survives at 24px without turning into a smudge."
    >
      <div className="lab__row">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <div key={s} className="lab__cell">
            <PresenceV2 state="retrieving" geometry={geometry} size={s} decorative />
            <span className="lab__cell-name">{s}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ApertureLab({ geometry }: { geometry: Pv2Geometry }) {
  const [state, setState] = useState<ApertureState>('dormant');
  return (
    <Section
      title="Command Aperture — states"
      note="The input below is real and usable. Type in it, press Enter. Nothing may delay input. Step through the demo states to see how the housing and illumination edge respond."
    >
      <div className="lab__two">
        <div style={{ maxInlineSize: 420 }}>
          <ApertureV2 state={state} geometry={geometry} scope="Personal" />
          <p className="lab__note" style={{ marginBlockStart: 12 }}>
            {APERTURE_NOTE[state]}
          </p>
        </div>
        <div className="lab__bar-row" style={{ gap: 6 }}>
          {APERTURE_STATES.map((s) => (
            <button
              key={s}
              type="button"
              className="lab__opt"
              aria-pressed={state === s}
              onClick={() => setState(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Presence and Aperture as one instrument — run the sequence and watch causality. */
function CausalityLab({ geometry }: { geometry: Pv2Geometry }) {
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  const run = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = CAUSALITY_SEQUENCE.map((_, i) =>
      window.setTimeout(() => setStep(i), i * 1400),
    );
  }, []);

  const current = CAUSALITY_SEQUENCE[step] ?? 'dormant';

  return (
    <Section
      title="Presence ↔ Aperture — causality"
      note="One intelligence system, not two components. Energy enters the edge from the actuator during reasoning, travels outward during streaming, and withdraws to gold stillness when Atlas needs a decision."
    >
      <button type="button" className="lab__opt" onClick={run} style={{ marginBlockEnd: 16 }}>
        Run sequence
      </button>
      <div style={{ maxInlineSize: 420 }}>
        <ApertureV2 state={current} geometry={geometry} scope="Gent Logistics" />
      </div>
      <p className="v-machine" style={{ marginBlockStart: 10 }}>
        {current}
      </p>
    </Section>
  );
}

function MaterialLab() {
  const layers = [
    ['void', 'environment', 'var(--v-void)'],
    ['structure', 'chassis planes', 'var(--v-structure)'],
    ['surface', 'raised operational', 'var(--v-surface)'],
    ['active', 'focused surface', 'var(--v-active)'],
    ['transient', 'overlays only', 'var(--v-transient)'],
  ] as const;

  return (
    <Section
      title="Material — depth without blur"
      note="Depth is 1px luminance differentials and true-black recession. No backdrop-filter (measured WebKit failure in M1), no large shadows, no glassmorphism, no embossing."
    >
      <div className="lab__grid">
        {layers.map(([name, meaning, bg]) => (
          <div key={name}>
            <div className="lab__swatch" style={{ background: bg }} />
            <p className="lab__cell-name" style={{ marginBlockStart: 6 }}>
              {name}
            </p>
            <p className="lab__cell-meaning">{meaning}</p>
          </div>
        ))}
      </div>

      <div className="lab__two" style={{ marginBlockStart: 24 }}>
        <div>
          <div className="v-well" style={{ padding: 20, borderRadius: 4 }}>
            <p style={{ fontSize: 14 }}>Recessed well — cut into the plane</p>
            <p className="v-machine" style={{ marginBlockStart: 4 }}>
              dark lip above · lit floor below
            </p>
          </div>
        </div>
        <div>
          <div className="v-surface" style={{ padding: 20 }}>
            <p style={{ fontSize: 14 }}>Raised surface — inverse bevel</p>
            <p className="v-machine" style={{ marginBlockStart: 4 }}>
              lit above · shadowed below
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function WellLab() {
  return (
    <Section
      title="Well depth — true black vs near black"
      note="The environment around both is identical. On OLED the true-black well switches pixels off entirely. The question is whether that reads as infinite depth or as a dead cutout. This must be judged on the phone, not here."
    >
      <div className="lab__two">
        <div>
          <div
            style={{
              background: 'var(--v-well-true)',
              padding: 24,
              boxShadow:
                'inset 0 1px 0 0 var(--v-line-recessed), inset 0 -1px 0 0 var(--v-line-raised)',
            }}
          >
            <p style={{ fontSize: 14 }}>True black · #000000</p>
          </div>
          <p className="lab__cell-meaning" style={{ marginBlockStart: 6 }}>
            OLED pixels off
          </p>
        </div>
        <div>
          <div
            style={{
              background: 'var(--v-well-near)',
              padding: 24,
              boxShadow:
                'inset 0 1px 0 0 var(--v-line-recessed), inset 0 -1px 0 0 var(--v-line-raised)',
            }}
          >
            <p style={{ fontSize: 14 }}>Near black · #030305</p>
          </div>
          <p className="lab__cell-meaning" style={{ marginBlockStart: 6 }}>
            retains a floor
          </p>
        </div>
      </div>
    </Section>
  );
}

function VioletLab() {
  const rows = [
    ['rest', '--va-rest', '--vb-rest'],
    ['engaged', '--va-engaged', '--vb-engaged'],
    ['reason', '--va-reason', '--vb-reason'],
    ['output', '--va-output', '--vb-output'],
  ] as const;

  return (
    <Section
      title="Intelligence colour — A vs B"
      note="A is deep indigo-violet; B is brighter electric violet. Both must stay non-pastel with no pink bias. Energy violet never carries text. Signal violet is a separate role that must clear 3:1."
    >
      <div className="lab__two">
        {(['A', 'B'] as const).map((set, idx) => (
          <div key={set}>
            <p className="lab__cell-name" style={{ marginBlockEnd: 8 }}>
              Violet {set}
            </p>
            {rows.map((r) => (
              <div key={r[0]} style={{ marginBlockEnd: 8 }}>
                <div className="lab__swatch" style={{ background: `var(${r[idx + 1]})` }} />
                <p className="v-machine">{r[0]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginBlockStart: 20 }}>
        <div className="lab__swatch" style={{ background: 'var(--v-signal)' }} />
        <p className="lab__cell-name" style={{ marginBlockStart: 6 }}>
          Signal violet · #6B5AD8
        </p>
        <p className="v-machine">4.07:1 on true black · 3.88:1 on void · 3.60:1 on surface</p>
        <p style={{ marginBlockStart: 10, fontSize: 14 }}>
          <button type="button" className="lab__opt">
            Focus me to see the ring
          </button>
        </p>
      </div>
    </Section>
  );
}

function GoldLab() {
  return (
    <Section
      title="Gold — structural, never a fill"
      note="Gold lives on edges. The illuminated edge varies in luminance along its length, which is the entire 'precision metal' effect — one gradient, no texture. The M1 mustard button does not appear here."
    >
      <div className="lab__stack" style={{ maxInlineSize: 460 }}>
        <div className="v-surface v-gold-edge v-gold-specular" style={{ padding: 18 }}>
          <p style={{ fontSize: 14 }}>Illuminated edge + specular</p>
          <p className="v-machine">brightest where the implied light strikes</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="v-datum" aria-hidden />
          <span className="lab__cell-meaning">datum — fixed reference tick</span>
        </div>

        <div className="v-authority" style={{ padding: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--v-gold-authority)' }}>Authority state</p>
          <p className="v-machine">gold + stillness = your decision required</p>
        </div>

        <p style={{ fontSize: 14 }}>
          Primary action as{' '}
          <button
            type="button"
            style={{
              color: 'var(--v-gold-authority)',
              background: 'transparent',
              border: '1px solid var(--v-gold-structural)',
              borderRadius: 'var(--v-fillet)',
              minBlockSize: 44,
              padding: '0 14px',
              cursor: 'pointer',
            }}
          >
            gold text in a gold-edged channel
          </button>
        </p>
      </div>
    </Section>
  );
}

function ShapeLab() {
  return (
    <Section
      title="Shape DNA — and its failure mode"
      note="4px module, 2px fillets, 4px planes, one interruption per hairline caused by its label. The right-hand panel deliberately overuses every rule at once; it is here so the gimmick version is recognisable before it happens by accident."
    >
      <div className="lab__two">
        <div className="v-well" style={{ padding: 16 }}>
          <div className="v-rule">
            <span className="v-rule__label">Correct</span>
          </div>
          <div className="lab__stack" style={{ paddingBlockStart: 12 }}>
            <p style={{ fontSize: 14 }}>One interruption. One radius. One datum.</p>
            <p className="v-machine">rhythm carries hierarchy, not boxes</p>
          </div>
        </div>

        <div className="lab__bad">
          <p className="lab__cell-name" style={{ color: 'var(--v-danger)', marginBlockEnd: 8 }}>
            Overused — do not ship this
          </p>
          <div className="lab__bad-row">
            <span className="v-datum" aria-hidden /> mixed radii
          </div>
          <div className="lab__bad-row">brackets, gradients, and datums everywhere</div>
          <div className="lab__bad-row">every edge interrupted for no reason</div>
        </div>
      </div>
    </Section>
  );
}

function NavigationLab() {
  const [active, setActive] = useState(0);
  const [shifting, setShifting] = useState(false);

  function go(i: number) {
    if (i === active) return;
    setShifting(true);
    window.setTimeout(() => {
      setActive(i);
      setShifting(false);
    }, 240);
  }

  return (
    <Section
      title="Indexed navigation"
      note="Familiar placement, engineered behaviour. The active mode occupies a measurable position marked by a gold datum, and the segment recesses. The chassis never moves — only the field's contents exchange (SHIFT)."
    >
      <div className="lab__two">
        <div style={{ maxInlineSize: 420 }}>
          <div className="v-well shift-field" data-shifting={shifting} style={{ padding: 20 }}>
            <div className="shift-field__content">
              <p className="lab__cell-name">{MODES[active]}</p>
              <p className="lab__cell-meaning">field contents exchange; chassis fixed</p>
            </div>
          </div>
          <div className="nav-sample">
            {MODES.map((m, i) => (
              <button
                key={m}
                type="button"
                className="nav-sample__item"
                aria-current={i === active ? 'page' : undefined}
                onClick={() => go(i)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="rail-sample">
          {MODES.map((m, i) => (
            <button
              key={m}
              type="button"
              className="rail-sample__item"
              aria-current={i === active ? 'page' : undefined}
              onClick={() => go(i)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}

function MotionLab() {
  const [running, setRunning] = useState<string | null>(null);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const started = useRef<number>(0);

  function run(id: string) {
    setRunning(null);
    window.requestAnimationFrame(() => {
      started.current = performance.now();
      setRunning(id);
    });
  }

  return (
    <Section
      title="Motion grammar — seven categories"
      note="Each category answers 'what changed, and why did it move that way'. Durations are measured from animation start to end, so the numbers below are observed rather than declared. Switch Motion to 'reduced' and confirm each still communicates."
    >
      <div className="lab__grid">
        {MOTION_CATEGORIES.map((c) => (
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
            <button
              type="button"
              className="lab__opt"
              style={{ marginBlockStart: 8, inlineSize: '100%' }}
              onClick={() => run(c.id)}
            >
              {c.id}
            </button>
            <p className="lab__cell-meaning" style={{ marginBlockStart: 4 }}>
              {c.purpose}
            </p>
            <p className="v-machine">
              {c.token} · {measured[c.id] ? `${measured[c.id]}ms measured` : 'not run'}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
