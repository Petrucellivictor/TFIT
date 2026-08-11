import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { experienceLevelEnum, equipmentPreferenceEnum } from "./enums";

/**
 * Raw onboarding training inputs. Consumed by the Fitness Assessor agent
 * (Phase 2, docs/AGENTS.md) to derive a training profile — this table stores
 * what the user reported, not any derived recommendation.
 */
export const trainingPreferences = pgTable("training_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  daysPerWeek: integer("days_per_week").notNull(),
  minutesPerSession: integer("minutes_per_session").notNull(),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  equipmentPreference: equipmentPreferenceEnum("equipment_preference").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TrainingPreferences = typeof trainingPreferences.$inferSelect;
export type NewTrainingPreferences = typeof trainingPreferences.$inferInsert;
