# TFIT — Skills Catalog

Skills are reference knowledge modules consumed by both developers and agents. Each lives at `skills/<category>/<skill>/README.md` and, once populated, follows this structure (master spec §11):

```
Objetivo (goal)
Contexto (context)
Regras (rules)
Boas práticas (best practices)
Anti-patterns
Exemplos (examples)
Critérios de qualidade (quality criteria)
```

**Phase 1 status**: folder skeleton created for every skill named in the master spec, each with a placeholder README stating its scope. Content is populated incrementally, in the phase where that domain is actually built — a skill written before its domain exists would drift out of sync with the real implementation. Track population status per skill below.

Folders are flat top-level names under `skills/`, matching the master spec exactly (not nested).

## Fitness science

| Skill | Populate in | Status |
|---|---|---|
| `fitness-science/` | Phase 2 | placeholder |
| `workout-programming/` | Phase 2 | placeholder |
| `hypertrophy/` | Phase 2 | placeholder |
| `strength-training/` | Phase 2 | placeholder |
| `weight-loss/` | Phase 2 | placeholder |
| `conditioning/` | Phase 2 | placeholder |
| `beginner-training/` | Phase 2 | placeholder |
| `exercise-selection/` | Phase 2 | placeholder |
| `exercise-safety/` | Phase 2 | placeholder |
| `progression/` | Phase 2/3 | placeholder |
| `recovery/` | Phase 3 | placeholder |
| `anatomy/` | Phase 2 | placeholder |
| `mobility/` | Phase 2 | placeholder |
| `exercise-library/` | Phase 2 | placeholder |
| `workout-review/` | Phase 2 | placeholder |

## Engineering

| Skill | Populate in | Status |
|---|---|---|
| `mobile-development/` | Phase 1 (this pass — see ARCHITECTURE.md instead of duplicating) | seeded via docs |
| `frontend-architecture/` | Phase 1 | seeded via docs |
| `backend-architecture/` | Phase 1 | seeded via docs |
| `database-design/` | Phase 1 | seeded via docs |
| `api-design/` | Phase 1/2 | placeholder |
| `security/` | Phase 1 (see `SECURITY.md`) | seeded via docs |
| `privacy/` | Phase 1 (see `SECURITY.md`) | seeded via docs |
| `authentication/` | Phase 1 | seeded via docs |
| `performance/` | Phase 8 | placeholder |
| `testing/` | Phase 8 (started earlier per-feature) | placeholder |
| `devops/` | Phase 1 (see `DEPLOYMENT.md`) | seeded via docs |

## Design

| Skill | Populate in | Status |
|---|---|---|
| `ux-design/` | Phase 1 | seeded via `DESIGN_SYSTEM.md` |
| `ui-design/` | Phase 1 | seeded via `DESIGN_SYSTEM.md` |
| `design-system/` | Phase 1 | seeded via `DESIGN_SYSTEM.md` |
| `motion-design/` | Phase 6 | placeholder |
| `3d-design/` | Phase 6 | placeholder |
| `accessibility/` | Phase 8 (baseline in Phase 1) | placeholder |
| `gamification/` | Phase 4 | placeholder |
| `social-product/` | Phase 5 | placeholder |
| `notifications/` | Phase 4/5 | placeholder |

## AI

| Skill | Populate in | Status |
|---|---|---|
| `ai-orchestration/` | Phase 2 (contract defined now in `AGENTS.md`) | seeded via docs |
| `prompt-engineering/` | Phase 2 | placeholder |
| `agent-design/` | Phase 2 (contract defined now in `AGENTS.md`) | seeded via docs |
| `rag/` | Not yet scheduled — no retrieval-augmented use case identified before Phase 2 exercise library search | placeholder |
| `ai-evaluation/` | Phase 2 | placeholder |

Skills marked "seeded via docs" should be treated as populated by the corresponding top-level doc until their dedicated skill file is written; don't duplicate content, link to it.
