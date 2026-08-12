import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

/**
 * Sweeps every route handler under src/app/api and asserts it rejects an
 * unauthenticated request with 401 — the single most security-critical
 * invariant in this codebase (every prior phase's "did I forget
 * requireUser()?" mistake would be a real vulnerability, not just a bug).
 * Doesn't need a database: requireUser()/auth() return before any handler
 * touches getDb(), so mocking Clerk's `auth()` alone is sufficient.
 */
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: null })),
}));

const API_DIR = join(__dirname, "app/api");
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// Routes that intentionally don't gate on a Clerk session — see their own
// dedicated assertions below instead of the blanket 401 sweep.
const EXCLUDED = new Set(["health/route.ts", "webhooks/clerk/route.ts"]);

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) files.push(...findRouteFiles(fullPath));
    else if (entry === "route.ts") files.push(fullPath);
  }
  return files;
}

const routeFiles = findRouteFiles(API_DIR).filter(
  (file) => !EXCLUDED.has(relative(API_DIR, file).replace(/\\/g, "/")),
);

function makeRequest(method: string): Request {
  const hasBody = method !== "GET" && method !== "DELETE";
  return new Request("http://localhost/api/test", {
    method,
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? "{}" : undefined,
  });
}

const DUMMY_PARAMS = Promise.resolve({
  id: "00000000-0000-0000-0000-000000000000",
  userId: "00000000-0000-0000-0000-000000000000",
  handle: "dummyhandle",
});

describe("every route rejects an unauthenticated request", () => {
  it("found a non-trivial number of route files to check", () => {
    expect(routeFiles.length).toBeGreaterThan(40);
  });

  for (const file of routeFiles) {
    const label = relative(API_DIR, file).replace(/\\/g, "/");

    it(label, async () => {
      const mod: Record<string, unknown> = await import(pathToFileURL(file).href);
      const methodsInModule = HTTP_METHODS.filter((m) => typeof mod[m] === "function");
      expect(methodsInModule.length, `${label} exports no recognized HTTP method handler`).toBeGreaterThan(0);

      for (const method of methodsInModule) {
        const handler = mod[method] as (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
        const response = await handler(makeRequest(method), { params: DUMMY_PARAMS });
        expect(response.status, `${method} ${label} should return 401 when unauthenticated`).toBe(401);
      }
    });
  }
});

describe("explicitly excluded routes", () => {
  it("GET /api/health returns 200 without auth (liveness check, no session required)", async () => {
    const mod = await import("./app/api/health/route");
    const response = await mod.GET();
    expect(response.status).toBe(200);
  });

  it("POST /api/webhooks/clerk rejects a request with no valid svix signature (400, not 401 — it's not Clerk-session-gated)", async () => {
    const mod = await import("./app/api/webhooks/clerk/route");
    const response = await mod.POST(makeRequest("POST") as unknown as import("next/server").NextRequest);
    expect(response.status).toBe(400);
  });
});
