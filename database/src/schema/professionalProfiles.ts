import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Self-registered trainer directory listing — a contact directory, not a
 * marketplace. Deliberately has no "verified" flag: the master spec warns
 * against building professional features that imply credential validation
 * without first structuring real verification (master spec §25). All
 * fields here are exactly what the professional entered; the client is
 * expected to show a disclaimer to that effect (see docs/SECURITY.md).
 */
export const professionalProfiles = pgTable("professional_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  city: text("city"),
  contactPhone: text("contact_phone"),
  contactWhatsapp: text("contact_whatsapp"),
  contactInstagram: text("contact_instagram"),
  contactEmail: text("contact_email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type NewProfessionalProfile = typeof professionalProfiles.$inferInsert;
