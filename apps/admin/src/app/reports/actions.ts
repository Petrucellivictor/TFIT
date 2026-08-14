"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, auditLogs, reports } from "@tfit/database";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateReportStatus(reportId: string, status: "reviewed" | "dismissed") {
  const { email } = await requireAdmin();

  const db = getDb();
  await db.update(reports).set({ status }).where(eq(reports.id, reportId));
  await db.insert(auditLogs).values({
    action: "report_status_updated",
    metadata: { reportId, status, adminEmail: email },
  });

  revalidatePath("/reports");
}
