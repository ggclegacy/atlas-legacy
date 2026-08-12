import { cn } from '@/components/ui/cn';

/**
 * M1 placeholder marking.
 *
 * Every screen in M1 shows invented content. The rule from the master plan is
 * that placeholder data must be *unmistakably* placeholder — the purpose of M1
 * is to validate hierarchy and interaction, not to simulate a working product.
 *
 * There is deliberately no fake service, no fake fetch, and no pretend
 * persistence anywhere in M1. Demo values are plain constants in
 * `demo-data.ts`, imported directly by the screen that renders them.
 */

export function DemoBanner({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'rounded-md border border-dashed border-line bg-surface px-3 py-2 text-xs text-tertiary',
        className,
      )}
    >
      <span className="font-medium text-warning">Demo content.</span> Nothing on this screen is real
      or saved. Memory, projects, and conversations arrive in M5–M8.
    </p>
  );
}

/** Inline marker for an individual invented value. */
export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'rounded-sm border border-dashed border-line px-1 text-[10px] text-tertiary',
        'tracking-[0.12em] uppercase',
        className,
      )}
    >
      demo
    </span>
  );
}
