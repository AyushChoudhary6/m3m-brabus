// ============================================================
// Lead controller — thin HTTP adapter over lead.service.
// No business logic here: it hands the request to the service and shapes the
// service result into the standard API envelope.
// ============================================================
"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { ok, fail } = require("../utils/response");
const { processLead } = require("../services/lead.service");

/**
 * POST /api/leads
 * Body has already passed validation middleware.
 */
const createLead = asyncHandler(async (req, res) => {
  const result = await processLead(req.body, {
    ip: req.clientIp,
    reqId: req.id,
    startTime: req.startTime,
  });

  if (!result.ok) {
    // Both the database and Google Sheets failed. 502 (not 400) because the
    // request was fine — a downstream dependency is down — so the client's
    // retry/queue logic knows to try again later.
    return fail(res, {
      status: 502,
      code: "downstream_unavailable",
      message: "We couldn't record your details just now. Please try again shortly.",
    });
  }

  // 201 Created. `id` is the Neon lead id (null if only the sheet accepted it).
  return ok(res, {
    status: 201,
    message: "Lead received.",
    data: {
      id: result.id,
      saved: result.db.ok,     // persisted to the primary store (Neon)
      backedUp: result.sheet.ok, // written to Google Sheets
    },
  });
});

module.exports = { createLead };
