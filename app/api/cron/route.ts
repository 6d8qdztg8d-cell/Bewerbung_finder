import { NextResponse } from "next/server";
import { schedulerService } from "@/services/scheduler/scheduler.service";
import type { SchedulerTask } from "@/services/scheduler/scheduler.types";

/**
 * GET /api/cron?task=FETCH_JOBS
 *
 * Protected by CRON_SECRET environment variable.
 * Call with: Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron example (vercel.json):
 * {
 *   "crons": [
 *     { "path": "/api/cron?task=FETCH_JOBS", "schedule": "0 8 * * *" },
 *     { "path": "/api/cron?task=ANALYZE_MATCHES", "schedule": "0 9 * * *" },
 *     { "path": "/api/cron?task=AUTO_APPLY", "schedule": "0 10 * * *" }
 *   ]
 * }
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const task = searchParams.get("task") as SchedulerTask | null;

  try {
    if (task) {
      const result = await schedulerService.run(task);
      return NextResponse.json({ result });
    }

    // No task specified — run full pipeline
    const results = await schedulerService.runPipeline();
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scheduler error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
