# TFIT — Security & Privacy

## Authentication & sessions

Auth is **not** hand-rolled. Clerk (`@clerk/nextjs` on the backend, `@clerk/clerk-expo` on mobile) owns password hashing, session issuance, refresh-token rotation, and brute-force protection. The backend never sees or stores a password. `users.clerk_id` is the only identity linkage we store; a Clerk webhook (`/api/webhooks/clerk`) keeps our `users`/`profiles` rows in sync on create/update/delete.

- Mobile stores the session token via the Clerk Expo SDK's built-in secure token cache (`@clerk/expo/token-cache`, backed by `expo-secure-store`) — never `AsyncStorage`.
- `src/proxy.ts` runs `clerkMiddleware()` on every request only to establish the auth context (so `auth()` is available downstream) — it does **not** decide authorization. Path-matching authorization (`createRouteMatcher` + `auth.protect()` in middleware) is deprecated by Clerk in favor of resource-based checks: every route handler that needs a signed-in user calls `auth()` itself and returns 401 via `errors.unauthorized()` (see `src/lib/http.ts`). This avoids the exact failure mode path-matching has — a route whose matcher pattern silently stops covering it.
- Rate limiting on auth-adjacent and AI endpoints via Upstash `Ratelimit` — sliding window, keyed by user ID (authenticated) or IP (pre-auth).

## Data classification

| Class | Examples | Handling |
|---|---|---|
| **High sensitivity (health)** | `user_health_profiles`, `body_metrics`, `recovery_data`, `daily_checkins` | Readable only by the owning user's authenticated session (row ownership check on every query, never a "list all" without a `WHERE user_id = :self`). Never included in analytics exports without explicit anonymization. Never rendered in the public feed or any other user's view. |
| **Personal** | `profiles`, `user_preferences`, email (via Clerk) | Owner + explicitly-shared-with parties per privacy settings. |
| **User-generated public content** | `posts`, `post_comments` | Visible per the post's own privacy setting (public/friends/followers/private), enforced at query time, not just hidden in the UI. |
| **System** | `audit_logs`, `ai_recommendations` | Backend/admin only, never shipped to a client response. |

## Transport & storage

- HTTPS/TLS everywhere (Vercel default; no HTTP fallback).
- Postgres (Neon) connections over TLS; secrets only ever live in Vercel-managed env vars, pulled locally via `vercel env pull` — never committed. `.env.example` documents required keys with placeholder values only.
- Media (Blob): private access by default for anything not yet published publicly by the user (e.g., avaliação photos, draft posts); public access only once the user has explicitly published it, matching the post's own privacy setting.

## Input handling

- Every API input validated with a Zod schema from `packages/validation` before touching business logic — reject, don't sanitize-and-continue, on schema failure.
- Drizzle's parameterized queries eliminate SQL injection by construction; no raw string-interpolated SQL is permitted anywhere in the codebase.
- Upload endpoints validate MIME type and size server-side (never trust the client-reported content type), independent of any client-side check.
- User-generated content rendered in the mobile app never executes as code (no HTML injection surface on native — this risk is primarily relevant if/when a web client is added).

## LGPD / privacy by design

- **Minimization**: onboarding only collects what a given agent/feature actually consumes (see `docs/DATABASE.md` health fields — free-text "other limitation" is stored as reported, never auto-classified into a diagnosis).
- **Consent & transparency**: the health/limitations questions in onboarding explicitly state they inform training safety, not medical evaluation, before being asked (master spec §12).
- **Right to erasure**: an account-deletion flow hard-deletes the `users` row and cascades to owned data (not soft-delete) once the user confirms; Clerk account deletion triggers the same via webhook.
- **Right to export**: a data-export endpoint assembles the user's own rows across all owned tables into a downloadable JSON — planned for Phase 1 completion once the foundation tables are seeded with real usage, implemented no later than Phase 3.
- **Visibility controls**: privacy settings (`profiles.is_private`, per-post visibility) are enforced server-side on every read path, not just hidden client-side.

## Audit logging

`audit_logs` records: login (via Clerk webhook), data export, data deletion, privacy setting changes, and admin actions (once `apps/admin` exists). Never logs the content of health data itself — only that an access/change event occurred, by whom, and when.

## AI-specific security

- User-generated text (bio, post captions) that reaches an agent prompt is passed as clearly delimited **data**, never concatenated into the **system instruction** — prevents prompt injection from steering agent behavior (e.g., a bio containing "ignore previous instructions").
- No agent call result is applied to the database without passing the deterministic rules engine (`packages/fitness-engine`) — see `docs/AGENTS.md`. This is also a security boundary: it bounds the blast radius of a compromised or manipulated model response.

## Open items tracked, not yet due

- Formal threat model / pen-test pass: scheduled for Phase 8 polish, once the full surface (social + professional features) exists.
- MFA: Clerk supports it natively: enable once account-recovery UX is designed (Phase 8), not required for Phase 1 preview usage.
