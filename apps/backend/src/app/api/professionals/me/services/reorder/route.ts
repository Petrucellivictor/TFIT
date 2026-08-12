import { and, eq, inArray } from "drizzle-orm";
import { getDb, professionalServices } from "@tfit/database";
import { reorderProfessionalServicesSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = reorderProfessionalServicesSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const { orderedIds } = parsed.data;

  const owned = await db
    .select({ id: professionalServices.id })
    .from(professionalServices)
    .where(and(inArray(professionalServices.id, orderedIds), eq(professionalServices.professionalId, result.user.id)));

  if (owned.length !== orderedIds.length) return errors.validation("Um ou mais itens não pertencem ao seu cardápio.");

  await db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, index) =>
        tx
          .update(professionalServices)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(professionalServices.id, id)),
      ),
    );
  });

  return jsonOk({ reordered: true });
}
