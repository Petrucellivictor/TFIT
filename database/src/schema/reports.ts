import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { reportTargetTypeEnum, reportStatusEnum } from "./enums";

/**
 * Records the report; a moderation queue UI is a Phase 9 admin-panel
 * concern. The Content Moderation Agent (master spec agent 13) is meant to
 * feed human review, not replace it — this table is the human-review
 * foundation that ships first, see docs/DATABASE.md.
 */
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reports_status_created_idx").on(table.status, table.createdAt)],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
