import { pgTable, uuid, text, integer, boolean, date, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { challengeTypeEnum, challengePeriodEnum, challengeParticipantStatusEnum } from "./enums";

/**
 * Phase 4 only ships system-created public challenges anyone can join solo
 * — friend-vs-friend challenges need the Phase 5 social graph. `is_public`
 * and a nullable `created_by` are already here so Phase 5 can add
 * user-created challenges without a schema change.
 */
export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: challengeTypeEnum("type").notNull(),
  targetValue: integer("target_value").notNull(),
  period: challengePeriodEnum("period").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeParticipants = pgTable(
  "challenge_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    progressValue: integer("progress_value").notNull().default(0),
    status: challengeParticipantStatusEnum("status").notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    unique("challenge_participants_challenge_user_unique").on(table.challengeId, table.userId),
    index("challenge_participants_user_idx").on(table.userId),
  ],
);

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type NewChallengeParticipant = typeof challengeParticipants.$inferInsert;
