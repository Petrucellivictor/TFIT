# Fitness Assessor

**Status:** design contract only (Phase 1). LLM implementation lands in Phase 2 as `prompt.v1.md` + a handler in `packages/ai`.

## Input

Onboarding data: weight, height, age, goal, experience, frequency, time available, preferences, limitations

## Output

Training profile: level, priorities, limitations, recommendations

## Hard constraint

Never treats BMI or any metric as a diagnosis.

Also bound by the global agent rules in `docs/AGENTS.md` (no diagnosis, no guaranteed outcomes, no invented exercises/data/sources, no silent important changes, surface uncertainty explicitly).
