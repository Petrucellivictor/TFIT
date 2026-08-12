import { and, eq } from "drizzle-orm";
import { getDb, professionalServices } from "@tfit/database";
import { professionalServiceUpdateSchema } from "@tfit/validation";
import type { MyProfessionalServiceItem } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

function toItem(row: typeof professionalServices.$inferSelect): MyProfessionalServiceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceLabel: row.priceLabel,
    order: row.order,
    isActive: row.isActive,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const parsed = professionalServiceUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const [service] = await db
    .update(professionalServices)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(professionalServices.id, id), eq(professionalServices.professionalId, result.user.id)))
    .returning();

  if (!service) return errors.notFound("Item do cardápio não encontrado.");
  return jsonOk({ service: toItem(service) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();
  const [service] = await db
    .delete(professionalServices)
    .where(and(eq(professionalServices.id, id), eq(professionalServices.professionalId, result.user.id)))
    .returning();

  if (!service) return errors.notFound("Item do cardápio não encontrado.");
  return jsonOk({ deleted: true });
}
