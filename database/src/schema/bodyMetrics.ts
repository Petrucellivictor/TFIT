import { pgTable, uuid, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const bodyMetrics = pgTable(
  "body_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
    bodyFatPercent: numeric("body_fat_percent", { precision: 4, scale: 1 }),
    /** Self-reported age at the time of this measurement (onboarding collects age, not a birth date). */
    age: integer("age"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("body_metrics_user_recorded_idx").on(table.userId, table.recordedAt)],
);

export type BodyMetric = typeof bodyMetrics.$inferSelect;
export type NewBodyMetric = typeof bodyMetrics.$inferInsert;
