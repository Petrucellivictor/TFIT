import { pgTable, uuid, integer, date, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * One row per user. Persisted (not derived) because streak freezes are a
 * spendable resource — see packages/gamification/src/streaks.ts for the
 * update logic and docs/DATABASE.md for why this differs from the Phase 3
 * check-in streak, which stayed a pure derived count.
 */
export const streaks = pgTable("streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  freezesAvailable: integer("freezes_available").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
