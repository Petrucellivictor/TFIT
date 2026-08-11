# TFIT — Deployment

## Backend & admin (Vercel)

- `apps/backend` and `apps/admin` are separate Vercel projects under the same team/account (`petrucelli718-9487`), both provisioned from this monorepo via `vercel link` run inside each app directory.
- Environment variables are Marketplace-provisioned (Neon `DATABASE_URL`, Clerk keys, Upstash, Blob token) and pulled locally with `vercel env pull --yes`. Never hand-copy secrets into `.env` files.
- Preview deployments are automatic per PR once the repo is connected to Git; production deploys from the default branch.

## Mobile (Expo)

- Development: `npx expo start` inside `apps/mobile`, Expo Go or a dev client for native-module testing.
- Distribution: EAS Build for iOS/Android binaries, EAS Submit to App Store Connect / Google Play Console, EAS Update for OTA JS/asset pushes between store releases. Requires an Expo account (EAS) plus, before any store submission, an Apple Developer Program membership and a Google Play Console account — neither is provisioned yet; needed no later than Phase 8.

## Database migrations

`database/` holds Drizzle schema + generated SQL migrations. Flow: edit schema → `drizzle-kit generate` → review the generated SQL → `drizzle-kit migrate` against the target Neon branch. Migrations are committed to the repo and applied the same way in every environment — never a manual schema edit in the Neon console.

**Current dev database status**: the single shared dev database was bootstrapped with `drizzle-kit push` before any migration existed (Phase 1), then Phase 2's additions were also applied with `push` rather than `migrate` — the generated `0000_*` migration is a full-schema baseline (enums included), and replaying it with `migrate` against a DB that already has those enums fails (`CREATE TYPE` has no `IF NOT EXISTS`). Keep using `push` against this dev database until it's reset or a second (e.g. preview/CI) database exists to actually exercise `migrate` from a clean state — at that point switch fully to generate+migrate and stop using push.

## Rollback

Vercel keeps prior deployments addressable; promoting a previous deployment is the rollback path for the backend/admin. Database migrations are additive-first (avoid destructive column drops in the same release that ships the code depending on their absence) so a Vercel rollback doesn't strand the schema.
