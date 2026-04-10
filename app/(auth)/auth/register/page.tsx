import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Konto erstellen</h1>
        <p className="text-slate-400">
          Starte deine automatisierte Jobsuche
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <RegisterForm />
      </div>

      <p className="text-center text-slate-400 text-sm">
        Bereits registriert?{" "}
        <Link
          href="/auth/login"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Jetzt anmelden
        </Link>
      </p>
    </div>
  );
}
