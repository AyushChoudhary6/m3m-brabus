"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { waHref } from "@/lib/waOpen";
import { istClockOnDay, istWeekday, nowISTLocalInput, fromISTLocalInput } from "@/lib/datetime";
import { Phone, MessageCircle, Check, Clock, SkipForward, X } from "lucide-react";

interface Props {
  followUpId: string;
  candidateId: string;
  phone: string | null;
}

type Mode = null | "snooze" | "next" | "skip";

// Calendar-anchored presets, computed in IST at click time (audit #40). "Tomorrow"
// now means tomorrow MORNING (10:00 IST), not now+24h at whatever arbitrary clock
// time it happens to be — so a follow-up snoozed at 3:42pm lands at 10:00, not 3:42.
// Past presets (e.g. "Today 5 PM" after 5pm) are filtered out.
function buildPresets(): { label: string; iso: string }[] {
  const now = new Date();
  const wd = istWeekday(now);                // 0=Sun … 6=Sat (IST calendar)
  const toMonday = ((1 - wd + 7) % 7) || 7;  // days to the NEXT Monday (never today)
  const all = [
    { label: "Today 5 PM",      d: istClockOnDay(now, 17, 0, 0) },
    { label: "Tomorrow 10 AM",  d: istClockOnDay(now, 10, 0, 1) },
    { label: "Tomorrow 3 PM",   d: istClockOnDay(now, 15, 0, 1) },
    { label: "In 3 days 10 AM", d: istClockOnDay(now, 10, 0, 3) },
    { label: "Next Mon 10 AM",  d: istClockOnDay(now, 10, 0, toMonday) },
  ];
  return all.filter(p => p.d.getTime() > now.getTime()).map(p => ({ label: p.label, iso: p.d.toISOString() }));
}

export default function HRFollowUpActions({ followUpId, candidateId, phone }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [err, setErr] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [, startT] = useTransition();

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/hr/candidates/${candidateId}/followup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpId, ...body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Action failed"); // inline, not a blocking alert() — audit #123
        return;
      }
      setMode(null);
      startT(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }
  const errBanner = err ? <div className="text-[10px] text-red-600 dark:text-red-400">{err}</div> : null;

  const markDone = () => post({ action: "complete" });
  const snoozeTo = (iso: string) => post({ action: "snooze", dueAt: iso });
  const skip = () => post({ action: "skip" });
  const completeWithNextAt = (iso: string) => post({ action: "complete", nextDueAt: iso });

  const btn =
    "text-[11px] px-2.5 py-1 rounded-lg border text-center inline-flex items-center justify-center gap-1 disabled:opacity-50";

  // ── Sub-panel: pick an IST-anchored time for snooze / next follow-up ─────────
  if (mode === "snooze" || mode === "next") {
    const apply = mode === "snooze" ? snoozeTo : completeWithNextAt;
    const applyCustom = () => { const d = fromISTLocalInput(custom); if (d) apply(d.toISOString()); };
    return (
      <div className="flex flex-col gap-1 shrink-0 w-36">
        <div className="text-[10px] font-medium text-gray-500 flex items-center justify-between">
          {mode === "snooze" ? "Snooze to… (IST)" : "Next follow-up… (IST)"}
          <button type="button" onClick={() => { setMode(null); setCustom(""); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-3 h-3" />
          </button>
        </div>
        {buildPresets().map(p => (
          <button key={p.label} type="button" disabled={busy} onClick={() => apply(p.iso)}
            className={`${btn} border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50`}>
            {p.label}
          </button>
        ))}
        {/* Custom IST date+time — for anything the presets don't cover. */}
        <input type="datetime-local" value={custom} min={nowISTLocalInput()} onChange={e => setCustom(e.target.value)}
          className="text-[10px] border border-gray-200 rounded-lg px-1.5 py-1 dark:bg-slate-800 dark:border-slate-600" />
        <button type="button" disabled={busy || !custom} onClick={applyCustom}
          className={`${btn} border-indigo-400 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40`}>
          Set custom time
        </button>
        {errBanner}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      {phone && (
        <a href={`tel:${phone}`}
          className={`${btn} border-blue-300 bg-white text-blue-700 hover:bg-blue-50`}>
          <Phone className="w-3 h-3" /> Call
        </a>
      )}
      {phone && (
        <a href={waHref(phone)} target="_blank" rel="noopener noreferrer"
          className={`${btn} border-green-300 bg-white text-green-700 hover:bg-green-50`}>
          <MessageCircle className="w-3 h-3" /> WA
        </a>
      )}
      <button type="button" disabled={busy} onClick={markDone}
        className={`${btn} border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50`}>
        <Check className="w-3 h-3" /> {busy ? "…" : "Done"}
      </button>
      <button type="button" disabled={busy} onClick={() => setMode("next")}
        className={`${btn} border-teal-300 bg-white text-teal-700 hover:bg-teal-50`}>
        <Check className="w-3 h-3" /> Done + Next
      </button>
      <button type="button" disabled={busy} onClick={() => setMode("snooze")}
        className={`${btn} border-amber-300 bg-white text-amber-700 hover:bg-amber-50`}>
        <Clock className="w-3 h-3" /> Snooze
      </button>
      <button type="button" disabled={busy} onClick={skip}
        className={`${btn} border-gray-300 bg-white text-gray-600 hover:bg-gray-50`}>
        <SkipForward className="w-3 h-3" /> Skip
      </button>
      {errBanner}
    </div>
  );
}
