# Fit Orchestrator

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

User context; which specialists are needed

## Output

Consolidated result; conflict flags

## Hard constraint

Never decides a specialist question itself. Coordinates and consolidates only.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
