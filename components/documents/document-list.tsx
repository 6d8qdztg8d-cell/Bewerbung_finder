"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import type { Document } from "@prisma/client";

const TYPE_LABELS: Record<string, string> = {
  CV: "Lebenslauf",
  COVER_LETTER: "Anschreiben",
  CERTIFICATE: "Zertifikat",
  PORTFOLIO: "Portfolio",
  OTHER: "Sonstiges",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  };

  if (documents.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <FileText size={36} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Noch keine Dokumente hochgeladen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <FileText size={20} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">{doc.name}</p>
              <p className="text-slate-500 text-xs">
                {TYPE_LABELS[doc.type] ?? doc.type} · {formatBytes(doc.sizeBytes)} ·{" "}
                {doc.parsedText ? "Text extrahiert" : "Kein Text"}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
