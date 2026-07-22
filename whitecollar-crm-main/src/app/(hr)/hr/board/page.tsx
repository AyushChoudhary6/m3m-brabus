import { requireHrPage, hrActiveScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { statusLabel } from "@/lib/hrStatus";
import type { HRCandidateStatus } from "@prisma/client";
import { Columns3 } from "lucide-react";
import { HrKanbanBoard, type BoardColumn, type BoardCard } from "@/components/hr-dashboard/HrKanbanBoard";

export const dynamic = "force-dynamic";

// Pipeline columns in funnel order. Dragging a card sets exactly this status.
const COLUMN_KEYS: HRCandidateStatus[] = [
  "NEW", "NOT_CALLED", "INTERESTED", "PIPELINE",
  "VIRTUAL_INTERVIEW_SCHEDULED", "F2F_INTERVIEW_SCHEDULED", "INTERVIEW_HELD",
  "SHORTLISTED", "OFFER_RELEASED", "EXPECTED_JOINING", "JOINED",
];
const CARDS_PER_COL = 30;

function firstName(n: string | null | undefined) {
  const t = (n ?? "").trim();
  return t ? t.split(/\s+/)[0] : null;
}

export default async function HrBoardPage() {
  const { me, perms } = await requireHrPage();
  const scope = hrActiveScopeWhere(me);
  const showOwner = perms.viewAllCandidates;

  const where = { AND: [scope, { status: { in: COLUMN_KEYS } }] };

  // Fetch each column's OWN newest cards (not a single 600-row global pool that a
  // busy status could crowd out, leaving other columns under-filled) — audit #148.
  const [counts, ...perColumn] = await Promise.all([
    prisma.hRCandidate.groupBy({ by: ["status"], where, _count: true })
      .catch(() => [] as { status: string; _count: number }[]),
    ...COLUMN_KEYS.map((key) =>
      prisma.hRCandidate.findMany({
        where: { AND: [scope, { status: key }] },
        orderBy: { updatedAt: "desc" },
        take: CARDS_PER_COL,
        select: {
          id: true, name: true, currentProfile: true, phone: true, whatsappPhone: true,
          updatedAt: true, primaryOwner: { select: { name: true } },
        },
      }).catch(() => []),
    ),
  ]);

  const countByStatus: Record<string, number> = {};
  for (const c of counts) countByStatus[c.status] = c._count;

  const columns: BoardColumn[] = COLUMN_KEYS.map((key, i) => {
    const colCards: BoardCard[] = perColumn[i].map((c) => ({
      id: c.id,
      name: c.name,
      position: c.currentProfile,
      phone: c.phone,
      whatsappPhone: c.whatsappPhone,
      ownerFirstName: firstName(c.primaryOwner?.name),
      updatedIso: new Date(c.updatedAt).toISOString(),
    }));
    return { key, label: statusLabel(key), count: countByStatus[key] ?? 0, cards: colCards };
  });

  const total = columns.reduce((n, c) => n + c.count, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
          <Columns3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pipeline Board</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {total} candidate{total === 1 ? "" : "s"} in pipeline · drag a card to change stage
          </p>
        </div>
      </div>
      <HrKanbanBoard columns={columns} showOwner={showOwner} />
    </div>
  );
}
