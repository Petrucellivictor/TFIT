import { asc, count, eq } from "drizzle-orm";
import { getDb, professionalProfiles, professionalServices } from "@tfit/database";
import { professionalServiceInputSchema } from "@tfit/validation";
import type { MyProfessionalServiceItem } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { isServiceCreateRateLimited } from "@/lib/rateLimit";

const MAX_SERVICES = 20;

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

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select()
    .from(professionalServices)
    .where(eq(professionalServices.professionalId, result.user.id))
    .orderBy(asc(professionalServices.order));

  return jsonOk({ services: rows.map(toItem) });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  if (await isServiceCreateRateLimited(result.user.id)) return errors.rateLimited("Você atingiu o limite de itens criados por hora.");

  const parsed = professionalServiceInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();

  const ownProfile = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.userId, result.user.id),
  });
  if (!ownProfile) return errors.validation("Cadastre seu perfil profissional antes de adicionar itens ao cardápio.");

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(professionalServices)
    .where(eq(professionalServices.professionalId, result.user.id));
  if (existingCount >= MAX_SERVICES) return errors.validation(`Limite de ${MAX_SERVICES} itens no cardápio.`);

  const [service] = await db
    .insert(professionalServices)
    .values({ professionalId: result.user.id, ...parsed.data, order: existingCount + 1 })
    .returning();

  return jsonOk({ service: toItem(service!) }, 201);
}
