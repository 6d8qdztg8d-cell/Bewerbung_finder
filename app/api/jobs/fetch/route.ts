import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobService } from "@/services/jobs/job.service";
import { userService } from "@/services/users/user.service";

/**
 * POST /api/jobs/fetch
 * Triggers a job search based on the user's saved preferences.
 * Protected — only the authenticated user can trigger this for themselves.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await userService.getPreferences(session.user.id);

  if (!preferences) {
    return NextResponse.json(
      { error: "Set your job preferences first." },
      { status: 400 }
    );
  }

  const jobs = await jobService.fetchAndStore({
    titles: preferences.jobTitles,
    locations: preferences.locations,
    jobTypes: preferences.jobTypes,
    workModes: preferences.workModes,
  });

  return NextResponse.json({ fetched: jobs.length, jobs });
}
