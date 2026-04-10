import { auth } from "@/lib/auth";
import { jobService } from "@/services/jobs/job.service";
import { userService } from "@/services/users/user.service";
import { JobList } from "@/components/jobs/job-list";
import { JobFetchButton } from "@/components/jobs/job-fetch-button";

export default async function JobsPage() {
  const session = await auth();
  const [{ jobs, total }, preferences] = await Promise.all([
    jobService.listOpen(),
    userService.getPreferences(session!.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobsuche</h1>
          <p className="text-slate-400 mt-1">
            {total} offene Stellen gefunden
          </p>
        </div>
        <JobFetchButton hasPreferences={!!preferences} />
      </div>

      {!preferences && (
        <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-4">
          <p className="text-amber-400 text-sm">
            Stelle zuerst deine Job-Präferenzen ein, damit die Suche auf dich
            zugeschnitten ist. →{" "}
            <a href="/dashboard/settings" className="underline font-medium">
              Einstellungen
            </a>
          </p>
        </div>
      )}

      <JobList jobs={jobs} />
    </div>
  );
}
