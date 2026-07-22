import { requireHrPagePermission, hrScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { Trash2 } from "lucide-react";
import HRRecycleBinClient from "@/components/HRRecycleBinClient";

export const dynamic = "force-dynamic";

// Recycle bin (audit #13) — lists soft-deleted candidates with a Restore action.
// Gated on the deleteCandidate permission (whoever can bin can un-bin).
export default async function RecycleBinPage() {
  const { me } = await requireHrPagePermission("deleteCandidate");

  const rows = await prisma.hRCandidate.findMany({
    where: { AND: [hrScopeWhere(me), { deletedAt: { not: null } }] },
    orderBy: { deletedAt: "desc" },
    take: 200,
    select: { id: true, name: true, phone: true, status: true, deletedAt: true, primaryOwner: { select: { name: true } } },
  });

  const candidates = rows.map((c) => ({ ...c, deletedAt: c.deletedAt!.toISOString() }));

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-300"><Trash2 className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Recycle Bin</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{candidates.length} soft-deleted candidate{candidates.length === 1 ? "" : "s"} · restore returns them with all history</p>
        </div>
      </div>
      <HRRecycleBinClient candidates={candidates} />
    </div>
  );
}
