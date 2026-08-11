import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, users } from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonOk } from "@/lib/http";
import { getActiveWorkoutPlan } from "@/lib/workoutPlanDetail";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  const plan = await getActiveWorkoutPlan(user.id);
  return jsonOk({ plan });
}
