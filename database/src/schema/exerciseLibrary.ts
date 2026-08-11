import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { muscleGroupEnum, exerciseLevelEnum } from "./enums";

/**
 * The validated exercise dataset. Agents select from this table by ID —
 * they never invent an exercise (docs/AGENTS.md). Muscles/equipment/
 * contraindications are plain text[] columns rather than separate join
 * tables for now: there's no search/filter UI yet that needs normalized
 * querying, and premature normalization isn't worth the complexity (see
 * docs/DATABASE.md). Revisit if/when exercise search needs it.
 */
export const exerciseLibrary = pgTable(
  "exercise_library",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    primaryMuscle: muscleGroupEnum("primary_muscle").notNull(),
    secondaryMuscles: muscleGroupEnum("secondary_muscles").array().notNull().default([]),
    equipment: text("equipment").notNull(),
    level: exerciseLevelEnum("level").notNull(),
    instructions: text("instructions").notNull(),
    commonMistakes: text("common_mistakes"),
    /** Tags matched against health flags by packages/fitness-engine — see contraindications.ts. */
    contraindicationTags: text("contraindication_tags").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("exercise_library_primary_muscle_idx").on(table.primaryMuscle)],
);

export type ExerciseLibraryRow = typeof exerciseLibrary.$inferSelect;
export type NewExerciseLibraryRow = typeof exerciseLibrary.$inferInsert;
