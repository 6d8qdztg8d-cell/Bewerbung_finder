"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function JobFetchButton({ hasPreferences }: { hasPreferences: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    await fetch("/api/jobs/fetch", { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleFetch}
      disabled={loading || !hasPreferences}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
      {loading ? "Suche läuft…" : "Jobs suchen"}
    </button>
  );
}
