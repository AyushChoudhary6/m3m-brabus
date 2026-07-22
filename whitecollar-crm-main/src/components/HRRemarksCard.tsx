"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote, Send, RefreshCw } from "lucide-react";

// ── Remarks thread (dedicated "Remarks" section) ─────────────────────────────
// Shows every remark logged against a candidate — imported (split out of the
// stacked Excel cell) and manually added — NEWEST FIRST. Multiple HR people can
// each add remarks here; each entry is stamped with who + when. This is the
// source of truth rendered by the HRRemark model; the same rows are also folded
// into the unified Conversation timeline in the parent.

export interface Remark {
  id: string;
  text: string;
  authorName: string | null;
  remarkAt: string;
  source: string; // MANUAL | IMPORT
  author?: { name: string; avatarColor: string | null } | null;
}

// IST date + time, e.g. "18 Jun 2026, 3:30 pm". Remarks store their real date, so
// imported historical remarks read correctly regardless of when they were parsed.
function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

export default function HRRemarksCard({ candidateId, remarks }: {
  candidateId: string;
  remarks: Remark[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    const body = text.trim();
    if (!body || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/hr/candidates/${candidateId}/remark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Couldn't save the remark — try again.");
      }
      setText("");
      // Reload server data so the new remark shows here AND in the timeline.
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save the remark — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-3">
        <StickyNote size={13} />
        Remarks
        {remarks.length > 0 && <span className="text-gray-300 dark:text-slate-600">· {remarks.length}</span>}
      </div>

      {/* Add a remark — appears at the top of the thread once saved. */}
      <div className="flex items-start gap-2 mb-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") add(); }}
          placeholder="Add a remark…"
          rows={2}
          className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b1a33]/20 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={add}
          disabled={saving || !text.trim()}
          className="btn text-sm bg-[#0b1a33] text-white hover:bg-[#1a2d4d] disabled:opacity-50 inline-flex items-center gap-1 shrink-0"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          Add
        </button>
      </div>
      {err && <div className="text-xs text-red-600 dark:text-red-400 mb-2">{err}</div>}

      {/* Thread — newest first (server orders remarkAt desc). */}
      {remarks.length === 0 ? (
        <div className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No remarks yet — add the first one above.</div>
      ) : (
        <div className="space-y-2.5">
          {remarks.map(r => {
            const who = r.author?.name || r.authorName || "Unknown";
            const color = r.author?.avatarColor || "#94a3b8";
            return (
              <div key={r.id} className="rounded-lg border border-gray-100 dark:border-slate-700/70 bg-gray-50 dark:bg-slate-800/50 px-3 py-2">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-100">{who}</span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">· {fmtWhen(r.remarkAt)}</span>
                  {r.source === "IMPORT" && (
                    <span className="text-[9px] font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 rounded px-1 py-px">Imported</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap break-words">{r.text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
