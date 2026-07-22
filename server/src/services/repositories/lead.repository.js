// ============================================================
// LeadRepository — the persistence contract the rest of the app depends on.
//
// The application never imports a concrete database client; it imports this
// factory and receives an object with a stable shape:
//     { name: string, create(lead): Promise<{ id, createdAt }> }
//
// Today the only implementation is Prisma/Neon. To move the primary store to
// White Collar CRM later:
//   1. add ./crm.lead.repository.js implementing the same create() contract,
//   2. set LEAD_STORE=crm in the environment.
// No controller, service, validator, or frontend line changes.
//
// @typedef {Object} NormalisedLead
// @property {string}  name
// @property {string}  phone
// @property {string=} email
// @property {string=} project
// @property {string=} budget
// @property {string=} message
// @property {string}  source
// @property {string}  status
// @property {string=} page
// @property {string=} ipAddress
// @property {string=} utmSource
// @property {string=} utmMedium
// @property {string=} utmCampaign
// @property {string=} referrer
// @property {string=} device
// @property {number=} spamScore
// @property {number=} fillMs
// @property {string=} externalId
// ============================================================
"use strict";

const { config } = require("../../config/env");

const registry = {
  prisma: () => require("./prisma.lead.repository"),
  // crm: () => require("./crm.lead.repository"), // ← future White Collar CRM adapter
};

let active = null;

/** Resolve the configured repository (LEAD_STORE), memoised for the process. */
function getLeadRepository() {
  if (active) return active;

  const load = registry[config.leadStore];
  if (!load) {
    throw new Error(
      `Unknown LEAD_STORE "${config.leadStore}". Available: ${Object.keys(registry).join(", ")}`,
    );
  }
  active = load();
  return active;
}

module.exports = { getLeadRepository };
