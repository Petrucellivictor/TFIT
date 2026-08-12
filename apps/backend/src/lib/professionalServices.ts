import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, professionalServices } from "@tfit/database";
import type { ProfessionalServiceItem } from "@tfit/types";

/** Batched (not N+1) active-services lookup for a set of professionals — mirrors apps/backend/src/lib/postSummary.ts's approach. */
export async function mapActiveServicesByProfessional(
  professionalIds: string[],
): Promise<Map<string, ProfessionalServiceItem[]>> {
  if (professionalIds.length === 0) return new Map();

  const db = getDb();
  const rows = await db
    .select()
    .from(professionalServices)
    .where(and(inArray(professionalServices.professionalId, professionalIds), eq(professionalServices.isActive, true)))
    .orderBy(asc(professionalServices.order));

  const map = new Map<string, ProfessionalServiceItem[]>();
  for (const row of rows) {
    const item: ProfessionalServiceItem = {
      id: row.id,
      title: row.title,
      description: row.description,
      priceLabel: row.priceLabel,
      order: row.order,
    };
    const existing = map.get(row.professionalId);
    if (existing) existing.push(item);
    else map.set(row.professionalId, [item]);
  }
  return map;
}
