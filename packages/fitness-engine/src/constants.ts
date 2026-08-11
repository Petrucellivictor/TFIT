/**
 * Conservative safety bounds, not a precise optimization target. These exist
 * to catch AI-proposed workouts that are structurally unsafe or nonsensical
 * — they are a floor, not a claim about the single "correct" programming
 * approach. See docs/AGENTS.md §"The rules-engine gate".
 */
export const LIMITS = {
  setsPerExercise: { min: 1, max: 6 },
  repsPerSet: { min: 1, max: 30 },
  restSeconds: { min: 15, max: 300 },
  exercisesPerWorkout: { min: 2, max: 12 },
  /** Hard ceiling on weekly sets for a single muscle group, across all workouts in the plan. */
  weeklySetsPerMuscleGroupMax: 25,
  /** Duration tolerance vs. the user's stated minutesPerSession, as a fraction (0.4 = ±40%). */
  sessionDurationTolerance: 0.4,
  /** Rough per-set time budget used to estimate session duration: work + rest. */
  secondsPerRepEstimate: 3,
};
