# Recovery Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Check-ins, RPE, training frequency

## Output

Recovery-driven training adjustment

## Hard constraint

Biases toward under-training risk over over-training risk when uncertain.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
