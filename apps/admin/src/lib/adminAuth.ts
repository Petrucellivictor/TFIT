import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * No RBAC system exists yet (docs/ARCHITECTURE.md §7) — this is an explicit
 * email allowlist checked server-side on every admin page, not a stub.
 * Same interim-solution pattern as apps/backend's Postgres rate limiter:
 * real, working, and swappable for Clerk org-based roles later without
 * changing call sites.
 */
function getAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(): Promise<{ email: string }> {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowlist = getAllowlist();

  if (!email || allowlist.length === 0 || !allowlist.includes(email)) {
    redirect("/not-authorized");
  }

  return { email };
}
