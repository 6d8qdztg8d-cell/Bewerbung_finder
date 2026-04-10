"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "CV", label: "Lebenslauf (CV)" },
  { value: "COVER_LETTER", label: "Anschreiben" },
  { value: "CERTIFICATE", label: "Zertifikat" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "OTHER", label: "Sonstiges" },
];

export function DocumentUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("CV");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", docType);

    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(typeof json.error === "string" ? json.error : "Upload fehlgeschlagen.");
      return;
    }

    router.refresh();
  };

  return (
    <div className="bg-slate-900 border border-slate-700 border-dashed rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Upload size={16} />
          {uploading ? "Wird hochgeladen…" : "Datei auswählen"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      <p className="text-slate-500 text-xs">
        Erlaubte Formate: PDF, TXT · Maximale Größe: 10 MB
      </p>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
