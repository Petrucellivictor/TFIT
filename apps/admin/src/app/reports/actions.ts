"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, reports } from "@tfit/database";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateReportStatus(reportId: string, status: "reviewed" | "dismissed") {
  await requireAdmin();

  const db = getDb();
  await db.update(reports).set({ status }).where(eq(reports.id, reportId));

  revalidatePath("/reports");
}
