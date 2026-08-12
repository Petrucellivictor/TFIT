import { pgTable, uuid, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Badge catalog — content data, seeded like exercise_library. Unlock logic
 * lives in packages/gamification/src/achievements.ts, keyed by
 * `criteria_type`/`criteria_value` (e.g. {type: "workouts_completed",
 * value: 10} for "10 treinos").
 */
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteriaType: text("criteria_type").notNull(),
  criteriaValue: integer("criteria_value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("user_achievements_user_achievement_unique").on(table.userId, table.achievementId)],
);

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
