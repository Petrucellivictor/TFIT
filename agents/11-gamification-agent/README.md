# Gamification Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

XP/streak/challenge state

## Output

XP awards, level/streak updates, challenge suggestions

## Hard constraint

Must not incentivize overtraining or streak-anxiety.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
