/**
 * M1 demo constants.
 *
 * Plain values. No service layer, no persistence, no pretence. Every consumer
 * imports these directly so it is obvious at the call site that the content is
 * invented. Delete this file as each real system lands (M5–M8).
 */

export const DEMO_SCOPE = { organization: 'Personal', project: null } as const;

export const DEMO_GREETING = {
  salutation: 'Good evening, Neil.',
  line: 'Nothing is connected yet. This is the shell you will actually live in.',
} as const;

export const DEMO_PROPOSALS = [
  {
    id: 'p1',
    title: 'You prefer a single recommendation over a list of options',
    type: 'identity',
  },
  { id: 'p2', title: 'Gent Dispatch pilot targets pharmacies first', type: 'project' },
  { id: 'p3', title: 'Kane prefers async updates on Onyx', type: 'entity' },
] as const;

export const DEMO_PROJECTS = [
  { id: 'atlas', name: 'Atlas', org: 'Personal', status: 'active', openGoals: 4 },
  {
    id: 'dispatch',
    name: 'Gent Dispatch',
    org: 'Gent Logistics Co.',
    status: 'active',
    openGoals: 7,
  },
  { id: 'esna', name: 'ESNA Admin', org: 'ESNA Distributing', status: 'paused', openGoals: 2 },
  { id: 'gg', name: 'Groomed Gent', org: 'Groomed Gent Co.', status: 'active', openGoals: 3 },
] as const;

export const DEMO_CONVERSATIONS = [
  { id: 'c1', title: 'Phase 1 architecture review', when: 'Earlier today' },
  { id: 'c2', title: 'Dispatch pricing for pharmacy routes', when: 'Yesterday' },
  { id: 'c3', title: 'Where ESNA margin is actually going', when: '3 days ago' },
] as const;

export const DEMO_GOALS = [
  { id: 'g1', title: 'Ship M1 and review it on the phone', project: 'Atlas' },
  { id: 'g2', title: 'Decide Neon vs Supabase before M2', project: 'Atlas' },
  { id: 'g3', title: 'First pharmacy route costed end to end', project: 'Gent Dispatch' },
] as const;

export const DEMO_ACTIVITY = [
  { id: 'a1', text: 'Foundation deployed to production', when: '2h ago' },
  { id: 'a2', text: 'Branch protection enabled on main', when: '2h ago' },
  { id: 'a3', text: 'Design tokens established', when: 'just now' },
] as const;

export const DEMO_MEMORIES = [
  {
    id: 'm1',
    title: 'Build Atlas before Gen OS',
    kind: 'decision',
    detail: 'Atlas is the real-world proving ground for the broader OS concept.',
    source: 'Imported from profile',
  },
  {
    id: 'm2',
    title: 'Prefers directness over hedging',
    kind: 'identity',
    detail: 'Challenge weak reasoning early rather than validating it.',
    source: 'From conversation',
  },
  {
    id: 'm3',
    title: 'ESNA Distributing — Little Debbie route business',
    kind: 'entity',
    detail: "Neil's father's distribution business. Debbie is its AI coworker.",
    source: 'Imported from profile',
  },
] as const;
