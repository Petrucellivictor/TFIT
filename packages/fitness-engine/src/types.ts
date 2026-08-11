/**
 * Pure domain types for the deterministic rules engine. No DB dependency —
 * callers (packages/ai, the backend) fetch exercise metadata and pass it in.
 * See docs/AGENTS.md "The rules-engine gate".
 */

export interface ExercisePrescription {
  exerciseId: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDraft {
  name: string;
  dayOfWeek: number; // 1-7
  exercises: ExercisePrescription[];
}

export interface WorkoutPlanDraft {
  splitName: string;
  daysPerWeek: number;
  workouts: WorkoutDraft[];
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "forearms"
  | "full_body"
  | "cardio";

export interface ExerciseMeta {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: string;
  level: "beginner" | "intermediate" | "advanced";
  contraindicationTags: string[];
}

export interface HealthConstraints {
  hasHeartConditions: boolean;
  hasHighBloodPressure: boolean;
  hasDiabetes: boolean;
  hasJointProblems: boolean;
  hasSpineProblems: boolean;
  hasRecentInjuriesOrSurgeries: boolean;
  hasRespiratoryProblems: boolean;
  hasPainDuringExercise: boolean;
}

export interface TrainingContext {
  daysPerWeek: number;
  minutesPerSession: number;
  experienceLevel:
    | "never_trained"
    | "under_6_months"
    | "six_months_to_a_year"
    | "one_to_two_years"
    | "over_two_years"
    | "currently_training";
}

export type RuleSeverity = "block" | "warn";

export interface RuleViolation {
  code: string;
  severity: RuleSeverity;
  message: string;
  exerciseId?: string;
}

export interface RuleEngineVerdict {
  approved: boolean;
  violations: RuleViolation[];
}
