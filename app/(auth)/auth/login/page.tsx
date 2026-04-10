import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Anmelden</h1>
        <p className="text-slate-400">
          Willkommen zurück bei BewerbungsFinder
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <Suspense fallback={<div className="h-48 animate-pulse bg-slate-700 rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center text-slate-400 text-sm">
        Noch kein Konto?{" "}
        <Link
          href="/auth/register"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}
