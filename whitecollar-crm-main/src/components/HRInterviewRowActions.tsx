"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, CheckCircle, CalendarClock, ClipboardCheck, X, BadgeCheck, CalendarX } from "lucide-react";
import { backdropProps } from "@/lib/useDismiss";
import { waHref } from "@/lib/waOpen";
import { fromISTLocalInput, toISTLocalInput, nowISTLocalInput } from "@/lib/datetime";

type Recommendation = "SELECTED" | "REJECTED" | "HOLD";

export default function HRInterviewRowActions({
  interviewId, candidateId, phone, attendanceStatus, confirmationStatus, scheduledAt, result, recommendation,
}: {
  interviewId: string;
  candidateId: string;
  phone: string | null;
  attendanceStatus: string;
  confirmationStatus?: string;
  scheduledAt?: string;
  result?: string | null;
  recommendation?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"none" | "reschedule" | "result" | "noshow">("none");
  const [error, setError] = useState<string | null>(null);

  // Reschedule state — prefilled to the current slot as IST wall-clock (the zone
  // all interview times are displayed in), so what the recruiter sees == what they edit.
  const [newAt, setNewAt] = useState(scheduledAt ? toISTLocalInput(scheduledAt) : "");
  // Result state.
  const [rec, setRec] = useState<Recommendation>((recommendation as Recommendation) || "SELECTED");
  const [resultText, setResultText] = useState(result || "");
  const [resultNotes, setResultNotes] = useState("");
  // No-show reason (optional).
  const [noShowReason, setNoShowReason] = useState("");

  const closed = attendanceStatus === "ATTENDED" || attendanceStatus === "NO_SHOW" || attendanceStatus === "CANCELLED";

  async function patch(payload: Record<string, unknown>) {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/hr/candidates/${candidateId}/interview`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, ...payload }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setError(e.error || "Action failed. Please try again.");
        return false;
      }
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally { setBusy(false); }
  }

  async function markCompleted() {
    if (await patch({ attendanceStatus: "ATTENDED" })) router.refresh();
  }

  async function markConfirmed() {
    if (await patch({ confirmationStatus: "CONFIRMED" })) router.refresh();
  }

  async function submitNoShow() {
    // API auto-creates a no-show recovery follow-up + logs the activity.
    if (await patch({ attendanceStatus: "NO_SHOW", noShowReason: noShowReason.trim() || null })) {
      setModal("none"); router.refresh();
    }
  }

  async function submitReschedule() {
    if (!newAt) return;
    // Interpret the datetime-local value as IST wall-clock → correct UTC instant,
    // matching how every interview time is displayed (Asia/Kolkata).
    const iso = fromISTLocalInput(newAt)?.toISOString();
    if (!iso) { setError("Invalid date/time."); return; }
    if (await patch({ action: "reschedule", scheduledAt: iso })) {
      setModal("none"); router.refresh();
    }
  }

  async function submitResult() {
    if (await patch({ action: "result", recommendation: rec, result: resultText || null, notes: resultNotes || null })) {
      setModal("none"); router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {phone && (
        <a href={`tel:${phone}`} title="Call" aria-label="Call"
          className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
          <Phone className="w-3.5 h-3.5" />
        </a>
      )}
      {phone && (
        <a href={waHref(phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp"
          className="p-1.5 rounded-md text-[#1ea953] hover:bg-[#25D366]/10 dark:text-[#25D366] dark:hover:bg-[#25D366]/15">
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Confirmation sub-state — record Confirmed / Not Reachable / Not Confirmed
          directly (previously only 'Confirm' existed; the other states were unreachable
          from the UI). Audit #110. */}
      {!closed && ["PENDING", "NOT_REACHABLE", "NOT_CONFIRMED"].includes(confirmationStatus ?? "PENDING") && (
        <select disabled={busy} value={confirmationStatus ?? "PENDING"} title="Confirmation status"
          onChange={async (e) => { if (await patch({ confirmationStatus: e.target.value })) router.refresh(); }}
          className="text-[11px] px-1.5 py-1 rounded-md border border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 disabled:opacity-50">
          <option value="PENDING">Pending confirm</option>
          <option value="CONFIRMED">✓ Confirmed</option>
          <option value="NOT_REACHABLE">Not reachable</option>
          <option value="NOT_CONFIRMED">Not confirmed</option>
        </select>
      )}

      {/* Check-in state on the interview day — Arrived / Late / In-progress
          (previously the only attendance states were Attended/No-Show). Audit #61. */}
      {!closed && (
        <select disabled={busy} title="Check-in status"
          value={["ARRIVED", "LATE", "IN_PROGRESS"].includes(attendanceStatus ?? "") ? attendanceStatus : ""}
          onChange={async (e) => { if (e.target.value && await patch({ attendanceStatus: e.target.value })) router.refresh(); }}
          className="text-[11px] px-1.5 py-1 rounded-md border border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400 bg-white dark:bg-slate-800 disabled:opacity-50">
          <option value="">Check-in…</option>
          <option value="ARRIVED">Arrived</option>
          <option value="LATE">Arrived late</option>
          <option value="IN_PROGRESS">In progress</option>
        </select>
      )}

      {!closed && (
        <button type="button" disabled={busy} onClick={markCompleted}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 disabled:opacity-50">
          <CheckCircle className="w-3 h-3" /> Completed
        </button>
      )}

      {/* No-Show — marks NO_SHOW + auto-creates a recovery follow-up (via API). */}
      {!closed && (
        <button type="button" disabled={busy} onClick={() => { setError(null); setNoShowReason(""); setModal("noshow"); }}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 disabled:opacity-50">
          <CalendarX className="w-3 h-3" /> No-Show
        </button>
      )}

      <button type="button" disabled={busy} onClick={() => { setError(null); setModal("reschedule"); }}
        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30 disabled:opacity-50">
        <CalendarClock className="w-3 h-3" /> Reschedule
      </button>

      <button type="button" disabled={busy} onClick={() => { setError(null); setModal("result"); }}
        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 disabled:opacity-50">
        <ClipboardCheck className="w-3 h-3" /> Record Result
      </button>

      {/* Inline error for direct actions (e.g. "Completed") that have no modal of their own. */}
      {error && modal === "none" && (
        <span className="basis-full text-[11px] text-red-600 dark:text-red-400">{error}</span>
      )}

      {/* ── Reschedule modal ── */}
      {modal === "reschedule" && (
        <Modal title="Reschedule Interview" onClose={() => { setError(null); setModal("none"); }}>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">New date &amp; time <span className="text-gray-400">(IST)</span></label>
          <input type="datetime-local" value={newAt} min={nowISTLocalInput()} onChange={e => setNewAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          {error && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setError(null); setModal("none"); }} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600">Cancel</button>
            <button type="button" disabled={busy || !newAt} onClick={submitReschedule}
              className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">{busy ? "Saving…" : "Reschedule"}</button>
          </div>
        </Modal>
      )}

      {/* ── No-Show modal (optional reason) ── */}
      {modal === "noshow" && (
        <Modal title="Mark as No-Show" onClose={() => { setError(null); setModal("none"); }}>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Marks the candidate No-Show and auto-creates a recovery follow-up for tomorrow morning.
          </p>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Reason (optional)</label>
          <input type="text" value={noShowReason} onChange={e => setNoShowReason(e.target.value)} placeholder="e.g. Didn't pick up, no response"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          {error && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setError(null); setModal("none"); }} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600">Cancel</button>
            <button type="button" disabled={busy} onClick={submitNoShow}
              className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">{busy ? "Saving…" : "Mark No-Show"}</button>
          </div>
        </Modal>
      )}

      {/* ── Record-result modal ── */}
      {modal === "result" && (
        <Modal title="Record Interview Result" onClose={() => { setError(null); setModal("none"); }}>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Recommendation</label>
          <div className="flex gap-2 mb-3">
            {(["SELECTED", "HOLD", "REJECTED"] as Recommendation[]).map(r => (
              <button key={r} type="button" onClick={() => setRec(r)}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  rec === r
                    ? r === "SELECTED" ? "bg-teal-600 text-white border-teal-600"
                      : r === "REJECTED" ? "bg-red-600 text-white border-red-600"
                      : "bg-orange-500 text-white border-orange-500"
                    : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Result / outcome (optional)</label>
          <input type="text" value={resultText} onChange={e => setResultText(e.target.value)} placeholder="e.g. Strong communication, fit for BDM"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm mb-3" />
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Feedback notes (optional)</label>
          <textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)} rows={3} placeholder="Interviewer feedback…"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          {error && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setError(null); setModal("none"); }} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600">Cancel</button>
            <button type="button" disabled={busy} onClick={submitResult}
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{busy ? "Saving…" : "Save Result"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" {...backdropProps(onClose)}>
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl p-5 text-left"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
