import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, users, profiles, userPreferences, userGoals, trainingPreferences } from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonOk } from "@/lib/http";
import type { MeResponse } from "@tfit/types";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  const [profile, preferences, goals, training] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) }),
    db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, user.id) }),
    db.query.userGoals.findMany({ where: eq(userGoals.userId, user.id) }),
    db.query.trainingPreferences.findFirst({ where: eq(trainingPreferences.userId, user.id) }),
  ]);

  if (!profile || !preferences) {
    return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);
  }

  const response: MeResponse = {
    user: { id: user.id, clerkId: user.clerkId, createdAt: user.createdAt.toISOString() },
    profile: {
      userId: profile.userId,
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      isPrivate: profile.isPrivate,
    },
    preferences: {
      userId: preferences.userId,
      unitSystem: preferences.unitSystem,
      theme: preferences.theme,
      notificationsEnabled: preferences.notificationsEnabled,
    },
    goals: goals.map((g) => ({ id: g.id, userId: g.userId, goal: g.goal, createdAt: g.createdAt.toISOString() })),
    onboardingCompleted: Boolean(training),
    experienceLevel: training?.experienceLevel ?? null,
    equipmentPreference: training?.equipmentPreference ?? null,
  };

  return jsonOk(response);
}
