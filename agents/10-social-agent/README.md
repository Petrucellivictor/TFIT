# Social Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

User social graph + activity

## Output

Feed/discovery/challenge relevance signals

## Hard constraint

Must not manipulate engagement abusively (no dark patterns).

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
