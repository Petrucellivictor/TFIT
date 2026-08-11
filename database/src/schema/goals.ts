import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { fitnessGoalEnum } from "./enums";

export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goal: fitnessGoalEnum("goal").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserGoal = typeof userGoals.$inferSelect;
export type NewUserGoal = typeof userGoals.$inferInsert;
