import { requireHrPage } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

// Intake Health (audit #117) — surfaces recent website-intake attempts so a FAILED
// submission (a lost applicant) is never silent. Admin / Senior HR only.
export default async function IntakeHealthPage() {
  const { role } = await requireHrPage();
  if (role === "JUNIOR_HR") notFound();

  const [logs, failedCount, total] = await Promise.all([
    prisma.hRIntakeLog.findMany({
      orderBy: { receivedAt: "desc" }, take: 200,
      select: { id: true, receivedAt: true, source: true, outcome: true, httpStatus: true, error: true, candidateId: true },
    }),
    prisma.hRIntakeLog.count({ where: { outcome: "FAILED" } }),
    prisma.hRIntakeLog.count(),
  ]);

  const fmt = (d: Date) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300"><Activity className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Intake Health</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Recent website-intake attempts · failures are lost applicants</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4"><div className={`text-2xl font-extrabold ${failedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{failedCount}</div><div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 inline-flex items-center gap-1">{failedCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />} Failed submissions (all time)</div></div>
        <div className="card p-4"><div className="text-2xl font-extrabold text-gray-800 dark:text-white">{total}</div><div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Total intake attempts</div></div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead><tr className="bg-gray-50 dark:bg-slate-800 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-3 py-2">When</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Outcome</th><th className="px-3 py-2">HTTP</th><th className="px-3 py-2">Detail</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {logs.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">No intake attempts logged yet.</td></tr>}
              {logs.map(l => (
                <tr key={l.id} className={l.outcome === "FAILED" ? "bg-rose-50/50 dark:bg-rose-950/20" : "hover:bg-gray-50/80 dark:hover:bg-slate-800/50"}>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-slate-300">{fmt(l.receivedAt)}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-slate-300">{l.source ?? "—"}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${l.outcome === "FAILED" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : l.outcome === "APPENDED" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>{l.outcome}</span></td>
                  <td className="px-3 py-2 tabular-nums text-gray-500 dark:text-slate-400">{l.httpStatus}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-slate-300 max-w-[280px] truncate" title={l.error ?? undefined}>{l.error ? l.error : l.candidateId ? <Link href={`/hr/candidates/${l.candidateId}`} className="text-[#1a2e4a] dark:text-blue-400 hover:underline">View candidate →</Link> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
