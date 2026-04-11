import { db } from "@/lib/db";
import { applicationService } from "@/services/applications/application.service";
import type { TaskResult } from "../scheduler.types";

export async function autoApplyTask(): Promise<TaskResult> {
  const start = Date.now();
  const errors: string[] = [];
  let processed = 0;

  const autoApplyUsers = await db.userPreference.findMany({
    where: { autoApply: true },
    select: { userId: true, minMatchScore: true, maxApplicationsPerDay: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const pref of autoApplyUsers) {
    try {
      const todayCount = await db.application.count({
        where: { userId: pref.userId, status: { in: ["SUBMITTED", "READY"] }, submittedAt: { gte: today } },
      });
      const remaining = pref.maxApplicationsPerDay - todayCount;
      if (remaining <= 0) continue;

      const now = new Date();
      const window = await db.availabilityWindow.findFirst({
        where: { userId: pref.userId, dayOfWeek: now.getDay(), startHour: { lte: now.getHours() }, endHour: { gt: now.getHours() } },
      });
      if (!window) continue;

      const eligible = await db.jobMatch.findMany({
        where: { userId: pref.userId, status: "ANALYZED", score: { gte: pref.minMatchScore }, application: null },
        orderBy: { score: "desc" },
        take: remaining,
      });

      for (const match of eligible) {
        try {
          await db.jobMatch.update({ where: { id: match.id }, data: { status: "APPROVED" } });
          await applicationService.createDraft(pref.userId, match.id);
          processed++;
        } catch (err) {
          errors.push(`Match ${match.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (err) {
      errors.push(`User ${pref.userId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { task: "AUTO_APPLY", success: errors.length === 0, processed, errors, durationMs: Date.now() - start };
}
