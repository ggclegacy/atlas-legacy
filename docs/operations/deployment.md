# Deployment

Atlas is Vercel-native from the first commit. Deployment is an architectural
constraint, not a final task: **every milestone must remain deployable.**

```
Local development  →  GitHub  →  Vercel preview  →  smoke test  →  production
```

---

## Current setup

Established during the M0 closeout. Recorded here so it is not re-derived.

### GitHub

- Repository: `ggclegacy/atlas-legacy`, default branch `main`.
- Local `origin` points at it over HTTPS; credentials come from the macOS
  keychain helper (`osxkeychain`, configured system-wide).
- **Branch protection on `main`** requires a pull request and a passing
  **`CI / Verify`** check, with no bypass. Given that Next.js 16 does not run
  ESLint during `next build`, this check is the _only_ thing enforcing the
  architectural boundary rules before code reaches production. Treat it as an
  architecture control, not CI hygiene. Do not weaken or remove it.

### Vercel

Project `atlas-legacy` under the `ggclegacyapps-5233's projects` team.

| Setting           | Value                           |
| ----------------- | ------------------------------- |
| Framework preset  | Next.js (auto-detected)         |
| Root directory    | `.`                             |
| Node.js version   | 24.x (matches `.nvmrc`)         |
| Production branch | `main`                          |
| Build / output    | Defaults — **no `vercel.json`** |

The GitHub repository is connected to the project, so pushes deploy
automatically: `main` → production, every other branch → a preview.

### Package manager

**npm.** Vercel detects it from `package-lock.json`; CI uses `npm ci`. The
master plan referenced pnpm, but enabling it via corepack requires sudo on this
machine. This is a package-manager choice with no architectural consequence and
can be revisited deliberately later (`corepack enable pnpm && pnpm import`).

### Environment variables

None at M0 — Atlas builds and runs with an empty environment. As milestones
land, add each variable **per environment** (Production, Preview, Development)
under **Settings → Environment Variables**. Never reuse a production key in
preview.

Note that `vercel link` writes a local `.env.local` containing a
`VERCEL_OIDC_TOKEN`. It is gitignored and is not part of the Atlas environment
contract; the schema ignores unknown keys, so it does not affect validation.

### Custom domain — still to do

Attach before M3. Passkey credentials are bound to an origin, so changing the
domain after registration invalidates them. Once attached, set `ATLAS_APP_URL`
in Production.

---

## The per-milestone gate

A milestone is complete only when all of these pass:

1. `npm run verify` — format, lint (incl. boundary rules), typecheck, tests, build
2. CI green on the pull request
3. Database migration applies cleanly (from M2)
4. Preview deployment succeeds
5. `GET /api/health` on the preview returns `200` with `"status": "ok"`
6. **Manual smoke test on Neil's phone against the preview URL**
7. Deterministic eval suite green (from M5)

Then merge to `main`, let production deploy, and re-run the health check against
production.

Step 6 is not optional. Atlas is a mobile product; a milestone never touched on
the target device is unverified.

> **Next.js 16 removed ESLint from `next build`.** A green Vercel build does not
> mean lint or the architectural boundaries passed. Only CI and `npm run verify`
> enforce those.

## Verifying a deployment

```bash
curl -s https://<deployment-url>/api/health | jq
```

Expected:

```json
{
  "status": "ok",
  "service": "atlas",
  "environment": "production",
  "commit": "<sha>",
  "timestamp": "...",
  "checks": [{ "name": "configuration", "status": "ok", "detail": "..." }]
}
```

`commit` must match the SHA you expect to be live. From M2 a `database` check
joins the array.

## Rollback

Vercel keeps every deployment. **Deployments → ⋯ → Promote to Production** on
the last good build. From M2, check whether a database migration also needs
reverting — schema changes are expand/contract precisely so that a rollback of
application code does not require a schema rollback.
