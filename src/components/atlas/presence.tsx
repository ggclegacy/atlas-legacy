import { cn } from '@/components/ui/cn';

/**
 * The eight Atlas Presence states.
 *
 * All eight exist from M1 so later milestones plug in without a redesign.
 * M1 drives idle / thinking / streaming / awaiting_approval; listening and
 * speaking arrive with voice at V5; error and offline arrive with real network
 * and model calls at M4.
 */
export const PRESENCE_STATES = [
  'idle',
  'thinking',
  'streaming',
  'listening',
  'speaking',
  'awaiting_approval',
  'error',
  'offline',
] as const;

export type PresenceState = (typeof PRESENCE_STATES)[number];

/** What each state means, in Atlas's own voice. Also the accessible label. */
export const PRESENCE_LABELS: Record<PresenceState, string> = {
  idle: 'Atlas is ready',
  thinking: 'Atlas is thinking',
  streaming: 'Atlas is responding',
  listening: 'Atlas is listening',
  speaking: 'Atlas is speaking',
  awaiting_approval: 'Atlas is waiting for your approval',
  error: 'Atlas encountered an error',
  offline: 'Atlas is offline',
};

const SIZES = {
  sm: 'size-6',
  md: 'size-12',
  lg: 'size-24',
} as const;

export interface PresenceProps {
  state?: PresenceState;
  size?: keyof typeof SIZES;
  className?: string;
  /**
   * Hide from assistive technology when an adjacent text label already
   * communicates the same state.
   */
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
      data-state={state}
      className={cn('presence', SIZES[size], className)}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': PRESENCE_LABELS[state] })}
    >
      <svg className="presence__svg" viewBox="0 0 48 48" fill="none">
        <circle className="presence__halo" cx="24" cy="24" r="19" />
        <circle className="presence__ring" cx="24" cy="24" r="19" />
        <circle className="presence__arc" cx="24" cy="24" r="19" />
        <circle className="presence__core" cx="24" cy="24" r="4.5" />
      </svg>
    </span>
  );
}
