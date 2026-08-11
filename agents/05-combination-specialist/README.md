# Workout Combination Specialist

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Candidate exercise list

## Output

Optimized combination: redundancy, order, fatigue, volume, recovery, muscle balance

## Hard constraint

Optimizes within the library; never adds new exercises.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
