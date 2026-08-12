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
/api/feed            (Phase 6)
/api/posts           (Phase 6)
/api/comments        (Phase 6)
/api/follow          (Phase 6 — followers/friends graph, computed from mutual accepted follows)
/api/blocks          (Phase 6)
/api/reports         (Phase 6)
/api/challenges      (Phase 4)
/api/gamification    (Phase 4)
/api/notifications   (Phase 4/6)
/api/ai              (Phase 2 — internal orchestration, not directly client-callable for free-form prompts)
/api/professionals    (Phase 5 — directory; Phase 8 adds a per-professional service menu, no payment)
```

## Conventions

- Every input validated against a `packages/validation` Zod schema; validation failure → `400` with a machine-readable error code, never a raw stack trace.
- Every handler requires a Clerk session except the Clerk webhook (verified via svix signature) and `/api/health`. This is enforced across every route and covered by an automated test (`apps/backend/src/authGating.test.ts`, added Phase 9) — see `docs/TESTING.md`.
- Responses are JSON, camelCase, with a consistent envelope: `{ data }` on success, `{ error: { code, message } }` on failure. No bare arrays at the top level (breaks forward-compatible pagination).
- Errors returned to the client are human, per master spec §45 — never `Internal Server Error` verbatim. Route handlers catch and translate; the raw error is only ever logged server-side.
- Rate limiting (`src/lib/rateLimit.ts`): `/api/training/generate` (5/hour), and since Phase 9, `POST /api/posts` (20/hour), `POST /api/posts/:id/comments` (60/hour), `POST /api/follow/:userId` (100/hour), `POST /api/reports` (10/hour), `POST /api/professionals/me/services` (20/hour) — a `429 rate_limited` error via `errors.rateLimited()`. See `docs/SECURITY.md`.

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

## Phase 6 endpoints (implemented)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/feed` | Reverse-chronological posts from the caller + accepted follows (`?before=<ISO>` cursor, page size 20). |
| `POST` | `/api/posts` | Create a post (`type`, `caption?`, `visibility`, `mediaUrls?`, `metadata?`). |
| `GET`/`DELETE` | `/api/posts/:id` | Fetch (visibility-checked) / soft-delete (owner only) a post. |
| `POST`/`DELETE` | `/api/posts/:id/like` | Like / unlike a post. |
| `GET`/`POST` | `/api/posts/:id/comments` | List / add a comment. |
| `DELETE` | `/api/comments/:id` | Soft-delete the caller's own comment. |
| `POST` | `/api/uploads/post-media` | Upload a post image (`multipart/form-data`, field `file`). Proxies to Vercel Blob server-side rather than issuing a client-upload token — see "Media upload" below. |
| `GET` | `/api/users/:handle` | Public profile: counts, bio, `followStatus` (`none`/`pending`/`accepted`/`self`), `isFriend`. |
| `GET` | `/api/users/:handle/posts` | That user's posts, filtered by what the caller is allowed to see. |
| `GET` | `/api/users/:handle/followers` / `/following` | Accepted-only lists. |
| `POST`/`DELETE` | `/api/follow/:userId` | Follow (auto-accepted unless the target is private, in which case `pending`) / unfollow (also cancels a pending request). |
| `POST` | `/api/follow/:userId/accept` / `/reject` | Respond to an incoming pending follow request. |
| `GET` | `/api/follow/requests` | The caller's incoming pending requests. |
| `GET`/`POST`/`DELETE` | `/api/blocks`, `/api/blocks/:userId` | List / block (also severs any existing follow both ways) / unblock. |
| `POST` | `/api/reports` | Report a post, comment, or user (`targetType`, `targetId`, `reason`, `details?`) — feeds a future admin review queue, no automated action yet. |
| `GET` | `/api/notifications` | Latest 50 notifications (`new_follower`, `follow_request`, `comment`, `like`, `achievement_unlocked`). |
| `POST` | `/api/notifications/read-all` | Mark all of the caller's notifications read. |

## Phase 8 endpoints (implemented)

Phase 7 (Motion & badges) shipped no new backend endpoints — mobile-only, see `docs/ARCHITECTURE.md`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/professionals` | Directory listing now embeds each professional's active `services[]` (batched fetch, not N+1). |
| `GET`/`POST` | `/api/professionals/me/services` | List all of the caller's own menu items (including hidden ones) / add a new one (max 20, auto-appended to the end). |
| `PATCH`/`DELETE` | `/api/professionals/me/services/:id` | Edit a menu item (title/description/priceLabel/isActive) / remove it permanently — ownership-checked. |
| `POST` | `/api/professionals/me/services/reorder` | Reorder the caller's own menu items (`{ orderedIds: string[] }`) — every ID's ownership is verified before applying. |

**No payment, no intermediation, by explicit user direction**: the service menu is purely informational (a "cardápio" — title, optional description, optional freeform price label like `"R$150"` or `"A combinar"`). There is no checkout, no in-app transaction, and no booking flow of any kind; contacting a professional to actually close a service still happens entirely outside the app via the phone/WhatsApp/email/Instagram already on their listing (Phase 5). This is a hard scope boundary, not a placeholder — real payment would require a payment-processor business account (Stripe Connect, Mercado Pago Marketplace, ...) that only the account owner can provision, plus a business-model decision (commission vs. subscription), neither of which is in scope here.

**Media upload**: rather than Vercel Blob's client-upload token protocol (`@vercel/blob/client`'s `handleUpload`/`upload()`), which depends on browser-only shims (`undici`, Node `crypto`) that Metro doesn't reliably resolve for Expo, the mobile app compresses the image client-side (`expo-image-manipulator`, capped at a 1600px longest edge, JPEG quality 0.7) and uploads it as `multipart/form-data` to `/api/uploads/post-media`, which calls `@vercel/blob`'s server-side `put()` directly. The route enforces a 4 MB ceiling — comfortably under Vercel's fixed 4.5 MB Serverless Function request-body limit, and well above what the client-side compression step actually produces for a typical photo.
