import { auth } from "@/lib/auth";
import { matchingService } from "@/services/matching/matching.service";
import { MatchList } from "@/components/matches/match-list";
import { AnalyzeButton } from "@/components/matches/analyze-button";

export default async function MatchesPage() {
  const session = await auth();
  const { matches, total } = await matchingService.getUserMatches(
    session!.user.id,
    undefined,
    1,
    50
  );

  const pendingCount = matches.filter((m) => m.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job-Matches</h1>
          <p className="text-slate-400 mt-1">{total} Matches insgesamt</p>
        </div>
        {pendingCount > 0 && (
          <AnalyzeButton pendingCount={pendingCount} />
        )}
      </div>

      <MatchList matches={matches} />
    </div>
  );
}
