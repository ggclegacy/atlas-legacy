# Environments

Atlas runs in exactly three environments. They are isolated from each other:
separate databases, separate API keys, separate secrets. This is a hard rule —
a preview deployment must never be able to touch production data.

| Environment     | Branch   | Database (from M2)         | Purpose                  |
| --------------- | -------- | -------------------------- | ------------------------ |
| **development** | local    | Neon `dev` branch          | Local work               |
| **preview**     | every PR | Neon branch per deployment | Review and smoke testing |
| **production**  | `main`   | Neon `production`          | Neil's real Atlas        |

At M0 there is no database, so only the application layer is environment-aware.

## How the environment is determined

`resolveAtlasEnvironment()` in `src/lib/config/env.schema.ts`:

1. `VERCEL_ENV` if present — the only source that distinguishes preview from
   production.
2. Otherwise `production` when `NODE_ENV === 'production'`.
3. Otherwise `development`.

## The configuration contract

`src/lib/config/env.schema.ts` is the single source of truth. To add a variable:

1. Add the field to `serverEnvSchema` with the narrowest type that is correct.
2. Add it to `.env.example` with a comment explaining what it is.
3. Set it in the Vercel dashboard for each environment that needs it.

Never read `process.env` outside that module. Never commit a real value.

### Validation behaviour

- Invalid configuration throws at **build time** (`next.config.ts` calls
  `assertServerEnv`) and at **server start** (`src/lib/config/env.ts`).
  It never fails midway through a request.
- Error messages list **keys and reasons only, never values** — a malformed
  secret must not reach build logs.

## Variables

### Atlas-owned

| Variable          | Required          | Notes                                                      |
| ----------------- | ----------------- | ---------------------------------------------------------- |
| `ATLAS_APP_URL`   | No (derived)      | Canonical origin. **Set before M3** — passkeys bind to it. |
| `ATLAS_LOG_LEVEL` | No (default info) | `debug` \| `info` \| `warn` \| `error`                     |

### Supplied by Vercel — never set by hand

`VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`,
`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`.

### Coming

| Milestone | Variable             |
| --------- | -------------------- |
| M2        | `DATABASE_URL`       |
| M3        | `BETTER_AUTH_SECRET` |
| M4        | `OPENAI_API_KEY`     |
| M5        | `ANTHROPIC_API_KEY`  |

## Cross-checks the schema enforces

- A Vercel **production** deployment must have `NODE_ENV=production`. Building
  production with a development `NODE_ENV` silently enables dev-only behaviour;
  the schema rejects it.

## Local setup

```bash
cp .env.example .env.local
```

At M0 the file may be left empty — Atlas runs with no configuration at all.
