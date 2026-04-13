import { db } from "@/lib/db";
import type { TaskResult } from "../scheduler.types";

export async function cleanupExpiredJobsTask(): Promise<TaskResult> {
  const start = Date.now();
  const result = await db.jobListing.updateMany({
    where: { status: "OPEN", expiresAt: { lt: new Date() } },
    data: { status: "CLOSED" },
  });
  return { task: "CLEANUP_EXPIRED_JOBS", success: true, processed: result.count, errors: [], durationMs: Date.now() - start };
}
