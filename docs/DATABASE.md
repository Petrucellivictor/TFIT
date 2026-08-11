# TFIT — Data Model

PostgreSQL via Neon. Drizzle ORM is the source of truth; schema files live in `database/schema/*.ts`, migrations in `database/migrations/`. Never hand-edit the database — every change is a Drizzle migration.

Conventions:
- Every table: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (unless noted).
- Soft-delete (`deleted_at timestamptz`) on user-generated content tables (`posts`, `post_comments`, ...) so moderation/audit can reason about history; hard-delete only on explicit account-deletion (LGPD right to erasure) flows.
- Foreign keys `on delete cascade` for strictly-owned children (e.g. `post_media` → `posts`); `on delete restrict` or nullable FK where the parent must survive (e.g. `workout_sessions.workout_plan_id` after a plan is edited).
- All health-related columns (`user_health_profiles`, `body_metrics`, `recovery_data`) are covered by row-level access control at the API layer — only the owning user and, in future, an explicitly-authorized professional can read them. See `SECURITY.md`.

## Phase 1 (implemented now) — Foundation

| Table | Purpose |
|---|---|
| `users` | Core identity row, 1:1 with a Clerk user (`clerk_id` unique). Minimal PII here. |
| `profiles` | Public-facing profile: display name, handle, bio, avatar, privacy flag. |
| `user_preferences` | Notification/privacy/unit (metric/imperial) preferences. |
| `user_goals` | Selected objective(s) from onboarding (emagrecer, hipertrofia, força, condicionamento, saúde, outro). |
| `user_health_profiles` | Self-reported health flags/limitations from onboarding (never a diagnosis). High-sensitivity — see `SECURITY.md`. |
| `training_preferences` | Onboarding-collected training parameters (days/week, minutes/session, experience level, equipment preference) — raw inputs the Fitness Assessor agent consumes in Phase 2. |
| `body_metrics` | Weight/height/age/measurements time series (age is self-reported per entry, not derived from a birth date), used to derive BMI trend (never shown as a diagnosis). |
| `audit_logs` | Append-only log of security-relevant events (login, data export, data deletion, permission changes). |

## Phase 2 (implemented now) — Fitness core

| Table | Purpose |
|---|---|
| `exercise_library` | The validated exercise dataset agents select from — never invented. Muscles/equipment/contraindications are `text[]` columns rather than separate join tables (`exercise_muscles`/`exercise_equipment`/`exercise_restrictions` from the master spec's list) since there's no search/filter UI yet that needs normalized querying — revisit if that changes. `exercise_variations`/`exercise_media`/`exercise_animations` are deferred to Phase 6 (3D/Motion), which is where media actually gets produced. |
| `workout_plans` | A generated plan: split name, days/week, status, and the "why this workout" reasoning text (master spec §13). |
| `workouts` | One training day within a plan. |
| `workout_exercises` | The exercise prescriptions (sets/reps/rest/order) within a workout. |
| `workout_sessions` | An instance of actually doing a workout. |
| `exercise_sets` | Logged sets within a session (reps, weight, feedback). Together with `workout_sessions`, this **is** the master spec's `workout_history` — not a separate table, to avoid duplicating the same facts twice. |
| `personal_records` | Best weight×reps per user per exercise. |
| `ai_agent_runs` | Generic observability log for every agent call (agent name, model, tokens, latency, success/failure) — consolidates the master spec's `ai_recommendations`/`ai_workout_reviews` for now; split those out once a feature needs to query them independently of raw call logs. |

## Phase 3 — Evolution

`daily_checkins`, `recovery_data`, `measurements`, `progression_history`, `goals`.

## Phase 4 — Gamification

`xp_transactions`, `levels`, `streaks`, `achievements`, `user_achievements`, `challenges`, `challenge_participants`.

## Phase 5 — Social

`friendships`, `followers`, `posts`, `post_media`, `post_likes`, `post_comments`, `post_reactions`, `saved_posts`, `notifications`, `reports`, `blocked_users`, `privacy_settings`.

## Phase 7 — Professionals / monetization

`professional_profiles`, `professional_content`, `subscriptions`.

## Entity relationship sketch (Phase 1 subset)

```
users (1) ──── (1) profiles
users (1) ──── (1) user_preferences
users (1) ──── (1) user_health_profiles
users (1) ──── (1) training_preferences
users (1) ──── (N) user_goals
users (1) ──── (N) body_metrics
users (1) ──── (N) audit_logs
```

`users.clerk_id` is the join key to Clerk's identity — the backend never stores passwords or session tokens itself; Clerk owns that surface entirely (see `SECURITY.md` §Auth).

## Indexing notes (Phase 1)

- `users.clerk_id` — unique index, primary lookup path on every authenticated request.
- `profiles.handle` — unique index, case-insensitive (citext or lower(handle) expression index).
- `body_metrics(user_id, recorded_at)` — composite index for time-series queries (evolution dashboard).
- `audit_logs(user_id, created_at)` — composite index for the LGPD "export my data" flow.

## Full future model (reference, per master spec §7)

Listed here so schema decisions in later phases stay consistent with the original spec's naming: `personal_records`, `progression_history`, `daily_checkins`, `recovery_data`, `goals`, `achievements`, `user_achievements`, `xp_transactions`, `levels`, `streaks`, `challenges`, `challenge_participants`, `friendships`, `followers`, `posts`, `post_media`, `post_likes`, `post_comments`, `post_reactions`, `saved_posts`, `notifications`, `reports`, `blocked_users`, `privacy_settings`, `professional_profiles`, `professional_content`, `ai_recommendations`, `ai_workout_reviews`, `subscriptions`, `audit_logs`.
