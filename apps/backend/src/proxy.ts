import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Establishes the Clerk auth context for every request. Authorization itself
 * is NOT decided here — `createRouteMatcher` + `auth.protect()` path-matching
 * is deprecated by Clerk in favor of resource-based checks (see
 * https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher).
 * Each route handler calls `auth()` itself and returns 401 if unauthenticated
 * — see docs/SECURITY.md and src/lib/http.ts `errors.unauthorized()`.
 *
 * Also applies permissive CORS headers. The native mobile app never sends an
 * `Origin` header so this is a no-op for it either way, but any browser-based
 * client (the Expo web preview, a future web client) needs it — without it,
 * the browser's CORS preflight silently blocks every write (a POST/PATCH/
 * DELETE never leaves the browser at all, even though the OPTIONS preflight
 * itself returns 204). This doesn't weaken auth: the API is bearer-token
 * authenticated (Authorization header), not cookie-based, so a third-party
 * page still can't forge a valid Clerk session token just because its origin
 * is allowed to make the request.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function withCors(response: NextResponse, origin: string | null): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", origin ?? "*");
  for (const [key, value] of Object.entries(CORS_HEADERS)) response.headers.set(key, value);
  response.headers.set("Vary", "Origin");
  return response;
}

export default clerkMiddleware((_auth, request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }), origin);
  }

  return withCors(NextResponse.next(), origin);
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
