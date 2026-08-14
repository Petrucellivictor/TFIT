import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { exerciseLibrary } from "./exerciseLibrary";

/**
 * One 3D animation clip per exercise (v1: exactly one, hence the unique
 * constraint — revisit if multi-angle variants are ever needed). The clip
 * is retargeted onto a single shared character skeleton whose asset URL
 * lives as a mobile-side constant, not here — changing the base character
 * means re-authoring every clip against a new skeleton, so it's a code
 * concern, not independent content.
 */
export const exerciseAnimations = pgTable("exercise_animations", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .unique()
    .references(() => exerciseLibrary.id, { onDelete: "cascade" }),
  animationUrl: text("animation_url").notNull(),
  format: text("format").notNull(),
  sourceNotes: text("source_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ExerciseAnimationRow = typeof exerciseAnimations.$inferSelect;
export type NewExerciseAnimationRow = typeof exerciseAnimations.$inferInsert;
