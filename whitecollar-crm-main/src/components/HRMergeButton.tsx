"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge, Search, X } from "lucide-react";

interface Hit { id: string; name: string; phone: string | null; status: string; }

// Admin-only "merge a duplicate into this candidate" tool (audit #74). Searches
// candidates, then merges the chosen duplicate's history into this one.
export default function HRMergeButton({ survivorId, survivorName }: { survivorId: string; survivorName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function search() {
    if (!q.trim()) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/hr/candidates?q=${encodeURIComponent(q.trim())}&closed=1`);
      const data = await res.json().catch(() => ({}));
      const list: Hit[] = (data.candidates ?? data.rows ?? []).map((c: Hit) => ({ id: c.id, name: c.name, phone: c.phone, status: c.status }));
      setHits(list.filter((c) => c.id !== survivorId).slice(0, 8));
    } catch { setErr("Search failed"); }
    finally { setBusy(false); }
  }

  async function merge(loser: Hit) {
    if (!window.confirm(`Merge "${loser.name}" INTO "${survivorName}"? All of ${loser.name}'s interviews, follow-ups, resumes and history move here, and ${loser.name} is removed. This can't be undone.`)) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/hr/candidates/${survivorId}/merge`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loserId: loser.id }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d?.error || "Merge failed"); return; }
      setOpen(false); router.refresh();
    } catch { setErr("Merge failed"); }
    finally { setBusy(false); }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
        <GitMerge size={13} /> Merge duplicate
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">Find the duplicate to merge into this candidate</span>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
      <div className="flex gap-1.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") search(); }}
          placeholder="Name or phone…" className="flex-1 text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 dark:bg-slate-800 dark:text-slate-100" />
        <button type="button" disabled={busy} onClick={search} className="text-xs px-2.5 py-1 rounded-lg bg-[#1a2e4a] text-white inline-flex items-center gap-1 disabled:opacity-50"><Search size={12} />Find</button>
      </div>
      {err && <div className="text-[11px] text-red-600 dark:text-red-400">{err}</div>}
      {hits.map((h) => (
        <div key={h.id} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-slate-900 rounded border border-gray-100 dark:border-slate-700 px-2 py-1">
          <span className="truncate"><span className="font-medium text-gray-800 dark:text-slate-200">{h.name}</span> <span className="text-gray-400">· {h.phone ?? "no phone"}</span></span>
          <button type="button" disabled={busy} onClick={() => merge(h)} className="shrink-0 text-[11px] px-2 py-0.5 rounded border border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50">Merge in</button>
        </div>
      ))}
    </div>
  );
}
