# Personal Trainer

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Training profile from Fitness Assessor

## Output

Weekly split proposal: exercises, sets, reps, rest, order, notes

## Hard constraint

Proposes structure only; does not pick raw exercises (Exercise Selection Specialist does).

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
