# TFIT (App Fit)

An AI personal-trainer, fitness-tracking, and fitness social network — mobile-first, built as a monorepo.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack decisions, repo layout, roadmap, risks
- [`docs/DATABASE.md`](docs/DATABASE.md) — data model, phased table rollout
- [`docs/AGENTS.md`](docs/AGENTS.md) — the 15-agent AI architecture and safety gate
- [`docs/SKILLS.md`](docs/SKILLS.md) — knowledge skill catalog
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — visual identity, tokens, motion
- [`docs/SECURITY.md`](docs/SECURITY.md) — auth, data classification, LGPD
- [`docs/API.md`](docs/API.md) — endpoint conventions and domain map
- [`docs/TESTING.md`](docs/TESTING.md) — test strategy
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel + EAS deployment

## Repo layout

```
apps/backend    Next.js API (Vercel)
apps/admin      Next.js admin panel (Vercel, Phase 8 stub)
apps/mobile     Expo React Native app
packages/       Shared types, validation, design system, fitness engine, AI orchestration, gamification
agents/         Per-agent design contracts (docs/AGENTS.md) and, from Phase 2, prompts
skills/         Knowledge skills (docs/SKILLS.md)
database/       Drizzle schema + migrations
docs/           This documentation set
tests/          Cross-package integration/e2e tests
scripts/        Ops scripts
```

## Getting started

```bash
npm install
npm run dev            # runs backend + mobile via Turborepo
```

Each app also has its own `.env.local`, pulled from Vercel:

```bash
cd apps/backend && vercel env pull --yes
```

See `docs/DEPLOYMENT.md` for the full environment/provisioning story and `docs/ARCHITECTURE.md` §5 for the phase-by-phase build roadmap. **Phase 1 (Foundation)** and **Phase 2 (Fitness core)** are built; Neon, Clerk, and the exercise library are live. The AI Gateway calls are implemented and unit-tested but not yet exercised end-to-end — the Vercel account needs a credit card on file before the Gateway will serve requests (see `docs/SECURITY.md`).
