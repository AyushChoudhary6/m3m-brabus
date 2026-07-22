"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";

interface Row { id: string; name: string; phone: string | null; status: string; deletedAt: string; primaryOwner: { name: string } | null; }

export default function HRRecycleBinClient({ candidates }: { candidates: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function restore(id: string) {
    setBusyId(id); setErr(null);
    try {
      const res = await fetch("/api/hr/candidates/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", ids: [id] }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d?.error || "Restore failed"); return; }
      router.refresh();
    } catch { setErr("Restore failed"); }
    finally { setBusyId(null); }
  }

  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <div className="space-y-3">
      {err && <div className="text-xs text-red-600 dark:text-red-400">{err}</div>}
      {candidates.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-400 dark:text-slate-500">
          <Trash2 className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
          Recycle bin is empty.
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[560px]">
              <thead><tr className="bg-gray-50 dark:bg-slate-800 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-3 py-2">Candidate</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Owner</th><th className="px-3 py-2">Deleted</th><th className="px-3 py-2 text-right">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {candidates.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 font-medium text-gray-800 dark:text-slate-200">{c.name}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{c.phone ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{c.primaryOwner?.name?.split(" ")[0] ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-slate-400 whitespace-nowrap">{fmt(c.deletedAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" disabled={busyId === c.id} onClick={() => restore(c.id)}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30 disabled:opacity-50">
                        <RotateCcw className="w-3 h-3" />{busyId === c.id ? "Restoring…" : "Restore"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Link href="/hr/candidates" className="text-xs text-[#1a2e4a] dark:text-blue-400 hover:underline">← Back to candidates</Link>
    </div>
  );
}
