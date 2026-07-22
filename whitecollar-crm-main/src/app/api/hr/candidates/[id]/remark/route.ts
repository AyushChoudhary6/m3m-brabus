import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadOwnedCandidate } from "@/lib/hrAccess";

// Add a single remark to a candidate's conversation thread (HRRemark). Multiple
// HR people can each log remarks against the same candidate; the Remarks card
// renders them newest-first. Manual remarks are stamped with the logging user
// (authorId + denormalized authorName) and remarkAt = now.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await loadOwnedCandidate(id);
  if (access.error) return access.error;
  const { me } = access;

  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Remark text is required." }, { status: 400 });

  const remark = await prisma.hRRemark.create({
    data: {
      candidateId: id,
      authorId: me.id,
      authorName: me.name,
      text,
      source: "MANUAL",
    },
    select: { id: true, text: true, authorName: true, remarkAt: true, source: true },
  });

  return NextResponse.json({ remark });
}
