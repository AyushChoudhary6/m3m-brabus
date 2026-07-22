// ============================================================
// Prisma implementation of the LeadRepository contract.
//
// This is the ONLY file that knows about Prisma / the `leads` table. Everything
// above it (service, controller, frontend) talks to the repository interface,
// so replacing this with a White-Collar-CRM adapter is a one-file, one-config
// change — see server/README.md "Future CRM support".
// ============================================================
"use strict";

const { getPrisma } = require("../prismaClient");

/**
 * Persist a normalised lead.
 * @param {import("./lead.repository").NormalisedLead} lead
 * @returns {Promise<{id:string, createdAt:Date}>}
 */
async function create(lead) {
  const prisma = getPrisma();

  // externalId is unique; an upsert makes a retried submission idempotent
  // (one row, not several) without the caller needing to know it existed.
  if (lead.externalId) {
    const row = await prisma.lead.upsert({
      where: { externalId: lead.externalId },
      update: {}, // first write wins — never overwrite an existing lead's data
      create: toCreateInput(lead),
      select: { id: true, createdAt: true },
    });
    return row;
  }

  const row = await prisma.lead.create({
    data: toCreateInput(lead),
    select: { id: true, createdAt: true },
  });
  return row;
}

/** Map the transport-neutral lead onto the Prisma create input. */
function toCreateInput(lead) {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    project: lead.project || null,
    budget: lead.budget || null,
    message: lead.message || null,
    source: lead.source || "Website",
    status: lead.status || "Fresh Lead",
    page: lead.page || null,
    ipAddress: lead.ipAddress || null,
    utmSource: lead.utmSource || null,
    utmMedium: lead.utmMedium || null,
    utmCampaign: lead.utmCampaign || null,
    referrer: lead.referrer || null,
    device: lead.device || null,
    spamScore: Number.isFinite(lead.spamScore) ? lead.spamScore : null,
    fillMs: Number.isFinite(lead.fillMs) ? lead.fillMs : null,
    externalId: lead.externalId || null,
  };
}

module.exports = { name: "prisma", create };
