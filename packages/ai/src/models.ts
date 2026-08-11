/**
 * Per-agent model assignment. Plain "provider/model" strings route through
 * the Vercel AI Gateway by default (docs/ARCHITECTURE.md) — change a model
 * here without touching call sites. Cheaper/faster models are used where
 * the task is more constrained (selection from a provided list); the
 * safety-critical and quality-gate agents use the stronger default model.
 */
export const AGENT_MODELS = {
  fitnessAssessor: "anthropic/claude-sonnet-5",
  personalTrainer: "anthropic/claude-sonnet-5",
  exerciseSelector: "anthropic/claude-haiku-4.5",
  combinationSpecialist: "anthropic/claude-sonnet-5",
  safetyAgent: "anthropic/claude-sonnet-5",
  workoutReviewer: "anthropic/claude-sonnet-5",
} as const;

export type AgentName = keyof typeof AGENT_MODELS;
