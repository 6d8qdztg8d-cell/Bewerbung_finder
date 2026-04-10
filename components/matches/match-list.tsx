"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle, XCircle, SkipForward, Bot } from "lucide-react";

type Match = {
  id: string;
  score: number;
  status: string;
  aiReasoning: string | null;
  jobListing: {
    title: string;
    company: string;
    description: string;
  };
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-400 bg-green-900/30 border-green-800"
      : score >= 60
      ? "text-yellow-400 bg-yellow-900/30 border-yellow-800"
      : "text-red-400 bg-red-900/30 border-red-800";

  return (
    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border ${color}`}>
      {score}%
    </span>
  );
}

export function MatchList({ matches }: { matches: Match[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  };

  if (matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Briefcase size={36} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">
          Keine Matches vorhanden. Suche zuerst Jobs und analysiere sie dann.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-semibold">
                  {match.jobListing.title}
                </h3>
                {match.score > 0 && <ScoreBadge score={match.score} />}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    match.status === "PENDING"
                      ? "bg-slate-800 text-slate-400"
                      : match.status === "ANALYZED"
                      ? "bg-blue-900/30 text-blue-300"
                      : match.status === "APPROVED"
                      ? "bg-green-900/30 text-green-300"
                      : match.status === "REJECTED"
                      ? "bg-red-900/30 text-red-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {match.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{match.jobListing.company}</p>

              {match.aiReasoning && (
                <div className="mt-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot size={13} className="text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">KI-Analyse</span>
                  </div>
                  <p className="text-slate-300 text-xs whitespace-pre-line">
                    {match.aiReasoning}
                  </p>
                </div>
              )}
            </div>

            {["ANALYZED", "PENDING"].includes(match.status) && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateStatus(match.id, "APPROVED")}
                  disabled={updating === match.id}
                  title="Genehmigen"
                  className="text-slate-500 hover:text-green-400 transition-colors disabled:opacity-40"
                >
                  <CheckCircle size={20} />
                </button>
                <button
                  onClick={() => updateStatus(match.id, "SKIPPED")}
                  disabled={updating === match.id}
                  title="Überspringen"
                  className="text-slate-500 hover:text-yellow-400 transition-colors disabled:opacity-40"
                >
                  <SkipForward size={20} />
                </button>
                <button
                  onClick={() => updateStatus(match.id, "REJECTED")}
                  disabled={updating === match.id}
                  title="Ablehnen"
                  className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  <XCircle size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
