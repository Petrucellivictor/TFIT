import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { onboardingPayloadSchema } from "@tfit/validation";
import {
  getDb,
  users,
  userGoals,
  userHealthProfiles,
  trainingPreferences,
  bodyMetrics,
  auditLogs,
} from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const parsed = onboardingPayloadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return errors.validation(parsed.error.issues[0]?.message ?? "Invalid onboarding data.");
  }
  const input = parsed.data;

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound("Your account is still being set up. Try again in a moment.");

  await db.transaction(async (tx) => {
    await tx
      .insert(userHealthProfiles)
      .values({ userId: user.id, ...input.health })
      .onConflictDoUpdate({
        target: userHealthProfiles.userId,
        set: { ...input.health, updatedAt: new Date() },
      });

    await tx
      .insert(trainingPreferences)
      .values({
        userId: user.id,
        daysPerWeek: input.daysPerWeek,
        minutesPerSession: input.minutesPerSession,
        experienceLevel: input.experienceLevel,
        equipmentPreference: input.equipmentPreference,
      })
      .onConflictDoUpdate({
        target: trainingPreferences.userId,
        set: {
          daysPerWeek: input.daysPerWeek,
          minutesPerSession: input.minutesPerSession,
          experienceLevel: input.experienceLevel,
          equipmentPreference: input.equipmentPreference,
          updatedAt: new Date(),
        },
      });

    await tx.insert(bodyMetrics).values({
      userId: user.id,
      weightKg: input.weightKg.toString(),
      heightCm: input.heightCm.toString(),
      age: input.age,
    });

    await tx.delete(userGoals).where(eq(userGoals.userId, user.id));
    await tx.insert(userGoals).values(input.goals.map((goal) => ({ userId: user.id, goal })));

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "onboarding_completed",
    });
  });

  return jsonOk({ onboardingCompleted: true });
}
