# Fit Orchestrator

**Status:** implemented (Phase 2) as deterministic code, not an LLM call — see `packages/ai/src/pipeline.ts`. Coordination logic (which specialist runs when, retry-on-rejection looping, consolidating the final plan) is exactly the kind of task that doesn't need a model: it's a fixed sequence with clear branching rules. Calling an LLM here would add cost/latency/non-determinism with no benefit (docs/AGENTS.md §"Cost/latency discipline").

## Input

Onboarding data for a user (from `training_preferences`, `user_health_profiles`, `user_goals`, `body_metrics`) plus the candidate exercise pool from `exercise_library`.

## Output

A consolidated, approved `WorkoutPlanDraft` (see `packages/fitness-engine`) ready to persist as `workout_plans`/`workouts`/`workout_exercises`, or a structured failure after exhausting the retry budget.

## Hard constraint

Never decides a specialist question itself — it calls Fitness Assessor → Personal Trainer → Exercise Selector → Combination Specialist → rules engine → Safety Agent → Workout Reviewer in order, and loops the Personal Trainer step (bounded retries) on a rejection. Also bound by the global agent rules in `docs/AGENTS.md`.
