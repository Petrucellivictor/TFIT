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

export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "forearms",
  "full_body",
  "cardio",
]);

export const exerciseLevelEnum = pgEnum("exercise_level", ["beginner", "intermediate", "advanced"]);

export const workoutPlanStatusEnum = pgEnum("workout_plan_status", ["active", "archived"]);

export const workoutSessionStatusEnum = pgEnum("workout_session_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const setFeedbackEnum = pgEnum("set_feedback", ["easy", "adequate", "hard", "very_hard"]);

export const goalTypeEnum = pgEnum("goal_type", [
  "weight_target",
  "measurement_target",
  "exercise_pr",
  "custom",
]);

export const goalStatusEnum = pgEnum("goal_status", ["active", "achieved", "abandoned"]);

export const xpReasonEnum = pgEnum("xp_reason", [
  "workout_completed",
  "checkin",
  "personal_record",
  "goal_achieved",
  "challenge_completed",
]);

export const challengeTypeEnum = pgEnum("challenge_type", [
  "workouts_count",
  "cardio_minutes",
  "streak_days",
  "custom",
]);

export const challengePeriodEnum = pgEnum("challenge_period", ["weekly", "monthly", "fixed"]);

export const challengeParticipantStatusEnum = pgEnum("challenge_participant_status", [
  "active",
  "completed",
  "failed",
]);
