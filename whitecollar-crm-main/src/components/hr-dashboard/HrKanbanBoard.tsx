"use client";
// ─────────────────────────────────────────────────────────────────────────────
// HrKanbanBoard — drag-a-candidate-between-stages pipeline board (spec item 7).
//
// One column per pipeline stage; drag a card into another column to change the
// candidate's status (PATCH /api/hr/candidates/[id]). Optimistic move with
// revert-on-error (e.g. Junior HR dragging into "Offer Released" → server 403).
// A glance answers "where's everyone?"; a drag moves them.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import Link from "next/link";
import { statusColor } from "@/lib/hrStatus";
import { GripVertical, Phone, MessageCircle } from "lucide-react";
import { waNumber } from "@/lib/waOpen";

export interface BoardCard {
  id: string;
  name: string;
  position: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  ownerFirstName: string | null;
  updatedIso: string;
}
export interface BoardColumn {
  key: string;      // HRCandidateStatus
  label: string;
  count: number;    // full count (may exceed loaded cards)
  cards: BoardCard[];
}

export function HrKanbanBoard({ columns: initial, showOwner }: { columns: BoardColumn[]; showOwner: boolean }) {
  const [columns, setColumns] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast((t) => (t === m ? null : t)), 3000);
  }

  async function moveCard(cardId: string, fromKey: string, toKey: string) {
    if (fromKey === toKey) return;
    const snapshot = columns;
    // Optimistic move.
    let moved: BoardCard | undefined;
    const next = columns.map((c) => {
      if (c.key === fromKey) {
        moved = c.cards.find((x) => x.id === cardId);
        return { ...c, cards: c.cards.filter((x) => x.id !== cardId), count: Math.max(0, c.count - 1) };
      }
      return c;
    }).map((c) => {
      if (c.key === toKey && moved) return { ...c, cards: [moved, ...c.cards], count: c.count + 1 };
      return c;
    });
    setColumns(next);

    try {
      const r = await fetch(`/api/hr/candidates/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toKey }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Move failed (${r.status})`);
      }
      const toLabel = next.find((c) => c.key === toKey)?.label ?? toKey;
      flash(`${moved?.name ?? "Candidate"} → ${toLabel}`);
    } catch (e) {
      setColumns(snapshot); // revert
      flash(String(e).slice(0, 90));
    }
  }

  return (
    <div className="relative">
      {/* Horizontally-scrollable track with fixed-width columns, so 11 stages stay
          readable on laptop/phone instead of cramming to nothing (audit #19/#131). */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {columns.map((col) => {
          const isOver = overCol === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
              onDragLeave={() => setOverCol((k) => (k === col.key ? null : k))}
              onDrop={(e) => { e.preventDefault(); setOverCol(null); if (dragId) moveCard(dragId, findCol(columns, dragId), col.key); }}
              className={`w-[240px] shrink-0 rounded-2xl border bg-gray-50/60 dark:bg-slate-900/50 flex flex-col h-[calc(100vh-8.5rem)] ${
                isOver ? "border-emerald-400 ring-2 ring-emerald-300/50" : "border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-1 px-1.5 py-1.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate min-w-0 ${statusColor(col.key)}`} title={col.label}>{col.label}</span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 shrink-0">{col.count}</span>
              </div>
              <div className="flex-1 min-h-0 p-1 space-y-1 overflow-y-auto">
                {col.cards.length === 0 && (
                  <div className="h-full grid place-items-center text-[10px] text-gray-400 dark:text-slate-500">Drop here</div>
                )}
                {col.cards.map((card) => {
                  const wa = waNumber(card.whatsappPhone) || waNumber(card.phone);
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`group rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-1 shadow-sm cursor-grab active:cursor-grabbing ${
                        dragId === card.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-gray-300 dark:text-slate-600 shrink-0" />
                        <Link href={`/hr/candidates/${card.id}`} className="text-[11px] font-semibold text-gray-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 truncate flex-1 min-w-0">
                          {card.name}
                        </Link>
                        {card.phone && (
                          <a href={`tel:${card.phone}`} onClick={(e) => e.stopPropagation()} title="Call" aria-label={`Call ${card.name}`} className="p-1.5 -m-1 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {wa && (
                          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="WhatsApp" aria-label={`WhatsApp ${card.name}`} className="p-1.5 -m-1 rounded text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 shrink-0">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {/* Touch/keyboard fallback for stage change — HTML5 drag doesn't
                          work on touch devices (audit #20/#24). Change stage here. */}
                      <select
                        value={col.key}
                        onChange={(e) => { const to = e.target.value; if (to !== col.key) moveCard(card.id, col.key, to); }}
                        onClick={(e) => e.stopPropagation()}
                        title="Move to stage"
                        aria-label={`Move ${card.name} to another stage`}
                        className="mt-1 w-full text-[9px] rounded border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 px-1 py-0.5"
                      >
                        {columns.map((cc) => <option key={cc.key} value={cc.key}>{cc.label}</option>)}
                      </select>
                    </div>
                  );
                })}
                {col.count > col.cards.length && (
                  <Link href={`/hr/candidates?status=${col.key}`} className="block text-center text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline py-0.5">
                    +{col.count - col.cards.length} more →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      )}
    </div>
  );
}

function findCol(columns: BoardColumn[], cardId: string): string {
  return columns.find((c) => c.cards.some((x) => x.id === cardId))?.key ?? "";
}

export default HrKanbanBoard;
