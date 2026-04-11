import { db } from "@/lib/db";
import { jobService } from "@/services/jobs/job.service";
import { matchingService } from "@/services/matching/matching.service";
import type { TaskResult } from "../scheduler.types";

export async function fetchJobsTask(): Promise<TaskResult> {
  const start = Date.now();
  const errors: string[] = [];
  let processed = 0;

  const usersWithPrefs = await db.userPreference.findMany({
    select: { userId: true, jobTitles: true, locations: true, jobTypes: true, workModes: true },
  });

  for (const pref of usersWithPrefs) {
    try {
      const jobs = await jobService.fetchAndStore({
        titles: pref.jobTitles, locations: pref.locations,
        jobTypes: pref.jobTypes, workModes: pref.workModes,
      });
      const created = await matchingService.createMatchesForUser(pref.userId, jobs.map((j) => j.id));
      processed += created;
    } catch (err) {
      errors.push(`User ${pref.userId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { task: "FETCH_JOBS", success: errors.length === 0, processed, errors, durationMs: Date.now() - start };
}
