import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHrPermission } from "@/lib/hrAccess";
import { audit, reqMeta } from "@/lib/audit";
import bcrypt from "bcryptjs";

const ROLES = ["ADMIN", "MANAGER", "AGENT"];

// This is the HR "Manage Users" endpoint — it must NOT expose or mutate the whole
// company directory. Scope it to HR-relevant accounts: HR-designated users
// (hrOnly/hrTeam) plus Admins (who are HR-assignable and manage the module). Plain
// Sales agents/managers are intentionally invisible here — full user administration
// lives in Admin → Users (audit #42). Mirrors isActiveHrUser() in the candidate PUT.
const HR_SCOPE = { OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" as const }] };

export async function GET() {
  const access = await requireHrPermission("manageUsers");
  if (access.error) return access.error;
  const users = await prisma.user.findMany({
    where: HR_SCOPE,
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, team: true, active: true, hrOnly: true, hrTeam: true },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const access = await requireHrPermission("manageUsers");
  if (access.error) return access.error;
  const { me } = access;
  const body = await req.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "AGENT").trim();
  // Accounts minted here are HR accounts: force HR scope so this endpoint can't be a
  // side-door to create a plain Sales user (audit #42). If neither flag is set, default
  // to hrOnly so the new user is always HR-designated.
  const hrTeam = Boolean(body.hrTeam);
  let hrOnly = Boolean(body.hrOnly);
  if (!hrOnly && !hrTeam) hrOnly = true;
  const tempPassword = String(body.tempPassword ?? "").trim();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email.includes("@")) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  if (tempPassword.length < 8) return NextResponse.json({ error: "Temporary password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role as "ADMIN" | "MANAGER" | "AGENT", hrOnly, hrTeam, team: (hrOnly || hrTeam) ? "HQ" : null, active: true },
    select: { id: true, name: true, email: true, role: true, hrOnly: true, active: true },
  });
  // Audit account creation (role + hr flag) — HR Users can mint privileged accounts (#11/#103).
  await audit({ userId: me.id, action: "hr.user.create", entity: "User", entityId: user.id, meta: { email, role, hrOnly }, request: reqMeta(req) });
  return NextResponse.json({ ok: true, user }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const access = await requireHrPermission("manageUsers");
  if (access.error) return access.error;
  const { me } = access;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: { hrOnly?: boolean; hrTeam?: boolean; active?: boolean; role?: "ADMIN" | "MANAGER" | "AGENT" } = {};
  if (typeof body.hrOnly === "boolean") data.hrOnly = body.hrOnly;
  if (typeof body.hrTeam === "boolean") data.hrTeam = body.hrTeam;
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.role && ROLES.includes(body.role)) data.role = body.role;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  if (id === me.id && data.active === false) return NextResponse.json({ error: "You can't deactivate yourself" }, { status: 400 });

  // Scope guard (audit #42): this panel only manages HR-designated users. Refuse to
  // touch a plain Sales user or a non-HR Admin so it can't be used to deactivate or
  // re-role arbitrary company accounts — those go through Admin → Users.
  const target = await prisma.user.findUnique({ where: { id }, select: { hrOnly: true, hrTeam: true, role: true, active: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!target.hrOnly && !target.hrTeam) {
    return NextResponse.json({ error: "This panel manages HR users only. Use Admin → Users for other accounts." }, { status: 403 });
  }

  const user = await prisma.user.update({ where: { id }, data, select: { id: true, hrOnly: true, hrTeam: true, active: true, role: true } });

  // Reassignment on deactivate / un-HR-flag (audit #43): if this change leaves the user
  // no longer an eligible candidate owner (deactivated, or stripped of HR access and not
  // an Admin), return their still-active candidates to the Unassigned pool so they don't
  // sit orphaned on an owner who can no longer see or work them.
  const stillEligibleOwner = user.active && (user.hrOnly || user.hrTeam || user.role === "ADMIN");
  let reassigned = 0;
  if (!stillEligibleOwner) {
    const [primary, secondary] = await Promise.all([
      prisma.hRCandidate.updateMany({ where: { primaryOwnerId: id, deletedAt: null }, data: { primaryOwnerId: null } }),
      prisma.hRCandidate.updateMany({ where: { secondaryOwnerId: id, deletedAt: null }, data: { secondaryOwnerId: null } }),
    ]);
    reassigned = primary.count + secondary.count;
  }

  // Audit role/active/HR-flag changes — sensitive privilege mutations (#11/#103) + any reassignment.
  await audit({ userId: me.id, action: "hr.user.update", entity: "User", entityId: id, meta: { changes: data, candidatesUnassigned: reassigned }, request: reqMeta(req) });
  return NextResponse.json({ ok: true, user, reassigned });
}
