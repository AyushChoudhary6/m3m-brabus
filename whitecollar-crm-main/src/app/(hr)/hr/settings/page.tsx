import { requireHrPagePermission, hrCan } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import HRUserManager from "@/components/HRUserManager";
import { getHrUsers } from "@/lib/hrUsers";
import { getSetting } from "@/lib/settings";
import { setHrWebsiteOwner } from "./actions";
import { icsTokenFor } from "@/lib/ics";
import { Settings, Globe, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HRSettingsPage() {
  const { me } = await requireHrPagePermission("settings");
  const canManageUsers = hrCan(me, "manageUsers");

  // Only HR-designated users are managed here (audit #42) — plain Sales accounts and
  // non-HR admins belong in Admin → Users, not the HR panel.
  const users = canManageUsers
    ? await prisma.user.findMany({
        where: { OR: [{ hrOnly: true }, { hrTeam: true }] },
        orderBy: [{ active: "desc" }, { name: "asc" }],
        select: { id: true, name: true, email: true, role: true, team: true, active: true, hrOnly: true, hrTeam: true },
      })
    : [];

  // Website intake config: default owner + the active HR intake key.
  const [hrUsers, currentOwnerId, roundRobin, hrKey] = await Promise.all([
    getHrUsers(),
    getSetting("hr.websiteDefaultOwnerId"),
    getSetting("hr.intakeRoundRobin"),
    prisma.intakeKey.findFirst({ where: { hrScope: true, active: true }, select: { key: true } }),
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-300">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{canManageUsers ? "Manage users & HR access" : "HR settings"}</p>
        </div>
      </div>

      {canManageUsers && <HRUserManager initialUsers={users as never} meId={me.id} />}

      {/* Calendar subscription (audit #59) — subscribe to your HR interviews + follow-ups. */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Calendar Subscription</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Subscribe from Google/Apple/Outlook to see your HR interviews + open follow-ups. Treat this URL as a secret.</p>
          </div>
        </div>
        <input readOnly value={`${process.env.NEXTAUTH_URL ?? "https://crm.whitecollarrealty.com"}/api/hr/calendar.ics?token=${icsTokenFor(me.id)}`}
          className="w-full text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-200 select-all" />
        <p className="text-[11px] text-gray-400 dark:text-slate-500">In Google Calendar: <b>Other calendars → From URL</b> · Apple Calendar: <b>File → New Calendar Subscription</b>.</p>
      </div>

      {/* Website → HR real-time intake */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Website Intake</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Candidates from the website HR forms arrive here automatically (real-time).</p>
          </div>
        </div>

        <form action={setHrWebsiteOwner} className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Default owner for website candidates</span>
            <select name="ownerId" defaultValue={currentOwnerId || ""} className="border rounded-lg px-3 py-2 text-sm min-w-56 dark:bg-slate-800 dark:border-slate-600">
              <option value="">— Unassigned —</option>
              {hrUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm inline-flex items-center gap-2 pb-2">
            <input type="checkbox" name="roundRobin" defaultChecked={roundRobin === "1"} className="rounded" />
            <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Round-robin across HR recruiters<br /><span className="text-[10px] text-gray-400">overrides the default owner — distributes intake evenly</span></span>
          </label>
          <button type="submit" className="btn btn-primary text-sm">Save</button>
        </form>

        {/* Why the picker is empty: only HR-flagged users are assignable in the HR
            module. Point the admin straight at the fix instead of a silent dead-end. */}
        {hrUsers.length === 0 && (
          <div className="text-xs rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            No assignable HR team members yet. {canManageUsers
              ? <>Tick <span className="font-semibold">“HR Team”</span> (or <span className="font-semibold">“HR-only”</span>) for someone in the <span className="font-semibold">Users</span> table above — they’ll then appear here and in every HR owner/interviewer picker.</>
              : <>Ask an admin to mark you (or a teammate) as <span className="font-semibold">HR Team</span> in Settings.</>}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1 border-t border-gray-100 pt-3 dark:border-slate-700">
          <div><span className="font-medium text-gray-700 dark:text-slate-300">Endpoint:</span> <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300">POST https://crm.whitecollarrealty.com/api/intake/hr</code></div>
          <div><span className="font-medium text-gray-700 dark:text-slate-300">Auth header:</span> <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300">X-WCR-Key: {hrKey ? hrKey.key : "— not provisioned —"}</code></div>
          <div className="text-gray-400 dark:text-slate-500">Give this endpoint + key to the website team. Every submission is recorded (success or failure) in the intake logs.</div>
        </div>
      </div>

      <div className="card p-4 text-xs text-gray-400">
        Statuses and interview types are currently defined in code. If you want them editable here too, just say so.
      </div>
    </div>
  );
}
