import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Authentifizierungsfehler</h1>
        <p className="text-slate-400">
          Es ist ein Fehler bei der Anmeldung aufgetreten.
        </p>
      </div>
      <Link
        href="/auth/login"
        className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
      >
        Zurück zur Anmeldung
      </Link>
    </div>
  );
}
