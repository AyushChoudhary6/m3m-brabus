// ActionCenterKpis — the Top Action Center for the HR dashboard.
//
// Renders the 8 deduped, color-coded, clickable KPI tiles (New Candidates,
// Calls Due Today, Overdue Follow-Ups, Interviews Today, Pending Confirmations,
// No-Shows, Expected Joinings, No Next Action). This ONE strip replaces BOTH the
// old `specCards` "today at a glance" row AND the old `metrics` border-l-4 bar —
// they are merged here so there are no duplicate KPIs anywhere (spec items 1, 3,
// 13).
//
// PRESENTATIONAL ONLY. All counts + hrefs arrive via props; this component never
// fetches or queries. The icon + semantic color for each tile is derived
// internally from its `kind` so the same KPI always looks identical:
//   🔵 BLUE   = info / neutral   (New Candidates, No Next Action = slate low-signal)
//   🟠 AMBER  = pending / waiting (Calls Due Today, Pending Confirmations)
//   🔴 RED    = urgent / overdue  (Overdue Follow-Ups; No-Shows = rose)
//   🟢 GREEN  = healthy / positive (Expected Joinings)
//   🔵 INDIGO = info variant       (Interviews Today)
// Every tile is an <a href> to a filtered list / in-page anchor (spec item 3).
//
// No emoji — Lucide icons only. Dark: variants ship on every colour, matching the
// existing HR card conventions (bg-X-50 / dark:bg-X-900/20, border-X-500/60).

import {
  UserPlus,
  Phone,
  AlertTriangle,
  Target,
  CheckCircle2,
  Ban,
  Handshake,
  Inbox,
  FileSignature,
  PartyPopper,
  UserX,
  type LucideIcon,
} from "lucide-react";

export type HrKpiKind =
  | "new"
  | "callsDue"
  | "overdue"
  | "interviewsToday"
  | "pendingConfirm"
  | "noShow"
  | "expectedJoin"
  | "noNextAction"
  | "pendingOffers"
  | "joiningToday"
  | "unassigned";

export interface HrKpiTile {
  kind: HrKpiKind;
  label: string;
  count: number;
  href: string;
}

export interface ActionCenterKpisProps {
  tiles: HrKpiTile[];
}

// Fixed icon + coloured icon-chip per KPI kind. The card itself is neutral
// (white / dark-slate) and the colour lives ONLY in the small icon chip, so a
// row of tiles reads clean instead of muddy — while urgency is still legible at
// a glance (red overdue, rose no-show, amber calls-due, green joinings …).
const KPI_VISUAL: Record<HrKpiKind, { Icon: LucideIcon; chip: string }> = {
  new:             { Icon: UserPlus,      chip: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" },
  callsDue:        { Icon: Phone,         chip: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" },
  overdue:         { Icon: AlertTriangle, chip: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300" },
  interviewsToday: { Icon: Target,        chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" },
  pendingConfirm:  { Icon: CheckCircle2,  chip: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300" },
  noShow:          { Icon: Ban,           chip: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300" },
  expectedJoin:    { Icon: Handshake,     chip: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300" },
  noNextAction:    { Icon: Inbox,         chip: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300" },
  pendingOffers:   { Icon: FileSignature, chip: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" },
  joiningToday:    { Icon: PartyPopper,   chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" },
  unassigned:      { Icon: UserX,         chip: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
};

export function ActionCenterKpis({ tiles }: ActionCenterKpisProps) {
  return (
    // 4-per-row on desktop (2 tidy rows of 4) so every label shows in full —
    // no more truncated "Overdue…" / "Pending…". Wraps to 3 / 2 on smaller widths.
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5" aria-label="Action Center">
      {tiles.map((t) => {
        const { Icon, chip } = KPI_VISUAL[t.kind];
        const active = t.count > 0;
        return (
          <a
            key={t.kind}
            href={t.href}
            className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 hover:shadow-sm hover:border-gray-300 dark:hover:border-slate-600 transition"
          >
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${chip}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-xl font-bold leading-none ${active ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-slate-600"}`}>
                {t.count}
              </div>
              <div className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-1 leading-tight">
                {t.label}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default ActionCenterKpis;
