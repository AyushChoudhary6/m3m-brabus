// ============================================================
// Centralized error handling.
//   notFound     — anything that fell through the router → 404
//   errorHandler — the single Express error sink. Logs the full error, but
//                  returns a safe, generic message in production so internals
//                  (stack traces, driver messages) never leak to a client.
// ============================================================
"use strict";

const { config } = require("../config/env");
const { logger } = require("../config/logger");
const { fail } = require("../utils/response");

function notFound(req, res) {
  return fail(res, { status: 404, code: "not_found", message: `Cannot ${req.method} ${req.path}` });
}

// eslint-disable-next-line no-unused-vars — Express needs the 4-arg signature.
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  logger.error("Unhandled request error", {
    reqId: req.id,
    method: req.method,
    path: req.path,
    status,
    error: err.message,
    stack: config.isProd ? undefined : err.stack,
  });

  return fail(res, {
    status,
    code: err.code || "internal_error",
    message: status >= 500 && config.isProd ? "Something went wrong. Please try again." : err.message,
  });
}

module.exports = { notFound, errorHandler };
