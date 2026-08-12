'use client';

import { useEffect, useRef, useState } from 'react';

import { PresenceV2, type Pv2Geometry, type Pv2State } from './presence-v2';

/**
 * THE COMMAND APERTURE — VP1 prototype.
 *
 * A recessed subsystem, not a styled text box. The housing is cut into the
 * plane; the Presence is seated inside it as the actuator. They are one
 * instrument sharing one energy path — which is why the illumination edge
 * takes its colour from the Presence state rather than from its own.
 *
 * Nothing here may slow input down. Focus is immediate, no animation gates
 * typing, and the M1 pre-hydration recovery is carried over verbatim.
 */

export const APERTURE_STATES = [
  'dormant',
  'focused',
  'typing',
  'context',
  'submitting',
  'reasoning',
  'streaming',
  'awaiting_approval',
  'error',
] as const;

export type ApertureState = (typeof APERTURE_STATES)[number];

/** The Presence state each Aperture state implies. Causality, not decoration. */
const PRESENCE_FOR: Record<ApertureState, Pv2State> = {
  dormant: 'idle',
  focused: 'attentive',
  typing: 'attentive',
  context: 'idle',
  submitting: 'understanding',
  reasoning: 'thinking',
  streaming: 'streaming',
  awaiting_approval: 'awaiting_approval',
  error: 'error',
};

export const APERTURE_NOTE: Record<ApertureState, string> = {
  dormant: 'recessed, unlit — Atlas present, not working',
  focused: 'housing rises 1px, gold edge illuminates',
  typing: 'illumination holds; no per-keystroke animation',
  context: 'scope band carries the operating context',
  submitting: 'actuator engages, gold hands over to violet',
  reasoning: 'violet enters the edge FROM the actuator',
  streaming: 'violet travels outward along the edge',
  awaiting_approval: 'gold and still — human authority required',
  error: 'housing offsets, matching the Presence geometry',
};

export interface ApertureV2Props {
  state?: ApertureState;
  geometry?: Pv2Geometry;
  /** Demo-only scope chip. No persistence, no service. */
  scope?: string;
  onSubmitDemo?: (value: string) => void;
}

export function ApertureV2({
  state = 'dormant',
  geometry = 'b',
  scope = 'Personal',
  onSubmitDemo,
}: ApertureV2Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const intakeRef = useRef<HTMLTextAreaElement>(null);

  /*
   * Recover anything typed before React hydrated. Carried over from M1, where
   * this was a real defect: without motion nothing delays the first keystroke,
   * so a controlled input silently discarded the user's opening sentence.
   */
  useEffect(() => {
    const early = intakeRef.current?.value;
    if (early) setValue(early);
  }, []);

  // A forced demo state wins; otherwise the real interaction state shows.
  const live: ApertureState =
    state !== 'dormant' ? state : focused ? (value ? 'typing' : 'focused') : 'dormant';

  function submit() {
    if (!value.trim()) return;
    onSubmitDemo?.(value);
    setValue('');
  }

  return (
    <div className="ap" data-state={live}>
      <div className="ap__scope">
        <span className="v-datum" aria-hidden />
        <span className="ap__scope-text">{scope}</span>
        {live === 'context' ? <span className="ap__scope-ctx">Gent Dispatch</span> : null}
      </div>

      <div className="ap__housing">
        {/*
          Growth seam for attachments, tools, and agent delegation. Rendered as
          structure so the layout is already correct, but it surfaces nothing
          until a real capability exists.
        */}
        <span className="ap__augment" aria-hidden />

        <textarea
          ref={intakeRef}
          className="ap__intake"
          aria-label="Message Atlas"
          placeholder="Ask Atlas…"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <button
          type="button"
          className="ap__actuator"
          aria-label="Send to Atlas"
          onClick={submit}
          disabled={!value.trim()}
        >
          <PresenceV2 state={PRESENCE_FOR[live]} geometry={geometry} size="sm" decorative />
        </button>
      </div>

      <div className="ap__illum" aria-hidden />
    </div>
  );
}
