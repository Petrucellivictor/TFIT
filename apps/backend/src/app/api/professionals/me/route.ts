import { eq } from "drizzle-orm";
import { getDb, professionalProfiles } from "@tfit/database";
import { professionalProfileInputSchema } from "@tfit/validation";
import type { MyProfessionalProfile } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

function toResponse(row: typeof professionalProfiles.$inferSelect): MyProfessionalProfile {
  return {
    specialty: row.specialty,
    bio: row.bio,
    city: row.city,
    contactPhone: row.contactPhone,
    contactWhatsapp: row.contactWhatsapp,
    contactInstagram: row.contactInstagram,
    contactEmail: row.contactEmail,
    isActive: row.isActive,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const profile = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.userId, result.user.id),
  });

  return jsonOk({ profile: profile ? toResponse(profile) : null });
}

export async function PUT(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = professionalProfileInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const [profile] = await db
    .insert(professionalProfiles)
    .values({ userId: result.user.id, ...parsed.data, isActive: true })
    .onConflictDoUpdate({
      target: professionalProfiles.userId,
      set: { ...parsed.data, isActive: true, updatedAt: new Date() },
    })
    .returning();

  return jsonOk({ profile: toResponse(profile!) });
}

export async function DELETE() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const existing = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.userId, result.user.id),
  });
  if (!existing) return errors.notFound("Você ainda não tem um perfil profissional.");

  const [profile] = await db
    .update(professionalProfiles)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(professionalProfiles.userId, result.user.id))
    .returning();

  return jsonOk({ profile: toResponse(profile!) });
}
