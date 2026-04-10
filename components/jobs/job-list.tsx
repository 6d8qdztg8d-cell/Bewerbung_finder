import type { JobListing } from "@prisma/client";
import { MapPin, Briefcase, Building } from "lucide-react";

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Vor Ort",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  CONTRACT: "Vertrag",
  FREELANCE: "Freelance",
  INTERNSHIP: "Praktikum",
};

export function JobList({ jobs }: { jobs: JobListing[] }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Briefcase size={36} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">
          Keine Jobs gefunden. Klicke auf &quot;Jobs suchen&quot; um neue Stellen zu laden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{job.title}</h3>
              <div className="flex items-center gap-3 text-slate-400 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Building size={13} />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {job.location}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm line-clamp-2 mt-2">
                {job.description.slice(0, 200)}…
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {job.workMode && (
                <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                  {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
                </span>
              )}
              {job.jobType && (
                <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                </span>
              )}
              {job.salaryMin && (
                <span className="text-xs text-green-400">
                  {(job.salaryMin / 1000).toFixed(0)}–{(( job.salaryMax ?? job.salaryMin) / 1000).toFixed(0)}k {job.currency}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
