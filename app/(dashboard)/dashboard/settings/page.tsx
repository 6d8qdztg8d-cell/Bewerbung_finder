import { auth } from "@/lib/auth";
import { userService } from "@/services/users/user.service";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { ApiKeysForm } from "@/components/settings/api-keys-form";

export default async function SettingsPage() {
  const session = await auth();
  const [profile, preferences] = await Promise.all([
    userService.getProfile(session!.user.id),
    userService.getPreferences(session!.user.id),
  ]);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
        <p className="text-slate-400 mt-1">
          Verwalte dein Profil und deine Job-Präferenzen.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
          Persönliches Profil
        </h2>
        <ProfileForm defaultValues={profile} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
          Job-Präferenzen
        </h2>
        <PreferencesForm defaultValues={preferences} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
          API-Keys &amp; KI-Verbindung
        </h2>
        <p className="text-sm text-slate-400">
          Konfiguriere deine API-Keys für OpenAI (KI) und RapidAPI (Job-Suche).
          Keys werden sicher in deinem Profil gespeichert.
        </p>
        <ApiKeysForm />
      </section>
    </div>
  );
}
