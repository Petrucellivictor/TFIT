import { eq } from "drizzle-orm";
import { getDb, profiles } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { buildPublicProfile } from "@/lib/social";

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { handle } = await params;
  const db = getDb();
  const target = await db.query.profiles.findFirst({ where: eq(profiles.handle, handle.toLowerCase()) });
  if (!target) return errors.notFound("Usuário não encontrado.");

  const profile = await buildPublicProfile(target, result.user.id);
  return jsonOk({ profile });
}
