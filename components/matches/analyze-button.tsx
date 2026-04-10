"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function AnalyzeButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    await fetch("/api/matches/analyze", { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <Sparkles size={16} className={loading ? "animate-pulse" : ""} />
      {loading ? "KI analysiert…" : `${pendingCount} Matches analysieren`}
    </button>
  );
}
