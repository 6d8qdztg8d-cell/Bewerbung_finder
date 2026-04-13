import { db } from "@/lib/db";
import { matchingService } from "@/services/matching/matching.service";
import type { TaskResult } from "../scheduler.types";

export async function analyzeMatchesTask(): Promise<TaskResult> {
  const start = Date.now();
  const errors: string[] = [];
  let processed = 0;

  const usersWithPending = await db.jobMatch.groupBy({
    by: ["userId"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  for (const { userId } of usersWithPending) {
    try {
      processed += await matchingService.analyzeUserMatches(userId);
    } catch (err) {
      errors.push(`User ${userId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { task: "ANALYZE_MATCHES", success: errors.length === 0, processed, errors, durationMs: Date.now() - start };
}
