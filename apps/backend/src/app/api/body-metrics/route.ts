import { desc, eq } from "drizzle-orm";
import { getDb, bodyMetrics } from "@tfit/database";
import { bodyMetricInputSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select()
    .from(bodyMetrics)
    .where(eq(bodyMetrics.userId, result.user.id))
    .orderBy(desc(bodyMetrics.recordedAt))
    .limit(90);

  return jsonOk({ bodyMetrics: rows });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = bodyMetricInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const [entry] = await db
    .insert(bodyMetrics)
    .values({
      userId: result.user.id,
      weightKg: parsed.data.weightKg.toString(),
      bodyFatPercent: parsed.data.bodyFatPercent?.toString(),
    })
    .returning();

  return jsonOk({ bodyMetric: entry }, 201);
}
