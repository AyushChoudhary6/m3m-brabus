// ─────────────────────────────────────────────────────────────────────────────
// HR-accessible templates LIST.
//
// The Sales list endpoint (/api/admin/templates) is gated to ADMIN/MANAGER, so a
// plain recruiter cannot call it. This endpoint exposes the SAME shared (global)
// Template rows to any authenticated HR user via hrApiAuth(), read-only.
//
// Templates are a GLOBAL pool shared with Sales, gated per-template by `visibleToHr`
// (admins untick Sales-only templates so they don't leak into recruiter pickers — #41).
// Default kind = WHATSAPP (the candidate UI is WA-first); pass ?kind=EMAIL for email.
//
// Response: { items: [{ id, name, body, kind, trigger, subject }] }
// (id/name/body are the minimum the candidate picker needs; kind/trigger/subject
//  are included for parity with the Sales list and for client-side rendering.)
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hrApiAuth } from "@/lib/hrAccess";
import { TemplateKind } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await hrApiAuth();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const kindRaw = url.searchParams.get("kind"); // optional filter

  // Validate kind if supplied; otherwise return ALL active templates.
  let kindFilter: TemplateKind | undefined;
  if (kindRaw) {
    if (!(Object.values(TemplateKind) as string[]).includes(kindRaw)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }
    kindFilter = kindRaw as TemplateKind;
  }

  // Only templates flagged HR-visible (audit #41) — Sales-only templates an admin has
  // hidden must never appear in a recruiter's picker.
  const templates = await prisma.template.findMany({
    where: { active: true, visibleToHr: true, ...(kindFilter ? { kind: kindFilter } : {}) },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    select: { id: true, name: true, body: true, kind: true, trigger: true, subject: true },
  });

  return NextResponse.json({ items: templates });
}
