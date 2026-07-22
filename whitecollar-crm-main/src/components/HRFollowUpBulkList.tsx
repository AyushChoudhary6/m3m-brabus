"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HRFollowUpActions from "@/components/HRFollowUpActions";
import { nowISTLocalInput, fromISTLocalInput } from "@/lib/datetime";
import { AlertTriangle, CalendarDays, Check, Clock, X } from "lucide-react";

export interface FollowUpItem {
  id: string; candidateId: string; candidateName: string; phone: string | null;
  type: string; dueAt: string; notes: string | null; userName: string | null; ownerFirst: string | null;
}

const fmt = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

// Follow-Ups list with row selection + bulk Complete / Snooze (audit #87). Keeps the
// per-row quick actions; adds a select-all header and a bulk bar with a shared
// completion note, so a recruiter can clear a stack of follow-ups in one go.
export default function HRFollowUpBulkList({ items }: { items: FollowUpItem[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [snoozeAt, setSnoozeAt] = useState("");
  const [mode, setMode] = useState<"none" | "snooze">("none");
  const [, startT] = useTransition();
  const now = Date.now();

  const allSelected = items.length > 0 && sel.size === items.length;
  const toggle = (id: string) => setSel(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(items.map(i => i.id)));

  async function runBulk(action: "complete" | "snooze") {
    if (sel.size === 0) return;
    setBusy(true); setErr(null);
    const payload: Record<string, unknown> = { followUpIds: [...sel], action, note: note.trim() || undefined };
    if (action === "snooze") {
      const d = fromISTLocalInput(snoozeAt);
      if (!d) { setErr("Pick a snooze date & time."); setBusy(false); return; }
      payload.dueAt = d.toISOString();
    }
    try {
      const res = await fetch("/api/hr/followups/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.error || "Bulk action failed."); return; }
      setSel(new Set()); setNote(""); setSnoozeAt(""); setMode("none");
      startT(() => router.refresh());
    } finally { setBusy(false); }
  }

  const btn = "text-xs px-3 py-1.5 rounded-lg border inline-flex items-center gap-1 disabled:opacity-50";

  return (
    <div className="space-y-2">
      {/* Bulk toolbar */}
      <div className="flex items-center flex-wrap gap-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all follow-ups" />
          {sel.size > 0 ? `${sel.size} selected` : `Select all (${items.length})`}
        </label>
        {sel.size > 0 && (
          <div className="flex items-center flex-wrap gap-2 ml-auto">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Completion note (optional)"
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 dark:bg-slate-800 dark:border-slate-600 w-48" />
            <button type="button" disabled={busy} onClick={() => runBulk("complete")}
              className={`${btn} border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-800 dark:text-emerald-300`}>
              <Check className="w-3 h-3" /> Complete {sel.size}
            </button>
            {mode === "snooze" ? (
              <>
                <input type="datetime-local" value={snoozeAt} min={nowISTLocalInput()} onChange={e => setSnoozeAt(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 dark:bg-slate-800 dark:border-slate-600" />
                <button type="button" disabled={busy || !snoozeAt} onClick={() => runBulk("snooze")}
                  className={`${btn} border-amber-400 bg-amber-600 text-white hover:bg-amber-700`}>Apply snooze</button>
                <button type="button" onClick={() => { setMode("none"); setSnoozeAt(""); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </>
            ) : (
              <button type="button" disabled={busy} onClick={() => setMode("snooze")}
                className={`${btn} border-amber-300 bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-900 dark:border-amber-800 dark:text-amber-300`}>
                <Clock className="w-3 h-3" /> Snooze {sel.size}…
              </button>
            )}
            <button type="button" onClick={() => setSel(new Set())} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
          </div>
        )}
      </div>
      {err && <div className="text-xs text-red-600 dark:text-red-400">{err}</div>}

      {/* Rows */}
      {items.map(fu => {
        const dueAt = new Date(fu.dueAt);
        const overdue = dueAt.getTime() < now;
        const checked = sel.has(fu.id);
        return (
          <div key={fu.id}
            className={`bg-white dark:bg-slate-900 rounded-xl border p-4 flex items-start gap-3 ${checked ? "ring-2 ring-[#1a2e4a]/40 dark:ring-blue-500/40 " : ""}${overdue ? "border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20" : "border-gray-200 dark:border-slate-700"}`}>
            <input type="checkbox" checked={checked} onChange={() => toggle(fu.id)} className="mt-1 shrink-0" aria-label={`Select follow-up for ${fu.candidateName}`} />
            <div className="flex-1 min-w-0">
              <Link href={`/hr/candidates/${fu.candidateId}`} className="font-semibold text-sm text-[#1a2e4a] dark:text-blue-400 hover:underline">{fu.candidateName}</Link>
              {fu.phone && <a href={`tel:${fu.phone}`} className="text-xs text-gray-500 ml-2 hover:text-blue-600">{fu.phone}</a>}
              <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                <span className="font-medium text-gray-700 dark:text-slate-200">{fmt(fu.type)}</span>
                <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-600 font-semibold" : "text-amber-600"}`}>
                  {overdue ? <><AlertTriangle className="w-3 h-3" /> Overdue — </> : <CalendarDays className="w-3 h-3" />}
                  {dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} {dueAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {fu.userName && <span>· {fu.userName}</span>}
                {fu.ownerFirst && <span>Owner: {fu.ownerFirst}</span>}
              </div>
              {fu.notes && <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{fu.notes}</div>}
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <HRFollowUpActions followUpId={fu.id} candidateId={fu.candidateId} phone={fu.phone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
