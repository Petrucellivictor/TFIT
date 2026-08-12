# TFIT — Data Model

PostgreSQL via Neon. Drizzle ORM is the source of truth; schema files live in `database/schema/*.ts`, migrations in `database/migrations/`. Never hand-edit the database — every change is a Drizzle migration.

Conventions:
- Every table: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (unless noted).
- Soft-delete (`deleted_at timestamptz`) on user-generated content tables (`posts`, `post_comments`, ...) so moderation/audit can reason about history; hard-delete only on explicit account-deletion (LGPD right to erasure) flows.
- Foreign keys `on delete cascade` for strictly-owned children (e.g. `post_media` → `posts`); `on delete restrict` or nullable FK where the parent must survive (e.g. `workout_sessions.workout_plan_id` after a plan is edited).
- All health-related columns (`user_health_profiles`, `body_metrics`, `daily_checkins`, `measurements`) are covered by row-level access control at the API layer — only the owning user and, in future, an explicitly-authorized professional can read them. See `SECURITY.md`.

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
| `exercise_library` | The validated exercise dataset agents select from — never invented. Muscles/equipment/contraindications are `text[]` columns rather than separate join tables (`exercise_muscles`/`exercise_equipment`/`exercise_restrictions` from the master spec's list) since there's no search/filter UI yet that needs normalized querying — revisit if that changes. `exercise_variations`/`exercise_media`/`exercise_animations` are deferred until real demonstration content (video/3D) and an admin content-upload pipeline both exist — Phase 7 shipped the achievable "Motion" half (animation/microinteractions, docs/ARCHITECTURE.md) without fabricating placeholder media plumbing; Phase 9's admin panel shipped only a reports queue, not a content-management surface, so this stays deferred with no phase currently targeting it. |
| `workout_plans` | A plan: split name, days/week, status, and the "why this workout" reasoning text (master spec §13; nullable — only AI-generated plans have one, see Phase 5). |
| `workouts` | One training day within a plan. |
| `workout_exercises` | The exercise prescriptions (sets/reps/rest/order) within a workout. |
| `workout_sessions` | An instance of actually doing a workout. |
| `exercise_sets` | Logged sets within a session (reps, weight, feedback). Together with `workout_sessions`, this **is** the master spec's `workout_history` — not a separate table, to avoid duplicating the same facts twice. |
| `personal_records` | Best weight×reps per user per exercise. |
| `ai_agent_runs` | Generic observability log for every agent call (agent name, model, tokens, latency, success/failure) — consolidates the master spec's `ai_recommendations`/`ai_workout_reviews` for now; split those out once a feature needs to query them independently of raw call logs. |

## Phase 3 (implemented now) — Evolution

| Table | Purpose |
|---|---|
| `daily_checkins` | One row per user per day: energy, sleep quality, disposition, and recovery perception (all 1-5), plus a pain flag/notes (master spec §17). The master spec's `recovery_data` is folded in here rather than a separate table — it's collected in the same daily flow and would otherwise just duplicate these same fields with an extra join. |
| `measurements` | Body circumference time series (waist/chest/hip/arm/thigh/calf/shoulder, all nullable — log what you measure). Distinct from `body_metrics` (weight/height/body fat), which already existed from Phase 1 and now also gets a write endpoint for ongoing weight tracking, not just the onboarding snapshot. |
| `goals` | User-defined SMART goals (weight target, measurement target, exercise PR target, or freeform), with status tracking. Distinct from `user_goals` (Phase 1's onboarding objective picklist — "hypertrophy", "lose weight", etc.) which stays as-is. |

The master spec's `progression_history` isn't a physical table: strength progression over time is a query over the Phase 2 `exercise_sets`/`personal_records` tables that already hold the raw facts (`GET /api/progress` computes it) — storing it again separately would just be a sync hazard.

## Phase 4 (implemented now) — Gamification

| Table | Purpose |
|---|---|
| `xp_transactions` | Append-only ledger of every XP grant (amount, reason, and the row that earned it via `reference_id`). A user's total XP is `sum(amount)` over this table, not a cached counter — always re-derivable, always auditable for anti-abuse review (master spec §52). A unique constraint on `(user_id, reason, reference_id)` makes double-granting XP for the same event (e.g. completing the same workout session twice) structurally impossible rather than relying on application code to remember to check. |
| `streaks` | One row per user: current/longest streak, last activity date, and freeze count — persisted because freeze mechanics are stateful (a freeze is a resource that gets spent), unlike the Phase 3 check-in streak which was a pure derived count. |
| `achievements` | Badge catalog (slug, name, description, icon, unlock criteria) — content data like `exercise_library`, seeded the same way. |
| `user_achievements` | Which achievements a user has unlocked, and when. |
| `challenges` | Challenge definitions (title, type, target, period). Phase 4 only ships system-created public challenges anyone can join solo — friend-vs-friend challenges need the Phase 5 social graph and are deferred there. |
| `challenge_participants` | A user's progress/status within a challenge they've joined. |

The master spec's `levels` isn't a table: level names and XP thresholds are static app content (like the FIT Score formula), so they live as a constant in `packages/gamification` rather than rows that would never actually change per-deployment without a code change anyway.

## Phase 5 (implemented now) — Professionals directory & manual/shared workouts

Added ahead of the original phase order at the user's request.

| Table / column | Purpose |
|---|---|
| `professional_profiles` | Self-registered trainer directory listing (specialty, bio, city, contact fields, `is_active`). Deliberately has **no verification/"verified" flag** — master spec §25 warns against implying credential validation without structuring real verification first. A contact directory, not a marketplace: no payment or booking flow. |
| `workout_plans.source` | `ai_generated` \| `manual` \| `copied` \| `shared` — plans are now a library per user, not one AI-generated singleton. |
| `workout_plans.shared_by_user_id` / `.source_plan_id` | Provenance for copied/shared plans (who sent it, and which plan it came from). Nullable; only set for `copied`/`shared` sources. |

Sharing a plan to another user is an instant deep-copy keyed by an exact `@handle` lookup against `profiles.handle` — at the time this shipped (Phase 5) there was no friends graph or notifications system yet (that arrived in Phase 6, below), so "sending" a workout meant the recipient just found a new (archived, not auto-activated) plan in their library. This behavior is unchanged now that follow/notifications exist — sharing still isn't gated by being followed.

## Phase 6 (implemented now) — Social

| Table | Purpose |
|---|---|
| `followers` | One row per follow relationship, with `status: pending \| accepted`. Following a public account inserts `accepted` directly; following a private account (`profiles.is_private`) inserts `pending` until the target accepts. This single table covers both the master spec's `followers` *and* `friendships`: a "friend" is computed as a pair of mutual `accepted` rows, not stored separately — storing it twice would just be a sync hazard between two tables that must always agree. |
| `blocked_users` | Blocker → blocked pair. Enforced at every social read path (feed, follow, comments, profile view) — see `packages/social`. |
| `posts` | `type` (`photo \| workout \| achievement \| personal_record \| streak \| text`), `caption`, `visibility` (`public \| followers \| friends \| private`), and a `metadata` jsonb for type-specific display data captured at creation time (e.g. a PR post's exercise/weight/reps) rather than a live join back to `personal_records` — a post should keep showing what was true when it was posted even if the underlying record later changes. Soft-deleted via `deleted_at`. |
| `post_media` | Photos attached to a post (Vercel Blob URLs). Video is deferred — master spec §23 allows it, but it adds duration/thumbnail/transcoding concerns worth their own pass; photo-only ships now. |
| `post_likes` | One row per (post, user) like — a simple boolean-presence like, not the master spec's richer `post_reactions` (multiple emoji types). Reactions are a nice-to-have layered on the same table shape later; a single like is what actually matters for the like count and notification. |
| `post_comments` | Flat (non-threaded) comments, soft-deleted via `deleted_at`. |
| `notifications` | In-app only for now — `type` (`new_follower \| follow_request \| comment \| like \| achievement_unlocked`), an actor, a reference, and `is_read`. Push delivery (Expo Push) is deferred; this phase ships the data model and an in-app list, which is most of the value without needing push-token registration yet. |
| `reports` | `target_type` (`post \| comment \| user`), reason, free-text details, and a status now worked from `apps/admin`'s reports queue (Phase 9) — list by status, mark reviewed/dismissed. No automated action still happens on a report; master spec's Content Moderation Agent (13) is explicitly meant to *feed* human review, not replace it. |

**Deferred, documented, not forgotten**: `saved_posts` (bookmarking), `post_reactions` (multi-emoji beyond like), automated AI content moderation (Agent 13 — needs a working AI Gateway, which is still pending the Vercel billing blocker from Phase 2), and a dedicated `privacy_settings` table (per-post `visibility` plus `profiles.is_private` plus blocking already cover the load-bearing cases; granular settings like "who can comment" can extend `user_preferences` later without a new table).

The feed (`GET /api/feed`) is a straightforward reverse-chronological query over posts from people the caller follows (plus their own), filtered by `canViewPost` — no relevance/ranking algorithm. The master spec itself warns against an "excessively addictive" feed (§26); recency + visibility is the honest version of that until real usage data would justify anything more.

## Phase 8 (implemented now) — Professionals: service menu

| Table | Purpose |
|---|---|
| `professional_services` | A menu of offerings on a professional's listing: `title`, optional `description`, optional freeform `price_label` (e.g. `"R$150"`, `"A combinar"` — not a decimal column, deliberately, since nothing computes on it), `order` for manual reordering (same pattern as `post_media.order`), and `is_active` for hide-without-losing (same convention as its parent `professional_profiles.is_active`, not the `posts`/`post_comments` family's `deleted_at` soft-delete — this table follows its immediate parent's convention). FK to `professional_profiles.user_id`, cascade delete. |

## Phase 9 — Polish

No new tables. Rate limiting (`docs/SECURITY.md`) counts directly from each action's own existing table (`posts`, `post_comments`, `followers`, `reports`, `professional_services`) rather than introducing a separate `rate_limit_events` bookkeeping table — one fewer table to keep consistent, and a burst of rejected attempts can't inflate storage the way a dedicated events table would let it. The admin panel (`apps/admin`) reads/writes `reports` directly; no schema change was needed to support it.

**Explicitly out of scope, at the user's own request, not merely deferred**: no `subscriptions` table, no payment/transaction records, no verification/credential fields. The master spec's §25 "possibilidades futuras" (professional content, subscriptions, verification) is not just postponed — the user directly said they want contact-only ("como se fosse um cardápio... não quero sistema de pagamento e nenhuma intermediação"), so this is a settled scope boundary for the product, not a technical limitation to revisit later. If that changes, it would need a genuinely new phase: a payment-processor business account (Stripe Connect / Mercado Pago Marketplace) provisioned by the account owner, plus real credential-verification structuring — both explicitly called out in the master spec as needing groundwork before implementation, not something to bolt on incrementally.

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
