import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobService } from "@/services/jobs/job.service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Number(searchParams.get("pageSize") ?? 20));

  const { jobs, total } = await jobService.listOpen(page, pageSize);

  return NextResponse.json({
    jobs,
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}
