"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STATUS_DEFS } from "@/lib/hrStatus";
import { validateCandidateName, normalizeContactPhone, validateCandidateEmail, validateResumeFile, validateHasLetters, validateExperience, parseExperienceYears } from "@/lib/hrValidation";

interface Agent { id: string; name: string; }
// canAssign: whether this user may pick an owner other than themselves.
interface Props { agents: Agent[]; meId: string; canAssign?: boolean }
interface DupMatch { id: string; name: string; phone: string | null; whatsappPhone: string | null; email: string | null; status: string; }

const SOURCES   = ["Naukri", "Indeed", "Referral", "Walk-in", "LinkedIn", "Database", "Consultant", "Email", "Whatsapp", "Other"];
const NOTICE    = ["Immediate", "7 days", "15 days", "30 days", "45 days", "60 days", "90 days", "Serving Notice"];

const FOLLOWUP_TYPES: [string, string][] = [
  ["CALL_BACK", "Call Back"], ["INTERVIEW_CONFIRMATION", "Interview Confirmation"], ["REMINDER", "Reminder"],
  ["WHATSAPP_FOLLOWUP", "WhatsApp Follow-Up"], ["EMAIL_FOLLOWUP", "Email Follow-Up"], ["SALARY_DISCUSSION", "Salary Discussion"],
  ["OFFER_DISCUSSION", "Offer Discussion"], ["JOINING_FOLLOWUP", "Joining Follow-Up"], ["NO_SHOW_RECOVERY", "No Show Recovery"],
  ["CUSTOM", "Custom"],
];

export default function HRAddCandidateForm({ agents, meId, canAssign = true }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 Candidate · 1 Role · 2 Save
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [dupBlock, setDupBlock] = useState<{ id: string; name: string } | null>(null);
  const [dupMatches, setDupMatches] = useState<DupMatch[]>([]);
  const [dupOverride, setDupOverride] = useState(false);
  const meName = agents.find(a => a.id === meId)?.name ?? "You";

  const [form, setForm] = useState({
    name: "", phone: "", whatsappPhone: "", email: "", altEmail: "",
    location: "",
    source: "", experience: "", realEstateExperience: "",
    salesExperience: "", callingExperience: "",
    currentCompany: "", currentProfile: "", currentSalary: "", expectedSalary: "", noticePeriod: "",
    status: "NEW", followUpType: "CALL_BACK",
    remarks: "",
    // ── Recruiting scorecard (optional) ──
    contactedBy: "", sopMet: "", inviteMailSent: "", candidateAcknowledged: "", arrivedOnTime: "",
    scorePersonality: "", scoreConfidence: "", scoreCommunication: "", scoreBehaviour: "",
    scoreGrasping: "", scoreListening: "", scoreNegotiation: "", scoreCultureFit: "",
    highestProductSold: "", dealValue: "", avgIncentive: "", incentiveConsistent: "",
    callsPerDay: "", connectedCallsPerDay: "", lastSaleDate: "",
    hrDecision: "", hrDetailedRemarks: "", finalStatus: "",
  });
  const [showScorecard, setShowScorecard] = useState(false);
  // Source "Other" free-text.
  const [sourceOther, setSourceOther] = useState("");
  // Owner pickers are typeahead inputs (datalist-backed) resolving to a user id.
  const [primaryOwnerText, setPrimaryOwnerText] = useState(canAssign ? meName : meName);
  const [secondaryOwnerText, setSecondaryOwnerText] = useState("");

  const [followDate, setFollowDate] = useState("");
  const [followTime, setFollowTime] = useState("");
  const [followUpCustom, setFollowUpCustom] = useState(""); // free-text label when Follow-up Type = Custom
  const [files, setFiles] = useState<File[]>([]);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // Live input filters — invalid characters never even appear as you type.
  // Name: letters + spaces + . ' - only (digits / specials are dropped instantly).
  const onName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, name: e.target.value.replace(/[^\p{L}\s.'-]/gu, "") }));
  // Phone / WhatsApp: digits and phone punctuation only (letters are dropped instantly).
  const onPhone = (k: "phone" | "whatsappPhone") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value.replace(/[^\d+\s()-]/g, "") }));

  // Live duplicate lookup as mobile / WhatsApp / email are filled.
  useEffect(() => {
    const { phone, whatsappPhone, email } = form;
    if (!phone && !whatsappPhone && !email) { setDupMatches([]); return; }
    const t = setTimeout(async () => {
      const qs = new URLSearchParams();
      if (phone) qs.set("phone", phone);
      if (whatsappPhone) qs.set("whatsapp", whatsappPhone);
      if (email) qs.set("email", email);
      try {
        const res = await fetch(`/api/hr/candidates/check-duplicate?${qs.toString()}`);
        const json = await res.json();
        const matches = Array.isArray(json.matches) ? json.matches : [];
        setDupMatches(matches);
        if (matches.length === 0) setDupOverride(false);
      } catch { /* ignore transient errors */ }
    }, 450);
    return () => clearTimeout(t);
  }, [form.phone, form.whatsappPhone, form.email]);

  // ── Resume attach + validation ────────────────────────────────────────────
  // Every incoming file is checked for a supported format + size BEFORE it is
  // accepted; rejected files never enter the upload list.
  function acceptFiles(list: FileList | null): File[] {
    if (!list || list.length === 0) return [];
    const good: File[] = [];
    const errs: string[] = [];
    for (const f of Array.from(list)) {
      const e = validateResumeFile(f);
      if (e) errs.push(e); else good.push(f);
    }
    setFileErr(errs.length ? errs.join(" ") : null);
    if (good.length) setFiles(prev => [...prev, ...good]);
    return good;
  }

  // Hero path: attach the dropped/picked resume AND immediately auto-extract, so the
  // default motion is "drop resume → fields fill → save". Extraction reads the File
  // directly (state is async).
  function onHeroFiles(list: FileList | null) {
    const good = acceptFiles(list);
    const first = good[0];
    if (!first) return;
    const readable = first.type === "application/pdf" || first.name.toLowerCase().endsWith(".pdf") || first.type.startsWith("image/");
    if (readable) void extractResume(first);
    else setExtractMsg("Attached — auto-fill reads PDF or image resumes only, so fill the form manually for this file.");
  }

  // AI auto-fill: read a resume and pre-fill EMPTY fields only (user reviews before save).
  async function extractResume(fileArg?: File) {
    const f = fileArg ?? files[0];
    if (!f) return;
    const okFmt = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf") || f.type.startsWith("image/");
    if (!okFmt) { setExtractMsg("Auto-fill reads PDF or image resumes only."); return; }
    setExtracting(true); setExtractMsg(null);
    try {
      const fd = new FormData(); fd.append("file", f);
      const res = await fetch("/api/hr/extract-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setExtractMsg(json.error ?? "Could not read the resume."); return; }
      const x = json.fields ?? {};
      setForm(prev => ({
        ...prev,
        name: prev.name || x.name || "",
        phone: prev.phone || x.phone || "",
        email: prev.email || x.email || "",
        experience: prev.experience || x.experience || "",
        currentCompany: prev.currentCompany || x.currentCompany || "",
        currentProfile: prev.currentProfile || x.currentProfile || "",
      }));
      const got = [x.name, x.phone, x.email, x.experience, x.currentCompany, x.currentProfile].filter(Boolean).length;
      setExtractMsg(got ? `✨ Auto-filled ${got} field${got !== 1 ? "s" : ""} — review before saving.` : "No fields could be read — please fill manually.");
    } catch {
      setExtractMsg("Network error — please try again.");
    } finally { setExtracting(false); }
  }

  function resolveAgentId(text: string): string {
    const t = text.trim().toLowerCase();
    if (!t) return "";
    return agents.find(a => a.name.toLowerCase() === t)?.id ?? "";
  }

  // ── Per-step validation. Returns the first error message, or null if the step passes.
  function validateStep(s: number): string | null {
    // NOTHING is required — we only validate the FORMAT of fields the user filled.
    if (s === 0) {
      if (form.name.trim()) { const e = validateCandidateName(form.name); if (e) return e; }
      if (form.phone.trim()) { const ph = normalizeContactPhone(form.phone); if (!ph.ok) return ph.error; }
      if (form.whatsappPhone.trim()) {
        const w = normalizeContactPhone(form.whatsappPhone);
        if (!w.ok) return "WhatsApp number: " + w.error;
      }
      const emailErr = validateCandidateEmail(form.email, false);
      if (emailErr) return emailErr;
      const locErr = validateHasLetters(form.location, { label: "Current location" });
      if (locErr) return locErr;
      // Duplicate hard-stop is surfaced here too (contact fields live on this step).
      if (dupMatches.length > 0 && !dupOverride) {
        return "This looks like a duplicate. Open the existing profile above, or tick “Add anyway” to continue.";
      }
      return null;
    }
    if (s === 1) {
      const expErr = validateExperience(form.experience, { label: "Total experience" });
      if (expErr) return expErr;
      const reErr = validateExperience(form.realEstateExperience, { label: "Real estate experience" });
      if (reErr) return reErr;
      // Real-estate experience is a SUBSET of total experience — it can never exceed it.
      const totalY = parseExperienceYears(form.experience);
      const reY = parseExperienceYears(form.realEstateExperience);
      if (totalY !== null && reY !== null && reY > totalY) {
        return "Real estate experience can't be more than total experience.";
      }
      const compErr = validateHasLetters(form.currentCompany, { label: "Present company" });
      if (compErr) return compErr;
      const desigErr = validateHasLetters(form.currentProfile, { label: "Designation" });
      if (desigErr) return desigErr;
      return null;
    }
    return null;
  }

  function goNext() {
    const e = validateStep(step);
    if (e) { setErr(e); return; }
    setErr(null);
    setStep(s => Math.min(2, s + 1));
  }
  function goStep(target: number) {
    // Allow jumping back freely; forward only if every earlier step passes.
    if (target <= step) { setErr(null); setStep(target); return; }
    for (let s = step; s < target; s++) {
      const e = validateStep(s);
      if (e) { setErr(e); setStep(s); return; }
    }
    setErr(null); setStep(target);
  }

  async function submit(mode: "save" | "interview" | "followup") {
    setErr(null); setOk(null); setDupBlock(null);

    // Re-run every step's validation so a hand-edited final step can't skip checks.
    for (let s = 0; s <= 2; s++) {
      const e = validateStep(s);
      if (e) { setErr(e); setStep(s); return; }
    }

    // Phone is optional; normalize only when provided.
    const ph = form.phone.trim() ? normalizeContactPhone(form.phone) : null;
    const wa = form.whatsappPhone.trim() ? normalizeContactPhone(form.whatsappPhone) : null;
    if (ph && !ph.ok) { setErr(ph.error); setStep(0); return; }

    const effectiveTime = followDate && !followTime ? "09:00" : followTime;
    const nextActionDate = followDate && effectiveTime ? `${followDate}T${effectiveTime}` : "";

    const effectiveSource = form.source === "Other" ? (sourceOther.trim() || "Other") : form.source;

    const primaryOwnerId = canAssign ? (resolveAgentId(primaryOwnerText) || meId) : meId;
    const secondaryOwnerId = canAssign ? resolveAgentId(secondaryOwnerText) : "";

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: ph && ph.ok ? ph.value : "",
      whatsappPhone: wa && wa.ok ? wa.value : "",
      email: form.email.trim(),
      source: effectiveSource,
      primaryOwnerId,
      secondaryOwnerId,
      remarks: form.remarks.trim(),
      followUpCustom: form.followUpType === "CUSTOM" ? followUpCustom.trim() : "",
      nextActionDate,
    };

    setBusy(true);
    let res: Response, json: { candidate?: { id: string }; existingId?: string; existingName?: string; error?: string };
    try {
      res = await fetch("/api/hr/candidates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      json = await res.json();
    } catch { setBusy(false); setErr("Network error — please try again."); return; }

    if (res.status === 409) {
      setBusy(false); setStep(0);
      if (json.existingId) setDupBlock({ id: json.existingId, name: json.existingName ?? "this candidate" });
      setErr("A candidate with the same mobile / WhatsApp / email already exists — open the existing profile above.");
      return;
    }
    if (!res.ok || !json.candidate) { setBusy(false); setErr(json.error ?? "Failed to add candidate."); return; }

    const id = json.candidate.id;
    setOk(`✅ ${form.name.trim()} added.${followDate && !followTime ? " Follow-up set for 9:00 AM." : ""}`);

    if (files.length) {
      setUploading(true);
      for (const f of files) {
        const fd = new FormData(); fd.append("file", f);
        try { await fetch(`/api/hr/candidates/${id}/resume`, { method: "POST", body: fd }); } catch { /* keep going */ }
      }
      setUploading(false);
    }

    const dest = mode === "interview" ? `/hr/candidates/${id}?do=interview`
      : mode === "followup" ? `/hr/candidates/${id}?do=followup`
        : `/hr/candidates/${id}`;
    router.push(dest);
  }

  const inp = "w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b1a33]/20 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100";
  const lbl = "block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1";
  const section = "text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100 dark:border-slate-700 pb-1.5 mb-3";
  const req = <span className="text-red-500">*</span>;
  const opt = <span className="text-[10px] text-gray-400">(optional)</span>;

  const showDupWarning = dupBlock || dupMatches.length > 0;
  const dupGate = dupMatches.length > 0 && !dupOverride;
  const STEPS = ["Candidate", "Experience", "Assign & Save"];

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (step < 2) goNext(); else submit("save"); }}
      className="card p-5 space-y-5"
    >
      {/* ── Resume-first hero: drop a CV → AI fills the fields → review → save. ── */}
      <label
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onHeroFiles(e.dataTransfer.files); }}
        className={`block rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition ${
          dragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
          onChange={e => { onHeroFiles(e.target.files); e.target.value = ""; }}
          className="hidden"
        />
        <div className="text-3xl mb-1">📄✨</div>
        <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          {extracting ? "Reading resume…" : "Drop a resume to auto-fill"}
        </div>
        <div className="text-[11px] text-indigo-500/80 dark:text-indigo-300/70 mt-0.5">
          PDF or photo · we read name, phone, email, experience &amp; company, then you review below
        </div>
        {extractMsg && <div className="text-[11px] mt-2 text-gray-600 dark:text-slate-300">{extractMsg}</div>}
        {fileErr && <div className="text-[11px] mt-1 text-red-600">{fileErr}</div>}
      </label>

      {/* Duplicate warning (live + hard block) */}
      {showDupWarning && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm dark:bg-amber-900/20 dark:border-amber-700">
          <div className="font-semibold text-amber-800 dark:text-amber-300">
            {dupBlock ? "⚠ This candidate already exists" : "⚠ Possible duplicate"}
          </div>
          {dupBlock ? (
            <div className="text-amber-700 dark:text-amber-200 mt-1">
              <b>{dupBlock.name}</b> already has a profile with the same mobile / WhatsApp / email.{" "}
              <a href={`/hr/candidates/${dupBlock.id}`} className="text-blue-600 hover:underline font-medium">Open existing profile →</a>
            </div>
          ) : (
            <div className="text-amber-700 dark:text-amber-200 mt-1 space-y-0.5">
              {dupMatches.map(m => (
                <div key={m.id}>
                  <a href={`/hr/candidates/${m.id}`} className="text-blue-600 hover:underline font-medium">{m.name}</a>
                  {m.phone && <span className="text-amber-600"> · {m.phone}</span>}
                  <span className="text-[11px] text-amber-500"> · {m.status.replace(/_/g, " ").toLowerCase()}</span>
                </div>
              ))}
              <label className="flex items-center gap-1.5 mt-2 text-[12px] font-medium text-amber-800 dark:text-amber-200 cursor-pointer">
                <input type="checkbox" checked={dupOverride} onChange={e => setDupOverride(e.target.checked)} />
                Add anyway — I&apos;ve checked this isn&apos;t the same person
              </label>
            </div>
          )}
        </div>
      )}

      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label} type="button" onClick={() => goStep(i)}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition ${
              i === step
                ? "bg-[#1a2e4a] text-white"
                : i < step
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] ${i === step ? "bg-white/20" : i < step ? "bg-emerald-500 text-white" : "bg-gray-300 text-white dark:bg-slate-600"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ══ STEP 1 — Candidate & Contact (all mandatory) ══ */}
      {step === 0 && (
        <div>
          <div className={section}>Candidate &amp; Contact</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={lbl}>Candidate Name {opt}</label>
              <input className={inp} value={form.name} onChange={onName} placeholder="Full name (letters only)" />
            </div>
            <div>
              <label className={lbl}>Mobile Number {opt}</label>
              <input className={inp} value={form.phone} onChange={onPhone("phone")} placeholder="+91 98765 43210 / +971 5X XXX XXXX" type="tel" inputMode="tel" />
              <p className="text-[10px] text-gray-400 mt-0.5">India (10-digit, starts 6–9) or Dubai (+971 5…)</p>
            </div>
            <div>
              <label className={lbl}>WhatsApp Number {opt}</label>
              <input className={inp} value={form.whatsappPhone} onChange={onPhone("whatsappPhone")} placeholder="If different from mobile" type="tel" inputMode="tel" />
            </div>
            <div>
              <label className={lbl}>Email {opt}</label>
              <input className={inp} value={form.email} onChange={set("email")} type="email" inputMode="email" placeholder="candidate@email.com" />
            </div>
            <div>
              <label className={lbl}>Alt Email {opt}</label>
              <input className={inp} value={form.altEmail} onChange={set("altEmail")} type="email" inputMode="email" placeholder="Secondary email" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Location {opt}</label>
              <input className={inp} value={form.location} onChange={set("location")} placeholder="e.g. Gurgaon" />
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Experience & Company ══ */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <div className={section}>Experience &amp; Company</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Source Portal {opt}</label>
                <select className={inp} value={form.source} onChange={set("source")}>
                  <option value="">— Select —</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {form.source === "Other" && (
                <div>
                  <label className={lbl}>Source name {opt}</label>
                  <input className={inp} value={sourceOther} onChange={e => setSourceOther(e.target.value)} placeholder="e.g. Apna, JobHai, campus drive…" />
                </div>
              )}
              <div>
                <label className={lbl}>Total Experience {opt}</label>
                <input className={inp} value={form.experience} onChange={set("experience")} placeholder="e.g. 3 years" />
              </div>
              <div>
                <label className={lbl}>Sales Experience {opt}</label>
                <input className={inp} value={form.salesExperience} onChange={set("salesExperience")} placeholder="e.g. 2 years" />
              </div>
              <div>
                <label className={lbl}>Calling Experience {opt}</label>
                <input className={inp} value={form.callingExperience} onChange={set("callingExperience")} placeholder="e.g. 1 year" />
              </div>
              <div>
                <label className={lbl}>Real Estate Experience {opt}</label>
                <input className={inp} value={form.realEstateExperience} onChange={set("realEstateExperience")} placeholder="e.g. 1 year" />
              </div>
              <div>
                <label className={lbl}>Present Company {opt}</label>
                <input className={inp} value={form.currentCompany} onChange={set("currentCompany")} />
              </div>
              <div>
                <label className={lbl}>Designation {opt}</label>
                <input className={inp} value={form.currentProfile} onChange={set("currentProfile")} placeholder="e.g. Sales Executive" />
              </div>
              <div>
                <label className={lbl}>Current Salary (₹ /month) {opt}</label>
                <input className={inp} value={form.currentSalary} onChange={set("currentSalary")} type="number" placeholder="25000" />
              </div>
              <div>
                <label className={lbl}>Expected Salary (₹ /month) {opt}</label>
                <input className={inp} value={form.expectedSalary} onChange={set("expectedSalary")} type="number" placeholder="35000" />
              </div>
              <div>
                <label className={lbl}>Notice Period {opt}</label>
                <select className={inp} value={form.noticePeriod} onChange={set("noticePeriod")}>
                  <option value="">— Select —</option>
                  {NOTICE.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Assignment, Status, Resume ══ */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <div className={section}>Ownership</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Primary Owner</label>
                {canAssign ? (
                  <>
                    <input className={inp} list="hr-agents" value={primaryOwnerText}
                      onChange={e => setPrimaryOwnerText(e.target.value)} placeholder="Type to search team…" />
                    {primaryOwnerText.trim() && !resolveAgentId(primaryOwnerText) && (
                      <p className="text-[10px] text-amber-600 mt-0.5">No exact match — will default to you ({meName}).</p>
                    )}
                  </>
                ) : (
                  <div className={`${inp} bg-gray-50 dark:bg-slate-900/40 text-gray-600 dark:text-slate-300 flex items-center`}>
                    {meName} <span className="ml-1 text-[11px] text-gray-400">(you)</span>
                  </div>
                )}
              </div>
              <div>
                <label className={lbl}>Secondary Owner {opt}</label>
                {canAssign ? (
                  <input className={inp} list="hr-agents" value={secondaryOwnerText}
                    onChange={e => setSecondaryOwnerText(e.target.value)} placeholder="Type to search team…" />
                ) : (
                  <div className={`${inp} bg-gray-50 dark:bg-slate-900/40 text-gray-400 dark:text-slate-500 flex items-center`}>— None —</div>
                )}
              </div>
              <datalist id="hr-agents">
                {agents.map(a => <option key={a.id} value={a.name} />)}
              </datalist>
            </div>
          </div>

          <div>
            <div className={section}>Status &amp; Follow-up</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Current Status</label>
                {/* Only ACTIVE statuses — a brand-new candidate is never "closed". */}
                <select className={inp} value={form.status} onChange={set("status")}>
                  {ACTIVE_STATUS_DEFS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Follow Up Date {opt}</label>
                <input className={inp} type="date" value={followDate} onChange={e => setFollowDate(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Next Follow-up Time {opt}</label>
                <input className={inp} type="time" value={followTime} onChange={e => setFollowTime(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Follow-up Type {opt}</label>
                <select className={inp} value={form.followUpType} onChange={set("followUpType")}>
                  {FOLLOWUP_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                {form.followUpType === "CUSTOM" && (
                  <input className={inp + " mt-2"} value={followUpCustom} onChange={e => setFollowUpCustom(e.target.value)}
                    placeholder="Name this follow-up (e.g. Document collection)" />
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Initial HR Notes {opt}</label>
                <textarea className={inp} value={form.remarks} onChange={set("remarks")} rows={2} placeholder="First impressions, screening notes…" />
              </div>
            </div>
            {followDate && !followTime && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">No time set — this follow-up will be scheduled for 9:00 AM.</p>
            )}
          </div>

          {/* ── Recruiting scorecard (optional, collapsed) — same fields as import/detail ── */}
          <div>
            <button type="button" onClick={() => setShowScorecard(s => !s)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 transition">
              <span>{showScorecard ? "▾" : "▸"} Recruiting scorecard{showScorecard ? "" : " — screening, interview scores, sales record, HR decision"}</span>
              <span className="text-[10px] text-gray-400">optional</span>
            </button>
            {showScorecard && (
              <div className="mt-4 space-y-5">
                <div>
                  <div className={section}>Screening</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={lbl}>Contacted By</label><input className={inp} value={form.contactedBy} onChange={set("contactedBy")} placeholder="Recruiter name" /></div>
                    <div><label className={lbl}>SOP Met?</label><input className={inp} value={form.sopMet} onChange={set("sopMet")} placeholder="Yes / No" /></div>
                    <div><label className={lbl}>F2F Invite Sent?</label><input className={inp} value={form.inviteMailSent} onChange={set("inviteMailSent")} placeholder="Yes / No" /></div>
                    <div><label className={lbl}>Candidate Acknowledged?</label><input className={inp} value={form.candidateAcknowledged} onChange={set("candidateAcknowledged")} placeholder="Yes / No" /></div>
                    <div><label className={lbl}>Arrived On Time?</label><input className={inp} value={form.arrivedOnTime} onChange={set("arrivedOnTime")} placeholder="Yes / No" /></div>
                  </div>
                </div>
                <div>
                  <div className={section}>Interview Scorecard</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={lbl}>Personality</label><input className={inp} value={form.scorePersonality} onChange={set("scorePersonality")} placeholder="e.g. Good / 7/10" /></div>
                    <div><label className={lbl}>Confidence</label><input className={inp} value={form.scoreConfidence} onChange={set("scoreConfidence")} /></div>
                    <div><label className={lbl}>Communication</label><input className={inp} value={form.scoreCommunication} onChange={set("scoreCommunication")} /></div>
                    <div><label className={lbl}>Behaviour</label><input className={inp} value={form.scoreBehaviour} onChange={set("scoreBehaviour")} /></div>
                    <div><label className={lbl}>Grasping Power</label><input className={inp} value={form.scoreGrasping} onChange={set("scoreGrasping")} /></div>
                    <div><label className={lbl}>Listening Ability</label><input className={inp} value={form.scoreListening} onChange={set("scoreListening")} /></div>
                    <div><label className={lbl}>Negotiation Ability</label><input className={inp} value={form.scoreNegotiation} onChange={set("scoreNegotiation")} /></div>
                    <div><label className={lbl}>Culture Fit</label><input className={inp} value={form.scoreCultureFit} onChange={set("scoreCultureFit")} /></div>
                  </div>
                </div>
                <div>
                  <div className={section}>Sales Track Record</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={lbl}>Highest Product Sold</label><input className={inp} value={form.highestProductSold} onChange={set("highestProductSold")} /></div>
                    <div><label className={lbl}>Deal Value (₹)</label><input className={inp} value={form.dealValue} onChange={set("dealValue")} /></div>
                    <div><label className={lbl}>Avg Incentive</label><input className={inp} value={form.avgIncentive} onChange={set("avgIncentive")} /></div>
                    <div><label className={lbl}>Incentive Consistent?</label><input className={inp} value={form.incentiveConsistent} onChange={set("incentiveConsistent")} placeholder="Yes / No" /></div>
                    <div><label className={lbl}>Calls / Day</label><input className={inp} value={form.callsPerDay} onChange={set("callsPerDay")} /></div>
                    <div><label className={lbl}>Connected Calls / Day</label><input className={inp} value={form.connectedCallsPerDay} onChange={set("connectedCallsPerDay")} /></div>
                    <div><label className={lbl}>Last Sale Date</label><input className={inp} value={form.lastSaleDate} onChange={set("lastSaleDate")} placeholder="e.g. Jun 2026" /></div>
                  </div>
                </div>
                <div>
                  <div className={section}>HR Decision</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={lbl}>HR Decision</label><input className={inp} value={form.hrDecision} onChange={set("hrDecision")} placeholder="Selected / Rejected / Hold" /></div>
                    <div><label className={lbl}>Final Status</label><input className={inp} value={form.finalStatus} onChange={set("finalStatus")} /></div>
                    <div className="sm:col-span-2"><label className={lbl}>HR Detailed Remarks</label><textarea className={inp} value={form.hrDetailedRemarks} onChange={set("hrDetailedRemarks")} rows={2} placeholder="Detailed HR assessment notes…" /></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className={section}>Resume {opt}</div>
            <label className="block border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a2e4a] transition">
              <input
                type="file" multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
                onChange={e => { acceptFiles(e.target.files); e.target.value = ""; }}
                className="hidden"
              />
              <div className="text-2xl mb-1">📎</div>
              <div className="text-sm text-gray-500">
                Upload resume — PDF, DOC, DOCX, or image · <b className="text-[#1a2e4a] dark:text-blue-400">click to browse</b>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Max 5 MB each · unsupported files are rejected automatically.</div>
            </label>
            {fileErr && <div className="mt-1 text-[11px] text-red-600">{fileErr}</div>}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-1.5">
                    <span className="shrink-0">{f.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                    <span className="flex-1 min-w-0 truncate text-gray-700 dark:text-slate-200">{f.name}</span>
                    <span className="text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-500 hover:text-red-700 shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 dark:bg-red-900/20 dark:border-red-700">{err}</div>}
      {ok && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">{ok}</div>}

      {/* ── Footer navigation ── */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-gray-100 dark:border-slate-700 mt-1">
        {step > 0 ? (
          <button type="button" onClick={() => goStep(step - 1)}
            className="btn justify-center px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm dark:border-slate-600 dark:text-slate-300">
            ← Back
          </button>
        ) : (
          <a href="/hr/candidates" className="btn justify-center px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm dark:border-slate-600 dark:text-slate-300">
            Cancel
          </a>
        )}

        {step < 2 ? (
          <button type="button" onClick={goNext}
            className="btn btn-primary flex-1 justify-center">
            Next →
          </button>
        ) : (
          <>
            <button type="button" disabled={busy || dupGate || !(form.name.trim() || form.phone.trim())} onClick={() => submit("save")}
              title={dupGate ? "Possible duplicate — open the existing profile or tick “Add anyway”." : undefined}
              className="btn btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? (uploading ? "Uploading resume…" : "Saving…") : "Save"}
            </button>
            <button type="button" disabled={busy || dupGate || !(form.name.trim() || form.phone.trim())} onClick={() => submit("interview")}
              title={dupGate ? "Possible duplicate — open the existing profile or tick “Add anyway”." : undefined}
              className="btn justify-center flex-1 border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg text-sm dark:border-purple-700 dark:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
              🎯 Save &amp; Interview
            </button>
            <button type="button" disabled={busy || dupGate || !(form.name.trim() || form.phone.trim())} onClick={() => submit("followup")}
              title={dupGate ? "Possible duplicate — open the existing profile or tick “Add anyway”." : undefined}
              className="btn justify-center flex-1 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-sm dark:border-amber-700 dark:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed">
              📅 Save &amp; Follow-up
            </button>
          </>
        )}
      </div>
    </form>
  );
}
