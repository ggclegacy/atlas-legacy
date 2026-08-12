'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { PresenceState } from './presence';

/**
 * Atlas state, held by the chassis rather than by any screen.
 *
 * The Presence is rendered in the shell and never unmounts, so Atlas stays
 * present while the operating context changes around it. Any surface can
 * report what Atlas is doing; the header instrument reflects it immediately.
 */
interface PresenceApi {
  state: PresenceState;
  setState: (state: PresenceState) => void;
}

const PresenceContext = createContext<PresenceApi | null>(null);

export function useAtlasPresence(): PresenceApi {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('useAtlasPresence must be used within <AtlasPresenceProvider>');
  return context;
}

export function AtlasPresenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PresenceState>('idle');
  const api = useMemo(() => ({ state, setState }), [state]);
  return <PresenceContext.Provider value={api}>{children}</PresenceContext.Provider>;
}
