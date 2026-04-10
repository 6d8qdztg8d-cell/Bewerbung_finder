import { Briefcase, Send, FileText, TrendingUp } from "lucide-react";

const STATS = [
  {
    label: "Gefundene Jobs",
    value: "0",
    icon: Briefcase,
    color: "text-blue-400",
    bg: "bg-blue-900/20",
  },
  {
    label: "Offene Matches",
    value: "0",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-900/20",
  },
  {
    label: "Bewerbungen",
    value: "0",
    icon: Send,
    color: "text-purple-400",
    bg: "bg-purple-900/20",
  },
  {
    label: "Dokumente",
    value: "0",
    icon: FileText,
    color: "text-orange-400",
    bg: "bg-orange-900/20",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4"
        >
          <div className={`${bg} p-3 rounded-lg`}>
            <Icon size={22} className={color} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
