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
/api/social          (Phase 6)
/api/posts           (Phase 6)
/api/friends         (Phase 6)
/api/followers       (Phase 6)
/api/challenges      (Phase 4)
/api/gamification    (Phase 4)
/api/notifications   (Phase 4/6)
/api/ai              (Phase 2 — internal orchestration, not directly client-callable for free-form prompts)
/api/professionals    (Phase 5 — directory only; content/monetization is Phase 8)
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

## Phase 4 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/gamification/profile` | XP total, level progress, and streak (current/longest/freezes available). |
| `GET` | `/api/achievements` | Full badge catalog with each one's unlock date (`null` if locked). |
| `GET` | `/api/challenges` | Public challenges active for the current period, with the caller's participation/progress if joined. |
| `POST` | `/api/challenges/:id/join` | Join a challenge (idempotent — returns the existing participation if already joined). |

XP/streak/achievement side effects are attached to the actions that earn them rather than requiring a separate call: completing a workout session, submitting a check-in, logging a new personal record, and marking a goal achieved all return a `gamification` field in their response (`xpAwarded`, `streakEvent`, `newAchievements`, ...). See `src/lib/gamification.ts`.

## Phase 5 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/exercises` | Search/filter the exercise library (`?search=`, `?muscle=`) — powers the manual workout builder's picker. |
| `GET`/`PUT`/`DELETE` | `/api/professionals/me` | Get / upsert / deactivate the caller's own trainer directory listing. |
| `GET` | `/api/professionals` | Browse the active trainer directory (`?search=` by name or specialty). |
| `GET`/`POST` | `/api/workouts/plans` | List all of the caller's plans (summaries) / create a manual plan. Manual creation runs the same `@tfit/fitness-engine` review as AI plans, but only hard-blocks structural issues (invented exercise, bad numbers) — health/volume concerns come back as non-blocking `warnings`, since a self-authored plan is an informed choice, not a pushed recommendation. |
| `GET` | `/api/workouts/plans/:id` | Full detail for one of the caller's plans (any status, not just active). |
| `POST` | `/api/workouts/plans/:id/duplicate` | Deep-copy one of the caller's own plans into a new archived plan they own (`source: "copied"`). |
| `POST` | `/api/workouts/plans/:id/share` | Deep-copy one of the caller's own plans into another user's library by exact `{ handle }` — instant, no accept/reject step (no notifications system yet). |
| `POST` | `/api/workouts/plans/:id/activate` | Archive the caller's other plans and make this one active. |
