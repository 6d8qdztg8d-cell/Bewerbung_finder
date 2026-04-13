"use client";

import { useState, useEffect } from "react";

type ApiKeyStatus = {
  openaiApiKey: string | null;
  rapidApiKey: string | null;
  openaiConnected: boolean;
  rapidConnected: boolean;
};

type TestState = "idle" | "testing" | "success" | "error";

export function ApiKeysForm() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [rapidKey, setRapidKey] = useState("");
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/api-keys")
      .then((r) => r.json())
      .then((data: ApiKeyStatus) => setStatus(data))
      .catch(() => null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openaiApiKey: openaiKey || undefined,
          rapidApiKey: rapidKey || undefined,
        }),
      });

      // Refresh status
      const updated = await fetch("/api/settings/api-keys").then((r) => r.json()) as ApiKeyStatus;
      setStatus(updated);
      setOpenaiKey("");
      setRapidKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestState("testing");
    setTestError(null);

    const res = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: openaiKey || undefined }),
    });

    const data = await res.json() as { valid: boolean; error?: string };
    if (data.valid) {
      setTestState("success");
      setTimeout(() => setTestState("idle"), 3000);
    } else {
      setTestState("error");
      setTestError(data.error ?? "Verbindung fehlgeschlagen.");
    }
  };

  return (
    <div className="space-y-6">
      {/* OpenAI Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300">
            OpenAI API-Key
          </label>
          <StatusBadge connected={status?.openaiConnected ?? false} />
        </div>

        {status?.openaiApiKey && (
          <p className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-1.5 rounded border border-slate-700 inline-block">
            {status.openaiApiKey}
          </p>
        )}

        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-... (leer lassen um bestehenden Key zu behalten)"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testState === "testing"}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            {testState === "testing" ? "Teste…" : "Verbindung testen"}
          </button>

          {testState === "success" && (
            <span className="text-xs text-green-400">Verbindung erfolgreich</span>
          )}
          {testState === "error" && (
            <span className="text-xs text-red-400">{testError}</span>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Key von{" "}
          <span className="text-slate-400">platform.openai.com/api-keys</span> —
          wird verschlüsselt gespeichert. Überschreibt den System-Key in{" "}
          <code className="text-slate-400">.env</code>.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* RapidAPI Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300">
            RapidAPI Key{" "}
            <span className="text-slate-500 font-normal">(für Job-Suche)</span>
          </label>
          <StatusBadge connected={status?.rapidConnected ?? false} />
        </div>

        {status?.rapidApiKey && (
          <p className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-1.5 rounded border border-slate-700 inline-block">
            {status.rapidApiKey}
          </p>
        )}

        <input
          type="password"
          value={rapidKey}
          onChange={(e) => setRapidKey(e.target.value)}
          placeholder="(leer lassen um bestehenden Key zu behalten)"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="text-xs text-slate-500">
          Key von <span className="text-slate-400">rapidapi.com</span> — benötigt
          für JSearch (Indeed, LinkedIn, Glassdoor). Ohne Key wird der Mock-Provider
          verwendet.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || (!openaiKey && !rapidKey)}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {saving ? "Speichert…" : saved ? "Gespeichert ✓" : "API-Keys speichern"}
      </button>
    </div>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
        connected
          ? "bg-green-900/40 text-green-400 border border-green-800"
          : "bg-slate-800 text-slate-500 border border-slate-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-slate-500"}`}
      />
      {connected ? "Verbunden" : "Nicht konfiguriert"}
    </span>
  );
}
