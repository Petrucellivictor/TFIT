# TFIT — API

Next.js Route Handlers under `apps/backend/src/app/api/`, organized by domain (master spec §35). Phase 1 ships the `auth` (webhook only — Clerk owns the actual auth surface) and `users`/`profile` domains. Later phases add the rest of this list as they're built:

```
/api/auth        (Clerk webhook receiver only; login/signup itself is handled by Clerk SDKs, not our API)
/api/users
/api/profile
/api/workouts        (Phase 2)
/api/exercises       (Phase 2)
/api/training        (Phase 2 — agent orchestration entry points)
/api/progress        (Phase 3)
/api/checkins        (Phase 3)
/api/social          (Phase 5)
/api/posts           (Phase 5)
/api/friends         (Phase 5)
/api/followers       (Phase 5)
/api/challenges      (Phase 4)
/api/gamification    (Phase 4)
/api/notifications   (Phase 4/5)
/api/ai              (Phase 2 — internal orchestration, not directly client-callable for free-form prompts)
/api/professionals    (Phase 7)
```

## Conventions

- Every input validated against a `packages/validation` Zod schema; validation failure → `400` with a machine-readable error code, never a raw stack trace.
- Every handler requires a Clerk session except the Clerk webhook (verified via svix signature) and `/api/health`.
- Responses are JSON, camelCase, with a consistent envelope: `{ data }` on success, `{ error: { code, message } }` on failure. No bare arrays at the top level (breaks forward-compatible pagination).
- Errors returned to the client are human, per master spec §45 — never `Internal Server Error` verbatim. Route handlers catch and translate; the raw error is only ever logged server-side.

## Phase 1 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check (no auth) |
| `POST` | `/api/webhooks/clerk` | Sync `users`/`profiles` on Clerk create/update/delete |
| `GET` | `/api/me` | Current user's profile + preferences + onboarding status |
| `POST` | `/api/onboarding` | Submit onboarding data (goals, health flags, body metrics, preferences) |

## Phase 2 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/training/generate` | Runs the full agent pipeline (`@tfit/ai`) and persists an approved plan as the user's new active `workout_plans` row. Rate-limited (5/hour/user via a Postgres-backed interim limiter — see `src/lib/rateLimit.ts`). Returns `422 generation_failed` with a friendly reason if the pipeline exhausts its retry budget. |
| `GET` | `/api/workouts` | The user's current active plan with full workout/exercise detail (`{ plan: null }` if none generated yet). |
| `POST` | `/api/workouts/sessions` | Start a workout session (`{ workoutId }`) — verifies the workout belongs to the caller's own plan. |
| `POST` | `/api/workouts/sessions/:id/sets` | Log a completed set (`{ workoutExerciseId, setNumber, repsCompleted, weightKg?, feedback? }`); flags `isNewPersonalRecord`. |
| `POST` | `/api/workouts/sessions/:id/complete` | Mark a session completed. |

## Phase 3 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `GET`/`POST` | `/api/checkins` | List last 30 days / submit today's check-in (upsert — one per day). |
| `GET`/`POST` | `/api/measurements` | List / log a body-circumference entry. |
| `GET`/`POST` | `/api/body-metrics` | List / log a weight (+ optional body fat %) entry — ongoing tracking beyond the onboarding snapshot. |
| `GET`/`POST` | `/api/goals` | List / create a user-defined goal. |
| `PATCH` | `/api/goals/:id` | Update a goal's status (`active`/`achieved`/`abandoned`). |
| `GET` | `/api/progress` | Aggregate for the evolution dashboard: FIT Score, weight trend, recent PRs, active goals, check-in streak. |
