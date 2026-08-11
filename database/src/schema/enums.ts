import { pgEnum } from "drizzle-orm/pg-core";

export const fitnessGoalEnum = pgEnum("fitness_goal", [
  "lose_weight",
  "gain_muscle",
  "gain_strength",
  "improve_conditioning",
  "health_and_wellbeing",
  "other",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "never_trained",
  "under_6_months",
  "six_months_to_a_year",
  "one_to_two_years",
  "over_two_years",
  "currently_training",
]);

export const equipmentPreferenceEnum = pgEnum("equipment_preference", [
  "machines",
  "free_weights",
  "balanced",
  "unsure",
]);

export const unitSystemEnum = pgEnum("unit_system", ["metric", "imperial"]);

export const themePreferenceEnum = pgEnum("theme_preference", ["light", "dark", "system"]);
