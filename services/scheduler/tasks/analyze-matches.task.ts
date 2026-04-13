import { db } from "@/lib/db";
import { matchingService } from "@/services/matching/matching.service";
import type { TaskResult } from "../scheduler.types";

/**
 * Runs AI match analysis for all users who have PENDING matches.
 * Respects rate limits by processing users sequentially.
 */
export async function analyzeMatchesTask(): Promise<TaskResult> {
  const start = Date.now();
  const errors: string[] = [];
  let processed = 0;

  const usersWithPendingMatches = await db.jobMatch.groupBy({
    by: ["userId"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  for (const { userId } of usersWithPendingMatches) {
    try {
      const count = await matchingService.analyzeUserMatches(userId);
      processed += count;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`User ${userId}: ${msg}`);
    }
  }

  return {
    task: "ANALYZE_MATCHES",
    success: errors.length === 0,
    processed,
    errors,
    durationMs: Date.now() - start,
  };
}
