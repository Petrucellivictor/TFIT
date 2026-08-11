export type FitnessGoal =
  | "lose_weight"
  | "gain_muscle"
  | "gain_strength"
  | "improve_conditioning"
  | "health_and_wellbeing"
  | "other";

export type ExperienceLevel =
  | "never_trained"
  | "under_6_months"
  | "six_months_to_a_year"
  | "one_to_two_years"
  | "over_two_years"
  | "currently_training";

export type EquipmentPreference = "machines" | "free_weights" | "balanced" | "unsure";

/**
 * Self-reported, never a diagnosis. See docs/SECURITY.md — high-sensitivity data.
 */
export interface HealthDeclaration {
  hasHeartConditions: boolean;
  hasHighBloodPressure: boolean;
  hasDiabetes: boolean;
  hasJointProblems: boolean;
  hasSpineProblems: boolean;
  hasRecentInjuriesOrSurgeries: boolean;
  hasRespiratoryProblems: boolean;
  hasPainDuringExercise: boolean;
  otherLimitations?: string;
}

export interface OnboardingPayload {
  weightKg: number;
  heightCm: number;
  age: number;
  goals: FitnessGoal[];
  health: HealthDeclaration;
  daysPerWeek: number;
  minutesPerSession: number;
  experienceLevel: ExperienceLevel;
  equipmentPreference: EquipmentPreference;
}

export interface OnboardingStepDefinition {
  key: "physical" | "goal" | "health" | "frequency" | "time" | "experience" | "preference";
  titlePtBr: string;
}

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  { key: "physical", titlePtBr: "Seus dados" },
  { key: "goal", titlePtBr: "Seu objetivo" },
  { key: "health", titlePtBr: "Sua saúde" },
  { key: "frequency", titlePtBr: "Frequência" },
  { key: "time", titlePtBr: "Tempo disponível" },
  { key: "experience", titlePtBr: "Experiência" },
  { key: "preference", titlePtBr: "Preferência" },
];
