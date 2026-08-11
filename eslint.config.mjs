import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * Atlas architectural boundaries.
 *
 * These rules are not style preferences. They are the mechanism that makes the
 * master plan's decisions D1 and D8 enforceable rather than aspirational:
 *
 *   1. UI code cannot reach past the service layer, so scoping, event logging,
 *      and (later) capability checks have exactly one chokepoint.
 *   2. `src/lib/**` stays React-free, so it can be extracted into a shared
 *      package when a second consumer appears (Atlas Node, a worker) without a
 *      rewrite.
 *   3. Provider SDKs live in one file, so swapping model providers is a
 *      one-file change.
 *   4. The Edge runtime is banned — Atlas needs Node duration limits, driver
 *      support, and `after()`.
 *
 * IMPORTANT: in flat config, the last matching config object wins per rule.
 * Each block below therefore owns `no-restricted-imports` for a disjoint set of
 * files. Do not add a second block that re-declares the same rule for
 * overlapping files — it will silently replace, not merge.
 */

/** Infrastructure that UI code must reach through `lib/services` instead. */
const INFRASTRUCTURE_IMPORTS = [
  {
    group: ['@/lib/db', '@/lib/db/*'],
    message:
      'UI code must not access the database directly. Go through @/lib/services so scoping and event logging cannot be bypassed (ADR-0001).',
  },
  {
    group: ['@/lib/ai', '@/lib/ai/*'],
    message:
      'UI code must not call models directly. Go through @/lib/services so spend caps and ai_runs logging cannot be bypassed (ADR-0004).',
  },
  {
    group: ['@/lib/atlas', '@/lib/atlas/*'],
    message:
      'Context assembly, persona, and memory are server-side domain logic. Go through @/lib/services (ADR-0005).',
  },
  {
    group: ['@/lib/events', '@/lib/events/*'],
    message:
      'Events are recorded by services, not by UI code. An event written from the UI is an event that can be skipped.',
  },
];

/** Provider-specific SDKs. Confined to src/lib/ai/providers.ts (ADR-0004). */
const PROVIDER_SDK_IMPORTS = [
  {
    group: [
      'openai',
      'openai/*',
      '@anthropic-ai/sdk',
      '@anthropic-ai/*',
      '@ai-sdk/openai',
      '@ai-sdk/openai/*',
      '@ai-sdk/anthropic',
      '@ai-sdk/anthropic/*',
      '@ai-sdk/google',
      '@ai-sdk/google/*',
    ],
    message:
      'Provider SDKs may only be imported by src/lib/ai/providers.ts. Everywhere else uses the provider-agnostic Atlas AI layer (ADR-0004).',
  },
];

/** React and UI surfaces that must never leak below `src/lib`. */
const UI_IMPORTS_BANNED_IN_LIB = [
  {
    group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    message:
      'src/lib must stay React-free so it can be extracted to a shared package later (ADR-0001).',
  },
  {
    group: ['next/navigation', '@/components', '@/components/*', '@/app', '@/app/*'],
    message:
      'src/lib must not depend on the application or UI layer. Dependencies point inward only (ADR-0001).',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),

  // ---- Boundary 1: UI layer -------------------------------------------------
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...INFRASTRUCTURE_IMPORTS, ...PROVIDER_SDK_IMPORTS] },
      ],
    },
  },

  // ---- Boundary 2: domain layer (everything except the provider file) -------
  {
    files: ['src/lib/**/*.ts'],
    ignores: ['src/lib/ai/providers.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...UI_IMPORTS_BANNED_IN_LIB, ...PROVIDER_SDK_IMPORTS] },
      ],
    },
  },

  // ---- Boundary 3: the one file allowed to know about providers ------------
  {
    files: ['src/lib/ai/providers.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...UI_IMPORTS_BANNED_IN_LIB] }],
    },
  },

  // ---- Boundary 4: runtime ban --------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name='runtime'] > Literal[value='edge']",
          message:
            'The Edge runtime is banned in Atlas. Node.js is required for execution duration, database drivers, and after() (master plan D7).',
        },
      ],
    },
  },

  // ---- Domain-layer type discipline ---------------------------------------
  {
    files: ['src/lib/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // Must stay last: turns off stylistic rules that fight Prettier.
  prettier,
]);

export default eslintConfig;
