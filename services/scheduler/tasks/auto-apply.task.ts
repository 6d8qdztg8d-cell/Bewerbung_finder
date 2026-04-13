import { db } from "@/lib/db";
import { applicationService } from "@/services/applications/application.service";
import type { TaskResult } from "../scheduler.types";

/**
 * Auto-apply task — only runs for users with autoApply = true.
 *
 * Rules enforced:
 * 1. User must have autoApply enabled
 * 2. Match score must be >= user's minMatchScore
 * 3. Daily application limit must not be exceeded
 * 4. Current time must be within user's availability window
 * 5. No duplicate applications
 */
export async function autoApplyTask(): Promise<TaskResult> {
  const start = Date.now();
  const errors: string[] = [];
  let processed = 0;

  const autoApplyUsers = await db.userPreference.findMany({
    where: { autoApply: true },
    select: {
      userId: true,
      minMatchScore: true,
      maxApplicationsPerDay: true,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const pref of autoApplyUsers) {
    try {
      // Check how many applications were already submitted today
      const todayCount = await db.application.count({
        where: {
          userId: pref.userId,
          status: { in: ["SUBMITTED", "READY"] },
          submittedAt: { gte: today },
        },
      });

      const remaining = pref.maxApplicationsPerDay - todayCount;
      if (remaining <= 0) continue;

      // Check if current time is within any availability window
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      const window = await db.availabilityWindow.findFirst({
        where: {
          userId: pref.userId,
          dayOfWeek: currentDay,
          startHour: { lte: currentHour },
          endHour: { gt: currentHour },
        },
      });

      if (!window) continue; // Outside availability window

      // Get approved matches without existing applications
      const eligibleMatches = await db.jobMatch.findMany({
        where: {
          userId: pref.userId,
          status: "ANALYZED",
          score: { gte: pref.minMatchScore },
          application: null,
        },
        orderBy: { score: "desc" },
        take: remaining,
      });

      for (const match of eligibleMatches) {
        try {
          // Auto-approve the match first
          await db.jobMatch.update({
            where: { id: match.id },
            data: { status: "APPROVED" },
          });

          await applicationService.createDraft(pref.userId, match.id);
          processed++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Match ${match.id}: ${msg}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`User ${pref.userId}: ${msg}`);
    }
  }

  return {
    task: "AUTO_APPLY",
    success: errors.length === 0,
    processed,
    errors,
    durationMs: Date.now() - start,
  };
}
