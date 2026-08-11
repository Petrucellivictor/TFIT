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
