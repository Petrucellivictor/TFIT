# TFIT — AI Agent Architecture

Multi-agent, not monolithic. Every agent has its own prompt file, version, and a strict I/O contract (input schema → output schema), defined under `agents/<agent-name>/`. Implementation (real LLM calls via `packages/ai`) ships in **Phase 2** — this document and the `agents/` skeleton are the Phase 1 design artifact so later work has a fixed contract to build against.

## Non-negotiable rules for every agent (master spec §44)

No agent may: diagnose a condition, promise results, guarantee weight loss, recommend a dangerous practice, encourage overtraining, ignore reported pain, invent an exercise not in `exercise_library`, invent data, invent a source, or silently make an important change. When uncertain, an agent must emit an explicit `uncertain: true` flag rather than guess — the Orchestrator surfaces that to the Reviewer/Safety agent rather than to the end user directly.

## The rules-engine gate

```
LLM agent output → packages/fitness-engine (deterministic validation) → Safety Agent verdict → Workout Reviewer → committed to DB
```

No agent's raw output is ever written directly to `workout_plans`/`workouts`. This is enforced in code (route handlers call the rules engine, not the AI client, as the final step) — not a convention agents are asked to follow.

## Agent catalog

| # | Agent | Input | Output | Notes |
|---|---|---|---|---|
| 01 | **Orchestrator** | User context + which agents are needed | Consolidated result, conflict flags | Coordinates only; never decides a specialist question itself. |
| 02 | **Fitness Assessor** | Onboarding data (weight, height, age, goal, experience, frequency, time, preferences, limitations) | Training profile: level, priorities, limitations, recommendations | First stop after onboarding. |
| 03 | **Personal Trainer** | Training profile | Weekly split proposal: exercises, sets, reps, rest, order, notes | Proposes; does not select raw exercises (that's Agent 04). |
| 04 | **Exercise Selection Specialist** | Training profile + muscle/goal targets | List of exercise IDs from `exercise_library` | **Never invents an exercise.** Library-constrained by construction (input is a DB query, not free text). |
| 05 | **Workout Combination Specialist** | Candidate exercise list | Optimized combination (redundancy/order/fatigue/volume/recovery balanced) | |
| 06 | **Safety & Health Agent** | Reported health conditions/pain/limitations + proposed workout | `approved` / `adapt` / `blocked` + rationale | **Mandatory gate.** Never diagnoses; can require professional evaluation. |
| 07 | **Progression Agent** | Workout history (load/reps/volume over time) | Progression recommendation | |
| 08 | **Recovery Agent** | Check-ins, RPE, frequency | Recovery-driven training adjustment | |
| 09 | **Workout Reviewer** | Fully composed workout | `APPROVED` / `REJECTED` + justification/corrections | Last check before the user sees the plan. |
| 10 | **Social Agent** | User's social graph + activity | Feed/discovery/challenge relevance signals | Must not manipulate engagement abusively (master spec §26/§52). |
| 11 | **Gamification Agent** | XP/streak/challenge state | XP awards, level/streak updates, challenge suggestions | Must not incentivize overtraining. |
| 12 | **Motivation Agent** | Progress vs. goals | Contextual, non-repetitive motivational copy | |
| 13 | **Content Moderation Agent** | Post/comment content | Spam/abuse/nudity/harassment flags | Feeds the human report/review queue; never auto-bans without a review path. |
| 14 | **QA Agent** | App flows/APIs | Bug/edge-case reports | Used in CI and pre-release, not at runtime for end users. |
| 15 | **Code Review Agent** | Diffs/PRs | Bugs, duplication, architecture, vulnerabilities, perf findings | Dev-tooling agent, not user-facing. |

## Workout generation pipeline (master spec §13)

```
1. Fitness Assessor   → training profile
2. Safety Agent       → constraints/blocks
3. Personal Trainer   → draft plan
4. Exercise Selector  → concrete exercise IDs
5. Combination Spec.  → optimized ordering/volume
6. Workout Reviewer   → APPROVED | REJECTED (+ fixes, loop back to 3 if rejected)
7. Orchestrator       → consolidates
8. App                → shows plan + "why this workout" explanation (goal → split → exercises → volume → frequency)
```

## Cost/latency discipline (master spec §42)

Deterministic rules and cached assessment→plan patterns are tried before any LLM call. Every AI call logs cost, tokens, latency, and outcome (table: `ai_recommendations`/`ai_workout_reviews`, Phase 2). Model selection goes through the AI Gateway so the model string can change without a code change.

## Prompt versioning

Each `agents/<name>/` folder holds:
```
agents/<name>/
  README.md       role, input schema, output schema, hard constraints
  prompt.v1.md     the versioned, human-reviewable copy of the system prompt
```

**Revised in Phase 2**: the original plan was to have route handlers read `prompt.v1.md` from disk at request time. That doesn't survive Vercel's serverless bundling — `fs.readFileSync` with a monorepo-relative path built from `process.cwd()` isn't statically traceable, so the file silently isn't included in the deployed function and the read fails in production while working fine locally. Instead, each prompt's actual runtime value is an exported string constant in `packages/ai/src/agents/<name>.ts`, bundled normally like any other code. `prompt.v1.md` stays as the versioned copy for human review/diffing; the two are kept in sync by editing both together (a comment in each `.ts` file points back to its `.md`).
