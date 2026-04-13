export type SchedulerTask =
  | "FETCH_JOBS"
  | "ANALYZE_MATCHES"
  | "AUTO_APPLY"
  | "CLEANUP_EXPIRED_JOBS";

export type TaskResult = {
  task: SchedulerTask;
  success: boolean;
  processed: number;
  errors: string[];
  durationMs: number;
};
