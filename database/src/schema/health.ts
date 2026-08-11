import { pgTable, uuid, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Self-reported flags from onboarding — never a diagnosis. High-sensitivity:
 * see docs/SECURITY.md. Only the owning user's session may read this table.
 */
export const userHealthProfiles = pgTable("user_health_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  hasHeartConditions: boolean("has_heart_conditions").notNull().default(false),
  hasHighBloodPressure: boolean("has_high_blood_pressure").notNull().default(false),
  hasDiabetes: boolean("has_diabetes").notNull().default(false),
  hasJointProblems: boolean("has_joint_problems").notNull().default(false),
  hasSpineProblems: boolean("has_spine_problems").notNull().default(false),
  hasRecentInjuriesOrSurgeries: boolean("has_recent_injuries_or_surgeries").notNull().default(false),
  hasRespiratoryProblems: boolean("has_respiratory_problems").notNull().default(false),
  hasPainDuringExercise: boolean("has_pain_during_exercise").notNull().default(false),
  otherLimitations: text("other_limitations"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserHealthProfile = typeof userHealthProfiles.$inferSelect;
export type NewUserHealthProfile = typeof userHealthProfiles.$inferInsert;
