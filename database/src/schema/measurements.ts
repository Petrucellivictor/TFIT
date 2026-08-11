import { pgTable, uuid, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Body circumference time series — distinct from `body_metrics` (weight/
 * height/body fat). All columns nullable: log whichever you measured.
 */
export const measurements = pgTable(
  "measurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    waistCm: numeric("waist_cm", { precision: 5, scale: 1 }),
    chestCm: numeric("chest_cm", { precision: 5, scale: 1 }),
    hipCm: numeric("hip_cm", { precision: 5, scale: 1 }),
    armCm: numeric("arm_cm", { precision: 5, scale: 1 }),
    thighCm: numeric("thigh_cm", { precision: 5, scale: 1 }),
    calfCm: numeric("calf_cm", { precision: 5, scale: 1 }),
    shoulderCm: numeric("shoulder_cm", { precision: 5, scale: 1 }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("measurements_user_recorded_idx").on(table.userId, table.recordedAt)],
);

export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
