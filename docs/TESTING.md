# TFIT — Testing

Per master spec §36/§37. Full suite builds out phase-by-phase alongside the features it covers.

## Levels

- **Unit** (`vitest`, colocated `*.test.ts` in each package): pure logic — `packages/fitness-engine` (10 tests), `packages/gamification` (16 tests), `packages/social` (8 tests), `packages/validation` (76 tests across every Zod schema, added Phase 9). 110 pure-logic tests total.
- **Auth-gating sweep** (`apps/backend/src/authGating.test.ts`, added Phase 9): walks every `route.ts` under `src/app/api` and asserts each exported handler returns 401 for an unauthenticated request, by mocking `@clerk/nextjs/server`'s `auth()` — no database needed, since `requireUser()`/`auth()` return before any handler reaches `getDb()`. 51 tests, covering all ~47 gated routes plus explicit checks that `/api/health` (200, no auth by design) and `/api/webhooks/clerk` (400 on invalid svix signature, not Clerk-session-gated) behave correctly. This is the single most security-critical invariant in the codebase — every prior phase's "did I forget `requireUser()`?" mistake would have been a real vulnerability, not just a bug — and it's now fully, mechanically covered rather than relying on the manual `curl` smoke tests done ad hoc at the end of each phase.
- **Integration** (`tests/integration`, not yet built): API route handlers exercising real business logic against a real Neon branch/test database — e.g. visibility enforcement end-to-end via HTTP, rate-limit-triggering, ownership checks on mutations. The auth-gating sweep above deliberately doesn't need a database; this tier is where DB-backed correctness would be verified, and it needs a deliberate test-database strategy decision (a dedicated Neon branch reused across runs vs. branch-per-CI-run) before it's worth building — not attempted in Phase 9 to avoid shipping something fragile just to check a box.
- **E2E** (`tests/e2e`, Maestro for the Expo app, not yet built): the full flow from master spec §36 — signup → onboarding → assessment → workout generation → workout mode → completion → XP → post → feed.

## QA agent

The QA Agent (`agents/14-qa-agent`) becomes an automated adversarial layer once the AI Gateway billing blocker (docs/ARCHITECTURE.md §6) is resolved. Until then, manual verification (typecheck/lint/test/build sweep + smoke-testing new endpoints) closes each phase, per the pattern used since Phase 1.

## CI (added Phase 9)

`.github/workflows/ci.yml` runs `npm run lint`, `npm run typecheck`, and `npm run test` (via Turborepo, fanning out to every workspace) on every push to `main` and every pull request. None of these three need secrets or a live database, so the workflow runs with zero configuration. `npm run build` is deliberately **not** in CI yet — `apps/backend` and `apps/admin` need `DATABASE_URL`/Clerk keys as GitHub Actions repository secrets first, which is a one-time manual step in the repo's settings, not something achievable from code alone. Add it once those secrets are configured.

## Non-negotiables

- No feature is "done" on green tests alone — master spec §58's full checklist (secure, responsive, accessible, error-handled, good UX/perf, documented, visually refined) applies regardless of test coverage.
- 161 automated tests now exist (up from 34 before Phase 9) across 5 workspaces. This is real, meaningful coverage of two specific, high-value cross-cutting concerns (validation correctness and auth gating) — it is explicitly not "full" route-by-route business-logic coverage, which remains the `tests/integration` gap above.
