import { auth } from "@/lib/auth";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Hallo, {session?.user.name ?? "dort"} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Hier ist eine Übersicht deiner Bewerbungsaktivitäten.
        </p>
      </div>

      <DashboardStats />
    </div>
  );
}
