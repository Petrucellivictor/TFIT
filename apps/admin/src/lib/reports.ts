import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, posts, postComments, profiles, reports } from "@tfit/database";

export type ReportStatusFilter = "pending" | "reviewed" | "dismissed" | "all";

export type ReportStatusCounts = Record<ReportStatusFilter, number>;

export interface ReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "dismissed";
  targetType: "post" | "comment" | "user";
  targetId: string;
  createdAt: string;
  reporter: { handle: string; displayName: string } | null;
  targetSummary: string;
}

export async function countReportsByStatus(): Promise<ReportStatusCounts> {
  const db = getDb();
  const rows = await db
    .select({ status: reports.status, count: sql<number>`count(*)::int` })
    .from(reports)
    .groupBy(reports.status);

  const counts: ReportStatusCounts = { pending: 0, reviewed: 0, dismissed: 0, all: 0 };
  for (const row of rows) {
    counts[row.status] = row.count;
    counts.all += row.count;
  }
  return counts;
}

/** Batched (not N+1) — same pattern as apps/backend's postSummary/professionalServices helpers. */
export async function listReports(status: ReportStatusFilter): Promise<ReportRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(reports)
    .where(status === "all" ? undefined : eq(reports.status, status))
    .orderBy(desc(reports.createdAt))
    .limit(100);

  const reporterIds = [...new Set(rows.map((r) => r.reporterId))];
  const reporterRows = reporterIds.length > 0 ? await db.select().from(profiles).where(inArray(profiles.userId, reporterIds)) : [];
  const reporterById = new Map(reporterRows.map((p) => [p.userId, p]));

  const postIds = rows.filter((r) => r.targetType === "post").map((r) => r.targetId);
  const commentIds = rows.filter((r) => r.targetType === "comment").map((r) => r.targetId);
  const userIds = rows.filter((r) => r.targetType === "user").map((r) => r.targetId);

  const [postRows, commentRows, userRows] = await Promise.all([
    postIds.length > 0 ? db.select().from(posts).where(inArray(posts.id, postIds)) : Promise.resolve([]),
    commentIds.length > 0 ? db.select().from(postComments).where(inArray(postComments.id, commentIds)) : Promise.resolve([]),
    userIds.length > 0 ? db.select().from(profiles).where(inArray(profiles.userId, userIds)) : Promise.resolve([]),
  ]);

  const postById = new Map(postRows.map((p) => [p.id, p]));
  const commentById = new Map(commentRows.map((c) => [c.id, c]));
  const userById = new Map(userRows.map((u) => [u.userId, u]));

  return rows.map((row) => {
    const reporter = reporterById.get(row.reporterId);
    let targetSummary = "Conteúdo não encontrado (pode já ter sido removido).";

    if (row.targetType === "post") {
      const post = postById.get(row.targetId);
      if (post) {
        targetSummary = post.deletedAt
          ? "Post já removido pelo autor."
          : `Post: "${(post.caption ?? "(sem legenda)").slice(0, 140)}"`;
      }
    } else if (row.targetType === "comment") {
      const comment = commentById.get(row.targetId);
      if (comment) {
        targetSummary = comment.deletedAt
          ? "Comentário já removido pelo autor."
          : `Comentário: "${comment.body.slice(0, 140)}"`;
      }
    } else {
      const user = userById.get(row.targetId);
      if (user) targetSummary = `Usuário: @${user.handle} (${user.displayName})`;
    }

    return {
      id: row.id,
      reason: row.reason,
      details: row.details,
      status: row.status,
      targetType: row.targetType,
      targetId: row.targetId,
      createdAt: row.createdAt.toISOString(),
      reporter: reporter ? { handle: reporter.handle, displayName: reporter.displayName } : null,
      targetSummary,
    };
  });
}
