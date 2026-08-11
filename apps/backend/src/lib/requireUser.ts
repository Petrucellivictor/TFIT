import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, users, type User } from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors } from "./http";

type RequireUserResult = { user: User } | { errorResponse: Response };

/**
 * Shared auth + user-lookup for route handlers. Introduced for Phase 3
 * routes to stop re-deriving this in every handler; Phase 1/2 routes keep
 * their inline version rather than being churned for consistency's sake.
 */
export async function requireUser(): Promise<RequireUserResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { errorResponse: errors.unauthorized() };

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return { errorResponse: errors.notFound(ACCOUNT_PROVISIONING_MESSAGE) };

  return { user };
}
