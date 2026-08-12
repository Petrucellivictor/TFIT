import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import {
  getDb,
  users,
  workoutSessions,
  workoutExercises,
  exerciseSets,
  personalRecords,
} from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonOk } from "@/lib/http";
import { awardXp, checkAndUnlockAchievements } from "@/lib/gamification";

const logSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1),
  repsCompleted: z.number().int().min(0),
  weightKg: z.number().min(0).optional(),
  feedback: z.enum(["easy", "adequate", "hard", "very_hard"]).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const { id: sessionId } = await params;
  const parsed = logSetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  const session = await db.query.workoutSessions.findFirst({
    where: and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, user.id)),
  });
  if (!session) return errors.notFound("Sessão de treino não encontrada.");
  if (session.status !== "in_progress") {
    return errors.validation("Essa sessão de treino já foi finalizada.");
  }

  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, parsed.data.workoutExerciseId),
  });
  if (!workoutExercise) return errors.notFound("Exercício não encontrado neste treino.");

  const [set] = await db
    .insert(exerciseSets)
    .values({
      sessionId: session.id,
      workoutExerciseId: workoutExercise.id,
      setNumber: parsed.data.setNumber,
      repsCompleted: parsed.data.repsCompleted,
      weightKg: parsed.data.weightKg?.toString(),
      feedback: parsed.data.feedback,
    })
    .returning();

  let isNewPersonalRecord = false;
  let xpAwarded = 0;
  let newAchievements: Awaited<ReturnType<typeof checkAndUnlockAchievements>> = [];

  if (parsed.data.weightKg !== undefined) {
    const bestRecord = await db.query.personalRecords.findFirst({
      where: and(eq(personalRecords.userId, user.id), eq(personalRecords.exerciseId, workoutExercise.exerciseId)),
      orderBy: [desc(personalRecords.weightKg), desc(personalRecords.reps)],
    });

    const bestWeight = bestRecord ? Number(bestRecord.weightKg) : -1;
    const isBetter =
      parsed.data.weightKg > bestWeight ||
      (parsed.data.weightKg === bestWeight && parsed.data.repsCompleted > (bestRecord?.reps ?? 0));

    if (isBetter && parsed.data.weightKg > 0) {
      const [newRecord] = await db
        .insert(personalRecords)
        .values({
          userId: user.id,
          exerciseId: workoutExercise.exerciseId,
          weightKg: parsed.data.weightKg.toString(),
          reps: parsed.data.repsCompleted,
        })
        .returning();
      isNewPersonalRecord = true;
      xpAwarded = await awardXp(user.id, "personal_record", newRecord!.id);
      newAchievements = await checkAndUnlockAchievements(user.id);
    }
  }

  return jsonOk({ set, isNewPersonalRecord, gamification: { xpAwarded, newAchievements } }, 201);
}
