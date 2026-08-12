import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { professionalProfiles } from "./professionalProfiles";

/**
 * A menu of offerings on a professional's directory listing — purely
 * informational (title, description, a freeform price label like "R$150"
 * or "A combinar"). No payment/checkout: contact still happens externally
 * via the professional's listed phone/WhatsApp/email/Instagram, same as
 * the rest of professional_profiles (master spec §25 — see docs/SECURITY.md).
 */
export const professionalServices = pgTable(
  "professional_services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionalProfiles.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    priceLabel: text("price_label"),
    order: integer("order").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("professional_services_professional_id_idx").on(table.professionalId)],
);

export type ProfessionalService = typeof professionalServices.$inferSelect;
export type NewProfessionalService = typeof professionalServices.$inferInsert;
