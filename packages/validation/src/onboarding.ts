import { z } from "zod";

export const fitnessGoalSchema = z.enum([
  "lose_weight",
  "gain_muscle",
  "gain_strength",
  "improve_conditioning",
  "health_and_wellbeing",
  "other",
]);

export const experienceLevelSchema = z.enum([
  "never_trained",
  "under_6_months",
  "six_months_to_a_year",
  "one_to_two_years",
  "over_two_years",
  "currently_training",
]);

export const equipmentPreferenceSchema = z.enum(["machines", "free_weights", "balanced", "unsure"]);

export const healthDeclarationSchema = z.object({
  hasHeartConditions: z.boolean(),
  hasHighBloodPressure: z.boolean(),
  hasDiabetes: z.boolean(),
  hasJointProblems: z.boolean(),
  hasSpineProblems: z.boolean(),
  hasRecentInjuriesOrSurgeries: z.boolean(),
  hasRespiratoryProblems: z.boolean(),
  hasPainDuringExercise: z.boolean(),
  otherLimitations: z.string().trim().max(500).optional(),
});

export const onboardingPayloadSchema = z.object({
  weightKg: z.number().min(20).max(400),
  heightCm: z.number().min(80).max(260),
  age: z.number().int().min(13).max(100),
  goals: z.array(fitnessGoalSchema).min(1).max(3),
  health: healthDeclarationSchema,
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(10).max(180),
  experienceLevel: experienceLevelSchema,
  equipmentPreference: equipmentPreferenceSchema,
});

export type OnboardingPayloadInput = z.infer<typeof onboardingPayloadSchema>;
