# Atlas

A persistent personal and business AI operating system.

Atlas is not a chat app. It is the intelligence layer across Neil Stutes's
companies, projects, decisions, and knowledge — built cloud-first, phone-first,
and designed to accumulate understanding over time.

> **Current status: Milestone 0 — Foundation. Deployed.**
> The repository, build pipeline, environment contract, architectural
> boundaries, health probe, CI, and the GitHub → CI → Vercel preview/production
> pipeline all exist and are verified. There is no database, no authentication,
> no AI, and no design system yet. Those land in M1–M4.
>
> Deployment evidence: [`docs/operations/m0-closeout.md`](docs/operations/m0-closeout.md)

---

## Quick start

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
cp .env.example .env.local   # optional at M0 — Atlas runs with no configuration
npm run dev                  # http://localhost:3000
```

Verify the foundation:

```bash
curl -s http://localhost:3000/api/health
```

## Scripts

| Script                 | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Development server                                             |
| `npm run build`        | Production build (validates environment, fails on TS errors)   |
| `npm run start`        | Serve the production build                                     |
| `npm run typecheck`    | `tsc --noEmit`                                                 |
| `npm run lint`         | ESLint **including the architectural boundary rules**          |
| `npm run format:check` | Prettier check                                                 |
| `npm run test`         | Vitest                                                         |
| **`npm run verify`**   | **The full milestone gate: format, lint, types, tests, build** |

Run `npm run verify` before every commit. It is the same sequence CI runs.

## Architecture in one screen

```
src/
  app/          Next.js App Router — routes, layouts, route handlers
  lib/          The domain layer. UI-free. Extractable to a package later.
    config/     Environment contract. The only place process.env is read.
    services/   Domain services. The ONLY entry point for UI code.
docs/
  architecture/ How Atlas is built and why
  decisions/    Architecture Decision Records
  operations/   Environments, deployment, runbook
tests/
  unit/ integration/
```

Two rules are enforced by ESLint rather than convention:

1. `src/app` and `src/components` may not import `lib/db`, `lib/ai`,
   `lib/atlas`, or `lib/events`. They go through `lib/services`.
2. `src/lib` contains no React. Dependencies point inward only.

Full detail: [`docs/architecture/overview.md`](docs/architecture/overview.md).

## Documentation

| Document                                               | Read it when                             |
| ------------------------------------------------------ | ---------------------------------------- |
| [Architecture overview](docs/architecture/overview.md) | Starting any work in this repo           |
| [Decision records](docs/decisions/README.md)           | Wondering why something is the way it is |
| [Environments](docs/operations/environments.md)        | Configuring or debugging an environment  |
| [Deployment](docs/operations/deployment.md)            | Deploying, or setting up Vercel/GitHub   |

## Deployment

Atlas is Vercel-native from the first commit. Every milestone must remain
deployable. See [`docs/operations/deployment.md`](docs/operations/deployment.md).
