// ============================================================
// Standard API envelope — one response shape across the whole API so the
// frontend can rely on `success`. The existing frontend treats `success === true`
// as "delivered", so that field must always be present and correct.
// ============================================================
"use strict";

/** A successful response. */
function ok(res, { status = 200, data = null, message } = {}) {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== null ? { data } : {}),
  });
}

/** A failed response. `code` is a stable machine string; `message` is human text. */
function fail(res, { status = 400, code = "error", message = "Request failed", details } = {}) {
  return res.status(status).json({
    success: false,
    error: message,
    code,
    ...(details ? { details } : {}),
  });
}

module.exports = { ok, fail };
