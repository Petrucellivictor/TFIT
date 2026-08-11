import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { exerciseLibrary } from "./exerciseLibrary";
import { workoutPlanStatusEnum } from "./enums";

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    splitName: text("split_name").notNull(),
    daysPerWeek: integer("days_per_week").notNull(),
    status: workoutPlanStatusEnum("status").notNull().default("active"),
    /** The "why this workout" explanation shown to the user — see master spec §13. */
    reasoning: text("reasoning").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("workout_plans_user_status_idx").on(table.userId, table.status)],
);

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exerciseLibrary.id, { onDelete: "restrict" }),
    order: integer("order").notNull(),
    sets: integer("sets").notNull(),
    repsMin: integer("reps_min").notNull(),
    repsMax: integer("reps_max").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    notes: text("notes"),
  },
  (table) => [index("workout_exercises_workout_order_idx").on(table.workoutId, table.order)],
);

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
