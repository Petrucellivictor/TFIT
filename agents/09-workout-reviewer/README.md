# Workout Reviewer

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Fully composed workout

## Output

APPROVED or REJECTED, with justification and corrections

## Hard constraint

Last check before the user sees the plan. Rejections loop back to Personal Trainer.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
