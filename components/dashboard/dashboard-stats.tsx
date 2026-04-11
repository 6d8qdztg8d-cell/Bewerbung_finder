import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Briefcase, Send, FileText, TrendingUp, CheckCircle, Star } from "lucide-react";
import Link from "next/link";

async function getStats(userId: string) {
  const [totalJobs, totalMatches, pendingMatches, totalApplications,
    submittedApplications, interviewCount, offerCount, totalDocuments] = await Promise.all([
    db.jobListing.count({ where: { status: "OPEN" } }),
    db.jobMatch.count({ where: { userId } }),
    db.jobMatch.count({ where: { userId, status: "PENDING" } }),
    db.application.count({ where: { userId } }),
    db.application.count({ where: { userId, status: "SUBMITTED" } }),
    db.application.count({ where: { userId, status: "INTERVIEW" } }),
    db.application.count({ where: { userId, status: "OFFER" } }),
    db.document.count({ where: { userId, isActive: true } }),
  ]);
  return { totalJobs, totalMatches, pendingMatches, totalApplications, submittedApplications, interviewCount, offerCount, totalDocuments };
}

export async function DashboardStats() {
  const session = await auth();
  const stats = await getStats(session!.user.id);

  const cards = [
    { label: "Offene Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-900/20", href: "/dashboard/jobs" },
    { label: "Job-Matches", value: stats.totalMatches, sub: stats.pendingMatches > 0 ? `${stats.pendingMatches} ausstehend` : undefined, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-900/20", href: "/dashboard/matches" },
    { label: "Bewerbungen", value: stats.totalApplications, sub: stats.submittedApplications > 0 ? `${stats.submittedApplications} eingereicht` : undefined, icon: Send, color: "text-green-400", bg: "bg-green-900/20", href: "/dashboard/applications" },
    { label: "Dokumente", value: stats.totalDocuments, icon: FileText, color: "text-orange-400", bg: "bg-orange-900/20", href: "/dashboard/documents" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-slate-600 transition-colors">
            <div className={`${bg} p-3 rounded-lg`}><Icon size={22} className={color} /></div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
              {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
          </Link>
        ))}
      </div>
      {(stats.interviewCount > 0 || stats.offerCount > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {stats.interviewCount > 0 && (
            <div className="bg-emerald-900/10 border border-emerald-800/40 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <div><p className="text-white font-semibold">{stats.interviewCount} Interview{stats.interviewCount > 1 ? "s" : ""}</p><p className="text-emerald-400/70 text-xs">Aktive Bewerbungen</p></div>
            </div>
          )}
          {stats.offerCount > 0 && (
            <div className="bg-yellow-900/10 border border-yellow-800/40 rounded-xl p-4 flex items-center gap-3">
              <Star size={20} className="text-yellow-400" />
              <div><p className="text-white font-semibold">{stats.offerCount} Angebot{stats.offerCount > 1 ? "e" : ""}</p><p className="text-yellow-400/70 text-xs">Herzlichen Glückwunsch!</p></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
