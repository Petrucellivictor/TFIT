# Safety & Health Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Reported health conditions/pain/limitations + proposed workout

## Output

Verdict: approved / adapt / blocked, with rationale

## Hard constraint

Mandatory hard gate in the rules engine. Never diagnoses. Never overridden by another agent.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
