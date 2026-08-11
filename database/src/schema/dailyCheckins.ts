import { pgTable, uuid, integer, boolean, text, date, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * One row per user per day (master spec §17). Recovery perception lives
 * here rather than in a separate `recovery_data` table — see docs/DATABASE.md.
 */
export const dailyCheckins = pgTable(
  "daily_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    energyLevel: integer("energy_level").notNull(),
    sleepQuality: integer("sleep_quality").notNull(),
    disposition: integer("disposition").notNull(),
    recoveryPerception: integer("recovery_perception").notNull(),
    hasPain: boolean("has_pain").notNull().default(false),
    painNotes: text("pain_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("daily_checkins_user_date_unique").on(table.userId, table.date),
    index("daily_checkins_user_date_idx").on(table.userId, table.date),
  ],
);

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type NewDailyCheckin = typeof dailyCheckins.$inferInsert;
