# M0 closeout record

Evidence that the Atlas foundation moves safely from local development →
GitHub → CI → preview → production. Recorded 2026-08-11/12.

This document is the answer to "was M0 actually proven, or just configured?"
Every row below is marked **Verified** (observed directly) or **Configured**
(set correctly, but not exercised end to end).

---

## Deployment topology

| Piece             | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| Repository        | `ggclegacy/atlas-legacy`, default branch `main`        |
| CI                | GitHub Actions workflow `CI`, job `Verify`             |
| Vercel project    | `atlas-legacy` (team `ggclegacyapps-5233's projects`)  |
| Production URL    | **https://atlas-legacy-omega.vercel.app**              |
| Also aliased      | `atlas-legacy-ggclegacyapps-5233s-projects.vercel.app` |
| Production branch | `main`                                                 |
| Preview           | every non-`main` branch and every PR                   |

## Production verification — Verified

Against the live production URL:

- `GET /` → **200**, serves the M0 foundation page (`Foundation online`).
- `GET /api/health` → **200**, `cache-control: no-store, max-age=0`.
- Body: `{"status":"ok","service":"atlas","environment":"production","commit":"<sha>","checks":[{"name":"configuration","status":"ok"}]}`.
- **`commit` matched the pushed Git SHA exactly**, confirming the deployed
  artifact corresponds to the expected source.
- `environment` resolved to `production`, which also proves the schema's
  `VERCEL_ENV` / `NODE_ENV` cross-check passed in a real production build.
- Security headers present: `x-content-type-options`, `x-frame-options`,
  `referrer-policy`, `strict-transport-security`, `permissions-policy`,
  `x-dns-prefetch-control`.
- No `x-powered-by`. No environment values or secrets in any response.
- Route classification from the build: `/` static, `/api/health` dynamic (`ƒ`).

## Deployment protection — important operational note

The Vercel project has **SSO Deployment Protection** set to
`all_except_custom_domains`. Because no custom domain is attached yet, **every**
URL — including production — requires Vercel authentication.

This is deliberately left ON. Atlas has no application-level authentication
until M3; Vercel SSO is currently the only thing standing in front of it.
Disabling it would publish an unauthenticated Atlas to the internet.

Consequences to know:

- Opening Atlas on a phone requires being signed in to Vercel in that browser.
- Automated health checks need the header
  `x-vercel-protection-bypass: <secret>`. A **Protection Bypass for Automation**
  secret exists on the project for this purpose. It is stored in Vercel only —
  it is not in this repository, and it must never be committed.

The setting is already correct for the future: when a custom domain is attached
before M3, that domain is excluded from protection, so Atlas's own passkey auth
becomes the gate while the `.vercel.app` URLs stay locked. **No setting change
will be needed at M3 — just attach the domain.**

## CI — Verified

- Runs automatically on push to `main` and on every pull request.
- Steps: install → format check → lint (incl. architectural boundary rules) →
  typecheck → tests → production build.
- Observed **failing** and then **passing**, so the check is known to be real
  rather than vacuously green. See the defect below.

## Branch protection — Configured and Verified

On `main`:

| Rule                                 | State                   |
| ------------------------------------ | ----------------------- |
| Pull request required before merge   | on (0 approvals — solo) |
| Required status check `Verify`       | on                      |
| Branch must be up to date (`strict`) | on                      |
| Enforce for administrators           | **on** — no bypass      |
| Force pushes                         | blocked                 |
| Branch deletion                      | blocked                 |

A direct `git push` to `main` was attempted and **rejected by the remote**,
confirming the gate is enforced rather than merely declared.

Because Next.js 16 does not run ESLint during `next build`, this required check
is the **only** thing enforcing the architectural boundary rules before code
reaches production. It is an architecture control. Do not weaken it.

## Defect found and fixed during closeout

**CI failed while local `npm run verify` passed.**

```
src/app/layout.tsx: error TS2304: Cannot find name 'LayoutProps'.
```

Next.js generates route types (`LayoutProps`, `PageProps`, …) into `.next/types`.
Locally `.next` was warm from an earlier build, so `tsc --noEmit` found them. In
CI, typecheck runs before build on a clean checkout, so they did not exist.

Fixed by making the script `next typegen && tsc --noEmit`, using the official
command rather than reordering CI or dropping the type-safe generic. Reproduced
locally with `rm -rf .next` before and after the fix.

**Lesson worth keeping:** a warm local `.next` can hide a real type error. Trust
CI over local. This is exactly the class of defect the deployment loop exists to
catch, and it was found on the very first run.

## Known gaps at M0 close

| Gap                           | Status                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| Repository is **public**      | Decision pending — see report; Atlas is intended to be private |
| Custom domain                 | Not attached. Required before M3 (passkey origin binding)      |
| Manual phone smoke test       | Not performed by automation — Neil must do this                |
| Database / auth / AI / design | Not in M0 by design (M1–M4)                                    |
