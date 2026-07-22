"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw } from "lucide-react";

type Current = { name?: string | null; phone?: string | null; email?: string | null; experience?: string | null; currentCompany?: string | null; currentProfile?: string | null };

// Auto-fill EMPTY candidate fields from a résumé, for an EXISTING candidate — the
// add-form did this only at creation, so a later upload never re-filled (audit #122).
// Only writes fields that are currently blank; never overwrites recruiter data.
export default function HRResumeAutofill({ candidateId, current }: { candidateId: string; current: Current }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const ok = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") || file.type.startsWith("image/");
    if (!ok) { setErr("Auto-fill reads PDF or JPG/PNG résumés only."); return; }
    setBusy(true); setErr(null); setMsg(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/hr/extract-resume", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(json?.error || "Couldn't read the résumé."); return; }
      const x: Record<string, string> = json.fields ?? {};
      // Only fill fields the candidate is missing.
      const payload: Record<string, string> = {};
      for (const k of ["name", "phone", "email", "experience", "currentCompany", "currentProfile"] as const) {
        if (x[k] && !((current[k] ?? "").toString().trim())) payload[k] = x[k];
      }
      if (Object.keys(payload).length === 0) { setMsg("Nothing to fill — the résumé matched fields that are already set."); return; }
      const put = await fetch(`/api/hr/candidates/${candidateId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!put.ok) { const d = await put.json().catch(() => ({})); setErr(d?.error || "Couldn't save the parsed fields."); return; }
      setMsg(`Filled ${Object.keys(payload).length} empty field${Object.keys(payload).length === 1 ? "" : "s"} from the résumé.`);
      router.refresh();
    } catch { setErr("Auto-fill failed — try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-1">
      <input ref={inputRef} type="file" accept="application/pdf,image/*" onChange={onFile} className="hidden" />
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/30 disabled:opacity-50">
        {busy ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />} Auto-fill empty fields from résumé
      </button>
      {msg && <div className="text-[11px] text-emerald-600 dark:text-emerald-400">{msg}</div>}
      {err && <div className="text-[11px] text-red-600 dark:text-red-400">{err}</div>}
    </div>
  );
}
