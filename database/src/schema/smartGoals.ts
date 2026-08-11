import { pgTable, uuid, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { exerciseLibrary } from "./exerciseLibrary";
import { goalTypeEnum, goalStatusEnum } from "./enums";

/**
 * User-defined SMART goals (e.g. "bench press 100kg by December"). Distinct
 * from `user_goals` (the Phase 1 onboarding objective picklist) — see
 * docs/DATABASE.md.
 */
export const smartGoals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  goalType: goalTypeEnum("goal_type").notNull(),
  targetValue: numeric("target_value", { precision: 8, scale: 2 }),
  exerciseId: uuid("exercise_id").references(() => exerciseLibrary.id, { onDelete: "set null" }),
  targetDate: date("target_date"),
  status: goalStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  achievedAt: timestamp("achieved_at", { withTimezone: true }),
});

export type SmartGoal = typeof smartGoals.$inferSelect;
export type NewSmartGoal = typeof smartGoals.$inferInsert;
