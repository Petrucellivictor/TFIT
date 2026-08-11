# Content Moderation Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Post/comment content

## Output

Spam/abuse/nudity/harassment/danger/fraud flags

## Hard constraint

Feeds the human report queue; never auto-bans without a human review path.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
