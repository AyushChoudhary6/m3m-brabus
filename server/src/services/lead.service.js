// ============================================================
// Lead service — the orchestration layer.
//
// Responsibilities:
//   1. Normalise + sanitize the validated request into a transport-neutral lead.
//   2. Persist to the primary store (Neon via the repository) AND forward to
//      Google Sheets, IN PARALLEL and INDEPENDENTLY — neither failure affects
//      the other (Promise.allSettled, not Promise.all).
//   3. Log both outcomes with the lead id, IP and processing time.
//   4. Report a combined result the controller turns into an HTTP response.
//
// The controller and routes know nothing about Prisma or axios — only this
// service and the interfaces below it do.
// ============================================================
"use strict";

const { getLeadRepository } = require("./repositories/lead.repository");
const sheets = require("./googleSheets.service");
const { logger } = require("../config/logger");
const { cleanText, cleanPhone, cleanEmail } = require("../utils/sanitize");

/** Coerce a value to a bounded integer, or undefined. */
function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Build a NormalisedLead from the raw (already-validated) request body plus
 * request context. Accepts both the site's field names (`config`) and the CRM
 * names (`project`) so any caller works.
 */
function normalise(body = {}, ctx = {}) {
  return {
    name: cleanText(body.name, 120),
    phone: cleanPhone(body.phone),
    email: cleanEmail(body.email) || undefined,
    project: cleanText(body.project || body.config, 160) || undefined,
    budget: cleanText(body.budget, 80) || undefined,
    message: cleanText(body.message, 600) || undefined,

    source: cleanText(body.source, 60) || "Website",
    status: "Fresh Lead",

    page: cleanText(body.page, 255) || undefined,
    ipAddress: ctx.ip,

    // Attribution — present only if the client sent it (frontend does).
    utmSource: cleanText(body.utmSource || body.utm_source, 120) || undefined,
    utmMedium: cleanText(body.utmMedium || body.utm_medium, 120) || undefined,
    utmCampaign: cleanText(body.utmCampaign || body.utm_campaign, 160) || undefined,
    referrer: cleanText(body.referrer, 512) || undefined,
    device: cleanText(body.device, 40) || undefined,

    spamScore: toInt(body.spamScore),
    fillMs: toInt(body.fillMs),

    // Idempotency key shared with the client's retry logic and the sheet.
    externalId: cleanText(body.leadId || body.externalId, 64) || undefined,
  };
}

/**
 * Process one lead end to end.
 * @param {object} rawBody  the validated request body
 * @param {{ip?:string, reqId?:string, startTime?:bigint}} ctx
 * @returns {Promise<{ok:boolean, id:string|null, db:object, sheet:object, ms:number}>}
 */
async function processLead(rawBody, ctx = {}) {
  const lead = normalise(rawBody, ctx);
  const repo = getLeadRepository();

  // Fire both writes at once; allSettled means one rejection can't cancel the
  // other. The DB is primary, the sheet is the backup — but both are attempted.
  const [dbOutcome, sheetOutcome] = await Promise.allSettled([
    repo.create(lead),
    sheets.forwardLead(lead, rawBody),
  ]);

  const db =
    dbOutcome.status === "fulfilled"
      ? { ok: true, id: dbOutcome.value.id, store: repo.name }
      : { ok: false, error: dbOutcome.reason?.message, code: dbOutcome.reason?.code };

  const sheet =
    sheetOutcome.status === "fulfilled"
      ? { ok: true, status: sheetOutcome.value.status }
      : { ok: false, error: sheetOutcome.reason?.message, code: sheetOutcome.reason?.code };

  const ms = ctx.startTime ? Number(process.hrtime.bigint() - ctx.startTime) / 1e6 : undefined;
  const id = db.ok ? db.id : null;

  // The spec's logging contract: id, IP, both results, processing time, errors.
  const logMeta = {
    reqId: ctx.reqId,
    leadId: id,
    externalId: lead.externalId,
    ip: ctx.ip,
    db,
    sheet,
    processingMs: ms != null ? Number(ms.toFixed(1)) : undefined,
  };
  if (db.ok || sheet.ok) logger.info("Lead processed", logMeta);
  else logger.error("Lead processing failed on all targets", logMeta);

  // Success as long as the lead was captured SOMEWHERE. Only a total failure
  // (both DB and sheet down) returns ok:false, so the client retries/queues.
  return { ok: db.ok || sheet.ok, id, db, sheet, ms };
}

module.exports = { processLead, normalise };
