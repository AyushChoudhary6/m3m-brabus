import { requireUser } from "@/lib/auth";
import { getBrabusLeads, brabusConfigured, type BrabusLead } from "@/lib/brabus-db";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// BRABUS — website leads from the M3M Brabus site.
//
// Read-only view of every enquiry submitted on m3m-brabus, pulled live from the
// site's Neon database (the same records mirrored to Google Sheets). This tab
// does not write anything; it is a window onto the website's lead store.
// ─────────────────────────────────────────────────────────────────────────────

function fmtIST(d: Date) {
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const cls = s.includes("fresh")
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : s.includes("lost") || s.includes("reject")
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {status || "—"}
    </span>
  );
}

export default async function BrabusPage() {
  await requireUser(); // page is already behind the (app) auth layout; this gives us the user context

  let leads: BrabusLead[] = [];
  let error: string | null = null;

  if (brabusConfigured) {
    try {
      leads = await getBrabusLeads(500);
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not reach the Brabus database.";
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Brabus — Website Leads
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every enquiry submitted on the M3M Brabus site, live from Neon (also mirrored to Google Sheets).
          </p>
        </div>
        {brabusConfigured && !error && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </span>
        )}
      </div>

      {/* Not configured */}
      {!brabusConfigured && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Brabus database not connected.</p>
          <p className="mt-1">
            Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">BRABUS_DATABASE_URL</code> in the CRM
            <code className="mx-1 rounded bg-amber-100 px-1 dark:bg-amber-900/60">.env</code> to the M3M Brabus Neon
            connection string, then restart the dev server.
          </p>
        </div>
      )}

      {/* Connection error */}
      {brabusConfigured && error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="font-medium">Couldn&apos;t load Brabus leads.</p>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      {/* Empty */}
      {brabusConfigured && !error && leads.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No leads yet. New website enquiries will appear here automatically.
        </div>
      )}

      {/* Table */}
      {brabusConfigured && !error && leads.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="whitespace-nowrap px-4 py-3">Received</th>
                <th className="whitespace-nowrap px-4 py-3">Name</th>
                <th className="whitespace-nowrap px-4 py-3">Phone</th>
                <th className="whitespace-nowrap px-4 py-3">Email</th>
                <th className="whitespace-nowrap px-4 py-3">Configuration</th>
                <th className="whitespace-nowrap px-4 py-3">Budget</th>
                <th className="px-4 py-3">Message</th>
                <th className="whitespace-nowrap px-4 py-3">Source</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/70 dark:bg-slate-900">
              {leads.map((l) => (
                <tr key={l.id} className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{fmtIST(l.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{l.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`tel:${l.phone}`} className="text-indigo-600 hover:underline dark:text-indigo-300">{l.phone}</a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {l.email ? (
                      <a href={`mailto:${l.email}`} className="text-indigo-600 hover:underline dark:text-indigo-300">{l.email}</a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{l.project || <span className="text-slate-400">—</span>}</td>
                  <td className="whitespace-nowrap px-4 py-3">{l.budget || <span className="text-slate-400">—</span>}</td>
                  <td className="max-w-xs truncate px-4 py-3" title={l.message ?? undefined}>
                    {l.message || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{l.source}</td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-slate-500 dark:text-slate-400" title={l.page ?? undefined}>
                    {l.page || <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
