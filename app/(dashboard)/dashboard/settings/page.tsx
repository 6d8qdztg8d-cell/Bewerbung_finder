import { auth } from "@/lib/auth";
import { userService } from "@/services/users/user.service";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { ProfileForm } from "@/components/settings/profile-form";

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
    </div>
  );
}
