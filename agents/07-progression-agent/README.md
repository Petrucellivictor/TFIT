# Progression Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Workout history: load, reps, volume over time

## Output

Progression recommendation (increase load / reps / hold / deload)

## Hard constraint

Never silently changes a plan; always surfaces the reason for a change.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
