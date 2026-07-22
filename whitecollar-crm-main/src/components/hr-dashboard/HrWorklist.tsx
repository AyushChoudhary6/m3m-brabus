"use client";
// ─────────────────────────────────────────────────────────────────────────────
// HrWorklist — the recruiter's single "Do this next" stream (dashboard redesign).
//
// Collapses the separate Call-Now / Pending-Confirm / No-Show / No-Next-Action
// queues into ONE ranked list so the recruiter works straight down it. Each row
// carries everything needed to act WITHOUT opening the candidate:
//   • identity + stage chip + why-it's-here reason + last note + phone inline
//   • one-tap call outcomes (Connected / No answer / Call later) that log the
//     activity AND auto-set the next follow-up server-side (no modal, no typing)
//   • a Message composer (WhatsApp / email) that sends via the CRM — falling
//     back to wa.me / mailto when Meta/Resend aren't configured
//   • one-tap "Confirm" for interviews (sends the confirmation + flips status)
//
// Rows are removed optimistically once actioned so the queue visibly shrinks.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PhoneCall, MessageCircle, CheckCircle2, Clock, AlertTriangle, User,
  ArrowUpRight, X, PhoneMissed, PhoneOff, CalendarClock, Send, ListChecks,
} from "lucide-react";
import { statusColor, statusLabel } from "@/lib/hrStatus";

export type WorklistKind = "overdue" | "today" | "soon" | "confirm" | "noshow" | "nonext";

export interface WorklistItem {
  key: string;               // stable react key (followUpId | interviewId | candidateId)
  kind: WorklistKind;
  candidateId: string;
  interviewId?: string;
  name: string;
  position: string | null;
  status: string;
  reason: string;            // human "why this is on the list"
  lastNote: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  ownerFirstName: string | null;
  dueIso: string | null;
  urgent: boolean;
}

const KIND_META: Record<WorklistKind, { label: string; dot: string }> = {
  overdue: { label: "Overdue", dot: "bg-red-500" },
  today:   { label: "Due today", dot: "bg-amber-500" },
  soon:    { label: "Due soon", dot: "bg-sky-500" },
  confirm: { label: "Confirm interview", dot: "bg-indigo-500" },
  noshow:  { label: "No-show recovery", dot: "bg-rose-500" },
  nonext:  { label: "No next step", dot: "bg-slate-400" },
};

function digits(p: string | null | undefined) { return (p ?? "").replace(/\D/g, ""); }
function fmtDue(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    });
  } catch { return ""; }
}

export function HrWorklist({ items: initial, showOwner }: { items: WorklistItem[]; showOwner: boolean }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [composer, setComposer] = useState<WorklistItem | null>(null);

  const flash = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast((t) => (t === m ? null : t)), 3500);
  }, []);

  const remove = useCallback((key: string) => setItems((xs) => xs.filter((x) => x.key !== key)), []);
  const setRowBusy = (key: string, v: boolean) => setBusy((b) => ({ ...b, [key]: v }));

  // One-tap call outcome → POST the log route (auto-creates the callback follow-up).
  async function logOutcome(it: WorklistItem, type: string, label: string) {
    setRowBusy(it.key, true);
    try {
      const r = await fetch(`/api/hr/candidates/${it.candidateId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Failed");
      flash(`${it.name}: ${label} logged`);
      remove(it.key);
    } catch (e) {
      flash(`Couldn't log — ${String(e).slice(0, 80)}`);
      setRowBusy(it.key, false);
    }
  }

  // One-tap confirm → send the confirmation message + flip the interview to CONFIRMED.
  async function confirmInterview(it: WorklistItem) {
    if (!it.interviewId) return;
    setRowBusy(it.key, true);
    try {
      const when = fmtDue(it.dueIso);
      const msg = `Hi ${it.name.split(" ")[0]}, confirming your interview with White Collar Realty${when ? ` on ${when}` : ""}. Please reply YES to confirm. Looking forward to speaking with you!`;
      // Best-effort send (stub-safe); then record the confirmation.
      const sendRes = await fetch(`/api/hr/candidates/${it.candidateId}/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "whatsapp", body: msg }),
      }).then((r) => r.json()).catch(() => null);
      await fetch(`/api/hr/candidates/${it.candidateId}/interview`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: it.interviewId, confirmationStatus: "CONFIRMED" }),
      });
      if (sendRes?.mode === "stub" && sendRes.fallbackLink) window.open(sendRes.fallbackLink, "_blank", "noopener,noreferrer");
      flash(`${it.name}: interview confirmed${sendRes?.mode === "real" ? " + message sent" : ""}`);
      remove(it.key);
    } catch {
      flash("Couldn't confirm — try again");
      setRowBusy(it.key, false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <Header count={0} />
        <div className="px-4 py-10 text-center">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">All caught up</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Nothing needs your attention right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Do this next" className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <Header count={items.length} />
      <ul className="divide-y divide-gray-100 dark:divide-slate-800">
        {items.map((it) => {
          const meta = KIND_META[it.kind];
          const wa = it.whatsappPhone ?? it.phone;
          const rowBusy = !!busy[it.key];
          const isCall = it.kind === "overdue" || it.kind === "today" || it.kind === "soon" || it.kind === "nonext";
          return (
            <li key={it.key} className={`px-4 py-3 transition-colors ${rowBusy ? "opacity-50 pointer-events-none" : "hover:bg-gray-50/70 dark:hover:bg-slate-800/40"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden />
                    <Link href={`/hr/candidates/${it.candidateId}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 truncate">
                      {it.name}
                    </Link>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(it.status)}`}>{statusLabel(it.status)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap">
                    <span className={`inline-flex items-center gap-1 font-medium ${it.urgent ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-slate-400"}`}>
                      {it.urgent ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {it.reason}{it.dueIso ? ` · ${fmtDue(it.dueIso)}` : ""}
                    </span>
                    {it.position && <span className="text-gray-400 dark:text-slate-500 truncate">{it.position}</span>}
                    {showOwner && it.ownerFirstName && (
                      <span className="inline-flex items-center gap-1 text-gray-400 dark:text-slate-500"><User className="w-3 h-3" />{it.ownerFirstName}</span>
                    )}
                  </div>
                  {it.lastNote && <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 line-clamp-1"><span className="text-gray-400 dark:text-slate-500">Last:</span> {it.lastNote}</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {it.phone && (
                    <a href={`tel:${it.phone}`} title="Call" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {wa && (
                    <button onClick={() => setComposer(it)} title="Message" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Link href={`/hr/candidates/${it.candidateId}`} title="Open" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Primary one-tap actions */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {isCall && (
                  <>
                    <OutcomeBtn onClick={() => logOutcome(it, "CALL_CONNECTED", "Connected")} icon={<PhoneCall className="w-3 h-3" />} tone="emerald">Connected</OutcomeBtn>
                    <OutcomeBtn onClick={() => logOutcome(it, "CALL_NOT_ANSWERED", "No answer")} icon={<PhoneMissed className="w-3 h-3" />} tone="amber">No answer</OutcomeBtn>
                    <OutcomeBtn onClick={() => logOutcome(it, "CALL_LATER", "Call later")} icon={<CalendarClock className="w-3 h-3" />} tone="slate">Call later</OutcomeBtn>
                    <OutcomeBtn onClick={() => logOutcome(it, "CALL_SWITCHED_OFF", "Switched off")} icon={<PhoneOff className="w-3 h-3" />} tone="slate">Off</OutcomeBtn>
                  </>
                )}
                {it.kind === "confirm" && (
                  <OutcomeBtn onClick={() => confirmInterview(it)} icon={<CheckCircle2 className="w-3 h-3" />} tone="indigo">Confirm &amp; notify</OutcomeBtn>
                )}
                {it.kind === "noshow" && (
                  <OutcomeBtn onClick={() => setComposer(it)} icon={<Send className="w-3 h-3" />} tone="rose">Send recovery message</OutcomeBtn>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {composer && <Composer item={composer} onClose={() => setComposer(null)} onSent={(m) => { flash(m); setComposer(null); }} />}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      )}
    </section>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
          <ListChecks className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">Do this next</h2>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">One ranked list — call, message, confirm without leaving the page</p>
        </div>
      </div>
      {count > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 shrink-0">{count}</span>}
    </div>
  );
}

const TONE: Record<string, string> = {
  emerald: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50",
  amber: "text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50",
  slate: "text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700",
  indigo: "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50",
  rose: "text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30 dark:hover:bg-rose-900/50",
};
function OutcomeBtn({ children, onClick, icon, tone }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; tone: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${TONE[tone]}`}>
      {icon}{children}
    </button>
  );
}

// ── Message composer modal (WhatsApp / email templates + free text) ──────────
interface TemplateItem { id: string; name: string; subject: string | null; rendered: { body: string; subject: string | null } }
function Composer({ item, onClose, onSent }: { item: WorklistItem; onClose: () => void; onSent: (m: string) => void }) {
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [subject, setSubject] = useState("White Collar Realty");
  const [bodyText, setBodyText] = useState(`Hi ${item.name.split(" ")[0]}, `);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTemplates = useCallback(async (ch: "whatsapp" | "email") => {
    setLoading(true);
    try {
      const kind = ch === "whatsapp" ? "WHATSAPP" : "EMAIL";
      const r = await fetch(`/api/hr/templates/render?candidateId=${item.candidateId}&kind=${kind}`);
      const j = await r.json().catch(() => ({ items: [] }));
      setTemplates(j.items ?? []);
    } finally { setLoading(false); }
  }, [item.candidateId]);

  // Load WhatsApp templates once when the composer opens.
  useEffect(() => { loadTemplates("whatsapp"); }, [loadTemplates]);

  function pick(t: TemplateItem) {
    setBodyText(t.rendered.body);
    if (t.rendered.subject) setSubject(t.rendered.subject);
  }

  async function send() {
    if (!bodyText.trim()) return;
    setSending(true);
    try {
      const r = await fetch(`/api/hr/candidates/${item.candidateId}/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, body: bodyText, subject }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Send failed");
      if (j.mode === "stub" && j.fallbackLink) {
        window.open(j.fallbackLink, "_blank", "noopener,noreferrer");
        onSent(`Opened ${channel === "whatsapp" ? "WhatsApp" : "email"} for ${item.name}`);
      } else {
        onSent(`Message sent to ${item.name}`);
      }
    } catch (e) {
      onSent(`Couldn't send — ${String(e).slice(0, 60)}`);
    } finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Message {item.name}</h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Send from the CRM — falls back to your app if not yet connected</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-4 py-3 space-y-3 overflow-y-auto">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-slate-700 p-0.5 text-xs font-semibold">
            {(["whatsapp", "email"] as const).map((ch) => (
              <button key={ch} onClick={() => { setChannel(ch); loadTemplates(ch); }}
                className={`px-3 py-1 rounded-md capitalize ${channel === ch ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-gray-600 dark:text-slate-300"}`}>
                {ch}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-xs text-gray-400">Loading templates…</p>
          ) : templates.length > 0 ? (
            <div className="flex gap-1.5 flex-wrap">
              {templates.map((t) => (
                <button key={t.id} onClick={() => pick(t)} className="text-[11px] px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200">
                  {t.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No {channel} templates — type a message below.</p>
          )}

          {channel === "email" && (
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          )}
          <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={6}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none" />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 dark:border-slate-800">
          <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={send} disabled={sending || !bodyText.trim()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            <Send className="w-3.5 h-3.5" />{sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HrWorklist;
