"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, FileText } from "lucide-react";
import type { ApplicationWithRelations } from "@/domain/application/types";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  DRAFT: { label: "Entwurf", color: "bg-slate-800 text-slate-400" },
  READY: { label: "Bereit", color: "bg-blue-900/30 text-blue-300" },
  SUBMITTED: { label: "Eingereicht", color: "bg-purple-900/30 text-purple-300" },
  ACKNOWLEDGED: { label: "Bestätigt", color: "bg-yellow-900/30 text-yellow-300" },
  REJECTED: { label: "Abgelehnt", color: "bg-red-900/30 text-red-300" },
  INTERVIEW: { label: "Interview", color: "bg-green-900/30 text-green-300" },
  OFFER: { label: "Angebot", color: "bg-emerald-900/30 text-emerald-300" },
  WITHDRAWN: { label: "Zurückgezogen", color: "bg-slate-800 text-slate-500" },
};

export function ApplicationList({ applications }: { applications: ApplicationWithRelations[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SUBMITTED" }),
    });
    setSubmitting(null);
    router.refresh();
  };

  if (applications.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Send size={36} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">
          Keine Bewerbungen vorhanden. Genehmige Matches und erstelle Bewerbungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const config = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.DRAFT;
        const job = app.jobMatch.jobListing;

        return (
          <div
            key={app.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-white font-semibold">{job.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{job.company}</p>

                {app.coverLetter && (
                  <div className="mt-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText size={13} className="text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">Anschreiben</span>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {app.submittedAt && (
                  <p className="text-slate-500 text-xs">
                    Eingereicht am: {new Date(app.submittedAt).toLocaleDateString("de-DE")}
                  </p>
                )}
              </div>

              {app.status === "DRAFT" && (
                <button
                  onClick={() => handleSubmit(app.id)}
                  disabled={submitting === app.id}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  <Send size={13} />
                  {submitting === app.id ? "…" : "Einreichen"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
