import type { HealthConstraints } from "./types";

/**
 * Maps a self-reported health flag to exercise `contraindicationTags` that
 * should be blocked or flagged. This is a conservative safety mapping, not a
 * clinical one — see docs/AGENTS.md: the Safety Agent never diagnoses, and
 * this table exists to catch the exercises most commonly flagged as
 * inappropriate for each condition, not an exhaustive medical judgment.
 */
export const HEALTH_FLAG_TO_TAGS: Record<keyof HealthConstraints, string[]> = {
  hasHeartConditions: ["high-cardiovascular-intensity", "breath-holding"],
  hasHighBloodPressure: ["high-cardiovascular-intensity", "breath-holding"],
  hasDiabetes: [],
  hasJointProblems: ["high-joint-impact", "high-joint-stress"],
  hasSpineProblems: ["axial-spinal-loading"],
  hasRecentInjuriesOrSurgeries: [],
  hasRespiratoryProblems: ["high-cardiovascular-intensity"],
  hasPainDuringExercise: [],
};

/**
 * Flags that have no specific exercise tag mapping still require a blanket
 * recommendation to seek professional evaluation before starting — we can't
 * know which body part/movement is affected from a boolean alone.
 */
export const HEALTH_FLAGS_REQUIRING_PROFESSIONAL_REVIEW: (keyof HealthConstraints)[] = [
  "hasRecentInjuriesOrSurgeries",
  "hasPainDuringExercise",
];

export function activeContraindicationTags(health: HealthConstraints): string[] {
  const tags = new Set<string>();
  for (const [flag, isSet] of Object.entries(health) as [keyof HealthConstraints, boolean][]) {
    if (isSet) {
      for (const tag of HEALTH_FLAG_TO_TAGS[flag]) tags.add(tag);
    }
  }
  return [...tags];
}

export function requiresProfessionalReview(health: HealthConstraints): boolean {
  return HEALTH_FLAGS_REQUIRING_PROFESSIONAL_REVIEW.some((flag) => health[flag]);
}
