'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { DEMO_SCOPE } from './demo-data';
import { BottomNav, SideRail } from './nav';
import { Presence } from './presence';
import { useAtlasPresence } from './presence-context';

/**
 * THE ATLAS CHASSIS.
 *
 * Header, Presence, and navigation are rendered once and never unmount. Moving
 * between modes exchanges the field's contents (SHIFT) while the machine around
 * them stays exactly where it is — which is what makes Atlas read as one system
 * rather than four screens.
 *
 * Phone   — single column, structural bottom plane, Aperture pinned above it.
 * Tablet  — the rail replaces the bottom plane.
 * Desktop — rail + workspace + a deeper contextual cut (functional at M5).
 */
export function AtlasShell({ children }: { children: ReactNode }) {
  const { state } = useAtlasPresence();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <SideRail presence={<Presence state={state} size="sm" decorative />} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="chassis-header">
          <div className="chassis-header__row">
            <span className="scope-chip">
              <span className="datum" aria-hidden />
              <span className="scope-chip__org">{DEMO_SCOPE.organization}</span>
              {DEMO_SCOPE.project ? <span>· {DEMO_SCOPE.project}</span> : null}
            </span>

            {/* The instrument is always visible, whatever mode you are in. */}
            <Presence state={state} size="sm" />
          </div>
        </header>

        <main
          id="main"
          /*
           * `key` on the pathname is what makes SHIFT a content exchange rather
           * than a page transition: the field re-enters, the chassis does not.
           */
          key={pathname}
          className="field-shift flex-1 pb-[calc(var(--nav-height)+var(--aperture-height)+env(safe-area-inset-bottom))] md:pb-8"
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
 * Desktop contextual region — a deeper cut, not a lit panel.
 * Becomes the Context Panel (what Atlas retrieved) at M5.
 */
function ContextRegion() {
  return (
    <aside
      aria-label="Context"
      className="well hidden shrink-0 border-l border-line xl:block xl:w-(--context-width)"
    >
      <div className="sticky top-0 p-5">
        <div className="rule">
          <span className="rule__label">Context</span>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-tertiary">
          When Atlas answers, this region shows exactly what it used — the memories, decisions, and
          project state that fed the response.
        </p>
        <p className="machine mt-4">functional · M5</p>
      </div>
    </aside>
  );
}
