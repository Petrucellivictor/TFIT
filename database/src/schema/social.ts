import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { followerStatusEnum } from "./enums";

/**
 * Covers both the master spec's `followers` and `friendships`: a "friend"
 * is a pair of mutual `accepted` rows, computed in packages/social rather
 * than stored — see docs/DATABASE.md.
 */
export const followers = pgTable(
  "followers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followedId: uuid("followed_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: followerStatusEnum("status").notNull().default("accepted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("followers_follower_followed_unique").on(table.followerId, table.followedId),
    index("followers_followed_status_idx").on(table.followedId, table.status),
    index("followers_follower_status_idx").on(table.followerId, table.status),
  ],
);

export const blockedUsers = pgTable(
  "blocked_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("blocked_users_pair_unique").on(table.blockerId, table.blockedId)],
);

export type Follower = typeof followers.$inferSelect;
export type NewFollower = typeof followers.$inferInsert;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type NewBlockedUser = typeof blockedUsers.$inferInsert;
