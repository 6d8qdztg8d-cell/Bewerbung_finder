import { fetchJobsTask } from "./tasks/fetch-jobs.task";
import { analyzeMatchesTask } from "./tasks/analyze-matches.task";
import { autoApplyTask } from "./tasks/auto-apply.task";
import { cleanupExpiredJobsTask } from "./tasks/cleanup.task";
import type { SchedulerTask, TaskResult } from "./scheduler.types";

class SchedulerService {
  async run(task: SchedulerTask): Promise<TaskResult> {
    console.log(`[Scheduler] Starting task: ${task}`);

    let result: TaskResult;

    switch (task) {
      case "FETCH_JOBS":
        result = await fetchJobsTask();
        break;
      case "ANALYZE_MATCHES":
        result = await analyzeMatchesTask();
        break;
      case "AUTO_APPLY":
        result = await autoApplyTask();
        break;
      case "CLEANUP_EXPIRED_JOBS":
        result = await cleanupExpiredJobsTask();
        break;
    }

    console.log(
      `[Scheduler] ${task} done — processed: ${result.processed}, errors: ${result.errors.length}, ${result.durationMs}ms`
    );

    if (result.errors.length > 0) {
      console.error(`[Scheduler] Errors in ${task}:`, result.errors);
    }

    return result;
  }

  async runPipeline(): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    results.push(await this.run("FETCH_JOBS"));
    results.push(await this.run("ANALYZE_MATCHES"));
    results.push(await this.run("AUTO_APPLY"));
    results.push(await this.run("CLEANUP_EXPIRED_JOBS"));
    return results;
  }
}

export const schedulerService = new SchedulerService();
