import { auth } from "@/lib/auth";
import { applicationService } from "@/services/applications/application.service";
import { ApplicationList } from "@/components/applications/application-list";

export default async function ApplicationsPage() {
  const session = await auth();
  const { applications, total } = await applicationService.listByUser(
    session!.user.id,
    undefined,
    1,
    50
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bewerbungen</h1>
        <p className="text-slate-400 mt-1">{total} Bewerbungen insgesamt</p>
      </div>

      <ApplicationList applications={applications} />
    </div>
  );
}
