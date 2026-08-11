import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { getDb, users, profiles, userPreferences } from "@tfit/database";
import { eq } from "drizzle-orm";
import { jsonError, jsonOk } from "@/lib/http";

/**
 * Keeps our `users`/`profiles`/`user_preferences` rows in sync with Clerk,
 * which owns the actual identity/auth surface. See docs/SECURITY.md.
 */
export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return jsonError("invalid_signature", "Webhook signature verification failed.", 400);
  }

  const db = getDb();

  switch (event.type) {
    case "user.created": {
      const clerkUser = event.data;
      const [user] = await db
        .insert(users)
        .values({ clerkId: clerkUser.id })
        .onConflictDoNothing({ target: users.clerkId })
        .returning();

      const insertedUser =
        user ?? (await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) }));
      if (!insertedUser) break;

      const displayName =
        [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || "Novo atleta";
      const handle = clerkUser.username ?? `user_${insertedUser.id.slice(0, 8)}`;

      await db
        .insert(profiles)
        .values({
          userId: insertedUser.id,
          handle,
          displayName,
          avatarUrl: clerkUser.image_url ?? null,
        })
        .onConflictDoNothing({ target: profiles.userId });

      await db
        .insert(userPreferences)
        .values({ userId: insertedUser.id })
        .onConflictDoNothing({ target: userPreferences.userId });
      break;
    }
    case "user.deleted": {
      if (event.data.id) {
        await db.delete(users).where(eq(users.clerkId, event.data.id));
      }
      break;
    }
    default:
      break;
  }

  return jsonOk({ received: true });
}
