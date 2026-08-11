import { Webhook } from "svix";
import { headers } from "next/headers";
import { getDb, users, profiles, userPreferences } from "@tfit/database";
import { eq } from "drizzle-orm";
import { jsonError, jsonOk } from "@/lib/http";

interface ClerkUserPayload {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

/**
 * Keeps our `users`/`profiles`/`user_preferences` rows in sync with Clerk,
 * which owns the actual identity/auth surface. See docs/SECURITY.md.
 */
export async function POST(req: Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    return jsonError("misconfigured", "Webhook signing secret is not configured.", 500);
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return jsonError("invalid_signature", "Missing svix headers.", 400);
  }

  const body = await req.text();
  const webhook = new Webhook(signingSecret);

  let event: { type: string; data: ClerkUserPayload };
  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
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
          avatarUrl: clerkUser.image_url,
        })
        .onConflictDoNothing({ target: profiles.userId });

      await db
        .insert(userPreferences)
        .values({ userId: insertedUser.id })
        .onConflictDoNothing({ target: userPreferences.userId });
      break;
    }
    case "user.deleted": {
      const clerkUser = event.data;
      await db.delete(users).where(eq(users.clerkId, clerkUser.id));
      break;
    }
    default:
      break;
  }

  return jsonOk({ received: true });
}
