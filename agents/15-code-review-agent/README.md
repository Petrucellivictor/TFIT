# Code Review Agent

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Diffs/PRs

## Output

Bugs, duplication, architecture, vulnerability, and performance findings

## Hard constraint

Dev-tooling agent, not user-facing.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
