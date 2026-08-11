/**
 * FIT Score (master spec §19) — a transparent, heuristic engagement/
 * evolution indicator, NOT a medical or fitness-diagnostic score. Every
 * sub-score is a simple, explainable ratio so the number is always
 * traceable back to real behavior, never a black box.
 */

export interface FitScoreInput {
  /** Completed workout sessions in the last 4 weeks. */
  completedSessionsLast4Weeks: number;
  /** Workouts the active plan calls for per week × 4, i.e. the adherence denominator. */
  plannedSessionsLast4Weeks: number;
  /** Daily check-ins submitted in the last 30 days (0-30). */
  checkinsLast30Days: number;
  /** Average of recoveryPerception (1-5) across check-ins in the last 14 days; null if none logged. */
  avgRecoveryPerceptionLast14Days: number | null;
  /** New personal records achieved in the last 90 days. */
  newPersonalRecordsLast90Days: number;
}

export interface FitScoreBreakdown {
  overall: number;
  consistency: number;
  training: number;
  evolution: number;
  habits: number;
  recovery: number;
}

function clampToScore(ratio: number): number {
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

/**
 * Full training-volume score at ~3 sessions/week over 4 weeks (12 sessions)
 * — an intentionally simple baseline, not a claim about the "correct"
 * frequency for any given goal.
 */
const FULL_TRAINING_SESSIONS_PER_4_WEEKS = 12;
/** Full evolution score at 3+ new PRs in a rolling 90-day window. */
const FULL_EVOLUTION_PRS_PER_90_DAYS = 3;

export function computeFitScore(input: FitScoreInput): FitScoreBreakdown {
  const consistency =
    input.plannedSessionsLast4Weeks > 0
      ? clampToScore(input.completedSessionsLast4Weeks / input.plannedSessionsLast4Weeks)
      : 0;

  const training = clampToScore(input.completedSessionsLast4Weeks / FULL_TRAINING_SESSIONS_PER_4_WEEKS);

  const evolution = clampToScore(input.newPersonalRecordsLast90Days / FULL_EVOLUTION_PRS_PER_90_DAYS);

  const habits = clampToScore(input.checkinsLast30Days / 30);

  const recovery =
    input.avgRecoveryPerceptionLast14Days === null
      ? 50
      : clampToScore((input.avgRecoveryPerceptionLast14Days - 1) / 4);

  const overall = Math.round((consistency + training + evolution + habits + recovery) / 5);

  return { overall, consistency, training, evolution, habits, recovery };
}
