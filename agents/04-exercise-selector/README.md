# Exercise Selection Specialist

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Training profile + target muscles/goals

## Output

List of exercise IDs from exercise_library

## Hard constraint

Never invents an exercise. Input is constrained to a DB query, never free text generation.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
