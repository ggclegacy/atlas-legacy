# Deployment

Atlas is Vercel-native from the first commit. Deployment is an architectural
constraint, not a final task: **every milestone must remain deployable.**

```
Local development  →  GitHub  →  Vercel preview  →  smoke test  →  production
```

---

## One-time setup

These steps require account access and must be performed by Neil.

### 1. GitHub

```bash
git remote add origin https://github.com/ggclegacy/atlas-legacy.git
git push -u origin main
```

Then in **Settings → Branches**, add a protection rule for `main`:

- Require a pull request before merging
- Require status checks to pass → select **CI / Verify**
- Do not allow bypassing the above settings

This is what makes the milestone gate real rather than optional.

### 2. Vercel

1. **Add New → Project**, import `ggclegacy/atlas-legacy`.
2. Framework preset: **Next.js** (auto-detected). Leave build and output
   settings at their defaults — no `vercel.json` is needed or wanted.
3. Node.js version: **24.x**, to match `.nvmrc` and CI.
4. Deploy.

### 3. Environment variables

At M0 there are none to set — Atlas builds and runs with an empty environment.
As milestones land, add each variable **per environment** (Production, Preview,
Development) under **Settings → Environment Variables**. Never reuse a
production key in preview.

### 4. Custom domain

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
