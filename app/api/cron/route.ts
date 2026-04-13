import { NextResponse } from "next/server";
import { schedulerService } from "@/services/scheduler/scheduler.service";
import type { SchedulerTask } from "@/services/scheduler/scheduler.types";

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
    const results = await schedulerService.runPipeline();
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scheduler error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
