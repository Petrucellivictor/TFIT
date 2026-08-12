import { getDb, reports } from "@tfit/database";
import { createReportSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { isReportRateLimited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  if (await isReportRateLimited(result.user.id)) return errors.rateLimited("Você atingiu o limite de denúncias por hora.");

  const parsed = createReportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  await db.insert(reports).values({
    reporterId: result.user.id,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  return jsonOk({ reported: true }, 201);
}
