# TFIT (App Fit) — Architecture

## 1. Stack decision

| Layer | Choice | Why |
|---|---|---|
| Mobile client | **React Native + Expo** (TypeScript, Expo Router) | Single codebase for iOS/Android, OTA updates via EAS Update, mature ecosystem for the exact primitives this app needs (Reanimated, Skia, gesture handler, camera, notifications), config plugins cover the native modules we need (health data, camera, HealthKit/Health Connect later) without ejecting. Flutter was considered — rejected because our team context is TypeScript end-to-end (backend, web admin, shared validation/types), and sharing Zod schemas and API types between backend and mobile is a bigger win than Flutter's rendering-engine consistency. |
| Backend / API | **Next.js (App Router, Route Handlers) on Vercel** | Environment is already Vercel-native. Route Handlers give us a REST-ish API organized by domain (`/api/<domain>/...`), Fluid Compute gives real Node.js (not edge-limited) for long-running AI orchestration calls, and Vercel Cron covers scheduled jobs (streak resets, recommendation refresh). |
| Admin panel | **Next.js app**, separate Vercel project (`apps/admin`) | Isolation from the public API surface; own auth/RBAC boundary. Stub in Phase 1, built out in Phase 8. |
| Database | **PostgreSQL via Neon** (Vercel Marketplace), **Drizzle ORM** | Relational integrity for a heavily relational domain (users, workouts, social graph). Neon is the Vercel-preferred serverless Postgres (branching for preview envs, pooled HTTP driver fits Fluid Compute). Drizzle over Prisma: lighter runtime, SQL-shaped queries which matter for the reporting/analytics-heavy queries (FIT Score, progression), first-class migration files we can review in PRs. |
| Auth | **Clerk** (Vercel Marketplace native), `@clerk/nextjs` on backend + `@clerk/clerk-expo` on mobile | Native Marketplace provisioning (auto env vars), prebuilt secure session/refresh-token handling (we must not hand-roll this for health-adjacent data — see `SECURITY.md`), dedicated Expo SDK with secure token storage (`expo-secure-store`), webhooks to sync `users` row on signup. |
| File/media storage | **Vercel Blob** | Photos, videos, avatars, exercise media. Public access for social content the user has made public, private access for anything not yet public (drafts, avaliação photos). Never store media blobs in Postgres. |
| Cache / rate limiting | **Upstash Redis** (Vercel Marketplace) | Rate limiting (auth, AI endpoints, posting), streak/session ephemeral state, feed ranking cache. |
| AI orchestration | **Vercel AI SDK + AI Gateway** | Multi-agent orchestration (see `AGENTS.md`) implemented as server-side functions in `packages/ai`, calling models through the Gateway (provider-agnostic model strings, fallback, cost/latency logging). Deterministic rules engine (`packages/fitness-engine`) validates/clamps everything an LLM proposes before it becomes a workout — see §41 rules-engine gate below. |
| Monorepo tooling | **Turborepo + npm workspaces** | pnpm was preferred but blocked by a local Windows permissions issue (Node installed under `Program Files`, corepack couldn't symlink); npm workspaces is a fully supported Turborepo backend with no functional loss for this project size. |

## 2. High-level flow

```
Mobile App (Expo)
    ↓ HTTPS (Clerk session JWT)
Next.js Route Handlers (apps/backend)
    ↓
Business logic (packages/fitness-engine, packages/gamification, ...)
    ↓
AI Orchestration (packages/ai → AI Gateway) ── only when heuristics are insufficient
    ↓
Rules Engine validation (never trust raw LLM output for workout safety)
    ↓
Drizzle → Neon Postgres
    ↓
Vercel Blob (media) / Upstash (cache, rate limit) / Notifications (Expo Push)
```

Critical rule (see master spec §41): an LLM response is a **suggestion**. It always passes through the deterministic rules engine and the Safety Agent gate before it can mutate a `workout_plans` row. No route handler applies raw model output directly to the database.

## 3. Repository layout

```
apps/
  backend/        Next.js API (Vercel project #1)
  admin/          Next.js admin panel (Vercel project #2, Phase 8 stub now)
  mobile/         Expo React Native app
packages/
  types/          Shared TS types + Zod schemas (single source of truth for API contracts)
  validation/     Zod validation schemas used by both backend and mobile forms
  ui/             Design system: tokens, primitives, themed components (RN)
  config/         Shared tsconfig/eslint
  fitness-engine/ Deterministic workout rules engine (volume, frequency, safety clamps)
  ai/             AI Gateway client, agent orchestration, prompt loading
  gamification/   XP/level/streak calculation (pure functions, unit-testable)
agents/           One folder per agent, versioned prompt + I/O contract (see AGENTS.md)
skills/           Knowledge skills consumed by agents/devs (see SKILLS.md)
database/         Drizzle schema + migrations (source of truth for the data model)
docs/             This documentation set
tests/            Cross-package integration/e2e tests
scripts/          One-off ops scripts (seed, backfill)
infrastructure/   IaC / environment notes (mostly Vercel + Marketplace config as code-as-docs)
```

## 4. Environments

- **Local**: `vercel env pull` into each app's `.env.local`; Neon branch per developer optional later.
- **Preview**: automatic per-PR Vercel deployments; Neon preview branching considered for Phase 2+ once schema stabilizes.
- **Production**: `apps/backend` and `apps/admin` as separate Vercel projects under the same team; mobile ships via EAS Build/Submit + EAS Update for OTA JS/asset updates.

## 5. Roadmap (phases, per master spec §55)

1. **Foundation** ✅: architecture, design system, auth, foundation DB schema, navigation shell, onboarding UI.
2. **Fitness core** ✅ (code complete; live end-to-end test pending a credit card on the Vercel account for the AI Gateway — see §6): assessment, exercise library, deterministic workout engine, the 7 generation-pipeline agents wired for real, workout mode. The remaining 8 agents (recovery, social, gamification, motivation, moderation, QA, code-review) stay as design contracts until their phases.
3. **Evolution** ✅: check-ins, body measurements, user-defined goals, and the FIT Score, backed by an evolution dashboard. Progression history is a query over Phase 2 data rather than a new table (docs/DATABASE.md).
4. **Gamification** ✅: XP (deterministic, not an LLM call — see docs/AGENTS.md's revised Gamification Agent note), levels, streaks with a freeze/recovery mechanic, achievements, and system-created public challenges. Friend-vs-friend challenges wait for the Phase 5 social graph.
5. **Professionals directory & manual/shared workouts** ✅ — inserted ahead of schedule at the user's request, not in the original 8-phase plan. A contact directory for self-registered trainers (no payment/booking flow, no credential verification — master spec §25 explicitly warns against implying verification without structuring it first), plus evolving workout plans from AI-only to a library: manual creation via an exercise picker, duplicating a plan, and sending a copy to another user by exact @handle (no notifications/friends system yet, so sharing is an instant copy, not a request). Manual plans go through the same deterministic rules engine as AI ones, but structural violations (invented exercise, bad numbers) hard-block while health/volume concerns surface as warnings — a self-authored plan is an informed choice, not a pushed recommendation (docs/AGENTS.md).
6. **Social** ✅: follow graph (public auto-accept, private requires approval; "friend" is computed as a mutual accepted follow, not a separate table), posts (photo/text, with visibility public/followers/friends/private), likes, comments, blocking, reporting, and in-app notifications. The `@handle` lookup from Phase 5's sharing is the seed of this — Phase 6 turns it into a real graph. Deferred: push notifications (in-app only for now), saved posts, automated moderation, a ranked/algorithmic feed (reverse-chronological only — an honest choice with no usage data to justify "relevance" yet).
7. **Motion & badges** ✅ (scope-limited — see note below): a circular animated rest-timer ring (`react-native-svg` + Reanimated), animated progress bars (XP, FIT Score), a reusable celebration modal for XP/achievement unlocks (wired into workout completion and check-ins — previously silent), redesigned achievement badges (locked/unlocked visual states, tap-through detail view, staggered unlock animation), and a like-button micro-interaction on posts. **Scope note**: the master spec's "3D exercise demonstrations" is deliberately not attempted here — it requires real 3D models/animations or licensed video content, neither of which exists, and there's no admin content-upload pipeline yet to place them even if they did (that's Phase 9). Building empty media-URL plumbing with nothing to point it at would ship dead code, not a feature; this phase instead delivers the "Motion" half that's fully achievable now — see `docs/DATABASE.md` for the exercise-media deferral, now folded into Phase 9 alongside the admin panel.
8. **Professionals — remaining scope**: professional content/programs, verification/legal groundwork, monetization. The directory itself shipped in Phase 5; this is what's left per the master spec's original §25 "possibilidades futuras."
9. **Polish**: performance, accessibility, security hardening, full test suite, admin panel, visual refinement.

## 6. Key risks

**Technical**
- LLM latency/cost for workout generation — mitigated by rules-engine-first design (§41) and caching common assessment→plan patterns.
- Neon HTTP driver cold-start behavior under Fluid Compute — monitor; move to pooled/websocket driver if latency is an issue.
- React Native 3D/animation performance on low-end Android — Skia/Reanimated budget enforced per §28/§32, always ship a reduced-motion fallback.

**Security**
- Health data is the highest-sensitivity data in this system — see `SECURITY.md` for encryption-at-rest, access control, and audit logging requirements before Phase 2 stores any real health fields.
- AI prompt injection via user-generated content (bio, posts) reaching agent prompts — sanitize/segregate user content from system instructions in `packages/ai`.

**Health/liability**
- No agent may diagnose, guarantee outcomes, or override the Safety Agent. This is enforced structurally: the Safety Agent's `blocked` verdict is a hard gate in the rules engine, not a suggestion an LLM can talk itself out of.

**Dependencies**
- Clerk, Neon, Upstash, Vercel Blob, AI Gateway are all Marketplace/Vercel-managed — provisioning requires the account owner's Vercel login (done: `petrucelli718-9487`). Neon and Clerk are provisioned and live. Upstash is still pending browser terms acceptance (same one-time step Neon/Clerk needed). The AI Gateway itself needs no separate provisioning but currently rejects requests with `customer_verification_required` — **a credit card needs to be added to the Vercel account** (Vercel dashboard → AI Gateway → add card) before any agent call will succeed; the code path is otherwise complete and unit-tested independent of this.
- For App Store/Play Store distribution later, Apple Developer + Google Play Console accounts are not yet provisioned — needed before Phase 8 store submission.

## 7. Decisions deferred (documented, not blocking)

- Push notification provider: start with `expo-notifications` (Expo Push Service) — no separate Marketplace integration needed until volume/analytics demands one.
- Video processing (Blob → transcoded formats) and real exercise demonstration media deferred to Phase 9, alongside the admin content-upload pipeline — Phase 6 posts support images only, and Phase 7 shipped animation/motion polish without fabricating placeholder media (see §5).
- Full RBAC for `apps/admin` deferred to Phase 8; Phase 1 ships a stub with Clerk org-based gating only.
