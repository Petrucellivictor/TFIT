# TFIT — Security & Privacy

## Authentication & sessions

Auth is **not** hand-rolled. Clerk (`@clerk/nextjs` on the backend, `@clerk/clerk-expo` on mobile) owns password hashing, session issuance, refresh-token rotation, and brute-force protection. The backend never sees or stores a password. `users.clerk_id` is the only identity linkage we store; a Clerk webhook (`/api/webhooks/clerk`) keeps our `users`/`profiles` rows in sync on create/update/delete.

- Mobile stores the session token via the Clerk Expo SDK's built-in secure token cache (`@clerk/expo/token-cache`, backed by `expo-secure-store`) — never `AsyncStorage`.
- `src/proxy.ts` runs `clerkMiddleware()` on every request only to establish the auth context (so `auth()` is available downstream) — it does **not** decide authorization. Path-matching authorization (`createRouteMatcher` + `auth.protect()` in middleware) is deprecated by Clerk in favor of resource-based checks: every route handler that needs a signed-in user calls `auth()` itself and returns 401 via `errors.unauthorized()` (see `src/lib/http.ts`). This avoids the exact failure mode path-matching has — a route whose matcher pattern silently stops covering it.
- Rate limiting: `POST /api/training/generate` is capped at 5/hour/user (via a Postgres count query over `ai_agent_runs`). Phase 9 extended the same interim pattern to the write endpoints most exposed to spam/abuse — posts (20/hour), comments (60/hour), new follows (100/hour), reports (10/hour — reports are themselves a harassment vector if unbounded), and professional-service creation (20/hour) — each counted directly from that action's own table (`src/lib/rateLimit.ts`), with no separate "rate limit events" bookkeeping table: a burst of *rejected* attempts can't inflate storage, and deleting a row afterward doesn't reset the count. Upstash `Ratelimit` is still the intended long-term implementation (docs/ARCHITECTURE.md) once the Marketplace integration is provisioned; call sites won't change.

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

`audit_logs` records: login (via Clerk webhook), data export, data deletion, and privacy setting changes. Admin actions (`apps/admin` exists as of Phase 9, but only for the reports queue) aren't wired into `audit_logs` yet — the report-status-update itself has no audit trail beyond the `reports.status` column change. Worth adding once the admin surface grows past a single review queue. Never logs the content of health data itself — only that an access/change event occurred, by whom, and when.

## AI-specific security

- User-generated text (bio, post captions) that reaches an agent prompt is passed as clearly delimited **data**, never concatenated into the **system instruction** — prevents prompt injection from steering agent behavior (e.g., a bio containing "ignore previous instructions").
- No agent call result is applied to the database without passing the deterministic rules engine (`packages/fitness-engine`) — see `docs/AGENTS.md`. This is also a security boundary: it bounds the blast radius of a compromised or manipulated model response.

## Professional directory (Phase 5)

`professional_profiles` is a **self-reported contact directory, not a verified marketplace** — this is a deliberate scope limit, not an oversight (master spec §25: "não implementar funcionalidades profissionais que exijam validação legal sem primeiro estruturar verificação adequada"). Concretely:

- No field or UI claims TFIT has verified a trainer's credentials, identity, or qualifications. The mobile directory and detail screens show an explicit disclaimer to that effect.
- No payment, booking, or contract flow exists — contact happens outside the app (WhatsApp/phone/Instagram/email via `Linking`), so TFIT is never a party to whatever the user and trainer agree to.
- Anyone can list themselves; there's no application/approval step. If abuse surfaces (fake listings, harassment via the directory), it's reportable (`targetType: "user"`) into the same admin reports queue as general content moderation (Phase 9, below).

## Professional service menu (Phase 8)

Phase 8 extended the directory with `professional_services` — a per-professional menu of offerings (title, description, freeform price label). This inherits every scope limit above unchanged, plus one made explicit by the user directly (not just carried over from the master spec): **no payment processing and no in-app intermediation of any kind**. Concretely:

- There is no price *column* with numeric/currency semantics — `price_label` is a freeform display string, which is a deliberate choice against ever computing, charging, or splitting a real amount from it.
- No checkout, cart, invoice, or booking-confirmation flow exists anywhere in this feature. A user who wants a listed service still has to reach the professional through the same external contact methods as Phase 5.
- Real payment support was explicitly ruled out for this phase rather than merely postponed: it would require a payment-processor business account (Stripe Connect, Mercado Pago Marketplace) that only the account owner can create — involving their own KYC/bank details — which isn't something achievable through code alone, plus a business-model decision (commission vs. subscription) that's the account owner's call, not a technical one.

## Workout sharing (Phase 5)

Sharing a plan looks up the recipient by exact `profiles.handle` and deep-copies the plan into their library server-side — it does not read anything back from the recipient (no privacy leak: a private profile can still receive a shared plan, since the sender only needs to know the handle, not view the profile). The copy lands `archived`, so it's inert until the recipient chooses to activate it — nothing about a user's active training plan changes without their action.

## Social visibility & moderation (Phase 6)

- Post visibility (`public`/`followers`/`friends`/`private`) is enforced by a single pure function, `canViewPost` (`packages/social`), called identically on every read path — feed, a user's post list, and single-post fetch — so there is exactly one place visibility logic can be wrong, not one per endpoint. Blocking always wins over visibility: a blocked relationship hides content regardless of the post's own setting.
- Blocking is bidirectional and severs the follow graph: blocking someone deletes any existing follow row in either direction (in the same transaction as the block), and a blocked user cannot re-follow or be discovered via the blocker's followers/following lists.
- Reporting (`POST /api/reports`) writes to a `reports` table for future admin review — there is no automated moderation action yet (no auto-hide, no auto-ban). This is a deliberate scope limit for Phase 6, not an oversight: automated content moderation needs its own design pass (false-positive handling, appeals) before it touches user content.
- Media upload does not use Vercel Blob's client-upload token protocol, because that protocol's browser-side implementation (`@vercel/blob/client`) depends on `undici`/Node `crypto` shims that Metro (Expo's bundler) doesn't reliably resolve. Instead, the mobile app compresses images client-side and uploads through an authenticated backend route that calls Blob's server-side `put()` — see `docs/API.md`'s Phase 6 section. The upload route still validates MIME type and size server-side, independent of the client-side compression step, per the input-handling rule above.

## Admin panel (Phase 9)

`apps/admin` — despite what earlier drafts of this doc set and docs/ARCHITECTURE.md said, this **did not exist as a stub from Phase 1**; it was built from zero in Phase 9, scoped to exactly one screen: the `reports` review queue (list by status, mark reviewed/dismissed — no content-removal action yet, that's still done directly against the database). Concretely:

- **No RBAC system exists.** Authorization is an explicit server-side email allowlist (`ADMIN_EMAILS` env var, checked in `src/lib/adminAuth.ts` on every page load) against the same Clerk user pool the main app uses — not a placeholder, but also not the org-based roles docs/ARCHITECTURE.md's §7 originally envisioned for "Phase 8." Swap for Clerk organization roles later without changing the call site's shape (`requireAdmin()`).
- Same Neon database, same Clerk instance as `apps/backend` — `apps/admin` reads/writes directly via `@tfit/database` rather than proxying through the public API, which is a reasonable choice for an internal tool but means both apps' `DATABASE_URL`/Clerk keys must stay in sync if either rotates.
- **Not yet deployed as a separate Vercel project** — it runs locally (`npm run dev -w @tfit/admin`) and builds cleanly, but the actual production deployment (new Vercel project, custom domain, its own env vars set there) is a manual provisioning step for the account owner, same category as the still-pending Upstash/Apple/Google steps elsewhere in this doc.
- Deliberately out of scope for Phase 9: user management, broader content moderation (removing a post/comment from the admin UI itself), analytics. The reports queue was prioritized because it was the one genuine safety gap — reports had been collectable since Phase 6 with zero way to ever act on one.

## Dependency vulnerabilities (Phase 9 audit)

`npm audit` reports 45 known vulnerabilities (25 moderate, 20 high, 0 critical) as of Phase 9. Two clusters:

1. **Expo/Metro/React Native toolchain** (dev-time bundler issues, e.g. an `image-size` parser DoS) — real fix needs a major Expo/RN version bump, which is exactly the kind of large, hard-to-reverse change (touches every screen, needs full regression testing) this project doesn't take casually mid-"polish phase."
2. **A `@solana-mobile`/wallet-adapter dependency chain pulled in transitively via `@clerk/expo`** (Clerk's SDK bundles wallet-adapter code this app never uses) — needs a `@clerk/expo` major bump to fully clear.

The one non-breaking fix available (`npm audit fix` without `--force`) was applied in Phase 9: `@clerk/expo` 4.2.5 → 4.2.7. It didn't move the vulnerability count (the Solana chain needs the major bump above), but it's a real, verified-safe patch update, not a no-op. The remaining 45 are tracked here rather than either ignored or forced through `--force` (which would be a breaking, unreviewed mass-upgrade) — a dedicated dependency-upgrade project, scoped and regression-tested on its own, is the right way to clear them.

## Open items tracked, not yet due

- Formal threat model / pen-test pass: still pending — realistic once the admin panel and the rest of the moderation surface are more built out.
- MFA: Clerk supports it natively; enable once account-recovery UX is designed, not required for current preview usage.
- The major-version dependency upgrades described above.
