# TFIT — Testing

Per master spec §36/§37. Full suite builds out phase-by-phase alongside the features it covers; Phase 1 establishes the tooling and covers what exists (auth sync, onboarding validation).

## Levels

- **Unit** (`vitest`, colocated `*.test.ts` in each package): pure logic — validation schemas, `packages/fitness-engine`, `packages/gamification` (XP/streak math lands Phase 4), token/theme resolution.
- **Integration** (`tests/integration`): API route handlers against a real Neon branch/test database, Clerk webhook signature verification, upload validation.
- **E2E** (`tests/e2e`, Maestro for the Expo app): the full flow from master spec §36 — signup → onboarding → assessment → workout generation → workout mode → completion → XP → post → feed — built incrementally as each stage exists; Phase 1 covers signup → onboarding only.

## QA agent

The QA Agent (`agents/14-qa-agent`) becomes an automated adversarial layer in Phase 2+ (empty-state data, invalid input, offline, concurrent devices, permission edge cases per master spec §37). Phase 1 relies on manual verification of the flows it ships.

## Non-negotiables

- No feature is "done" on green tests alone — master spec §58's full checklist (secure, responsive, accessible, error-handled, good UX/perf, documented, visually refined) applies regardless of test coverage.
- CI runs lint + typecheck + unit + integration on every PR before merge is enabled (wired once `apps/backend` has its first real logic beyond scaffolding).
