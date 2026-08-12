import type { ReactNode } from 'react';

import { cn } from '@/components/ui/cn';

import { DEMO_SCOPE } from './demo-data';
import { BottomNav, SideRail } from './nav';
import { Presence } from './presence';

/**
 * The Atlas shell.
 *
 * Phone   — single column, fixed bottom navigation, safe-area aware.
 * Tablet  — the side rail replaces the bottom bar.
 * Desktop — rail + primary workspace + contextual right region.
 *
 * The right region is structural only in M1. It becomes the Context Panel
 * (what Atlas retrieved for this turn) at M5.
 */
export function AtlasShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideRail />

      <div className="flex min-w-0 flex-1 flex-col">
        <ScopeHeader />

        <main
          id="main"
          className={cn(
            'flex-1',
            // Clear the fixed bottom navigation on phones.
            'pb-[calc(var(--nav-height)+env(safe-area-inset-bottom))] md:pb-0',
          )}
        >
          {children}
        </main>
      </div>

      <ContextRegion />
      <BottomNav />
    </div>
  );
}

/**
 * Scope is always visible. Knowing which organization and project Atlas is
 * operating in is the difference between an answer and a leak, so it is never
 * hidden behind a menu.
 */
function ScopeHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b border-line bg-void',
        'pt-[env(safe-area-inset-top)]',
      )}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Presence state="idle" size="sm" decorative className="md:hidden" />
          <span className="font-display text-lg leading-none text-primary md:hidden">Atlas</span>

          <span
            className={cn(
              'truncate rounded-sm border border-line px-2 py-1 text-xs text-secondary',
              'max-md:ml-1',
            )}
          >
            <span className="text-gold-400">{DEMO_SCOPE.organization}</span>
            {DEMO_SCOPE.project ? ` · ${DEMO_SCOPE.project}` : ''}
          </span>
        </div>

        <Presence state="idle" size="sm" decorative className="max-md:hidden" />
      </div>
    </header>
  );
}

function ContextRegion() {
  return (
    <aside
      aria-label="Context"
      className="hidden shrink-0 border-l border-line xl:block xl:w-(--context-width)"
    >
      <div className="sticky top-0 p-4">
        <h2 className="flex items-center gap-2.5 text-xs tracking-[0.16em] text-secondary uppercase">
          <span aria-hidden className="h-3 w-px bg-gold-600" />
          Context
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-tertiary">
          When Atlas answers, this panel will show exactly what it used — the memories, decisions,
          and project state that fed the response.
        </p>
        <p className="mt-3 text-xs text-tertiary">Becomes functional in M5.</p>
      </div>
    </aside>
  );
}
