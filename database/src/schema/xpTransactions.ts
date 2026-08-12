import { pgTable, uuid, integer, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { xpReasonEnum } from "./enums";

/**
 * Append-only XP ledger. Total XP = sum(amount) for a user — never a cached
 * counter, so it's always re-derivable and auditable. The unique constraint
 * on (user_id, reason, reference_id) makes double-granting XP for the same
 * source event structurally impossible (master spec §52 anti-abuse).
 */
export const xpTransactions = pgTable(
  "xp_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: xpReasonEnum("reason").notNull(),
    /** The row that earned this XP (a workout_session id, checkin id, etc.) — polymorphic, not a real FK. */
    referenceId: uuid("reference_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("xp_transactions_dedupe_unique").on(table.userId, table.reason, table.referenceId),
    index("xp_transactions_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type NewXpTransaction = typeof xpTransactions.$inferInsert;
