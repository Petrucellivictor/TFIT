# Gamification Agent

**Status:** implemented (Phase 4) as deterministic code, not an LLM call — see `packages/gamification` (levels, XP rules, streak/freeze logic, achievement criteria) and `apps/backend/src/lib/gamification.ts` (the DB-backed service that awards XP, updates streaks, and unlocks achievements as a side effect of real actions). XP amounts, level thresholds, and streak rules are fixed business rules, not judgment calls a model would improve — see docs/AGENTS.md §"Cost/latency discipline".

## Input

XP/streak/challenge state — in practice, the action that just happened (workout completed, check-in submitted, PR logged, goal achieved) plus the user's current streak/achievement/challenge rows.

## Output

XP awards, level/streak updates, challenge progress and completion, newly unlocked achievements.

## Hard constraint

Must not incentivize overtraining or streak-anxiety — streak freezes are earned by sustained consistency (every 7th consecutive day), not by training harder or more often. Also bound by the global agent rules in `docs/AGENTS.md`.
