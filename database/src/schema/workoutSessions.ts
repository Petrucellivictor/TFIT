import { pgTable, uuid, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { workouts, workoutExercises } from "./workouts";
import { exerciseLibrary } from "./exerciseLibrary";
import { workoutSessionStatusEnum, setFeedbackEnum } from "./enums";

/**
 * A single instance of "doing" a workout. Together with `exercise_sets`,
 * this table IS the workout history (master spec's `workout_history` is a
 * query over these two tables, not a separate table — avoids duplicating
 * the same facts twice).
 */
export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "restrict" }),
    status: workoutSessionStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("workout_sessions_user_started_idx").on(table.userId, table.startedAt)],
);

export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    repsCompleted: integer("reps_completed").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),
    feedback: setFeedbackEnum("feedback"),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("exercise_sets_session_idx").on(table.sessionId)],
);

export const personalRecords = pgTable(
  "personal_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exerciseLibrary.id, { onDelete: "cascade" }),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).notNull(),
    reps: integer("reps").notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("personal_records_user_exercise_idx").on(table.userId, table.exerciseId)],
);

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;
export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type NewExerciseSet = typeof exerciseSets.$inferInsert;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type NewPersonalRecord = typeof personalRecords.$inferInsert;
